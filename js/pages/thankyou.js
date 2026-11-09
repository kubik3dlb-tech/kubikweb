/* Thank-you page: shows the order saved by checkout in sessionStorage. */
import { initPage } from '../app.js';
import { esc, money, waLink } from '../utils.js';
import { icons } from '../ui/icons.js';

await initPage();
const main = document.getElementById('main');

let order = null;
try { order = JSON.parse(sessionStorage.getItem('kubik_last_order')); } catch { /* none */ }

const mark = `<div class="thanks__mark">${icons.check}</div>`;

if (!order) {
  main.innerHTML = `<div class="container page-body"><div class="thanks">${mark}<h1>Thank you</h1>
    <p>If you just placed an order, we will message you on WhatsApp to confirm it.</p>
    <div class="thanks__actions"><a class="btn" href="shop.html">Keep shopping</a><a class="btn btn--outline" href="${esc(waLink('Hi KUBIK 3D, I have a question about my order.'))}" target="_blank" rel="noopener">${icons.whatsapp}WhatsApp us</a></div></div></div>`;
} else {
  main.innerHTML = `
  <div class="container page-body"><div class="thanks">
    ${mark}
    <h1>Thank you, ${esc(order.name.split(' ')[0])}!</h1>
    <p>Your order is in. We will message you on WhatsApp to confirm it.</p>
    <div class="thanks__num">Order ${esc(order.orderId)}</div>
    <aside class="summary" aria-label="Order summary">
      <div class="summary__items">${order.lines.map((l) => `<div class="summary__item"><span>${l.qty} &times; ${esc(l.name)}${l.variant ? ` (${esc(l.variant)})` : ''}</span><span>${money(l.total)}</span></div>`).join('')}</div>
      <div class="summary__row"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
      ${order.discount ? `<div class="summary__row summary__row--discount"><span>Discount</span><span>-${money(order.discount)}</span></div>` : ''}
      <div class="summary__row"><span>Delivery (${esc(order.area)})</span><span>${order.delivery ? money(order.delivery) : 'Free'}</span></div>
      <div class="summary__row summary__row--total"><span>Total, cash on delivery</span><span>${money(order.total)}</span></div>
    </aside>
    <div class="thanks__actions">
      <a class="btn" href="${esc(waLink(`Hi KUBIK 3D, my order number is ${order.orderId}.`))}" target="_blank" rel="noopener">${icons.whatsapp}Message us on WhatsApp</a>
      <a class="btn btn--outline" href="shop.html">Keep shopping</a>
    </div>
  </div></div>`;
}
