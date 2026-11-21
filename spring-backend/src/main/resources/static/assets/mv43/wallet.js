/* Member data and transfer intent remain in memory and are cleared on account changes. */
(function () {
  'use strict';
  const core=window.MV43Wallet,locale=window.MV39Locale;
  if(!core||!locale)return;
  const byId=id=>document.getElementById(id),t=key=>locale.tx(key);
  let session=null,snapshot=null,generation=0,checking=true,result=null;
  const form=byId('wallet-transfer-form'),recipient=byId('transfer-to'),amount=byId('transfer-amount');
  const submit=byId('wallet-submit'),status=byId('wallet-status'),rows=byId('wallet-transactions');
  if(!form||!recipient||!amount||!submit||!status||!rows)return;
  const owner=()=>core.canonicalUserId(session&&session.user&&(session.user.id||session.user.userId));
  const client=core.createTransferClient({
    owner,csrf:()=>session&&session.csrfToken,
    uuid:()=>window.crypto.randomUUID(),
    fetch:(url,options)=>fetch(url,options)
  });
  function node(tag,text,className) {
    const element=document.createElement(tag);
    if(text!==undefined)element.textContent=text;
    if(className)element.className=className;
    return element;
  }
  function resetPrivate() {
    client.clear();snapshot=null;session=null;result=null;
    recipient.value='';amount.value='';rows.replaceChildren();
    for(const id of ['kpi-total-val','kpi-cash-val','kpi-bank-val'])byId(id).textContent='—';
    byId('wallet-export').disabled=true;
  }
  function renderControls() {
    const ready=!checking&&snapshot&&owner()&&session&&typeof session.csrfToken==='string'&&session.csrfToken.length>0;
    const locked=client.isBusy()||client.hasPending();
    recipient.disabled=!ready||locked;amount.disabled=!ready||locked;
    document.querySelectorAll('[data-amount],#wallet-all').forEach(button=>button.disabled=!ready||locked);
    submit.disabled=!ready||client.isBusy();
    submit.textContent=t(client.isBusy()?'walletSending':client.hasPending()?'walletRetry':'walletSubmit');
    form.setAttribute('aria-busy',String(checking||client.isBusy()));
    const message=byId('wallet-transfer-result');
    message.replaceChildren();message.className='';
    if(result) {
      message.textContent=t(result.key)+(result.txId?' '+t('walletReceipt')+': '+result.txId:'');
      if(result.key==='walletDone')message.className='wallet-positive';
      else if(result.key==='walletRejected'||result.key==='walletInvalid')message.className='wallet-negative';
    } else if(!ready&&!checking) {
      message.textContent=t(owner()?'walletCsrfRequired':'walletAuthRequired');
    }
  }
  function date(value) {
    const parsed=new Date(value);
    if(!value||Number.isNaN(parsed.getTime()))return t('unavailable');
    return new Intl.DateTimeFormat(locale.current(),{dateStyle:'medium',timeStyle:'short'}).format(parsed);
  }
  function renderData() {
    document.title=t('walletHero')+' · W Moneyverse';
    rows.replaceChildren();
    if(!snapshot) {
      for(const id of ['kpi-total-val','kpi-cash-val','kpi-bank-val'])byId(id).textContent='—';
      byId('wallet-export').disabled=true;return;
    }
    byId('kpi-total-val').textContent=core.formatMoney(snapshot.total,locale.current());
    byId('kpi-cash-val').textContent=core.formatMoney(snapshot.cash,locale.current());
    byId('kpi-bank-val').textContent=core.formatMoney(snapshot.bank,locale.current());
    if(snapshot.transactions.length===0) {
      const row=node('tr'),cell=node('td',t('empty'),'wallet-empty');cell.colSpan=5;row.appendChild(cell);rows.appendChild(row);
    }
    snapshot.transactions.forEach(transaction=>{
      const incoming=transaction.direction==='debit',row=node('tr');
      row.appendChild(node('td',date(transaction.createdAt)));
      row.appendChild(node('td',transaction.type==='TRANSFER'?t('walletTransfer'):transaction.type||t('unavailable')));
      row.appendChild(node('td',(incoming?'+':'−')+core.formatMoney(transaction.amount,locale.current()),incoming?'wallet-positive':'wallet-negative'));
      row.appendChild(node('td',t(incoming?'walletIn':'walletOut')));
      const id=node('td',transaction.id?transaction.id.slice(0,12):t('unavailable'));id.title=transaction.id;row.appendChild(id);
      rows.appendChild(row);
    });
    byId('wallet-export').disabled=snapshot.transactions.length===0;
  }
  function renderAccount() {
    const container=byId('auth-actions');if(!container)return;
    container.replaceChildren();
    if(!owner()) {
      const login=node('a',t('login'),'auth-link');login.href='/login?next=%2Fwallet';container.appendChild(login);return;
    }
    const account=node('a',session.user.displayName||t('account'),'auth-link');account.href='/account';
    const logout=node('button',t('logout'),'wallet-button');logout.type='button';
    logout.addEventListener('click',async()=>{
      logout.disabled=true;
      try {
        const response=await fetch('/api/v1/auth/logout',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'X-CSRF-Token':session.csrfToken||''}});
        if(!response.ok)throw new Error('logout_unconfirmed');
        generation++;resetPrivate();window.location.assign('/login');
      } catch {status.textContent=t('unavailable');logout.disabled=false;}
    });
    container.append(account,logout);
  }
  async function json(url) {
    const response=await fetch(url,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
    if(!response.ok||!(response.headers.get('content-type')||'').includes('application/json'))throw new Error('source_unverified');
    return response.json();
  }
  async function load() {
    const token=++generation,previous=owner();
    checking=true;snapshot=null;
    // Hide prior account fields while a new cookie may be resolved in another tab.
    form.hidden=true;renderData();renderControls();status.textContent=t('loading');
    try {
      const fresh=await json('/api/v1/auth/session');
      if(token!==generation)return;
      const next=core.canonicalUserId(fresh&&fresh.user&&(fresh.user.id||fresh.user.userId));
      if(!(fresh.signedIn===true||fresh.authenticated===true)||!next){resetPrivate();throw new Error('auth_required');}
      if(previous&&previous!==next)resetPrivate();
      session=fresh;renderAccount();
      const data=await json('/api/v1/wallet/overview');
      if(token!==generation)return;
      snapshot=core.normaliseOverview(data,next);
      status.textContent=t('walletNotice');
    } catch(error) {
      if(token!==generation)return;
      snapshot=null;
      if(error.message==='auth_required'){resetPrivate();status.textContent=t('walletAuthRequired');}
      else status.textContent=t('walletUnknown');
    } finally {
      if(token===generation){checking=false;form.hidden=false;renderData();renderControls();renderAccount();}
    }
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(submit.disabled||checking)return;
    const token=generation;
    result=null;
    const promise=client.submit({recipientUserId:recipient.value.trim(),amountWld:amount.value.trim()});
    renderControls();
    try {
      const receipt=await promise;
      if(token!==generation)return;
      result={key:'walletDone',txId:receipt.txId};recipient.value='';amount.value='';
      await load();
    } catch(error) {
      if(token!==generation)return;
      const keys={auth_required:'walletAuthRequired',account_changed:'walletAuthRequired',csrf_required:'walletCsrfRequired',
        invalid_transfer:'walletInvalid',rejected:'walletRejected',unconfirmed:'walletUnconfirmed',pending_intent:'walletUnconfirmed'};
      result={key:keys[error.code]||'walletUnconfirmed'};
      if(error.code==='account_changed'){resetPrivate();status.textContent=t('walletAuthRequired');}
    } finally {renderControls();}
  });
  document.querySelectorAll('[data-amount]').forEach(button=>button.addEventListener('click',()=>{amount.value=button.dataset.amount;}));
  byId('wallet-all').addEventListener('click',()=>{if(snapshot&&!client.hasPending())amount.value=snapshot.cash;});
  byId('wallet-refresh').addEventListener('click',()=>{if(!client.isBusy())load();});
  byId('wallet-export').addEventListener('click',()=>{
    if(!snapshot)return;
    // CSV cells stay text so spreadsheet import cannot round money or execute formulas.
    const cell=value=>'"'+("'"+String(value)).replaceAll('"','""')+'"';
    const exported=[[t('walletWhen'),t('walletType'),t('walletAmount'),t('walletDirection'),t('walletReceipt')],
      ...snapshot.transactions.map(row=>[date(row.createdAt),row.type,row.amount,t(row.direction==='debit'?'walletIn':'walletOut'),row.id])];
    const blob=new Blob(['\uFEFF'+exported.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),anchor=node('a');anchor.href=url;anchor.download='moneyverse-wallet.csv';
    document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
  });
  window.addEventListener('mv39-language-change',()=>{renderData();renderControls();renderAccount();if(!checking)status.textContent=t(snapshot?'walletNotice':'walletUnknown');});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!client.isBusy())load();});
  window.addEventListener('pageshow',event=>{if(event.persisted)load();});
  window.addEventListener('beforeunload',event=>{if(client.hasPending()){event.preventDefault();event.returnValue='';}});
  load();
})();
