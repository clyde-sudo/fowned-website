/** Demo consultation form. Confirms in-browser only; nothing is transmitted. */
(function () {
  "use strict";
  var form = document.getElementById("contactForm");
  var msg = document.getElementById("contactMsg");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cName").value.trim();
    var site = document.getElementById("cSite").value.trim();
    var email = document.getElementById("cEmail").value.trim();
    if (!name || !site || !email) {
      msg.textContent = "Fill in your name, website and email.";
      return;
    }
    if (window.FownedInstrument) {
      window.FownedInstrument.track("lead_submit", { form: "consultation", demo: true });
    }
    form.querySelector("button").disabled = true;
    msg.innerHTML =
      "<strong>Demo only.</strong> Nothing was sent. In production this becomes a " +
      "qualified lead in the agency pipeline with your audit attached. To reach us " +
      'for real, call <a href="tel:+18313320184">+1 (831) 332 0184</a>.';
  });

  if (window.FownedInstrument) {
    document.getElementById("cName").addEventListener("focus", function () {
      window.FownedInstrument.track("lead_start", { form: "consultation" });
    }, { once: true });
  }
})();
