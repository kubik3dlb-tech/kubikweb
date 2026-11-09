/* Classic (non-module) script loaded in <head>. Applies the last known theme
   before first paint to avoid a flash; theme.js then applies the real one from settings. */
(function () {
  try {
    var t = localStorage.getItem('kubik_theme');
    document.documentElement.setAttribute('data-theme', t || 'default');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'default');
  }
})();
