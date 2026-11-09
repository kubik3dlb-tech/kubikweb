/* Checkout: guest, single page. Validates, shows a live total, submits once. */
import { initPage } from '../app.js';
import { getProducts, submitOrder, validateDiscount } from '../api.js';
import { loc } from '../i18n.js';
import { esc, money, normalizeLebPhone } from '../utils.js';
import { getCart, clearCart } from '../cart.js';
import { cartLines, subtotalOf, discountAmount } from '../pricing.js';
import { pageHero } from '../ui/pageHero.js';
import { icons } from '../ui/icons.js';

const ctx = await initPage();
const main = document.getElementById('main');
const { settings } = ctx;

let products = [];
try { products = await getProducts(); } catch (e) { console.error(e); }
const lines = cartLines(getCart(), products);

if (!lines.length) {
  main.innerHTML = `${pageHero({ title: 'Checkout' })}<div class="container page-body"><div class="empty"><h2>Your cart is empty</h2><p>Add something first, then come back to check out.</p><a class="btn" href="shop.html">Start shopping</a></div></div>`;
} else {
  const areas = settings.delivery_areas || {};
  const state = { area: '', discount: null, submitting: false, key: (crypto.randomUUID?.() || String(Date.now() + Math.random())) };
  const subtotal = subtotalOf(lines);

  const field = ({ id, label, type = 'text', optional = false, hint = '', attrs = '', tag = 'input', full = false }) => `
    <div class="field" data-field="${id}"${full ? ' style="grid-column:1/-1"' : ''}>
      <label for="${id}">${label}${optional ? ' <span class="opt">(optional)</span>' : ''}</label>
      ${tag === 'textarea' ? `<textarea class="textarea" id="${id}" name="${id}" ${attrs}></textarea>` : `<input class="input" id="${id}" name="${id}" type="${type}" ${attrs}>`}
      ${hint ? `<span class="field__hint" id="${id}-hint">${hint}</span>` : ''}
      <span class="field__error" id="${id}-err" role="alert"></span>
    </div>`;

  main.innerHTML = `${pageHero({ title: 'Checkout', subtitle: 'No account needed. Pay cash on delivery.' })}
  <div class="container page-body"><div class="checkout">
    <form id="co" novalidate>
      <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>

      <section class="co-section"><h2><span class="num">1</span>Your details</h2>
        <div class="form-grid form-grid--2">
          ${field({ id: 'name', label: 'Full name', attrs: 'autocomplete="name" required' })}
          ${field({ id: 'phone', label: 'Phone', type: 'tel', attrs: 'autocomplete="tel" inputmode="tel" placeholder="71 804 746" required', hint: 'Lebanese number, we confirm your order on WhatsApp.' })}
          ${field({ id: 'email', label: 'Email', type: 'email', optional: true, attrs: 'autocomplete="email"', full: true, hint: 'For an order confirmation email.' })}
        </div>
        <div class="notice">${icons.info}<span><strong>Ordering from abroad?</strong> Switch on "This is a gift" below and enter your family member's details. We deliver to them in Lebanon, and we will message you on WhatsApp.</span></div>
      </section>

      <section class="co-section"><h2><span class="num">2</span>Delivery</h2>
        <div class="field" data-field="area"><label for="area">Area</label>
          <select class="select" id="area" name="area" required>
            <option value="">Choose your area</option>
            ${Object.keys(areas).map((a) => `<option value="${esc(a)}">${esc(a)}</option>`).join('')}
          </select><span class="field__error" id="area-err" role="alert"></span></div>
        ${field({ id: 'address', label: 'Address', attrs: 'autocomplete="street-address" required', hint: 'Street, neighborhood, nearest landmark.' })}
        ${field({ id: 'building', label: 'Building and floor', optional: true })}
        ${field({ id: 'note', label: 'Order note', optional: true, tag: 'textarea' })}
      </section>

      <section class="co-section"><h2><span class="num">3</span>Gift</h2>
        <label class="switch"><span><strong>This is a gift</strong><br><span class="field__hint">We deliver to the recipient, gift-ready.</span></span>
          <input type="checkbox" id="gift" name="gift"><span class="switch__track" aria-hidden="true"></span></label>
        <div class="gift-fields" id="gift-fields" hidden>
          <div class="form-grid form-grid--2">
            ${field({ id: 'gift_name', label: 'Recipient name' })}
            ${field({ id: 'gift_phone', label: 'Recipient phone', type: 'tel', attrs: 'inputmode="tel"' })}
          </div>
          ${field({ id: 'gift_message', label: 'Gift message', optional: true, tag: 'textarea' })}
          <label class="check"><input type="checkbox" id="hide_prices" name="hide_prices" checked>Hide prices in the package</label>
        </div>
      </section>

      <section class="co-section"><h2><span class="num">4</span>Payment</h2>
        <div class="pay-option">${icons.cash}<div><strong>Cash on delivery</strong><span>Pay in cash when your order arrives.</span></div></div>
      </section>

      <div id="form-error" class="notice notice--error" role="alert" hidden></div>
      <button class="btn btn--block" type="submit" id="place" style="margin-top:var(--space-4)">Place order</button>
    </form>

    <aside class="summary" aria-label="Order summary">
      <h2>Order summary</h2>
      <div class="summary__items">${lines.map((l) => `<div class="summary__item"><span>${l.qty} &times; ${esc(loc(l.product, 'name'))}${l.variant ? ` (${esc(l.variant)})` : ''}</span><span>${money(l.total)}</span></div>`).join('')}</div>
      <div class="field" style="margin:var(--space-4) 0 0"><label for="code">Discount code</label>
        <div class="coupon"><input class="input" id="code" autocomplete="off" aria-describedby="coupon-msg"><button class="btn btn--outline btn--sm" type="button" id="apply">Apply</button></div>
        <div class="coupon-msg" id="coupon-msg" role="status"></div></div>
      <div id="totals"></div>
      <p class="field__hint" style="margin:var(--space-3) 0 0">By placing your order you agree we may contact you on WhatsApp to confirm it.</p>
    </aside>
  </div></div>`;

  const $ = (s) => main.querySelector(s);
  const form = $('#co');

  /* ---- Totals ---- */
  const deliveryFee = () => {
    if (!state.area) return null;
    if (state.discount?.type === 'free_delivery') return 0;
    return Number(areas[state.area] ?? settings.delivery_fee_default ?? 0);
  };
  function drawTotals() {
    const disc = discountAmount(state.discount, subtotal);
    const fee = deliveryFee();
    const total = subtotal - disc + (fee || 0);
    $('#totals').innerHTML = `
      <div class="summary__row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
      ${disc ? `<div class="summary__row summary__row--discount"><span>Discount</span><span>-${money(disc)}</span></div>` : ''}
      <div class="summary__row"><span>Delivery</span><span>${fee === null ? 'Choose your area' : fee === 0 ? 'Free' : money(fee)}</span></div>
      <div class="summary__row summary__row--total"><span>Total</span><span>${money(total)}</span></div>`;
    return { disc, fee, total };
  }
  drawTotals();

  /* ---- Interactions ---- */
  $('#area').addEventListener('change', (e) => { state.area = e.target.value; drawTotals(); });
  $('#gift').addEventListener('change', (e) => { $('#gift-fields').hidden = !e.target.checked; });

  const msg = $('#coupon-msg');
  async function applyCode() {
    const code = $('#code').value.trim();
    if (!code) return;
    msg.className = 'coupon-msg'; msg.textContent = 'Checking…';
    try {
      const res = await validateDiscount(code, subtotal);
      if (!res.ok) throw new Error(res.error || 'This code is not valid.');
      state.discount = res;
      msg.className = 'coupon-msg ok'; msg.textContent = `Code ${res.code} applied.`;
    } catch (err) {
      state.discount = null;
      msg.className = 'coupon-msg bad'; msg.textContent = err.message || 'Could not check the code. Try again.';
    }
    drawTotals();
  }
  $('#apply').addEventListener('click', applyCode);
  $('#code').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyCode(); } });

  /* ---- Validation ---- */
  const val = (id) => (form.elements[id]?.value || '').trim();
  function validate() {
    const e = {};
    if (val('name').length < 2) e.name = 'Please enter your full name.';
    if (!normalizeLebPhone(val('phone'))) e.phone = 'Enter a valid Lebanese number, for example 71 804 746.';
    if (val('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) e.email = 'This email does not look right.';
    if (!val('area')) e.area = 'Please choose your area.';
    if (val('address').length < 5) e.address = 'Please enter your address.';
    if (form.elements.gift.checked) {
      if (val('gift_name').length < 2) e.gift_name = 'Please enter the recipient name.';
      if (!normalizeLebPhone(val('gift_phone'))) e.gift_phone = 'Enter a valid Lebanese number for the recipient.';
    }
    return e;
  }
  function showErrors(errs) {
    main.querySelectorAll('.field').forEach((f) => {
      const id = f.dataset.field, m = errs[id];
      f.classList.toggle('has-error', !!m);
      const input = f.querySelector('input, select, textarea');
      if (input) { m ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid'); }
      const out = f.querySelector('.field__error');
      if (out) out.textContent = m || '';
    });
    const first = Object.keys(errs)[0];
    if (first) form.elements[first]?.focus();
  }
  form.addEventListener('input', (ev) => {
    const f = ev.target.closest('.field');
    if (f?.classList.contains('has-error')) { f.classList.remove('has-error'); f.querySelector('.field__error').textContent = ''; }
  });

  /* ---- Submit (once) ---- */
  const btn = $('#place'), formError = $('#form-error');
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (state.submitting) return;
    if (val('website')) return; // honeypot: bots fill the hidden field
    formError.hidden = true;
    const errs = validate();
    showErrors(errs);
    if (Object.keys(errs).length) return;

    state.submitting = true; btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Placing your order…';
    const gift = form.elements.gift.checked;
    const totals = drawTotals();
    const payload = {
      idempotency_key: state.key,
      name: val('name'), phone: normalizeLebPhone(val('phone')), email: val('email'),
      area: val('area'), address: val('address'), building: val('building'), note: val('note'),
      items: lines.map((l) => ({ id: l.product.id, variant: l.variant, qty: l.qty })), // prices are recalculated by the server
      discount_code: state.discount?.code || '',
      payment_method: 'cash_on_delivery',
      gift, gift_name: gift ? val('gift_name') : '', gift_phone: gift ? normalizeLebPhone(val('gift_phone')) : '',
      gift_message: gift ? val('gift_message') : '', hide_prices: gift && form.elements.hide_prices.checked,
      source_page: location.pathname, website: '',
    };
    try {
      const res = await submitOrder(payload);
      if (!res?.ok) throw new Error(res?.error || 'We could not place your order.');
      try {
        sessionStorage.setItem('kubik_last_order', JSON.stringify({
          orderId: res.orderId, name: payload.name, area: payload.area, gift,
          lines: lines.map((l) => ({ name: loc(l.product, 'name'), variant: l.variant, qty: l.qty, total: l.total })),
          subtotal, discount: totals.disc, delivery: totals.fee || 0, total: totals.total,
        }));
      } catch { /* summary page falls back to a generic message */ }
      clearCart();
      location.href = 'thank-you.html';
    } catch (err) {
      console.error(err);
      formError.textContent = `${err.message || 'Something went wrong.'} Please try again, or message us on WhatsApp.`;
      formError.hidden = false;
      state.submitting = false; btn.disabled = false; btn.textContent = 'Place order';
    }
  });
}
