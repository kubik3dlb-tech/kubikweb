/* Shared page bootstrap. Every page calls initPage() first, then renders its own content.
   Expects <div id="site-header">, <div id="site-footer"> and <main id="main"> in the HTML. */
import { initI18n, t } from './i18n.js';
import { getSettings, getCollections } from './api.js';
import { applyTheme, startDecorations } from './theme.js';
import { setWaNumber } from './utils.js';
import { renderHeader } from './ui/header.js';
import { renderFooter } from './ui/footer.js';
import { renderWhatsApp } from './ui/whatsapp.js';

export async function initPage() {
  initI18n();

  let settings = {}, collections = [];
  try {
    [settings, collections] = await Promise.all([getSettings(), getCollections()]);
  } catch (e) {
    console.error(e);
    document.getElementById('main').innerHTML = `<div class="container section"><p>${t('common.error')}</p></div>`;
  }

  setWaNumber(settings.whatsapp_number);
  const theme = applyTheme(settings);
  const ctx = { settings, theme, collections };

  renderHeader(document.getElementById('site-header'), ctx);
  renderFooter(document.getElementById('site-footer'), ctx);
  renderWhatsApp();
  startDecorations(theme);
  return ctx;
}
