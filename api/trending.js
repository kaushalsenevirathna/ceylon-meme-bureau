// Keep captions short enough to look like meme posts.
const MAX_CAPTION_LENGTH = 300;
// Identify web addresses commonly used in announcement posts.
const LINK_PATTERN = /https?:\/\/|www\./i;

module.exports = async function handler(req, res) {
  // Read the secrets from Vercel's environment variables
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_TOKEN;

  if (!pageId || !token) {
    return res.status(500).json({ error: 'Missing Facebook settings' });
  }

  const url =
    `https://graph.facebook.com/v27.0/${pageId}/published_posts` +
    `?fields=message,created_time,permalink_url,full_picture` +
    `&limit=30&access_token=${token}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook error:', data.error && data.error.message);
      return res.status(502).json({ error: 'Could not load posts' });
    }

    // Send back only what the website needs
    const posts = data.data
      .filter(post => {
        const caption = post.message || '';
        return post.full_picture &&
          caption.length <= MAX_CAPTION_LENGTH &&
          !LINK_PATTERN.test(caption);
      })
      .slice(0, 10)
      .map(post => ({
        image: post.full_picture,
        caption: post.message || '',
        link: post.permalink_url,
        date: post.created_time
      }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};