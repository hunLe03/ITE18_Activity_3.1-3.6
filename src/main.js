// John Napoleon Cortes  ITE18 - AD1

import * as THREE from 'three';

// local modules
import starfield from "./mods/starfield.js";
import { getGlowMat } from "./mods/getGlowMat.js";

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Renderer
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);

renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100);
camera.position.set(0, 0, 4);
scene.add(camera);

// Directional Lights
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// Object
// Create Planet Object 
function createPlanet(texturePaths, radius = 1, detail = 12, rimHex, facingHex) {
    const { map, lights, clouds } = texturePaths;
    const loader = new THREE.TextureLoader();
    const icoGeometry = new THREE.IcosahedronGeometry(radius, detail);

    // Planet surface material
    const planetMat = new THREE.MeshStandardMaterial({
        map: loader.load(map),
        flatShading: true
    });
    const planetMesh = new THREE.Mesh(icoGeometry, planetMat);

    // lights material (optional)
    const lightMat = lights
        ? new THREE.MeshBasicMaterial({
            opacity: 0.1,
            map: loader.load(lights),
            blending: THREE.AdditiveBlending
        })
        : null;
    const lightMesh = lightMat ? new THREE.Mesh(icoGeometry, lightMat) : null;

    // Clouds material (optional)
    const cloudMat = clouds
        ? new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.7,
            map: loader.load(clouds),
            blending: THREE.AdditiveBlending
        })
        : null;
    const cloudMesh = cloudMat ? new THREE.Mesh(icoGeometry, cloudMat) : null;

    // Group to hold all parts of the planet
    const planetGroup = new THREE.Group();
    planetGroup.add(planetMesh);
    if (lightMesh) planetGroup.add(lightMesh);
    if (cloudMesh) {
        cloudMesh.scale.setScalar(1.003);
        planetGroup.add(cloudMesh);
    }

    const glowMat = getGlowMat({ rimHex, facingHex });
    const glowMesh = new THREE.Mesh(icoGeometry, glowMat);
    glowMesh.scale.setScalar(1.01);
    planetGroup.add(glowMesh);

    return planetGroup;
}

const earth = createPlanet({
    map: "../textures/earthTextures/earthmap1k.jpg",
    lights: "../textures/earthTextures/earthlights1k.jpg",
    clouds: "../textures/earthTextures/earthcloudmaptrans.jpg"
});
scene.add(earth);

const mars = createPlanet({
    map: "../textures/marsTextures/marsmap.jpg",
},
    0.47,// radius
    32, //detail
    0xfda600, // rim color
    0x451804, // face color
);
scene.add(mars);

const jupiter = createPlanet({
    map: "../textures/jupiterTextures/jupitermap.jpg",
},
    11,// radius
    32, //detail
    0x000000, // rim color
    0xc99039, // facing color
);
scene.add(jupiter);

// starfield
const stars = starfield({ numStars: 2000 });
scene.add(stars);

// ----------------------------------------------------
earth.position.set(0, 0, 1);
mars.position.set(0, 0, -3.5);
jupiter.position.set(0, 0, -28);

let scrollY = 0;
let currentSection = 0;
const sectionsContainer = document.querySelector('.sections-container');

sectionsContainer.addEventListener('scroll', () => {
    scrollY = sectionsContainer.scrollTop;

    const newSection = Math.round(scrollY / sizes.height);
    if (newSection !== currentSection) {
        currentSection = newSection;
    }

    let targetZ = 4 - scrollY / sizes.height * 5; // Default zoom speed

    if (currentSection === 0) {
        targetZ = 4 - scrollY / sizes.height * 5;
        camera.position.set(0, 0, targetZ);
    } else if (currentSection === 1) {
        targetZ = 3 - scrollY / sizes.height * 5;
        camera.position.set(0, 0, targetZ);
    } else if (currentSection === 2) {
        targetZ = 2 - scrollY / sizes.height * 5;
        camera.position.set(0, 0, targetZ);
    }

});

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



// Animation

const tick = () => {

    console.log(scrollY)


    earth.rotation.y += 0.003;
    mars.rotation.y += 0.002;
    jupiter.rotation.y += 0.005;

    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.0003;
    stars.rotation.z += 0.0003;

    // Render 
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
