/* Private source, drafts and caller keys live only in this document's memory. */
(function () {
  'use strict';
  const core=window.MV43Messaging,locale=window.MV39Locale,byId=id=>document.getElementById(id);
  const root=byId('messaging-root');if(!root||!core||!locale)return;
  const kind=root.dataset.kind,support=kind==='support',t=key=>locale.tx(key),privateView=byId('messaging-private');
  const list=byId('messaging-list'),history=byId('message-history'),body=byId('message-body'),form=byId('message-form');
  const subject=byId('support-subject'),newBody=byId('support-body'),newForm=byId('new-thread-form');
  let session=null,rows=null,selected=null,historyRows=null,summary=null,unread=null,epoch=0,privateEpoch=0,checking=true;
  let message='loading',outcome=null,pendingKind=null,historyState='msgSelect',filters={};
  const readers={session:core.createReader({fetch}),list:core.createReader({fetch}),
    history:core.createReader({fetch}),summary:core.createReader({fetch})};
  const owner=()=>core.uuid(session&&session.user&&session.user.id);
  const client=core.createClient({owner,uuid:()=>window.crypto.randomUUID(),fetch,
    accountChanged:()=>resetPrivate()});
  function node(tag,text) {
    const value=document.createElement(tag);if(text!==undefined)value.textContent=text;return value;
  }
  function abortReads(){Object.values(readers).forEach(reader=>reader.clear());}
  function resetPrivate() {
    epoch++;privateEpoch++;abortReads();client.clear();session=null;rows=null;selected=null;historyRows=null;summary=null;unread=null;
    outcome=null;pendingKind=null;filters={};body.value='';if(newBody)newBody.value='';if(subject)subject.value='';
    for(const id of ['support-search','support-status','support-order','support-date-from','support-date-to','chat-search'])if(byId(id))byId(id).value='';
    privateView.hidden=true;list.replaceChildren();history.replaceChildren();byId('message-heading').textContent=t('msgHistory');
    if(byId('support-counts'))byId('support-counts').textContent='—';
    if(byId('chat-unread'))byId('chat-unread').textContent='—';
    historyState='msgSelect';message='msgAuth';renderControls();renderAccount();
  }
  function ready(){return !checking&&rows!==null&&owner()&&session&&typeof session.csrfToken==='string'&&session.csrfToken.length>0;}
  function renderControls() {
    const usable=ready(),locked=client.isBusy()||client.hasPending();
    body.disabled=!usable||!selected||historyRows===null||locked;
    const send=byId('message-send');
    send.disabled=!usable||!selected||historyRows===null||client.isBusy()||(client.hasPending()&&pendingKind==='thread');
    send.textContent=t(client.isBusy()?'msgSending':client.hasPending()&&pendingKind!=='thread'?'msgRetry':'msgSend');
    if(newForm) {
      subject.disabled=!usable||locked;newBody.disabled=!usable||locked;
      byId('support-start').disabled=!usable||client.isBusy()||(client.hasPending()&&pendingKind!=='thread');
      byId('support-start').textContent=t(client.isBusy()?'msgSending':client.hasPending()&&pendingKind==='thread'?'msgRetry':'msgStart');
      newForm.setAttribute('aria-busy',String(client.isBusy()));
      byId('support-body-count').textContent=new Intl.NumberFormat(locale.current()).format([...newBody.value].length)+' / '+new Intl.NumberFormat(locale.current()).format(1000);
    }
    byId('message-body-count').textContent=new Intl.NumberFormat(locale.current()).format([...body.value].length)+' / '+new Intl.NumberFormat(locale.current()).format(1000);
    form.setAttribute('aria-busy',String(client.isBusy()));
    byId('messaging-refresh').disabled=client.isBusy();
    byId('messaging-status').textContent=t(message);
    const result=byId('messaging-result');result.textContent=outcome?t(outcome.key)+(outcome.id?' · '+t('msgReceipt')+': '+outcome.id:''):'';
    if(support)for(const id of ['support-export-csv','support-export-txt'])byId(id).disabled=!usable||!historyRows||client.isBusy();
  }
  function formatDate(raw) {
    const value=new Date(raw);return new Intl.DateTimeFormat(locale.current(),{dateStyle:'medium',timeStyle:'short'}).format(value);
  }
  function statusLabel(value){return t({open:'msgOpen',waiting_user:'msgWaiting',resolved:'msgResolved'}[value]||'msgSource');}
  function renderHistory() {
    history.replaceChildren();
    const active=rows&&rows.find(row=>row.id===selected);
    byId('message-heading').textContent=active?(support?active.subject:active.peerNickname):t('msgHistory');
    if(!historyRows){history.appendChild(node('p',t(historyState)));return;}
    if(!historyRows.length)history.appendChild(node('p',t('msgEmpty')));
    for(const row of historyRows) {
      const entry=node('article');entry.className='message-entry';entry.dataset.mine=String(row.senderUserId===owner());
      const sender=support?t(row.senderKind==='admin'?'msgAdmin':'msgMe'):row.senderUserId===owner()?t('msgMe'):active.peerNickname;
      entry.append(node('strong',sender),node('p',row.body),node('small',formatDate(row.createdAt)));
      if(!support)entry.appendChild(node('small',t('msgSequence')+': '+row.sequence));
      history.appendChild(entry);
    }
  }
  function filtered() {
    if(!rows)return [];
    if(support)return core.filterThreads(rows,filters);
    const q=byId('chat-search').value.trim().toLocaleLowerCase();
    return rows.filter(row=>!q||row.peerNickname.toLocaleLowerCase().includes(q));
  }
  function renderList() {
    list.replaceChildren();let visible;
    try{visible=filtered();if(support)byId('support-filter-status').textContent='';}
    catch{if(support)byId('support-filter-status').textContent=t('msgDateInvalid');return;}
    if(!visible.length)list.appendChild(node('p',t('msgEmpty')));
    for(const row of visible) {
      const button=node('button');button.type='button';button.setAttribute('aria-current',String(row.id===selected));
      button.disabled=client.isBusy()||client.hasPending();
      button.append(node('strong',support?row.subject:row.peerNickname),
        node('small',support?statusLabel(row.status):t('msgUnread')+': '+new Intl.NumberFormat(locale.current()).format(row.unreadCount)),
        node('small',formatDate(support?row.lastMessageAt:row.updatedAt)));
      if(!support&&row.lastMessage)button.appendChild(node('small',row.lastMessage));
      button.addEventListener('click',()=>select(row.id));
      list.appendChild(button);
    }
  }
  function renderSummary() {
    if(support)byId('support-counts').textContent=summary?
      [t('msgOpen')+': '+new Intl.NumberFormat(locale.current()).format(summary.open),
       t('msgWaiting')+': '+new Intl.NumberFormat(locale.current()).format(summary.waitingUser),
       t('msgResolved')+': '+new Intl.NumberFormat(locale.current()).format(summary.resolved)].join(' · '):t('msgSource');
    else byId('chat-unread').textContent=unread===null?'—':t('msgUnread')+': '+new Intl.NumberFormat(locale.current()).format(unread);
  }
  function renderAccount() {
    const container=byId('auth-actions');if(!container)return;container.replaceChildren();
    const topbar=container.closest('.topbar');if(topbar)topbar.classList.toggle('member-authenticated',Boolean(owner()));
    if(!owner()){const login=node('a',t('login'));login.className='auth-link';login.href='/login?next=%2F'+kind;container.appendChild(login);return;}
    const account=node('a',session.user.displayName||t('account'));account.href='/account';account.className='auth-link auth-profile';account.title=t('account');
    const logout=node('button',t('logout'));logout.type='button';logout.className='auth-logout';
    logout.addEventListener('click',async()=>{
      const proof=session&&session.csrfToken;
      resetPrivate();checking=true;renderControls();
      try {
        const response=await fetch('/api/v1/auth/logout',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'X-CSRF-Token':proof||''}});
        if(!response.ok)throw Error('unconfirmed');
        window.location.assign('/login');
      } catch {message='msgSource';checking=false;renderControls();}
    });
    container.append(account,logout);
  }
  function render() {
    document.title=t(support?'msgSupport':'msgChat')+' · W Moneyverse';
    renderControls();renderList();renderHistory();renderSummary();renderAccount();
  }
  async function privateRead(reader,url,expected,token,current=()=>true) {
    try {
      const data=await reader.get(url,expected);
      if(token!==epoch||owner()!==expected||!current())throw Error('stale');
      // A server stamp binds the DTO under ABA cookie changes; a second proof prevents
      // publishing even correctly stamped old data after the active account changes.
      const fresh=await reader.get('/api/auth/session');
      if(token!==epoch||owner()!==expected||!current())throw Error('stale');
      if(!fresh||fresh.ok!==true||typeof fresh.signedIn!=='boolean')throw Error('source');
      if(!fresh.signedIn||!fresh.user||fresh.user.id!==expected)throw Error('account_changed');
      session=fresh;
      return data;
    } catch(error) {
      if(error.message==='account_changed'&&token===epoch)resetPrivate();
      throw error;
    }
  }
  async function select(id,restore=false) {
    if(!rows||!rows.some(row=>row.id===id)||(!restore&&(client.isBusy()||client.hasPending())))return;
    if(selected!==id)body.value='';
    selected=id;historyRows=null;historyState='loading';if(!restore)outcome=null;
    const token=epoch,expected=owner(),active=rows.find(row=>row.id===id);render();
    try {
      const path='/api/v1/'+(support?'support/threads/':'chat/conversations/')+id+'/messages';
      const data=await privateRead(readers.history,path,expected,token,()=>selected===id);
      if(token!==epoch||selected!==id)return;
      historyRows=core.messages(data,kind,id,expected,support?undefined:active.peerUserId);
    } catch(error) {
      if(token!==epoch||selected!==id||error.message==='stale')return;
      historyRows=null;historyState=error.message==='denied'?'msgDenied':error.message==='auth'?'msgAuth':error.message==='rate'?'msgRate':'msgSource';
      if(error.message==='auth'){resetPrivate();return;}
    }
    renderHistory();renderControls();
  }
  async function load() {
    const previous=owner(),previousSelected=selected,token=++epoch;
    abortReads();checking=true;privateView.hidden=true;rows=null;historyRows=null;summary=null;unread=null;
    list.replaceChildren();history.replaceChildren();message='loading';renderControls();
    try {
      const fresh=await readers.session.get('/api/auth/session');
      if(token!==epoch)return;
      const next=core.uuid(fresh&&fresh.user&&fresh.user.id);
      if(!fresh||fresh.ok!==true||typeof fresh.signedIn!=='boolean')throw Error('source');
      if(!fresh.signedIn||!next){resetPrivate();return;}
      if(previous&&previous!==next){resetPrivate();session=fresh;checking=false;load();return;}
      session=fresh;renderAccount();
      const data=await privateRead(readers.list,'/api/v1/'+(support?'support/threads':'chat/conversations'),next,token);
      if(token!==epoch)return;
      rows=support?core.threads(data,next):core.conversations(data,next);unread=support?null:data.totalUnread;
      checking=false;privateView.hidden=false;message='msgReady';
      if(support) {
        privateRead(readers.summary,'/api/v1/support/threads/summary',next,token).then(data=>{
          if(token!==epoch)return;summary=core.summary(data);renderSummary();
        }).catch(()=>{if(token===epoch){summary=null;renderSummary();}});
      }
      const params=new URLSearchParams(window.location.search);
      const requested=params.get(support?'thread':'conversationId'),peer=params.get('peer');
      const chosen=rows.find(row=>row.id===previousSelected)||rows.find(row=>row.id===requested)
        ||(!support&&core.uuid(peer)?rows.find(row=>row.peerUserId===peer):null)||(support?rows[0]:null);
      selected=chosen&&chosen.id===previousSelected?previousSelected:null;historyState='msgSelect';render();
      // Selection is always derived from an owner-scoped list, never a query id alone.
      if(chosen)await select(chosen.id,true);
    } catch(error) {
      if(token!==epoch||error.message==='stale')return;
      if(error.message==='auth'){resetPrivate();return;}
      rows=null;historyRows=null;message=error.message==='denied'?'msgDenied':error.message==='rate'?'msgRate':'msgSource';
    } finally{if(token===epoch){checking=false;renderControls();}}
  }
  async function submit(event,isNew) {
    event.preventDefault();const button=byId(isNew?'support-start':'message-send');
    if(button.disabled||!ready())return;
    const token=privateEpoch,originalOwner=owner();pendingKind=isNew?'thread':support?'reply':'chat';outcome=null;
    const fields={kind:pendingKind,body:isNew?newBody.value:body.value};
    if(isNew)fields.subject=subject.value;else fields.target=selected;
    const promise=client.submit(fields);renderControls();renderList();
    try {
      const receipt=await promise;if(token!==privateEpoch||owner()!==originalOwner)return;
      if(isNew){subject.value='';newBody.value='';selected=receipt.id;}else body.value='';
      outcome={key:'msgSent',id:receipt.id};pendingKind=null;
      const delivered=outcome;await load();
      if(token!==privateEpoch||owner()!==originalOwner)return;
      if(outcome===null)outcome=delivered;
    } catch(error) {
      if(token!==privateEpoch)return;
      if(error.message==='account_changed'||error.message==='auth'){resetPrivate();return;}
      outcome={key:error.message==='invalid'?'msgInvalid':error.message==='denied'||error.message==='csrf_required'?'msgDenied':error.message==='rate'?'msgRate':'msgUnknown'};
    } finally{renderControls();renderList();}
  }
  form.addEventListener('submit',event=>submit(event,false));
  if(newForm)newForm.addEventListener('submit',event=>submit(event,true));
  body.addEventListener('input',renderControls);if(newBody)newBody.addEventListener('input',renderControls);
  byId('messaging-refresh').addEventListener('click',()=>{if(!client.isBusy())load();});
  if(support) {
    byId('support-filter-form').addEventListener('submit',event=>{
      event.preventDefault();filters={q:byId('support-search').value,status:byId('support-status').value,sort:byId('support-order').value,from:byId('support-date-from').value,to:byId('support-date-to').value};renderList();
    });
    function download(csv) {
      if(!ready()||!historyRows||!selected)return;
      const active=rows.find(row=>row.id===selected);if(!active)return;
      // Prefix every quoted cell so whitespace/control-leading user text cannot become a formula.
      const cell=value=>'"'+("'"+String(value)).replaceAll('"','""')+'"';
      const records=historyRows.map(row=>[active.subject,row.senderKind,row.createdAt,row.body]);
      const content=csv?'\uFEFF'+records.map(row=>row.map(cell).join(',')).join('\r\n'):
        active.subject+'\n\n'+records.map(row=>row[1]+' · '+row[2]+'\n'+row[3]).join('\n\n');
      const url=URL.createObjectURL(new Blob([content],{type:csv?'text/csv;charset=utf-8':'text/plain;charset=utf-8'}));
      const anchor=node('a');anchor.href=url;anchor.download=csv?'support-history.csv':'support-history.txt';
      document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
    }
    byId('support-export-csv').addEventListener('click',()=>download(true));byId('support-export-txt').addEventListener('click',()=>download(false));
  } else {
    byId('chat-search').addEventListener('input',renderList);
    byId('chat-back').addEventListener('click',()=>{
      if(client.hasPending()||client.isBusy())return;
      readers.history.clear();selected=null;historyRows=null;historyState='msgSelect';body.value='';render();byId('chat-search').focus();
    });
  }
  window.addEventListener('mv39-language-change',render);
  window.addEventListener('focus',load);
  window.addEventListener('pageshow',event=>{if(event.persisted)load();});
  window.addEventListener('pagehide',resetPrivate);
  window.addEventListener('beforeunload',event=>{if(client.hasPending()||body.value||(newBody&&newBody.value)){event.preventDefault();event.returnValue='';}});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){epoch++;abortReads();privateView.hidden=true;history.replaceChildren();list.replaceChildren();}
    else load();
  });
  if(support) {
    const query=new URLSearchParams(window.location.search),raw=query.get('q')||'';
    filters={q:raw.length<=80&&!/[\u0000-\u001f\u007f]/.test(raw)?raw.trim():'',
      status:['open','waiting_user','resolved'].includes(query.get('status'))?query.get('status'):'',
      sort:query.get('sort')==='oldest'?'oldest':'',from:query.get('from')||'',to:query.get('to')||''};
    for(const [id,key] of [['support-search','q'],['support-status','status'],['support-order','sort'],['support-date-from','from'],['support-date-to','to']])byId(id).value=filters[key];
  }
  renderControls();load();
})();
