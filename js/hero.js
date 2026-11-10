const heroCollage = document.getElementById('hero-collage');
const heroCollageViewport = heroCollage?.querySelector('.hero-collage-viewport');
const heroCollageDesktopQuery = window.matchMedia('(min-width: 901px)');

function createHeroTile(post, index) {
  const image = document.createElement('img');
  image.className = 'hero-collage-tile';
  image.src = post.image;
  image.alt = '';
  image.decoding = 'async';
  image.loading = index < 2 ? 'eager' : 'lazy';
  return image;
}

function createHeroColumn(posts, offset) {
  const column = document.createElement('div');
  column.className = 'hero-collage-column';

  posts.forEach((post, index) => {
    column.appendChild(createHeroTile(post, offset + index));
  });
  posts.forEach((post, index) => {
    const tile = createHeroTile(post, offset + index);
    tile.loading = 'lazy';
    column.appendChild(tile);
  });

  return column;
}

function renderHeroCollage(posts) {
  if (!heroCollageViewport) return;

  heroCollageViewport.textContent = '';

  if (heroCollageDesktopQuery.matches) {
    const columns = [[], [], []];
    posts.forEach((post, index) => columns[index % 3].push(post));
    columns.forEach((columnPosts, index) => {
      const column = createHeroColumn(columnPosts, index * 3);
      column.classList.add(`hero-collage-column--${index + 1}`);
      heroCollageViewport.appendChild(column);
    });
  } else {
    const track = document.createElement('div');
    track.className = 'hero-collage-mobile-track';
    posts.forEach((post, index) => track.appendChild(createHeroTile(post, index)));
    posts.forEach((post, index) => {
      const tile = createHeroTile(post, index);
      tile.loading = 'lazy';
      track.appendChild(tile);
    });
    heroCollageViewport.appendChild(track);
  }
}

async function loadHeroCollage() {
  if (!heroCollage || !heroCollageViewport) return;

  const imageLimit = heroCollageDesktopQuery.matches ? 9 : 6;

  try {
    const response = await fetch('/api/trending');
    if (!response.ok) return heroCollage.remove();

    const posts = await response.json();
    const imagePosts = posts.filter(post => post && post.image).slice(0, imageLimit);

    if (imagePosts.length === 0) {
      heroCollage.remove();
      return;
    }

    renderHeroCollage(imagePosts);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      heroCollage.classList.toggle('hero-collage--paused', !entry.isIntersecting);
    });
    visibilityObserver.observe(heroCollage);
  } catch {
    heroCollage.remove();
  }
}

loadHeroCollage();
