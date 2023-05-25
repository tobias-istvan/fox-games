import {
  AmbientLight,
  AxesHelper,
  Camera,
  Clock,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class GameScene {
  protected clock: Clock;
  public scene: Scene;
  protected renderer: WebGLRenderer;
  protected camera: PerspectiveCamera;
  protected controls: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    this.clock = new Clock();
    this.scene = new Scene();
    this.renderer = this.initRenderer(canvas);
    this.camera = this.initCamera(true);
    this.controls = this.initControls(this.camera, this.renderer.domElement);
    this.scene.add(this.camera);

    this.initLights(this.scene);
    this.initHelpers(this.scene);

    this.tick();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  initRenderer(canvas: HTMLCanvasElement) {
    const renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    return renderer;
  }
  initCamera(addControls?: boolean) {
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new PerspectiveCamera(
      // field of view
      100,
      // aspect ratio
      aspect,
      // near plane: it's low since we want our mesh to be visible even from very close
      0.01,
      // far plane: how far we're rendering
      60
    );

    // Position the camera a bit higher on the y axis and a bit further back from the center
    camera.position.x = 0;
    camera.position.y = 4;
    camera.position.z = 2;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    if (addControls) {
      const controls = new OrbitControls(camera, this.renderer.domElement);
      controls.enableDamping = true;
    }

    return camera;
  }
  initControls(camera: Camera, domElement?: HTMLElement) {
    const controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.maxDistance = 20;
    controls.minDistance = 1;
    return controls;
  }
  initLights(scene: Scene) {
    const hemisphereLight = new HemisphereLight(0xffffff, 0xffffff);
    hemisphereLight.position.set(0, 0, 0);
    scene.add(hemisphereLight);
    const ambient = new AmbientLight(0xa0a0fc, 1);
    scene.add(ambient);
    const sunLight = new DirectionalLight(0xe8c37b, 1);
    sunLight.position.set(-1, 2, 1);
    scene.add(sunLight);
  }
  initHelpers(scene: Scene) {
    scene.add(new GridHelper(50, 50));
    scene.add(new AxesHelper(10));
  }

  tick() {
    requestAnimationFrame(() => this.tick());
    this.render();
  }
  resize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render();
  }
}
