/**
 * Consultation form. Real submission to the site's own lead endpoint.
 *
 * This form is the fallback booking route whenever no calendar URL is
 * configured, which makes it load-bearing rather than decorative: if it
 * silently fails, the site has no working way to reach a human at all. So a
 * failure is stated and the phone number is offered in its place.
 */
(function () {
  "use strict";
  var form = document.getElementById("contactForm");
  var msg = document.getElementById("contactMsg");
  if (!form) return;

  var cfg = window.FOWNED || {};
  var phoneHref = cfg.phoneHref || "#";
  var phoneText = cfg.phoneText || "our phone number";

  function track(name, detail) {
    if (window.FownedInstrument) window.FownedInstrument.track(name, detail);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cName").value.trim();
    var site = document.getElementById("cSite").value.trim();
    var email = document.getElementById("cEmail").value.trim();
    var note = document.getElementById("cNote").value.trim();
    if (!name || !site || !email) {
      msg.textContent = "Fill in your name, website and email.";
      return;
    }

    var btn = form.querySelector("button");
    btn.disabled = true;
    msg.textContent = "Sending…";
    track("lead_submit", { form: "consultation" });

    var hp = document.getElementById("cCompanyUrl");
    var att = null;
    try {
      att = window.FownedInstrument && window.FownedInstrument.attribution();
    } catch (err) { /* attribution is nice to have, never a blocker */ }

    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: email,
        name: name,
        domain: site.replace(/^https?:\/\//i, "").replace(/\/.*$/, ""),
        message: note,
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
          track("contact_submit", { form: "consultation" });
          form.innerHTML =
            '<p class="audit-lead-msg"><strong>Got it, ' + name.replace(/[<>&]/g, "") +
            ".</strong> Someone here will read this and reply on a working day. " +
            'If it is urgent, call <a href="' + phoneHref + '">' + phoneText + "</a>.</p>";
        } else {
          btn.disabled = false;
          msg.innerHTML =
            "<strong>That did not go through.</strong> Please call " +
            '<a href="' + phoneHref + '">' + phoneText + "</a> instead.";
        }
      });
  });

  document.getElementById("cName").addEventListener("focus", function () {
    track("lead_start", { form: "consultation" });
  }, { once: true });
})();
