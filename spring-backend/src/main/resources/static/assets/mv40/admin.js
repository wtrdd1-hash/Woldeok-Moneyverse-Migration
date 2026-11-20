/* Native Spring SSR admin shell: no fake data, client-side privileges or financial writes. */
(function(){
  'use strict';
  const locale=window.MV39Locale;
  if(!locale)return;
  const $=id=>document.getElementById(id);
  const select=$('admin-locale');
  function localize(){
    document.documentElement.lang=locale.current();
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      if(el.dataset.i18n)el.textContent=locale.tx(el.dataset.i18n);
    });
    if(select){select.value=locale.preference();select.setAttribute('aria-label',locale.tx('selectLanguage'));}
    document.title=locale.tx('dashboard')+' · Woldeok Moneyverse';
  }
  function menu(open){
    const drawer=$('admin-drawer'), backdrop=$('admin-backdrop'),toggle=$('admin-menu-open');
    if(!drawer||!backdrop||!toggle)return;
    drawer.hidden=!open;backdrop.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('menu-open',open);
    if(open)$('admin-menu-close')?.focus();else toggle.focus();
  }
  function start(){
    if(select)select.addEventListener('change',e=>locale.setPreference(e.target.value));
    window.addEventListener('mv39-language-change',localize);
    $('admin-menu-open')?.addEventListener('click',()=>menu(true));
    $('admin-menu-close')?.addEventListener('click',()=>menu(false));
    $('admin-backdrop')?.addEventListener('click',()=>menu(false));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('admin-drawer')?.hidden)menu(false);});
    $('admin-drawer')?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu(false)));
    localize();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
