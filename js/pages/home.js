/* Home page. Builds every section from settings, collections and products. */
import { initPage } from '../app.js';
import { getProducts, getReviews } from '../api.js';
import { t, loc } from '../i18n.js';
import { esc, offSeasonSlugs } from '../utils.js';
import { icons } from '../ui/icons.js';
import { productCard, bindProductCards } from '../ui/productCard.js';
import { initReveal } from '../ui/reveal.js';

const HERO_FALLBACK_IMG = { christmas: 'assets/images/village-portfolio.jpg' };
const arrow = '<span class="arr" aria-hidden="true">→</span>';

/* ---- Sections ---- */

/** Settings override the theme's built-in hero copy; empty settings fall back to it. */
function hero({ settings, theme }) {
  const k = theme.name;
  const title = loc(settings, 'hero_title') || t(`hero.${k}.title`);
  const sub = loc(settings, 'hero_subtitle') || t(`hero.${k}.subtitle`);
  const img = settings.hero_image || HERO_FALLBACK_IMG[k] || 'assets/images/hero-default.svg';
  const link = settings.hero_cta_link || t(`hero.${k}.link`);
  return `
  <section class="hero">
    <div class="container hero__inner">
      <div>
        <span class="eyebrow">${esc(t(`hero.${k}.eyebrow`))}</span>
        <h1>${esc(title)}</h1>
        <p class="hero__sub">${esc(sub)}</p>
        <div class="hero__cta">
          <a class="btn" href="${esc(link)}">${esc(t(`hero.${k}.cta`))}</a>
          <a class="btn btn--outline" href="shop.html">${esc(t('common.shop_all'))}</a>
        </div>
      </div>
      <div class="hero__media"><img src="${esc(img)}" alt="${esc(t(`hero.${k}.alt`))}" width="1170" height="771" fetchpriority="high"></div>
    </div>
  </section>`;
}

/** Seasonal deadline strip: only on a seasonal theme and only while the date is in the future. */
function countdown({ settings, theme }) {
  const text = loc(settings, 'order_deadline_text');
  if (theme.name === 'default' || !text) return '';
  return `<div class="strip" role="note"><strong>${esc(text)}</strong><span class="strip__count" data-deadline="${esc(settings.order_deadline_date || '')}" hidden></span></div>`;
}

function startCountdown(root) {
  const el = root.querySelector('[data-deadline]');
  if (!el || !el.dataset.deadline) return;
  const end = new Date(`${el.dataset.deadline}T23:59:59`).getTime();
  const tick = () => {
    const ms = end - Date.now();
    if (!(ms > 0)) { el.closest('.strip').hidden = true; return; }
    el.textContent = t('countdown.left', { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24 });
    el.hidden = false;
  };
  tick();
  setInterval(tick, 60000);
}

/** Active seasonal collection, pinned first on Home. */
function seasonal({ collections, theme }, products) {
  const c = collections.find((x) => x.seasonal && x.slug === theme.name);
  if (!c) return '';
  const items = products.filter((p) => p.collections.includes(c.slug)).slice(0, 8);
  if (!items.length) return '';
  return `
  <section class="section seasonal" aria-labelledby="seasonal-title">
    <div class="container">
      <div class="section__head">
        <div><h2 id="seasonal-title">${esc(loc(c, 'name'))}</h2><p>${esc(loc(c, 'description'))}</p></div>
        <a class="link-arrow" href="collection.html?c=${encodeURIComponent(c.slug)}">${esc(t('home.collection_cta'))} ${arrow}</a>
      </div>
      <div class="grid-products">${items.map(productCard).join('')}</div>
    </div>
  </section>`;
}

function collectionTiles({ collections, theme }) {
  const tiles = collections
    .filter((c) => !c.seasonal || c.slug === theme.name)
    .map((c) => `
      <a class="tile" href="collection.html?c=${encodeURIComponent(c.slug)}">
        <img src="${esc(c.image)}" alt="" loading="lazy" width="800" height="600">
        <span class="tile__label">${esc(loc(c, 'name'))}</span>
      </a>`).join('');
  return `
  <section class="section section--beige" aria-labelledby="tiles-title">
    <div class="container">
      <div class="section__head"><h2 id="tiles-title">${esc(t('home.collections'))}</h2></div>
      <div class="tiles">${tiles}</div>
    </div>
  </section>`;
}

function bestSellers(products, hidden) {
  const items = products
    .filter((p) => (p.badge === 'BEST_SELLER' || p.featured) && p.stock_status !== 'coming_soon')
    .filter((p) => !p.collections.some((s) => hidden.has(s)))
    .slice(0, 8);
  if (!items.length) return '';
  return `
  <section class="section" aria-labelledby="best-title">
    <div class="container">
      <div class="section__head">
        <div><h2 id="best-title">${esc(t('home.bestsellers'))}</h2><p>${esc(t('home.bestsellers_sub'))}</p></div>
        <a class="link-arrow" href="shop.html">${esc(t('common.view_all'))} ${arrow}</a>
      </div>
      <div class="grid-products">${items.map(productCard).join('')}</div>
    </div>
  </section>`;
}

const howItWorks = () => `
  <section class="section" style="padding-top:0" aria-labelledby="how-title">
    <div class="container">
      <div class="section__head"><h2 id="how-title">${esc(t('how.title'))}</h2></div>
      <ol class="steps" style="list-style:none;margin:0;padding:0">
        ${[1, 2, 3].map((n) => `
        <li class="step"><span class="step__num" aria-hidden="true">${n}</span>
          <h3>${esc(t(`how.${n}.t`))}</h3><p>${esc(t(`how.${n}.p`))}</p></li>`).join('')}
      </ol>
    </div>
  </section>`;

const story = () => `
  <section class="section section--beige">
    <div class="container story">
      <div>
        <span class="eyebrow">${esc(t('story.eyebrow'))}</span>
        <h2>${esc(t('story.title'))}</h2>
        <p>${esc(t('story.p'))}</p>
        <a class="btn btn--outline" href="about.html">${esc(t('story.cta'))}</a>
      </div>
      <div class="story__photos">
        ${['about-who-we-are', 'about-sketch-to-home', 'about-our-story'].map((n) => `<img src="assets/images/${n}.jpg" alt="" loading="lazy" width="800" height="600">`).join('')}
      </div>
    </div>
  </section>`;

const trust = () => `
  <section class="section" aria-label="${esc(t('trust.3.t'))}">
    <div class="container trust">
      ${[['cash', 1], ['truck', 2], ['pin', 3], ['gift', 4]].map(([ic, n]) => `
      <div class="trust__item"><span class="trust__icon">${icons[ic]}</span>
        <h3>${esc(t(`trust.${n}.t`))}</h3><p>${esc(t(`trust.${n}.p`))}</p></div>`).join('')}
    </div>
  </section>`;

/** Customer feedback cards, filled from data/reviews.json (hidden when there are none). */
const reviewsSection = (reviews) => !reviews.length ? '' : `
  <section class="section section--beige" aria-labelledby="rev-title">
    <div class="container">
      <div class="section__head"><div><h2 id="rev-title">${esc(t('reviews.title'))}</h2><p>${esc(t('reviews.sub'))}</p></div></div>
      <div class="reviews">${reviews.slice(0, 6).map((r) => `
        <figure class="review">
          <div class="review__stars" role="img" aria-label="${r.rating} out of 5 stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <blockquote>${esc(r.text)}</blockquote>
          <figcaption><strong>${esc(r.name)}</strong>${r.area ? `, ${esc(r.area)}` : ''}${r.product ? `<span>${esc(r.product)}</span>` : ''}</figcaption>
        </figure>`).join('')}
      </div>
    </div>
  </section>`;

const giftStrip = () => `
  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="gift-panel">
        <div><h2>${esc(t('gift.title'))}</h2><p>${esc(t('gift.p'))}</p></div>
        <a class="btn" href="collection.html?c=gifts">${esc(t('gift.cta'))}</a>
      </div>
    </div>
  </section>`;

function instaStrip({ settings }, products) {
  const url = settings.instagram_url;
  if (!url) return '';
  // Reels come from settings: reel_1_url + reel_1_image ... reel_3_url + reel_3_image.
  // Any reel without both values is skipped; with none set, product photos are shown instead.
  const reels = [1, 2, 3]
    .map((n) => ({ link: settings[`reel_${n}_url`], img: settings[`reel_${n}_image`] }))
    .filter((r) => r.link && r.img);
  const tiles = reels.length
    ? reels.map((r, i) =>
      `<a href="${esc(r.link)}" target="_blank" rel="noopener" aria-label="Watch reel ${i + 1} on Instagram"><img src="${esc(r.img)}" alt="Reel ${i + 1} from our workshop" loading="lazy" width="400" height="500"></a>`).join('')
    : products.slice(0, 3).map((p) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img src="${esc(p.images[0] || '')}" alt="" loading="lazy" width="400" height="500"></a>`).join('');
  return `
  <section class="section section--beige">
    <div class="container">
      <div class="section__head">
        <h2>${esc(t('insta.title'))}</h2>
        <a class="link-arrow" href="${esc(url)}" target="_blank" rel="noopener">${esc(t('insta.cta'))} ${arrow}</a>
      </div>
      <div class="insta${reels.length === 1 ? ' insta--single' : ''}">${tiles}</div>
    </div>
  </section>`;
}

/* ---- Boot ---- */
const ctx = await initPage();
const main = document.getElementById('main');

try {
  const [products, reviews] = await Promise.all([getProducts(), getReviews()]);
  const hidden = offSeasonSlugs(ctx.collections, ctx.theme.name);
  main.innerHTML = [
    hero(ctx), countdown(ctx), seasonal(ctx, products), collectionTiles(ctx),
    bestSellers(products, hidden), howItWorks(), story(), trust(), reviewsSection(reviews), giftStrip(), instaStrip(ctx, products),
  ].join('');
  bindProductCards(main, products);
  startCountdown(main);
  initReveal(main);
} catch (e) {
  console.error(e);
  main.innerHTML = `<div class="container section"><p>${esc(t('common.error'))}</p></div>`;
}
