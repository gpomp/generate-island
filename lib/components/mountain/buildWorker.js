const {Noise} = require('noisejs');
const lerp = require('lerp');
const clamp = require('clamp');
const newArray = require('new-array');
const THREE = require('THREE');

const MAX_Z = 40;
const maxDist = Math.sqrt(0.001);

const baseColor = 0x70432C;
const vegColor = 0x4E7500;
const snowColor = 0xFFFFFF;

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

function distance (x1, y1, x2, y2) {
  const xDiff = x2 - x1;
  const yDiff = y2 - y1;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function getColor (v, noise, divide) {
  let color = new THREE.Color(baseColor);
  color.lerp(new THREE.Color(vegColor), (noise.simplex2(v.x / divide, v.y / divide) + 1) / 2);
  const snowRatio = clamp((MAX_Z * 2 - (v.z + MAX_Z)) / (MAX_Z * 2), 0, 1);
  color.lerp(new THREE.Color(snowColor), (noise.simplex2(v.x / divide, v.y / divide) + 1) / 2 * Math.ceil(snowRatio - 0.5));

  return color;  
}
function processVertex (v, divide, noise, colors, i) {
  if (v.x + 0.5 === 0 || v.x + 0.5 === 1 || v.y + 0.5 === 0 || v.y + 0.5 === 1) {
    v.z = MAX_Z;
    return;
  }
  v.x += -0.0025 + Math.random() * 0.005;
  v.y += -0.0025 + Math.random() * 0.005;
  
  /*noises.forEach((pos, j) => {
    const d = 1 - Math.max(0, Math.min(1, distance(v.x + 0.5, v.y + 0.5, pos[0], pos[1]) / maxDist));
    v.z += (pos[2] - v.z) * d;
  });*/
  v.z = getPos(v.x, v.y, divide, noise);
  v.z *= MAX_Z;
  v.z = Math.floor(v.z * 10) / 10;
}
  
module.exports = function (self) {
  self.addEventListener('message', function (ev) {
    const noise = new Noise(ev.data[2]);
    const vertices = ev.data[0].slice();
    const faces = ev.data[1].slice();
    const facesColors = [];
    const colors = [];
    const nbPoints = Math.floor(vertices.length / 2);
    const nbCols = Math.floor(Math.sqrt(nbPoints));
    const divide = ev.data[3];
    /*const noises = newArray(nbPoints).map((n, i) => {
      const x = (i % nbCols) / nbCols;
      const y = Math.floor(i / nbCols) / nbCols;
      return [x, y, getPos(x, y, divide, noise)];
    });
    let max = -10000;*/

    faces.forEach((f, i) => {
      const v0 = vertices[f.a];
      const v1 = vertices[f.b];
      const v2 = vertices[f.c];
      processVertex(v0, divide, noise, colors, i);
      processVertex(v1, divide, noise, colors, i);
      processVertex(v2, divide, noise, colors, i);

      const c0 = getColor(v0, noise, 0.4);
      const c1 = getColor(v1, noise, 0.4);
      const c2 = getColor(v2, noise, 0.4);
      facesColors.push([c0, c1, c2]);
    });

    self.postMessage([vertices, facesColors]);
  });
}
