/* Collection page: ?c=slug. Same catalog as the shop, locked to one collection. */
import { initPage } from '../app.js';
import { getProducts } from '../api.js';
import { loc } from '../i18n.js';
import { esc } from '../utils.js';
import { pageHero, setMeta } from '../ui/pageHero.js';
import { renderCatalog } from '../ui/catalog.js';

const ctx = await initPage();
const main = document.getElementById('main');
const slug = new URLSearchParams(location.search).get('c');
const collection = ctx.collections.find((c) => c.slug === slug);

if (!collection) {
  main.innerHTML = `<div class="container page-body faq-404"><h1>Collection not found</h1><p>It may have ended or moved.</p><a class="btn" href="shop.html">Shop everything</a></div>`;
} else {
  try {
    const products = await getProducts();
    setMeta(loc(collection, 'name'), loc(collection, 'description'));
    main.innerHTML = `${pageHero({
      title: loc(collection, 'name'), subtitle: loc(collection, 'description'), image: collection.image,
      crumbs: [{ label: 'Home', href: 'index.html' }, { label: 'Shop', href: 'shop.html' }, { label: loc(collection, 'name') }],
    })}<div class="container page-body" id="catalog"></div>`;
    renderCatalog(main.querySelector('#catalog'), { products, collections: ctx.collections, theme: ctx.theme, fixed: collection.slug });
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="container page-body"><p>${esc('Something went wrong loading this collection. Please refresh.')}</p></div>`;
  }
}
