/* Theme system. settings.theme picks an entry in THEMES; the entry decides
   logo, hero fallback link and decorations. Colors live in /css/themes/*.css. */

// One logo for every theme (the owner's decision); settings.logo_override can still replace it.
const LOGO = 'assets/logo/christmas-logo.jpg';

const THEMES = {
  default:   { logo: LOGO, decorations: [] },
  christmas: { logo: LOGO, decorations: ['snowfall'] },
  valentine: { logo: LOGO, decorations: ['hearts'] }, // placeholder until Phase 7
};

/** Apply the theme from settings. Returns the resolved theme object. */
export function applyTheme(settings) {
  const name = THEMES[settings.theme] ? settings.theme : 'default';
  document.documentElement.setAttribute('data-theme', name);
  try { localStorage.setItem('kubik_theme', name); } catch { /* ignore */ }
  const cfg = THEMES[name];
  return { name, decorations: cfg.decorations, logo: settings.logo_override || cfg.logo };
}

/** Load and start the theme's decoration modules (lazy, so default theme ships none). */
export async function startDecorations(theme) {
  for (const mod of theme.decorations) {
    try { (await import(`./decorations/${mod}.js`)).start(); } catch (e) { console.warn('Decoration failed:', mod, e); }
  }
}
