/* Cart in localStorage. Stores only {id, variant, qty}; prices are looked up from product data.
   Dispatches "cart:change" on window after every update. */
const KEY = 'kubik_cart';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked: cart is session-less */ }
  window.dispatchEvent(new CustomEvent('cart:change', { detail: { count: count() } }));
}

export const lineKey = (i) => `${i.id}|${i.variant || ''}`;
export const getCart = read;
export const count = () => read().reduce((n, i) => n + i.qty, 0);

export function addItem({ id, variant = '', qty = 1 }) {
  const items = read();
  const found = items.find((i) => lineKey(i) === `${id}|${variant}`);
  if (found) found.qty += qty; else items.push({ id, variant, qty });
  write(items);
}
export function setQty(key, qty) {
  const items = read().map((i) => (lineKey(i) === key ? { ...i, qty } : i)).filter((i) => i.qty > 0);
  write(items);
}
export function removeItem(key) { write(read().filter((i) => lineKey(i) !== key)); }
export function clearCart() { write([]); }
