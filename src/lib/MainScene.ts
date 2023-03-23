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
	protected renderer = new THREE.WebGLRenderer();
	protected camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	protected directionalLight = new THREE.DirectionalLight(0x9090aa);
	protected hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
	protected ambientLight = new THREE.AmbientLight(0xffffff);
	protected orbitControls: OrbitControls;

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
		this.camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.camera.position.z = 100;
		this.camera.position.y = 50;
		this.camera.position.x = -50;
	}
	initOrbitControls() {
		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbitControls.enableDamping = true;
		this.orbitControls.minDistance = 5;
		this.orbitControls.maxDistance = 15;
		this.orbitControls.enablePan = false;
		this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
		this.orbitControls.update();
	}

	initLights() {
		this.directionalLight.position.set(-10, 10, -10).normalize();
		this.scene.add(this.directionalLight);
		this.hemisphereLight.position.set(1, 1, 1);
		this.scene.add(this.hemisphereLight);
		this.scene.add(this.ambientLight);
	}

	initEnvironment() {
		// const geometry = new THREE.BoxGeometry(1, 1, 1);
		// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		// const cube = new THREE.Mesh(geometry, material);
		// this.scene.add(cube);
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

	addCharacter(
		character: Character,
		position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
	) {
		if (!character.loaded) {
			return character.on?.('loaded', () => {
				this.addCharacter(character);
			});
		}
		if (character.scene) {
			character.scene.position.set(position.x, position.y, position.z);
			this.scene.add(character.scene);
			this._characters.push(character);
			this.animate();
		}
	}
	get characters() {
		return this._characters;
	}
}
