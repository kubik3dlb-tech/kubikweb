/* About: our story. */
import { initPage } from '../app.js';
import { pageHero } from '../ui/pageHero.js';
import { initReveal } from '../ui/reveal.js';

await initPage();
const main = document.getElementById('main');

main.innerHTML = `${pageHero({ title: 'Our story', subtitle: 'Designed and printed, layer by layer, in Lebanon.', image: 'assets/images/about-our-story.jpg' })}
<section class="section">
  <div class="container split">
    <div>
      <span class="eyebrow">Who we are</span>
      <h2>A small studio that makes everything itself</h2>
      <p>KUBIK 3D is a Lebanese brand. We design our products, print them on our own machines and finish them by hand, so every piece you receive comes straight from our studio to your door.</p>
      <p>There are no middlemen and no imports. That is how we keep the quality high, the details thoughtful and the prices fair.</p>
    </div>
    <div class="split__media"><img src="assets/images/about-who-we-are.jpg" alt="3D printers and finished pieces in a small studio" loading="lazy" width="800" height="600"></div>
  </div>
</section>
<section class="section section--beige">
  <div class="container split split--flip">
    <div>
      <span class="eyebrow">How we work</span>
      <h2>From a sketch to your home</h2>
      <p>Each piece starts as a drawing, becomes a 3D model, and is tested and refined before we print it. Then it is cleaned, checked and packed gift-ready.</p>
      <p>Because we print in small batches, we can also make custom pieces: photo ornaments, personalised gifts, and designs for events and businesses.</p>
      <a class="btn" href="contact.html">Ask about a custom order</a>
    </div>
    <div class="split__media"><img src="assets/images/about-sketch-to-home.jpg" alt="A sketch, a half-printed piece and the finished piece beside a gift box" loading="lazy" width="800" height="600"></div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section__head"><h2>What we care about</h2></div>
    <div class="values">
      <div class="value"><h3>Made in Lebanon</h3><p>Designed, printed and finished locally, supporting local work.</p></div>
      <div class="value"><h3>Made with care</h3><p>Every piece is checked by hand before it leaves the studio.</p></div>
      <div class="value"><h3>Made to be given</h3><p>Gift-ready packaging, personal messages, and no prices in the box when you ask.</p></div>
    </div>
  </div>
</section>`;
initReveal(main);
