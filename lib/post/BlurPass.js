const glslify = require('glslify');
const path = require('path');
const clamp = require('clamp');
const downsample = 4.0;
const maxSize = 2048;

module.exports = BlurPass;
function BlurPass (scene, camera, sceneFog, params = {}) {

  this.scene = scene;
  this.camera = camera;
  this.sceneFog = sceneFog;

  // var radius = ( params.radius !== undefined ) ? params.radius : 0.75;
  /*var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
  var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
  var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;*/

  // render targets

  // depth material

  // this.materialDepth = new THREE.MeshDepthMaterial();
  // 
  const tMask = new THREE.TextureLoader().load('images/mask.jpg');
  tMask.minFilter = THREE.LinearFilter;
  tMask.generateMipmaps = false;
  var vignetteUniforms = {
    tDiffuse: {
      type: 't',
      value: null
    },
    tBlur: {
      type: 't',
      value: null
    },
    tMask: {
      type: 't',
      value: tMask
    },
    time: {
      type: 'f',
      value: 0
    },
    resolution: {
      type: 'v2',
      value: new THREE.Vector2( 512, 512 )
    }
  };

  var blurUniforms = {
    tDiffuse: {
      type: 't',
      value: null
    },
    resolution: {
      type: 'v2',
      value: new THREE.Vector2( 512, 512 )
    },
    direction: {
      type: 'v2',
      value: new THREE.Vector2( 0, 0 )
    }
  }

  this.blurUniforms = blurUniforms;
  this.vignetteUniforms = vignetteUniforms;

  this.blurStrength = ( params.blurStrength !== undefined ) ? params.blurStrength : 0.5;

  this.materialVignette = new THREE.RawShaderMaterial({
    uniforms: this.vignetteUniforms,
    vertexShader: glslify('../shaders/pass.vert'),
    fragmentShader: glslify('../shaders/mix.frag')
  });

  this.materialBlur = new THREE.RawShaderMaterial({
    uniforms: this.blurUniforms,
    vertexShader: glslify('../shaders/pass.vert'),
    fragmentShader: glslify('../shaders/Blur.frag')
  });

  this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene2 = new THREE.Scene();

  this.quad2 = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2 ), this.materialVignette);
  // this.quad3 = new THREE.Mesh(new THREE.PlaneBufferGeometry( 1, 1 ), this.materialVignette);
  // this.quad3.rotation.z = Math.PI;
  this.scene2.add(this.quad2);
  // this.scene2.add(this.quad3);

  this.renderToScreen = false;

  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;

};

BlurPass.prototype = {

  constructor: THREE.BlurPass,

  _updateTargets: function (renderTarget) {
    var width = renderTarget.width;
    var height = renderTarget.height;
    var downWidth = clamp(Math.floor(width / downsample), 2, maxSize);
    var downHeight = clamp(Math.floor(height / downsample), 2, maxSize);
    if (!this.renderTargetBlur) {      
      this.renderTargetBlur = new THREE.WebGLRenderTarget(downWidth, downHeight);
      this.renderTargetBlur.texture.minFilter = THREE.LinearFilter;
      this.renderTargetBlur.texture.magFilter = THREE.LinearFilter;
      this.renderTargetBlur.texture.generateMipmaps = false;
      this.renderTargetBlur.depthBuffer = true;
      this.renderTargetBlur.stencilBuffer = false;
      this.renderTargetBlur.texture.format = THREE.RGBAFormat;
      this.renderTargetBlur2 = this.renderTargetBlur.clone();
      this.renderTargetFog = this.renderTargetBlur.clone();
      this.blurUniforms.resolution.value.set(downWidth, downHeight);
    } else if (this.renderTargetBlur.width !== width || this.renderTargetBlur.height !== height) {
      this.renderTargetBlur.setSize(downWidth, downHeight);
      this.renderTargetBlur2.setSize(downWidth, downHeight);
      this.renderTargetFog.setSize(downWidth, downHeight);
      this.blurUniforms.resolution.value.set(downWidth, downHeight);
      this.vignetteUniforms.resolution.value.set(downWidth, downHeight);
    }
  },

  render: function (renderer, writeBuffer, readBuffer) {
    this.materialVignette.uniforms.time.value += 0.0005;
    this._updateTargets(readBuffer);
    
    this.renderQuad(renderer, writeBuffer, readBuffer, this.quad2);

    if ( this.renderToScreen ) {

      renderer.render( this.scene2, this.camera2 );

    } else {

      renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

    }


  },

  renderQuad: function (renderer, writeBuffer, readBuffer, quad) {
    // this.quad3.visible = false;
    renderer.setClearAlpha(0.0);
    if (this.sceneFog.children.length < 2) return;
    this.sceneFog.children[1].material.colorWrite = false;
    renderer.render( this.sceneFog, this.camera, this.renderTargetFog );
    this.sceneFog.children[1].material.colorWrite = true;

    renderer.setClearAlpha(1.0);
    quad.material = this.materialBlur;
    this.materialBlur.uniforms['tDiffuse'].value = this.renderTargetFog.texture;
    this.materialBlur.uniforms.direction.value.set(this.blurStrength, 0.0);
    renderer.render( this.scene2, this.camera2, this.renderTargetBlur );

    this.materialBlur.uniforms['tDiffuse'].value = this.renderTargetBlur.texture;
    this.materialBlur.uniforms.direction.value.set(0.0, -this.blurStrength);
    renderer.render( this.scene2, this.camera2, this.renderTargetBlur2 );

    quad.material = this.materialVignette;
    this.materialVignette.uniforms['tDiffuse'].value = readBuffer.texture;
    this.materialVignette.uniforms['tBlur'].value = this.renderTargetBlur2.texture;
  }

};
