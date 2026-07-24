// ============================================
// TEMPLATES PAGE — READS ?category= FROM THE URL
// and shows only matching template cards.
// ============================================

// URLSearchParams reads the part of the URL after "?"
const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get('category') || 'all';

const templateCards = document.querySelectorAll('.template-card');
const pageTitle = document.getElementById('page-title');

templateCards.forEach(card => {
  const cardCategory = card.dataset.category;
  const matches = selectedCategory === 'all' || cardCategory === selectedCategory;
  card.classList.toggle('hidden', !matches);
});

// Update the heading to reflect which category we're viewing
if (selectedCategory !== 'all') {
  const label = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
  pageTitle.textContent = `${label} Templates`;
}

// ============================================
// DOWNLOAD BUTTON — downloads the template
// image that sits inside the same card
// ============================================
const downloadButtons = document.querySelectorAll('.download-btn');

downloadButtons.forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.template-card');
    const image = card.querySelector('.template-thumbnail');
    const label = card.querySelector('.template-info span').textContent;

    // Build a filename from the visible label, e.g. "Politics Template" -> "politics-template.jpg"
    const extension = image.src.split('.').pop().split('?')[0];
    const fileName = label.trim().toLowerCase().replace(/\s+/g, '-') + '.' + extension;

    const link = document.createElement('a');
    link.href = image.src;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
});