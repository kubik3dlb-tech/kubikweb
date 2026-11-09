/* Cart page: edit quantities, remove items, continue to checkout. */
import { initPage } from '../app.js';
import { getProducts, notifyOrder } from '../api.js';
import { loc } from '../i18n.js';
import { esc, money, waLink, normalizeLebPhone } from '../utils.js';
import { getCart, setQty, removeItem } from '../cart.js';
import { cartLines, subtotalOf, variantImage } from '../pricing.js';
import { pageHero } from '../ui/pageHero.js';

const { settings } = await initPage();
const DELIVERY_FEE = Number(settings.delivery_fee_default ?? 5); // flat fee, paid by the customer
const AREAS = Object.keys(settings.delivery_areas || {});
const feeFor = (area) => Number(settings.delivery_areas?.[area] ?? DELIVERY_FEE);

// Delivery details the customer types in; kept here so they survive cart redraws.
const info = { name: '', phone: '', area: '', address: '', building: '', note: '' };
const main = document.getElementById('main');
let products = [];
try { products = await getProducts(); } catch (e) { console.error(e); }

/** Plain-text order for WhatsApp (and for the email alert). Prices are for display only. */
function orderText(lines, c) {
  const list = lines.map((l) => `- ${l.qty} x ${loc(l.product, 'name')}${l.variant ? ` (${l.variant})` : ''} - ${money(l.total)}`).join('\n');
  const sub = subtotalOf(lines);
  const fee = feeFor(c.area);
  const addr = [c.address, c.building].filter(Boolean).join(', ');
  return `Hi KUBIK 3D, I'd like to order:\n${list}\n\nSubtotal: ${money(sub)}\nDelivery: ${money(fee)}\nTotal: ${money(sub + fee)}\nPayment: cash on delivery\n\nName: ${c.name}\nPhone: ${c.phone}\nArea: ${c.area}\nAddress: ${addr}${c.note ? `\nNote: ${c.note}` : ''}`;
}

/** Returns { field: message } for anything missing or invalid. */
function validate(c) {
  const e = {};
  if (c.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!normalizeLebPhone(c.phone)) e.phone = 'Enter a valid Lebanese number, for example 71 804 746.';
  if (!c.area) e.area = 'Choose your area.';
  if (c.address.trim().length < 4) e.address = 'Please enter your address.';
  return e;
}

const field = (id, label, extra = '', optional = false) => `
  <div class="field"><label for="c-${id}">${label}${optional ? ' <span class="opt">(optional)</span>' : ''}</label>
    <input class="input" id="c-${id}" name="${id}" value="${esc(info[id])}" ${extra}>
    <span class="field__error" id="c-${id}-err" role="alert"></span></div>`;

function draw(focus) {
  const lines = cartLines(getCart(), products);
  if (!lines.length) {
    main.innerHTML = `${pageHero({ title: 'Your cart', image: 'assets/images/cart-banner-photo.jpg', titleOnWall: true })}<div class="container page-body"><div class="empty"><h2>Your cart is empty</h2><p>Find something you love and it will wait for you here.</p><a class="btn" href="shop.html">Start shopping</a></div></div>`;
    return;
  }
  main.innerHTML = `${pageHero({ title: 'Your cart', image: 'assets/images/cart-banner-photo.jpg', titleOnWall: true })}
  <div class="container page-body"><div class="cart">
    <div>${lines.map((l) => `
      <article class="cart-line">
        <a href="product.html?id=${encodeURIComponent(l.product.id)}"><img src="${esc(variantImage(l.product, l.variant))}" alt="${esc(loc(l.product, 'name'))}${l.variant ? `, ${esc(l.variant)}` : ''}" width="88" height="110" loading="lazy"></a>
        <div>
          <div class="cart-line__top">
            <div><h3><a href="product.html?id=${encodeURIComponent(l.product.id)}">${esc(loc(l.product, 'name'))}</a></h3>
              <div class="cart-line__meta">${l.variant ? `${esc(l.variant)} · ` : ''}${money(l.unit)} each</div></div>
            <strong>${money(l.total)}</strong>
          </div>
          <div class="cart-line__bottom">
            <div class="qty" role="group" aria-label="Quantity">
              <button type="button" data-act="minus" data-key="${esc(l.key)}" aria-label="Decrease quantity">&minus;</button>
              <input value="${l.qty}" readonly aria-label="Quantity">
              <button type="button" data-act="plus" data-key="${esc(l.key)}" aria-label="Increase quantity">+</button>
            </div>
            <button class="link-btn" type="button" data-act="remove" data-key="${esc(l.key)}">Remove</button>
          </div>
        </div>
      </article>`).join('')}
      <p style="margin-top:var(--space-5)"><a href="shop.html">&larr; Continue shopping</a></p>
    </div>
    <aside class="summary" aria-label="Order summary">
      <h2>Summary</h2>
      <div class="summary__row"><span>Subtotal</span><strong>${money(subtotalOf(lines))}</strong></div>
      <div class="summary__row"><span>Delivery</span><span>${money(feeFor(info.area))}</span></div>
      <div class="summary__row summary__row--total"><span>Total</span><strong>${money(subtotalOf(lines) + feeFor(info.area))}</strong></div>
      <form id="wa-form" novalidate style="margin-top:var(--space-4)">
        <h3 style="font-size:1rem;margin:0 0 var(--space-3)">Your delivery details</h3>
        ${field('name', 'Full name', 'autocomplete="name" required')}
        ${field('phone', 'Phone', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="71 804 746" required')}
        <div class="field"><label for="c-area">Area</label>
          <select class="select" id="c-area" name="area" required>
            <option value="">Choose your area</option>
            ${AREAS.map((a) => `<option value="${esc(a)}"${a === info.area ? ' selected' : ''}>${esc(a)}</option>`).join('')}
          </select><span class="field__error" id="c-area-err" role="alert"></span></div>
        ${field('address', 'Address', 'autocomplete="street-address" required')}
        ${field('building', 'Building and floor', '', true)}
        ${field('note', 'Note', '', true)}
        <button class="btn btn--block" type="submit" style="margin-top:var(--space-3)">Send order on WhatsApp</button>
      </form>
      <p class="field__hint" style="margin:var(--space-3) 0 0;text-align:center">Pay cash on delivery. No account needed.</p>
    </aside>
  </div></div>`;
  if (focus) [...main.querySelectorAll('[data-act]')].find((b) => b.dataset.act === focus.act && b.dataset.key === focus.key)?.focus();
}

main.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const row = getCart().find((i) => `${i.id}|${i.variant || ''}` === b.dataset.key);
  if (!row) return;
  const focus = { act: b.dataset.act, key: b.dataset.key };
  if (b.dataset.act === 'remove') { removeItem(b.dataset.key); draw(); return; }
  setQty(b.dataset.key, Math.min(20, row.qty + (b.dataset.act === 'plus' ? 1 : -1)));
  draw(b.dataset.act === 'minus' && row.qty <= 1 ? null : focus);
});

// Remember what the customer types, and refresh the delivery fee when the area changes.
main.addEventListener('input', (e) => {
  const el = e.target.closest('#wa-form [name]');
  if (el) info[el.name] = el.value;
});
main.addEventListener('change', (e) => {
  if (e.target.matches('#wa-form [name="area"]')) draw();
});

// Validate, then open WhatsApp with the full order; the email alert fires at the same time.
main.addEventListener('submit', (e) => {
  if (e.target.id !== 'wa-form') return;
  e.preventDefault();
  const errs = validate(info);
  main.querySelectorAll('#wa-form .field__error').forEach((n) => { n.textContent = ''; });
  const first = Object.keys(errs)[0];
  if (first) {
    Object.entries(errs).forEach(([k, msg]) => { main.querySelector(`#c-${k}-err`).textContent = msg; });
    main.querySelector(`#c-${first}`).focus();
    return;
  }
  const lines = cartLines(getCart(), products);
  const text = orderText(lines, info);
  notifyOrder({ text, total: subtotalOf(lines) + feeFor(info.area), customer: { ...info } });
  const win = window.open(waLink(text), '_blank');
  if (win) win.opener = null;
  else location.href = waLink(text); // popup blocked: open WhatsApp in this tab
});

draw();
