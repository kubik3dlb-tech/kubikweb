/* Floating WhatsApp button, shown on every page. */
import { t } from '../i18n.js';
import { waLink } from '../utils.js';
import { icons } from './icons.js';

export function renderWhatsApp() {
  const a = document.createElement('a');
  a.className = 'wa-float';
  a.href = waLink();
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', t('common.wa'));
  a.innerHTML = icons.whatsapp;
  document.body.appendChild(a);
}
