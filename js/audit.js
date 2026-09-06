/**
 * Fowned free-audit funnel. TWO MODES, and the mode is a build-time decision.
 *
 * Fowned is a TENANT of Citability, never a fork, so there is no scan engine in
 * this file and there must never be one. The tenant-scoped endpoint
 * (/api/agency/fowned/scan) is NOT deployed yet: as of 2026-09-06 a live POST
 * returns 404, because app/api/agency/** sits on an unmerged branch in
 * citability-dev while /api/scan (the house route) answers normally. Go-live
 * needs four things on the Citability side: that branch merged and deployed,
 * the fowned organization row created, fowned.live added to
 * AGENCY_ALLOWED_ORIGINS, and then AUDIT_SCAN_URL set at build time here.
 *
 * So the switch is FOWNED.scanUrl, set from AUDIT_SCAN_URL at build time:
 *
 *   unset  -> DEMO FIXTURE MODE. A deterministic result derived from the domain
 *             name, badged DEMO AUDIT RESULT on every render.
 *   set    -> LIVE MODE. One POST to the tenant endpoint, real verdicts, no
 *             demo badge, and a failure says it failed instead of quietly
 *             falling back to the fixture (a fixture shown as a live result is
 *             the one outcome neither mode may produce).
 *
 * It is a build-time switch rather than a runtime probe on purpose: the audit
 * page must never ship a live path that 404s while somebody watches it spin.
 *
 * Two rules survive both modes unchanged, because they are the honesty rules:
 *   1. A check that produced no verdict renders as "not measured". Never a zero,
 *      never a fail. An unmeasured check leaves the denominator.
 *   2. A fixture result always carries a DEMO AUDIT RESULT badge. A fixture that
 *      is not labelled is a lie with a delay on it.
 */
(function () {
  "use strict";

  var form = document.getElementById("auditForm");
  var input = document.getElementById("auditUrl");
  var submit = document.getElementById("auditSubmit");
  var panel = document.getElementById("auditPanel");
  if (!form || !panel) return;

  var PHONE_HREF = "tel:+18313320184";

  /* The booking destination comes from the single build-time config point.
   * Empty until Jack supplies the Cal.com link, in which case every booking CTA
   * falls back to /contact/ rather than rendering a dead or invented link. */
  function bookHref() {
    return (window.FOWNED && window.FOWNED.bookingUrl) || "/contact/";
  }
  function bookAttrs() {
    return (window.FOWNED && window.FOWNED.bookingUrl)
      ? ' target="_blank" rel="noopener noreferrer"' : "";
  }
  var PHONE_TEXT = "+1 (831) 332 0184";

  function track(name, detail) {
    if (window.FownedInstrument) window.FownedInstrument.track(name, detail);
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render(html, state) {
    panel.hidden = false;
    panel.setAttribute("data-state", state);
    panel.innerHTML = html;
  }

  function busy(on, label) {
    submit.disabled = on;
    submit.textContent = on ? label : "Run my free audit";
  }

  function notice(title, body, state) {
    render(
      '<div class="audit-notice">' +
        '<h3 class="audit-notice-title">' + esc(title) + "</h3>" +
        '<p class="audit-notice-body">' + esc(body) + "</p>" +
      "</div>",
      state
    );
  }

  /* ---- the checks --------------------------------------------------------
   * These are the real check names the Citability audit runs. What is invented
   * is only which ones PASS for a given domain.
   */
  var CHECKS = [
    "Page states who you are and what you sell in plain text",
    "Business name, address and phone are machine-readable",
    "Organization schema present and valid",
    "Service or Product schema describes what you sell",
    "Headings describe the content beneath them",
    "Answers appear as text, not only inside images",
    "Canonical URL declared",
    "robots.txt permits AI retrieval crawlers",
    "Sitemap reachable and current",
    "Page reachable without running JavaScript",
    "Titles and descriptions unique per page",
    "Contact route reachable in one step",
  ];

  /* Deterministic: the same domain always produces the same audit. A demo that
   * reshuffles on refresh reads as a random number generator with a logo. */
  function seed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  function fixture(hostname) {
    var s = seed(hostname);
    var results = CHECKS.map(function (name, i) {
      var bit = (s >>> (i % 24)) & 3;
      // bit === 3 means the check could not be measured on this site.
      if (bit === 3) return { name: name, verdict: null };
      return { name: name, verdict: bit !== 0 };
    });

    var measured = results.filter(function (c) { return c.verdict !== null; });
    var passed = measured.filter(function (c) { return c.verdict; });
    var score = passed.length;
    var total = measured.length;
    var ratio = total ? score / total : 0;

    return {
      state: total < CHECKS.length ? "PARTIAL" : "SUCCESS",
      hostname: hostname,
      score: score,
      total: total,
      expectedTotal: CHECKS.length,
      health: ratio < 0.4 ? "CRITICAL" : ratio < 0.75 ? "NEEDS_WORK" : "HEALTHY",
      checks: results,
    };
  }

  var HEALTH_COPY = {
    CRITICAL: { label: "Critical", line: "AI tools are missing most of what they need to describe this business accurately." },
    NEEDS_WORK: { label: "Needs work", line: "Some of what AI tools look for is there. Enough is missing to cost mentions." },
    HEALTHY: { label: "Healthy", line: "The basics AI tools look for are in place on this page." },
  };

  function renderResult(r) {
    var h = HEALTH_COPY[r.health];
    var unmeasured = r.total < r.expectedTotal;

    var shown = r.checks.filter(function (c) { return c.verdict === false; }).slice(0, 3);
    if (!shown.length) shown = r.checks.filter(function (c) { return c.verdict === true; }).slice(0, 1);

    var findings = shown
      .map(function (c) {
        return (
          '<li class="audit-finding ' + (c.verdict ? "is-pass" : "is-fail") + '">' +
          '<span class="audit-finding-mark" aria-hidden="true">' + (c.verdict ? "&#10003;" : "&#10007;") + "</span>" +
          '<span class="sr-only">' + (c.verdict ? "Passing" : "Failing") + ": </span>" +
          "<span>" + esc(c.name) + "</span></li>"
        );
      })
      .join("");

    var findingsHead = shown[0] && shown[0].verdict
      ? "Nothing failed in the free checks. Here is one we looked at:"
      : "What we found (showing up to three):";

    var partialNote = unmeasured
      ? '<p class="audit-partial">' +
        esc(
          r.total + " of " + r.expectedTotal + " checks returned a verdict. The rest could not " +
          "be measured on this site, so they are left out of the score rather than counted as failures."
        ) + "</p>"
      : "";

    render(
      '<div class="audit-result">' +
        (r.live
          ? ""
          : '<p class="demo-chip demo-chip-lg">DEMO AUDIT RESULT</p>' +
            '<p class="audit-demo-note">This is a deterministic sample, not a live crawl of ' + esc(r.hostname) +
              ". The check list is the real one. The verdicts are generated from the domain name so the demo repeats. " +
              "The live version crawls the site and returns measured verdicts.</p>") +
        '<div class="audit-result-head">' +
          '<span class="audit-health audit-health-' + esc(r.health) + '">' + esc(h.label) + "</span>" +
          '<span class="audit-score">' + esc(r.score) + " of " + esc(r.total) + " checks passing</span>" +
        "</div>" +
        '<p class="audit-health-line">' + esc(h.line) + "</p>" +
        '<p class="audit-scanned"><span class="label">Domain</span> ' + esc(r.hostname) + "</p>" +
        partialNote +
        '<p class="audit-findings-head">' + esc(findingsHead) + "</p>" +
        '<ul class="audit-findings">' + findings + "</ul>" +
        '<div class="audit-gate">' +
          "<h4>Get the full result</h4>" +
          "<p>Leave your email and a person here will come back to you with the complete list, including what to fix first and in what order.</p>" +
          '<form class="audit-lead" id="leadForm" novalidate>' +
            '<label class="sr-only" for="leadEmail">Your email</label>' +
            '<input type="email" id="leadEmail" placeholder="you@yourbusiness.com" autocomplete="email" required>' +
            '<div class="hp" aria-hidden="true">' +
              '<label for="leadCompanyUrl">Company URL</label>' +
              '<input type="text" id="leadCompanyUrl" name="company_url" tabindex="-1" autocomplete="off">' +
            "</div>" +
            '<div class="cf-turnstile" id="leadTurnstile"></div>' +
            '<button type="submit" class="btn btn-primary" id="leadSubmit">Send me the full audit</button>' +
          "</form>" +
          '<p class="audit-lead-msg" id="leadMsg" role="status"></p>' +
        "</div>" +
        /* The pre-audit CTA's whole job: the visitor now holds a specific
         * result and a specific gap, which is the only moment a sales call is
         * worth more to them than to us. Offer the walkthrough here, once. */
        '<div class="audit-book">' +
          "<h4>Want us to walk you through this?</h4>" +
          "<p>A short call goes through the findings for " + esc(r.hostname) +
            ", what to fix first, and what it would take. Pricing is set on that call, against what the audit found.</p>" +
          '<a href="' + bookHref() + '"' + bookAttrs() +
            ' class="btn btn-primary" data-ev="booking_click" data-ev-label="audit_result_book">Book a call &rarr;</a>' +
        "</div>" +
      "</div>",
      r.state
    );

    track("audit_complete", { state: r.state, health: r.health, demo: true });
    wireLead(r);
  }

  /* ---- lead capture ------------------------------------------------------
   * The AUDIT is a demo fixture and stays labelled as one. The LEAD is real:
   * a person typed their address on a live site and expects a human. Sending
   * a fixture-derived audit to a real inbox would be the dishonest half, so
   * the record carries the findings for context and the copy never claims the
   * scan was live. */
  function wireLead(r) {
    var hostname = r.hostname;
    var lf = document.getElementById("leadForm");
    var le = document.getElementById("leadEmail");
    var ls = document.getElementById("leadSubmit");
    var lm = document.getElementById("leadMsg");
    if (!lf) return;

    /* The widget is injected after Turnstile's own script has already scanned
     * the document, so auto-render never sees it. Render it by hand when both
     * the script and a site key are present; with neither, the container stays
     * an empty div and the honeypot plus the origin check stand alone. */
    var siteKey = (window.FOWNED || {}).turnstileSiteKey;
    if (siteKey && window.turnstile) {
      try {
        window.turnstile.render(document.getElementById("leadTurnstile"), { sitekey: siteKey });
      } catch (e) { /* a challenge that will not render must not eat the form */ }
    }

    le.addEventListener("focus", function () { track("lead_start", { form: "audit_gate" }); }, { once: true });

    lf.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (le.value || "").trim();
      if (!email || email.indexOf("@") < 1) {
        lm.textContent = "Enter your email address.";
        return;
      }
      track("lead_submit", { form: "audit_gate" });
      ls.disabled = true;
      lm.textContent = "Sending…";

      submitLead(email, r, lf).then(function (ok) {
        lf.remove();
        lm.innerHTML = ok
          ? "<strong>Got it. Someone here will come back to you about " + esc(hostname) + ".</strong> " +
            (r.live
              ? "The full audit goes well past the checks above, and that is what we will send. "
              : "The checks above ran against a demonstration fixture, not a live crawl of your site, so the " +
                "real audit is the one we run before we reply. ") +
            'If you would rather not wait, <a href="' + bookHref() + '"' + bookAttrs() +
            ' data-ev="booking_click" data-ev-label="audit_lead_confirm_book">book a call</a> ' +
            'or call <a href="' + PHONE_HREF + '">' + PHONE_TEXT + "</a>."
          : "<strong>That did not go through.</strong> " +
            'Please <a href="' + bookHref() + '"' + bookAttrs() +
            ' data-ev="booking_click" data-ev-label="audit_lead_fallback_book">book a call</a> ' +
            'or call <a href="' + PHONE_HREF + '">' + PHONE_TEXT + "</a> instead.";
      });
    });
  }

  /* A failed send must SAY it failed and hand over a route that works. The
   * tempting alternative, showing the success message regardless, loses the
   * lead silently and the visitor never learns they should have called. */
  function submitLead(email, r, form) {
    var att = null;
    try {
      att = window.FownedInstrument && window.FownedInstrument.attribution();
    } catch (e) { /* attribution is nice to have, never a blocker */ }

    return fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: email,
        domain: r.hostname,
        auditCompleted: true,
        findings: r.checks
          .filter(function (c) { return c.verdict === false; })
          .slice(0, 6)
          .map(function (c) { return c.name; }),
        attribution: att,
        company_url: (document.getElementById("leadCompanyUrl") || {}).value || "",
        turnstileToken: (form.querySelector('[name="cf-turnstile-response"]') || {}).value || "",
      }),
    })
      .then(function (res) { return res.ok; })
      .catch(function () { return false; });
  }

  /* ---- live mode --------------------------------------------------------- */

  /* The tenant endpoint returns a TEASER, at most three failing checks (or one
   * passing check when nothing failed), plus the score over the full set. That
   * is the same shape the fixture produces, so renderResult is untouched: only
   * the source of the verdicts changes. `score` and `total` come from the real
   * run, so a partial run still reports "n of N returned a verdict" honestly. */
  function fromLive(j) {
    var checks = (j.teaser && j.teaser.checks) || [];
    return {
      state: j.state,
      live: true,
      hostname: j.hostname,
      score: j.score,
      total: j.total,
      expectedTotal: j.expectedTotal,
      health: j.health,
      checks: checks.map(function (c) {
        return { name: c.name, verdict: Boolean(c.pass) };
      }),
    };
  }

  function runScan(hostname) {
    var url = (window.FOWNED || {}).scanUrl;
    if (!url) {
      // Fixture mode. The delay exists so the SCANNING state is visible, and it
      // is honest about that: it is not imitating work that is not happening.
      return new Promise(function (resolve) {
        setTimeout(function () { resolve(fixture(hostname)); }, 900);
      });
    }
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: hostname }),
    })
      .then(function (res) {
        return res.json().then(function (j) {
          if (j.state === "SUCCESS" || j.state === "PARTIAL") return fromLive(j);
          // RATE_LIMITED, INVALID_DOMAIN, FAILED and any 404 from an
          // unconfigured tenant all land here. Never fall back to the fixture:
          // a made-up result wearing a live badge is the worst of both modes.
          throw new Error(j.message || j.state || "SCAN_FAILED");
        });
      });
  }

  /* ---- the state machine ------------------------------------------------ */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    track("audit_start", { demo: !(window.FOWNED || {}).scanUrl });

    // VALIDATING
    var raw = (input.value || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    busy(true, "Checking…");
    notice("Checking that address", "One moment.", "VALIDATING");

    if (!raw || !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(raw)) {
      busy(false);
      notice(
        "That does not look like a website address",
        "Enter it like yourbusiness.com and try again.",
        "INVALID_DOMAIN"
      );
      return;
    }

    // SCANNING
    busy(true, "Running your audit…");
    notice("Running your audit", "Checking " + raw + ".", "SCANNING");

    // The delay is honest about itself: it exists so the SCANNING state is
    // visible, not to imitate work that is not happening.
    runScan(raw)
      .then(function (r) {
        busy(false);
        renderResult(r);
      })
      .catch(function () {
        busy(false);
        notice(
          "We could not complete that audit",
          "Something went wrong on our side. Try again, or call " + PHONE_TEXT + ".",
          "FAILED"
        );
      });
  });
})();
