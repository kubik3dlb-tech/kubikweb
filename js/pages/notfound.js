/* 404 */
import { initPage } from '../app.js';

await initPage();
document.getElementById('main').innerHTML = `
<div class="container faq-404">
  <div class="big" aria-hidden="true">404</div>
  <h1>This page wandered off</h1>
  <p>The link may be old or mistyped. Let's get you back to something beautiful.</p>
  <a class="btn" href="index.html">Back to home</a> <a class="btn btn--outline" href="shop.html">Shop everything</a>
</div>`;
