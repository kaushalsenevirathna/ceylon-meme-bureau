const HERO_IMAGES = [
  'assets/images/hero/hero-1.webp',
  'assets/images/hero/hero-2.webp',
  'assets/images/hero/hero-3.webp',
  'assets/images/hero/hero-4.webp',
  'assets/images/hero/hero-5.webp',
  'assets/images/hero/hero-6.webp',
  'assets/images/hero/hero-7.webp',
  'assets/images/hero/hero-8.webp',
  'assets/images/hero/hero-9.webp',
  'assets/images/hero/hero-10.webp'
]; // Replace these files to change the hero collage

const heroCollage = document.getElementById('hero-collage');
const heroCollageViewport = heroCollage?.querySelector('.hero-collage-viewport');
const heroCollageDesktopQuery = window.matchMedia('(min-width: 901px)');

function createHeroTile(imagePath, index) {
  const image = document.createElement('img');
  image.className = 'hero-collage-tile';
  image.src = imagePath;
  image.alt = '';
  image.decoding = 'async';
  image.loading = index < 2 ? 'eager' : 'lazy';
  image.addEventListener('error', () => {
    image.remove();
    if (heroCollageViewport.querySelectorAll('.hero-collage-tile').length < 3) {
      heroCollage.remove();
    }
  });
  return image;
}

function createHeroColumn(images, offset) {
  const column = document.createElement('div');
  column.className = 'hero-collage-column';

  images.forEach((imagePath, index) => {
    column.appendChild(createHeroTile(imagePath, offset + index));
  });
  images.forEach((imagePath, index) => {
    const tile = createHeroTile(imagePath, offset + index);
    tile.loading = 'lazy';
    column.appendChild(tile);
  });

  return column;
}

function renderHeroCollage(images) {
  if (!heroCollageViewport) return;

  heroCollageViewport.textContent = '';

  if (heroCollageDesktopQuery.matches) {
    const columns = [[], [], []];
    images.forEach((imagePath, index) => columns[index % 3].push(imagePath));
    columns.forEach((columnImages, index) => {
      const column = createHeroColumn(columnImages, index * 3);
      column.classList.add(`hero-collage-column--${index + 1}`);
      heroCollageViewport.appendChild(column);
    });
  } else {
    const track = document.createElement('div');
    track.className = 'hero-collage-mobile-track';
    images.forEach((imagePath, index) => track.appendChild(createHeroTile(imagePath, index)));
    images.forEach((imagePath, index) => {
      const tile = createHeroTile(imagePath, index);
      tile.loading = 'lazy';
      track.appendChild(tile);
    });
    heroCollageViewport.appendChild(track);
  }
}

async function loadHeroCollage() {
  if (!heroCollage || !heroCollageViewport) return;

  const imageLimit = heroCollageDesktopQuery.matches ? 9 : 6;
  renderHeroCollage(HERO_IMAGES.slice(0, imageLimit));

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    heroCollage.classList.toggle('hero-collage--paused', !entry.isIntersecting);
  });
  visibilityObserver.observe(heroCollage);
}

loadHeroCollage();
