// ============================================
// NAVBAR SHRINK ON SCROLL
// Adds a "scrolled" class once the user scrolls
// past a small threshold, triggering the CSS
// transition to a more compact, solid navbar.
// ============================================

const navbar = document.querySelector('.navbar');
const scrollThreshold = 40;

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  // shrink/solidify effect, same as before
  if (currentScrollY > scrollThreshold) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // hide when scrolling down, reveal when scrolling up
  if (currentScrollY > lastScrollY && currentScrollY > 150) {
    // scrolling down, and far enough from the top to bother hiding
    navbar.classList.add('nav-hidden');
  } else {
    // scrolling up (or near the very top)
    navbar.classList.remove('nav-hidden');
  }

  lastScrollY = currentScrollY;
});

// ============================================
// MOBILE NAV TOGGLE
// Opens/closes the mobile menu when the 3-line
// button is tapped, animates it into an X, locks
// background scroll, and closes it again when a
// link inside it is tapped.
// ============================================

const navToggle = document.getElementById('nav-toggle');
const navLinksMobile = document.getElementById('nav-links-mobile');
const navOverlay = document.getElementById('nav-overlay');

function openMobileNav() {
  navToggle.classList.add('open');
  navLinksMobile.classList.add('open');
  navOverlay.classList.add('open');
  document.body.classList.add('nav-open');
}

function closeMobileNav() {
  navToggle.classList.remove('open');
  navLinksMobile.classList.remove('open');
  navOverlay.classList.remove('open');
  document.body.classList.remove('nav-open');
}

navToggle.addEventListener('click', () => {
  navLinksMobile.classList.contains('open') ? closeMobileNav() : openMobileNav();
});

// tapping the dimmed backdrop closes the menu too
navOverlay.addEventListener('click', closeMobileNav);

// close the menu automatically when a mobile link is tapped
navLinksMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});