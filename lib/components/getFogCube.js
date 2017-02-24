const glslify = require('glslify');

module.exports = function () {
  const ctn = new THREE.Object3D();

  const fogUniforms = {
    time: {
      type: 'f', value: Math.random()
    }
  }

  const cubeGeom = new THREE.BoxBufferGeometry(1, 1, 1);
  const cubeMat = new THREE.ShaderMaterial({
    uniforms: fogUniforms,
    vertexShader: glslify('../shaders/passreg.vert'),
    fragmentShader: glslify('../shaders/fog.frag'),
    transparent: true
  });

  const cube = new THREE.Mesh(cubeGeom, cubeMat);
  ctn.add(cube);
  cube.scale.set(100, 100, 100);
  return {
    object3d: ctn,

    update (dt) {
      cubeMat.uniforms.time.value += dt * 0.1;
    }
  }
}
