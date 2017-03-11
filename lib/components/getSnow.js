const glslify = require('glslify');
const {shaderParse} = require('../app/helper');

module.exports = function () {
  const ctn = new THREE.Object3D();
  const material = new THREE.RawShaderMaterial({
    vertexShader: shaderParse(glslify('../shaders/snow.vert')),
    fragmentShader: shaderParse(glslify('../shaders/snow.frag')),
    transparent: true,
    depthWrite: false,  
    blending: THREE.AdditiveBlending,
    uniforms: {
      time: {
        type: 'f',
        value: Math.random()
      },
      texture: {
        type: 't',
        value: new THREE.TextureLoader().load('images/particle.png')
      }
    }
  });

  const geom = buildGeometry();

  const particles = new THREE.Points(geom, material);
  ctn.add(particles);
  particles.scale.set(100, 50, 100);
  particles.position.y = 0;
  particles.frustumCulled = false;

  return {
    object3d: ctn,
    update (dt) {
      material.uniforms.time.value += dt * 0.0025;
    }
  };

  function buildGeometry () {
    const nbParticles = 50 * 50;

    const position = new Float32Array(nbParticles * 3);
    const speed = new Float32Array(nbParticles);

    for (let i = 0; i < nbParticles; i++) {
      const i3 = 3 * i;
      const pos = getRandomInSphere(1);
      position[i3 + 0] = pos[0];
      position[i3 + 1] = 0;
      position[i3 + 2] = pos[2];

      speed[i] = Math.random();
    }

    const geom = new THREE.BufferGeometry();

    geom.addAttribute('position', new THREE.BufferAttribute(position, 3));
    geom.addAttribute('speed', new THREE.BufferAttribute(speed, 1));

    return geom;

  }

  function getRandomInSphere (radius) {
    const phi = Math.random() * (2 * Math.PI);
    const costheta = -1 + Math.random() * 2;
    const u = Math.random();

    const theta = Math.acos(costheta);
    const r = radius * Math.cbrt(u);

    return [
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(theta)
    ];
  }
}
