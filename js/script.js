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

const filterButtons = document.querySelectorAll('.filter-btn');
const templateCards = document.querySelectorAll('.template-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedCategory = button.dataset.category;

    // update which button looks "active"
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // show/hide cards based on match
    templateCards.forEach(card => {
      const cardCategory = card.dataset.category;
      const matches = selectedCategory === 'all' || cardCategory === selectedCategory;
      card.classList.toggle('hidden', !matches);
    });
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

submitForm.addEventListener('submit', (event) => {
  event.preventDefault(); // stops the browser's default page-reload behavior

  // At this point, in a real backend, we'd send this data
  // to a server. For now, we just confirm it was "received."
  formMessage.textContent = "Thanks! Your meme has been submitted for review.";

  submitForm.reset(); // clears all the fields
});

// ============================================
// AI MEME UPSCALER — FRONT-END ONLY
// ============================================

const dropZone = document.getElementById('drop-zone');
const upscalerInput = document.getElementById('upscaler-input');
const upscalerPreview = document.getElementById('upscaler-preview');
const previewBefore = document.getElementById('preview-before');

dropZone.addEventListener('click', () => {
  upscalerInput.click();
});

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    previewBefore.src = event.target.result;
    upscalerPreview.style.display = 'grid';
  };

  reader.readAsDataURL(file);
}

upscalerInput.addEventListener('change', () => {
  handleFile(upscalerInput.files[0]);
});

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFile(event.dataTransfer.files[0]);
});

// ============================================
// CURSOR-RESPONSIVE LOGO GLOW + TILT
// Tracks distance from the mouse to the logo.
// The closer the cursor, the brighter the glow
// and the more the logo tilts toward it.
// ============================================

const heroLogo = document.getElementById('hero-logo');

window.addEventListener('mousemove', (e) => {
  const rect = heroLogo.getBoundingClientRect();

  // center point of the logo on screen
  const logoCenterX = rect.left + rect.width / 2;
  const logoCenterY = rect.top + rect.height / 2;

  // how far the mouse is from that center point
  const dx = e.clientX - logoCenterX;
  const dy = e.clientY - logoCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const maxDistance = 300; // beyond this, no effect at all
  const proximity = Math.max(0, 1 - distance / maxDistance); // 1 = right on it, 0 = far away

  // glow gets stronger the closer the cursor is
  const glowStrength = proximity * 0.8;
  heroLogo.style.filter = `drop-shadow(0 0 ${16 * proximity}px rgba(47, 163, 107, ${glowStrength}))`;

  // subtle 3D tilt, capped so it never looks extreme
  const tiltX = Math.max(-8, Math.min(8, dy * 0.02 * proximity));
  const tiltY = Math.max(-8, Math.min(8, -dx * 0.02 * proximity));
  heroLogo.style.transform = `perspective(400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
});

window.addEventListener('mouseleave', () => {
heroLogo.style.filter = 'drop-shadow(0 0 12px rgba(47, 163, 107, 0))';
heroLogo.style.transform = 'perspective(400px) rotateX(0deg) rotateY(0deg)';
});
// ============================================
// MOBILE NAV TOGGLE
// Clicking the hamburger icon slides the mobile
// menu in from the right. Clicking a link closes it.
// ============================================

const navToggle = document.getElementById('nav-toggle');
const navLinksMobile = document.getElementById('nav-links-mobile');

navToggle.addEventListener('click', () => {
  navLinksMobile.classList.toggle('open');
});

// close the menu automatically once a link is clicked
navLinksMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksMobile.classList.remove('open');
  });
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
const scrollThreshold = 40; // pixels scrolled before the effect kicks in

window.addEventListener('scroll', () => {
  if (window.scrollY > scrollThreshold) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});