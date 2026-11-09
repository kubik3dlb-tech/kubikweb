/* Contact: direct channels + bulk, corporate, event and custom order inquiry form. */
import { initPage } from '../app.js';
import { esc, waLink, formatPhone } from '../utils.js';
import { icons } from '../ui/icons.js';
import { pageHero } from '../ui/pageHero.js';

const { settings } = await initPage();
const main = document.getElementById('main');

const TYPES = ['Company gifts', 'Wedding or favors', 'Event', 'NFC restaurant stands', 'Custom piece', 'Something else'];
const card = (href, icon, title, sub) => (href ? `<a class="contact-card" href="${esc(href)}" target="_blank" rel="noopener">${icon}<div><strong>${title}</strong><span>${esc(sub)}</span></div></a>` : '');

main.innerHTML = `${pageHero({ title: 'Contact', subtitle: 'Questions, custom pieces or a big order? We reply fast.', image: 'assets/images/contact-banner.jpg' })}
<div class="container page-body"><div class="contact-grid">
  <div class="contact-cards">
    ${card(waLink('Hi KUBIK 3D!'), icons.whatsapp, 'WhatsApp', settings.whatsapp_number ? formatPhone(settings.whatsapp_number) : 'Message us')}
    ${card(settings.instagram_url, icons.instagram, 'Instagram', '@kubik3d.lb')}
    ${card(settings.facebook_url, icons.facebook, 'Facebook', 'KUBIK 3D')}
    ${card(settings.tiktok_url, icons.tiktok, 'TikTok', '@kubik3d.lb')}
  </div>
  <div class="form-card">
    <h2>Bulk, corporate and event orders</h2>
    <p class="field__hint" style="margin-bottom:var(--space-5)">Company gifts, weddings, events, NFC restaurant stands or a custom design. Tell us what you need and we will come back with a quote.</p>
    <form id="inq" novalidate>
      <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="form-grid form-grid--2">
        <div class="field" data-field="name"><label for="name">Name</label><input class="input" id="name" name="name" autocomplete="name" required><span class="field__error" role="alert"></span></div>
        <div class="field" data-field="company"><label for="company">Company <span class="opt">(optional)</span></label><input class="input" id="company" name="company" autocomplete="organization"></div>
        <div class="field" data-field="phone"><label for="phone">Phone</label><input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required><span class="field__error" role="alert"></span></div>
        <div class="field" data-field="email"><label for="email">Email <span class="opt">(optional)</span></label><input class="input" id="email" name="email" type="email" autocomplete="email"><span class="field__error" role="alert"></span></div>
      </div>
      <div class="form-grid form-grid--2">
        <div class="field"><label for="type">What is it for?</label><select class="select" id="type" name="type">${TYPES.map((t) => `<option>${t}</option>`).join('')}</select></div>
        <div class="field"><label for="qty">Approx. quantity <span class="opt">(optional)</span></label><input class="input" id="qty" name="quantity" inputmode="numeric"></div>
      </div>
      <div class="field" data-field="message"><label for="message">Details</label><textarea class="textarea" id="message" name="message" required></textarea><span class="field__error" role="alert"></span></div>
      <div id="inq-status" role="status" hidden></div>
      <button class="btn btn--block" type="submit" id="send">${icons.whatsapp}Send request on WhatsApp</button>
    </form>
  </div>
</div></div>`;

const form = main.querySelector('#inq');
const status = main.querySelector('#inq-status');

const setErr = (id, m) => {
  const f = form.querySelector(`[data-field="${id}"]`);
  f.classList.toggle('has-error', !!m);
  f.querySelector('.field__error').textContent = m || '';
};

// Validate, then open WhatsApp with the whole request written out. Nothing is sent anywhere else.
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (form.elements.website.value) return; // spam trap
  const v = (n) => form.elements[n].value.trim();
  const errs = {};
  if (v('name').length < 2) errs.name = 'Please enter your name.';
  const digits = v('phone').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) errs.phone = 'Please enter a phone number we can reach you on.';
  if (v('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) errs.email = 'This email does not look right.';
  if (v('message').length < 10) errs.message = 'Please tell us a little more.';
  ['name', 'phone', 'email', 'message'].forEach((k) => setErr(k, errs[k]));
  const first = Object.keys(errs)[0];
  if (first) { form.elements[first].focus(); return; }

  const details = [
    `Name: ${v('name')}`,
    v('company') && `Company: ${v('company')}`,
    `Phone: ${v('phone')}`,
    v('email') && `Email: ${v('email')}`,
    `For: ${v('type')}`,
    v('quantity') && `Approx. quantity: ${v('quantity')}`,
  ].filter(Boolean).join('\n');
  const text = `Hi KUBIK 3D, I have a request.\n\n${details}\n\n${v('message')}`;
  const win = window.open(waLink(text), '_blank');
  if (win) win.opener = null;
  else location.href = waLink(text); // popup blocked: open WhatsApp in this tab
  status.className = 'notice notice--ok';
  status.innerHTML = `${icons.check}<span>WhatsApp is opening with your request. Press send there and we will reply soon.</span>`;
  status.hidden = false;
});
