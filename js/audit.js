/**
 * Fowned free-audit funnel.
 *
 * Calls Citability's agency-scoped scan API. There is no scan engine here and
 * there must never be one: Fowned is a TENANT of Citability, not a fork of it.
 * The tenant is named by the URL path (/api/agency/fowned/...) and resolved
 * server-side. This file never sends an organization id, because a client that
 * can name its own tenant is a client that can name someone else's.
 *
 * Every scan state is rendered as itself. In particular a check that produced
 * no verdict is shown as "not measured", never as a zero and never as a fail.
 */
(function () {
  "use strict";

  var API_BASE =
    window.FOWNED_API_BASE ||
    (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)
      ? "http://localhost:3000"
      : "https://citability.dev");
  var AGENCY = window.FOWNED_AGENCY_SLUG || "fowned";

  /* The sign-in link ships with the production workspace URL hard-coded so it
   * works with JS off. When the funnel is pointed somewhere else (local dev,
   * staging) it has to follow, or "Sign in" silently sends people to prod. */
  var signin = document.getElementById("signinLink");
  if (signin) signin.href = API_BASE + "/agency/" + AGENCY + "/prospects";

  var form = document.getElementById("auditForm");
  var input = document.getElementById("auditUrl");
  var submit = document.getElementById("auditSubmit");
  var panel = document.getElementById("auditPanel");
  if (!form || !panel) return;

  var PHONE_HREF = "tel:+18313320184";
  var PHONE_TEXT = "+1 (831) 332 0184";

  /* ---- attribution (section 12) -------------------------------------------
   * First-touch, captured on first page view of the session. We record where
   * the visitor came from and let the server classify it. We do NOT claim a
   * specific AI answer caused the visit, because nothing here can observe that.
   * A missing referrer is recorded as missing, not as "direct".
   */
  var ATTR_KEY = "fowned_attribution";
  function attribution() {
    try {
      var saved = sessionStorage.getItem(ATTR_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      /* private mode: fall through and use this pageview */
    }
    var q = new URLSearchParams(location.search);
    var a = {
      referrer: document.referrer || null,
      landingPath: location.pathname + location.search,
      utm: {
        utmSource: q.get("utm_source"),
        utmMedium: q.get("utm_medium"),
        utmCampaign: q.get("utm_campaign")
      }
    };
    try {
      sessionStorage.setItem(ATTR_KEY, JSON.stringify(a));
    } catch (e) {
      /* not fatal: the scan still works, attribution is just not persisted */
    }
    return a;
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
    submit.textContent = on ? label : "Run my free audit →";
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

  /* ---- states (section 10) ---------------------------------------------- */

  var HEALTH_COPY = {
    CRITICAL: {
      label: "Critical",
      line: "AI tools are missing most of what they need to describe you accurately."
    },
    NEEDS_WORK: {
      label: "Needs work",
      line: "Some of what AI tools look for is there. Enough is missing to cost you mentions."
    },
    HEALTHY: {
      label: "Healthy",
      line: "The basics AI tools look for are in place on this page."
    }
  };

  function renderResult(r) {
    var h = HEALTH_COPY[r.health] || HEALTH_COPY.NEEDS_WORK;
    var unmeasured = r.total < r.expectedTotal;

    var findings = (r.teaser && r.teaser.checks ? r.teaser.checks : [])
      .map(function (c) {
        return (
          '<li class="audit-finding ' + (c.pass ? "is-pass" : "is-fail") + '">' +
          '<span class="audit-finding-mark">' + (c.pass ? "✓" : "✕") + "</span>" +
          "<span>" + esc(c.name) + "</span></li>"
        );
      })
      .join("");

    var findingsHead = r.teaser && r.teaser.allPassed
      ? "Nothing failed in the free checks. Here is one we looked at:"
      : "What we found (showing up to three):";

    // "not measured" is its own line and is never folded into the score.
    var partialNote = unmeasured
      ? '<p class="audit-partial">' +
        esc(
          r.total + " of " + r.expectedTotal + " checks returned a verdict. The rest " +
          "could not be measured on this site, so they are left out of the score " +
          "rather than counted as failures."
        ) + "</p>"
      : "";

    render(
      '<div class="audit-result">' +
        '<div class="audit-result-head">' +
          '<span class="audit-health audit-health-' + esc(r.health) + '">' + esc(h.label) + "</span>" +
          '<span class="audit-score">' + esc(r.score) + " of " + esc(r.total) + " checks passing</span>" +
        "</div>" +
        '<p class="audit-health-line">' + esc(h.line) + "</p>" +
        '<p class="audit-scanned">' + esc(r.hostname) + "</p>" +
        partialNote +
        '<p class="audit-findings-head">' + esc(findingsHead) + "</p>" +
        '<ul class="audit-findings">' + findings + "</ul>" +
        '<div class="audit-gate">' +
          "<h4>Get the full result</h4>" +
          "<p>Leave your email and we will send the complete list, including what to fix first.</p>" +
          '<form class="audit-lead" id="leadForm" novalidate>' +
            '<label class="sr-only" for="leadEmail">Your email</label>' +
            '<input type="email" id="leadEmail" placeholder="you@yourbusiness.com" autocomplete="email" required>' +
            '<button type="submit" class="btn btn-primary" id="leadSubmit">Send me the full audit</button>' +
          "</form>" +
          '<p class="audit-lead-msg" id="leadMsg" role="status"></p>' +
        "</div>" +
      "</div>",
      r.state
    );

    if (r.prospectId == null) {
      // The scan ran but was not stored, so there is nothing to attach a lead
      // to. Saying so beats showing a form that cannot work.
      var gate = panel.querySelector(".audit-gate");
      if (gate) {
        gate.innerHTML =
          "<h4>Want the full result?</h4><p>We could not save this audit, so we cannot email it to you. Call us on " +
          '<a href="' + PHONE_HREF + '">' + PHONE_TEXT + "</a> and we will run it with you.</p>";
      }
      return;
    }
    wireLead(r.prospectId);
  }

  /* ---- lead capture (section 11) + consultation handoff (section 13) ----- */

  function wireLead(prospectId) {
    var lf = document.getElementById("leadForm");
    var le = document.getElementById("leadEmail");
    var ls = document.getElementById("leadSubmit");
    var lm = document.getElementById("leadMsg");
    if (!lf) return;

    lf.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (le.value || "").trim();
      if (!email) {
        lm.textContent = "Enter your email address.";
        return;
      }
      ls.disabled = true;
      ls.textContent = "Sending…";
      lm.textContent = "";

      var a = attribution();
      fetch(API_BASE + "/api/agency/" + encodeURIComponent(AGENCY) + "/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prospectId: prospectId,
          email: email,
          referrer: a.referrer,
          landingPath: a.landingPath,
          utm: a.utm
        })
      })
        .then(function (res) {
          return res.json().then(function (j) {
            return { ok: res.ok, body: j };
          });
        })
        .then(function (out) {
          if (out.body && out.body.state === "CAPTURED") {
            // The only booking destination that exists is the phone number.
            // No calendar link is invented here.
            lf.remove();
            lm.innerHTML =
              "Got it. We will send the full audit to " + esc(email) + "." +
              " If you would rather talk it through now, call " +
              '<a href="' + PHONE_HREF + '">' + PHONE_TEXT + "</a>.";
            return;
          }
          ls.disabled = false;
          ls.textContent = "Send me the full audit";
          lm.textContent =
            (out.body && out.body.message) || "We could not save that. Try again.";
        })
        .catch(function () {
          ls.disabled = false;
          ls.textContent = "Send me the full audit";
          lm.textContent =
            "We could not reach the server. Check your connection and try again.";
        });
    });
  }

  /* ---- scan ------------------------------------------------------------- */

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // VALIDATING
    var raw = (input.value || "").trim();
    busy(true, "Checking…");
    if (!raw || !/^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw.replace(/^https?:\/\//i, ""))) {
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
    notice("Running your audit", "Checking " + raw + ". This takes about a minute.", "SCANNING");

    fetch(API_BASE + "/api/agency/" + encodeURIComponent(AGENCY) + "/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: raw })
    })
      .then(function (res) {
        return res.json().then(function (j) {
          return { status: res.status, body: j };
        });
      })
      .then(function (out) {
        busy(false);
        var b = out.body || {};

        if (out.status === 429 || b.state === "RATE_LIMITED") {
          var secs = b.retryAfterSec ? Math.ceil(b.retryAfterSec / 60) : null;
          notice(
            "Too many audits from your network",
            secs
              ? "Try again in about " + secs + " minute" + (secs === 1 ? "" : "s") + "."
              : "Try again shortly.",
            "RATE_LIMITED"
          );
          return;
        }
        if (b.state === "INVALID_DOMAIN") {
          notice("That address could not be used", b.message || "Check it and try again.", "INVALID_DOMAIN");
          return;
        }
        if (b.state === "SUCCESS" || b.state === "PARTIAL") {
          renderResult(b);
          return;
        }
        // FAILED, and anything unrecognised, is reported as a failure. A scan
        // that did not run is never shown as a result with nothing in it.
        notice(
          "We could not audit that site",
          b.message || "The site did not respond. Check the address and try again.",
          "FAILED"
        );
      })
      .catch(function () {
        busy(false);
        notice(
          "We could not reach the audit service",
          "This is on our side, not yours. Try again in a moment, or call " + PHONE_TEXT + ".",
          "FAILED"
        );
      });
  });

  attribution(); // first-touch, captured on load
})();
