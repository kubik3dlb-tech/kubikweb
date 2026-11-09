/* Product card: price/sale, badges, stock states and decoration class. */
import { t, loc } from '../i18n.js';
import { esc, money, isOnSale, salePercent, waLink } from '../utils.js';
import { badge, saleBadge } from './badge.js';
import { addItem } from '../cart.js';
import { toast } from './toast.js';

const PLACEHOLDER = 'assets/images/placeholder.svg';

export function productCard(p) {
  const name = loc(p, 'name');
  const url = `product.html?id=${encodeURIComponent(p.id)}`;
  const sale = isOnSale(p);
  const deco = p.decoration && p.decoration !== 'none' ? ` product-card--${esc(p.decoration)}` : '';

  const price = !(p.price > 0) ? '' // no price yet: only the "Coming soon" label shows
    : sale
    ?`<span class="price__now price__now--sale">${money(p.sale_price)}</span><span class="price__old">${money(p.price)}</span>`
    : `<span class="price__now">${money(p.price)}</span>`;

  let status = '', action;
  switch (p.stock_status) {
    case 'sold_out':
      action = `<a class="btn btn--outline btn--sm btn--block" target="_blank" rel="noopener" href="${esc(waLink(t('card.wa_ask_msg', { name })))}">${esc(t('card.ask_wa'))}</a>`;
      status = t('card.sold_out');
      break;
    case 'coming_soon':
      action = `<a class="btn btn--outline btn--sm btn--block" target="_blank" rel="noopener" href="${esc(waLink(t('card.wa_notify_msg', { name })))}">${esc(t('card.notify_wa'))}</a>`;
      status = t('card.coming_soon');
      break;
    default:
      if (p.stock_status === 'made_to_order' && p.lead_time_days) status = t('card.ships_in', { n: p.lead_time_days });
      action = p.variants.length && !p.bundles.length // bundle products add their first option straight from the card
        ? `<a class="btn btn--outline btn--sm btn--block" href="${url}">${esc(t('card.choose'))}</a>`
        : `<button class="btn btn--sm btn--block" type="button" data-add="${esc(p.id)}">${esc(t('card.add'))}</button>`;
  }

  return `
  <article class="product-card${deco}">
    <a class="product-card__media" href="${url}" tabindex="-1" aria-hidden="true">
      <img src="${esc(p.images[0] || PLACEHOLDER)}" alt="" loading="lazy" width="800" height="1000">
      <span class="product-card__badges">${sale ? saleBadge(salePercent(p)) : ''}${badge(p.badge)}</span>
    </a>
    <div class="product-card__body">
      <h3 class="product-card__title"><a href="${url}">${esc(name)}</a></h3>
      <p class="product-card__short">${esc(loc(p, 'short'))}</p>
      ${status ? `<p class="product-card__status">${esc(status)}</p>` : ''}
      <div class="product-card__foot">
        <div class="price">${price}</div>
        <div class="product-card__action">${action}</div>
      </div>
    </div>
  </article>`;
}

export const skeletonCards = (n = 4) =>
  Array.from({ length: n }, () => '<div class="skeleton skeleton-card" aria-hidden="true"></div>').join('');

/** One delegated listener per container handles every "Add to cart" button inside it. */
export function bindProductCards(root, products) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const p = products.find((x) => x.id === btn.dataset.add);
    if (!p) return;
    addItem({ id: p.id, variant: p.bundles[0]?.label || '', qty: 1 });
    toast(`${t('card.added')}: ${loc(p, 'name')}`);
  });
}
