/* Home View Solutions: saved home restore, separate from index.html.
 Buyer designs live in browser localStorage and in Supabase after online SAVE.
 This file contains no buyer data, passwords or private Supabase keys.
 Does not create/reconnect/close Pixel Streaming sessions. */
(function(){
 'use strict';
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 let token=0, active=false, scene=null, defaults={}, variantKeys=new Set(), video=null, animation=null;
 const alive=id=>id===token&&!window.homeViewSessionIntentional;
 const state=()=>({active,scene:scene?{...scene}:null});
 function view(){
   let box=document.getElementById('hvsSavedHomeLoading');
   if(box)return box;
   let css=document.createElement('style');
   css.id='hvsSavedHomeLoadingStyle';
   css.textContent='#hvsSavedHomeLoading{position:fixed;inset:0;z-index:12850;display:flex;align-items:center;justify-content:center;color:white;background:radial-gradient(ellipse at center,#302018 0%,#130a08 52%,#030303 100%);opacity:0;transition:opacity .36s ease;pointer-events:auto;overflow:hidden}'+
   '#hvsSavedHomeLoading[hidden]{display:none!important}#hvsSavedHomeLoading.hvs-show{opacity:1}'+
   '#hvsSavedHomeLoading.hvs-exit{opacity:0;pointer-events:none;transition:opacity .65s ease}'+
   '#hvsSavedHomeLoading .hvs-bg{position:absolute;inset:0;height:100%;width:100%;object-fit:cover;opacity:1;transition:opacity .52s ease}'+
   '#hvsSavedHomeLoading .hvs-content{position:relative;z-index:1;width:min(90vw,560px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px}'+
   '#hvsSavedHomeLoading .hvs-lottie{width:clamp(135px,30vmin,300px);height:clamp(135px,30vmin,300px);position:relative}'+
   '#hvsSavedHomeLoading .hvs-lottie:empty:after{content:"";position:absolute;top:calc(50% - 22px);left:calc(50% - 22px);height:44px;width:44px;border:2px solid #ffffff44;border-top-color:#ef5428;border-radius:50%;animation:hvsSavedSpin 1s linear infinite}'+
   '@keyframes hvsSavedSpin{to{transform:rotate(360deg)}}'+
   '#hvsSavedHomeLoading h2{color:white;font:700 clamp(12px,2.4vmin,21px)/1.3 Arial,sans-serif;letter-spacing:.12em;margin:0 14px;text-shadow:0 1px 7px black}'+
   '#hvsSavedHomeLoading p{color:#ebe1dc;font:400 clamp(10px,1.9vmin,14px)/1.5 Arial,sans-serif;margin:5px 16px 0;max-width:480px}'+
   '#hvsSavedHomeLoading .hvs-actions{display:flex;gap:9px;margin-top:12px}'+
   '#hvsSavedHomeLoading .hvs-actions[hidden]{display:none!important}'+
   '#hvsSavedHomeLoading .hvs-actions button{border:1px solid #ffffff55;border-radius:999px;min-height:38px;padding:9px 17px;background:#8b3a24;color:#fff;font:700 11px Arial,sans-serif;cursor:pointer}';
   document.head.appendChild(css);
   box=document.createElement('section');
   box.id='hvsSavedHomeLoading';box.hidden=true;box.setAttribute('role','status');
   box.setAttribute('aria-label','Loading your personalized home');
   box.innerHTML='<video class="hvs-bg" muted playsinline webkit-playsinline loop preload="metadata" aria-hidden="true"></video>'+
     '<div class="hvs-content"><div class="hvs-lottie" aria-hidden="true"></div>'+
     '<h2>LOADING YOUR PERSONALIZED HOME</h2><p>Restoring your property, selected finishes and cost estimate…</p>'+
     '<div class="hvs-actions" hidden><button type="button" data-retry>RETRY RESTORE</button>'+
     '<button type="button" data-continue>CONTINUE</button></div></div>';
   document.body.appendChild(box);
   return box;
 }
 function noteSetting(key,value){
   if(!scene)scene={...defaults,PropertyChoice:'one',FirstFloorLayout:'lounge'};
   if(typeof key==='string'&&key.length<128)
      scene[key]=value;
 }
 function cancel(){
   token++;active=false;
   const box=document.getElementById('hvsSavedHomeLoading');
   if(box){box.hidden=true;box.classList.remove('hvs-show','hvs-exit');}
   try{animation?.destroy();}catch(_){}
   animation=null;
   try{video?.pause();}catch(_){}
   video=null;
 }
 function show(id){
   const box=view();
   box.hidden=false;box.classList.remove('hvs-exit');
   box.querySelector('.hvs-actions').hidden=true;
   box.querySelector('h2').textContent='LOADING YOUR PERSONALIZED HOME';
   box.querySelector('p').textContent='Restoring your property, selected finishes and cost estimate…';
   const holder=box.querySelector('.hvs-lottie');holder.replaceChildren();
   video=box.querySelector('.hvs-bg');
   video.muted=true;video.defaultMuted=true;video.playsInline=true;video.style.opacity='1';
   video.src='LOADING_BG.mp4?v=20261103-h264';
   video.addEventListener('error',()=>{if(alive(id)&&video)video.style.opacity='0';},{once:true});
   try{video.play()?.catch(()=>{if(alive(id)&&video)video.style.opacity='0';});}
   catch(_){video.style.opacity='0';}
   if(window.lottie?.loadAnimation){
     try{animation=window.lottie.loadAnimation({container:holder,renderer:'svg',loop:true,autoplay:true,path:'loading intro.json'});}
     catch(error){console.warn('[HVS RESTORE] Lottie fallback',error);}
   }
   requestAnimationFrame(()=>{if(alive(id))box.classList.add('hvs-show');});
   return box;
 }
 async function waitForReady(id){
   const deadline=Date.now()+9000;
   while(alive(id)&&window.homeViewLevelReady!==true){
     if(Date.now()>=deadline)throw Error('The streaming home is not ready. Please retry.');
     await sleep(150);
   }
   if(!alive(id))throw Error('Restore cancelled');
   if(typeof window.homeViewSend!=='function')throw Error('Unreal is not connected.');
 }
 async function send(id,packet,key,value){
   if(!alive(id))throw Error('Restore cancelled');
   const result=window.homeViewSend?.(packet);
   if(result!==true)throw Error('Unable to send '+key+' to Unreal.');
   scene[key]=value;
 }
 async function apply(id,opt){
   await waitForReady(id);
   defaults={...opt.defaults};
   variantKeys=new Set(opt.finishKeys||[]);
   scene={...defaults,PropertyChoice:'one',FirstFloorLayout:'lounge',...(scene||{})};
   const want=opt.settings||{};
   const property=['one','two'].includes(want.PropertyChoice)?want.PropertyChoice:'one';
   const layout=['lounge','bedroom'].includes(want.FirstFloorLayout)?want.FirstFloorLayout:'lounge';
   if(scene.PropertyChoice!==property){
     await send(id,{property},'PropertyChoice',property);
     opt.onProperty?.(property);
     await sleep(650);
   } else opt.onProperty?.(property);
   if(scene.FirstFloorLayout!==layout){
     await send(id,{layout},'FirstFloorLayout',layout);
     await sleep(320);
   }
   opt.onLayout?.(layout);
   const order=[...new Set(['Kitchen_solid_inset','Kitchen_Top_glass','landscaping',...(opt.finishKeys||[]),'Kitchen_finish_all'])];
   for(const key of order){
     if(!alive(id))throw Error('Restore cancelled');
     if(!(key in want)&&!(key in defaults))continue;
     const value=Object.prototype.hasOwnProperty.call(want,key)?want[key]:defaults[key];
     if(value===undefined||value===scene[key])continue;
     await send(id,{[key]:value},key,value);
     await sleep(65);
   }
   await sleep(240);
 }
 async function dismiss(id){
   if(!alive(id))return false;
   const box=view();
   if(video)video.style.opacity='0'; // Fade MP4 first while the Lottie stays visible.
   await sleep(550);
   if(!alive(id))return false;
   box.classList.add('hvs-exit'); // Fade Lottie/text and the background second.
   await sleep(700);
   if(!alive(id))return false;
   cancel();return true;
 }
 async function start(options){
   cancel();
   const id=token;active=true;show(id);
   try{
     await Promise.all([apply(id,options),sleep(3000)]); // Three seconds minimum, longer if needed.
     if(!alive(id))return false;
     const success=await dismiss(id);
     if(success)options.onComplete?.(true);
     return success;
   }catch(error){
     if(!alive(id))return false;
     console.error('[HVS RESTORE] Not fully restored',error);
     const box=view();box.querySelector('h2').textContent='RESTORE NOT COMPLETED';
     box.querySelector('p').textContent='Your saved choices are still on this device. '+(error?.message||'Please retry.');
     const actions=box.querySelector('.hvs-actions');actions.hidden=false;
     return new Promise(resolve=>{
       actions.querySelector('[data-retry]').onclick=()=>{start(options).then(resolve);};
       actions.querySelector('[data-continue]').onclick=()=>{dismiss(id).then(()=>{options.onComplete?.(false);resolve(false);});};
     });
   }
 }
 window.HVSDesignRestore=Object.freeze({start,cancel,noteSetting,active:()=>active,inspect:state});
})();