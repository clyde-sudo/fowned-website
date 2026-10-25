/**
 * Booking links stay real links (they work with JavaScript off and open in a
 * new tab). With JavaScript on, a plain click opens Calendly's popup instead,
 * and Calendly's script is fetched only then, so no page pays for it up front.
 *
 * When Calendly reports a scheduled booking, the event and invitee URIs go to
 * /api/lead with the page that produced it. Calendly's message also carries the
 * invitee's details; none of them are read here.
 */
(function () {
  "use strict";

  var CALENDLY = "https://calendly.com";
  var pendingUrl = null;
  var requested = false;

  function openPopup(url) {
    if (window.Calendly) return window.Calendly.initPopupWidget({ url: url });
    pendingUrl = url; // the latest click wins once the script arrives
    if (requested) return;
    requested = true;
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = CALENDLY + "/assets/external/widget.css";
    document.head.appendChild(css);
    var s = document.createElement("script");
    s.async = true;
    s.src = CALENDLY + "/assets/external/widget.js";
    s.onload = function () { window.Calendly.initPopupWidget({ url: pendingUrl }); };
    s.onerror = function () { window.location.href = pendingUrl; }; // Calendly unreachable: plain navigation still books
    document.head.appendChild(s);
  }

  document.addEventListener("click", function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest('a[href^="https://calendly.com/"]');
    if (!a) return;
    e.preventDefault();
    openPopup(a.href);
  });

  var seen = {};
  window.addEventListener("message", function (e) {
    if (e.origin !== CALENDLY) return;
    var d = e.data;
    if (!d || d.event !== "calendly.event_scheduled" || !d.payload) return;
    var eventUri = d.payload.event && d.payload.event.uri;
    var inviteeUri = d.payload.invitee && d.payload.invitee.uri;
    if (typeof eventUri !== "string" || seen[eventUri]) return;
    seen[eventUri] = true;

    var inst = window.FownedInstrument;
    var att = null;
    try { att = inst && inst.attribution(); } catch (err) { /* attribution is nice to have */ }
    if (inst) inst.track("booking_scheduled", {
      page_path: location.pathname,
      source_class: (att && att.source) || "DIRECT_OR_UNKNOWN",
    });

    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "BOOKING_SCHEDULED",
        eventUri: eventUri,
        inviteeUri: inviteeUri,
        pagePath: location.pathname,
        attribution: att,
      }),
    }).catch(function () { /* Calendly already holds the booking; this is attribution only */ });
  });
})();
