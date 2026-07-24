// ============================================
// ARTICLES — LISTING RENDERER
// Builds article cards from articlesData (see
// js/articles-data.js) and drops them into
// whichever grid container exists on the page.
// Used by index.html (3-card teaser) and
// articles.html (the full listing).
// ============================================

function formatArticleDate(isoDate) {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function buildArticleCard(article) {
  return `
    <a href="article.html?slug=${article.slug}" class="article-card">
      <div class="article-card-image">
        <img src="${article.coverImage}" alt="${article.title}" loading="lazy">
      </div>
      <div class="article-card-body">
        <span class="article-category">${article.category}</span>
        <h3 class="article-card-title">${article.title}</h3>
        <p class="article-card-excerpt">${article.excerpt}</p>
        <div class="article-card-meta">
          <span>${formatArticleDate(article.date)}</span>
          <span class="meta-dot">•</span>
          <span>${article.readTime}</span>
        </div>
      </div>
    </a>
  `;
}

function buildFeaturedCard(article) {
  return `
    <a href="article.html?slug=${article.slug}" class="article-card article-card--featured">
      <div class="article-card-image">
        <img src="${article.coverImage}" alt="${article.title}" loading="lazy">
      </div>
      <div class="article-card-body">
        <span class="article-category">${article.category}</span>
        <h3 class="article-card-title">${article.title}</h3>
        <p class="article-card-excerpt">${article.excerpt}</p>
        <div class="article-card-meta">
          <span>${formatArticleDate(article.date)}</span>
          <span class="meta-dot">•</span>
          <span>${article.readTime}</span>
        </div>
        <span class="article-card-cta">Read Article →</span>
      </div>
    </a>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const teaserGrid = document.getElementById('articles-teaser-grid');
  if (teaserGrid) {
    const latest = [...articlesData]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    teaserGrid.innerHTML = latest.map(buildArticleCard).join('');
  }

  const fullGrid = document.getElementById('articles-full-grid');
  const featuredSlot = document.getElementById('articles-featured-slot');
  if (fullGrid) {
    const sorted = [...articlesData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const [featured, ...rest] = sorted;

    if (featuredSlot && featured) {
      featuredSlot.innerHTML = buildFeaturedCard(featured);
    }
    fullGrid.innerHTML = rest.map(buildArticleCard).join('');
  }
});

// ============================================
// ARTICLE — SINGLE ARTICLE RENDERER
// Reads ?slug= from the URL, finds the matching
// article in articlesData, and fills in article.html.
// ============================================

function formatDate(isoDate) {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function renderBlock(block) {
  switch (block.type) {
    case 'heading':
      return `<h3>${block.text}</h3>`;
    case 'quote':
      return `<blockquote>${block.text}</blockquote>`;
    case 'paragraph':
    default:
      return `<p>${block.text}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const article = articlesData.find(a => a.slug === slug);

  const notFound = document.getElementById('article-not-found');
  const content = document.getElementById('article-content');

  if (!content && !notFound) return; // not on the article page, do nothing

  if (!article) {
    if (content) content.style.display = 'none';
    if (notFound) notFound.style.display = 'block';
    return;
  }

  document.title = `${article.title} — Ceylon Meme Bureau`;

  document.getElementById('article-cover').src = article.coverImage;
  document.getElementById('article-cover').alt = article.title;
  document.getElementById('article-category').textContent = article.category;
  document.getElementById('article-title').textContent = article.title;
  document.getElementById('article-date').textContent = formatDate(article.date);
  document.getElementById('article-readtime').textContent = article.readTime;
  document.getElementById('article-body').innerHTML = article.body
    .map(renderBlock)
    .join('');

  const moreGrid = document.getElementById('article-more-grid');
  if (moreGrid) {
    const others = articlesData.filter(a => a.slug !== article.slug).slice(0, 2);
    moreGrid.innerHTML = others
      .map(
        a => `
        <a href="article.html?slug=${a.slug}" class="article-card">
          <div class="article-card-image">
            <img src="${a.coverImage}" alt="${a.title}" loading="lazy">
          </div>
          <div class="article-card-body">
            <span class="article-category">${a.category}</span>
            <h3 class="article-card-title">${a.title}</h3>
            <div class="article-card-meta">
              <span>${formatDate(a.date)}</span>
              <span class="meta-dot">•</span>
              <span>${a.readTime}</span>
            </div>
          </div>
        </a>
      `
      )
      .join('');
  }
});