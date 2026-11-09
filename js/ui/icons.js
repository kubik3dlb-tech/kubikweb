/* Inline SVG icons (stroke = currentColor). */
const s = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;

export const icons = {
  cart: s('<path d="M3 4h2l2.2 11h10.6L20 7H6.2"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>'),
  menu: s('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: s('<path d="M6 6l12 12M18 6L6 18"/>'),
  check: s('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  info: s('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>'),
  phone: s('<path d="M5 4h4l1.5 4-2 1.500a11 11 0 0 0 5.500 5.500l1.500-2 4 1.500v4c0 1-1 2-2 2C10 21 3 14 3 6c0-1 1-2 2-2z"/>'),
  chevron: s('<path d="M6 9l6 6 6-6"/>'),
  truck: s('<path d="M3 6h11v9H3zM14 9h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>'),
  cash: s('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>'),
  pin: s('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  gift: s('<rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M12 9v12M3 13h18M12 9C9 9 7 7.8 7 6.2S8.4 4 9.8 4C11.4 4 12 6 12 9zm0 0c3 0 5-1.2 5-2.8S15.6 4 14.2 4C12.6 4 12 6 12 9z"/>'),
  instagram: s('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8v.01"/>'),
  facebook: s('<path d="M14 8h2.5V4.5H14a3.5 3.5 0 0 0-3.5 3.5v2H8V13.500h2.500V20H14v-6.500h2.500L17 10h-3V8.500c0-.3.2-.5.5-.5z"/>'),
  tiktok: s('<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.4 2.4 2 3.9 4.5 4.1"/>'),
  whatsapp: s('<path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/><path d="M9 8.8c.3 2.4 2.800 4.800 5.400 5.500l1.200-1.300-1.900-1-.9.8c-.9-.4-1.700-1.300-2.100-2.200l.8-.9-1-1.900z"/>'),
};
