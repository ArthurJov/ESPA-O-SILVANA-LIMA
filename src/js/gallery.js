/**
 * ESPAÇO SILVANA LIMA — Gallery Lightbox
 */

export function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  if (!items.length || !lightbox) return;

  const lbImg = lightbox.querySelector('.lightbox__img');
  const lbClose = lightbox.querySelector('.lightbox__close');
  const html = document.documentElement;

  let lastFocusedElement = null;

  function openLightbox(imgSrc, altText) {
    lastFocusedElement = document.activeElement;
    lbImg.src = imgSrc;
    lbImg.alt = altText;

    lightbox.classList.add('is-active');
    lightbox.setAttribute('aria-hidden', 'false');
    html.classList.add('scroll-locked');
    window.requestAnimationFrame(() => lbClose?.focus());
  }

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    lightbox.setAttribute('aria-hidden', 'true');
    html.classList.remove('scroll-locked');
    lbImg.src = '';
    lastFocusedElement?.focus();
  }

  items.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    
    // Add keyboard support to the item itself if we make it a button or add tabindex
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Ampliar imagem');

    item.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img.src, img.alt);
      }
    });
  });

  lbClose?.addEventListener('click', closeLightbox);
  
  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
      closeLightbox();
      return;
    }

    if (e.key === 'Tab' && lightbox.classList.contains('is-active')) {
      const focusable = [lbClose].filter(Boolean);
      if (!focusable.length) return;
      e.preventDefault();
      focusable[0].focus();
    }
  });
}
