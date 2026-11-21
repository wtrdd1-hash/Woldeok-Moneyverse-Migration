/* Canonical money and replay-safe requests are independent of page rendering. */
(function () {
  'use strict';
  const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)?value.toLowerCase():null;
  function canonicalMoney(value) {
    return typeof value==='string' && /^(0|[1-9][0-9]{0,127})$/.test(value)?value:null;
  }
  function formatMoney(value,language) {
    const amount=canonicalMoney(value);
    return amount===null?null:new Intl.NumberFormat(language||'en').format(BigInt(amount))+' WLD';
  }
  function normaliseOverview(payload,owner) {
    const data=payload&&payload.data;
    if(!payload||payload.ok!==true||payload.success!==true||!data||uuid(data.userId)!==uuid(owner)||!uuid(owner)
        ||data.currency!=='WLD'||!Array.isArray(data.recentTransactions))throw failure('source_unverified');
    const total=canonicalMoney(data.balanceWld),cash=canonicalMoney(data.pendingBalanceWld),bank=canonicalMoney(data.lockedBalanceWld);
    if(total===null||cash===null||bank===null||BigInt(cash)+BigInt(bank)!==BigInt(total))throw failure('source_unverified');
    const transactions=data.recentTransactions.map(row=>{
      const amount=canonicalMoney(row.amount);
      if(amount===null||amount==='0'||!['debit','credit'].includes(row.direction))throw failure('source_unverified');
      return Object.freeze({id:typeof row.id==='string'?row.id:'',amount,direction:row.direction,
        type:typeof row.tx_type==='string'?row.tx_type:'',createdAt:row.created_at});
    });
    return Object.freeze({owner:uuid(owner),total,cash,bank,transactions:Object.freeze(transactions)});
  }
  function failure(code) { const error=new Error(code);error.code=code;return error; }
  function createTransferClient(options) {
    let pending=null,busy=false;
    async function submit(fields) {
      if(busy)throw failure('in_flight');
      const owner=uuid(options.owner()),recipient=uuid(fields.recipientUserId);
      const amount=canonicalMoney(fields.amountWld),csrf=options.csrf();
      if(!owner)throw failure('auth_required');
      if(!csrf||typeof csrf!=='string'||csrf.length>512)throw failure('csrf_required');
      if(!recipient||recipient===owner||amount===null||amount==='0'||amount.length>38)throw failure('invalid_transfer');
      const memo=typeof fields.memo==='string'?fields.memo:'';
      if(memo.length>120)throw failure('invalid_transfer');
      if(pending&&pending.owner!==owner){pending=null;throw failure('account_changed');}
      if(pending&&(pending.recipient!==recipient||pending.amount!==amount||pending.memo!==memo))throw failure('pending_intent');
      if(!pending) {
        const key=uuid(options.uuid());
        if(!key)throw failure('request_key_unavailable');
        pending={owner,recipient,amount,memo,key};
      }
      const request=pending;
      busy=true;
      try {
        let response;
        try {
          response=await options.fetch('/api/v1/wallet/transfer',{
            method:'POST',credentials:'same-origin',cache:'no-store',
            headers:{'Content-Type':'application/json','X-CSRF-Token':csrf,'Idempotency-Key':request.key},
            body:JSON.stringify({recipientUserId:request.recipient,amountWld:request.amount,memo:request.memo})
          });
        } catch { throw failure('unconfirmed'); }
        if(uuid(options.owner())!==request.owner){pending=null;throw failure('account_changed');}
        let payload=null;
        try {payload=await response.json();}catch {throw failure('unconfirmed');}
        if(!response.ok) {
          if([400,401,403,404,409,422].includes(response.status) && payload
              && (payload.ok===false||payload.success===false||payload.status===response.status)) {
            pending=null;
            throw failure(response.status===401?'auth_required':response.status===403?'csrf_required':'rejected');
          }
          throw failure('unconfirmed');
        }
        const receipt=payload&&payload.data;
        if(payload.ok!==true||!receipt||receipt.success!==true||!uuid(receipt.txId)
            ||uuid(receipt.fromUserId)!==request.owner||uuid(receipt.toUserId)!==request.recipient
            ||canonicalMoney(receipt.amount)!==request.amount)throw failure('unconfirmed');
        pending=null;
        return Object.freeze({txId:receipt.txId,amount:request.amount,recipientUserId:request.recipient});
      } finally {busy=false;}
    }
    return Object.freeze({submit,hasPending:()=>pending!==null,isBusy:()=>busy,
      clear:()=>{pending=null;}});
  }
  window.MV43Wallet=Object.freeze({canonicalMoney,canonicalUserId:uuid,formatMoney,normaliseOverview,createTransferClient});
})();
