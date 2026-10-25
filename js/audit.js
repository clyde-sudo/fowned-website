/**
 * Free audit request. The visitor leaves a site address and an email; a person
 * checks the site and sends the audit back within 2 business days. Nothing
 * renders on the page in the meantime, on purpose (see DEPLOYMENT.md).
 *
 * The lead endpoint is the authoritative sink (D1); a failure is stated and the
 * phone number offered, never swallowed.
 */
(function () {
  "use strict";
  var form = document.getElementById("auditForm");
  var msg = document.getElementById("auditMsg");
  if (!form || !msg) return;

  var cfg = window.FOWNED || {};
  var phoneHref = cfg.phoneHref || "#";
  var phoneText = cfg.phoneText || "our phone number";
  var urlInput = document.getElementById("auditUrl");
  var emailInput = document.getElementById("auditEmail");

  function track(name, detail) {
    if (window.FownedInstrument) window.FownedInstrument.track(name, detail);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Accept what people actually type: a bare domain, a full URL, a pasted path. */
  function domainOf(raw) {
    var s = raw.trim();
    if (!s) return "";
    try {
      var host = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s).hostname.toLowerCase();
      return host.indexOf(".") > 0 ? host.replace(/^www\./, "") : "";
    } catch (e) {
      return "";
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var domain = domainOf(urlInput.value);
    var email = emailInput.value.trim();
    if (!domain || email.indexOf("@") < 1) {
      msg.textContent = "Enter your website address and an email to send the audit to.";
      return;
    }

    var btn = form.querySelector("button");
    btn.disabled = true;
    msg.textContent = "Sending…";
    track("lead_submit", { form: "audit" });

    var att = null;
    try {
      att = window.FownedInstrument && window.FownedInstrument.attribution();
    } catch (err) { /* attribution is nice to have, never a blocker */ }
    var hp = form.querySelector('[name="company_url"]');

    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: email,
        domain: domain,
        /* The marker tells the team this lead is owed an audit, without a new
         * column. ponytail: MESSAGE-prefix is the ceiling; add a `kind` column
         * when the leads table needs to filter on it. */
        message: "Free audit request. Send the checked audit within 2 business days.",
        auditCompleted: false,
        attribution: att,
        company_url: hp ? hp.value : "",
        turnstileToken: (form.querySelector('[name="cf-turnstile-response"]') || {}).value || "",
      }),
    })
      .then(function (res) { return res.ok; })
      .catch(function () { return false; })
      .then(function (ok) {
        if (ok) {
          /* The server answers a filled honeypot with a silent 200; keep that
           * bot out of the conversion count. */
          if (!(hp && hp.value)) track("audit_request", { form: "audit" });
          form.hidden = true;
          msg.innerHTML =
            "<strong>Request received.</strong> A person will check " + esc(domain) +
            " and send the audit to " + esc(email) + " within 2 business days.";
        } else {
          btn.disabled = false;
          /* A Turnstile token is single-use, so a retry needs a fresh one. */
          try { if (window.turnstile) window.turnstile.reset(); } catch (err) { /* widget absent */ }
          msg.innerHTML =
            "<strong>That did not go through.</strong> Please try again, or call " +
            '<a href="' + phoneHref + '">' + phoneText + "</a>.";
        }
      });
  });

  urlInput.addEventListener("focus", function () {
    track("lead_start", { form: "audit" });
  }, { once: true });
})();
