/* Product catalog: filters (collection, on sale, in stock, price) + sort, synced to the URL.
   Used by the shop page and, with a fixed collection, by collection pages. */
import { loc } from '../i18n.js';
import { esc, isOnSale } from '../utils.js';
import { unitPrice } from '../pricing.js';
import { productCard, bindProductCards } from './productCard.js';
import { initReveal } from './reveal.js';

const PRICE_BANDS = {
  any: ['Any price', () => true],
  u15: ['Under $15', (v) => v < 15],
  mid: ['$15 to $25', (v) => v >= 15 && v <= 25],
  o25: ['Over $25', (v) => v > 25],
};
const SORTS = {
  featured: ['Featured', (a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order],
  newest: ['Newest', (a, b) => String(b.created_at).localeCompare(String(a.created_at))],
  low: ['Price: low to high', (a, b) => unitPrice(a) - unitPrice(b)],
  high: ['Price: high to low', (a, b) => unitPrice(b) - unitPrice(a)],
};
const opts = (map, sel) => Object.entries(map).map(([k, [label]]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${label}</option>`).join('');

export function renderCatalog(root, { products, collections, theme, fixed = null }) {
  const q = new URLSearchParams(location.search);
  const state = {
    c: fixed || q.get('c') || '', sale: q.get('sale') === '1', stock: q.get('stock') === '1',
    price: PRICE_BANDS[q.get('price')] ? q.get('price') : 'any', sort: SORTS[q.get('sort')] ? q.get('sort') : 'featured',
  };
  const visibleCollections = collections.filter((c) => !c.seasonal || c.slug === theme.name || c.slug === state.c);

  root.innerHTML = `
    <form class="filters" role="search" aria-label="Filter products" onsubmit="return false">
      ${fixed ? '' : `<div class="field"><label for="f-c">Collection</label><select class="select" id="f-c">
        <option value="">All collections</option>
        ${visibleCollections.map((c) => `<option value="${esc(c.slug)}"${c.slug === state.c ? ' selected' : ''}>${esc(loc(c, 'name'))}</option>`).join('')}</select></div>`}
      <div class="field"><label for="f-p">Price</label><select class="select" id="f-p">${opts(PRICE_BANDS, state.price)}</select></div>
      <div class="field"><label for="f-s">Sort by</label><select class="select" id="f-s">${opts(SORTS, state.sort)}</select></div>
      <div class="filters__toggles">
        <label class="chip"><input type="checkbox" id="f-sale"${state.sale ? ' checked' : ''}>On sale</label>
        <label class="chip"><input type="checkbox" id="f-stock"${state.stock ? ' checked' : ''}>In stock</label>
      </div>
    </form>
    <p class="catalog__count" aria-live="polite"></p>
    <div class="grid-products" id="grid"></div>`;

  const grid = root.querySelector('#grid');
  const count = root.querySelector('.catalog__count');
  bindProductCards(grid, products);

  function draw(first) {
    const list = products
      .filter((p) => !state.c || p.collections.includes(state.c))
      .filter((p) => !state.sale || isOnSale(p))
      .filter((p) => !state.stock || ['in_stock', 'made_to_order'].includes(p.stock_status))
      .filter((p) => PRICE_BANDS[state.price][1](unitPrice(p)))
      .sort(SORTS[state.sort][1]);
    count.textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
    grid.innerHTML = list.length
      ? list.map(productCard).join('')
      : `<div class="empty" style="grid-column:1/-1"><h2>Nothing matches yet</h2><p>Try removing a filter.</p><button class="btn btn--outline" type="button" id="reset">Clear filters</button></div>`;
    grid.querySelector('#reset')?.addEventListener('click', () => {
      Object.assign(state, { c: fixed || '', sale: false, stock: false, price: 'any' });
      root.querySelector('#f-c') && (root.querySelector('#f-c').value = state.c);
      root.querySelector('#f-p').value = 'any'; root.querySelector('#f-sale').checked = false; root.querySelector('#f-stock').checked = false;
      draw();
    });
    if (first) initReveal(grid);
    const p = new URLSearchParams();
    if (!fixed && state.c) p.set('c', state.c);
    if (fixed) p.set('c', fixed);
    if (state.sale) p.set('sale', '1');
    if (state.stock) p.set('stock', '1');
    if (state.price !== 'any') p.set('price', state.price);
    if (state.sort !== 'featured') p.set('sort', state.sort);
    history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname);
  }

  root.querySelector('#f-c')?.addEventListener('change', (e) => { state.c = e.target.value; draw(); });
  root.querySelector('#f-p').addEventListener('change', (e) => { state.price = e.target.value; draw(); });
  root.querySelector('#f-s').addEventListener('change', (e) => { state.sort = e.target.value; draw(); });
  root.querySelector('#f-sale').addEventListener('change', (e) => { state.sale = e.target.checked; draw(); });
  root.querySelector('#f-stock').addEventListener('change', (e) => { state.stock = e.target.checked; draw(); });
  draw(true);
}
