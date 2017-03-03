const random = require('random-float');

module.exports = function (app, opts = {}) {

  const ctn = new THREE.Object3D();

  const tmpVec = new THREE.Vector3();
  const tmpVec1 = tmpVec.clone();
  const oldPos = new THREE.Vector3();
  const newVel = new THREE.Vector3();
  const velMult = new THREE.Vector3();
  const sub = new THREE.Vector3();

  const maxSpeed = 30000;

  const bMaterial = new THREE.MeshPhongMaterial({
    color: 0x04D3D3,
    emissive: 0x000000,
    shininess: 2, 
    side: THREE.DoubleSide,
    transparent: true
  });

  const rMaterial = new THREE.MeshPhongMaterial({
    color: 0xFF0505,
    emissive: 0x000000,
    shininess: 2, 
    side: THREE.DoubleSide,
    transparent: true
  });

  const gMaterial = new THREE.MeshPhongMaterial({
    color: 0xA7F805,
    emissive: 0x000000,
    shininess: 2, 
    side: THREE.DoubleSide,
    transparent: true
  });
  const dummy = { v: 0 };

  const toGo = new THREE.Vector3(random(-100, 100), random(-100, 100), random(-40, -90));

  const blueBird = createBirdModel(bMaterial);
  const redBird = createBirdModel(rMaterial);
  const greenBird = createBirdModel(gMaterial);
  const modelBirds = [blueBird, redBird, greenBird];

  const birdsList = Array.apply(null, Array(30)).map(i => {
    const currBird = modelBirds[Math.floor(Math.random() * modelBirds.length)].clone();
    currBird.userData = {
      vel: new THREE.Vector3(random(-5, 5), random(-5, 5), random(-5, 5)),
      attractedMod: random(0.9, 0.99),
      centerMassMod: random(0.9, 0.99),
      avoidMod: random(10000, 20000),
      speedMod: random(0.5, 1.5) * 0.00001,
      flapAngle: 0,
      flapTime: random(Math.PI * 0.085, Math.PI * 0.125),
      avoidNB: 50000
    }

    currBird.position.set(random(-100, 100), 50, random(-100, 100));


    ctn.add(currBird);

    return currBird;
  });

  // changeCenter();
  // 
  window.setInterval(() => { changeCenter(); }, 14000);

  
  return {
    object3d: ctn,
    update: (state, dt) => {
      let v1, v2, v4, v5;

      birdsList.forEach((bird, i) => {
        v1 = _centerMass(bird);
        v2 = _avoid(bird);
        v4 = _attractedTo(bird);
        // v5 = _repulsedFrom(bird);
        oldPos.copy(bird.position);

        newVel.set(0, 0, 0).add(v1).add(v2.multiplyScalar(3)).add(v4.multiplyScalar(1.6));

        bird.userData.vel.add(newVel);
        bird.position.add(velMult.copy(bird.userData.vel).multiplyScalar(bird.userData.speedMod));
        sub.subVectors(bird.position, oldPos);

        bird.userData.vel.clampScalar(-maxSpeed, maxSpeed);

        bird.lookAt(oldPos.copy(bird.position).add(sub));
        bird.rotation.z -= Math.PI * 0.5;
        bird.children[0].rotation.y = Math.sin(bird.userData.flapAngle) * (Math.PI * 0.3);
        bird.children[1].rotation.y = -Math.sin(bird.userData.flapAngle) * (Math.PI * 0.3);

        bird.userData.flapAngle += bird.userData.flapTime;
      });
    }

  }

  function changeCenter () {
    toGo.set(random(-100, 100), random(-100, 100), random(-60, -110));
    // Tween.to(dummy, 3, { v: 1, onComplete: changeCenter });
  }

  function createBirdModel (material) {
    const wing1Mesh = new THREE.Mesh(
      createWing(-1), material);
    const wing2Mesh = wing1Mesh.clone();

    wing2Mesh.rotation.z = -Math.PI;

    /*new THREE.Mesh(
      createWing(-1), bMaterial);*/

    const bird = new THREE.Object3D();
    bird.add(wing1Mesh);
    bird.add(wing2Mesh);

    wing1Mesh.rotation.x = wing2Mesh.rotation.x = Math.PI * 0.5;

    return bird;
  }

  function createWing (direction = 1) {

    const wingGeometry = new THREE.BufferGeometry();


    const geom = new THREE.Geometry();
    const v1 = new THREE.Vector3(0, -1, 0);
    const v2 = new THREE.Vector3(direction * 2, -1, 0);
    const v3 = new THREE.Vector3(0, 1, 0);
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);

    geom.faceVertexUvs[0].push([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 1)
    ]);
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );

    geom.computeFaceNormals();
    geom.computeVertexNormals();

    return wingGeometry.fromGeometry(geom);
  }

  function _attractedTo (bird) {
    const bp = bird.position;
    return tmpVec.copy(toGo).sub(bp).multiplyScalar(bird.userData.attractedMod);
  }

  function _centerMass (bird) {
    let pcj = tmpVec.set(0, 0, 0);

    for (let i = 0; i < birdsList.length; i++) {
      const b = birdsList[i];
      if (b.id !== bird.id) {
        pcj.add(b.position);
      }
    }

    pcj.divideScalar(birdsList.length - 1);

    return pcj.sub(bird.position).multiplyScalar(bird.userData.centerMassMod);
  }

  function _avoid (bird) {
    let c = tmpVec.set(0, 0, 0);

    const birdPos = bird.position;
    let subVec = tmpVec1.set(0, 0, 0);

    for (let i = 0; i < birdsList.length; i++) {
      const b = birdsList[i];
      if (b.id !== bird.id) {
        const bPos = b.position;
        if (bPos.distanceToSquared(birdPos) < b.userData.avoidNB) {
          subVec.subVectors(birdPos, bPos);
          c.add(subVec.multiplyScalar(b.userData.avoidMod));
        }
      }
    }

    return c;
  }
};
