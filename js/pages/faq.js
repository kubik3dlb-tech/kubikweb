/* FAQ. Answers are placeholders to confirm with the owner (times, return window). */
import { initPage } from '../app.js';
import { esc } from '../utils.js';
import { pageHero } from '../ui/pageHero.js';

const { settings } = await initPage();
const main = document.getElementById('main');

const fees = Object.entries(settings.delivery_areas || {}).map(([a, f]) => `${a}: $${f}`).join(' · ');

const GROUPS = [
  { id: 'delivery', title: 'Delivery', items: [
    ['Where do you deliver?', 'All over Lebanon. The delivery fee depends on your area and is shown at checkout.' + (fees ? ` Current fees: ${fees}.` : '')],
    ['How long does delivery take?', 'Items in stock are usually delivered within 2 to 4 working days after we confirm your order on WhatsApp.'],
    ['Can I send a gift to someone in Lebanon from abroad?', 'Yes. Order as normal, switch on "This is a gift" and enter the recipient\'s details. You can add a message and we can hide the prices in the package.'],
  ] },
  { id: 'payment', title: 'Payment', items: [
    ['How do I pay?', 'Cash on delivery. You pay when your order arrives. We confirm every order with you on WhatsApp first.'],
    ['Do I need an account?', 'No. Checkout is for guests and only asks for the details we need to deliver.'],
  ] },
  { id: 'made-to-order', title: 'Made to order', items: [
    ['What does "made to order" mean?', 'We print it after you order, for example photo ornaments. The product page shows how many days it takes before it ships.'],
    ['Can you make a custom piece?', 'Often yes. Send us your idea on the contact page or on WhatsApp.'],
  ] },
  { id: 'care', title: 'Care for printed items', items: [
    ['How do I look after my piece?', 'Wipe it with a dry or slightly damp cloth. Keep it away from strong heat and direct sun for long periods, since 3D printed plastic can soften.'],
    ['Are the LED tealights safe?', 'Our lamps use flameless LED tealights. Please never place a real flame inside a printed piece.'],
  ] },
  { id: 'returns', title: 'Returns and damaged items', items: [
    ['What if my order arrives damaged?', 'Message us on WhatsApp within 48 hours with a photo and we will replace it.'],
    ['Can I return an item?', 'Standard items can be exchanged if unused and in their packaging. Made-to-order and personalised pieces cannot be returned unless they arrive damaged.'],
  ] },
];

main.innerHTML = `${pageHero({ title: 'Help and FAQ', subtitle: 'Quick answers about delivery, payment and caring for your pieces.' })}
<div class="container page-body">
  <nav class="faq-nav" aria-label="FAQ sections">${GROUPS.map((g) => `<a class="chip" href="#${g.id}">${esc(g.title)}</a>`).join('')}</nav>
  ${GROUPS.map((g) => `
  <section class="faq-group" id="${g.id}"><h2>${esc(g.title)}</h2>
    <div class="accordion">${g.items.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="acc__body">${esc(a)}</div></details>`).join('')}</div>
  </section>`).join('')}
</div>`;

// Open the section that was linked to (footer "Delivery" link)
if (location.hash) main.querySelector(`#${CSS.escape(location.hash.slice(1))} details`)?.setAttribute('open', '');
