/* Footer: collections, help, social, made-in-Lebanon line, payment/delivery chips. */
import { t, loc } from '../i18n.js';
import { esc } from '../utils.js';
import { icons } from './icons.js';

export function renderFooter(mount, { settings, theme, collections }) {
  const links = collections
    .filter((c) => !c.seasonal || c.slug === theme.name)
    .map((c) => `<li><a href="collection.html?c=${encodeURIComponent(c.slug)}">${esc(loc(c, 'name'))}</a></li>`)
    .join('');

  const social = (url, icon, label) =>
    url ? `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${icon}</a>` : '';

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <div class="footer__logo">KUBIK <span>3D</span></div>
            <p>${esc(t('footer.about'))}</p>
            <div class="socials">
              ${social(settings.instagram_url, icons.instagram, 'Instagram')}
              ${social(settings.facebook_url, icons.facebook, 'Facebook')}
              ${social(settings.tiktok_url, icons.tiktok, 'TikTok')}
            </div>
          </div>
          <div>
            <h3>${esc(t('footer.collections'))}</h3>
            <ul>${links}</ul>
          </div>
          <div>
            <h3>${esc(t('footer.help'))}</h3>
            <ul>
              <li><a href="faq.html">${esc(t('footer.faq'))}</a></li>
              <li><a href="faq.html#delivery">${esc(t('footer.delivery'))}</a></li>
              <li><a href="contact.html">${esc(t('footer.contact'))}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <span>${esc(t('footer.made'))} · © ${new Date().getFullYear()} KUBIK 3D. ${esc(t('footer.rights'))}</span>
          <div class="pay-chips">
            <span class="pay-chip">${icons.cash}${esc(t('pay.cod'))}</span>
            <span class="pay-chip">${icons.truck}${esc(t('pay.delivery'))}</span>
          </div>
        </div>
      </div>
    </footer>`;
}
