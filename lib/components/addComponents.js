const getBox = require('./getBox');
const query = require('../util/query');
const getMountain = require('./getMountain');
const getLights = require('./getLights');
const getSphere = require('./getAroundSphere');
const getSnow = require('./getSnow');
const getSea = require('./getSea');
const getTrees = require('./getTrees');
const getBoat = require('./getBoat');
const getBirds = require('./getBirds');
const getFalls = require('./getFalls');
const getStorm = require('./getStorm');

const SCALE = 400;

module.exports = function ({ app, components }) {
  if (!query.gui) {
    const ui = document.querySelector('.dg.ac');
    ui.style.display = 'none';
  } else {
    const ui = document.querySelector('.dg.ac');
    ui.style.zIndex = 1000;
  }

  const seed = Math.random();
  const divide = 0.5;

  const lights = components.add(getLights(app));
  const mountain = components.add(getMountain(app, { scale: SCALE, seed, divide }));
  const boat = components.add(getBoat(app, { scale: SCALE, seed, divide }));
  // const snow = components.add(getSnow(app));
  const sea = components.add(getSea(app, { scale: SCALE }));
  const trees = components.add(getTrees(app, { scale: SCALE }));
  const birds = components.add(getBirds(app, { scale: SCALE }));
  const storm = components.add(getStorm(app, { scale: SCALE }));
  // const sphere = components.add(getSphere(app));
  mountain.onMountainReady.add(mountainReady);

  function mountainReady () {
    // app.mainComponent.remove(snow.object3d);
    // app.scene2.add(snow.object3d);
    // const mountainCopy = mountain.getClone();
    // mountainCopy.material.colorWrite = false;
    // mountainCopy.rotation.x = Math.PI * 0.5;
    // app.scene2.add(mountainCopy);
    // const falls = components.add(getFalls(app, { scale: SCALE, g: mountain.getMountainInfo() }));
    // sea.uniforms.waterfalls.value.set(falls.end.x / SCALE + 0.5, falls.end.y / SCALE + 0.5);
    // boat.setWaterFalls (sea.uniforms.waterfalls.value.clone());
    // app.mainComponent.remove(falls.object3d);
    // app.scene2.add(falls.object3d);
    // falls.object3d.rotation.x = Math.PI * 0.5;
    trees.buildTrees(mountain.getMountainInfo(), SCALE).then((treeGeom) => {
      // const treesCopy = new THREE.Mesh(treeGeom, new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
      // treesCopy.material.colorWrite = false;
      // treesCopy.rotation.x = Math.PI * 0.5;
      // app.scene2.add(treesCopy);
    });
  }
};
