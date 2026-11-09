/* Site configuration. The only file you edit to go live. */
export const CONFIG = {
  // true  = read /data/*.json mock files
  // false = call the Google Apps Script Web App at API_URL
  USE_MOCK: true,
  API_URL: '', // e.g. https://script.google.com/macros/s/XXXX/exec

  // Used until settings.whatsapp_number loads (digits only, with country code)
  WHATSAPP_NUMBER: '96171804746',

  CURRENCY: { code: 'USD', symbol: '$' },
  DEFAULT_LANG: 'en',

  // Tracking: leave empty to disable
  META_PIXEL_ID: '',
  GA4_ID: '',
};
