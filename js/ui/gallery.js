/* Swipeable product gallery (CSS scroll-snap) with dots, arrows and optional video. */
import { esc } from '../utils.js';

const PLACEHOLDER = 'assets/images/placeholder.svg';
const chev = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

export function galleryHTML(images, name, videoUrl) {
  const slides = (images.length ? images : [PLACEHOLDER]).map((src, i) =>
    `<div class="gallery__slide"><img src="${esc(src)}" alt="${esc(name)}${images.length > 1 ? ` - photo ${i + 1}` : ''}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="800" height="1000"></div>`);
  if (videoUrl) slides.push(`<div class="gallery__slide"><video src="${esc(videoUrl)}" controls playsinline preload="none" aria-label="${esc(name)} video"></video></div>`);
  return `
  <div class="gallery" data-count="${slides.length}">
    <div class="gallery__track" tabindex="0" aria-label="${esc(name)} photos">${slides.join('')}</div>
    <button class="gallery__nav gallery__nav--prev" type="button" aria-label="Previous photo">${chev('M15 6l-6 6 6 6')}</button>
    <button class="gallery__nav gallery__nav--next" type="button" aria-label="Next photo">${chev('M9 6l6 6-6 6')}</button>
    <div class="gallery__dots">${slides.map((_, i) => `<button type="button" aria-label="Go to photo ${i + 1}" ${i ? '' : 'aria-current="true"'}></button>`).join('')}</div>
  </div>`;
}

/** Wires up one gallery. onChange(index) fires when a different slide settles; returns { go } to move it from outside. */
export function bindGallery(root, onChange) {
  const g = root.querySelector('.gallery');
  if (!g) return null;
  const track = g.querySelector('.gallery__track');
  const dots = [...g.querySelectorAll('.gallery__dots button')];
  const current = () => Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
  let target = null; // slide a programmatic move is heading to; slides passed on the way are ignored
  let shown = 0;
  const go = (i) => {
    target = i === current() ? null : i;
    track.scrollTo({ left: track.clientWidth * i * (getComputedStyle(g).direction === 'rtl' ? -1 : 1), behavior: 'smooth' });
  };
  track.addEventListener('pointerdown', () => { target = null; }, { passive: true }); // the visitor took over
  track.addEventListener('scroll', () => {
    const c = current();
    if (target !== null) {
      if (c !== target) return;
      target = null;
    }
    dots.forEach((d, i) => (i === c ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    if (c !== shown) { shown = c; onChange?.(c); }
  }, { passive: true });
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  g.querySelector('.gallery__nav--prev').addEventListener('click', () => go(Math.max(0, current() - 1)));
  g.querySelector('.gallery__nav--next').addEventListener('click', () => go(Math.min(dots.length - 1, current() + 1)));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(Math.min(dots.length - 1, current() + 1));
    if (e.key === 'ArrowLeft') go(Math.max(0, current() - 1));
  });
  return { go };
}
