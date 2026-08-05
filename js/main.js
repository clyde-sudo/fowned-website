// ==========================================================================
// LOADING SCREEN
// ==========================================================================

const MIN_DISPLAY_MS = 1000; 

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

// ==========================================================================
// menu toggle
// ==========================================================================

const menuToggle = document.getElementById('menuToggle');
const menuPanel = document.getElementById('menuPanel');

if (menuToggle && menuPanel) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuPanel.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  // close after clicking a link
  menuPanel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // close if clicking anywhere outside the menu
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !menuPanel.contains(e.target)) {
      menuPanel.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ==========================================================================
// portrait scroll effect
// Subtly scales the banner portrait up as the user scrolls down the page.
// Capped at a small factor (1.0 → 1.08) so it reads as a nice touch, not
// a distraction. Skips entirely if the user has reduced-motion enabled.
// ==========================================================================

const portrait = document.querySelector('.brand-portrait');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (portrait && !prefersReducedMotion) {
  const MAX_SCROLL = 400;   // scroll distance (px) over which the effect completes
  const MAX_SCALE = 1.15;   // final scale — keep this small, it's meant to be subtle

  let ticking = false;

  function updatePortraitScale() {
    const progress = Math.min(window.scrollY / MAX_SCROLL, 1);
    const scale = 1 + progress * (MAX_SCALE - 1);
    portrait.style.transform = `scale(${scale})`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updatePortraitScale);
      ticking = true;
    }
  }, { passive: true });
}

// ==========================================================================
// links to call, audit, etc
// Update the URLs here once you have them — every button tagged with a
// matching data-link attribute updates automatically, no hunting through
// index.html required.
// ==========================================================================

const LINKS = {
  bookCall: '#',   //  replace 
  audit: '#',      // replace 
  linkedin: 'https://www.linkedin.com/company/fowned/',  
};

document.querySelectorAll('[data-link]').forEach(el => {
  const key = el.dataset.link;
  if (LINKS[key]) {
    el.href = LINKS[key];
  }
});
