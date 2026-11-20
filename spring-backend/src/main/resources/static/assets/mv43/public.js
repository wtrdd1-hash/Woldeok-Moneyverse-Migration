/* Locale presentation only: submitted calculations and editable values remain intact. */
(function () {
  'use strict';
  function start() {
    function localize() {
      const locale=window.MV39Locale;
      if(!locale)return;
      document.querySelectorAll('[data-i18n]').forEach(element=>{
        element.textContent=locale.tx(element.dataset.i18n);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element=>{
        element.setAttribute('placeholder',locale.tx(element.dataset.i18nPlaceholder));
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(element=>{
        element.setAttribute('aria-label',locale.tx(element.dataset.i18nAria));
      });
      document.querySelectorAll('[data-public-format]').forEach(element=>{
        element.textContent=locale.tx(element.dataset.publicFormat)
          .replaceAll('{count}',element.dataset.publicCount||'')
          .replaceAll('{stale}',element.dataset.publicStale||'');
      });
      document.querySelectorAll('input[name="lang"]').forEach(element=>{element.value=locale.current();});
      document.querySelectorAll('[data-public-locale-link]').forEach(element=>{
        const url=new URL(element.getAttribute('href'),'https://public.invalid');
        url.searchParams.set('lang',locale.current());
        element.setAttribute('href',url.pathname+url.search);
      });
      const title=document.querySelector('[data-public-title]');
      if(title)document.title=locale.tx(title.dataset.publicTitle)+' | Woldeok Moneyverse';
    }
    window.addEventListener('mv39-language-change',localize);
    localize();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
