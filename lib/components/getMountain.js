const work = require('webworkify');
const MiniSignals = require('mini-signals');
const glslify = require('glslify');
const {shaderParse} = require('../app/helper');

module.exports = function (app, opts = {}) {
  const ctn = new THREE.Object3D();
  const tempPlane = new THREE.PlaneGeometry(1, 1, 60, 60);
  const plane = new THREE.BufferGeometry();
  const onMountainReady = new MiniSignals();

  const phongShader = THREE.ShaderLib.phong;
  const phongUniforms = THREE.UniformsUtils.clone(phongShader.uniforms);
  const uniforms = Object.assign({}, phongUniforms, {
    diffuse: { type: 'c', value: new THREE.Color(0xFFFFFF) }, 
    emissive: { type: 'c', value: new THREE.Color(0x000000) },
    shininess: { type: 'f', value: 4 }
  });

  const vShader = shaderParse(glslify('../shaders/mountain.vert'));
  const fShader = shaderParse(glslify('../shaders/mountain.frag'));
  const mat = new THREE.ShaderMaterial({
    vertexShader: vShader,
    fragmentShader: fShader,
    side: THREE.BackSide, 
    lights: true,
    fog: true,
    shading: THREE.FlatShading,
    uniforms
  });

  let mesh, faces, vertices;

  /*const mat = new THREE.MeshPhongMaterial({
    // color: 0xb13b5b, 
    // specular: 0xcf6861, 
    color: 0x6E6BF4, 
    specular: 0x3C38F4, 
    shininess: 8, 
    side: THREE.BackSide, 
    shading:THREE.FlatShading
  });*/
  // const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  // setupMat();
  const build = work(require('./mountain/buildWorker'));
  build.addEventListener('message', (ev) => {
    // tempPlane.dynamic = true;
    tempPlane.vertices = ev.data[0];
    tempPlane.faces.forEach((f, i) => { 
      f.vertexColors[0] = ev.data[1][i][0];
      f.vertexColors[1] = ev.data[1][i][1];
      f.vertexColors[2] = ev.data[1][i][2];
    });
    tempPlane.verticesNeedUpdate = true;
    // tempPlane.dynamic = false;
    tempPlane.mergeVertices();
    tempPlane.computeBoundingSphere();
    tempPlane.computeVertexNormals();
    tempPlane.computeFaceNormals();
    faces = tempPlane.faces.slice();
    vertices = tempPlane.vertices.slice();
    plane.fromGeometry(tempPlane);
    tempPlane.dispose();
    plane.computeVertexNormals();
    // const mat = new THREE.MeshBasicMaterial({color: 'red', side: THREE.BackSide, shading:THREE.FlatShading});
    mesh = new THREE.Mesh(plane, mat);
    mesh.scale.set(opts.scale, opts.scale, 1);
    // mesh.rotation.x = Math.PI * 0.5;
    // mesh.position.z = -2.5;
    ctn.add(mesh);
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;
    onMountainReady.dispatch();
  });

  build.postMessage([tempPlane.vertices, tempPlane.faces, opts.seed, opts.divide]);
  // mesh.position.y = -500;
  return {
    object3d: ctn,

    getClone () {
      const cloneMat = mat.clone();
      const cloneGeom = plane.clone();
      const cMesh = new THREE.Mesh(cloneGeom, cloneMat);
      cMesh.position.copy(mesh.position);
      cMesh.rotation.copy(mesh.rotation);
      cMesh.scale.copy(mesh.scale);

      return cMesh;
    },
    onMountainReady,
    update (dt) {

    },
    getMountainInfo () {
      return { faces, vertices };
    }
  };

  function setupMat () {
    mat.roughness = 1;
    mat.metalness = 1;
    mat.side = THREE.BothSide;
  }
};
