const glslify = require('glslify');
const {shaderParse} = require('../app/helper');

module.exports = function (app, opts = {}) {
  const obj = new THREE.Object3D();

  const phongShader = THREE.ShaderLib.phong;
  const phongUniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

  const uniforms = Object.assign({}, phongUniforms, {
    diffuse: { type: 'c', value: new THREE.Color(0x0284F0) }, 
    emissive: { type: 'c', value: new THREE.Color(0x666666) }, 
    specular: { type: 'c', value: new THREE.Color(0xFFFFFF) }, 
    shininess: { type: 'f', value: 30 }, 
    time: { type: 'f', value: 0 }
  });

  // opts.lights.forEach(l => { uniforms.spotLights.value.push(l) });

  

  const geom = new THREE.PlaneBufferGeometry(1, 1, 60, 60);
  const vShader = shaderParse(glslify('../shaders/sea.vert'));
  const fShader = shaderParse(glslify('../shaders/sea.frag'));
  const mat = new THREE.ShaderMaterial({
    vertexShader: vShader,
    fragmentShader: fShader,
    side: THREE.BackSide, 
    lights: true,
    fog: true,
    transparent: true,
    shading: THREE.FlatShading,
    uniforms
  });

  const mesh = new THREE.Mesh(geom, mat);
  obj.add(mesh);

  mesh.scale.set(opts.scale - 5, opts.scale - 5, 1);
  // mesh.rotation.x = Math.PI * 0.5;
  mesh.position.z = 15;

  return {
    object3d: obj,
    update (dt) {
      uniforms.time.value += dt * 0.025;
    }
  }

}
