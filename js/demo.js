/** Prospect workspace filtering. Pure client-side; the fixtures are in the HTML. */
(function () {
  "use strict";
  var grid = document.getElementById("prospectGrid");
  var count = document.getElementById("filterCount");
  if (!grid) return;

  var state = { owner: "ALL", status: "ALL" };

  function apply() {
    var shown = 0;
    var cards = grid.querySelectorAll(".prospect");
    cards.forEach(function (c) {
      var ok =
        (state.owner === "ALL" || c.dataset.owner === state.owner) &&
        (state.status === "ALL" || c.dataset.status === state.status);
      c.hidden = !ok;
      if (ok) shown++;
    });
    // An empty result says so. A filter that silently shows nothing reads as
    // a broken page rather than as a filter that matched nothing.
    count.textContent =
      shown === cards.length
        ? "Showing all " + cards.length + " demo prospects"
        : "Showing " + shown + " of " + cards.length + " demo prospects";
    var empty = grid.querySelector(".empty-state");
    if (shown === 0 && !empty) {
      var p = document.createElement("p");
      p.className = "empty-state";
      p.textContent = "No demo prospects match this combination.";
      grid.appendChild(p);
    } else if (shown > 0 && empty) {
      empty.remove();
    }
  }

  document.querySelectorAll(".chip[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter;
      state[f] = btn.dataset.value;
      document
        .querySelectorAll('.chip[data-filter="' + f + '"]')
        .forEach(function (b) { b.classList.toggle("is-on", b === btn); });
      apply();
    });
  });

  apply();
})();
