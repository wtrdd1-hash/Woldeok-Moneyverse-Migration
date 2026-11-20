/* Shared chrome does not send messages or persist member information. */
(function () {
  'use strict';
  function start() {
    const launcher = document.getElementById('mv-support-launcher');
    const panel = document.getElementById('mv-support-panel');
    const close = document.getElementById('mv-support-close');
    const hasSupportDialog = Boolean(launcher && panel && close);
    let previousFocus = null;
    if (hasSupportDialog) launcher.addEventListener('click', () => {
      previousFocus = document.activeElement;
      if (!panel.open) panel.showModal();
      close.focus();
    });
    if (hasSupportDialog) close.addEventListener('click', () => panel.close());
    if (hasSupportDialog) panel.addEventListener('close', () => {
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
      else launcher.focus();
    });
    const menuToggle=document.getElementById('mobile-menu-toggle');
    const menuClose=document.getElementById('mobile-menu-close');
    const drawer=document.getElementById('mobile-menu');
    const backdrop=document.getElementById('drawer-backdrop');
    function menu(open) {
      if(!drawer||!backdrop||!menuToggle)return;
      drawer.hidden=!open;backdrop.hidden=!open;
      menuToggle.setAttribute('aria-expanded',String(open));
      menuToggle.setAttribute('aria-label',window.MV39Locale.tx(open?'close':'menu'));
      if(open)menuClose.focus();else menuToggle.focus();
    }
    if(menuToggle)menuToggle.addEventListener('click',()=>menu(true));
    if(menuClose)menuClose.addEventListener('click',()=>menu(false));
    if(backdrop)backdrop.addEventListener('click',()=>menu(false));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&drawer&&!drawer.hidden)menu(false);});
    if(drawer)drawer.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>menu(false)));
    const selector=document.getElementById('language-selector');
    if(selector)selector.addEventListener('change',event=>window.MV39Locale.setPreference(event.target.value));
    function localize() {
      const locale = window.MV39Locale;
      if (!locale) return;
      if(selector){selector.value=locale.preference();selector.setAttribute('aria-label',locale.tx('selectLanguage'));}
      if(document.querySelectorAll)document.querySelectorAll('[data-i18n]').forEach(element=>{
        element.textContent=locale.tx(element.dataset.i18n);
      });
      if (hasSupportDialog) {
        launcher.setAttribute('aria-label', locale.tx('support'));
        close.setAttribute('aria-label', locale.tx('close'));
        panel.querySelectorAll('[data-i18n]').forEach(element => {
          element.textContent = locale.tx(element.dataset.i18n);
        });
      }
    }
    window.addEventListener('mv39-language-change', localize);
    localize();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
