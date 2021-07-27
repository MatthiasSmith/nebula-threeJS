import './style.css';
import * as THREE from 'three';
import * as POSTPROCESSING from 'postprocessing';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import smokeImage from '../public/smoke-1.png';
import starsImage from '../public/stars.jpeg';

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

const ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  60,
  sizes.width / sizes.height,
  1,
  1000
);
camera.position.z = 1;
camera.rotation.x = 1.16;
camera.rotation.y = -0.12;
camera.rotation.z = 0.27;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  powerPreference: 'high-performance',
  antialias: false,
  stencil: false,
  depth: false,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const composer = new POSTPROCESSING.EffectComposer(renderer);
composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

// Fog
scene.fog = new THREE.FogExp2(0x112437, 0.001); //03544e
renderer.setClearColor(scene.fog.color);

/* Cloud */
let cloudParticles = [];

const loader = new THREE.TextureLoader();

loader.load(smokeImage, function (texture) {
  const cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
  });

  for (let i = 0; i < 50; i++) {
    const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
    cloud.position.set(
      Math.random() * 800 - 400,
      500,
      Math.random() * 500 - 500
    );
    cloud.rotation.x = 1.16;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random() * 2 * Math.PI;
    cloud.material.opacity = 0.55;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
});

// background
loader.load(starsImage, function (texture) {
  const textureEffect = new POSTPROCESSING.TextureEffect({
    blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
    texture: texture,
  });
  textureEffect.blendMode.opacity.value = 0.2;

  const bloomEffect = new POSTPROCESSING.BloomEffect({
    blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
    kernelSize: POSTPROCESSING.KernelSize.SMALL,
    useLuminanceFilter: true,
    luminanceThreshold: 0.3,
    luminanceSmoothing: 0.75,
  });
  bloomEffect.blendMode.opacity.value = 1;

  const effectPass = new POSTPROCESSING.EffectPass(
    camera,
    bloomEffect,
    textureEffect
  );
  effectPass.renderToScreen = true;

  composer.addPass(effectPass);
  // render();
});

/* Lights */
const dLight = new THREE.DirectionalLight(0xff8c19);
dLight.position.set(0, 0, 1);
scene.add(dLight);

const orangeLight = new THREE.PointLight(0xcc6600, 50, 450, 1.7);
orangeLight.position.set(200, 300, 100);
scene.add(orangeLight);

const redLight = new THREE.PointLight(0xd8547e, 50, 450, 1.7);
redLight.position.set(100, 300, 100);
scene.add(redLight);

const blueLight = new THREE.PointLight(0x3677ac, 50, 450, 1.7);
blueLight.position.set(300, 300, 200);
scene.add(blueLight);

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  // const elapsedTime = clock.getElapsedTime();

  // Update objects
  //   sphere.rotation.y = 0.5 * elapsedTime;

  // Update Orbital Controls
  // controls.update()

  // rotate clouds
  cloudParticles.forEach((p) => (p.rotation.z -= 0.001));

  // Render
  composer.render(clock.getDelta()); //(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
