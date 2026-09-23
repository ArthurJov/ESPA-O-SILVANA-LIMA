/**
 * ESPAÇO SILVANA LIMA — Main JS Entry
 */
import '../css/main.css';
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initAccordions } from './accordion.js';
import { initGallery } from './gallery.js';
import { initForms } from './forms.js';
import { initWhatsAppLinks } from './whatsapp.js';
import { siteData } from './site-content.js';
import { renderResultsGallery } from './results.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inject dynamic text content (like year, followers)
  injectDynamicContent();
  renderResultsGallery(siteData.results);

  // Initialize modules
  initNavigation();
  initWhatsAppLinks();
  initAccordions();
  initGallery();
  initForms();

  document.querySelectorAll('[data-lucide]').forEach((icon) => {
    if (!icon.hasAttribute('aria-label')) icon.setAttribute('aria-hidden', 'true');
  });
  if (window.lucide) window.lucide.createIcons();
  
  // Init animations last to ensure DOM is ready and styled
  initAnimations();
});

function injectDynamicContent() {
  const currentYear = new Date().getFullYear();
  const yearEls = document.querySelectorAll('.dynamic-year');
  yearEls.forEach(el => el.textContent = currentYear);

  const googleRatingEls = document.querySelectorAll('.dynamic-google-rating');
  googleRatingEls.forEach(el => el.textContent = siteData.socialProof.googleRating || 'A confirmar');

  const googleReviewsEls = document.querySelectorAll('.dynamic-google-reviews');
  googleReviewsEls.forEach(el => el.textContent = siteData.socialProof.googleReviews || 'A confirmar');

  const instaFollowersEls = document.querySelectorAll('.dynamic-insta-followers');
  instaFollowersEls.forEach(el => el.textContent = siteData.socialProof.instagramFollowers || 'A confirmar');

  document.querySelectorAll('[data-site-phone]').forEach(el => { el.textContent = siteData.whatsappDisplay; });
  document.querySelectorAll('[data-site-instagram]').forEach(el => { el.textContent = siteData.instagram; });
  
  // Hide mentoria if disabled
  if (!siteData.features.mentoriaEnabled) {
    document.querySelectorAll('.mentoria-link, .mentoria-section').forEach(el => {
      el.style.display = 'none';
    });
  }
}
