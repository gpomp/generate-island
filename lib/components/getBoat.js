const {Noise} = require('noisejs');
const newArray = require('new-array');
const MAX_Z = 40;
const WATER_LEVEL = 15;
module.exports = function (app, opts = {}) {
  const ctn = new THREE.Object3D();
  const noise = new Noise(opts.seed);
  const noise1 = new Noise();
  let time = 0;
  let waterfalls = new THREE.Vector2();
  const nextPos = new THREE.Vector2();
  const currPos = new THREE.Vector2();

 /* const boatGeom = new THREE.BoxBufferGeometry(1, 2, 1);
  const innerBoat = new THREE.Mesh(boatGeom, new THREE.MeshPhongMaterial({ 
    emissive: 0x333333,
    color: 0xFF0000,
    shininess: 8
  }));
  const boat = new THREE.Object3D();
  boat.add(innerBoat);
  innerBoat.rotation.z = Math.PI * 0.5;
  boat.scale.set(5, 5, 5);*/
  const boatList = [];
  newArray(6).map((b, i) => {
    const loader = new THREE.ObjectLoader();
    loader.load(`models/boat${i+1}.json`,
    (obj) => {
      const innerBoat = obj;
      const boat = new THREE.Object3D();
      boat.add(innerBoat);
      innerBoat.rotation.x = -Math.PI * 0.5;
      boat.scale.set(0.003, 0.003, 0.003);

      const xyz = findPointInSea();
      boat.position.set(-0.5 + xyz[0], -0.5 + xyz[1], 0).multiplyScalar(opts.scale);
      boat.position.z = WATER_LEVEL;
      boat.userData = {
        direction: Math.random() * Math.PI * 2,
        dir: Math.random() > 0.5 ? 1 : -1,
        speed: 0.0001 + Math.random() * 0.00025,
        pos2D: new THREE.Vector2(xyz[0], xyz[1]),
        angle: 0,
        timeTank: Math.random()
      }

      ctn.add(boat);
      boatList.push(boat);
    });
  });

  // ctn.add(boat);

  

  return {
    object3d: ctn,
    update (dt) {
      time += dt * 0.025;
      boatList.forEach((b, i) => processBoat(b, i, dt));
    },
    setWaterFalls (v) {
      waterfalls = v;
    }
  }

  function processBoat (boat, i, dt) {
    const oPosX = boat.userData.pos2D.x;
    const oPosY = boat.userData.pos2D.y;
    let nextPosX = (oPosX + Math.cos(boat.userData.direction) * boat.userData.speed * 20) % 1;
    let nextPosY = (oPosY + Math.sin(boat.userData.direction) * boat.userData.speed * 20) % 1;
    
    // let wfDistance = waterfalls.distanceTo(nextPos);
    let n = getPos(-0.5 + nextPosX, -0.5 + nextPosY, opts.divide, noise);
    if (n < 0.4 || nextPosX <= 0.00001 || nextPosY <= 0.00001 || nextPosX >= 0.9999 || nextPosX >= 0.9999) {
      boat.userData.direction = (boat.userData.direction + boat.userData.dir * 0.15) % (Math.PI * 2);

      nextPosX = (oPosX + Math.cos(boat.userData.direction) * boat.userData.speed * 20) % 1;
      nextPosY = (oPosY + Math.sin(boat.userData.direction) * boat.userData.speed * 20) % 1;
    }
    const currX = (oPosX + Math.cos(boat.userData.direction) * boat.userData.speed) % 1;
    const currY = (oPosY + Math.sin(boat.userData.direction) * boat.userData.speed) % 1;
    nextPos.subVectors(waterfalls, currPos.set(currX, currY)).multiplyScalar(0.1);
    boat.position.set(
      -0.5 + (currX + nextPos.x),
      -0.5 + (currY + nextPos.y),
      0).multiplyScalar(opts.scale);
    boat.position.z = WATER_LEVEL;
    boat.rotation.z = boat.userData.direction;
    boat.children[0].rotation.z = Math.sin(boat.userData.angle) * (Math.PI / 20);
    boat.userData.angle = boat.userData.timeTank;
    boat.userData.timeTank += dt * 2.5;
    boat.userData.pos2D.set(currX, currY);

  }

  function findPointInSea () {
    let startX = 0.1 + Math.random() * 0.8;
    let startY = 0.1 + Math.random() * 0.8;

    let n = -1;

    while (n < 0.4) {
      n = getPos(-0.5 + startX, -0.5 + startY, opts.divide, noise);
      if (n >= 0.4) {
        return [startX, startY, n];
      }
      startX = 0.1 + ((startX + 0.05) % 0.8);
      startY = 0.1 + ((startY + 0.025) % 0.8);
    }
  }

  function getPos (x, y, divide, noise) {
    let n = noise.simplex2(x / divide, y / divide);
    n += noise.simplex2(x / divide * 2, y / divide * 2) * 0.5;
    n += noise.simplex2(x / divide * 4, y / divide * 4) * 0.25;
    n += noise.simplex2(x / divide * 8, y / divide * 8) * 0.125;
    n += noise.simplex2(x / divide * 16, y / divide * 16) * 0.0625;
    n += noise.simplex2(x / divide * 32, y / divide * 32) * 0.03125;
    // n = (n - 1);
    // const z = n;
    return n;
  }
}
