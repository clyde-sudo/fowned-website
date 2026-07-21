// ==========================================================================
// LOADING SCREEN
// Waits for BOTH the page to finish loading AND a minimum display time,
// then fades the loader out. The minimum time exists so the loader doesn't
// flash for 50ms on a fast connection — feels broken rather than intentional.
// ==========================================================================

const MIN_DISPLAY_MS = 900; // tweak this — try 600 for snappier, 1400 for slower

const loader = document.getElementById('loader');
const startTime = Date.now();

function hideLoader() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

  setTimeout(() => {
    loader.classList.add('is-hidden');
  }, remaining);
}

if (document.readyState === 'complete') {
  hideLoader();
} else {
  window.addEventListener('load', hideLoader);
}
