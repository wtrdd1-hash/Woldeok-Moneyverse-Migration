/* Canonical data validation is independent of DOM rendering and cannot issue commands. */
(function(root){
  'use strict';
  const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const fail=code=>{throw new Error(code);};
  function price(value){return typeof value==='string'&&/^[1-9][0-9]{0,18}$/.test(value)&&BigInt(value)<=9223372036854775807n;}
  function stock(value){return value===null||Number.isInteger(value)&&value>=0&&value<=2147483647;}
  function parseCatalog(data){
    if(!object(data)||!Array.isArray(data.items)||(Object.hasOwn(data,'success')&&data.success!==true))fail('source_unverified');
    const ids=new Set(),codes=new Set();
    return Object.freeze(data.items.map(row=>{
      if(!object(row)||typeof row.id!=='string'||!UUID.test(row.id)||!price(row.base_price)
        ||!['code','name','category'].every(key=>typeof row[key]==='string'&&row[key].trim())
        ||!['description','rarity','purchase_limit'].every(key=>typeof row[key]==='string')
        ||typeof row.active!=='boolean'||typeof row.is_limited!=='boolean'||!stock(row.max_stock)||!stock(row.current_stock)
        ||row.max_stock!==null&&row.current_stock!==null&&row.current_stock>row.max_stock)fail('source_unverified');
      const id=row.id.toLowerCase(),code=row.code.toLowerCase();
      if(ids.has(id)||codes.has(code))fail('source_unverified');ids.add(id);codes.add(code);
      return Object.freeze({id,code:row.code,name:row.name,description:row.description,category:row.category,base_price:row.base_price,
        rarity:row.rarity,max_stock:row.max_stock,current_stock:row.current_stock,is_limited:row.is_limited,active:row.active,purchase_limit:row.purchase_limit});
    }));
  }
  function formatPrice(value,language){if(!price(value))fail('source_unverified');return value.replace(/\B(?=(\d{3})+(?!\d))/g,language==='vi'?'.':',');}
  function filter(rows,query,category){const q=String(query||'').trim().toLowerCase();return rows.filter(row=>(!category||row.category===category)&&(!q||[row.name,row.code,row.category].some(value=>value.toLowerCase().includes(q))));}
  function identity(proof){
    if(!object(proof)||proof.signedIn!==true||proof.authenticated!==true||!object(proof.user))fail('auth_required');
    const id=proof.user.id;if(typeof id!=='string'||!UUID.test(id))fail('source_unverified');
    for(const row of [proof,proof.user])for(const key of ['id','userId'])if(Object.hasOwn(row,key)&&row[key]!==id)fail('source_unverified');
    return id.toLowerCase();
  }
  async function load(fetcher){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
    try{
      async function read(path){
        const response=await fetcher(path,{method:'GET',credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
        if(response.status!==200)fail(response.status===401?'auth_required':response.status===403?'access_denied':response.status===429?'rate_limited':'unavailable');
        if(!/^application\/json(?:\s*;.*)?$/i.test(response.headers.get('Content-Type')||''))fail('unavailable');
        return {body:await response.json(),owner:response.headers.get('X-MV-Owner')};
      }
      const owner=identity((await read('/api/v1/auth/me')).body);
      const data=await read('/api/v1/admin/shop/items');
      if(data.owner!==owner)fail('source_unverified');
      const items=parseCatalog(data.body);
      if(identity((await read('/api/v1/auth/me')).body)!==owner)fail('account_changed');
      return {owner,items};
    }catch(error){if(error?.name==='AbortError')fail('unavailable');throw error;}
    finally{clearTimeout(timeout);}
  }
  root.MV46AdminShop=Object.freeze({parseCatalog,formatPrice,filter,load});
})(window);
