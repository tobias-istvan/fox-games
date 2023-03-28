import type { Player } from './Player';
import { ALT, CTRL, KEYS, SHIFT } from '../utils/keys';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Vector3
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const maxZoomOut = 1000;

const KeyState = new Map(KEYS.map((key) => [key, false]));

type Animatable = {
  update: (delta: number, keyState?: typeof KeyState) => void;
};

type MainSceneOptions = {
  root: HTMLCanvasElement;
  width: number;
  height: number;
};

export class MainScene {
  // Scene
  protected scene = new Scene();

  private clock: Clock = new Clock();
  protected renderer!: WebGLRenderer;
  protected camera!: PerspectiveCamera;
  protected orbitControls!: OrbitControls;

  private keyState = new Map(KEYS.map((key) => [key, false]));
  private _characters: Animatable[] = [];

  constructor({ root, width, height }: MainSceneOptions) {
    this.initRenderer(root);
    this.initScene();
    this.initCamera();
    this.initOrbitControls();
    this.initLights();
    this.initTerrain();
    this.initEnvironment();

    this.resize(width, height);

    this.initScreenEventListeners();

    this.addFloor();
    this.animate();
  }

  initRenderer(root: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ antialias: true, canvas: root });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  initScene() {
    this.scene.background = new Color(0xffffff);
    // this.scene.rotateY(Math.PI / -1);
  }
  initCamera() {
    this.camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, maxZoomOut);
    this.camera.position.z = 0;
    this.camera.position.y = 20;
    this.camera.position.x = 100;
  }
  initOrbitControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.04;
    this.orbitControls.minDistance = 1;
    this.orbitControls.maxDistance = maxZoomOut;
    this.orbitControls.enableRotate = true;
    this.orbitControls.enableZoom = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2.5;
    this.orbitControls.update();
  }

  initLights() {
    // const directionalLight = new DirectionalLight(0x9090aa);
    const hemisphereLight = new HemisphereLight(0xffffff, 0xffffff);
    // const ambientLight = new AmbientLight(0xffffff);
    // directionalLight.position.set(-10, 10, -10).normalize();
    // this.scene.add(directionalLight);
    hemisphereLight.position.set(1, 1, 1);
    this.scene.add(hemisphereLight);
    // this.scene.add(ambientLight);
    const ambient = new AmbientLight(0xa0a0fc, 0.82);
    this.scene.add(ambient);

    const sunLight = new DirectionalLight(0xe8c37b, 1);
    sunLight.position.set(-69, 44, 14);
    this.scene.add(sunLight);
  }

  private loadIsland(): Promise<Scene> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        'assets/models/Island.glb',
        (gltf) => {
          console.info(gltf);
          const terrain = gltf.scene;
          const scale = 1.5;
          terrain.scale.set(scale, scale, scale);
          terrain.position.y = -3.5 * scale;
          // terrain.rotateY(Math.PI / 2);

          loader.load('assets/models/Swordfish.glb', (gltf) => {
            const fishScene = gltf.scene;
            fishScene.position.y = -1;
            fishScene.position.z = 50;
            terrain.add(fishScene);
          });

          this.scene.add(terrain);
          resolve(this.scene);
        },
        undefined,
        (error) => {
          console.log('An error happened', error);
          reject(error);
        }
      );
    });
  }

  async loadForest(): Promise<Scene> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        'assets/models/Trees.glb',
        (gltf) => {
          console.info(gltf);
          const terrain = gltf.scene;
          const scale = 0.1;
          terrain.scale.set(scale, scale, scale);
          terrain.position.y = -3.5 * scale;
          this.scene.add(terrain);
          resolve(this.scene);
        },
        undefined,
        (error) => {
          console.log('An error happened', error);
          reject(error);
        }
      );
    });
  }

  async initTerrain() {
    try {
      // await this.loadIsland();
    } catch (error) {
      console.error(error);
    }
  }

  initEnvironment() {
    this.scene.add(new GridHelper(50, 50));
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
    // const character = this._characters[0];
    // if (character?.scene?.position) {
    //   this.camera.position.copy(character.scene?.position);
    //   this.camera.position.add(new Vector3(0, 10, 20));
    // }
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
    // const floorGeometry = new PlaneGeometry(5000, 5000, 1, 1);
    // const floorMaterial = new MeshPhongMaterial({
    //   color: 0xdadada,
    //   shininess: 0
    // });
    // const floor = new Mesh(floorGeometry, floorMaterial);
    // floor.rotation.x = -0.5 * Math.PI;
    // floor.receiveShadow = true;
    // floor.position.y = 10;
    // this.scene.add(floor);
    // this.render();
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

  addCharacter(character: Player, position?: Vector3) {
    if (!character.loaded) {
      return character.on?.('loaded', () => {
        this.addCharacter(character);
      });
    }
    if (character.scene) {
      const { x = 0, y = 0, z = 30 } = position || {};
      if (position) {
        character.scene.position.set(x, y, z);
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
