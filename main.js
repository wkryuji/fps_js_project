console.log("これはCDNで読み込んだ最新版の main.js です！");

// CDNからthree.js本体を読み込む
import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';

// CDNからPointerLockControlsを読み込む
import { PointerLockControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
let bullets = [];
let clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 200, 0);
  scene.add(light);

  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.set(0, 1, -20);
  box.name = 'enemy';
  scene.add(box);

  controls = new PointerLockControls(camera, document.body);
  document.body.addEventListener('click', () => controls.lock(), false);
  scene.add(controls.getObject());

  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyW': controls.moveForward(0.5); break;
      case 'KeyS': controls.moveForward(-0.5); break;
      case 'KeyA': controls.moveRight(-0.5); break;
      case 'KeyD': controls.moveRight(0.5); break;
    }
  });

  document.addEventListener('mousedown', () => {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(camera.position);
    bullet.userData.velocity = new THREE.Vector3();
    bullet.userData.velocity.setFromMatrixColumn(camera.matrix, 0).cross(camera.up).negate().normalize().multiplyScalar(2);
    bullet.userData.velocity.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(5));
    bullets.push(bullet);
    scene.add(bullet);
  });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.position.add(b.userData.velocity.clone().multiplyScalar(delta));
    if (b.position.length() > 100) {
      scene.remove(b);
      bullets.splice(i, 1);
    }

    const enemy = scene.getObjectByName('enemy');
    if (enemy && b.position.distanceTo(enemy.position) < 1.5) {
      scene.remove(enemy);
      scene.remove(b);
      bullets.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}
