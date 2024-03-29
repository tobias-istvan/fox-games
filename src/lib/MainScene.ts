import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { Fox } from './Fox';
import type { Player } from './Player';
import { Soldier } from './Soldier';

const maxZoomOut = 1000;

type MainSceneOptions = {
  root: HTMLCanvasElement;
  width: number;
  height: number;
};

export class MainScene {
  // Scene
  protected scene = new Scene();
  protected camera: PerspectiveCamera;

  protected clock: Clock = new Clock();
  protected renderer!: WebGLRenderer;

  protected character: Player;

  constructor({ root, width, height }: MainSceneOptions) {
    this.initRenderer(root);
    this.initScene();

    this.camera = this.initCamera();

    this.initLights();
    this.initTerrain();
    this.initEnvironment();

    this.resize(width, height);

    this.initEventListeners();

    this.addFloor();

    this.character = new Fox({ camera: this.camera });
    // this.character = new Soldier({ camera: this.camera });
    this.initCharacter();

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
  }
  initCamera() {
    const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, maxZoomOut);
    return camera;
  }

  initLights() {
    const hemisphereLight = new HemisphereLight(0xffffff, 0xffffff);
    hemisphereLight.position.set(1, 1, 1);
    this.scene.add(hemisphereLight);
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
      await this.loadIsland();
    } catch (error) {
      console.error(error);
    }
  }

  initEnvironment() {
    this.scene.add(new GridHelper(50, 50));
  }

  private onWindowResize() {
    this.resize(window.innerWidth, window.innerHeight);
  }
  initEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  animate() {
    const delta = this.clock.getDelta();
    requestAnimationFrame(() => this.animate());
    this.character.update(delta);
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

  private initCharacter() {
    if (!this.character.loaded || !this.character.scene) {
      this.character.addEventListener('loaded', () => {
        this.initCharacter();
      });
    }
    if (this.character.scene) {
      this.scene.add(this.character.scene);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
