// === Three.js + Bee Model ===
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 13;

const scene = new THREE.Scene();
let bee;
let mixer;

const loader = new GLTFLoader();
loader.load(
  "https://raw.githubusercontent.com/DennysDionigi/bee-glb/94253437c023643dd868592e11a0fd2c228cfe07/demon_bee_full_texture.glb",
  function (gltf) {
    bee = gltf.scene;
    scene.add(bee);

    mixer = new THREE.AnimationMixer(bee);
    mixer.clipAction(gltf.animations[0]).play();
    modelMove();
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("Error loading model:", error);
  }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const reRender3D = () => {
  requestAnimationFrame(reRender3D);
  renderer.render(scene, camera);
  if (mixer) mixer.update(0.02);
};
reRender3D();

// === Bee Positions per Section ===
let arrPositionModel = [
  { id: "banner", position: { x: 0, y: -1, z: 0 }, rotation: { x: 0, y: 1.5, z: 0 } },
  { id: "intro", position: { x: 1, y: -1, z: -5 }, rotation: { x: 0.5, y: -0.5, z: 0.5 } },
  { id: "description", position: { x: -1, y: -1, z: -5 }, rotation: { x: 0, y: 0.5, z: 0.2 } },
  { id: "contact", position: { x: 0.45, y: -2, z: -10 }, rotation: { x: 0.2, y: -0.5, z: -0.2 } },
  { id: "lifecycle", position: { x: -2, y: -1, z: -7 }, rotation: { x: -0.3, y: 1, z: 0.1 } },
  { id: "products", position: { x: 2, y: 0, z: -6 }, rotation: { x: 0.2, y: -1, z: -0.2 } }
];

// === Light Colors per Section ===
const colors = {
  banner: 0xffd700,
  intro: 0x00ffcc,
  description: 0xff66cc,
  contact: 0xffffff,
  lifecycle: 0x88ff00,
  products: 0xff5500
};

const modelMove = () => {
  const sections = document.querySelectorAll(".section");
  let currentSection;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 3) {
      currentSection = section.id;
    }
  });
  let position_active = arrPositionModel.findIndex(val => val.id == currentSection);
  if (position_active >= 0) {
    let new_coordinates = arrPositionModel[position_active];
    gsap.to(bee.position, { ...new_coordinates.position, duration: 3, ease: "power1.out" });
    gsap.to(bee.rotation, { ...new_coordinates.rotation, duration: 3, ease: "power1.out" });

    
    let col = colors[currentSection];
    gsap.to(ambientLight.color, { 
      r: (col >> 16 & 255) / 255, 
      g: (col >> 8 & 255) / 255, 
      b: (col & 255) / 255, 
      duration: 2 
    });
  }
};

window.addEventListener("scroll", () => {
  if (bee) modelMove();
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


// === Background Particles ===
const canvas = document.getElementById("backgroundParticles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// حمل صورة الورقة
const leafImg = new Image();
leafImg.src = "images/leaf_animation.png"; // صورة ورقة شفافة (PNG)

// مصفوفة للأوراق
let leaves = [];

for (let i = 0; i < 20; i++) {
  leaves.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 40 + 20,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: Math.random() * 0.5 + 0.2,
    angle: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
  });
}

function animateLeaves() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  leaves.forEach((leaf) => {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate((leaf.angle * Math.PI) / 180);
    ctx.drawImage(leafImg, -leaf.size / 2, -leaf.size / 2, leaf.size, leaf.size);
    ctx.restore();

    // الحركة
    leaf.x += leaf.speedX;
    leaf.y += leaf.speedY;
    leaf.angle += leaf.rotationSpeed;

    // لو نزل تحت الشاشة يرجع من فوق
    if (leaf.y > canvas.height + leaf.size) {
      leaf.y = -leaf.size;
      leaf.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(animateLeaves);
}

leafImg.onload = () => animateLeaves();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
