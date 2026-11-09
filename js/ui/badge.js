/* Product badges: sale percentage + the sheet's badge value. */
import { t } from '../i18n.js';
import { esc } from '../utils.js';

const CODES = ['NEW', 'BEST_SELLER', 'LIMITED', 'GIFT_IDEA', 'BACK_IN_STOCK'];

export const saleBadge = (pct) => `<span class="badge badge--sale">-${esc(pct)}%</span>`;

/** type: NEW | BEST_SELLER | LIMITED | GIFT_IDEA | BACK_IN_STOCK */
export function badge(type) {
  if (!type) return '';
  const cls = type === 'GIFT_IDEA' ? ' badge--gift' : '';
  // Known codes are translated; free text (e.g. "Save $3") is shown as written.
  const label = CODES.includes(type) ? t(`badge.${type}`) : type;
  return `<span class="badge${cls}">${esc(label)}</span>`;
}
