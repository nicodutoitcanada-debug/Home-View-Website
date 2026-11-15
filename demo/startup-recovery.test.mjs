import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL(process.env.HVS_TEST_INDEX || './index.html',import.meta.url),'utf8');
const fn=name=>{const a=html.indexOf(`function ${name}(`);assert(a>=0,name);return html.slice(a,html.indexOf('\n}',a)+2);};

test('all inline scripts parse without importing SDKs or opening a session',()=>{
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=/.test(match[1]) || /application\/(ld\+json|json)/.test(match[1]))continue;
  if(/type\s*=\s*["']module["']/.test(match[1])) new vm.SourceTextModule(match[2]);
  else new vm.Script(match[2]);
 }
 assert.match(html,/const HVS_REQUESTED_MAX_FPS = 30;/);
 assert.equal((html.match(/new ArcwareInit\(/g)||[]).length,1);
});

function fixture({frames=true,black=false,track=true,callbacks=true}={}){
 let now=10000, queued=[], sent=[], revealed=0, notices=[];
 const video={readyState:2,videoWidth:1920,videoHeight:1080,paused:false,currentTime:1,
  getVideoPlaybackQuality:()=>({totalVideoFrames:video.frames,droppedVideoFrames:0}),frames:5,
  srcObject:{getVideoTracks:()=>track?[{readyState:'live',muted:false}]:[]}};
 const pc={connectionState:'connected',iceConnectionState:'connected'};
 const info={supportsFrames:callbacks,lastFrameAt:0,startupFrameCount:0};
 const element={hidden:false,style:{setProperty(){}},classList:{add(){},remove(){}},remove(){},pause(){}};
 const context=vm.createContext({console:{log(){},warn(){},info(){}},Date:{now:()=>now},
  performance:{now:()=>now},setTimeout:(cb,ms)=>queued.push({cb,at:now+ms}),
  requestAnimationFrame:cb=>cb(),fetch:()=>{throw Error('Network forbidden');},
  document:{hidden:false,querySelector:()=>video,getElementById:()=>element,body:{classList:element.classList}},
  window:{homeViewSessionIntentional:false,homeViewShowGameReady(){}},
  hvsRecoveryVideoMetadata:new Map([[video,info]]),hvsRegisterVideoForRecovery(){},
  hvsVideoDiagnostics:()=>({video,pc}),hvsStreamAspectMismatched:()=>false,
  hvsStartupVideoContext:{drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(32*18*4).fill(black?0:255)})},
  HVS_QUALITY_MOBILE:false,dev_mode:false,MOBILE_DIAGNOSTICS:false,
  mobileDevStatus(){},sendUnreal:message=>{sent.push(message);return true;},
  sendViewportResolutionToUnreal(){},hvsRefreshInitialPlayerFit(){},releaseUiFocus(){},
  hvsEnsureMobileStartupSettings:()=>true,hvsStartupSetNotice:(type,detail)=>notices.push({type,detail}),
  hvsStartupPlaybackGate:{reset(){}},loadingAnimation:null,
 });
 vm.runInContext(`let loadRequested=false,levelReady=false,homeViewTeardownStarted=false;
 let hvsLastGameSignal='none',hvsLastHomeLoadSentAt=0,hvsStartupRescueStartedAt=0;
 let hvsGameRevealStarted=false,hvsStartupMonitorToken=0,hvsStartupVideoWaitStarted=0;
 let hvsStartupVideoProgressElement=null,hvsStartupVideoPreviousFrames=0,hvsStartupVideoProgressAt=0;
 let hvsStartupVideoFallbackTime=0,hvsStartupVideoLastSampleTime=0,hvsStartupVideoSample='not sampled';
 let hvsStartupVideoVisibleChecks=0,hvsStartupVideoLastInspection=null;
 let unrealIsReadyForResolution=false,screenshotRequestInFlight=false;
 const HVS_STARTUP_SETTLE_MS=0;`,context);
 for(const name of ['hvsStartupProgress','hvsStartupSamplePicture','hvsStartupInspectVideo','hvsCompleteGameReveal','hvsWaitForStartupFit','revealHomeView','hvsStartStartupRescue','receiveUnrealResponse'])vm.runInContext(fn(name),context);
 return {context,video,pc,sent,notices,signal:data=>context.receiveUnrealResponse(data),
  start:()=>context.hvsStartStartupRescue(),ended:()=>vm.runInContext('window.homeViewSessionIntentional=true;homeViewTeardownStarted=true;',context),
  revealed:()=>vm.runInContext('hvsGameRevealStarted',context),
  advance(ms){const end=now+ms;while(now<end){now+=250;if(frames){video.frames+=7;video.currentTime+=.25;if(callbacks){info.lastFrameAt=now;info.startupFrameCount+=7;}}
   const due=queued.filter(t=>t.at<=now);queued=queued.filter(t=>t.at>now);due.forEach(t=>t.cb());}},
 };
}
test('two-map handshake sends exactly one load command and waits for house readiness',()=>{
 const f=fixture();f.start();f.signal('{"Game":"Loaded"}');f.signal({game:'loaded'});f.advance(6000);
 assert.equal(f.sent.length,1);assert.equal(f.sent[0].load,'homeViewDemo');assert.equal(f.revealed(),false);
 f.signal({Game:'HomeViewLevelLoaded'});f.advance(1500);assert.equal(f.revealed(),true);
});
test('direct-ready package reveals live video without any level-load command',()=>{
 const f=fixture();f.start();f.signal({Game:'HomeViewLevelLoaded'});f.advance(2000);
 assert.equal(f.revealed(),true);assert.equal(f.sent.length,0);
 f.signal({Game:'Loaded'});assert.equal(f.sent.length,0);
});
test('missed readiness reveals advancing nonblack video without speculative reload',()=>{
 const f=fixture();f.start();f.advance(6500);assert.equal(f.revealed(),true);assert.equal(f.sent.length,0);
});
for(const [name,options] of [['black video',{black:true}],['no live video track',{track:false}],['stale decoded counters',{frames:false}],['no callback or counter progression',{frames:false,callbacks:false}]]){
 test(`${name} never reveals or sends an automatic load`,()=>{const f=fixture(options);f.start();f.advance(25000);assert.equal(f.revealed(),false);assert.equal(f.sent.length,0);assert(f.notices.length>0);});
}
test('browser without frame callbacks can reveal from advancing counters/media time',()=>{const f=fixture({callbacks:false});f.start();f.advance(6500);assert.equal(f.revealed(),true);});
test('disconnect cancels live-video eligibility even with stale counters',()=>{const f=fixture();f.start();f.advance(1500);f.pc.connectionState='disconnected';f.advance(25000);assert.equal(f.revealed(),false);assert.equal(f.sent.length,0);});
test('manual session end prevents late readiness and queued rescue work',()=>{const f=fixture();f.start();f.ended();f.signal({Game:'Loaded'});f.signal({Game:'HomeViewLevelLoaded'});f.advance(25000);assert.equal(f.revealed(),false);assert.equal(f.sent.length,0);});
test('response listener is installed before optional startup setup',()=>{
 const start=html.indexOf('application = setup.Application;');
 assert(html.indexOf('application.getApplicationResponse(receiveUnrealResponse)',start)<html.indexOf('hvsStartAdaptiveQuality(setup.Config)',start));
 assert(!fn('hvsStartStartupRescue').includes('sendUnreal('));
});
