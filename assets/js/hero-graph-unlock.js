(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const hero = document.getElementById("hero-graph");
    const overlay = document.getElementById("hero-graph-overlay");
    const unlockButton = document.getElementById("hero-graph-unlock-btn");

    if (!hero || !overlay || !unlockButton) return;

    unlockButton.addEventListener("click", () => {
      hero.classList.remove("hero-graph--locked");
      overlay.remove();
    });
  });
})();
