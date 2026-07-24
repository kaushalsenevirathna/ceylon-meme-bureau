// ============================================
// PARTICLE BACKGROUND ANIMATION
// This draws small glowing dots that drift
// upward and gently react to the mouse —
// our "signature element" for the hero.
// ============================================

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null };

// Respect users who've asked for reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

// A single particle: a small circle with its own
// position, speed, and size
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height + height; // start below the screen
    this.radius = Math.random() * 1.8 + 0.6;
    this.speed = Math.random() * 0.6 + 0.2;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.y -= this.speed;

    // gentle pull toward the cursor for a "responsive" feel
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        this.x += dx * 0.002;
        this.y += dy * 0.002;
      }
    }

    // once a particle drifts above the screen, recycle it
    if (this.y < -10) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(47, 163, 107, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.floor((width * height) / 18000); // scale count to screen size
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

// Set everything up
resizeCanvas();
initParticles();

if (!prefersReducedMotion) {
  animate();
} else {
  // still draw a static frame so the background isn't empty
  particles.forEach(p => p.draw());
}

// ============================================
// STATS COUNTER ANIMATION
// Counts each number up from 0 to its target,
// but only once the section actually scrolls
// into view.
// ============================================

function animateCounter(el) {
  const target = Number(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(progress * target);
    el.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(tick);
}

const statNumbers = document.querySelectorAll('.stat-number');

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(num => statsObserver.observe(num));

// ============================================
// TEMPLATE GALLERY FILTERING
// ============================================
// TEMPLATE GALLERY FILTERING
// Clicking a category button shows only the
// cards that match, hides the rest.
// ============================================

const filterButtons = document.querySelectorAll('.category-card');
const templateCards = document.querySelectorAll('.template-card');
const templateGrid = document.querySelector('.template-grid');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedCategory = button.dataset.category;

    // update which button looks "active"
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // reveal the grid now that a category has been chosen
    templateGrid.classList.add('visible');

    // show/hide cards based on match
    templateCards.forEach(card => {
      const cardCategory = card.dataset.category;
      const matches = selectedCategory === 'all' || cardCategory === selectedCategory;
      card.classList.toggle('hidden', !matches);
    });

    // scroll smoothly down to the revealed grid
    templateGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
// ============================================
// MEME SUBMISSION FORM
// No backend yet, so we just prevent the page
// from reloading and show a confirmation message.
// This is where a real submission (to Supabase,
// later) will eventually go.
// ============================================

const submitForm = document.getElementById('meme-submit-form');
const formMessage = document.getElementById('form-message');

const memeFileDrop = document.getElementById('meme-file-drop');
const memeFileInput = document.getElementById('meme-upload');
const memeFileText = document.getElementById('meme-file-text');

memeFileDrop.addEventListener('click', () => {
  memeFileInput.click();
});

memeFileInput.addEventListener('change', () => {
  if (memeFileInput.files.length > 0) {
    memeFileText.textContent = memeFileInput.files[0].name;
  }
});

memeFileDrop.addEventListener('dragover', (event) => {
  event.preventDefault();
  memeFileDrop.classList.add('drag-over');
});

memeFileDrop.addEventListener('dragleave', () => {
  memeFileDrop.classList.remove('drag-over');
});

memeFileDrop.addEventListener('drop', (event) => {
  event.preventDefault();
  memeFileDrop.classList.remove('drag-over');
  if (event.dataTransfer.files.length > 0) {
    memeFileInput.files = event.dataTransfer.files;
    memeFileText.textContent = event.dataTransfer.files[0].name;
  }
});

submitForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formMessage.textContent = "Thanks! Your meme has been submitted for review.";
  submitForm.reset();
  memeFileText.textContent = 'Click to upload, or drag and drop';
});



// ============================================
// HERO GRID SPOTLIGHT
// Moves a soft glow to follow the cursor over
// the dot-grid background.
// ============================================

const heroSpotlight = document.getElementById('hero-spotlight');
const heroSection = document.querySelector('.hero');

heroSection.addEventListener('mousemove', (e) => {
  const rect = heroSection.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  heroSpotlight.style.setProperty('--spotlight-x', `${x}%`);
  heroSpotlight.style.setProperty('--spotlight-y', `${y}%`);
});

// ============================================
// LOAD LUCIDE ICONS
// The library needs to be told to actually
// render the icons after the page loads.
// ============================================

// ============================================
// CURSOR-RESPONSIVE GLOW + TILT — HERO BOX LOGO
// ============================================

const heroBoxLogo = document.getElementById('hero-box-logo');

window.addEventListener('mousemove', (e) => {
  const rect = heroBoxLogo.getBoundingClientRect();

  const logoCenterX = rect.left + rect.width / 2;
  const logoCenterY = rect.top + rect.height / 2;

  const dx = e.clientX - logoCenterX;
  const dy = e.clientY - logoCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const maxDistance = 300;
  const proximity = Math.max(0, 1 - distance / maxDistance);

  const glowStrength = proximity * 0.8;
  heroBoxLogo.style.filter = `drop-shadow(0 0 ${16 * proximity}px rgba(47, 163, 107, ${glowStrength}))`;

  const tiltX = Math.max(-8, Math.min(8, dy * 0.02 * proximity));
  const tiltY = Math.max(-8, Math.min(8, -dx * 0.02 * proximity));
  heroBoxLogo.style.transform = `perspective(400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
});

window.addEventListener('mouseleave', () => {
  heroBoxLogo.style.filter = 'drop-shadow(0 0 12px rgba(47, 163, 107, 0))';
  heroBoxLogo.style.transform = 'perspective(400px) rotateX(0deg) rotateY(0deg)';
});

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
// TIMELINE SCROLL REVEAL
// Each timeline entry fades and slides in once
// it scrolls into view, using the same
// IntersectionObserver pattern as the stats counter.
// ============================================

const timelineItems = document.querySelectorAll('.timeline-item');

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

timelineItems.forEach(item => timelineObserver.observe(item));

// ============================================
// COLLAB SECTION SPOTLIGHT
// Same cursor-following glow effect as the hero,
// scoped to the Collaborations section.
// ============================================

const collabSpotlight = document.getElementById('collab-spotlight');
const collabSection = document.querySelector('.collab');

collabSection.addEventListener('mousemove', (e) => {
  const rect = collabSection.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  collabSpotlight.style.setProperty('--spotlight-x', `${x}%`);
  collabSpotlight.style.setProperty('--spotlight-y', `${y}%`);
});