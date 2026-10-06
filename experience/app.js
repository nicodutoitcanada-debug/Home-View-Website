const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');

const continueBtn = document.getElementById('continueBtn');
const playCluster = document.getElementById('playCluster');
const homeBtn = document.getElementById('homeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const blueBackground = document.getElementById('blueBackground');
const pageOneCopy = document.getElementById('pageOneCopy');

const titleSequence = document.getElementById('titleSequence');
const titleSequenceFrame = document.getElementById('titleSequenceFrame');
const sequenceContinueBtn = document.getElementById('sequenceContinueBtn');

const planStage = document.getElementById('planStage');
const topView = document.getElementById('topView');
const planBranding = document.getElementById('planBranding');
const cameraAssembly = document.getElementById('cameraAssembly');
const camViewMaskLayer = document.getElementById('camViewMaskLayer');
const technologyPanel = document.getElementById('technologyPanel');
const technologyContinueBtn = document.getElementById('technologyContinueBtn');

const panoramaStage = document.getElementById('panoramaStage');
const panoramaFlatImage = document.getElementById('panoramaFlatImage');
const panoramaPanel = document.getElementById('panoramaPanel');
const panoramaContinueBtn = document.getElementById('panoramaContinueBtn');

const sphereStage = document.getElementById('sphereStage');
const sphereCanvasHost = document.getElementById('sphereCanvasHost');
const sphereOutsideGuide = document.getElementById('sphereOutsideGuide');
const sphereInsideGuide = document.getElementById('sphereInsideGuide');
const sphereOutsideControls = document.getElementById('sphereOutsideControls');
const sphereInsideControls = document.getElementById('sphereInsideControls');
const sphereEnterBtn = document.getElementById('sphereEnterBtn');
const sphereBackBtn = document.getElementById('sphereBackBtn');
const sphereContinueBtn = document.getElementById('sphereContinueBtn');
const sphereFallback = document.getElementById('sphereFallback');
const sphereFallbackBackBtn = document.getElementById('sphereFallbackBackBtn');

const leapStage = document.getElementById('leapStage');
const leapTextOne = document.getElementById('leapTextOne');
const leapTextTwo = document.getElementById('leapTextTwo');
const titleSequence2 = document.getElementById('titleSequence2');
const titleSequenceFrame2 = document.getElementById('titleSequenceFrame2');
const sequenceContinueBtn2 = document.getElementById('sequenceContinueBtn2');

const videoShowcaseStage = document.getElementById('videoShowcaseStage');
const videoShowcaseCard = document.getElementById('videoShowcaseCard');
const showcaseVideo = document.getElementById('showcaseVideo');

const showcaseVideoLoader = document.getElementById('showcaseVideoLoader');
const showcaseVideoLoaderLottie = document.getElementById('showcaseVideoLoaderLottie');
const showcaseVideoShell = document.querySelector('.showcase-video-shell');

const showcaseCopy = document.getElementById('showcaseCopy');
const showcaseNextBtn = document.getElementById('showcaseNextBtn');

const showcasePlayBtn = document.getElementById('showcasePlayBtn');
const showcasePauseBtn = document.getElementById('showcasePauseBtn');
const showcaseRestartBtn = document.getElementById('showcaseRestartBtn');
const showcasePlaybackControls = document.querySelector('.showcase-playback-controls');

const oldMethodStage = document.getElementById('oldMethodStage');
const oldMethodVideo = document.getElementById('oldMethodVideo');
const oldMethodContinueBtn = document.getElementById('oldMethodContinueBtn');

const newMethodStage = document.getElementById('newMethodStage');
const newMethodVideo = document.getElementById('newMethodVideo');
const newMethodContinueBtn = document.getElementById('newMethodContinueBtn');

const ownershipStage = document.getElementById('ownershipStage');
const ownershipBackground = document.getElementById('ownershipBackground');
const ownershipContent = document.getElementById('ownershipContent');
const ownershipContinueBtn = document.getElementById('ownershipContinueBtn');

const speedStage = document.getElementById('speedStage');
const speedBlueBackground = document.getElementById('speedBlueBackground');
const speedMountain = document.getElementById('speedMountain');
const speedContinueBtn = document.getElementById('speedContinueBtn');

const speedMobileLayout = document.getElementById('speedMobileLayout');
const speedMobileContinueBtn = document.getElementById('speedMobileContinueBtn');


const finalDemoStage = document.getElementById('finalDemoStage');
const finalBlueBackground = document.getElementById('finalBlueBackground');
const finalTitleSequence = document.getElementById('finalTitleSequence');
const finalTitleSequenceFrame = document.getElementById('finalTitleSequenceFrame');
const finalContactPanel = document.getElementById('finalContactPanel');
const copyMarieEmailBtn = document.getElementById('copyMarieEmailBtn');
const copyMarieEmailStatus = document.getElementById('copyMarieEmailStatus');

const loadingOverlay = document.getElementById('loadingOverlay');
const loadingLottie = document.getElementById('loadingLottie');









const showcaseFooter = document.querySelector('.showcase-footer');



let introStarted = false;
let sequenceRAF = null;
let currentFrame = 0;
let page2Timers = [];

let leapTimers = [];
let sequence2RAF = null;
let currentFrame2 = 0;
let leapTransitionRunning = false;
let showcaseClip = 1;
let showcaseTransitionRunning = false;
let showcaseClipChangeRunning = false;
let showcaseVideoLoaderAnimation = null;

const showcaseBufferPool = new Map();
let showcaseBackgroundBufferStarted = false;

let oldMethodTransitionRunning = false;
let oldMethodTimers = [];
let newMethodTransitionRunning = false;
let newMethodTimers = [];
let ownershipTransitionRunning = false;
let ownershipTimers = [];
let speedTransitionRunning = false;
let speedTimers = [];
let finalTransitionRunning = false;
let finalSequenceRAF = null;
let finalCurrentFrame = 0;


const FIRST_FRAME = 0;
const LAST_FRAME = 68;
const FRAME_RATE = 24;
const FRAME_DURATION = 1000 / FRAME_RATE;

/* =========================================================
   HELPERS
   ========================================================= */

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
const lerp = (a,b,t) => a + (b-a) * t;

function easeInOutCubic(t){
  return t < .5
    ? 4*t*t*t
    : 1 - Math.pow(-2*t + 2,3) / 2;
}

function cssPercent(name){
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return parseFloat(raw) / 100;
}


/* =========================================================
   V29 — LOADING + STEP-AHEAD PRELOADING
   ========================================================= */

const preloadCache = new Map();
let loadingAnimation = null;
let loadingDepth = 0;

function initLoadingLottie(){
  if(loadingAnimation || !loadingLottie || !window.lottie) return;

  loadingAnimation = window.lottie.loadAnimation({
    container: loadingLottie,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'Lottie/loading intro.json'
  });
}


function initShowcaseVideoLoader(){
  if(showcaseVideoLoaderAnimation || !showcaseVideoLoaderLottie) return;

  if(!window.lottie){
    console.warn('Lottie library is not available for the showcase video loader.');
    return;
  }

  showcaseVideoLoaderAnimation = window.lottie.loadAnimation({
    container: showcaseVideoLoaderLottie,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'Lottie/loading intro.json',
    rendererSettings:{
      preserveAspectRatio:'xMidYMid meet'
    }
  });
}

function showShowcaseVideoLoader(){
  initShowcaseVideoLoader();

  showcaseVideoShell.classList.add('is-loading');
  showcaseVideoLoader.classList.add('is-visible');
  showcaseVideoLoader.setAttribute('aria-hidden','false');

  if(showcaseVideoLoaderAnimation){
    showcaseVideoLoaderAnimation.stop();
    showcaseVideoLoaderAnimation.goToAndPlay(0,true);
  }
}

function hideShowcaseVideoLoader(){
  showcaseVideoShell.classList.remove('is-loading');
  showcaseVideoLoader.classList.remove('is-visible');
  showcaseVideoLoader.setAttribute('aria-hidden','true');

  if(showcaseVideoLoaderAnimation){
    showcaseVideoLoaderAnimation.stop();
  }
}

function showLoading(){
  loadingDepth += 1;
  initLoadingLottie();

  loadingOverlay.classList.add('is-visible');
  loadingOverlay.setAttribute('aria-hidden','false');

  if(loadingAnimation){
    loadingAnimation.play();
  }
}

function hideLoading(){
  loadingDepth = Math.max(0,loadingDepth-1);
  if(loadingDepth > 0) return;

  loadingOverlay.classList.remove('is-visible');
  loadingOverlay.setAttribute('aria-hidden','true');
}

function cachePromise(key,factory){
  if(preloadCache.has(key)){
    return preloadCache.get(key);
  }

  const promise = factory().catch(err => {
    preloadCache.delete(key);
    throw err;
  });

  preloadCache.set(key,promise);
  return promise;
}

function preloadImageFile(src){
  return cachePromise(`img:${src}`,() => new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Image failed to load: ${src}`));
    img.src = src;
  }));
}

function preloadVideoFile(src){
  return cachePromise(`video:${src}`,() => new Promise((resolve,reject) => {
    const video = document.createElement('video');
    let settled = false;

    const finish = () => {
      if(settled) return;
      settled = true;
      cleanup();
      resolve(src);
    };

    const fail = () => {
      if(settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Video failed to preload: ${src}`));
    };

    const cleanup = () => {
      video.removeEventListener('loadeddata',finish);
      video.removeEventListener('canplaythrough',finish);
      video.removeEventListener('error',fail);
    };

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    video.addEventListener('loadeddata',finish,{once:true});
    video.addEventListener('canplaythrough',finish,{once:true});
    video.addEventListener('error',fail,{once:true});

    video.src = src;
    video.load();

    // Do not hang forever on browsers that are conservative with preloading.
    setTimeout(finish,8000);
  }));
}

function preloadSequenceFolder(folder){
  const promises = [];

  for(let i=FIRST_FRAME;i<=LAST_FRAME;i++){
    const src = `Sequences/${folder}/Title${String(i).padStart(2,'0')}.png`;
    promises.push(preloadImageFile(src));
  }

  return Promise.all(promises);
}

async function waitForAssets(promises){
  const list = promises.filter(Boolean);
  if(!list.length) return;

  let finished = false;
  let loaderShown = false;

  const timer = setTimeout(() => {
    if(!finished){
      loaderShown = true;
      showLoading();
    }
  },140);

  try{
    await Promise.all(list);
  }catch(err){
    console.warn('Asset preload warning:',err);
  }finally{
    finished = true;
    clearTimeout(timer);

    if(loaderShown){
      hideLoading();
    }
  }
}

/*
  Proactive preloads NEVER show the loader.
  They quietly warm the browser cache while the user is viewing
  the current step.
*/
function warmNextStep(...promises){
  Promise.all(promises.filter(Boolean)).catch(err => {
    console.warn('Background preload warning:',err);
  });
}

function preloadPlanStep(){
  return Promise.all([
    preloadImageFile('logo.png'),
    preloadImageFile('Plan/top view.png'),
    preloadImageFile('Plan/camera.png'),
    preloadImageFile('Plan/cam view.png'),
    preloadImageFile('Plan/mask.jpg')
  ]);
}


function getBufferedShowcaseVideo(clip){
  if(showcaseBufferPool.has(clip)){
    return showcaseBufferPool.get(clip);
  }

  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline','');
  video.style.position = 'fixed';
  video.style.width = '1px';
  video.style.height = '1px';
  video.style.opacity = '0';
  video.style.pointerEvents = 'none';
  video.style.left = '-9999px';
  video.style.top = '-9999px';
  video.src = `MP4/Vid_${String(clip).padStart(2,'0')}.mp4`;

  /*
    Keeping the preload video attached is intentional.
    Mobile browsers are much more likely to continue buffering an attached
    media element than a detached temporary one.
  */
  document.body.appendChild(video);
  video.load();

  showcaseBufferPool.set(clip,video);
  return video;
}

function bufferShowcaseClip(clip){
  const video = getBufferedShowcaseVideo(clip);

  // Calling load again is harmless and encourages mobile browsers to resume
  // fetching if they previously suspended the preload.
  if(video.readyState < 3){
    try{ video.load(); }catch(err){}
  }

  return video;
}

function warmShowcaseAhead(fromClip){
  /*
    Buffer TWO clips ahead instead of only one.
    9–16 MB videos are large for mobile, so this gives the browser much more
    time while the viewer is reading/watching the current slide.
  */
  for(let clip=fromClip+1; clip<=Math.min(5,fromClip+2); clip++){
    bufferShowcaseClip(clip);
    warmNextStep(preloadShowcaseClip(clip));
  }
}

function beginShowcaseBackgroundBuffering(){
  if(showcaseBackgroundBufferStarted) return;
  showcaseBackgroundBufferStarted = true;

  /*
    Prime Vid_01 and Vid_02 immediately. Then gently queue the remaining
    clips rather than firing five large downloads at exactly the same time.
  */
  bufferShowcaseClip(1);
  bufferShowcaseClip(2);

  setTimeout(() => bufferShowcaseClip(3),1200);
  setTimeout(() => bufferShowcaseClip(4),2600);
  setTimeout(() => bufferShowcaseClip(5),4200);
}

function preloadShowcaseClip(clip){
  bufferShowcaseClip(clip);
  return preloadVideoFile(`MP4/Vid_${String(clip).padStart(2,'0')}.mp4`);
}

function preloadOldMethodStep(){
  return preloadVideoFile('MP4/old method.mp4');
}

function preloadNewMethodStep(){
  return preloadVideoFile('MP4/new method.mp4');
}

function preloadOwnershipStep(){
  return preloadImageFile('stage.jpg');
}

function preloadGraphStep(){
  return Promise.all([
    preloadVideoFile('Blue Background.mp4'),
    preloadImageFile('mountain.png'),
    preloadImageFile('logo.png'),
    preloadImageFile('assets/speed-lightning.svg'),
    preloadImageFile('assets/speed-bars.svg'),
    preloadImageFile('assets/speed-trophy.svg')
  ]);
}


/* =========================================================
   PAGE 1
   ========================================================= */

function framePath(frame){
  return `Sequences/Title 01/Title${String(frame).padStart(2,'0')}.png`;
}

function preloadSequence(){
  return preloadSequenceFolder('Title 01');
}

function playTitleSequence(){
  currentFrame = FIRST_FRAME;
  titleSequence.classList.add('is-visible');
  titleSequenceFrame.src = framePath(currentFrame);

  const start = performance.now();

  function tick(now){
    const frame = Math.min(
      LAST_FRAME,
      Math.floor((now-start)/FRAME_DURATION)
    );

    if(frame !== currentFrame){
      currentFrame = frame;
      titleSequenceFrame.src = framePath(currentFrame);
    }

    if(currentFrame < LAST_FRAME){
      sequenceRAF = requestAnimationFrame(tick);
    }else{
      titleSequenceFrame.src = framePath(LAST_FRAME);
      sequenceRAF = null;
      sequenceContinueBtn.classList.add('is-visible');

      // While the user looks at this frame, preload the next slide.
      warmNextStep(preloadPlanStep());
    }
  }

  sequenceRAF = requestAnimationFrame(tick);
}

async function startCurrentTechnology(){
  if(introStarted) return;
  introStarted = true;

  await waitForAssets([
    preloadVideoFile('Blue Background.mp4'),
    preloadSequenceFolder('Title 01')
  ]);

  blueBackground.classList.add('is-active');
  blueBackground.currentTime = 0;

  const playPromise = blueBackground.play();
  if(playPromise){
    playPromise.catch(err => {
      console.warn('Blue Background.mp4 could not play:',err);
    });
  }

  pageOneCopy.classList.add('is-fading');
  playCluster.classList.add('is-exiting');

  setTimeout(playTitleSequence,500);
}

/* =========================================================
   PAGE 2
   ========================================================= */

function clearPage2Timers(){
  page2Timers.forEach(clearTimeout);
  page2Timers = [];
}

function resetPlanSlideVisuals(){
  clearPage2Timers();

  topView.classList.remove('is-visible');
  planBranding.classList.remove('is-visible','is-fading-out');
  cameraAssembly.classList.remove('is-visible');
  camViewMaskLayer.classList.remove('is-visible','is-fading-out');
  technologyPanel.classList.remove('is-visible','is-fading-out');
}

async function enterPlanSlide(){
  await waitForAssets([preloadPlanStep()]);

  page1.classList.add('is-leaving');

  setTimeout(() => {
    blueBackground.pause();

    page1.classList.remove('active');
    page1.classList.remove('is-leaving');

    page2.classList.add('active');
    resetPlanSlideVisuals();

    requestAnimationFrame(() => {
      topView.classList.add('is-visible');
      planBranding.classList.add('is-visible');
    });

    page2Timers.push(setTimeout(() => {
      cameraAssembly.classList.add('is-visible');
    },950));

    page2Timers.push(setTimeout(() => {
      camViewMaskLayer.classList.add('is-visible');
    },1900));

    page2Timers.push(setTimeout(() => {
      technologyPanel.classList.add('is-visible');
    },2700));

  },480);
}

/* =========================================================
   CAMERA -> FLAT PANORAMA
   ========================================================= */

function setPanoramaTransformOriginFromCamera(){
  const rect = planStage.getBoundingClientRect();
  const x = rect.left + rect.width * cssPercent('--camera-x');
  const y = rect.top + rect.height * cssPercent('--camera-y');

  panoramaStage.style.setProperty('--pan-origin-x',`${x}px`);
  panoramaStage.style.setProperty('--pan-origin-y',`${y}px`);
}

async function openPanoramaExplanation(){
  if(!page2.classList.contains('active')) return;

  technologyContinueBtn.disabled = true;

  technologyPanel.classList.add('is-fading-out');
  planBranding.classList.add('is-fading-out');
  camViewMaskLayer.classList.add('is-fading-out');

  setPanoramaTransformOriginFromCamera();

  panoramaStage.classList.add('is-visible');
  panoramaStage.setAttribute('aria-hidden','false');

  // force initial collapsed state to paint
  panoramaStage.getBoundingClientRect();

  await wait(250);

  panoramaStage.classList.add('is-expanding');

  await wait(1250);

  panoramaStage.classList.remove('is-expanding');
  panoramaStage.classList.add('is-expanded');

  // Everything from the previous slide can now disappear.
  page2.classList.remove('active');

  await wait(180);
  panoramaPanel.classList.add('is-visible');
}

/* =========================================================
   SPHERE ENGINE
   ========================================================= */

let THREE = null;
let sphereReady = false;
let sphereRenderer = null;
let sphereScene = null;
let sphereCamera = null;
let sphereGroup = null;
let sphereGeometry = null;
let sphereOuterMesh = null;
let sphereInnerMesh = null;
let sphereOuterMaterial = null;
let sphereInnerMaterial = null;
let planePositions = null;
let ballPositions = null;

let sphereMode = 'hidden';
let renderRAF = null;

let sphereDragging = false;
let pointerId = null;
let lastX = 0;
let lastY = 0;
let insideYaw = 0;
let insidePitch = 0;

const PLANE_WIDTH = 4;
const PLANE_HEIGHT = 2;
const SPHERE_RADIUS = 1.52;
const WRAP_TIME = 2300;
const ENTER_TIME = 1800;
const OUTSIDE_Z = 4.75;
const OUTSIDE_FOV = 38;
const INSIDE_FOV = 72;
const OUTSIDE_OPACITY = .62;

function buildMorphGeometry(){
  const lowSpec =
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  const hSeg = lowSpec ? 48 : 64;
  const vSeg = lowSpec ? 24 : 32;
  const vertexCount = (hSeg+1)*(vSeg+1);

  const positions = new Float32Array(vertexCount*3);
  const uvs = new Float32Array(vertexCount*2);
  planePositions = new Float32Array(vertexCount*3);
  ballPositions = new Float32Array(vertexCount*3);

  let pi = 0;
  let ui = 0;

  for(let y=0;y<=vSeg;y++){
    const v = y/vSeg;
    const phi = v*Math.PI;

    for(let x=0;x<=hSeg;x++){
      const u = x/hSeg;

      const px = (u-.5)*PLANE_WIDTH;
      const py = (.5-v)*PLANE_HEIGHT;
      const pz = 0;

      planePositions[pi] = px;
      planePositions[pi+1] = py;
      planePositions[pi+2] = pz;

      const theta = (u-.5)*Math.PI*2;
      const sinPhi = Math.sin(phi);

      const sx = SPHERE_RADIUS*sinPhi*Math.sin(theta);
      const sy = SPHERE_RADIUS*Math.cos(phi);
      const sz = SPHERE_RADIUS*sinPhi*Math.cos(theta);

      ballPositions[pi] = sx;
      ballPositions[pi+1] = sy;
      ballPositions[pi+2] = sz;

      positions[pi] = px;
      positions[pi+1] = py;
      positions[pi+2] = pz;

      pi += 3;

      uvs[ui] = u;
      uvs[ui+1] = 1-v;
      ui += 2;
    }
  }

  const indices = [];

  for(let y=0;y<vSeg;y++){
    for(let x=0;x<hSeg;x++){
      const a = y*(hSeg+1)+x;
      const b = a+1;
      const c = (y+1)*(hSeg+1)+x;
      const d = c+1;
      indices.push(a,c,b,b,c,d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));
  geometry.setIndex(indices);

  return geometry;
}

function setSphereMorph(value){
  const t = clamp(value,0,1);
  const positions = sphereGeometry.attributes.position.array;

  for(let i=0;i<positions.length;i++){
    positions[i] = lerp(planePositions[i],ballPositions[i],t);
  }

  sphereGeometry.attributes.position.needsUpdate = true;
}

function calculateFlatCameraZ(){
  const aspect = Math.max(.01,sphereCanvasHost.clientWidth / sphereCanvasHost.clientHeight);
  const vfov = THREE.MathUtils.degToRad(30);
  const hfov = 2*Math.atan(Math.tan(vfov/2)*aspect);

  const zForHeight = (PLANE_HEIGHT/2)/Math.tan(vfov/2);
  const zForWidth = (PLANE_WIDTH/2)/Math.tan(hfov/2);

  return Math.max(zForHeight,zForWidth);
}

function resizeSphere(){
  if(!sphereRenderer || !sphereCamera) return;

  const width = Math.max(1,sphereCanvasHost.clientWidth);
  const height = Math.max(1,sphereCanvasHost.clientHeight);

  sphereRenderer.setSize(width,height,false);
  sphereCamera.aspect = width/height;
  sphereCamera.updateProjectionMatrix();

  if(sphereMode === 'flat'){
    sphereCamera.position.z = calculateFlatCameraZ();
    sphereCamera.fov = 30;
    sphereCamera.updateProjectionMatrix();
  }
}

function renderSphere(){
  if(!sphereRenderer || !sphereScene || !sphereCamera) return;
  sphereRenderer.render(sphereScene,sphereCamera);
}

function startSphereLoop(){
  if(renderRAF) return;

  const tick = () => {
    if(!sphereStage.classList.contains('is-visible')){
      renderRAF = null;
      return;
    }

    renderSphere();
    renderRAF = requestAnimationFrame(tick);
  };

  tick();
}

async function ensureSphereEngine(){
  if(sphereReady) return true;

  try{
    let lastError = null;

    for(const moduleUrl of [
      'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm',
      'https://unpkg.com/three@0.180.0/build/three.module.js'
    ]){
      try{
        THREE = await import(moduleUrl);
        lastError = null;
        break;
      }catch(error){
        lastError = error;
      }
    }

    if(!THREE){
      console.error('Three.js could not load',lastError);
      return false;
    }

    sphereScene = new THREE.Scene();
    sphereScene.background = new THREE.Color(0x000000);

    sphereCamera = new THREE.PerspectiveCamera(30,1,.01,100);

    sphereRenderer = new THREE.WebGLRenderer({
      antialias:false,
      alpha:false,
      powerPreference:'default',
      failIfMajorPerformanceCaveat:false
    });

    sphereRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1));
    sphereRenderer.outputColorSpace = THREE.SRGBColorSpace;
    sphereCanvasHost.appendChild(sphereRenderer.domElement);

    sphereGeometry = buildMorphGeometry();

    const texture = new THREE.Texture(panoramaFlatImage);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    sphereOuterMaterial = new THREE.MeshBasicMaterial({
      map:texture,
      transparent:true,
      opacity:1,
      side:THREE.DoubleSide,
      depthWrite:false
    });

    sphereInnerMaterial = new THREE.MeshBasicMaterial({
      map:texture,
      transparent:true,
      opacity:0,
      side:THREE.BackSide,
      depthWrite:false
    });

    sphereOuterMesh = new THREE.Mesh(sphereGeometry,sphereOuterMaterial);
    sphereInnerMesh = new THREE.Mesh(sphereGeometry,sphereInnerMaterial);
    sphereInnerMesh.scale.x = -1;
    sphereInnerMesh.visible = false;

    sphereGroup = new THREE.Group();
    sphereGroup.add(sphereOuterMesh);
    sphereGroup.add(sphereInnerMesh);
    sphereScene.add(sphereGroup);

    sphereReady = true;
    resizeSphere();
    installSphereInteraction();

    return true;

  }catch(error){
    console.error('Sphere engine failed:',error);
    return false;
  }
}

function resetSphereToFlat(){
  if(!sphereReady) return;

  sphereMode = 'flat';

  setSphereMorph(0);

  sphereGroup.rotation.set(0,0,0);

  sphereOuterMesh.visible = true;
  sphereInnerMesh.visible = false;

  sphereOuterMaterial.opacity = 1;
  sphereInnerMaterial.opacity = 0;

  sphereCamera.position.set(0,0,calculateFlatCameraZ());
  sphereCamera.fov = 30;
  sphereCamera.updateProjectionMatrix();
  sphereCamera.lookAt(0,0,0);

  insideYaw = 0;
  insidePitch = 0;

  renderSphere();
}

function hideSphereUI(){
  sphereOutsideGuide.classList.remove('is-visible');
  sphereInsideGuide.classList.remove('is-visible');
  sphereOutsideControls.classList.remove('is-visible');
  sphereInsideControls.classList.remove('is-visible');
}

function showOutsideSphereUI(){
  hideSphereUI();
  sphereOutsideGuide.classList.add('is-visible');
  sphereOutsideControls.classList.add('is-visible');
}

function showInsideSphereUI(){
  hideSphereUI();
  sphereInsideGuide.classList.add('is-visible');
  sphereInsideControls.classList.add('is-visible');
}

async function openSphereFromPanorama(){
  panoramaContinueBtn.disabled = true;
  panoramaPanel.classList.remove('is-visible');

  let ready = false;
  showLoading();
  try{
    ready = await ensureSphereEngine();
  }finally{
    hideLoading();
  }

  if(!ready){
    sphereStage.classList.add('is-visible');
    sphereStage.setAttribute('aria-hidden','false');
    sphereFallback.classList.add('is-visible');
    return;
  }

  sphereStage.classList.add('is-visible');
  sphereStage.setAttribute('aria-hidden','false');
  sphereFallback.classList.remove('is-visible');

  resizeSphere();
  resetSphereToFlat();
  hideSphereUI();

  sphereRenderer.domElement.style.opacity = '0';

  startSphereLoop();

  /*
    This is the original working handoff:
    keep the HTML panorama beneath the WebGL flat image until
    the WebGL canvas is ready, then swap them.
  */
  await wait(40);
  sphereRenderer.domElement.style.opacity = '1';

  await wait(170);

  panoramaStage.classList.remove('is-visible','is-expanded','is-expanding');
  panoramaStage.setAttribute('aria-hidden','true');

  /*
    The old version held here for 500ms, which made the handoff
    feel like a black flash. Keep only a very short settling delay.
  */
  await wait(60);

  await animatePanoramaIntoSphere();
}

async function animatePanoramaIntoSphere(){
  sphereMode = 'wrapping';
  hideSphereUI();

  const flatZ = calculateFlatCameraZ();
  const startTime = performance.now();

  await new Promise(resolve => {
    function step(now){
      const raw = clamp((now-startTime)/WRAP_TIME,0,1);
      const t = easeInOutCubic(raw);

      setSphereMorph(t);

      sphereCamera.position.z = lerp(flatZ,OUTSIDE_Z,t);
      sphereCamera.fov = lerp(30,OUTSIDE_FOV,t);
      sphereCamera.updateProjectionMatrix();
      sphereCamera.lookAt(0,0,0);

      sphereOuterMaterial.opacity = lerp(1,OUTSIDE_OPACITY,t);

      if(raw >= 1){
        resolve();
        return;
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });

  sphereMode = 'outside';
  showOutsideSphereUI();
}

function updateInsideCamera(){
  const cosPitch = Math.cos(insidePitch);

  const direction = new THREE.Vector3(
    Math.sin(insideYaw)*cosPitch,
    Math.sin(insidePitch),
    -Math.cos(insideYaw)*cosPitch
  );

  sphereCamera.lookAt(direction);
}

async function enterSphere(){
  if(sphereMode !== 'outside') return;

  sphereMode = 'entering';
  hideSphereUI();

  const startZ = sphereCamera.position.z;
  const startFov = sphereCamera.fov;
  const startTime = performance.now();

  sphereInnerMesh.visible = true;

  await new Promise(resolve => {
    function step(now){
      const raw = clamp((now-startTime)/ENTER_TIME,0,1);
      const t = easeInOutCubic(raw);

      /*
        Stay just inside the shell at z=.02.
        This is the known-working camera path and avoids the renderer
        instability that occurred at exact z=0.
      */
      sphereCamera.position.z = lerp(startZ,.02,t);
      sphereCamera.fov = lerp(startFov,INSIDE_FOV,t);
      sphereCamera.updateProjectionMatrix();
      sphereCamera.lookAt(0,0,0);

      const insideAmount = clamp((raw-.52)/.28,0,1);
      sphereInnerMaterial.opacity = insideAmount;
      sphereOuterMaterial.opacity = OUTSIDE_OPACITY*(1-insideAmount);

      if(raw >= 1){
        resolve();
        return;
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });

  sphereOuterMesh.visible = false;
  sphereInnerMesh.visible = true;
  sphereInnerMaterial.opacity = 1;

  /*
    IMPORTANT: do not snap from .02 to 0 here.
    That snap was the small forward jump you were seeing when
    the inside controls appeared.
  */
  sphereCamera.position.set(0,0,.02);
  sphereCamera.fov = INSIDE_FOV;
  sphereCamera.updateProjectionMatrix();

  insideYaw = 0;
  insidePitch = 0;

  sphereMode = 'inside';
  updateInsideCamera();
  renderSphere();

  await wait(70);
  showInsideSphereUI();
}

async function backOutsideSphere(){
  if(sphereMode !== 'inside') return;

  sphereMode = 'exiting';
  hideSphereUI();

  sphereOuterMesh.visible = true;
  sphereOuterMaterial.opacity = 0;

  const startTime = performance.now();

  await new Promise(resolve => {
    function step(now){
      const raw = clamp((now-startTime)/ENTER_TIME,0,1);
      const t = easeInOutCubic(raw);

      sphereCamera.position.z = lerp(.02,OUTSIDE_Z,t);
      sphereCamera.fov = lerp(INSIDE_FOV,OUTSIDE_FOV,t);
      sphereCamera.updateProjectionMatrix();
      sphereCamera.lookAt(0,0,0);

      const outsideAmount = clamp((raw-.42)/.33,0,1);
      sphereInnerMaterial.opacity = 1-outsideAmount;
      sphereOuterMaterial.opacity = OUTSIDE_OPACITY*outsideAmount;

      if(raw >= 1){
        resolve();
        return;
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });

  sphereInnerMesh.visible = false;
  sphereInnerMaterial.opacity = 0;
  sphereOuterMesh.visible = true;
  sphereOuterMaterial.opacity = OUTSIDE_OPACITY;

  sphereMode = 'outside';
  showOutsideSphereUI();
}

function installSphereInteraction(){
  sphereCanvasHost.addEventListener('pointerdown',event => {
    if(sphereMode !== 'outside' && sphereMode !== 'inside') return;

    sphereDragging = true;
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    sphereStage.classList.add('is-dragging');

    sphereCanvasHost.setPointerCapture(event.pointerId);
  });

  sphereCanvasHost.addEventListener('pointermove',event => {
    if(!sphereDragging || event.pointerId !== pointerId) return;

    const dx = event.clientX-lastX;
    const dy = event.clientY-lastY;

    lastX = event.clientX;
    lastY = event.clientY;

    if(sphereMode === 'outside'){
      sphereGroup.rotation.y += dx*.0055;
      sphereGroup.rotation.x = clamp(
        sphereGroup.rotation.x + dy*.0045,
        -1.1,
        1.1
      );
    }

    if(sphereMode === 'inside'){
      insideYaw -= dx*.005;
      insidePitch = clamp(
        insidePitch - dy*.005,
        -1.48,
        1.48
      );

      updateInsideCamera();
    }

    renderSphere();
  });

  const endDrag = event => {
    if(event.pointerId !== pointerId) return;
    sphereDragging = false;
    pointerId = null;
    sphereStage.classList.remove('is-dragging');
  };

  sphereCanvasHost.addEventListener('pointerup',endDrag);
  sphereCanvasHost.addEventListener('pointercancel',endDrag);

  sphereCanvasHost.addEventListener('wheel',event => {
    if(sphereMode !== 'inside') return;

    event.preventDefault();

    sphereCamera.fov = clamp(
      sphereCamera.fov + event.deltaY*.025,
      45,
      90
    );

    sphereCamera.updateProjectionMatrix();
    renderSphere();
  },{passive:false});
}


/* =========================================================
   V12 — GIANT LEAP -> TITLE 02
   ========================================================= */

function framePath2(frame){
  return `Sequences/Title 02/Title${String(frame).padStart(2,'0')}.png`;
}

function preloadSequence2(){
  return preloadSequenceFolder('Title 02');
}

function clearLeapTimers(){
  leapTimers.forEach(clearTimeout);
  leapTimers = [];
}

function resetLeapSection(){
  clearLeapTimers();
  leapTransitionRunning = false;

  if(sequence2RAF){
    cancelAnimationFrame(sequence2RAF);
    sequence2RAF = null;
  }

  leapTextOne.classList.remove('is-playing');
  leapTextTwo.classList.remove('is-playing');

  titleSequence2.classList.remove('is-visible');
  titleSequenceFrame2.removeAttribute('src');

  sequenceContinueBtn2.classList.remove('is-visible');

  leapStage.classList.remove(
    'is-visible',
    'is-black',
    'is-blue',
    'title-phase'
  );
  leapStage.setAttribute('aria-hidden','true');
}

function playTitleSequence2(){
  currentFrame2 = FIRST_FRAME;

  titleSequence2.classList.add('is-visible');
  titleSequence2.setAttribute('aria-hidden','false');
  titleSequenceFrame2.src = framePath2(currentFrame2);

  const start = performance.now();

  function tick(now){
    const frame = Math.min(
      LAST_FRAME,
      Math.floor((now-start)/FRAME_DURATION)
    );

    if(frame !== currentFrame2){
      currentFrame2 = frame;
      titleSequenceFrame2.src = framePath2(currentFrame2);
    }

    if(currentFrame2 < LAST_FRAME){
      sequence2RAF = requestAnimationFrame(tick);
    }else{
      titleSequenceFrame2.src = framePath2(LAST_FRAME);
      sequence2RAF = null;
      sequenceContinueBtn2.classList.add('is-visible');

      // Start buffering the gameplay section while the user is still
      // looking at the Title 02 end frame.
      beginShowcaseBackgroundBuffering();
      warmNextStep(
        preloadShowcaseClip(1),
        preloadShowcaseClip(2)
      );
    }
  }

  sequence2RAF = requestAnimationFrame(tick);
}

function startTitle02Phase(){
  // Start the looping blue background at the same moment that
  // "Introducing..." begins its final fade.
  blueBackground.classList.add('is-active');
  blueBackground.currentTime = 0;

  const playPromise = blueBackground.play();
  if(playPromise){
    playPromise.catch(err => {
      console.warn('Blue Background.mp4 could not play:',err);
    });
  }

  leapStage.classList.add('is-blue','title-phase');

  playTitleSequence2();
}

async function openLeapSection(){
  if(leapTransitionRunning) return;
  if(!sphereStage.classList.contains('is-visible')) return;

  leapTransitionRunning = true;

  // Remove all sphere UI first, then fade the complete 360 section to black.
  hideSphereUI();

  leapStage.classList.add('is-visible');
  leapStage.setAttribute('aria-hidden','false');

  // Ensure the initial transparent state paints before fading to black.
  leapStage.getBoundingClientRect();

  requestAnimationFrame(() => {
    leapStage.classList.add('is-black');
  });

  await wait(520);

  sphereStage.classList.remove('is-visible','is-dragging');
  sphereStage.setAttribute('aria-hidden','true');
  sphereMode = 'hidden';

  // Brief clean black hold.
  await wait(280);

  // Message 1
  leapTextOne.classList.add('is-playing');
  await wait(3200);
  leapTextOne.classList.remove('is-playing');

  // Tiny breathing gap between the two phrases.
  await wait(120);

  // Message 2
  leapTextTwo.classList.add('is-playing');

  // Its fade-out starts near the end. At that exact point,
  // bring in Blue Background and Title 02 together.
  await wait(2100);
  startTitle02Phase();

  await wait(800);
  leapTextTwo.classList.remove('is-playing');

  leapTransitionRunning = false;
}



/* =========================================================
   V13 — VIDEO SHOWCASE
   ========================================================= */

function setShowcaseCopy(clip){
  if(clip === 1){
    showcaseCopy.innerHTML = `
      <p>
        This is recorded footage of a buyer exploring their future home,
        changing finishes and seeing the result update instantly in real time.
      </p>
      <p>
        The entire experience runs <strong>directly in the browser</strong>
        from your website — there is nothing for the buyer to download or install.
      </p>
    `;
    return;
  }

  if(clip === 2){
    showcaseCopy.innerHTML = `
      <p>
        Here the buyer opens the built-in cost calculator while continuing
        to explore the kitchen and compare different finish options.
      </p>
      <p>
        As selections change, the pricing updates with them in real time,
        helping the buyer understand both the visual choice and its cost
        without leaving the experience.
      </p>
    `;
    return;
  }

  if(clip === 3){
    showcaseCopy.innerHTML = `
      <p>
        The same experience continues throughout the home. Here, the buyer
        is personalizing the main bedroom ensuite and comparing preferences
        in real time.
      </p>
      <p>
        That means more of the important design decisions can happen earlier,
        with a clearer understanding of how individual choices work together
        before construction is complete.
      </p>
    `;
    return;
  }

  if(clip === 4){
    showcaseCopy.innerHTML = `
      <p>
        On the balcony, the home buyer can switch from a generic environment
        to the view from the actual property being purchased.
      </p>
      <p>
        This helps connect the digital experience to the real location,
        giving the buyer a much more meaningful sense of what living there
        will actually feel like.
      </p>
    `;
    return;
  }

  if(clip === 5){
    showcaseCopy.innerHTML = `
      <p>
        Exterior selections can be explored with the same level of freedom.
        Here, the buyer is changing the cladding, but the same approach can
        support a wide range of outdoor features and finish combinations.
      </p>
      <p>
        Buyers can compare options visually in context, helping them make
        exterior decisions with greater confidence before those choices are built.
      </p>
    `;
  }
}

function playShowcaseClip(clip){
  showcaseClip = clip;
  setShowcaseCopy(clip);

  const src = `MP4/Vid_${String(clip).padStart(2,'0')}.mp4`;

  showcaseVideo.pause();
  showShowcaseVideoLoader();

  let readyHandled = false;

  const cleanupReadyListeners = () => {
    showcaseVideo.removeEventListener('loadeddata',onReady);
    showcaseVideo.removeEventListener('canplay',onReady);
    showcaseVideo.removeEventListener('playing',onPlaying);
    showcaseVideo.removeEventListener('error',onError);
  };

  const onReady = () => {
    if(readyHandled) return;
    if(showcaseVideo.readyState < 3) return;

    readyHandled = true;
    cleanupReadyListeners();

    const p = showcaseVideo.play();

    if(p){
      p.then(() => {
        hideShowcaseVideoLoader();
      }).catch(err => {
        console.warn(`${src} could not autoplay:`,err);
        hideShowcaseVideoLoader();
      });
    }else{
      hideShowcaseVideoLoader();
    }
  };

  const onPlaying = () => {
    if(!readyHandled){
      readyHandled = true;
      cleanupReadyListeners();
    }
    hideShowcaseVideoLoader();
  };

  const onError = () => {
    console.warn(`${src} failed to load.`);
    cleanupReadyListeners();
    setTimeout(hideShowcaseVideoLoader,1200);
  };

  showcaseVideo.addEventListener('loadeddata',onReady);
  showcaseVideo.addEventListener('canplay',onReady);
  showcaseVideo.addEventListener('playing',onPlaying);
  showcaseVideo.addEventListener('error',onError,{once:true});

  showcaseVideo.src = src;
  showcaseVideo.load();

  requestAnimationFrame(() => {
    if(showcaseVideo.readyState >= 3){
      onReady();
    }
  });

  if(clip < 5){
    warmShowcaseAhead(clip);
  }else{
    warmNextStep(preloadOldMethodStep());
  }
}

async function changeShowcaseClip(nextClip){
  if(showcaseClipChangeRunning) return;
  showcaseClipChangeRunning = true;

  /*
    Keep warming the next clips, but never freeze the current slide waiting
    for a large MP4. If it still needs data, the Lottie loader will be visible
    inside the video window after the transition.
  */
  warmNextStep(preloadShowcaseClip(nextClip));

  /*
    Make it unmistakable that this is a NEW slide:
    both the video window and copy scale down + fade out.
  */
  const shell = document.querySelector('.showcase-video-shell');

  shell.classList.remove('clip-in');
  showcaseCopy.classList.remove('clip-in');

  shell.classList.add('clip-out');
  showcaseCopy.classList.add('clip-out');

  await wait(540);

  /*
    Change both the copy and video only once the previous slide
    has disappeared.
  */
  playShowcaseClip(nextClip);

  shell.classList.remove('clip-out');
  showcaseCopy.classList.remove('clip-out');

  /*
    Force one painted frame in the hidden/start state before
    animating the new slide in.
  */
  shell.getBoundingClientRect();

  shell.classList.add('clip-in');
  showcaseCopy.classList.add('clip-in');

  await wait(1000);

  shell.classList.remove('clip-in');
  showcaseCopy.classList.remove('clip-in');

  showcaseClipChangeRunning = false;
}

async function openVideoShowcase(){
  if(showcaseTransitionRunning) return;
  showcaseTransitionRunning = true;

  /*
    Do not hold the entire presentation while a 9–16 MB MP4 finishes.
    The video slide opens immediately and its in-window Lottie loader
    handles any remaining buffering.
  */
  beginShowcaseBackgroundBuffering();
  warmNextStep(preloadShowcaseClip(1));

  leapStage.classList.add('is-leaving-title02');
  await wait(460);

  titleSequence2.classList.remove('is-visible');
  sequenceContinueBtn2.classList.remove('is-visible');

  videoShowcaseStage.classList.add('is-visible');
  videoShowcaseStage.setAttribute('aria-hidden','false');

  playShowcaseClip(1);

  requestAnimationFrame(() => {
    videoShowcaseCard.classList.add('is-visible');
  });

  setTimeout(() => {
    showcasePlaybackControls.classList.add('is-visible');
    showcaseFooter.classList.add('is-visible');
  }, 380);

  showcaseTransitionRunning = false;
}

function resetVideoShowcase(){
  showcaseTransitionRunning = false;
  showcaseClipChangeRunning = false;
  showcaseClip = 1;

  showcaseVideo.pause();
  showcaseVideo.currentTime = 0;
  hideShowcaseVideoLoader();
  showcaseVideo.src = 'MP4/Vid_01.mp4';

  videoShowcaseCard.classList.remove('is-visible');
  showcasePlaybackControls.classList.remove('is-visible');
  showcaseFooter.classList.remove('is-visible');

  const showcaseShell = document.querySelector('.showcase-video-shell');
  showcaseShell.classList.remove('clip-out','clip-in');
  showcaseCopy.classList.remove('clip-out','clip-in');

  videoShowcaseStage.classList.remove('is-visible');
  videoShowcaseStage.setAttribute('aria-hidden','true');

  leapStage.classList.remove('is-leaving-title02');

  setShowcaseCopy(1);
}



/* =========================================================
   V15 FIXED — OLD METHOD
   ========================================================= */

function clearOldMethodTimers(){
  oldMethodTimers.forEach(clearTimeout);
  oldMethodTimers = [];
}

async function openOldMethodSlide(){
  oldMethodVideo.loop = false;

  await waitForAssets([preloadOldMethodStep()]);
  warmNextStep(preloadNewMethodStep());
  if(oldMethodTransitionRunning) return;
  oldMethodTransitionRunning = true;

  oldMethodStage.classList.add('is-visible');
  oldMethodStage.setAttribute('aria-hidden','false');

  oldMethodVideo.currentTime = 0;
  const p = oldMethodVideo.play();
  if(p){
    p.catch(err => {
      console.warn('MP4/old method.mp4 could not play:',err);
    });
  }

  videoShowcaseCard.style.transition = 'opacity 420ms ease, transform 420ms ease';
  videoShowcaseCard.style.opacity = '0';
  videoShowcaseCard.style.transform = 'translate(-50%,-50%) scale(.97)';

  await wait(430);

  videoShowcaseStage.classList.remove('is-visible');
  videoShowcaseStage.setAttribute('aria-hidden','true');
  showcaseVideo.pause();

  oldMethodTimers.push(setTimeout(() => {
    oldMethodStage.classList.add('animate-in');
  }, 500));

  oldMethodTimers.push(setTimeout(() => {
    oldMethodStage.classList.add('show-continue');
  }, 1900));

  oldMethodTransitionRunning = false;
}


async function openOldMethodFromOwnership(){
  if(oldMethodTransitionRunning) return;

  oldMethodTransitionRunning = true;
  clearOwnershipTimers();
  oldMethodVideo.loop = false;

  /*
    Start the Old Method MP4 immediately behind the current slide,
    then fade the ownership slide away. This fixes the previous
    z-index problem where Old Method was opening underneath it.
  */
  oldMethodStage.classList.add('is-visible');
  oldMethodStage.setAttribute('aria-hidden','false');

  oldMethodVideo.currentTime = 0;
  const p = oldMethodVideo.play();
  if(p){
    p.catch(err => {
      console.warn('MP4/old method.mp4 could not play:',err);
    });
  }

  ownershipStage.classList.add('is-transitioning-out');

  await wait(720);

  ownershipStage.classList.remove(
    'is-visible',
    'fade-background-in',
    'animate-content',
    'show-continue',
    'is-transitioning-out'
  );
  ownershipStage.setAttribute('aria-hidden','true');

  /*
    Give the background a short clean moment, then bring the copy in
    using the existing Old Method animation.
  */
  oldMethodTimers.push(setTimeout(() => {
    oldMethodStage.classList.add('animate-in');
  }, 500));

  oldMethodTimers.push(setTimeout(() => {
    oldMethodStage.classList.add('show-continue');
  }, 2400));

  oldMethodTransitionRunning = false;
}

function resetOldMethodSlide(){
  clearOldMethodTimers();
  oldMethodTransitionRunning = false;

  oldMethodVideo.pause();
  oldMethodVideo.currentTime = 0;

  oldMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue'
  );
  oldMethodStage.setAttribute('aria-hidden','true');

  videoShowcaseCard.style.transition = '';
  videoShowcaseCard.style.opacity = '';
  videoShowcaseCard.style.transform = '';
}


/* =========================================================
   V16 — NEW METHOD
   ========================================================= */

function clearNewMethodTimers(){
  newMethodTimers.forEach(clearTimeout);
  newMethodTimers = [];
}

async function openNewMethodSlide(){
  newMethodVideo.loop = false;

  await waitForAssets([preloadNewMethodStep()]);
  warmNextStep(preloadOwnershipStep());
  if(newMethodTransitionRunning) return;
  newMethodTransitionRunning = true;

  clearOldMethodTimers();

  /*
    Start loading/playing the next MP4 immediately.
    It does NOT loop. When it reaches the end, HTML video naturally
    remains parked on the final frame.
  */
  newMethodStage.classList.add('is-visible');
  newMethodStage.setAttribute('aria-hidden','false');

  newMethodVideo.currentTime = 0;
  const p = newMethodVideo.play();
  if(p){
    p.catch(err => {
      console.warn('MP4/new method.mp4 could not play:',err);
    });
  }

  // Fade the entire previous slide away.
  oldMethodStage.classList.add('is-transitioning-out');

  await wait(720);

  oldMethodVideo.pause();
  oldMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue',
    'is-transitioning-out'
  );
  oldMethodStage.setAttribute('aria-hidden','true');

  // Give the new background half a second before the copy starts moving in.
  newMethodTimers.push(setTimeout(() => {
    newMethodStage.classList.add('animate-in');
  }, 500));

  // Continue appears once the long stagger is established.
  newMethodTimers.push(setTimeout(() => {
    newMethodStage.classList.add('show-continue');
  }, 2600));

  newMethodTransitionRunning = false;
}

function resetNewMethodSlide(){
  clearNewMethodTimers();
  newMethodTransitionRunning = false;

  newMethodVideo.pause();
  newMethodVideo.currentTime = 0;

  newMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue'
  );
  newMethodStage.setAttribute('aria-hidden','true');
}


/* =========================================================
   V17 — OWNERSHIP SOONER
   ========================================================= */

function clearOwnershipTimers(){
  ownershipTimers.forEach(clearTimeout);
  ownershipTimers = [];
}

async function openOwnershipSlide(){
  if(ownershipTransitionRunning) return;
  ownershipTransitionRunning = true;

  // Fade away every element from the final showcase page.
  videoShowcaseStage.classList.add('is-transitioning-out');

  await wait(650);

  showcaseVideo.pause();
  videoShowcaseStage.classList.remove('is-visible','is-transitioning-out');
  videoShowcaseStage.setAttribute('aria-hidden','true');

  ownershipStage.classList.add('is-visible');
  ownershipStage.setAttribute('aria-hidden','false');

  // Full one-second background fade.
  requestAnimationFrame(() => {
    ownershipStage.classList.add('fade-background-in');
  });

  await wait(1000);

  // Logo, line and copy: slow scale + fade with dramatic ease-out.
  ownershipStage.classList.add('animate-content');

  // Continue appears after the main content has largely settled.
  ownershipTimers.push(setTimeout(() => {
    ownershipStage.classList.add('show-continue');
  }, 1800));

  ownershipTransitionRunning = false;
}


async function openOwnershipFromNewMethod(){
  clearNewMethodTimers();

  await waitForAssets([preloadOwnershipStep()]);
  warmNextStep(preloadGraphStep());

  ownershipStage.classList.add('is-visible');
  ownershipStage.setAttribute('aria-hidden','false');

  requestAnimationFrame(() => {
    ownershipStage.classList.add('fade-background-in');
  });

  newMethodStage.classList.add('is-transitioning-out');

  await wait(720);

  newMethodVideo.pause();
  newMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue',
    'is-transitioning-out'
  );
  newMethodStage.setAttribute('aria-hidden','true');

  await wait(280);

  ownershipStage.classList.add('animate-content');

  ownershipTimers.push(setTimeout(() => {
    ownershipStage.classList.add('show-continue');
  }, 1800));
}

function resetOwnershipSlide(){
  clearOwnershipTimers();
  ownershipTransitionRunning = false;

  ownershipStage.classList.remove(
    'is-visible',
    'fade-background-in',
    'animate-content',
    'show-continue'
  );

  ownershipStage.setAttribute('aria-hidden','true');
}


/* =========================================================
   V20 — SPEED CREATES OPPORTUNITY
   ========================================================= */

function clearSpeedTimers(){
  speedTimers.forEach(clearTimeout);
  speedTimers = [];
}

async function openSpeedStage(){
  if(speedTransitionRunning) return;
  speedTransitionRunning = true;

  clearOwnershipTimers();
  clearNewMethodTimers();

  /*
    We arrive here from NEW METHOD.
    Fade it out, then fully remove it so it cannot remain underneath
    the graph and flash through later.
  */
  newMethodStage.classList.add('is-transitioning-out');

  await wait(720);

  newMethodVideo.pause();
  newMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue',
    'is-transitioning-out'
  );
  newMethodStage.setAttribute('aria-hidden','true');

  /*
    Defensive cleanup: these older stages should already be hidden,
    but remove them anyway so no stale slide can sit underneath.
  */
  oldMethodVideo.pause();
  oldMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue',
    'is-transitioning-out'
  );
  oldMethodStage.setAttribute('aria-hidden','true');

  ownershipStage.classList.remove(
    'is-visible',
    'fade-background-in',
    'animate-content',
    'show-continue',
    'is-transitioning-out'
  );
  ownershipStage.setAttribute('aria-hidden','true');

  speedStage.classList.add('is-visible');
  speedStage.setAttribute('aria-hidden','false');

  if(speedMobileLayout){
    speedMobileLayout.setAttribute('aria-hidden','false');
    speedMobileLayout.scrollTop = 0;
  }

  speedBlueBackground.currentTime = 0;
  const p = speedBlueBackground.play();
  if(p){
    p.catch(err => {
      console.warn('Blue Background.mp4 could not play:',err);
    });
  }

  requestAnimationFrame(() => {
    speedStage.classList.add('mountain-visible');
  });

  await wait(1000);

  speedStage.classList.add('animate-in');

  speedTimers.push(setTimeout(() => {
    speedStage.classList.add('draw-lines');
  }, 900));

  speedTimers.push(setTimeout(() => {
    speedStage.classList.add('show-markers');
  }, 3300));

  speedTimers.push(setTimeout(() => {
    speedStage.classList.add('show-continue');
  }, 5600));

  speedTransitionRunning = false;
}


async function openSpeedStageFromOwnership(){
  if(speedTransitionRunning) return;
  speedTransitionRunning = true;

  await waitForAssets([preloadGraphStep()]);

  // Final screen reuses Title 02, so warm it while the graph is being viewed.
  warmNextStep(
    preloadSequenceFolder('Title 02'),
    preloadVideoFile('Blue Background.mp4')
  );

  clearOwnershipTimers();

  ownershipStage.classList.add('is-transitioning-out');

  await wait(720);

  ownershipStage.classList.remove(
    'is-visible',
    'fade-background-in',
    'animate-content',
    'show-continue',
    'is-transitioning-out'
  );
  ownershipStage.setAttribute('aria-hidden','true');

  speedStage.classList.add('is-visible');
  speedStage.setAttribute('aria-hidden','false');

  speedBlueBackground.currentTime = 0;
  const p = speedBlueBackground.play();
  if(p){
    p.catch(err => console.warn('Blue Background.mp4 could not play:',err));
  }

  requestAnimationFrame(() => {
    speedStage.classList.add('mountain-visible');
  });

  await wait(1000);
  speedStage.classList.add('animate-in');

  speedTimers.push(setTimeout(() => {
    speedStage.classList.add('draw-lines');
  }, 900));

  speedTimers.push(setTimeout(() => {
    speedStage.classList.add('show-markers');
  }, 3300));

  speedTimers.push(setTimeout(() => {
    speedStage.classList.add('show-continue');
  }, 5600));

  speedTransitionRunning = false;
}

function resetSpeedStage(){
  clearSpeedTimers();
  speedTransitionRunning = false;

  speedBlueBackground.pause();
  speedBlueBackground.currentTime = 0;

  speedStage.classList.remove(
    'is-visible',
    'mountain-visible',
    'animate-in',
    'draw-lines',
    'show-markers',
    'show-continue'
  );

  speedStage.setAttribute('aria-hidden','true');

  if(speedMobileLayout){
    speedMobileLayout.setAttribute('aria-hidden','true');
    speedMobileLayout.scrollTop = 0;
  }
}


/* =========================================================
   V21 — FINAL TITLE / REQUEST LIVE DEMO
   ========================================================= */

function finalFramePath(frame){
  return `Sequences/Title 02/Title${String(frame).padStart(2,'0')}.png`;
}

function preloadFinalSequence(){
  return preloadSequenceFolder('Title 02');
}

function playFinalTitleSequence(){
  finalCurrentFrame = FIRST_FRAME;

  finalTitleSequence.classList.add('is-visible');
  finalTitleSequence.setAttribute('aria-hidden','false');
  finalTitleSequenceFrame.src = finalFramePath(finalCurrentFrame);

  const start = performance.now();

  function tick(now){
    const frame = Math.min(
      LAST_FRAME,
      Math.floor((now-start)/FRAME_DURATION)
    );

    if(frame !== finalCurrentFrame){
      finalCurrentFrame = frame;
      finalTitleSequenceFrame.src = finalFramePath(finalCurrentFrame);
    }

    if(finalCurrentFrame < LAST_FRAME){
      finalSequenceRAF = requestAnimationFrame(tick);
    }else{
      finalTitleSequenceFrame.src = finalFramePath(LAST_FRAME);
      finalSequenceRAF = null;
      if(finalContactPanel){
        finalContactPanel.classList.add('is-visible');
      }
    }
  }

  finalSequenceRAF = requestAnimationFrame(tick);
}

async function openFinalDemoStage(){
  if(finalTransitionRunning) return;
  finalTransitionRunning = true;

  await waitForAssets([
    preloadVideoFile('Blue Background.mp4'),
    preloadSequenceFolder('Title 02')
  ]);

  clearSpeedTimers();

  /*
    Force every earlier slide fully out of the document stack BEFORE
    fading the graph. This prevents the old New Method slide from
    flashing through for a frame as the graph becomes transparent.
  */
  newMethodVideo.pause();
  newMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue',
    'is-transitioning-out'
  );
  newMethodStage.setAttribute('aria-hidden','true');

  oldMethodVideo.pause();
  oldMethodStage.classList.remove(
    'is-visible',
    'animate-in',
    'show-continue',
    'is-transitioning-out'
  );
  oldMethodStage.setAttribute('aria-hidden','true');

  ownershipStage.classList.remove(
    'is-visible',
    'fade-background-in',
    'animate-content',
    'show-continue',
    'is-transitioning-out'
  );
  ownershipStage.setAttribute('aria-hidden','true');

  // Fade every visible infographic element away.
  speedStage.classList.add('is-transitioning-out');

  await wait(700);

  speedBlueBackground.pause();

  speedStage.classList.remove(
    'is-visible',
    'mountain-visible',
    'animate-in',
    'draw-lines',
    'show-markers',
    'show-continue',
    'is-transitioning-out'
  );
  speedStage.setAttribute('aria-hidden','true');

  finalDemoStage.classList.add('is-visible');
  finalDemoStage.setAttribute('aria-hidden','false');

  finalBlueBackground.currentTime = 0;
  const p = finalBlueBackground.play();
  if(p){
    p.catch(err => {
      console.warn('Blue Background.mp4 could not play on final slide:',err);
    });
  }

  playFinalTitleSequence();

  finalTransitionRunning = false;
}

function resetFinalDemoStage(){
  finalTransitionRunning = false;

  if(finalSequenceRAF){
    cancelAnimationFrame(finalSequenceRAF);
    finalSequenceRAF = null;
  }

  finalBlueBackground.pause();
  finalBlueBackground.currentTime = 0;

  finalTitleSequence.classList.remove('is-visible');
  finalTitleSequenceFrame.removeAttribute('src');
  if(finalContactPanel){
    finalContactPanel.classList.remove('is-visible');
  }
  if(copyMarieEmailStatus){
    copyMarieEmailStatus.textContent = '';
  }

  finalDemoStage.classList.remove('is-visible');
  finalDemoStage.setAttribute('aria-hidden','true');
}

/* =========================================================
   RESET
   ========================================================= */

function resetPanoramaAndSphere(){
  panoramaPanel.classList.remove('is-visible');
  panoramaStage.classList.remove('is-visible','is-expanding','is-expanded');
  panoramaStage.setAttribute('aria-hidden','true');

  sphereStage.classList.remove('is-visible','is-dragging');
  sphereStage.setAttribute('aria-hidden','true');
  sphereFallback.classList.remove('is-visible');
  hideSphereUI();

  if(sphereReady){
    sphereMode = 'hidden';
    sphereGroup.rotation.set(0,0,0);
    sphereOuterMesh.visible = true;
    sphereInnerMesh.visible = false;
    sphereOuterMaterial.opacity = 1;
    sphereInnerMaterial.opacity = 0;
    setSphereMorph(0);
  }

  technologyContinueBtn.disabled = false;
  panoramaContinueBtn.disabled = false;
}

function resetIntro(){
  clearPage2Timers();
  resetPanoramaAndSphere();
  resetLeapSection();
  resetVideoShowcase();
  resetOldMethodSlide();
  resetNewMethodSlide();
  resetOwnershipSlide();
  resetSpeedStage();
  resetFinalDemoStage();

  page2.classList.remove('active');
  resetPlanSlideVisuals();

  page1.classList.add('active');
  page1.classList.remove('is-leaving');

  introStarted = false;

  if(sequenceRAF){
    cancelAnimationFrame(sequenceRAF);
    sequenceRAF = null;
  }

  titleSequence.classList.remove('is-visible');
  titleSequenceFrame.removeAttribute('src');
  sequenceContinueBtn.classList.remove('is-visible');

  blueBackground.pause();
  blueBackground.currentTime = 0;
  blueBackground.classList.remove('is-active');

  pageOneCopy.classList.remove('is-fading');
  playCluster.classList.remove('is-exiting');
}

/* =========================================================
   EVENTS
   ========================================================= */

continueBtn.addEventListener('click',startCurrentTechnology);
sequenceContinueBtn.addEventListener('click',enterPlanSlide);
technologyContinueBtn.addEventListener('click',openPanoramaExplanation);
panoramaContinueBtn.addEventListener('click',openSphereFromPanorama);
sphereEnterBtn.addEventListener('click',enterSphere);
sphereBackBtn.addEventListener('click',backOutsideSphere);

sphereContinueBtn.addEventListener('click',openLeapSection);

// By the time the user is interacting with the sphere, the next title
// sequence and its looping background should already be in cache.
warmNextStep(
  preloadSequenceFolder('Title 02'),
  preloadVideoFile('Blue Background.mp4')
);

sequenceContinueBtn2.addEventListener('click',openVideoShowcase);

showcaseNextBtn.addEventListener('click',() => {
  if(showcaseClipChangeRunning) return;

  if(showcaseClip < 5){
    changeShowcaseClip(showcaseClip + 1);
    return;
  }

  openOldMethodSlide();
});

oldMethodContinueBtn.addEventListener('click',openNewMethodSlide);

newMethodContinueBtn.addEventListener('click',openOwnershipFromNewMethod);

ownershipContinueBtn.addEventListener('click',openSpeedStageFromOwnership);

speedContinueBtn.addEventListener('click',openFinalDemoStage);

speedMobileContinueBtn.addEventListener('click',openFinalDemoStage);


showcasePlayBtn.addEventListener('click',() => {
  const p = showcaseVideo.play();
  if(p){
    p.catch(err => console.warn('Showcase video could not play:',err));
  }
});

showcasePauseBtn.addEventListener('click',() => {
  showcaseVideo.pause();
});

showcaseRestartBtn.addEventListener('click',() => {
  showcaseVideo.currentTime = 0;
  const p = showcaseVideo.play();
  if(p){
    p.catch(err => console.warn('Showcase video could not restart:',err));
  }
});

sphereFallbackBackBtn.addEventListener('click',() => {
  sphereStage.classList.remove('is-visible');
  sphereStage.setAttribute('aria-hidden','true');
  sphereFallback.classList.remove('is-visible');
  panoramaStage.classList.add('is-visible','is-expanded');
  panoramaStage.setAttribute('aria-hidden','false');
  panoramaPanel.classList.add('is-visible');
  panoramaContinueBtn.disabled = false;
});

homeBtn.addEventListener('click',resetIntro);




if(copyMarieEmailBtn){
  copyMarieEmailBtn.addEventListener('click',async() => {
    const email = 'marie@homeviewsolutions.com';

    try{
      await navigator.clipboard.writeText(email);
      copyMarieEmailStatus.textContent = 'Email address copied.';
    }catch(err){
      copyMarieEmailStatus.textContent = email;
    }
  });
}

fullscreenBtn.addEventListener('click',async() => {
  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
    }else{
      await document.exitFullscreen();
    }
  }catch(err){
    console.warn('Fullscreen unavailable:',err);
  }
});

window.addEventListener('resize',() => {
  resizeSphere();
});

document.addEventListener('keydown',event => {
  if(event.key.toLowerCase() === 'f'){
    fullscreenBtn.click();
  }
});

/* =========================================================
   PRELOAD
   ========================================================= */

function preloadPlanAssets(){
  return preloadPlanStep();
}

/*
  Initial warm-up:
  only preload what the first interaction needs.
  Each subsequent step preloads its own NEXT asset in the background.
*/
warmNextStep(
  preloadVideoFile('Blue Background.mp4'),
  preloadSequenceFolder('Title 01')
);

/* Initialize the loading animation as soon as lottie-web is available. */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded',() => {
    initLoadingLottie();
    initShowcaseVideoLoader();
  },{once:true});
}else{
  initLoadingLottie();
  initShowcaseVideoLoader();
}
