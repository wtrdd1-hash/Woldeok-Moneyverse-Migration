/* Shared chrome does not send messages or persist member information. */
(function () {
  'use strict';
  function start() {
    const launcher = document.getElementById('mv-support-launcher');
    const panel = document.getElementById('mv-support-panel');
    const close = document.getElementById('mv-support-close');
    if (!launcher || !panel || !close) return;
    let previousFocus = null;
    launcher.addEventListener('click', () => {
      previousFocus = document.activeElement;
      if (!panel.open) panel.showModal();
      close.focus();
    });
    close.addEventListener('click', () => panel.close());
    panel.addEventListener('close', () => {
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
      else launcher.focus();
    });
    function localize() {
      const locale = window.MV39Locale;
      if (!locale) return;
      launcher.setAttribute('aria-label', locale.tx('support'));
      close.setAttribute('aria-label', locale.tx('close'));
      panel.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = locale.tx(element.dataset.i18n);
      });
    }
    window.addEventListener('mv39-language-change', localize);
    localize();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
