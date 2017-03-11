const glslify = require('glslify');
module.exports = function (app, opts = {}) {

  const ctn = new THREE.Object3D();

  const intersectMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(opts.scale * 10, opts.scale * 10), new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.BackSide, transparent: true, opacity: 0 }));
  ctn.add(intersectMesh);
  // intersectMesh.scale.set(opts.scale * 10, opts.scale * 10, 1); 
  const stormPos = new THREE.Vector3();

  const geom = buildGeometry();
  const material = new THREE.RawShaderMaterial({
    vertexShader: glslify('../shaders/storm.vert'),
    fragmentShader: glslify('../shaders/storm.frag'),
    transparent: true,
    depthWrite: false,  
    // blending: THREE.AdditiveBlending,
    uniforms: {
      time: {
        type: 'f',
        value: 1000 + Math.random() * 19999
      },
      texture: {
        type: 't',
        value: new THREE.TextureLoader().load('app/themes/portfolio/images/particle.png')
      },
      stormPos: {
        type: 'v3',
        value: stormPos
      }
    }
  });

  const storm = new THREE.Points(geom, material);
  ctn.add(storm);

  return {
    object3d: ctn,
    update (dt) {
      var intersects = app.raycaster.intersectObject(intersectMesh);
      if (intersects.length > 0) {
        stormPos.copy(intersects[ 0 ].point);
        intersects[ 0 ].object.worldToLocal(stormPos);
      }
      material.uniforms.time.value += dt * 0.025;
    }
  };

  function buildGeometry () {
    const nbParticles = 70 * 70;

    const position = new Float32Array(nbParticles * 3);
    const speed = new Float32Array(nbParticles);
    const size = new Float32Array(nbParticles);

    for (let i = 0; i < nbParticles; i++) {
      const i3 = 3 * i;
      position[i3 + 0] = 0;
      position[i3 + 1] = 0;
      position[i3 + 2] = 0;

      speed[i] = Math.random();
      size[i] = 0.5 + Math.random() * 0.5;
    }

    const geom = new THREE.BufferGeometry();

    geom.addAttribute('position', new THREE.BufferAttribute(position, 3));
    geom.addAttribute('speed', new THREE.BufferAttribute(speed, 1));
    geom.addAttribute('size', new THREE.BufferAttribute(size, 1));

    return geom;

  }
}
