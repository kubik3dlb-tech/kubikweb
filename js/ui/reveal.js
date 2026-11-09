/* Scroll-reveal: fades and lifts elements in as they enter the viewport, staggered per group.
   Skipped for prefers-reduced-motion. Classes are removed after the animation so hover effects stay snappy. */
const SELECTOR = '.section__head, .tile, .step, .trust__item, .story > *, .gift-panel, .product-card, .insta a';

export function initReveal(root = document) {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = [...root.querySelectorAll(SELECTOR)];
  const seen = new Map();
  for (const el of els) {
    const n = seen.get(el.parentElement) || 0;
    seen.set(el.parentElement, n + 1);
    el.style.setProperty('--i', Math.min(n, 6));
    el.classList.add('reveal');
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      io.unobserve(el);
      el.classList.add('is-visible');
      setTimeout(() => el.classList.remove('reveal', 'is-visible'), 1600);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}
