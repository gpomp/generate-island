const glslify = require('glslify');
const smoothstep = require('smoothstep');
module.exports = function (app, opt = {}) {
  const ctn = new THREE.Object3D();
  const verts = opt.g.vertices;
  const middle1 = new THREE.Vector3();
  const middle2 = new THREE.Vector3();
  const middle21 = new THREE.Vector2();
  const middle22 = new THREE.Vector2();
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  let gap = 0;
  let time = 0;
  const startNormal = new THREE.Vector3();
  console.log('start falls');
  opt.g.faces.forEach((f, i) => {
    middle1.copy(verts[f.a]).add(verts[f.b]).add(verts[f.c]).multiplyScalar(1 / 3);
    if (middle1.z > 30) {
      middle21.set(middle1.x, middle1.y);
      opt.g.faces.forEach((f1, j) => {
        middle2.copy(verts[f1.a]).add(verts[f1.b]).add(verts[f1.c]).multiplyScalar(1 / 3);
        middle22.set(middle2.x, middle2.y);
        if (middle21.distanceToSquared(middle22) < 0.1 * 0.1 && middle1.z - middle2.z > gap && isNotEdge(middle1) && isNotEdge(middle2) && middle2.z > -30) {
          start.copy(middle2).multiplyScalar(opt.scale);
          end.copy(middle1).multiplyScalar(opt.scale);
          start.z /= opt.scale;
          end.z /= opt.scale;
          gap = middle1.z - middle2.z;
          startNormal.copy(f1.normal);
        }
      });
    }
  });

  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  console.log('end falls');
  const rockMaterial = new THREE.MeshPhongMaterial({
    color: 0x70432C,
    emissive: 0x000000,
    shininess: 4,
    shading: THREE.FlatShading,
    transparent: true
  });

  const sphereArounds = new THREE.Mesh(new THREE.SphereBufferGeometry(1.5), rockMaterial);
  const anglePerp = angle + Math.PI * 0.5;
  let a = 0;
  const cave = new THREE.Object3D();
  for (var i = 0; i < 20; i++) {
    const sp = sphereArounds.clone();
    sp.position.set(
      Math.cos(a) * (Math.random()) * 3,
      Math.sin(a) * (Math.random()) * 3,
      0
    );
    const s = 0.4 + Math.random() * 0.4;
    sp.scale.set(s, s, s);
    cave.add(sp);
    a += Math.PI * 2 / 20;
  }
  cave.position.copy(start);
  const caveLookat = new THREE.Vector3();
  cave.lookAt(caveLookat.copy(start).add(startNormal));
  // cave.rotation.y = 0;

  ctn.add(cave);
  // const startSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(4.5), new THREE.MeshBasicMaterial({color: 0x000000}));
  // const endSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(2.5), new THREE.MeshBasicMaterial({color: 0x0000FF}));
  // ctn.add(startSphere);
  // ctn.add(endSphere);
  // startSphere.position.copy(start);
  // endSphere.position.copy(end);

  // const geom = buildGeometry();
  const firstSphere = new THREE.SphereBufferGeometry(1, 7, 5);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0284F0,
    emissive: 0x666666,
    shininess: 6,
    shading: THREE.FlatShading,
    transparent: true,
    opacity: 0.7
  });
  // const material = new THREE.MeshBasicMaterial({color:0xFF00FF});
  const falls = new THREE.Object3D();
  let dep = 0;

  for (var i = 0; i < 600; i++) {
    const drop = new THREE.Mesh(firstSphere, material);
    const s = 0.5 + -0.25 + Math.random() * 0.5;
    drop.scale.multiplyScalar(s);
    drop.userData = {
      scale: s,
      perc: 0.5 + Math.random() * 0.5,
      startPos: new THREE.Vector3(
        start.x + -2 + Math.random() * 4, 
        start.y + -2 + Math.random() * 4, 
        start.z + -2 + Math.random() * 4)
    }
    falls.add(drop);
  }

  ctn.add(falls);
  falls.frustumCulled = false;
  // falls.scale.set(10, 10, 10);

  return {
    object3d: ctn,
    end,
    update (dt) {
      time += dt * 0.5;
      falls.children.forEach(d => {
        const t = (time * d.userData.perc)%1;
        d.position.set(d.userData.startPos.x + Math.cos(angle) * t * 30.0,
          d.userData.startPos.y + Math.sin(angle) * t * 30.0,
          d.userData.startPos.z + 60.0 + Math.sin(-(1 - t) * Math.PI * 0.5) * 60.0
        );
        const startStep = Math.max(smoothstep(t, 0.0, 0.05), 0.0001);
        const endStep = Math.max(smoothstep(t, 0.85, 1.0), 0.0001);
        d.scale.set(d.userData.scale, d.userData.scale, d.userData.scale).multiplyScalar(startStep).multiplyScalar(endStep);
      })
    }
  };

  function isNotEdge (v) {
    return v.x > -0.5 + 0.05 && v.x < -0.5 + 0.95 && v.y > -0.5 + 0.05 && v.y < -0.5 + 0.95; 
  }

};
