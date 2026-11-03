/* HOME VIEW | Buyer sign-in, separate from the frontend and admin UI.
   Uses Supabase Auth REST, the public publishable key, and per-buyer RLS.
   No shared demo access code, no server secrets, no Arcware/session changes. */
(()=>{
 'use strict';
 const STORAGE='hvs-buyer-supabase-session-v1';
 const getConfig=()=>{
   const c=window.HVS_DASHBOARD_CONFIG||{};
   if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(c.url||'') || !/^sb_publishable_|^eyJ/.test(c.publishableKey||''))
     throw Error('The public Home View account configuration is missing.');
   return c;
 };
 let session=null;
 try{session=JSON.parse(localStorage.getItem(STORAGE)||'null')}catch(_){}
 const save=(s)=>{
   session=s;
   try{if(s)localStorage.setItem(STORAGE,JSON.stringify(s));else localStorage.removeItem(STORAGE);}
   catch(e){console.warn('[HOME VIEW AUTH] Browser storage unavailable',e);}
 };
 const publicHeaders=()=>({'apikey':getConfig().publishableKey,'Content-Type':'application/json'});
 async function call(path,options={}){
   const cfg=getConfig();
   let response;
   try{response=await fetch(cfg.url+path,{...options,cache:'no-store'});}
   catch(_){throw Error('Cannot reach the Home View account service. Check your connection.');}
   let data={};try{data=await response.json()}catch(_){}
   if(!response.ok){
     let msg=data.msg||data.error_description||data.message||data.error||'Authentication request failed.';
     if(response.status===429)msg='Too many login attempts. Please try again later.';
     throw Error(String(msg));
   }
   return data;
 }
 function remember(data){
   if(!data?.access_token||!data?.refresh_token||!data?.user?.id)throw Error('Account session was not returned.');
   const expires=Date.now()+Math.max(60,Number(data.expires_in||3600))*1000;
   save({access_token:data.access_token,refresh_token:data.refresh_token,expires,user:data.user});
   return data.user;
 }
 async function signIn(email,password){
   const response=await call('/auth/v1/token?grant_type=password',{
     method:'POST',headers:publicHeaders(),body:JSON.stringify({email:email.trim().toLowerCase(),password})
   });
   return remember(response);
 }
 async function signUp(email,password,displayName){
   // Confirmation URL and allowlist are configured in the HVS Supabase project.
   // Unlike a direct /demo redirect, a confirmation should NOT start paid Arcware.
   const response=await call('/auth/v1/signup',{
     method:'POST',headers:publicHeaders(),
     body:JSON.stringify({email:email.trim().toLowerCase(),password,
       data:{display_name:displayName.trim().slice(0,48)}})
   });
   if(response?.access_token&&response?.refresh_token){
     return {user:remember(response),confirmed:true};
   }
   return {user:null,confirmed:false,needsEmailConfirmation:true};
 }
 async function token(){
   if(!session?.access_token)return null;
   if(Date.now()<Number(session.expires||0)-90000)return session.access_token;
   if(!session.refresh_token){save(null);return null;}
   try{
     const renewed=await call('/auth/v1/token?grant_type=refresh_token',{
       method:'POST',headers:publicHeaders(),body:JSON.stringify({refresh_token:session.refresh_token})
     });
     remember(renewed);
     return session.access_token;
   }catch(error){
     save(null);
     throw Error('Your login has expired. Please log in again.');
   }
 }
 async function getUser(){
   const jwt=await token();
   if(!jwt)return null;
   const info=await call('/auth/v1/user',{method:'GET',headers:{...publicHeaders(),Authorization:'Bearer '+jwt}});
   if(info?.id){session.user=info;save(session);return info;}
   return null;
 }
 async function getSavedDesign(){
   const user=await getUser();
   if(!user)return null;
   const jwt=await token();
   const query='?select=saved_configuration,updated_at,id&buyer_user_id=eq.'+encodeURIComponent(user.id)+
      '&order=updated_at.desc&limit=1';
   const result=await call('/rest/v1/hvs_buyer_leads'+query,{
     method:'GET',headers:{...publicHeaders(),Authorization:'Bearer '+jwt}
   });
   if(!Array.isArray(result))throw Error('Saved buyer profile could not be loaded.');
   return result.length ? result[0] : null;
 }
 async function logOut(){
   try{
     const jwt=await token();
     if(jwt)await call('/auth/v1/logout',{method:'POST',
       headers:{...publicHeaders(),Authorization:'Bearer '+jwt}});
   }catch(e){console.warn('[HOME VIEW AUTH] Remote sign-out unavailable',e);}
   save(null);
 }
 window.HVSBuyerAuth=Object.freeze({
   signIn,signUp,getUser,getSavedDesign,token,logOut,
   user:()=>session?.user||null,
   hasSession:()=>!!session?.access_token
 });
})();