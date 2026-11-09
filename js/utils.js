/* Small shared helpers. */
import { CONFIG } from './config.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape text before putting it in innerHTML (data comes from a Sheet). */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** $12 or $12.50 */
export function money(n) {
  const v = Number(n) || 0;
  return CONFIG.CURRENCY.symbol + (Number.isInteger(v) ? v : v.toFixed(2));
}

/** Lebanese phone → "+961XXXXXXXX", or null if it isn't a valid Lebanese number.
 *  Accepts 71 804 746, 071804746, +961 71 804 746, 0096171804746, and landlines. */
export function normalizeLebPhone(input) {
  let d = String(input || '').replace(/[^\d]/g, '');
  if (d.startsWith('00961')) d = d.slice(5);
  else if (d.startsWith('961')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^(3\d{6}|(70|71|76|78|79|81)\d{6}|[1456789]\d{6})$/.test(d) ? `+961${d}` : null;
}

/** "96171804746" → "+961 71 804 746" */
export const formatPhone = (n) => { const d = String(n || '').replace(/\D/g, ''); return d.length === 11 ? `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : `+${d}`; };

export const isOnSale =(p) => p.sale_price > 0 && p.sale_price < p.price;
export const salePercent = (p) => Math.round((1 - p.sale_price / p.price) * 100);

let waNumber = CONFIG.WHATSAPP_NUMBER;
export function setWaNumber(n) {
  const digits = String(n || '').replace(/\D/g, '');
  if (digits) waNumber = digits;
}
/** wa.me link with an optional pre-filled message */
export const waLink = (text = '') =>
  `https://wa.me/${waNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Collections that are seasonal but not the active theme (hidden from curated home sections). */
export function offSeasonSlugs(collections, themeName) {
  return new Set(collections.filter((c) => c.seasonal && c.slug !== themeName).map((c) => c.slug));
}
