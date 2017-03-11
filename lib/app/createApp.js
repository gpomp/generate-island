/*
  This is a generic "ThreeJS Application"
  helper which sets up a renderer and camera
  controls.
 */

const createControls = require('../util/orbit-controls');
const createLoop = require('raf-loop');
const assign = require('object-assign');
const Stats = require('stats-js');
const query = require('../util/query');
const datGUI = require('../ui/dat').instance;
const BlurPass = require('../post/BlurPass');
const VignetteBlurPass = require('../post/VignetteBlurPass');
const FXAA = require('three-shader-fxaa');

const EffectComposer = require('../post/EffectComposer');

const showFPS = query.fps;

module.exports = createApp;
function createApp (opt = {}) {
  // Scale for retina
  let dpr = Math.min(2, window.devicePixelRatio);
  if (typeof query.dpr === 'number') dpr = query.dpr;

  const stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild(stats.domElement);
  // Our WebGL renderer with alpha and device-scaled
  const renderer = new THREE.WebGLRenderer(assign({
    antialias: false // default enabled
  }, opt));
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x9BCCF5, 1);
  renderer.sortObjects = false;
  // renderer.autoClear = false;
  // renderer.gammaInput = true;
  // renderer.gammaOutput = false;
  // renderer.gammaFactor = 2.2;

  // Add the <canvas> to DOM body
  const canvas = renderer.domElement;
  const ctn = document.createElement('div');
  ctn.classList.add('demo-container');
  document.body.appendChild(ctn);
  ctn.appendChild(canvas);

  // perspective camera
  const near = 1;
  const far = 500;
  const fieldOfView = 65;
  const camera = new THREE.PerspectiveCamera(fieldOfView, 1, near, far);
  // const camera2 = camera.clone();
  const target = new THREE.Vector3();

  let vb;

  const composer = createComposer();
  const targets = [ composer.renderTarget1, composer.renderTarget2 ];

  // 3D scene
  const fog = new THREE.Fog(0x9BCCF5, 1, 450);
  const scene = new THREE.Scene();
  // scene.fog = fog;
  const scene2 = new THREE.Scene();
  // scene2.fog = fog;
  const mainComponent = new THREE.Object3D();
  mainComponent.rotation.x = Math.PI * 0.5;
  scene.add(mainComponent);
  // slick 3D orbit controller with damping
  const controls = createControls(assign({
    canvas,
    zoomSpeed: 0.1,
    theta: 0,
    phi: 40 * Math.PI / 180,
    distanceBounds: [ 100, 200 ],
    phiBounds: [ 0, 80 * Math.PI / 180],
    distance: 150,
    element: canvas,
    parent: ctn
  }, opt));

  const app = createLoop();

  // Update renderer size
  window.addEventListener('resize', resize);
  app.gui = datGUI;
  app.mousePos = new THREE.Vector2();
  app.raycaster = new THREE.Raycaster();
  window.addEventListener('mousemove', mouseMove);

  // Add post processing
  setupPost();

  // Setup initial size & aspect ratio
  resize();

  // public API
  app.resize = resize;
  app.render = render;
  app.camera = camera;
  // app.camera2 = camera2;
  app.scene = scene;
  app.mainComponent = mainComponent;
  app.scene2 = scene2;
  app.canvas = renderer.domElement;
  app.controls = controls;
  app.renderer = renderer;
  app.update = update;
  app.time = 0;

  return app;

  function mouseMove (e) {
    app.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    app.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    app.raycaster.setFromCamera(app.mousePos, app.camera);
    if (vb) {
      vb.vignetteUniforms.mousePos.value.x = (e.clientX / app.width);
      vb.vignetteUniforms.mousePos.value.y = 1 - e.clientY / app.height;
    }
    
  }

  function setupPost () {
    composer.addPass(new EffectComposer.RenderPass(scene, camera));
    // const fogPass = new FogPass(scene, camera);
    // composer.addPass(fogPass);
    // const blurPass = new BlurPass(scene, camera, scene2);
    // composer.addPass(blurPass);
    vb = new VignetteBlurPass(scene, camera, {
      radius: 0.4,
      blurStrength: 0.375 * dpr,
      glow: 7.5 * dpr,
      gui: app.gui
    });
    composer.addPass(vb);
    const fxaa = new EffectComposer.ShaderPass(FXAA());
    fxaa.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    composer.addPass(fxaa);

    composer.passes[composer.passes.length - 1].renderToScreen = true;
  }

  function update (dt = 0) {
    // update time
    app.time += dt;
    // tick controls
    updateControls();
    // camera2.position.copy(camera.position).negate();
    // camera2.lookAt(target);
  }

  function render () {
    stats.begin();
    if (composer.isActive()) {
      // renderer.clear();
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    stats.end();
  }

  function updateControls () {
    // update camera controls
    controls.update();
    camera.position.fromArray(controls.position);
    camera.up.fromArray(controls.up);
    target.fromArray(controls.direction).add(camera.position);
    camera.lookAt(target);
  }

  function resize () {
    // 3840x2160
    const width = window.innerWidth;
    const height = window.innerHeight;

    app.width = width;
    app.height = height;
    renderer.setSize(app.width, app.height);

    const dpr = renderer.getPixelRatio();
    targets.forEach(t => {
      t.setSize(app.width * dpr, app.height * dpr);
    });

    composer.passes.forEach(pass => {
      if (pass.uniforms && pass.uniforms.resolution) {
        pass.uniforms.resolution.value.set(width, height);
      }
    });

    // Update camera matrices
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function createComposer () {
    const createTarget = () => {
      const rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
      rt.texture.minFilter = THREE.NearestFilter;
      rt.texture.magFilter = THREE.NearestFilter;
      rt.texture.generateMipmaps = false;
      rt.texture.format = THREE.RGBFormat;
      return rt;
    };
    const rt1 = createTarget();
    const rt2 = createTarget();
    // rtInitial.depthTexture = new THREE.DepthTexture();
    return new EffectComposer(renderer, rt1, rt2);
  }
}
