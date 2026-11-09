/* Product page: ?id=... */
import { initPage } from '../app.js';
import { getProducts } from '../api.js';
import { loc } from '../i18n.js';
import { esc, money, isOnSale, salePercent, waLink } from '../utils.js';
import { unitPrice, picksByPhoto } from '../pricing.js';
import { addItem } from '../cart.js';
import { badge, saleBadge } from '../ui/badge.js';
import { icons } from '../ui/icons.js';
import { galleryHTML, bindGallery } from '../ui/gallery.js';
import { productCard, bindProductCards } from '../ui/productCard.js';
import { initReveal } from '../ui/reveal.js';
import { setMeta } from '../ui/pageHero.js';
import { toast } from '../ui/toast.js';

const ctx = await initPage();
const main = document.getElementById('main');
const id = new URLSearchParams(location.search).get('id');

function notFound() {
  main.innerHTML = `<div class="container page-body faq-404"><h1>Product not found</h1><p>It may no longer be available.</p><a class="btn" href="shop.html">Back to the shop</a></div>`;
}

const accordion = (title, body, open = false) => (body ? `<details${open ? ' open' : ''}><summary>${esc(title)}</summary><div class="acc__body">${body}</div></details>` : '');

try {
  const products = await getProducts();
  const p = products.find((x) => x.id === id);
  if (!p) throw new Error('missing');
  const name = loc(p, 'name');
  setMeta(name, loc(p, 'short'));

  const buyable = ['in_stock', 'made_to_order'].includes(p.stock_status);
  const sale = isOnSale(p);
  const state = { variant: p.variants[0] || '', qty: 1 };
  const priceHTML = !(p.price > 0) ? ''
    : sale
    ?`<span class="price__now price__now--sale">${money(p.sale_price)}</span><span class="price__old">${money(p.price)}</span>`
    : `<span class="price__now">${money(p.price)}</span>`;

  let status = '';
  if (p.stock_status === 'made_to_order' && p.lead_time_days) status = `Made to order. Ships in ${p.lead_time_days} days.`;
  if (p.stock_status === 'coming_soon') status = 'Coming soon';
  if (p.stock_status === 'sold_out') status = 'Sold out for now';

  const byPhoto = buyable && picksByPhoto(p);
  const variantsHTML = byPhoto ? `
    <fieldset class="variant-photos">
      <legend>Choose your piece: <strong id="variant-name" aria-live="polite">${esc(state.variant)}</strong></legend>
      <div class="variant-photos__grid" role="radiogroup">${p.variants.map((v, i) => `<label title="${esc(v)}"><input type="radio" name="variant" value="${esc(v)}"${i ? '' : ' checked'}><img src="${esc(p.images[i])}" alt="${esc(v)}" width="96" height="96" loading="lazy"></label>`).join('')}</div>
    </fieldset>` : p.variants.length && buyable ? `
    <fieldset class="field" style="border:0;padding:0;margin:0 0 var(--space-4)">
      <legend class="label" style="padding:0;margin-bottom:var(--space-2);font-weight:600;font-size:var(--fs-sm)">Option</legend>
      <div class="variants" role="radiogroup">${p.variants.map((v, i) => `<label><input type="radio" name="variant" value="${esc(v)}"${i ? '' : ' checked'}><span>${esc(v)}${p.bundles.length ? ` · ${money(unitPrice(p, v))}` : ''}</span></label>`).join('')}</div>
    </fieldset>` : '';

  const buyHTML = buyable ? `
    <div class="pdp__buy">
      <div class="pdp__row">
        <div class="qty" role="group" aria-label="Quantity">
          <button type="button" data-qty="-1" aria-label="Decrease quantity">&minus;</button>
          <input id="qty" type="number" inputmode="numeric" min="1" max="20" value="1" aria-label="Quantity">
          <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn" type="button" id="add">Add to cart</button>
      </div>
      <a class="btn btn--outline btn--block" id="wa" target="_blank" rel="noopener">${icons.whatsapp}Order on WhatsApp</a>
    </div>` : `
    <div class="pdp__buy">
      ${p.stock_status === 'sold_out' ? '<button class="btn btn--block" type="button" disabled>Sold out</button>' : ''}
      <a class="btn ${p.stock_status === 'sold_out' ? 'btn--outline ' : ''}btn--block" id="wa" target="_blank" rel="noopener">${icons.whatsapp}${p.stock_status === 'coming_soon' ? 'Notify me on WhatsApp' : 'Ask on WhatsApp'}</a>
    </div>`;

  const related = products
    .filter((x) => x.id !== p.id && x.collections.some((c) => p.collections.includes(c)))
    .slice(0, 4);

  main.innerHTML = `
  <div class="container page-body">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / ${esc(name)}</nav>
    <div class="pdp">
      <div>${galleryHTML(p.images, name, p.video_url)}</div>
      <div class="pdp__info">
        <div class="pdp__badges">${sale ? saleBadge(salePercent(p)) : ''}${badge(p.badge)}</div>
        <h1>${esc(name)}</h1>
        <div class="price pdp__price">${priceHTML}</div>
        <p class="pdp__short">${esc(loc(p, 'short'))}</p>
        ${status ? `<p class="pdp__status">${esc(status)}</p>` : ''}
        ${variantsHTML}
        ${buyHTML}
        <p>${esc(loc(p, 'description'))}</p>
        <div class="notice">${icons.gift}<span><strong>Perfect for gifting.</strong> We pack it gift-ready, and you can add a personal message and hide the prices at checkout.</span></div>
        <div class="accordion">
          ${accordion("What's in the box", esc(p.in_the_box), true)}
          ${accordion('Dimensions', esc(p.dimensions))}
          ${accordion('Material', esc(p.material))}
          ${accordion('Care', esc(p.care))}
          ${accordion('Delivery & payment', 'Delivery all over Lebanon, with the fee shown at checkout by area. Pay cash on delivery. We message you on WhatsApp to confirm your order.')}
        </div>
      </div>
    </div>
    ${related.length ? `<section class="related" aria-labelledby="rel"><div class="section__head"><h2 id="rel">You may also like</h2></div><div class="grid-products">${related.map(productCard).join('')}</div></section>` : ''}
  </div>
  ${buyable ? `<div class="buybar"><div class="price">${priceHTML}</div><button class="btn" type="button" id="add-bar">Add to cart</button></div>` : ''}`;

  let onSlide = null; // set below when swiping the gallery should change the chosen piece
  const gallery = bindGallery(main, (i) => onSlide?.(i));
  bindProductCards(main, products);
  initReveal(main);

  /* WhatsApp message follows the chosen option and quantity */
  const wa = main.querySelector('#wa');
  const syncWa = () => {
    const v = state.variant ? ` (${state.variant})` : '';
    const msg = buyable
      ? `Hi KUBIK 3D, I'd like to order: ${state.qty} x ${name}${v} - ${money(unitPrice(p, state.variant) * state.qty)}`
      : p.stock_status === 'coming_soon' ? `Hi KUBIK 3D, please let me know when "${name}" is available.` : `Hi KUBIK 3D, is "${name}" available?`;
    wa.href = waLink(msg);
  };
  syncWa();

  if (buyable) {
    document.body.classList.add('has-buybar');
    const qty = main.querySelector('#qty');
    const setQty = (n) => { state.qty = Math.min(20, Math.max(1, Math.floor(n) || 1)); qty.value = state.qty; syncWa(); };
    main.querySelectorAll('[data-qty]').forEach((b) => b.addEventListener('click', () => setQty(state.qty + Number(b.dataset.qty))));
    qty.addEventListener('change', () => setQty(Number(qty.value)));
    const radios = [...main.querySelectorAll('input[name="variant"]')];
    const choose = (value) => {
      state.variant = value;
      if (byPhoto) main.querySelector('#variant-name').textContent = value;
      if (p.bundles.length) { // the shown price follows the chosen bundle
        const now = `<span class="price__now">${money(unitPrice(p, value))}</span>`;
        main.querySelectorAll('.pdp__price, .buybar .price').forEach((el) => { el.innerHTML = now; });
      }
      syncWa();
    };
    radios.forEach((r, i) => r.addEventListener('change', () => {
      choose(r.value);
      if (byPhoto) gallery?.go(i); // show the clicked piece large
    }));
    if (byPhoto) {
      // Swiping the large photo chooses that piece, so what is shown is always what gets bought.
      onSlide = (i) => { if (radios[i]) { radios[i].checked = true; choose(radios[i].value); } };
    }
    const add = () => { addItem({ id: p.id, variant: state.variant, qty: state.qty }); toast(`Added to cart: ${name}${state.variant ? ` (${state.variant})` : ''}`); };
    main.querySelector('#add').addEventListener('click', add);
    main.querySelector('#add-bar').addEventListener('click', add);
  }
} catch (e) {
  if (e.message !== 'missing') console.error(e);
  notFound();
}
