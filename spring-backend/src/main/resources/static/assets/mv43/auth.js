/* Credentials and acknowledgements remain in memory; account transitions discard them. */
(function(){
  'use strict';
  const core=window.MV43Auth,locale=window.MV39Locale;
  if(!core||!locale)return;
  const page=document.body.dataset.authPage;
  const form=document.getElementById('native-auth-form'),submit=document.getElementById('auth-submit'),status=document.getElementById('auth-status');
  if(!form||!submit||!status)return;
  const field=name=>form.elements.namedItem(name),client=core.createClient({fetch:(url,options)=>fetch(url,options)});
  let message=page==='register'?'authRegistrationUnavailable':'authReady',owner=null,known=false,epoch=0,sessionCheck=0,checking=false;
  function render(){
    submit.disabled=page!=='login'||client.isBusy();
    form.setAttribute('aria-busy',String(client.isBusy()));
    submit.textContent=locale.tx(client.isBusy()?'authSending':page==='register'?'authRegisterSubmit':'authLoginSubmit');
    status.textContent=locale.tx(message);
  }
  function clearPrivate(){
    epoch++;
    for(const name of ['email','password','displayName'])if(field(name))field(name).value='';
    for(const name of ['terms','privacy','age'])if(field(name))field(name).checked=false;
  }
  async function checkSession(){
    if(checking)return;
    checking=true;const request=++sessionCheck;
    try{
      const response=await fetch('/api/v1/auth/session',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
      if(!response.ok)return;
      const data=await response.json();
      if(!data||typeof data.signedIn!=='boolean'||(data.signedIn&&(!data.user||typeof data.user.id!=='string')))return;
      if(request!==sessionCheck)return;
      const next=data.signedIn?data.user.id:null;
      if((known&&next!==owner)||(!known&&next!==null)){clearPrivate();message='authAccountChanged';}
      known=true;owner=next;render();
    }catch{/* Unavailable bootstrap must never claim an account transition. */}
    finally{checking=false;}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(page!=='login'){message='authRegistrationUnavailable';render();return;}
    const requestEpoch=epoch;
    const fields={email:field('email').value,password:field('password').value,terms:field('terms').checked,privacy:field('privacy').checked,age:field('age').checked};
    const pending=client.submit('login',fields);render();
    try{
      await pending;
      if(epoch!==requestEpoch)return;
      clearPrivate();message='authSignedIn';render();
      window.location.assign(core.destination());
    }catch(error){
      if(epoch!==requestEpoch)return;
      message=error.message==='validation'?'authValidation':error.message==='credentials'?'authCredentials':'authUnconfirmed';
    }finally{render();}
  });
  window.addEventListener('mv39-language-change',render);
  window.addEventListener('focus',checkSession);
  window.addEventListener('pageshow',checkSession);
  window.addEventListener('pagehide',()=>{sessionCheck++;clearPrivate();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkSession();});
  render();checkSession();
})();
