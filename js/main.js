/**
 * Shared chrome: loading screen and mobile menu.
 *
 * The centralized LINKS map that used to live here was removed. It rewrote
 * every [data-link] href from a lookup table in which two of the three entries
 * were still '#', so the primary "Book a call" and "Run audit" buttons pointed
 * at the current page. Real hrefs are now written into the markup by the page
 * generator, where a build-time check fails the build if one does not resolve.
 * A dead link cannot be introduced without the build refusing it.
 */

// ---- Loading screen ----
const MIN_DISPLAY_MS = 600;
const loader = document.getElementById('loader');

if (loader) {
  const startTime = Date.now();
  const hideLoader = () => {
    const remaining = Math.max(0, MIN_DISPLAY_MS - (Date.now() - startTime));
    setTimeout(() => loader.classList.add('is-hidden'), remaining);
  };
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
}

// ---- Menu toggle ----
const menuToggle = document.getElementById('menuToggle');
const menuPanel = document.getElementById('menuPanel');

if (menuToggle && menuPanel) {
  const close = () => {
    menuPanel.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuPanel.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  menuPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', close));

  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !menuPanel.contains(e.target)) close();
  });

  // Escape closes the panel and returns focus to the control that opened it,
  // which is the keyboard equivalent of clicking away.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuPanel.classList.contains('is-open')) {
      close();
      menuToggle.focus();
    }
  });
}

// ---- Current-page marking ----
// Marks the nav item for the page you are on. Done here rather than at build
// time so one generated shell serves every route.
document.querySelectorAll('.nav a, .menu-panel a').forEach(a => {
  if (a.getAttribute('href') === location.pathname) {
    a.setAttribute('aria-current', 'page');
  }
});
