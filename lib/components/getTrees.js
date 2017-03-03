const MODEL_LIST = [
  'models/tree2.json',
  'models/tree3.json',
  'models/tree4.json'
]

module.exports = function (app, opts) {
  const ctn = new THREE.Object3D();
  // const treeGeom = new THREE.BoxGeometry(2, 4, 2);
  const treeMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  // const tree = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 2, 1), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
  const wholeGeom = new THREE.Geometry();
  const treesList = [];

  
  const rot = new THREE.Vector3();
  const matrix = new THREE.Matrix4();

  const materialList = [
    new THREE.MeshPhongMaterial({ 
      emissive: 0x000000,
      color: 0x412212,
      shininess: 8
    }),
    new THREE.MeshPhongMaterial({ 
      emissive: 0x000000,
      color: 0xAAAA39,
      shininess: 8
    }),
    new THREE.MeshPhongMaterial({ 
      emissive: 0x000000,
      color: 0xAA9739,
      shininess: 8
    }),
    new THREE.MeshPhongMaterial({ 
      emissive: 0x000000,
      color: 0x563205,
      shininess: 8
    }),
    new THREE.MeshPhongMaterial({ 
      emissive: 0x000000,
      color: 0x561B05,
      shininess: 8
    }),
    new THREE.MeshPhongMaterial({ 
      emissive: 0x000000,
      color: 0x564105,
      shininess: 8
    })
    
  ];

  const materials = new THREE.MultiMaterial(materialList);


  return {
    object3d: ctn,
    update (dt) {

    },
    buildTrees (mountain, scale) {
      return new Promise((resolve, reject) => {
        loadTrees().then(() => {
          console.log('start trees');
          const faces = mountain.faces.filter((f) => {
            const v0 = mountain.vertices[f.a];
            const v1 = mountain.vertices[f.b];
            const v2 = mountain.vertices[f.c];
            const diff1 = Math.abs(v0.z - v1.z);
            const diff2 = Math.abs(v0.z - v2.z);
            const diff3 = Math.abs(v1.z - v2.z);
            return v0.z < 10 && v1.z < 10 && v2.z < 10 && diff1 < 2 && diff2 < 2 && diff3 < 2;
          });
          console.log('trees filtered');
          const pos = new THREE.Vector3();
          const sub = new THREE.Vector3();
          for (var i = 0; i < 500; i++) {
            const id = Math.floor(faces.length * Math.random());
            const f = faces[id];
            const v0 = mountain.vertices[f.a];
            const v1 = mountain.vertices[f.b];
            const v2 = mountain.vertices[f.c];

            pos.set(0, 0, 0);
            pos.add(v0).add(v1).add(v2).divideScalar(3);
            pos.add(sub.subVectors(v0, pos).multiplyScalar(Math.random()));
            pos.add(sub.subVectors(v1, pos).multiplyScalar(Math.random()));
            pos.add(sub.subVectors(v2, pos).multiplyScalar(Math.random()));
            pos.multiplyScalar(opts.scale);
            pos.z /= opts.scale;
            const treeID = Math.floor(treesList.length * Math.random());
            parseObject(treesList[treeID], pos, f, treeID, Math.random() * Math.PI * 2, -Math.PI * 0.1 + Math.random() * Math.PI * 0.2);
          }
          wholeGeom.sortFacesByMaterialIndex();
          const wholeMesh = new THREE.Mesh(wholeGeom, materials);
          ctn.add(wholeMesh);
          console.log('trees in place');
          resolve(wholeGeom);
        })
      });      
    }
  }

  function parseObject (obj, pos, face, treeID, rotationY, rotationZ) {
    obj.updateMatrix();
    obj.updateMatrixWorld();
    obj.children.forEach(c => {
      if (c.type === 'Mesh') {
        mergeObject(c, pos, face, treeID, rotationY, rotationZ);
      } else {
        parseObject(c, pos, face, treeID, rotationY, rotationZ);
      }
    });
    
  }

  function mergeObject (mesh, pos, f, treeID, rotationY, rotationZ) {
    const t = mesh.clone();
    t.updateMatrix();
    t.updateMatrixWorld();
    // t.up.set(0, -1, 0);
    let treeScale = 4;
    matrix.copy(mesh.matrixWorld);
    treeScale *= 0.08;
    t.scale.multiplyScalar(treeScale);
    t.position.add(pos);
    t.rotation.x += Math.PI;
    // t.rotation.y = rotationY;
    // t.rotation.z = 0;
    t.updateMatrix();
    matrix.premultiply(t.matrix);

    let matID = Math.floor(1 + Math.random() * (materialList.length - 1));
    if(mesh.name.toLowerCase().indexOf('trunk') > -1) {
      matID = 0;
    }

    wholeGeom.merge(t.geometry, matrix, matID);
  }

  function loadTrees () {
    return new Promise((resolve, reject) => {
      MODEL_LIST.forEach((m, i) => {
        const loader = new THREE.ObjectLoader();
        loader.load(m,
          (obj) => {
            treesList.push(obj);
            if (treesList.length === MODEL_LIST.length) {
              resolve();
            }
          }
        );
      });
    });
  }
};
