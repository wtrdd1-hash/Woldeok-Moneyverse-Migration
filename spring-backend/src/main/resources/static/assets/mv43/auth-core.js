/* Only source-backed login receipts may complete the native form. */
(function(root){
  'use strict';
  const userId=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  function createClient(options){
    let busy=false;
    return {
      isBusy:()=>busy,
      async submit(action,fields){
        if(action!=='login')throw new Error('unavailable');
        if(busy)throw new Error('in_flight');
        if(!fields||typeof fields.email!=='string'||!fields.email.trim()||!fields.email.includes('@')||
           fields.email.length>254||typeof fields.password!=='string'||!fields.password||
           fields.password.length>128||fields.terms!==true||fields.privacy!==true||fields.age!==true)
          throw new Error('validation');
        busy=true;
        try{
          const response=await options.fetch('/api/v1/auth/local/login',{
            method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',
            headers:{Accept:'application/json','Content-Type':'application/json'},
            body:JSON.stringify({email:fields.email.trim(),password:fields.password})
          });
          if(response.status===401)throw new Error('credentials');
          if(!response.ok||response.status!==200)throw new Error('unconfirmed');
          const data=await response.json();
          if(!data||data.outcome!=='signed-in'||!userId(data.userId)||
             typeof data.csrfToken!=='string'||!data.csrfToken.trim())throw new Error('unconfirmed');
          return {userId:data.userId};
        }catch(error){
          if(error&&['credentials','validation','unconfirmed'].includes(error.message))throw error;
          throw new Error('unconfirmed');
        }finally{busy=false;}
      }
    };
  }
  root.MV43Auth=Object.freeze({createClient,destination:()=> '/'});
})(window);
