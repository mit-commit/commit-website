(function () {
  'use strict';

  function boot() {
    var mount = document.getElementById('pubs-featured');
    if (!mount) return; // nothing to do on this page
    if (!window.PUBS || typeof window.PUBS.loadAndRender !== 'function') {
      // Try again shortly until pubs.js is loaded
      return setTimeout(boot, 0);
    }
    window.PUBS.loadAndRender({
      jsonPath: 'data/publications.json',
      mountFeatured: mount
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
