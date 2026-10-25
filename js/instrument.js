/**
 * Front-end instrumentation contract (sections 10 and 11).
 *
 * This file DEFINES the event surface and ships it to the site's own edge
 * endpoint (functions/api/event.js), which structured-logs and stores nothing.
 * That is deliberately the whole of it: Fowned needs to observe its own
 * acquisition funnel from day one, and it does NOT need a second telemetry
 * engine, a database, or a scheduler to do that. The Citability agency backend
 * remains the system of record for customer telemetry and is untouched here.
 *
 * No cookies, no fingerprinting, no identifiers. An event carries the path, the
 * referrer classification and the campaign tags, and nothing that names a
 * person. Person-level identification, if it is ever added, comes from a vendor
 * that returns an identity, and is kept separate from this first-party stream.
 *
 * Two rules the shape enforces:
 *   1. Source classification is a CLOSED vocabulary. A referrer is observed or
 *      it is absent. "Direct" is never inferred from an absent referrer,
 *      because AI surfaces routinely strip Referer and the two must stay
 *      distinguishable.
 *   2. Nothing here fabricates a search query. Aggregate query data from a
 *      search console describes a population, not this visitor, and joining the
 *      two would manufacture a fact.
 */
(function () {
  "use strict";

  var STORE_KEY = "fowned_attribution";
  var BUFFER = [];

  var AI_HOSTS = [
    "chat.openai.com", "chatgpt.com", "perplexity.ai", "www.perplexity.ai",
    "gemini.google.com", "bard.google.com", "claude.ai", "copilot.microsoft.com",
  ];
  var GOOGLE = /(^|\.)google\./i;
  var BING = /(^|\.)bing\.com$/i;

  /* Closed vocabulary. Adding a class requires something newly observable. */
  function classify(referrer) {
    if (!referrer) return { source: "DIRECT_OR_UNKNOWN", evidence: "UNKNOWN" };
    var host;
    try {
      host = new URL(referrer).hostname.toLowerCase();
    } catch (e) {
      return { source: "DIRECT_OR_UNKNOWN", evidence: "UNKNOWN" };
    }
    if (host === location.hostname) return null; // internal navigation, not a source
    if (AI_HOSTS.indexOf(host) !== -1) return { source: "OBSERVED_AI_REFERRER", evidence: "OBSERVED" };
    if (GOOGLE.test(host)) return { source: "GOOGLE_ORGANIC", evidence: "OBSERVED" };
    if (BING.test(host)) return { source: "BING_ORGANIC", evidence: "OBSERVED" };
    return { source: "OTHER_REFERRER", evidence: "OBSERVED" };
  }

  /* First-touch, held for the session. A later page view must not overwrite
   * where the visitor originally arrived from. */
  function attribution() {
    try {
      var saved = sessionStorage.getItem(STORE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      /* private mode: fall through, use this pageview and do not persist */
    }
    var q = new URLSearchParams(location.search);
    var cls = classify(document.referrer) || { source: "DIRECT_OR_UNKNOWN", evidence: "UNKNOWN" };
    var a = {
      landingPath: location.pathname + location.search,
      referrer: document.referrer || null,
      source: cls.source,
      evidence: cls.evidence,
      utmSource: q.get("utm_source"),
      utmMedium: q.get("utm_medium"),
      utmCampaign: q.get("utm_campaign"),
      utmContent: q.get("utm_content"),
    };
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(a));
    } catch (e) {
      /* not fatal: the funnel works, attribution is just not carried forward */
    }
    return a;
  }

  /* sendBeacon survives the page unload that a booking_click causes: a normal
   * fetch on an outbound-link click is routinely cancelled by the navigation,
   * which would lose exactly the event the funnel most depends on. Failures are
   * swallowed on purpose. Losing an analytics event must never break the CTA
   * the visitor just clicked. */
  function ship(ev) {
    try {
      var body = JSON.stringify(ev);
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/event", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/event", { method: "POST", body: body, keepalive: true,
          headers: { "Content-Type": "application/json" } }).catch(function () {});
      }
    } catch (e) { /* never let instrumentation break the page */ }
  }

  function track(name, detail) {
    var ev = {
      event: name,
      at: new Date().toISOString(),
      path: location.pathname,
      detail: detail || null,
      attribution: attribution(),
    };
    BUFFER.push(ev);
    if (window.FOWNED_DEBUG) console.log("[fowned]", ev);
    ship(ev);
    toGa4(name, detail);
  }

  /* Events forwarded to GA4, under the same names the first-party stream uses.
   * booking_click, audit_request and contact_submit are the key events (the
   * last two fire only on a lead the server accepted). They used to be renamed
   * to the chudi.dev portfolio contract (offer_click, tool_use,
   * newsletter_success), which left GA4 reporting a blog's conversions and none
   * of the agency's. page_view is not forwarded because gtag's config already
   * sends it. */
  var GA4_NAMES = {
    cta_click: "cta_click",
    booking_click: "booking_click",
    outbound_click: "outbound_click",
    audit_request: "audit_request",
    contact_submit: "contact_submit",
  };

  function toGa4(name, detail) {
    var gaName = GA4_NAMES[name];
    if (!gaName || typeof window.gtag !== "function") return;
    var d = detail || {};
    var params = {
      cta_label: d.label,
      destination: d.destination,
      location: location.pathname,
      form: d.form,
    };
    for (var k in params) if (params[k] === undefined || params[k] === null) delete params[k];
    try { window.gtag("event", gaName, params); } catch (e) { /* never break the page */ }
  }

  /* Declarative CTA tracking: any element carrying data-ev fires on click. A
   * link to another host with no data-ev is an outbound_click. */
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var el = e.target.closest("[data-ev]");
    if (el) {
      track(el.getAttribute("data-ev"), {
        label: el.getAttribute("data-ev-label") || el.textContent.trim(),
        destination: el.getAttribute("href") || undefined,
      });
      return;
    }
    var a = e.target.closest("a[href]");
    if (a && /^https?:$/.test(a.protocol) && a.hostname !== location.hostname) {
      track("outbound_click", { label: a.textContent.trim().slice(0, 100), destination: a.href });
    }
  });

  window.FownedInstrument = {
    track: track,
    attribution: attribution,
    classify: classify,
    events: function () { return BUFFER.slice(); },
  };

  track("page_view");
})();
