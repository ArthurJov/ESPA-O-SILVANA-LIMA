/**
 * ESPAÇO SILVANA LIMA — WhatsApp Utils
 */
import { siteData } from './site-content.js';

/**
 * Creates a WhatsApp API URL with a pre-filled message.
 * @param {string} message - The message to encode
 * @returns {string} The formatted URL
 */
export function createWhatsAppURL(message = "Olá! Vim pelo site do Espaço Silvana Lima e gostaria de agendar uma avaliação.") {
  const number = siteData.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Sets up all WhatsApp links on the page based on their data-wa-context attribute.
 */
export function initWhatsAppLinks() {
  const links = document.querySelectorAll('[data-wa-link]');
  
  links.forEach(link => {
    const context = link.getAttribute('data-wa-context');
    let msg = "Olá! Vim pelo site do Espaço Silvana Lima e gostaria de agendar uma avaliação.";
    
    if (context) {
      msg = `Olá! Vim pelo site do Espaço Silvana Lima e gostaria de saber mais sobre ${context}.`;
    }

    link.href = createWhatsAppURL(msg);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}
