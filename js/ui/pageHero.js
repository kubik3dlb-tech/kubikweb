/* Page title banner used by inner pages. */
import { esc } from '../utils.js';

export function pageHero({ title, subtitle = '', image = '', crumbs = [], titleOnWall = false }) {
  // titleOnWall: for a photo with empty space on its right, shown with no dark layer and the title placed in that space.
  if (titleOnWall) {
    return `
  <section class="page-hero--photo" style="background-image:url('${esc(image)}')"><h1>${esc(title)}</h1></section>`;
  }
  const trail = crumbs.length
    ? `<nav class="breadcrumb" aria-label="Breadcrumb">${crumbs.map((c) => (c.href ? `<a href="${esc(c.href)}">${esc(c.label)}</a>` : esc(c.label))).join(' / ')}</nav>`
    : '';
  return `
  <section class="page-hero${image ? ' page-hero--image' : ''}"${image ? ` style="background-image:url('${esc(image)}')"` : ''}>
    <div class="container">${trail}<h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
  </section>`;
}

export const setMeta = (title, description) => {
  document.title = `${title} | KUBIK 3D`;
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
};
