/* Only canonical owner-scoped evidence may complete a pending message intent. */
(function () {
  'use strict';
  const fail=code=>new Error(code);
  const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)?value:null;
  const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value)&&!Number.isNaN(Date.parse(value));
  const count=value=>Number.isInteger(value)&&value>=0&&value<=2147483647;
  function text(raw,maximum,chat) {
    if(typeof raw!=='string'||[...raw].length>maximum)throw fail('invalid');
    for(const char of raw) {
      const code=char.codePointAt(0);
      if(code===0||(code>=0xd800&&code<=0xdfff)||(chat&&(code<32||(code>=127&&code<=159))))throw fail('invalid');
    }
    const normal=raw.replace(/^ +| +$/g,'');
    // Java String.isBlank differs from ECMAScript trim for NBSP, BOM and separators.
    if(/^[\u0009-\u000d\u001c-\u0020\u1680\u2000-\u2006\u2008-\u200a\u2028\u2029\u205f\u3000]*$/.test(normal))throw fail('invalid');
    return normal;
  }
  function thread(row,owner) {
    if(!row||!uuid(row.id)||row.userId!==owner||typeof row.subject!=='string'||!row.subject.trim()
        ||!['open','waiting_user','resolved'].includes(row.status)
        ||!date(row.createdAt)||!date(row.updatedAt)||!date(row.lastMessageAt))throw fail('source');
    return Object.freeze({...row});
  }
  function threads(data,owner) {
    if(!uuid(owner)||!data||data.ok!==true||!Array.isArray(data.threads)||data.threads.length>50
        ||data.totalCount!==data.threads.length)throw fail('source');
    const rows=data.threads.map(row=>thread(row,owner));
    if(new Set(rows.map(row=>row.id)).size!==rows.length)throw fail('source');
    return rows;
  }
  function conversations(data,owner) {
    if(!uuid(owner)||!data||data.ok!==true||!Array.isArray(data.conversations)||data.conversations.length>100||!count(data.totalUnread))throw fail('source');
    const rows=data.conversations.map(row=>{
      if(!row||!uuid(row.id)||!uuid(row.peerUserId)||row.peerUserId===owner||typeof row.peerNickname!=='string'||!row.peerNickname.trim()
          ||(row.lastMessage!=null&&typeof row.lastMessage!=='string')||!count(row.unreadCount)||!date(row.updatedAt))throw fail('source');
      return Object.freeze({...row});
    });
    if(new Set(rows.map(row=>row.id)).size!==rows.length)throw fail('source');
    return rows;
  }
  function sequence(raw) {
    return typeof raw==='string'&&/^[1-9][0-9]{0,18}$/.test(raw)&&BigInt(raw)<=9223372036854775807n;
  }
  function message(row,kind,target,owner,peer) {
    if(!row||!uuid(row.id)||typeof row.body!=='string'||!date(row.createdAt))throw fail('source');
    if(kind==='chat') {
      if(row.conversationId!==target||!uuid(row.senderUserId)||!sequence(row.sequence)
          ||(peer&&row.senderUserId!==owner&&row.senderUserId!==peer))throw fail('source');
    } else if(row.threadId!==target||!['user','admin'].includes(row.senderKind)
        ||(row.senderKind==='user'?row.senderUserId!==owner:row.senderUserId!=null))throw fail('source');
    return Object.freeze({...row});
  }
  function messages(data,kind,target,owner,peer) {
    if(!uuid(target)||!uuid(owner)||!data||data.ok!==true||!Array.isArray(data.messages)
        ||data.messages.length>(kind==='chat'?100:500))throw fail('source');
    const rows=data.messages.map(row=>message(row,kind,target,owner,peer));
    if(new Set(rows.map(row=>row.id)).size!==rows.length)throw fail('source');
    if(kind==='chat') {
      if(new Set(rows.map(row=>row.sequence)).size!==rows.length)throw fail('source');
      rows.sort((a,b)=>BigInt(a.sequence)<BigInt(b.sequence)?-1:1);
    } else {
      const fraction=raw=>((raw.match(/\.(\d+)(?:Z|[+-])/)||[])[1]||'').padEnd(9,'0');
      rows.sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt)||fraction(a.createdAt).localeCompare(fraction(b.createdAt))||a.id.localeCompare(b.id));
    }
    return rows;
  }
  function summary(data) {
    if(!data||data.ok!==true||![data.total,data.open,data.waitingUser,data.resolved].every(count)||data.total>100
        ||data.open+data.waitingUser+data.resolved!==data.total)throw fail('source');
    return Object.freeze({...data});
  }
  async function json(response) {
    if(!response||!response.ok)throw fail(response&&response.status===401?'auth':response&&response.status===403?'denied':response&&response.status===429?'rate':'source');
    if(!response.headers||!(response.headers.get('content-type')||'').includes('application/json'))throw fail('source');
    try{return await response.json();}catch{throw fail('source');}
  }
  function createReader(options) {
    let epoch=0,abort=null;
    function clear(){epoch++;if(abort)abort.abort();abort=null;}
    async function get(url) {
      clear();const token=epoch;abort=new AbortController();
      try {
        const data=await json(await options.fetch(url,{credentials:'same-origin',cache:'no-store',signal:abort.signal,headers:{Accept:'application/json'}}));
        if(token!==epoch)throw fail('stale');
        return data;
      } catch(error){if(token!==epoch)throw fail('stale');throw error;}
    }
    return Object.freeze({get,clear});
  }
  function createClient(options) {
    let pending=null,busy=false,epoch=0;
    function clear(){epoch++;pending=null;}
    async function submit(fields) {
      if(busy)throw fail('in_flight');
      const owner=uuid(options.owner());
      if(!owner)throw fail('auth');
      if(!['thread','reply','chat'].includes(fields.kind))throw fail('invalid');
      const body=text(fields.body,1000,fields.kind==='chat'),subject=fields.kind==='thread'?text(fields.subject,120,false):null;
      const target=fields.kind==='thread'?null:uuid(fields.target);
      if(fields.kind!=='thread'&&!target)throw fail('invalid');
      const intent={owner,kind:fields.kind,target,body,subject};
      if(pending&&pending.owner!==owner){clear();throw fail('account_changed');}
      if(pending&&Object.keys(intent).some(key=>intent[key]!==pending[key]))throw fail('pending_intent');
      if(!pending) {
        const key=uuid(options.uuid());if(!key)throw fail('invalid');
        pending=Object.freeze({...intent,key});
      }
      const request=pending,token=epoch;busy=true;
      const current=()=>{if(token!==epoch||options.owner()!==owner){clear();throw fail('account_changed');}};
      async function refresh() {
        let fresh;
        try{fresh=await json(await options.fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}}));}
        catch(error){if(error.message==='auth'){clear();throw fail('account_changed');}throw fail('session_unavailable');}
        current();
        if(!fresh||fresh.ok!==true||typeof fresh.signedIn!=='boolean')throw fail('session_unavailable');
        if(!fresh.signedIn||!fresh.user||fresh.user.id!==owner){clear();if(options.accountChanged)options.accountChanged();throw fail('account_changed');}
        if(typeof fresh.csrfToken!=='string'||!fresh.csrfToken||fresh.csrfToken.length>512)throw fail('csrf_required');
        return fresh.csrfToken;
      }
      try {
        const proof=await refresh();current();
        const url=request.kind==='thread'?'/api/v1/support/threads':'/api/v1/'+(request.kind==='chat'?'chat/conversations/':'support/threads/')+request.target+'/messages';
        const payload={idempotencyKey:request.key,body:request.body};
        if(request.kind==='thread')payload.subject=request.subject;
        let response,data;
        try {
          response=await options.fetch(url,{method:'POST',credentials:'same-origin',cache:'no-store',
            headers:{'Content-Type':'application/json','X-CSRF-Token':proof,'Idempotency-Key':request.key},body:JSON.stringify(payload)});
          current();
          data=await json(response);current();
        } catch(error) {
          current();
          if(['auth','denied','rate'].includes(error.message))throw error;
          throw fail('unconfirmed');
        }
        await refresh();current();
        let receipt;
        try {
          if(!data||data.ok!==true)throw fail('source');
          receipt=request.kind==='thread'?thread(data.thread,owner):message(data.message,request.kind==='chat'?'chat':'support',target,owner);
          if(request.kind==='thread'?receipt.subject!==subject:
              receipt.senderUserId!==owner||receipt.body!==body||(request.kind==='reply'&&receipt.senderKind!=='user'))throw fail('source');
        } catch{throw fail('unconfirmed');}
        pending=null;return receipt;
      } finally{busy=false;}
    }
    return Object.freeze({submit,clear,hasPending:()=>pending!==null,isBusy:()=>busy});
  }
  function filterThreads(rows,filters) {
    let from=null,to=null;
    if(filters.from||filters.to) {
      const valid=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
      if(!valid(filters.from)||!valid(filters.to))throw fail('date');
      from=Date.parse(filters.from+'T00:00:00+09:00');to=Date.parse(filters.to+'T00:00:00+09:00')+86400000;
      if(to<=from||(to-from)/86400000>366)throw fail('date');
    }
    const q=(filters.q||'').trim().toLocaleLowerCase();
    return rows.filter(row=>(!filters.status||row.status===filters.status)&&(!q||row.subject.toLocaleLowerCase().includes(q))
      &&(from===null||(Date.parse(row.lastMessageAt)>=from&&Date.parse(row.lastMessageAt)<to)))
      .sort((a,b)=>(Date.parse(b.lastMessageAt)-Date.parse(a.lastMessageAt))*(filters.sort==='oldest'?-1:1));
  }
  window.MV43Messaging=Object.freeze({uuid,text,threads,conversations,messages,summary,createClient,createReader,filterThreads});
})();
