/* Data layer. Mock JSON files or the Apps Script Web App, switched by CONFIG.USE_MOCK.
   Sheet values arrive as strings, so everything is normalised here once. */
import { CONFIG } from './config.js';

const cache = new Map();

/** Known badge codes are upper-cased; any other text (e.g. "Save $3") is kept as typed. */
const BADGE_CODES = ['NEW', 'BEST_SELLER', 'LIMITED', 'GIFT_IDEA', 'BACK_IN_STOCK'];
const normBadge = (v) => {
  const s = String(v || '').trim();
  return BADGE_CODES.includes(s.toUpperCase()) ? s.toUpperCase() : s;
};
const bool =(v) => v === true || String(v).trim().toUpperCase() === 'TRUE';
const num = (v) => (v === '' || v == null ? 0 : Number(v) || 0);
const list = (v, sep = ',') =>
  Array.isArray(v) ? v : String(v ?? '').split(sep).map((s) => s.trim()).filter(Boolean);

/** Fetch once per page load; a failed fetch is not cached. */
function load(action, mockFile) {
  if (!cache.has(action)) {
    const url = CONFIG.USE_MOCK ? `data/${mockFile}` : `${CONFIG.API_URL}?action=${action}`;
    const p = fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`${action}: HTTP ${r.status}`); return r.json(); })
      .catch((e) => { cache.delete(action); throw e; });
    cache.set(action, p);
  }
  return cache.get(action);
}

const byOrder = (a, b) => a.sort_order - b.sort_order;

export async function getProducts() {
  const raw = await load('products', 'products.json');
  return raw
    .map((p) => ({
      ...p,
      active: bool(p.active),
      featured: bool(p.featured),
      price: num(p.price),
      sale_price: num(p.sale_price),
      lead_time_days: String(p.lead_time_days ?? '').trim(), // text, so ranges like "3–5" work
      sort_order: num(p.sort_order),
      collections: list(p.collections),
      // bundles: "1 pack:7|2 packs:12" → each option has its own price and is chosen like a variant
      bundles: list(p.bundles, '|').map((b) => { const i = b.lastIndexOf(':'); return { label: b.slice(0, i).trim(), price: num(b.slice(i + 1)) }; }).filter((b) => b.label && b.price > 0),
      variants: list(p.bundles, '|').length ? list(p.bundles, '|').map((b) => b.slice(0, b.lastIndexOf(':')).trim()) : list(p.variants, '|'),
      pick_by_photo: bool(p.pick_by_photo), // each variant is chosen by clicking its photo
      images: list(p.images),
      badge: normBadge(p.badge),
      stock_status: p.stock_status || 'in_stock',
      decoration: p.decoration || 'none',
    }))
    .filter((p) => p.active)
    .sort(byOrder);
}

export async function getCollections() {
  const raw = await load('collections', 'collections.json');
  return raw
    .map((c) => ({ ...c, seasonal: bool(c.seasonal), active: bool(c.active), sort_order: num(c.sort_order) }))
    .filter((c) => c.active)
    .sort(byOrder);
}

/** Customer reviews (Reviews tab / reviews.json). Only active rows with a text are returned. */
export async function getReviews() {
  const raw = await load('reviews', 'reviews.json').catch(() => []);
  return raw
    .map((r) => ({ ...r, active: bool(r.active), rating: Math.min(5, Math.max(0, num(r.rating) || 5)), sort_order: num(r.sort_order) }))
    .filter((r) => r.active && String(r.text || '').trim())
    .sort(byOrder);
}

export async function getSettings() {
  const s = await load('settings', 'settings.json');
  let areas = s.delivery_areas;
  if (typeof areas === 'string') { try { areas = JSON.parse(areas); } catch { areas = {}; } }
  return {
    ...s,
    theme: String(s.theme || 'default').trim().toLowerCase(),
    delivery_areas: areas || {},
    delivery_fee_default: num(s.delivery_fee_default),
  };
}

/** Fire-and-forget email alert to the owner when a customer taps "Order on WhatsApp". Never blocks or throws. */
export function notifyOrder(payload) {
  if (CONFIG.USE_MOCK || !CONFIG.API_URL) return;
  post('order_alert', payload).catch(() => {});
}

/* ---- Writes (Phase 3/4). Mock mode simulates success. ---- */
async function post(action, payload) {
  if (CONFIG.USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    if (action !== 'order') return { ok: true };
    let n = 1001;
    try { n = Number(localStorage.getItem('kubik_mock_order') || 1000) + 1; localStorage.setItem('kubik_mock_order', n); } catch { /* ignore */ }
    return { ok: true, orderId: `KBK-${n}` };
  }
  // text/plain avoids a CORS preflight, which Apps Script does not handle
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}
export const submitOrder = (order) => post('order', order);
export const submitInquiry = (inquiry) => post('inquiry', inquiry);

/** Check a discount code. The server is the source of truth; this only drives the on-screen total. */
export async function validateDiscount(code, subtotal) {
  code = String(code || '').trim().toUpperCase();
  if (CONFIG.USE_MOCK) {
    const d = (await load('discounts', 'discounts.json')).find((x) => String(x.code).toUpperCase() === code && bool(x.active));
    if (!d) return { ok: false, error: 'This code is not valid.' };
    if (d.expires && new Date(d.expires) < new Date()) return { ok: false, error: 'This code has expired.' };
    if (subtotal < num(d.min_order)) return { ok: false, error: `This code needs an order of at least $${num(d.min_order)}.` };
    return { ok: true, code, type: d.type, value: num(d.value) };
  }
  return post('discount', { code, subtotal });
}
