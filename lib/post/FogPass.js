const glslify = require('glslify');
const path = require('path');
const clamp = require('clamp');
const downsample = 4.0;
const maxSize = 2048;

module.exports = FogPass;
function FogPass ( scene, camera, params ) {

  this.scene = scene;
  this.camera = camera;

  this.depthCamera = new THREE.PerspectiveCamera(90, 1, 0, 95);
  this.depthCamera.position.set(0, 80, 0);
  this.depthCamera.lookAt(new THREE.Vector3());

  /*var focus = ( params.focus !== undefined ) ? params.focus : 1.0;
  var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
  var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
  var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;*/

  // render targets

  this.depthRT, this.depthInCamRT;

  // depth material

  this.materialDepth = new THREE.MeshDepthMaterial({ side: THREE.BackSide });

  var fogUniforms = {
    tDepth: {
      type: 't', value: null
    },
    tDiffuse: {
      type: 't', value: null
    },
    time: {
      type: 'f', value: Math.random()
    }
  };

  this.materialFog = new THREE.RawShaderMaterial({
    uniforms: fogUniforms,
    vertexShader: glslify('../shaders/pass.vert'),
    fragmentShader: glslify('../shaders/fog.frag')
  });

  this.uniforms = fogUniforms;

  this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene2 = new THREE.Scene();

  this.depthOnViewMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide });

  this.quad2 = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2 ), this.materialFog);
  this.scene2.add(this.quad2);

  this.renderToScreen = false;

  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;

};

FogPass.prototype = {

  constructor: THREE.FogPass,

  _updateTargets: function (renderTarget) {
    var width = renderTarget.width;
    var height = renderTarget.height;
    var downWidth = clamp(Math.floor(width / downsample), 2, maxSize);
    var downHeight = clamp(Math.floor(height / downsample), 2, maxSize);
    if (!this.depthRT) {      
      this.depthRT = new THREE.WebGLRenderTarget(downWidth, downHeight);
      this.depthRT.texture.minFilter = THREE.LinearFilter;
      this.depthRT.texture.magFilter = THREE.LinearFilter;
      this.depthRT.texture.generateMipmaps = false;
      this.depthRT.depthBuffer = true;
      this.depthRT.stencilBuffer = false;
      this.depthOnViewMaterial.map = this.depthRT.texture;
      this.depthInCamRT = this.depthRT.clone();
    } else if (this.depthRT.width !== downWidth || this.depthRT.height !== downHeight) {
      this.depthRT.setSize(downWidth, downHeight);
      this.depthInCamRT.setSize(downWidth, downHeight);
    }
  },

  render: function (renderer, writeBuffer, readBuffer) {
    this._updateTargets(readBuffer);

    this.scene.overrideMaterial = this.materialDepth;
    renderer.render(this.scene, this.camera, this.depthRT);

    this.scene.overrideMaterial = this.depthOnViewMaterial;
    renderer.render(this.scene, this.camera, this.depthInCamRT);
    this.scene.overrideMaterial = null;

    // Render bokeh composite
    this.uniforms['time'].value += 0.005;
    this.uniforms['tDepth'].value = this.depthInCamRT.texture;
    this.uniforms['tDiffuse'].value = readBuffer;

    if ( this.renderToScreen ) {

      renderer.render( this.scene2, this.camera2 );

    } else {

      renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

    }


  }

};
