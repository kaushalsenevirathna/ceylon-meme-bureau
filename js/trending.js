// ============================================
// TRENDING MEMES — LIVE FROM FACEBOOK
// Asks our own /api/trending function for the latest
// posts, then builds a card for each one.
// ============================================

function formatMemeDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function buildMemeCard(post) {
  const card = document.createElement('a');
  card.className = 'meme-card';
  card.href = post.link;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.className = 'meme-thumbnail';
  img.src = post.image;
  img.alt = post.caption
    ? post.caption.slice(0, 100)
    : 'Latest meme from Ceylon Meme Bureau';
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'meme-info';

  const date = document.createElement('span');
  date.className = 'meme-rank';
  date.textContent = formatMemeDate(post.date);

  const cta = document.createElement('span');
  cta.className = 'meme-stats';
  cta.textContent = 'View on Facebook ↗';

  info.appendChild(date);
  info.appendChild(cta);
  card.appendChild(img);
  card.appendChild(info);

  return card;
}

async function loadTrendingMemes() {
  const grid = document.getElementById('trending-grid');
  if (!grid) return; // this page has no trending section, do nothing

  const limit = Number(grid.dataset.limit) || 10;
  grid.textContent = 'Loading the latest memes...';

  try {
    const response = await fetch('/api/trending');
    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }
    const posts = await response.json();

    const memes = posts.filter(post => post.image).slice(0, limit);

    grid.textContent = '';
    memes.forEach(post => grid.appendChild(buildMemeCard(post)));
  } catch (error) {
    console.error(error);
    grid.textContent = "Couldn't load memes right now. Please try again later.";
  }
}

document.addEventListener('DOMContentLoaded', loadTrendingMemes);