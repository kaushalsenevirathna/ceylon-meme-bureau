// ============================================
// TEMPLATES PAGE — LOADS IMAGES FROM GOOGLE DRIVE
// and shows the selected category.
// ============================================

const validCategories = ['all', 'politics', 'movies', 'viral', 'others'];
const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get('category') || 'all';
const selectedCategory = validCategories.includes(requestedCategory)
  ? requestedCategory
  : 'all';

function buildTemplateCard(template) {
  const card = document.createElement('div');
  card.className = 'template-card';

  const image = document.createElement('img');
  image.className = 'template-thumbnail';
  image.src = template.thumbnail;
  image.alt = `${template.label} meme template`;
  image.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'template-info';

  const label = document.createElement('span');
  label.textContent = template.label;

  const download = document.createElement('a');
  download.className = 'download-btn';
  download.href = template.download;
  download.target = '_blank';
  download.rel = 'noopener noreferrer';
  download.textContent = 'Download';

  info.appendChild(label);
  info.appendChild(download);
  card.appendChild(image);
  card.appendChild(info);

  return card;
}

async function loadTemplates() {
  const grid = document.getElementById('template-grid');
  if (!grid) return; // this page has no template section, do nothing

  const pageTitle = document.getElementById('page-title');
  if (selectedCategory !== 'all' && pageTitle) {
    const label = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    pageTitle.textContent = `${label} Templates`;
  }

  grid.textContent = 'Loading templates...';

  try {
    const response = await fetch(`/api/templates?category=${selectedCategory}`);
    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }

    const templates = await response.json();
    if (!Array.isArray(templates)) {
      throw new Error('Template response was not a list');
    }

    grid.textContent = '';
    if (templates.length === 0) {
      grid.textContent = 'No templates in this category yet.';
      return;
    }

    templates.forEach(template => {
      grid.appendChild(buildTemplateCard(template));
    });
  } catch (error) {
    console.error(error);
    grid.textContent = "Couldn't load templates right now. Please try again later.";
  }
}

document.addEventListener('DOMContentLoaded', loadTemplates);
