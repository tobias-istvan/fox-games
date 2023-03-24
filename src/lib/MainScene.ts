import * as THREE from 'three';
import type { Character } from './Character';
import { ALT, CTRL, KEYS, SHIFT } from '../utils/keys';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type MainSceneOptions = {
	root: HTMLCanvasElement;
	width: number;
	height: number;
};

export class MainScene {
	// Scene
	protected scene = new THREE.Scene();

	private clock: THREE.Clock = new THREE.Clock();
	protected renderer!: THREE.WebGLRenderer;
	protected camera!: THREE.PerspectiveCamera;
	protected orbitControls!: OrbitControls;

	private keyState = new Map(KEYS.map((key) => [key, false]));
	private _characters: Character[] = [];

	constructor({ root, width, height }: MainSceneOptions) {
		this.initRenderer(root);
		this.initScene();
		this.initCamera();
		this.initOrbitControls();
		this.initLights();
		this.initEnvironment();

		this.resize(width, height);

		this.initScreenEventListeners();

		this.addFloor();
		this.animate();
	}

	initRenderer(root: HTMLCanvasElement) {
		this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: root });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
	}

	initScene() {
		this.scene.background = new THREE.Color(0xffffff);
	}
	initCamera() {
		this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100);
		this.camera.position.z = -200;
		this.camera.position.y = 90;
		this.camera.position.x = -50;
	}
	initOrbitControls() {
		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbitControls.enableDamping = true;
		this.orbitControls.dampingFactor = 0.04;
		this.orbitControls.minDistance = 15;
		this.orbitControls.maxDistance = 40;
		this.orbitControls.enableRotate = true;
		this.orbitControls.enableZoom = true;
		this.orbitControls.maxPolarAngle = Math.PI / 2.5;
		this.orbitControls.update();
	}

	initLights() {
		// const directionalLight = new THREE.DirectionalLight(0x9090aa);
		const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
		// const ambientLight = new THREE.AmbientLight(0xffffff);
		// directionalLight.position.set(-10, 10, -10).normalize();
		// this.scene.add(directionalLight);
		hemisphereLight.position.set(1, 1, 1);
		this.scene.add(hemisphereLight);
		// this.scene.add(ambientLight);
		const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82);
		this.scene.add(ambient);

		const sunLight = new THREE.DirectionalLight(0xe8c37b, 1);
		sunLight.position.set(-69, 44, 14);
		this.scene.add(sunLight);
	}

	initEnvironment() {
		this.scene.add(new THREE.GridHelper(50, 50));
	}

	setCameraPosition(x: number, y: number, z: number) {
		this.camera.position.x = x;
		this.camera.position.y = y;
		this.camera.position.z = z;
	}

	private onWindowResize() {
		this.resize(window.innerWidth, window.innerHeight);
	}
	initScreenEventListeners() {
		window.addEventListener('resize', this.onWindowResize.bind(this));
		document.addEventListener('keydown', this.onKeyDown.bind(this));
		document.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	animate() {
		requestAnimationFrame(() => this.animate());
		this._characters.forEach((character) => {
			character.update(this.clock.getDelta(), this.keyState);
		});
		this.render();
	}

	resize(width: number, height: number) {
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.render();
	}

	addFloor() {
		const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
		const floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xdadada,
			shininess: 0
		});

		const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -0.5 * Math.PI;
		floor.receiveShadow = true;
		floor.position.y = -11;
		this.scene.add(floor);
		this.render();
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	private setKeyStateFromKeyboardEvent(event: KeyboardEvent, state: 'up' | 'down') {
		const { key, shiftKey, ctrlKey, altKey } = event;
		this.keyState.set(key.toLowerCase(), state === 'down');
		this.keyState.set(SHIFT, shiftKey);
		this.keyState.set(ALT, altKey);
		this.keyState.set(CTRL, ctrlKey);
	}
	onKeyDown(event: KeyboardEvent) {
		this.setKeyStateFromKeyboardEvent(event, 'down');
	}
	onKeyUp(event: KeyboardEvent) {
		this.setKeyStateFromKeyboardEvent(event, 'up');
	}

	addCharacter(character: Character, position?: THREE.Vector3) {
		if (!character.loaded) {
			return character.on?.('loaded', () => {
				this.addCharacter(character);
			});
		}
		if (character.scene) {
			if (position) {
				character.scene.position.set(position.x, position.y, position.z);
			}
			this.scene.add(character.scene);
			this._characters.push(character);
			this.animate();
		}
	}
	get characters() {
		return this._characters;
	}
}
