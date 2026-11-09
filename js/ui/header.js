/* Announcement bar + header (theme logo, nav, collections dropdown, cart). */
import { t, loc } from '../i18n.js';
import { esc } from '../utils.js';
import { icons } from './icons.js';
import { count } from '../cart.js';

export function renderHeader(mount, { settings, theme, collections }) {
  const announcement = loc(settings, 'announcement');
  const visible = collections.filter((c) => !c.seasonal || c.slug === theme.name);
  const dropdown = [
    `<a href="shop.html">${esc(t('nav.all'))}</a>`,
    ...visible.map((c) => `<a href="collection.html?c=${encodeURIComponent(c.slug)}">${esc(loc(c, 'name'))}</a>`),
  ].join('');

  mount.innerHTML = `
    ${announcement ? `<div class="announce">${esc(announcement)}</div>` : ''}
    <header class="site-header">
      <div class="container header__inner">
        <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="${esc(t('nav.menu'))}">${icons.menu}</button>
        <a class="logo" href="index.html" aria-label="KUBIK 3D">
          <img src="${esc(theme.logo)}" alt="KUBIK 3D" width="48" height="48">
        </a>
        <nav class="nav" id="site-nav" aria-label="Main">
          <a href="shop.html">${esc(t('nav.shop'))}</a>
          <div class="has-dropdown">
            <button class="nav__btn" type="button" aria-expanded="false">${esc(t('nav.collections'))}${icons.chevron}</button>
            <div class="dropdown">${dropdown}</div>
          </div>
          <a href="about.html">${esc(t('nav.about'))}</a>
          <a href="contact.html">${esc(t('nav.contact'))}</a>
        </nav>
        <div class="header__actions">
          <a class="icon-btn cart-link" href="cart.html" aria-label="${esc(t('nav.cart'))}">
            ${icons.cart}<span class="cart-count" hidden>0</span>
          </a>
        </div>
      </div>
    </header>`;

  /* Logo falls back to a text wordmark if the image file is missing */
  const img = mount.querySelector('.logo img');
  img.addEventListener('error', () => {
    img.parentElement.innerHTML = '<span class="logo__text">KUBIK 3D</span>';
  }, { once: true });

  /* Mobile menu */
  const nav = mount.querySelector('#site-nav');
  const toggle = mount.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? icons.close : icons.menu;
  });

  /* Collections dropdown */
  const dd = mount.querySelector('.has-dropdown');
  const ddBtn = dd.querySelector('.nav__btn');
  const setDd = (open) => { dd.classList.toggle('is-open', open); ddBtn.setAttribute('aria-expanded', String(open)); };
  ddBtn.addEventListener('click', () => setDd(!dd.classList.contains('is-open')));
  document.addEventListener('click', (e) => { if (!dd.contains(e.target)) setDd(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setDd(false); ddBtn.focus(); } });

  /* Shadow under the header once scrolled */
  const bar = mount.querySelector('.site-header');
  const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Cart count + bump */
  const badge = mount.querySelector('.cart-count');
  const update = (bump) => {
    const n = count();
    badge.textContent = n;
    badge.hidden = n === 0;
    if (bump) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
  };
  update(false);
  window.addEventListener('cart:change', () => update(true));
}
