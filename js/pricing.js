/* Cart pricing helpers. Browser totals are for display only; the server recalculates every order. */
import { isOnSale } from './utils.js';

/** Price of one unit. A chosen bundle ("2 packs") has its own price; otherwise the sale or normal price. */
export function unitPrice(p, variant) {
  const bundle = p.bundles?.find((b) => b.label === variant);
  if (bundle) return bundle.price;
  return isOnSale(p) ? p.sale_price : p.price;
}

/** True when the product's variants match its photos one to one, so customers pick by photo. */
export const picksByPhoto = (p) => p.pick_by_photo && p.variants.length > 0 && p.variants.length === p.images.length;

/** The photo to show for a cart line: the chosen variant's photo, otherwise the product's first photo. */
export function variantImage(p, variant) {
  const i = picksByPhoto(p) ? p.variants.indexOf(variant) : -1;
  return p.images[i] || p.images[0] || 'assets/images/placeholder.svg';
}

/** Join cart rows with product data. Rows whose product is gone are dropped. */
export function cartLines(cart, products) {
  const byId = new Map(products.map((p) => [p.id, p]));
  return cart
    .map((row) => {
      const product = byId.get(row.id);
      if (!product || ['sold_out', 'coming_soon'].includes(product.stock_status)) return null;
      const unit = unitPrice(product, row.variant);
      return { key: `${row.id}|${row.variant || ''}`, product, variant: row.variant || '', qty: row.qty, unit, total: unit * row.qty };
    })
    .filter(Boolean);
}

export const subtotalOf = (lines) => lines.reduce((n, l) => n + l.total, 0);

/** Discount amount for a validated code ({type, value}). Delivery is handled by the caller. */
export function discountAmount(d, subtotal) {
  if (!d) return 0;
  if (d.type === 'percent') return Math.round(subtotal * d.value) / 100;
  if (d.type === 'fixed') return Math.min(d.value, subtotal);
  return 0;
}
