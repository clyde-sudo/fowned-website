/**
 * Front-end instrumentation contract (sections 10 and 11).
 *
 * This file DEFINES the event surface and buffers events in the page. It does
 * not ship them anywhere, because the destination is the Citability agency
 * endpoint and that is not deployed yet. Defining the contract now means the
 * events are already correct on the day a sink exists; inventing a second
 * telemetry engine here to have somewhere to send them would be the mistake.
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

  function track(name, detail) {
    var ev = {
      event: name,
      at: new Date().toISOString(),
      path: location.pathname,
      detail: detail || null,
      attribution: attribution(),
    };
    BUFFER.push(ev);
    // No network call. There is no deployed sink, and a demo must not invent one.
    if (window.FOWNED_DEBUG) console.log("[fowned]", ev);
  }

  /* Declarative CTA tracking: any element carrying data-ev fires on click. */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-ev]") : null;
    if (!el) return;
    track(el.getAttribute("data-ev"), { label: el.getAttribute("data-ev-label") || el.textContent.trim() });
  });

  window.FownedInstrument = {
    track: track,
    attribution: attribution,
    classify: classify,
    events: function () { return BUFFER.slice(); },
  };

  track("page_view");
})();
