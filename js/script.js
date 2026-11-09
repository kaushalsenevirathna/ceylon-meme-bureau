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
const filePreview = document.getElementById('file-preview');
const filePreviewImage = document.getElementById('file-preview-image');
const filePreviewName = document.getElementById('file-preview-name');
const filePreviewRemove = document.getElementById('file-preview-remove');
const submitFormContent = submitForm.querySelector('.submit-form-content');
const submitSuccess = document.getElementById('submit-success');
const submitReset = document.getElementById('submit-reset');
const submitButton = submitForm.querySelector('.submit-button');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // Conservative upload limit chosen for reliable submissions.
let previewUrl = null;
let isSending = false;

function clearFilePreview() {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
  memeFileInput.value = '';
  filePreview.hidden = true;
  filePreviewImage.removeAttribute('src');
  filePreviewName.textContent = '';
  memeFileText.textContent = 'Click to upload, or drag and drop';
}

function showFileError(message) {
  clearFilePreview();
  formMessage.textContent = message;
  formMessage.classList.add('form-message--error');
}

function displayFilePreview(file) {
  if (!file.type.startsWith('image/')) {
    showFileError('Please choose an image file.');
    return false;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    showFileError('That image is too large. Please choose a file up to 5 MB.');
    return false;
  }
  formMessage.textContent = '';
  formMessage.classList.remove('form-message--error');
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  filePreviewImage.src = previewUrl;
  filePreviewName.textContent = file.name;
  filePreview.hidden = false;
  memeFileText.textContent = 'Meme selected';
  return true;
}

memeFileDrop.addEventListener('click', (event) => {
  if (event.target !== filePreviewRemove) {
    memeFileInput.click();
  }
});

memeFileDrop.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    memeFileInput.click();
  }
});

memeFileInput.addEventListener('change', () => {
  if (memeFileInput.files.length > 0) {
    displayFilePreview(memeFileInput.files[0]);
  }
});

filePreviewRemove.addEventListener('click', (event) => {
  event.stopPropagation();
  clearFilePreview();
  formMessage.textContent = '';
  formMessage.classList.remove('form-message--error');
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
    displayFilePreview(event.dataTransfer.files[0]);
  }
});

function resetSubmissionForm() {
  clearFilePreview();
  submitForm.reset();
  formMessage.textContent = '';
  formMessage.classList.remove('form-message--error');
  submitButton.disabled = false;
  submitButton.textContent = 'Submit meme';
  submitSuccess.hidden = true;
  submitFormContent.hidden = false;
  isSending = false;
}

submitReset.addEventListener('click', resetSubmissionForm);

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwY4f3AotZJBByTpOkwzP-77vxR79-3M1GAUCaVLEVKQu50xwdTXXUa3juN6VfGVAFS/exec";

// Converts an uploaded image file into a Base64 text string,
// since that's the format we can safely send inside JSON to Apps Script
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result looks like "data:image/png;base64,iVBORw0K..."
      // we only want the part AFTER the comma
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

submitForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // still stop the normal page reload — we'll send it ourselves
  if (isSending) return;

  const file = memeFileInput.files[0];
  if (!file) {
    showFileError("Please attach an image before submitting.");
    return;
  }
  if (!displayFilePreview(file)) return;

  isSending = true;
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formMessage.textContent = "";
  formMessage.classList.remove('form-message--error');

  try {
    const imageBase64 = await fileToBase64(file);

    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      social: document.getElementById('facebook').value,
      imageBase64: imageBase64,
      imageMimeType: file.type,
      imageFileName: file.name
    };

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    submitFormContent.hidden = true;
    submitSuccess.hidden = false;

  } catch (error) {
    console.error(error);
    formMessage.textContent = "Something went wrong. Please check your connection and try again.";
    formMessage.classList.add('form-message--error');
    submitButton.disabled = false;
    submitButton.textContent = "Submit meme";
    isSending = false;
  }
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
