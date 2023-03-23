import * as THREE from 'three';

// SCENE
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
export const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;
