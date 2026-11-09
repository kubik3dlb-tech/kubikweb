/* Shop: every product with filters and sort. */
import { initPage } from '../app.js';
import { getProducts } from '../api.js';
import { pageHero } from '../ui/pageHero.js';
import { renderCatalog } from '../ui/catalog.js';

const ctx = await initPage();
const main = document.getElementById('main');
try {
  const products = await getProducts();
  main.innerHTML = `${pageHero({ title: 'Shop', subtitle: 'Everything we design and print in Lebanon.' })}<div class="container page-body" id="catalog"></div>`;
  renderCatalog(main.querySelector('#catalog'), { products, collections: ctx.collections, theme: ctx.theme });
} catch (e) {
  console.error(e);
  main.innerHTML = '<div class="container page-body"><p>Something went wrong loading the shop. Please refresh.</p></div>';
}
