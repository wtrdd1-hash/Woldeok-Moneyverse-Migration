/* Member data and transfer intent remain in memory and are cleared on account changes. */
(function () {
  'use strict';
  const core=window.MV43Wallet,locale=window.MV39Locale;
  if(!core||!locale)return;
  const byId=id=>document.getElementById(id),t=key=>locale.tx(key);
  let session=null,snapshot=null,generation=0,checking=true,result=null,currentFilter='all';
  const form=byId('wallet-transfer-form'),recipient=byId('transfer-to'),amount=byId('transfer-amount');
  const submit=byId('wallet-submit'),status=byId('wallet-status'),rows=byId('wallet-transactions');
  const confirmModal=byId('wallet-transfer-confirm-modal'),receiptModal=byId('wallet-receipt-modal');
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
    const filteredList=(snapshot.transactions||[]).filter(tx=>{
      if(currentFilter==='all')return true;
      const typeStr=(tx.type||'').toUpperCase();
      if(currentFilter==='DEPOSIT') return tx.direction==='debit' || typeStr.includes('DEPOSIT') || typeStr.includes('IN');
      if(currentFilter==='WITHDRAWAL') return tx.direction==='credit' || typeStr.includes('WITHDRAW') || typeStr.includes('TRANSFER') || typeStr.includes('OUT');
      if(currentFilter==='REWARD') return typeStr.includes('REWARD') || typeStr.includes('SALARY') || typeStr.includes('QUEST');
      if(currentFilter==='INTEREST') return typeStr.includes('INTEREST') || typeStr.includes('DIVIDEND');
      return true;
    });

    if(filteredList.length===0) {
      const row=node('tr'),cell=node('td',t('empty'),'wallet-empty');cell.colSpan=5;row.appendChild(cell);rows.appendChild(row);
    }
    filteredList.forEach(transaction=>{
      const incoming=transaction.direction==='debit',row=node('tr');
      row.appendChild(node('td',date(transaction.createdAt)));
      row.appendChild(node('td',transaction.type==='TRANSFER'?t('walletTransfer'):transaction.type||t('unavailable')));
      row.appendChild(node('td',(incoming?'+':'−')+core.formatMoney(transaction.amount,locale.current()),incoming?'wallet-positive':'wallet-negative'));
      row.appendChild(node('td',t(incoming?'walletIn':'walletOut')));
      const idCell=node('td',transaction.id?transaction.id.slice(0,12):t('unavailable'));
      idCell.title=transaction.id;
      idCell.style.cursor='pointer';
      idCell.style.color='#818cf8';
      idCell.style.textDecoration='underline';
      idCell.addEventListener('click',()=>{
        if(!receiptModal)return;
        byId('receipt-modal-id').textContent=transaction.id||'—';
        byId('receipt-modal-date').textContent=date(transaction.createdAt);
        byId('receipt-modal-type').textContent=transaction.type||'—';
        byId('receipt-modal-amount').textContent=(incoming?'+':'−')+core.formatMoney(transaction.amount,locale.current())+' WLD';
        byId('receipt-modal-amount').style.color=incoming?'#10b981':'#f43f5e';
        if(typeof receiptModal.showModal==='function') receiptModal.showModal();
        else receiptModal.style.display='block';
      });
      row.appendChild(idCell);
      rows.appendChild(row);
    });
    byId('wallet-export').disabled=filteredList.length===0;
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
  // --- 2단계 송금 확인 모달 연동 ---
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(submit.disabled||checking)return;
    const toId=recipient.value.trim(),amt=amount.value.trim();
    if(!toId||!amt)return;
    if(confirmModal){
      byId('confirm-recipient-id').textContent=toId;
      byId('confirm-transfer-amount').textContent=core.formatMoney(amt,locale.current());
      if(typeof confirmModal.showModal==='function') confirmModal.showModal();
      else confirmModal.style.display='block';
    } else {
      executeTransfer();
    }
  });

  const confirmCancelBtn=byId('wallet-transfer-cancel-btn');
  const confirmCloseBtn=byId('wallet-transfer-confirm-close');
  const confirmExecuteBtn=byId('wallet-transfer-execute-btn');
  function closeConfirmModal(){
    if(!confirmModal)return;
    if(typeof confirmModal.close==='function') confirmModal.close();
    else confirmModal.style.display='none';
  }
  if(confirmCancelBtn)confirmCancelBtn.addEventListener('click',closeConfirmModal);
  if(confirmCloseBtn)confirmCloseBtn.addEventListener('click',closeConfirmModal);
  if(confirmExecuteBtn)confirmExecuteBtn.addEventListener('click',()=>{
    closeConfirmModal();
    executeTransfer();
  });

  async function executeTransfer(){
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
  }

  // --- 거래 내역 탭 필터 이벤트 ---
  document.querySelectorAll('.tx-filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tx-filter-btn').forEach(b=>{
        b.style.background='rgba(255,255,255,0.06)';
        b.style.color='#94a3b8';
        b.classList.remove('active');
      });
      btn.style.background='#4f46e5';
      btn.style.color='#fff';
      btn.classList.add('active');
      currentFilter=btn.dataset.filter||'all';
      renderData();
    });
  });

  // --- 영수증 모달 닫기 이벤트 ---
  const receiptCloseBtn=byId('wallet-receipt-close');
  const receiptOkBtn=byId('receipt-modal-ok');
  function closeReceiptModal(){
    if(!receiptModal)return;
    if(typeof receiptModal.close==='function') receiptModal.close();
    else receiptModal.style.display='none';
  }
  if(receiptCloseBtn)receiptCloseBtn.addEventListener('click',closeReceiptModal);
  if(receiptOkBtn)receiptOkBtn.addEventListener('click',closeReceiptModal);
  document.querySelectorAll('[data-amount]').forEach(button=>button.addEventListener('click',()=>{amount.value=button.dataset.amount;}));
  byId('wallet-all').addEventListener('click',()=>{if(snapshot&&!client.hasPending())amount.value=snapshot.cash;});
  const refreshBtn=byId('wallet-refresh');
  if(refreshBtn){refreshBtn.addEventListener('click',()=>{if(!client.isBusy())load();});}

  // --- Real-time Auto Sync (No manual refresh needed) ---
  setInterval(()=>{if(!document.hidden&&!client.isBusy()&&owner())load();},5000);
  window.addEventListener('message',e=>{if(e.data==='wallet:sync'||e.data==='banking:sync'){if(!client.isBusy())load();}});
  if(window.socket){
    window.socket.on('balance:change',()=>{if(!client.isBusy())load();});
    window.socket.on('ledger:update',()=>{if(!client.isBusy())load();});
  }

  // --- Quick Bank Deposit / Withdraw Modal ---
  const bankModal=byId('wallet-bank-modal');
  const depositBtn=byId('wallet-bank-deposit-btn');
  const withdrawBtn=byId('wallet-bank-withdraw-btn');
  const modalClose=byId('wallet-bank-modal-close');
  const modalTitle=byId('wallet-bank-modal-title');
  const actionTypeInput=byId('wallet-bank-action-type');
  const sourceLabel=byId('wallet-bank-source-label');
  const availableVal=byId('wallet-bank-available-val');
  const quickAmount=byId('wallet-bank-amount');
  const bankMsg=byId('wallet-bank-msg');
  const quickForm=byId('wallet-bank-quick-form');
  const bankSubmit=byId('wallet-bank-submit');

  function openBankModal(type) {
    if(!bankModal)return;
    actionTypeInput.value=type;
    quickAmount.value='';
    bankMsg.textContent='';
    bankMsg.style.color='#f1f5f9';
    if(type==='deposit'){
      modalTitle.textContent='은행에 입금하기';
      sourceLabel.textContent='보유 현금 지갑';
      availableVal.textContent=core.formatMoney(snapshot?snapshot.cash:0,locale.current())+' WLD';
      bankSubmit.textContent='은행으로 즉시 입금';
    } else {
      modalTitle.textContent='은행에서 출금하기';
      sourceLabel.textContent='보유 은행 예치금';
      availableVal.textContent=core.formatMoney(snapshot?snapshot.bank:0,locale.current())+' WLD';
      bankSubmit.textContent='현금 지갑으로 출금';
    }
    if(typeof bankModal.showModal==='function') bankModal.showModal();
    else bankModal.style.display='block';
  }

  if(depositBtn)depositBtn.addEventListener('click',()=>openBankModal('deposit'));
  if(withdrawBtn)withdrawBtn.addEventListener('click',()=>openBankModal('withdraw'));
  if(modalClose)modalClose.addEventListener('click',()=>{
    if(typeof bankModal.close==='function') bankModal.close();
    else bankModal.style.display='none';
  });

  document.querySelectorAll('.wbank-quick-val').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const cur=parseInt(quickAmount.value.replace(/[^0-9]/g,'')||'0',10);
      quickAmount.value=cur+parseInt(btn.dataset.val,10);
    });
  });

  const maxBtn=byId('wbank-max-btn');
  if(maxBtn){
    maxBtn.addEventListener('click',()=>{
      if(!snapshot)return;
      quickAmount.value=actionTypeInput.value==='deposit'?snapshot.cash:snapshot.bank;
    });
  }

  if(quickForm){
    quickForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const type=actionTypeInput.value;
      const amt=quickAmount.value.trim().replace(/[^0-9]/g,'');
      if(!amt||amt==='0'){
        bankMsg.textContent='올바른 금액을 입력하세요.';
        bankMsg.style.color='#ef4444';
        return;
      }
      bankSubmit.disabled=true;
      bankMsg.textContent='처리 중...';
      bankMsg.style.color='#a5b4fc';
      try{
        const url=type==='deposit'?'/api/v1/banking/deposit':'/api/v1/banking/withdraw';
        const res=await fetch(url,{
          method:'POST',
          credentials:'same-origin',
          headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-Token':session?session.csrfToken:''},
          body:JSON.stringify({amount:amt})
        });
        const d=await res.json();
        if(!res.ok||d.success===false){
          throw new Error(d.message||d.error||'처리에 실패했습니다.');
        }
        bankMsg.textContent='성공적으로 처리되었습니다!';
        bankMsg.style.color='#10b981';
        setTimeout(()=>{
          if(typeof bankModal.close==='function') bankModal.close();
          else bankModal.style.display='none';
          load();
        },600);
      }catch(err){
        bankMsg.textContent=err.message;
        bankMsg.style.color='#ef4444';
      }finally{
        bankSubmit.disabled=false;
      }
    });
  }
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
