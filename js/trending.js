// ============================================
// TRENDING MEMES — LIVE FROM FACEBOOK
// Asks our own /api/trending function for the latest
// posts, then builds a card for each one.
// ============================================

const FACEBOOK_URL = 'https://www.facebook.com/share/18w8aQJ9yv/?mibextid=wwXIfr';

function formatMemeDate(isoDate) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function isNewPost(isoDate) {
  const timestamp = new Date(isoDate).getTime();
  return !Number.isNaN(timestamp) && Date.now() - timestamp < 48 * 60 * 60 * 1000;
}

function createArrowIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5 12h13m-6-6 6 6-6 6');
  svg.appendChild(path);
  return svg;
}

function buildMemeCard(post, index) {
  const card = document.createElement('a');
  const formattedDate = formatMemeDate(post.date);
  const dateLabel = formattedDate || 'recently';
  card.className = 'meme-card';
  card.href = post.link;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Open meme from ${dateLabel} on Facebook`);

  const frame = document.createElement('div');
  frame.className = 'meme-frame';

  const img = document.createElement('img');
  img.className = 'meme-thumbnail';
  img.src = post.image;
  img.alt = post.caption
    ? post.caption.slice(0, 100)
    : 'Latest meme from Ceylon Meme Bureau';
  img.decoding = 'async';
  img.loading = index < 3 ? 'eager' : 'lazy';
  frame.appendChild(img);

  if (isNewPost(post.date)) {
    const badge = document.createElement('span');
    badge.className = 'meme-new';
    badge.textContent = 'New';
    frame.appendChild(badge);
  }

  const info = document.createElement('div');
  info.className = 'meme-info';

  const date = document.createElement('span');
  date.className = 'meme-date';
  date.textContent = formattedDate;

  const cta = document.createElement('span');
  cta.className = 'meme-link';
  const hiddenLabel = document.createElement('span');
  hiddenLabel.className = 'visually-hidden';
  hiddenLabel.textContent = 'View on Facebook';
  cta.appendChild(hiddenLabel);
  cta.appendChild(createArrowIcon());

  info.appendChild(date);
  info.appendChild(cta);
  card.appendChild(frame);
  card.appendChild(info);

  return card;
}

function createPlaceholderCard() {
  const card = document.createElement('div');
  card.className = 'meme-card meme-card--placeholder';
  const frame = document.createElement('div');
  frame.className = 'meme-frame';
  const info = document.createElement('div');
  info.className = 'meme-info';
  card.appendChild(frame);
  card.appendChild(info);
  return card;
}

function createFacebookLink() {
  const link = document.createElement('a');
  link.className = 'trending-follow';
  link.href = FACEBOOK_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Follow on Facebook ';
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  link.appendChild(arrow);
  return link;
}

function renderMessage(grid, text, includeFollowLink) {
  const message = document.createElement('div');
  message.className = 'trending-message';
  message.setAttribute('aria-live', 'polite');
  const copy = document.createElement('p');
  copy.textContent = text;
  message.appendChild(copy);
  if (includeFollowLink) message.appendChild(createFacebookLink());
  return message;
}

function getLimit(grid) {
  const isSmall = window.matchMedia('(max-width: 900px)').matches;
  const value = isSmall && grid.dataset.limitSmall
    ? grid.dataset.limitSmall
    : grid.dataset.limit;
  return Number(value) || 10;
}

function renderPlaceholders(grid) {
  grid.textContent = '';
  grid.setAttribute('aria-busy', 'true');
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < getLimit(grid); index += 1) {
    fragment.appendChild(createPlaceholderCard());
  }
  grid.appendChild(fragment);
}

function renderPosts(grid, posts) {
  grid.textContent = '';
  grid.setAttribute('aria-busy', 'false');
  const memes = posts.filter(post => post.image).slice(0, getLimit(grid));
  if (!memes.length) {
    grid.appendChild(renderMessage(grid, 'No new memes to show right now.', true));
    return;
  }
  const fragment = document.createDocumentFragment();
  memes.forEach((post, index) => fragment.appendChild(buildMemeCard(post, index)));
  grid.appendChild(fragment);
}

function renderError(grid, retry) {
  grid.textContent = '';
  grid.setAttribute('aria-busy', 'false');
  const message = renderMessage(grid, "Couldn't load the latest memes right now.", false);
  const button = document.createElement('button');
  button.className = 'btn btn--secondary';
  button.type = 'button';
  button.textContent = 'Try again';
  button.addEventListener('click', retry);
  message.appendChild(button);
  grid.appendChild(message);
}

async function fetchTrendingMemes(grid, state) {
  renderPlaceholders(grid);
  try {
    const response = await fetch('/api/trending');
    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }
    state.posts = await response.json();
    state.loaded = true;
    renderPosts(grid, state.posts);
  } catch (error) {
    console.error(error);
    renderError(grid, () => fetchTrendingMemes(grid, state));
  }
}

function setupTrendingGrid(grid) {
  const state = { posts: [], loaded: false };
  let resizeTimer;
  const rerender = () => {
    if (state.loaded) renderPosts(grid, state.posts);
  };
  const mediaQuery = window.matchMedia('(max-width: 900px)');
  const handleResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rerender, 120);
  };
  window.addEventListener('resize', handleResize);
  if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', rerender);
  fetchTrendingMemes(grid, state);
}

function loadTrendingMemes() {
  const grid = document.getElementById('trending-grid');
  if (!grid) return;
  setupTrendingGrid(grid);
}

document.addEventListener('DOMContentLoaded', loadTrendingMemes);
