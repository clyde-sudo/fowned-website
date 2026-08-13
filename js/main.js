// ---- Loading screen ----
// Shows on first load, hides once the page is done loading and at least
// MIN_DISPLAY_MS has passed (so it stays longer than just a flash).

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


// ---- Menu toggle ----
// Opens/closes the dropdown panel under the 3-line icon. Closes
// itself if you click a link inside it or click anywhere outside it.

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


// ---- Portrait scroll effect ----
// Scales the portrait up with scroll, kept small
// (1.0 → 1.15) so it's a nice touch and not distracting. might
// be arbitrary now with style changes

const portrait = document.querySelector('.brand-portrait');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (portrait && !prefersReducedMotion) {
  const MAX_SCROLL = 400;  // how much scrolling it takes to hit full scale
  const MAX_SCALE = 1.15;  // final size , slightly larger than og

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


// ---- Centralized links ----
// Book a call, audit, LinkedIn, etc. Update the URLs here, then every button
// with a matching data-link attribute picks it up automatically 

const LINKS = {
  bookCall: '#',   // still need this one
  audit: '#',      // still need this one
  linkedin: 'https://www.linkedin.com/company/fowned/',
};

document.querySelectorAll('[data-link]').forEach(el => {
  const key = el.dataset.link;
  if (LINKS[key]) {
    el.href = LINKS[key];
  }
});