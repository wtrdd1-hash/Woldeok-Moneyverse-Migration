/* Only verified reads populate the catalog. Financial commands remain server-authorized work. */
(function(){
  'use strict';
  function start(){
    const core=window.MV46AdminShop,byId=id=>document.getElementById(id);
    const grid=byId('admin-shop-catalog'),search=byId('admin-shop-search'),category=byId('admin-shop-category'),refresh=byId('admin-shop-refresh');
    if(!core||!grid||!search||!category||!refresh)return;
    const status=byId('admin-shop-status'),count=byId('admin-shop-count'),dialog=byId('admin-shop-detail'),close=byId('admin-shop-detail-close');
    const t=key=>window.MV39Locale.tx(key),language=()=>window.MV39Locale.current();
    let rows=null,selected=null,previousFocus=null,currentOwner=null,pendingFilters=null,busy=false,epoch=0,statusKey='adminShopLoading';
    function node(tag,className,value){const element=document.createElement(tag);if(className)element.className=className;if(value!==undefined)element.textContent=value;return element;}
    function label(key){const element=node('span','',t(key));element.dataset.i18n=key;return element;}
    function statusText(key){statusKey=key;status.textContent=t(key);status.dataset.i18n=key;}
    function number(value){return new Intl.NumberFormat(language()).format(value);}
    function addField(parent,key,value){const part=node('div');const term=node('dt','',t(key));term.dataset.i18n=key;part.append(term,node('dd','',value));parent.append(part);}
    function detail(row){
      selected=row;byId('admin-shop-detail-title').textContent=row.name;
      byId('admin-shop-detail-description').textContent=row.description;
      const fields=byId('admin-shop-detail-fields');fields.replaceChildren();
      addField(fields,'adminShopCode',row.code);addField(fields,'adminShopCategory',row.category);
      addField(fields,'adminShopPrice',core.formatPrice(row.base_price,language())+' WLD');
      addField(fields,'adminShopStock',row.current_stock===null?t('adminShopUnlimited'):number(row.current_stock));
      addField(fields,'adminShopRarity',row.rarity||'—');addField(fields,'adminShopPurchaseLimit',row.purchase_limit);
      addField(fields,'status',t(row.active?'adminShopActive':'adminShopInactive'));
    }
    function render(){
      grid.replaceChildren();
      if(!rows){count.textContent='';return;}
      const matching=core.filter(rows,search.value,category.value);
      count.textContent=t('adminShopCount')+': '+number(matching.length)+' / '+number(rows.length);
      if(matching.length===0){grid.append(node('p','admin-shop-empty',t(rows.length?'adminShopNoMatch':'adminShopEmpty')));return;}
      for(const row of matching){
        const card=node('article','admin-shop-item'),head=node('div','admin-shop-item-head');
        head.append(node('h3','',row.name),node('span','admin-shop-badge',t(row.active?'adminShopActive':'adminShopInactive')));
        card.append(head,node('p','',row.code+' · '+row.category));
        const fields=node('dl');addField(fields,'adminShopPrice',core.formatPrice(row.base_price,language())+' WLD');
        addField(fields,'adminShopStock',row.current_stock===null?t('adminShopUnlimited'):number(row.current_stock));card.append(fields);
        const button=node('button','admin-refresh',t('adminShopDetails'));button.type='button';button.setAttribute('aria-label',t('adminShopDetails')+' · '+row.name);
        button.addEventListener('click',()=>{previousFocus=button;detail(row);dialog.showModal();close.focus();});card.append(button);grid.append(card);
      }
    }
    function clearDetail(){byId('admin-shop-detail-title').textContent='';byId('admin-shop-detail-description').textContent='';byId('admin-shop-detail-fields').replaceChildren();}
    function forgetFilters(){if(pendingFilters){pendingFilters.owner=null;pendingFilters.query='';pendingFilters.category='';}pendingFilters=null;}
    function clear(){
      forgetFilters();rows=null;selected=null;previousFocus=null;currentOwner=null;grid.replaceChildren();count.textContent='';
      clearDetail();search.value='';search.disabled=true;category.replaceChildren();
      const all=node('option','',t('adminShopAllCategories'));all.value='';category.append(all);category.value='';category.disabled=true;
      if(dialog.open)dialog.close();
    }
    async function load(){
      const current=++epoch,filters={owner:currentOwner,query:search.value,category:category.value};busy=true;refresh.disabled=true;clear();pendingFilters=filters;grid.setAttribute('aria-busy','true');statusText('adminShopLoading');
      try{
        const result=await core.load(window.fetch.bind(window));if(current!==epoch)return;rows=result.items;
        const sameOwner=filters.owner!==null&&filters.owner===result.owner;
        const previous=sameOwner?filters.category:'';if(sameOwner)search.value=filters.query;currentOwner=result.owner;forgetFilters();category.replaceChildren();const all=node('option','',t('adminShopAllCategories'));all.value='';category.append(all);
        for(const value of [...new Set(rows.map(row=>row.category))].sort()){const option=node('option','',value);option.value=value;category.append(option);}
        category.value=[...category.options].some(option=>option.value===previous)?previous:'';
        search.disabled=false;category.disabled=false;statusText('adminShopVerified');render();
      }catch(error){
        if(current!==epoch)return;clear();
        const keys={auth_required:'adminShopSession',access_denied:'adminShopDenied',rate_limited:'adminShopRate',account_changed:'adminShopChanged'};
        statusText(keys[error?.message]||'adminShopUnavailable');
      }finally{if(current===epoch){busy=false;refresh.disabled=false;grid.setAttribute('aria-busy','false');}}
    }
    search.addEventListener('input',render);category.addEventListener('change',render);refresh.addEventListener('click',()=>{if(!busy)load();});
    close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{const target=previousFocus;selected=null;previousFocus=null;clearDetail();if(target?.isConnected)target.focus();else refresh.focus();});
    window.addEventListener('mv39-language-change',()=>{statusText(statusKey);render();if(selected)detail(selected);const all=category.querySelector('option[value=""]');if(all)all.textContent=t('adminShopAllCategories');});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){epoch++;busy=false;clear();refresh.disabled=false;}else load();});
    window.addEventListener('pageshow',event=>{if(event.persisted)load();});
    load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
