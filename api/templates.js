// Folder IDs are public because the folders are shared for viewing.
const FOLDER_IDS = {
  politics: '1CiQEuVoTh6t2B6C3Z4WcPUInRmXiqH5r',
  movies: '16PFBmA9hxt_MfB5KsEImpCnmPcbJ-xH2',
  viral: '1RDmPnb9oVTYUvJnqg6xWPiCjxmHEVdZy',
  others: '1bfypIonqqR_fX7eMiUzAGkGpgI3j4JHu'
};

const VALID_CATEGORIES = ['politics', 'movies', 'viral', 'others'];

// Remove the file extension and make Drive names easier to read on the page.
function makeLabel(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ');
}

// Request image files from one public Drive folder.
async function loadFolder(category, apiKey) {
  const params = new URLSearchParams({
    q: `'${FOLDER_IDS[category]}' in parents and trashed=false and mimeType contains 'image/'`,
    fields: 'files(id,name,mimeType,createdTime)',
    orderBy: 'createdTime desc',
    pageSize: '100',
    key: apiKey
  });
  const url = `https://www.googleapis.com/drive/v3/files?${params}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error && data.error.message
      ? data.error.message
      : 'Google Drive request failed');
  }

  return (data.files || []).map(file => ({
    id: file.id,
    category,
    name: file.name,
    label: makeLabel(file.name),
    thumbnail: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
    download: `https://drive.google.com/uc?export=download&id=${file.id}`
  }));
}

module.exports = async function handler(req, res) {
  // Read the API key from Vercel without exposing it to the browser or logs.
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Could not load templates' });
  }

  // Validate the category before it can affect any Drive request.
  const requestedCategory = req.query.category || 'all';
  if (requestedCategory !== 'all' && !VALID_CATEGORIES.includes(requestedCategory)) {
    return res.status(400).json({ error: 'Invalid template category' });
  }

  try {
    // Load every folder together for the all-templates view.
    const categories = requestedCategory === 'all'
      ? VALID_CATEGORIES
      : [requestedCategory];
    const templateGroups = await Promise.all(
      categories.map(category => loadFolder(category, apiKey))
    );
    const templates = templateGroups.flat();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(templates);
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: 'Could not load templates' });
  }
};
