
module.exports = function () {
  const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(1),
    new THREE.MeshBasicMaterial({
      color: 0xff0000,
      depthTest: false,
      depthWrite: false,
      side: THREE.BackSide
    })
  );

  sphere.scale.set(100, 100, 100);

  return {
    object3d: sphere,
    update (dt) {

    }
  }
}
