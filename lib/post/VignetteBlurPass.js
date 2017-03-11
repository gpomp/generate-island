const glslify = require('glslify');
const path = require('path');
const clamp = require('clamp');
const downsample = 2.0;
const maxSize = 2048;

module.exports = VignetteBlurPass;
function VignetteBlurPass (scene, camera, params) {

  this.scene = scene;
  this.camera = camera;

  this.newPos = new THREE.Vector2();

  var radius = ( params.radius !== undefined ) ? params.radius : 0.75;
  /*var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
  var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
  var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;*/

  // render targets

  // depth material

  // this.materialDepth = new THREE.MeshDepthMaterial();
  // 

  var vignetteUniforms = {
    tDiffuse: {
      type: 't',
      value: null
    },
    tBlur: {
      type: 't',
      value: null
    },
    radius: {
      type: 'f',
      value: radius
    },
    glow: {
      type: 'f',
      value: params.glow || 0
    },
    mousePos: {
      'type': 'v2',
      value: new THREE.Vector2()
    },
    time: {
      type: 'f',
      value: 0
    },
    speed: {
      type: 'f',
      value: 0
    }
  };
  params.gui.add(vignetteUniforms.glow, 'value', 0, 100);

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

  this.blurStrength = ( params.radius !== undefined ) ? params.blurStrength : 1;

  this.materialVignette = new THREE.RawShaderMaterial({
    uniforms: this.vignetteUniforms,
    vertexShader: glslify(path.resolve(__dirname + '/../shaders/pass.vert')),
    fragmentShader: glslify(path.resolve(__dirname + '/../shaders/vignetteBlur.frag'))
  });

  this.materialBlur = new THREE.RawShaderMaterial({
    uniforms: this.blurUniforms,
    vertexShader: glslify(path.resolve(__dirname + '/../shaders/pass.vert')),
    fragmentShader: glslify(path.resolve(__dirname + '/../shaders/Blur.frag'))
  });

  this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene2 = new THREE.Scene();

  this.quad2 = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2 ), this.materialVignette);
  this.scene2.add(this.quad2);

  this.renderToScreen = false;

  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;
};

VignetteBlurPass.prototype = {

  constructor: THREE.VignetteBlurPass,

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
      this.renderTargetBlur2 = this.renderTargetBlur.clone();
      this.blurUniforms.resolution.value.set(downWidth, downHeight);
    } else if (this.renderTargetBlur.width !== width || this.renderTargetBlur.height !== height) {
      this.renderTargetBlur.setSize(downWidth, downHeight);
      this.renderTargetBlur2.setSize(downWidth, downHeight);
      this.blurUniforms.resolution.value.set(downWidth, downHeight);
    }
  },

  render: function (renderer, writeBuffer, readBuffer) {
    this._updateTargets(readBuffer);
    this.vignetteUniforms.time.value += 0.0001;
    // Render bokeh composite

    this.quad2.material = this.materialBlur;
    this.materialBlur.uniforms['tDiffuse'].value = readBuffer.texture;
    this.materialBlur.uniforms.direction.value.set(this.blurStrength, 0.0);
    renderer.render( this.scene2, this.camera2, this.renderTargetBlur );

    this.materialBlur.uniforms['tDiffuse'].value = this.renderTargetBlur.texture;
    this.materialBlur.uniforms.direction.value.set(0.0, -this.blurStrength);
    renderer.render( this.scene2, this.camera2, this.renderTargetBlur2 );

    this.quad2.material = this.materialVignette;
    this.materialVignette.uniforms['tDiffuse'].value = readBuffer.texture;
    this.materialVignette.uniforms['tBlur'].value = this.renderTargetBlur2.texture;

    if ( this.renderToScreen ) {

      renderer.render( this.scene2, this.camera2 );

    } else {

      renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

    }


  }

};
