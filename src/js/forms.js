/**
 * ESPAÇO SILVANA LIMA — Form Utils
 */
import { createWhatsAppURL } from './whatsapp.js';

export function initForms() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset errors
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.setAttribute('aria-invalid', 'false');
      el.removeAttribute('aria-describedby');
    });
    const policyInput = document.getElementById('form-policy');
    policyInput?.setAttribute('aria-invalid', 'false');
    policyInput?.removeAttribute('aria-describedby');

    let hasError = false;

    // Validate Name
    const nameInput = document.getElementById('form-name');
    if (!nameInput.value.trim()) {
      showError(nameInput, "Por favor, informe seu nome.");
      hasError = true;
    }

    // Validate Interest
    const interestInput = document.getElementById('form-interest');
    if (!interestInput.value) {
      showError(interestInput, "Por favor, selecione um procedimento.");
      hasError = true;
    }

    // Validate Policy
    if (policyInput && !policyInput.checked) {
      showError(policyInput, 'Você precisa aceitar a política de privacidade.', policyInput.parentElement);
      hasError = true;
    }

    if (hasError) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    // Build message
    const name = nameInput.value.trim();
    const interest = interestInput.options ? interestInput.options[interestInput.selectedIndex].text : interestInput.value;
    const period = document.getElementById('form-period')?.value || '';
    const message = document.getElementById('form-message')?.value.trim() || '';

    let text = `Olá! Meu nome é *${name}* e tenho interesse em *${interest}*.`;
    if (period) {
      text += `\n\nTenho preferência por atendimento no período da *${period}*.`;
    }
    if (message) {
      text += `\n\nMinha mensagem:\n"${message}"`;
    }

    // Open WhatsApp
    const url = createWhatsAppURL(text);
    
    // Provide feedback
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.disabled = true;
    window.location.assign(url);
  });

  function showError(inputEl, msg, container = inputEl.parentElement) {
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.id = `form-error-${inputEl.id}`;
    errorEl.textContent = msg;
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.setAttribute('aria-describedby', errorEl.id);
    container.appendChild(errorEl);
  }
}
