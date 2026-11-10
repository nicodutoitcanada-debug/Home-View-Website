/* HOME VIEW SOLUTIONS | Authenticated online save; no Arcware SDK changes.
   Saves buyer profiles only with a verified Supabase Auth access token.
   The public publishable key is NOT a password or a server secret.
*/
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  // This is the dedicated HVS buyer/Builder Dashboard Supabase project.
  const DEMO_PROJECT_URL = 'https://jythgvjtulxivwmlicvi.supabase.co';
  const CONTACT_KEY = 'hvs-demo-buyer-contact-v1';
  // Previous demo versions stored a private shared code in this browser.
  // It is obsolete after Supabase Auth migration, so erase it automatically.
  try{localStorage.removeItem('hvs-demo-live-leads-connection-v1');}catch(_){}
  let inFlight = Promise.resolve();
  let lastBuyer = '';
  const info = msg => { const el=byId('hvsLeadStatus'); if(el)el.textContent=msg; };
  const status = (msg) => { info(msg); console.info('[HVS LEADS]',msg); };
  // Bound network waits so a paid streaming session does not stay blocked indefinitely.
  const fetchWithTimeout=(url,options,ms)=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),ms);
    return fetch(url,{...options,signal:controller.signal}).finally(()=>clearTimeout(timer));
  };
  const getState = () => { try { return window.homeViewSavedState?.() || null; } catch(e){console.warn('[HVS LEADS] Cannot read profile',e);return null;} };
  const keyFor = str => String(str || '').trim().toLowerCase();
  const read = (name, fallback={}) => {try{ return JSON.parse(localStorage.getItem(name) || 'null') || fallback;}catch(_){return fallback;}};
  const save = (name,value) => {try{localStorage.setItem(name,JSON.stringify(value));}catch(_){}};
  function currentBuyer(){
    // Buyer IDs must be unique even when two buyers have the same display name
    // on a shared showroom device. Never reuse another buyer's lead/session ID.
    const id=window.homeViewCloudBuyerId?.();
    return keyFor(id?'buyer-'+id:getState()?.currentUser);
  }
  function syncBuyer(){
    const name = currentBuyer();
    if(!name || name===lastBuyer)return;
    lastBuyer=name;
    const c=read(CONTACT_KEY)[name]||{};
    if(byId('hvsLeadBuyerName')) byId('hvsLeadBuyerName').value = c.name || getState()?.currentUser || '';
    if(byId('hvsLeadBuyerEmail'))byId('hvsLeadBuyerEmail').value = window.HVSBuyerAuth?.user?.()?.email||c.email||'';
    if(byId('hvsLeadBuyerPhone')) byId('hvsLeadBuyerPhone').value = c.phone || '';
    for(const [id,field] of [['hvsLeadSaveOnline','saveOnline'],['hvsLeadContactRequested','contactRequested'],['hvsLeadMarketingConsent','marketingConsent']])
      if(byId(id))byId(id).checked=!!c[field];
    info('Your contact choices are stored only on this device until you save online.');
  }
  function saveContact(){
    const name=currentBuyer();if(!name)return;
    const all=read(CONTACT_KEY);
    all[name]={
      name:byId('hvsLeadBuyerName')?.value.trim()||'',
      email:window.HVSBuyerAuth?.user?.()?.email||byId('hvsLeadBuyerEmail')?.value.trim()||'',
      phone:byId('hvsLeadBuyerPhone')?.value.trim()||'',
      saveOnline:!!byId('hvsLeadSaveOnline')?.checked,
      contactRequested:!!byId('hvsLeadContactRequested')?.checked,
      marketingConsent:!!byId('hvsLeadMarketingConsent')?.checked,
    };
    save(CONTACT_KEY,all);
  }
  function uuid(){
    if(crypto?.randomUUID)return crypto.randomUUID();
    // crypto-backed UUID v4 for older supported browsers.
    const a=crypto.getRandomValues(new Uint8Array(16));a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
    const s=[...a].map(v=>v.toString(16).padStart(2,'0')).join('');
    return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;
  }
  function sessionId(buyer){
    const key='hvs-lead-id-'+buyer;
    let id=sessionStorage.getItem(key);
    if(!id){id=window.HVSBuyerAuth?.latestLeadId?.()||uuid();sessionStorage.setItem(key,id);}
    return id;
  }
  function buildPayload(source){
    const state=getState();if(!state?.currentUser)return null;
    if(!window.homeViewCloudBuyerId?.())throw Error('Please sign in with BUYER LOGIN to save your home online.');
    // Contact preferences are saved under the authenticated buyer ID, not the display name.
    // Reuse that same key so online SAVE can retrieve the buyer's current choices.
    const buyer=currentBuyer();
    const profile=read(CONTACT_KEY)[buyer]||{};
    const authUser=window.HVSBuyerAuth?.user?.();
    if(authUser?.email)profile.email=authUser.email;
    if(!profile.name)profile.name=state.currentUser;
    if(!profile.saveOnline)return null;
    if(!profile.name)throw new Error('Enter the buyer name before saving online.');
    if(profile.contactRequested && !profile.email && !profile.phone)throw new Error('Enter your email or phone in the account window to request a callback.');
    const values=state.effectiveCosts||{};
    const total=Number(state.total)||0;
    const base=Number(values['Base Cost'])||0;
    const p=state.profile||{};
    const property=p.settings?.PropertyChoice==='two'?'Property Two':'Property One';
    return {
      id:sessionId(buyer),
      buyer_name:profile.name,
      buyer_email:profile.email||null,
      buyer_phone:profile.phone||null,
      property_name:property,
      home_model:'Home View Demo',
      saved_configuration:{currentUser:state.currentUser,profile:p,effectiveCosts:values,total,submissionSource:source},
      base_price:base,
      upgrades_price:Math.round((total-base)*100)/100,
      total_price:total,
      contact_requested:!!profile.contactRequested,
      marketing_consent:!!profile.marketingConsent,
    };
  }
  function send(source='save'){
    // Capture contact and design SYNCHRONOUSLY. End Session may immediately
    // close its Arcware stream; the network request must never delay shutdown.
    saveContact();
    let payload;
    try { payload=buildPayload(source); }
    catch(error) { return Promise.reject(error); }
    if(!payload){
      if(source==='share')return Promise.reject(new Error('Sign in to a buyer profile, then enter your details to save online.'));
      return Promise.resolve({skipped:true});
    }
    // Serialize actual requests so SAVE followed by END SESSION keeps order.
    const work = async () => {
      const jwt=await window.HVSBuyerAuth?.token?.();
      if(!jwt)throw Error('Your buyer login has expired. Please sign in again.');
      const c=window.HVS_DASHBOARD_CONFIG||{};
      const url=c.url||DEMO_PROJECT_URL;
      const pub=c.publishableKey;
      if(!pub)throw Error('The public Home View account configuration is unavailable.');
      const headers={'Content-Type':'application/json','Authorization':'Bearer '+jwt,'apikey':pub};
      const res=await fetchWithTimeout(url+'/functions/v1/hvs-submit-lead',{
        method:'POST',
        headers,
        body:JSON.stringify(payload),
        cache:'no-store',
      },12000);
      const reply=await res.json().catch(()=>({}));
      if(!res.ok || !reply.ok)throw new Error(reply.error||'Unable to save online.');
      window.HVSBuyerAuth?.setSavedLeadId?.(reply.id||payload.id);
      // Notification dispatch is owned by the server after a confirmed save.
      // Do not send another browser-side push request (older cached clients
      // are still protected by per-event/per-phone receipts on the server).
      const phoneNote=reply.push==='queued'
        ? 'Group alerts queued for all registered team phones.'
        : 'Design saved; group notification not confirmed. Check the dashboard group test.';
      status('Saved to Supabase. '+phoneNote);
      return reply;
    };
    const promise=inFlight.then(work,work);
    inFlight=promise.catch(()=>{});
    if(source==='end-session'){
      const buyer=currentBuyer();
      if(buyer)inFlight.finally(()=>sessionStorage.removeItem('hvs-lead-id-'+buyer));
    }
    return promise;
  }
  window.homeViewSubmitBuyerLead=(source='save')=>send(source);
  window.homeViewClearLeadSession=()=>{
    const buyer=currentBuyer();
    if(buyer)try{sessionStorage.removeItem('hvs-lead-id-'+buyer);}catch(_){}
  };
  byId('hvsLeadShareNow')?.addEventListener('click',()=>{
    syncBuyer();byId('hvsLeadSaveOnline').checked=true;saveContact();
    status('Submitting saved design…');
    send('share').catch(e=>status('Online submission failed: '+e.message));
  });
  for(const id of ['hvsLeadBuyerName','hvsLeadBuyerEmail','hvsLeadBuyerPhone','hvsLeadSaveOnline','hvsLeadContactRequested','hvsLeadMarketingConsent']){
    byId(id)?.addEventListener('change',saveContact);
    byId(id)?.addEventListener('input',saveContact);
  }
  // End Session calls homeViewSubmitBuyerLead from its own existing handler.
  // This is intentional: the Arcware shutdown function lives in a module and
  // can finish initializing after this deferred script has loaded.
  const signedIn=byId('hvsSignedIn');
  if(signedIn){
    new MutationObserver(()=>{if(!signedIn.hidden)syncBuyer();else lastBuyer='';}).observe(signedIn,{attributes:true,attributeFilter:['hidden']});
    if(!signedIn.hidden)syncBuyer();
  }
})();
