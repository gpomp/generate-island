module.exports = function (app) {
  const ctn = new THREE.Object3D();
  var lights = [];
  lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );

  lights[ 0 ].position.set( 50, 300, 50 );

  ctn.add( lights[ 0 ] );

  lights[ 1 ] = new THREE.PointLight( 0xffffff, 0.35, 0 );

  lights[ 1 ].position.set( -50, -300, 50 );

  ctn.add( lights[ 0 ] );
  ctn.add( lights[ 1 ] );
  const amb = new THREE.AmbientLight(0xFFFFFF, 0.25);
  ctn.add(amb);

  return {
    object3d: ctn,
    lights,
    update (dt) {
    }
  };
};
