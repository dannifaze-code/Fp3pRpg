// --- 1. LOOT GENERATION SYSTEM ---
const manufacturers = [
    { name: "The Goblin Tinkers", trait: "Explosive", flaw: "Might explode in your hands." },
    { name: "Necromancer's Syndicate", trait: "Lifesteal", flaw: "Whispers creepy advice constantly." },
    { name: "High Elf Purists", trait: "Arcane", flaw: "Insults you when you miss." },
    { name: "Dwarven Bureaucrats", trait: "Heavy Armor Piercing", flaw: "Requires you to fill out form 4B before swinging." }
];

const weaponTypes = ["Greatsword", "Blunderbuss", "Warhammer", "Staff", "Dagger"];
const adjectives = ["Apologetic", "Furious", "Depressed", "Over-Caffeinated", "Screaming"];
const rarities = [
    { level: "Common", color: "#aaaaaa", multiplier: 1 },
    { level: "Rare", color: "#0070dd", multiplier: 2.5 },
    { level: "Epic", color: "#a335ee", multiplier: 5 },
    { level: "Legendary", color: "#ff8000", multiplier: 10 }
];

function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateChaoticWeapon() {
    const rarity = getRandom(rarities);
    const manufacturer = getRandom(manufacturers);
    const type = getRandom(weaponTypes);
    const adjective = getRandom(adjectives);
    const baseDamage = Math.floor(Math.random() * 50) + 10;
    const finalDamage = Math.floor(baseDamage * rarity.multiplier);
    
    return {
        name: `The ${adjective} ${type}`,
        rarity: rarity.level,
        color: rarity.color,
        manufacturer: manufacturer.name,
        damage: finalDamage,
        damageType: manufacturer.trait,
        flavorText: manufacturer.flaw,
        goldValue: finalDamage * 15
    };
}

// --- 2. UI LOGIC ---
const uiOverlay = document.getElementById('ui-overlay');
let isUIOpen = false;

function toggleUI() {
    isUIOpen = !isUIOpen;
    uiOverlay.style.display = isUIOpen ? 'flex' : 'none';
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'i' || e.key === 'I' || e.key === 'Tab') {
        e.preventDefault(); 
        toggleUI();
    }
});

document.getElementById('close-btn').addEventListener('click', toggleUI);

function inspectItem() {
    const detailsPanel = document.getElementById('item-details');
    const newWeapon = generateChaoticWeapon();

    detailsPanel.innerHTML = `
        <div class="weapon-title" style="color: ${newWeapon.color};">
            ${newWeapon.name} (${newWeapon.rarity})
        </div>
        <div class="weapon-stats">
            Damage: <span style="color: #ff3333; font-weight: bold;">${newWeapon.damage} ${newWeapon.damageType}</span><br>
            Manufacturer: ${newWeapon.manufacturer}<br>
            Market Value: ${newWeapon.goldValue.toLocaleString()} Gold
        </div>
        <div class="weapon-flavor">"${newWeapon.flavorText}"</div>
        <button class="action-btn" id="list-btn">List on Auction House</button>
    `;
    
    document.getElementById('list-btn').addEventListener('click', () => alert('Item Listed!'));
}

document.getElementById('slot-legendary').addEventListener('click', inspectItem);
document.getElementById('slot-epic').addEventListener('click', inspectItem);

// --- 3. THREE.JS 3D ENGINE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a24);
scene.fog = new THREE.Fog(0x1a1a24, 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffddaa, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a45, roughness: 0.8 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x9900ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1;
player.castShadow = true;
scene.add(player);

for(let i = 0; i < 8; i++) {
    const pillarGeo = new THREE.BoxGeometry(2, 5, 2);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set((Math.random() - 0.5) * 30, 2.5, (Math.random() - 0.5) * 30);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);
}

// --- 4. GAME LOOP & MOVEMENT ---
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

const speed = 0.15;

function animate() {
    requestAnimationFrame(animate);

    if (!isUIOpen) {
        if (keys['KeyW']) player.position.z -= speed;
        if (keys['KeyS']) player.position.z += speed;
        if (keys['KeyA']) player.position.x -= speed;
        if (keys['KeyD']) player.position.x += speed;

        camera.position.x = player.position.x;
        camera.position.y = player.position.y + 6;
        camera.position.z = player.position.z + 10;
        camera.lookAt(player.position);
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();