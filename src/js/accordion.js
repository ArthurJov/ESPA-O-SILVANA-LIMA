/**
 * ESPAÇO SILVANA LIMA — Accordion Utils (FAQ)
 */

export function initAccordions() {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((acc, index) => {
    const header = acc.querySelector('.accordion__header');
    const content = acc.querySelector('.accordion__content');
    const inner = acc.querySelector('.accordion__inner');

    if (!header || !content || !inner) return;

    const contentId = content.id || `accordion-panel-${index + 1}`;
    const headerId = header.id || `accordion-trigger-${index + 1}`;
    content.id = contentId;
    header.id = headerId;
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', headerId);
    header.setAttribute('aria-controls', contentId);

    // Keep collapsed answers out of the accessibility tree as well as out of view.
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    if (!isExpanded) {
      content.style.height = '0px';
      content.setAttribute('aria-hidden', 'true');
    } else {
      content.style.height = inner.getBoundingClientRect().height + 'px';
      content.setAttribute('aria-hidden', 'false');
    }

    header.addEventListener('click', () => {
      const currentlyExpanded = header.getAttribute('aria-expanded') === 'true';
      
      // Close all others
      accordions.forEach(otherAcc => {
        if (otherAcc !== acc) {
          const otherHeader = otherAcc.querySelector('.accordion__header');
          const otherContent = otherAcc.querySelector('.accordion__content');
          if (otherHeader && otherContent) {
            otherHeader.setAttribute('aria-expanded', 'false');
            otherContent.style.height = '0px';
            otherContent.setAttribute('aria-hidden', 'true');
          }
        }
      });

      // Toggle current
      if (currentlyExpanded) {
        header.setAttribute('aria-expanded', 'false');
        content.style.height = '0px';
        content.setAttribute('aria-hidden', 'true');
      } else {
        header.setAttribute('aria-expanded', 'true');
        const height = inner.getBoundingClientRect().height;
        content.style.height = height + 'px';
        content.setAttribute('aria-hidden', 'false');
      }
    });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => {
        if (header.getAttribute('aria-expanded') === 'true') {
          content.style.height = `${inner.getBoundingClientRect().height}px`;
        }
      });
      observer.observe(inner);
    }
  });
}
