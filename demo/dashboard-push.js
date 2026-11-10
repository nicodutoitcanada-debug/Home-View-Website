/* HOME VIEW SOLUTIONS | iPhone / Android / desktop branded Web Push registration.
   Notification permission is requested only on a real user click.
   No service_role keys or customer data in this public browser script.
*/
(function(){
  'use strict';
  const fn='https://jythgvjtulxivwmlicvi.supabase.co/functions/v1/hvs-push-subscribe';
  const status=s=>{const el=document.getElementById('hvsPushStatus');if(el)el.textContent=s;};
  function ios(){return /iPad|iPhone|iPod/i.test(navigator.userAgent);}
  function installed(){return window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;}
  function supports(){return !!(window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window);}
  function binary(v){const b=(v+'='.repeat((4-v.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(b),c=>c.charCodeAt(0));}
  async function request(client,method,data){
    const {data:sessionResult,error}=await client.auth.getSession();
    const token=sessionResult?.session?.access_token;
    if(error||!token)throw new Error('Sign in to the live Builder Dashboard first.');
    const c=window.HVS_DASHBOARD_CONFIG||{};
    const response=await fetch(fn,{
      method,
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':c.publishableKey},
      ...(data?{body:JSON.stringify(data)}:{}),
      cache:'no-store'
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.ok)throw new Error(result.error||'Supabase push setup failed.');
    return result;
  }
  async function enable(client){
    if(!client){status('Connect live buyer data first.');return;}
    if(ios()&&!installed()){status('On iPhone: open this dashboard in Safari → Share → Add to Home Screen. Open the new Home View app and tap Enable alerts there.');return;}
    if(!supports()){status('This browser does not support Web Push. On iPhone, add the dashboard to Home Screen and open the installed app.');return;}
    // Apple's iPhone rules: request permission directly from the button gesture.
    let permission=Notification.permission;
    if(permission==='default')permission=await Notification.requestPermission();
    if(permission!=='granted'){status('Notifications were not allowed. Check Home View in iPhone Settings → Notifications.');return;}
    try{
      status('Registering your Home View phone alerts…');
      const worker=await navigator.serviceWorker.register('./dashboard-sw.js',{scope:'./'});
      await navigator.serviceWorker.ready;
      const {vapidPublicKey}=await request(client,'GET');
      let subscription=await worker.pushManager.getSubscription();
      if(subscription){
        const existing=subscription.options?.applicationServerKey;
        if(existing){
          const old=Array.from(new Uint8Array(existing));
          const next=Array.from(binary(vapidPublicKey));
          if(old.join(',')!==next.join(',')){await subscription.unsubscribe();subscription=null;}
        }
      }
      if(!subscription)subscription=await worker.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:binary(vapidPublicKey)});
      await request(client,'POST',{action:'subscribe',subscription:subscription.toJSON()});
      status('Phone alerts enabled on this device. Tap Send test alert to check.');
    }catch(error){console.error('[HVS PUSH]',error);status('Could not enable alerts: '+(error?.message||error));}
  }
  async function test(client){
    if(!client){status('Connect live buyer data first.');return;}
    try{
      status('Sending a test Home View notification…');
      const result=await request(client,'POST',{action:'test'});
      status('Test notification accepted for '+result.sent+' device(s). Check your phone.');
    }catch(error){console.error('[HVS PUSH TEST]',error);status('Test failed: '+(error?.message||error));}
  }
  async function testGroup(client){
    if(!client){status('Connect live buyer data first.');return;}
    try{
      status('Sending one group test alert to every approved team phone…');
      const result=await request(client,'POST',{action:'test-group'});
      status('Group test accepted by '+result.sent+' of '+result.total+
        ' registered phone(s).'+(result.failed?' '+result.failed+' failed; re-enable alerts on those phones.':
        ' Check the phones, including while the Home View app is closed.'));
    }catch(error){
      console.error('[HVS PUSH GROUP TEST]',error);
      status('Group test failed: '+(error?.message||error));
    }
  }
  window.HVS_PHONE_PUSH={enable,test,testGroup};
})();
