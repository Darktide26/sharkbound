
import * as THREE from
'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// =====================================
// SHARKBOUND - MAIN GAME
// =====================================

let tokens = 100;
let sharks = [];
let selectedChest = null;
let selectedActivity = null;

const rarityColors = {
  Common: '#aaaaaa',
  Uncommon: '#38d879',
  Rare: '#399cff',
  Epic: '#ae56ff',
  Legendary: '#ffc735',
  Mythical: '#ff55aa',
  Singularity: '#30204f',
  Apex: '#ff3838'
};

// =====================================
// SHARK DATABASE
// =====================================

const sharkDatabase = [
  {name:'Whale Shark', scientific:'Rhincodon typus', rarity:'Common'},
  {name:'Spiny Dogfish', scientific:'Squalus acanthias', rarity:'Common'},
  {name:'Nurse Shark', scientific:'Ginglymostoma cirratum', rarity:'Common'},
  {name:'Blacktip Reef Shark', scientific:'Carcharhinus melanopterus', rarity:'Common'},
  {name:'Horn Shark', scientific:'Heterodontus francisci', rarity:'Common'},
  {name:'Epaulette Shark', scientific:'Hemiscyllium ocellatum', rarity:'Common'},
  {name:'Small-spotted Catshark', scientific:'Scyliorhinus canicula', rarity:'Common'},
  {name:'Blue Shark', scientific:'Prionace glauca', rarity:'Uncommon'},
  {name:'Lemon Shark', scientific:'Negaprion brevirostris', rarity:'Uncommon'},
  {name:'Sand Tiger Shark', scientific:'Carcharias taurus', rarity:'Uncommon'},
  {name:'Bull Shark', scientific:'Carcharhinus leucas', rarity:'Uncommon'},
  {name:'Tiger Shark', scientific:'Galeocerdo cuvier', rarity:'Rare'},
  {name:'Great Hammerhead', scientific:'Sphyrna mokarran', rarity:'Rare'},
  {name:'Shortfin Mako', scientific:'Isurus oxyrinchus', rarity:'Rare'},
  {name:'Thresher Shark', scientific:'Alopias vulpinus', rarity:'Epic'},
  {name:'Goblin Shark', scientific:'Mitsukurina owstoni', rarity:'Epic'},
  {name:'Greenland Shark', scientific:'Somniosus microcephalus', rarity:'Epic'},
  {name:'Frilled Shark', scientific:'Chlamydoselachus anguineus', rarity:'Legendary'},
  {name:'Megamouth Shark', scientific:'Megachasma pelagios', rarity:'Legendary'},
  {name:'Basking Shark', scientific:'Cetorhinus maximus', rarity:'Mythical'},
  {name:'Cookiecutter Shark', scientific:'Isistius brasiliensis', rarity:'Singularity'},
  {name:'Great White Shark', scientific:'Carcharodon carcharias', rarity:'Apex'}
];

// =====================================
// CHEST CONFIGURATION
// =====================================

const chests = [
  {name:'Wooden Chest',cost:50,max:2,color:0x9b582b},
  {name:'Reinforced Chest',cost:250,max:3,color:0x9ca8b5},
  {name:'Golden Chest',cost:1000,max:4,color:0xffc928},
  {name:'Crystal Chest',cost:5000,max:5,color:0x9b4dff},
  {name:'Abyss Chest',cost:25000,max:6,color:0x30204f},
  {name:'Primordial Chest',cost:100000,max:7,color:0xff3737}
];

// Rarity indexes:
// 0 Common, 1 Uncommon, 2 Rare, 3 Epic,
// 4 Legendary, 5 Mythical, 6 Singularity, 7 Apex.

const rarityWeights = [
  60, 25, 10, 4, 0.8, 0.18, 0.019, 0.001
];

// Same rarity probability table for all chests.
// Higher chests unlock additional rarity tiers.
// Probabilities are renormalized across unlocked tiers.

function rollRarity(maxRarity) {
  let available = rarityWeights.slice(0, maxRarity + 1);
  let total = available.reduce((a,b) => a+b, 0);

  let roll = Math.random() * total;

  for(let i=0;i<available.length;i++) {
    roll -= available[i];
    if(roll <= 0) return i;
  }

  return 0;
}

function rarityName(index) {
  return [
    'Common','Uncommon','Rare','Epic',
    'Legendary','Mythical','Singularity','Apex'
  ][index];
}

// =====================================
// THREE.JS WORLD
// =====================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x063c62);
scene.fog = new THREE.FogExp2(0x075477, 0.009);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth/window.innerHeight, 0.1, 1000
);

camera.position.set(0, 3, 12);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9deaff,0x06304c,2));

const sun = new THREE.DirectionalLight(0xffffff,2);
sun.position.set(10,30,10);
sun.castShadow = true;
scene.add(sun);

// =====================================
// OCEAN FLOOR
// =====================================

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(250,250),
  new THREE.MeshStandardMaterial({
    color:0x174f48,
    roughness:0.9
  })
);

floor.rotation.x=-Math.PI/2;
floor.position.y=-2;
floor.receiveShadow=true;
scene.add(floor);

// =====================================
// CORAL AND ENVIRONMENT
// =====================================

function createCoral(x,z) {
  const group=new THREE.Group();

  const colors=[0xff6a75,0xffa44d,0xa65bff,0x43c9c1];
  const color=colors[Math.floor(Math.random()*colors.length)];

  for(let i=0;i<5;i++) {
    const branch=new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.08,0.18,Math.random()*2+1,8
      ),
      new THREE.MeshStandardMaterial({color})
    );

    branch.position.set(
      (Math.random()-.5)*1.2,
      0.5+Math.random(),
      (Math.random()-.5)*1.2
    );

    branch.rotation.z=(Math.random()-.5)*0.6;
    branch.castShadow=true;
    group.add(branch);
  }

  group.position.set(x,-1,z);
  scene.add(group);
}

for(let i=0;i<90;i++) {
  createCoral(
    (Math.random()-.5)*150,
    (Math.random()-.5)*150
  );
}

// Rocks

for(let i=0;i<100;i++) {
  const rock=new THREE.Mesh(
    new THREE.DodecahedronGeometry(
      Math.random()*2+0.5,1
    ),
    new THREE.MeshStandardMaterial({
      color:0x42616a,
      roughness:1
    })
  );

  rock.position.set(
    (Math.random()-.5)*150,
    -1,
    (Math.random()-.5)*150
  );

  rock.castShadow=true;
  scene.add(rock);
}

// =====================================
// BUBBLES
// =====================================

const bubbles=[];

for(let i=0;i<100;i++) {
  const bubble=new THREE.Mesh(
    new THREE.SphereGeometry(.08,8,8),
    new THREE.MeshBasicMaterial({
      color:0x9ceaff,
      transparent:true,
      opacity:.5
    })
  );

  bubble.position.set(
    (Math.random()-.5)*100,
    Math.random()*20,
    (Math.random()-.5)*100
  );

  scene.add(bubble);
  bubbles.push(bubble);
}

// =====================================
// DETAILED CHESTS
// =====================================

function createChest(position,config,index) {
  const group=new THREE.Group();

  const wood=new THREE.MeshStandardMaterial({
    color:0x79401f,
    roughness:.75
  });

  const metal=new THREE.MeshStandardMaterial({
    color:config.color,
    metalness:.75,
    roughness:.25,
    emissive:config.color,
    emissiveIntensity:.08
  });

  // Main wooden body
  const body=new THREE.Mesh(
    new THREE.BoxGeometry(2,1.1,1.3),
    wood
  );

  body.position.y=.55;
  body.castShadow=true;
  group.add(body);

  // Wooden plank details
  for(let i=0;i<6;i++) {
    const plank=new THREE.Mesh(
      new THREE.BoxGeometry(.025,1.05,1.32),
      new THREE.MeshStandardMaterial({color:0x482516})
    );

    plank.position.set(-.85+i*.34,.55,0);
    group.add(plank);
  }

  // Metal bands
  for(let x of [-.8,.8]) {
    const band=new THREE.Mesh(
      new THREE.BoxGeometry(.18,1.3,1.38),
      metal
    );

    band.position.set(x,.6,0);
    group.add(band);
  }

  // Lid
  const lid=new THREE.Mesh(
    new THREE.BoxGeometry(2.05,.4,1.4),
    wood
  );

  lid.position.y=1.3;
  lid.castShadow=true;
  group.add(lid);

  // Metal lock
  const lock=new THREE.Mesh(
    new THREE.BoxGeometry(.28,.4,.12),
    metal
  );

  lock.position.set(0,.95,.73);
  group.add(lock);

  // Decorative studs
  for(let x of [-.85,.85]) {
    for(let y of [.2,.9]) {
      const stud=new THREE.Mesh(
        new THREE.SphereGeometry(.07,8,8),
        metal
      );
      stud.position.set(x,y,.68);
      group.add(stud);
    }
  }

  // Glow
  const glow=new THREE.PointLight(config.color,2,5);
  glow.position.y=1.8;
  group.add(glow);

  group.position.copy(position);
  group.userData={
    type:'chest',
    chestIndex:index,
    config,
    lid,
    opened:false
  };

  scene.add(group);
  interactables.push(group);

  return group;
}

// =====================================
// CHEST SPAWNING
// =====================================

const interactables=[];
const chestObjects=[];

chests.forEach((chest,i)=>{
  const angle=i*Math.PI*2/6;
  const position=new THREE.Vector3(
    Math.sin(angle)*10,
    0,
    Math.cos(angle)*10
  );

  chestObjects.push(createChest(position,chest,i));
});

// =====================================
// ACTIVITY STATIONS
// =====================================

function createStation(name,color,x,z,description) {
  const group=new THREE.Group();

  const base=new THREE.Mesh(
    new THREE.CylinderGeometry(2,2.4,.6,16),
    new THREE.MeshStandardMaterial({color})
  );

  base.position.y=.3;
  group.add(base);

  const crystal=new THREE.Mesh(
    new THREE.OctahedronGeometry(.8),
    new THREE.MeshStandardMaterial({
      color,
      emissive:color,
      emissiveIntensity:.5
    })
  );

  crystal.position.y=2;
  group.add(crystal);

  group.position.set(x,0,z);

  group.userData={
    type:'activity',
    name,
    description
  };

  scene.add(group);
  interactables.push(group);
}

createStation(
  'Coral Clicker Cove',
  0x00d9ff,
  0,20,
  'Click to earn tokens!'
);

createStation(
  'Abyssal Parkour',
  0xffa52b,
  20,0,
  'Complete the obstacle challenge!'
);

createStation(
  'Shipwreck Depths',
  0x9d57ff,
  -20,0,
  'Explore the wreckage for rewards!'
);

// =====================================
// PLAYER MOVEMENT
// =====================================

const keys={};
let yaw=0;
let pitch=0;
let pointerLocked=false;

document.addEventListener('keydown',e=>{
  keys[e.code]=true;

  if(e.code==='KeyE') interact();
});

document.addEventListener('keyup',e=>{
  keys[e.code]=false;
});

renderer.domElement.addEventListener('click',()=>{
  renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange',()=>{
  pointerLocked=document.pointerLockElement===renderer.domElement;
});

document.addEventListener('mousemove',e=>{
  if(!pointerLocked) return;

  yaw-=e.movementX*.002;
  pitch-=e.movementY*.002;

  pitch=Math.max(-1.4,Math.min(1.4,pitch));
});

function movePlayer(delta) {
  const speed=keys.ShiftLeft?12:6;

  const forward=new THREE.Vector3(
    -Math.sin(yaw),0,-Math.cos(yaw)
  );

  const right=new THREE.Vector3(
    Math.cos(yaw),0,-Math.sin(yaw)
  );

  if(keys.KeyW) camera.position.addScaledVector(forward,speed*delta);
  if(keys.KeyS) camera.position.addScaledVector(forward,-speed*delta);
  if(keys.KeyD) camera.position.addScaledVector(right,speed*delta);
  if(keys.KeyA) camera.position.addScaledVector(right,-speed*delta);

  if(keys.Space) camera.position.y+=speed*delta;
  if(keys.ControlLeft) camera.position.y-=speed*delta;

  camera.position.y=Math.max(-1,Math.min(15,camera.position.y));

  const direction=new THREE.Vector3(
    -Math.sin(yaw)*Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw)*Math.cos(pitch)
  );

  camera.lookAt(camera.position.clone().add(direction));
}

// =====================================
// INTERACTION SYSTEM
// =====================================

let nearby=null;

function interact() {
  if(!nearby) return;

  if(nearby.userData.type==='chest') {
    selectedChest=nearby;
    showChestMenu();
  }

  if(nearby.userData.type==='activity') {
    selectedActivity=nearby;
    showActivityMenu();
  }
}

function checkNearby() {
  nearby=null;

  let closest=5;

  for(const object of interactables) {
    const distance=camera.position.distanceTo(object.position);

    if(distance<closest) {
      closest=distance;
      nearby=object;
    }
  }

  const prompt=document.getElementById('interaction');

  if(nearby) {
    prompt.classList.remove('hidden');

    document.getElementById('interaction-text').textContent=
      'Press E - '+(nearby.userData.name ||
      nearby.userData.config.name);
  } else {
    prompt.classList.add('hidden');
  }
}

// =====================================
// CHEST OPENING
// =====================================

function showChestMenu() {
  const config=selectedChest.userData.config;

  document.getElementById('chest-menu').classList.remove('hidden');
  document.getElementById('chest-name').textContent=config.name;
  document.getElementById('chest-price').textContent=
    config.cost.toLocaleString()+' Tokens';

  document.getElementById('chest-result').textContent='';
}

function closeChest() {
  document.getElementById('chest-menu').classList.add('hidden');
  selectedChest=null;
}

function openChest() {
  if(!selectedChest) return;

  const data=selectedChest.userData;
  const config=data.config;

  if(tokens<config.cost) {
    document.getElementById('chest-result').textContent=
      'Not enough tokens!';
    return;
  }

  tokens-=config.cost;
  updateTokens();

  const rarityIndex=rollRarity(config.max);
  const rarity=rarityName(rarityIndex);

  const available=sharkDatabase.filter(
    s=>s.rarity===rarity
  );

  const shark=available[
    Math.floor(Math.random()*available.length)
  ];

  if(!shark) {
    document.getElementById('chest-result').textContent=
      'No shark available for this rarity.';
    return;
  }

  sharks.push({
    ...shark,
    id:Date.now()+Math.random()
  });

  saveGame();
  updateInventory();

  document.getElementById('chest-result').innerHTML=`
    <h2 style="color:${rarityColors[rarity]}">
      ${rarity.toUpperCase()}!
    </h2>
    <h3>${shark.name}</h3>
    <p><i>${shark.scientific}</i></p>
    <p>New shark discovered!</p>
  `;
}

// =====================================
// INVENTORY
// =====================================

function updateInventory() {
  const list=document.getElementById('shark-list');
  list.innerHTML='';

  sharks.forEach(shark=>{
    const card=document.createElement('div');
    card.className='shark-card';

    card.innerHTML=`
      <strong>${shark.name}</strong>
      <small>${shark.scientific}</small>
      <small style="color:${rarityColors[shark.rarity]}">
        ${shark.rarity}
      </small>
    `;

    list.appendChild(card);
  });

  const aquarium=document.getElementById('aquarium-list');
  aquarium.innerHTML='';

  sharks.forEach(shark=>{
    const item=document.createElement('div');
    item.className='shark-card';
    item.textContent=shark.name+' - '+shark.rarity;
    aquarium.appendChild(item);
  });
}

function toggleInventory() {
  document.getElementById('inventory').classList.toggle('hidden');
  document.exitPointerLock?.();
}

function toggleAquarium() {
  document.getElementById('aquarium').classList.toggle('hidden');
  document.exitPointerLock?.();
}

// =====================================
// ACTIVITY SYSTEM
// =====================================

let clickRewards=1;

function showActivityMenu() {
  const data=selectedActivity.userData;

  document.getElementById('activity-menu').classList.remove('hidden');
  document.getElementById('activity-title').textContent=data.name;
  document.getElementById('activity-description').textContent=
    data.description;

  document.getElementById('activity-button').textContent=
    data.name==='Coral Clicker Cove'?'CLICK FOR TOKENS':'START CHALLENGE';

  document.exitPointerLock?.();
}

function closeActivity() {
  document.getElementById('activity-menu').classList.add('hidden');
  selectedActivity=null;
}

function activityAction() {
  if(!selectedActivity) return;

  const name=selectedActivity.userData.name;

  if(name==='Coral Clicker Cove') {
    tokens+=clickRewards;
    updateTokens();
    saveGame();

    document.getElementById('activity-description').textContent=
      `+${clickRewards} tokens! Keep clicking!`;
  }

  else if(name==='Abyssal Parkour') {
    tokens+=100;
    updateTokens();
    saveGame();

    document.getElementById('activity-description').textContent=
      'Challenge completed! +100 tokens!';
  }

  else {
    tokens+=50;
    updateTokens();
    saveGame();

    document.getElementById('activity-description').textContent=
      'You found a hidden treasure! +50 tokens!';
  }
}

// =====================================
// SAVING
// =====================================

function saveGame() {
  localStorage.setItem('sharkbound_save',JSON.stringify({
    tokens,
    sharks
  }));
}

function loadGame() {
  const data=JSON.parse(
    localStorage.getItem('sharkbound_save')||'null'
  );

  if(data) {
    tokens=data.tokens ?? 100;
    sharks=data.sharks ?? [];
  }

  updateTokens();
  updateInventory();
}

function updateTokens() {
  document.getElementById('tokens').textContent=
    tokens.toLocaleString();
}

// =====================================
// GAME LOOP
// =====================================

const clock=new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta=Math.min(clock.getDelta(),.05);

  movePlayer(delta);
  checkNearby();

  // Animate bubbles
  bubbles.forEach(bubble=>{
    bubble.position.y+=delta*.5;

    if(bubble.position.y>20) {
      bubble.position.y=-2;
    }
  });

  // Animate chest glow and floating stations
  scene.traverse(object=>{
    if(object.userData.type==='chest') {
      object.children.forEach(child=>{
        if(child.isPointLight) {
          child.intensity=1.5+
            Math.sin(clock.elapsedTime*2)*.5;
        }
      });
    }
  });

  renderer.render(scene,camera);
}

// =====================================
// RESIZE
// =====================================

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth,window.innerHeight);
});

// =====================================
// START
// =====================================

loadGame();

document.getElementById('loading').style.display='none';

animate();
