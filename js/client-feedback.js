// CLIENT FEEDBACK DATA
// Edit the review content and photo paths here.
const clientFeedback = [
  {
    name: 'Nimali Perera',
    position: 'Founder, Bloom Boutique',
    rating: 5,
    heading: 'Sales jumped within a week',
    review: 'We promoted our new collection with CMB and the response was incredible. Orders started coming in within days, and the team handled everything professionally from the first message to the final report.',
    photo: 'assets/images/testimonials/client-1.jpg'
  },
  {
    name: 'Kasun Fernando',
    position: 'Marketing Manager, TechNova Lanka',
    rating: 5,
    heading: 'Perfect reach for our launch',
    review: 'CMB gave our app launch exactly the visibility we needed. The post felt natural to their audience, engagement was far above our usual campaigns, and downloads grew noticeably.',
    photo: 'assets/images/testimonials/client-2.jpg'
  },
  {
    name: 'Tharindu Silva',
    position: 'Owner, Urban Brew Cafe',
    rating: 4,
    heading: 'Great engagement, great people',
    review: 'Our cafe was fully booked on the weekend after the promotion went live. Communication was quick and the creative idea was fun and relatable. I would happily work with them again.',
    photo: 'assets/images/testimonials/client-3.jpg'
  },
  {
    name: 'Sanduni Jayawardena',
    position: 'Event Coordinator, Pulse Events',
    rating: 5,
    heading: 'Sold out ticket sales',
    review: 'We needed to reach young audiences fast and CMB delivered. Their promotion helped us sell out early, and they were flexible with timing and content changes.',
    photo: 'assets/images/testimonials/client-4.jpg'
  },
  {
    name: 'Dilshan Rajapaksa',
    position: 'Digital Marketing Executive, Swift Mobile',
    rating: 4,
    heading: 'Professional and results-driven',
    review: 'Clear packages, honest pricing, and on-time delivery. The campaign brought strong reach and a lot of new followers to our page. Highly recommended for local brands.',
    photo: 'assets/images/testimonials/client-5.jpg'
  },
  {
    name: 'Ishara Wickramasinghe',
    position: 'Content Creator',
    rating: 5,
    heading: 'Boosted my channel growth',
    review: 'I promoted my YouTube channel through CMB and saw a real jump in views and subscribers. They understand Sri Lankan internet culture better than anyone.',
    photo: 'assets/images/testimonials/client-6.jpg'
  },
  {
    name: 'Chamath Gunasekara',
    position: 'CEO, FreshCart Online',
    rating: 5,
    heading: 'Best ROI we have had',
    review: 'Compared to other ad channels, our spend with CMB brought far better returns. The audience trusts their content, and that trust carried over to our brand.',
    photo: 'assets/images/testimonials/client-7.jpg'
  }
];

const clientFeedbackTrack = document.getElementById('cf-track');
const starIcon = '<svg class="cf-star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.94 5.95 6.56.95-4.75 4.63 1.12 6.53L12 17.48l-5.87 3.08 1.12-6.53L2.5 9.4l6.56-.95L12 2.5Z"/></svg>';
const quoteIcon = '<svg class="cf-quote" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path d="M20.5 11H10.25A5.25 5.25 0 0 0 5 16.25v10.5A5.25 5.25 0 0 0 10.25 32h6.5A5.25 5.25 0 0 0 22 26.75V20h-8v-3h6.5V11Zm20 0H30.25A5.25 5.25 0 0 0 25 16.25v10.5A5.25 5.25 0 0 0 30.25 32h6.5A5.25 5.25 0 0 0 42 26.75V20h-8v-3h6.5V11Z"/></svg>';
const verifiedIcon = '<svg class="cf-verified" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Verified client"><title>Verified client</title><path d="M12 2.5 14.4 4l2.82-.1 1.16 2.57 2.37 1.53-.48 2.78.48 2.77-2.37 1.54-1.16 2.56-2.82-.1L12 19.5l-2.4-1.85-2.82.1-1.16-2.56-2.37-1.54.48-2.77-.48-2.78L5.62 6.47 6.78 3.9 9.6 4 12 2.5Zm-1.16 12.86 5.9-5.9-1.41-1.42-4.49 4.49-2.08-2.08-1.42 1.41 3.5 3.5Z"/></svg>';

const averageRating = (clientFeedback.reduce((sum, client) => sum + client.rating, 0) / clientFeedback.length).toFixed(1);
document.querySelector('#cf-trust-rating span').textContent = `${averageRating} average rating from our clients`;

function getClientInitials(name) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2);
}

function createClientCard(client, isDuplicate) {
  const card = document.createElement('article');
  card.className = 'cf-card';
  card.setAttribute('aria-label', `${client.name} testimonial`);
  if (isDuplicate) {
    card.setAttribute('aria-hidden', 'true');
  }

  const stars = Array.from({ length: 5 }, (_, index) => {
    return `<span class="${index < client.rating ? 'cf-star' : 'cf-star cf-star--empty'}">${starIcon}</span>`;
  }).join('');

  card.innerHTML = `
    ${quoteIcon}
    <div class="cf-stars" aria-label="Rated ${client.rating} out of 5" role="img">${stars}</div>
    <h3 class="cf-review-heading">${client.heading}</h3>
    <p class="cf-review">${client.review}</p>
    <div class="cf-person">
      <div class="cf-photo-wrap">
        <img class="cf-photo" alt="${client.name}" loading="lazy">
        <span class="cf-initials" aria-hidden="true">${getClientInitials(client.name)}</span>
      </div>
      <div>
        <p class="cf-person-name">${client.name}${verifiedIcon}</p>
        <span class="cf-person-position">${client.position}</span>
      </div>
    </div>
  `;

  const photo = card.querySelector('.cf-photo');
  const initials = card.querySelector('.cf-initials');

  const showPhoto = () => {
    photo.style.display = 'block';
    initials.style.display = 'none';
  };

  const keepInitials = () => {
    photo.style.display = 'none';
    initials.style.display = 'grid';
  };

  photo.addEventListener('load', () => {
    if (photo.naturalWidth > 0) {
      showPhoto();
    } else {
      keepInitials();
    }
  });
  photo.addEventListener('error', keepInitials);
  photo.src = client.photo;

  if (photo.complete) {
    if (photo.naturalWidth > 0) {
      showPhoto();
    } else {
      keepInitials();
    }
  }

  return card;
}

clientFeedback.forEach(client => clientFeedbackTrack.appendChild(createClientCard(client, false)));
clientFeedback.forEach(client => clientFeedbackTrack.appendChild(createClientCard(client, true)));

const clientFeedbackScroll = document.querySelector('.cf-scroll-region');

clientFeedbackScroll.addEventListener('pointerdown', () => {
  clientFeedbackTrack.classList.add('cf-is-paused');
});

clientFeedbackScroll.addEventListener('pointerup', () => {
  clientFeedbackTrack.classList.remove('cf-is-paused');
});

clientFeedbackScroll.addEventListener('pointercancel', () => {
  clientFeedbackTrack.classList.remove('cf-is-paused');
});

clientFeedbackScroll.addEventListener('pointerleave', event => {
  if (event.pointerType === 'mouse') {
    clientFeedbackTrack.classList.remove('cf-is-paused');
  }
});
