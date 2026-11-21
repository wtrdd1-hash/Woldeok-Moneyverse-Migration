/* Directory filters navigate to protected tools; they do not execute operations. */
(function () {
  'use strict';
  const fold=value=>String(value||'').normalize('NFKC').toLowerCase();
  function matches(tool,query,category) {
    if(category && category!=='all' && tool.category!==category)return false;
    const source=fold(tool.search);
    return fold(query).trim().split(/\s+/).filter(Boolean).every(word=>source.includes(word));
  }
  window.MV43AdminTools=Object.freeze({matches});
  if(typeof document==='undefined')return;
  function start() {
    const input=document.getElementById('admin-tool-search');
    const category=document.getElementById('admin-tool-category');
    const cards=Array.from(document.querySelectorAll('[data-admin-tool]'));
    const count=document.getElementById('admin-tool-count');
    const empty=document.getElementById('admin-tools-empty');
    if(!input||!category||!count||!empty)return;
    function filter() {
      let visible=0;
      cards.forEach(card=>{
        card.hidden=!matches({category:card.dataset.category,search:card.dataset.search},input.value,category.value);
        if(!card.hidden)visible++;
      });
      count.textContent=visible+' / '+cards.length;
      empty.hidden=visible!==0;
      if(window.MV39Locale)input.setAttribute('placeholder',window.MV39Locale.tx('search'));
    }
    input.addEventListener('input',filter);
    category.addEventListener('change',filter);
    window.addEventListener('mv39-language-change',filter);
    filter();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
