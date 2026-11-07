function insertNavbar() {
  const siteNav = document.getElementById('site-nav');
  if (!siteNav) return;

  siteNav.insertAdjacentHTML('beforeend', `
    <nav class="navbar">
      <a href="index.html" class="logo">
        <img src="assets/images/logo.png" alt="Ceylon Meme Bureau" class="logo-img">
      </a>
      <ul class="nav-links">
        <li><a href="trending.html">Trending</a></li>
        <li><a href="templates.html?category=all">Templates</a></li>
        <li><a href="articles.html">Insights</a></li>
        <li><a href="index.html#submit">Submit</a></li>
        <li><a href="index.html#collab">Advertise</a></li>
        <li><a href="mailto:ceylonmemebureau@gmail.com">Contact Us</a></li>
      </ul>

      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle Navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <div class="nav-overlay" id="nav-overlay"></div>

    <ul class="nav-links-mobile" id="nav-links-mobile">
      <li class="nav-mobile-brand"><span>Menu</span></li>
      <li><a href="trending.html">Trending</a></li>
      <li><a href="templates.html?category=all">Templates</a></li>
      <li><a href="articles.html">Insights</a></li>
      <li><a href="index.html#submit">Submit</a></li>
      <li><a href="index.html#collab">Advertise</a></li>
      <li><a href="mailto:ceylonmemebureau@gmail.com">Contact Us</a></li>
      <li class="nav-mobile-cta"><a href="index.html#submit" class="btn btn--primary">Submit a Meme</a></li>
    </ul>
  `);
}

insertNavbar();
