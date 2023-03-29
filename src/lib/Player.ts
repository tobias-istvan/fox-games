import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Events } from './Events';
import { DIRECTION_FORWARD, DIRECTION_LEFT, DIRECTION_RIGHT, SHIFT } from '../utils/keys';
import { AnimationClip, AnimationMixer, EventDispatcher, Vector3 } from 'three';
import { KeyboardController } from './KeyboardController';

export type PlayerOptions = {
  name: string;
  modelPath: string;
  defaultAnimationName: string;
  camera: THREE.Camera;
};
export class Player extends EventDispatcher {
  events = new Events(this);
  fadeDuration = 0.2;

  private keyboardController: KeyboardController;

  protected _hunger = 0;
  protected _thirst = 0;
  protected _tiredness = 0;
  protected _matingUrge = 0;
  protected velocityMultiplier = 5;
  protected velocity = 0.03;
  protected turnVelocity = 0.005;
  protected walkAnimationName = 'Walk';
  protected runAnimationName = 'Run';

  protected loader: GLTFLoader = new GLTFLoader();
  protected mixer: THREE.AnimationMixer | undefined;
  protected _scene: THREE.Group | undefined;
  protected _loaded = false;

  readonly name: string;
  protected modelPath: string;
  protected camera: THREE.Camera;

  public error: ErrorEvent | undefined;

  public model: GLTF | undefined;
  protected _animations: Map<string, THREE.AnimationAction> = new Map();
  protected animationName: string | undefined;
  protected defaultAnimationName: string;

  constructor({
    name,
    modelPath: model,
    defaultAnimationName: defaultClipName,
    camera
  }: PlayerOptions) {
    super();
    this.name = name;
    this.modelPath = model;
    this.camera = camera;
    this.defaultAnimationName = defaultClipName;

    this.keyboardController = new KeyboardController(DIRECTION_FORWARD);

    this._animations = new Map();

    this.loader = new GLTFLoader();

    this.loadModel(model);
  }

  get loaded() {
    return this._loaded;
  }
  get isMoving() {
    return [...DIRECTION_FORWARD, ...DIRECTION_LEFT, ...DIRECTION_RIGHT].some((key) =>
      this.keyboardController.isPressed(key)
    );
  }
  get scene() {
    return this._scene;
  }

  loadModel(modelPath: string) {
    if (modelPath) {
      this.modelPath = modelPath;
    }
    this.loader.load(
      this.modelPath,
      (gltf) => {
        try {
          this.model = gltf;
          this.mixer = new AnimationMixer(gltf.scene);
          this.registerAnimations(gltf.animations);
          this.setCamera(this.setScene(gltf.scene));
          this._loaded = true;
          this.dispatchEvent(
            new CustomEvent('loaded', {
              detail: {
                model: gltf
              }
            })
          );
        } catch (error) {
          console.error(error);
        }
      },
      undefined,
      (error) => {
        console.error(error);
        this.error = error;
      }
    );
  }

  registerAnimations(animations: THREE.AnimationClip[]) {
    animations.forEach((a: THREE.AnimationClip) => {
      if (!this.mixer) {
        return;
      }
      console.info(a.name);
      this._animations.set(a.name, this.mixer.clipAction(a));
    });
  }

  setScene(scene: THREE.Group) {
    scene.traverse((object: object) => {
      if ('isMesh' in object && object.isMesh && 'castShadow' in object) {
        object.castShadow = true;
      }
    });
    this._scene = scene;
    return this._scene;
  }

  setCamera(scene: THREE.Group) {
    this.camera.rotateY(Math.PI);
    this.camera.position.set(0, 6.5, -7);
    scene.add(this.camera);
    this.camera.lookAt(scene.position.clone().add(new Vector3(0, 6, -5)));
  }

  switchToClip(name: string) {
    if (!this.model || !this.mixer) {
      return;
    }
    const animation = AnimationClip.findByName(this.model.animations, name);
    if (!animation) {
      throw new Error(`No clip found with name ${name}`);
    }
    this.mixer.clipAction(animation).play();
  }

  update(delta: number) {
    if (!this.modelPath || !this.mixer || !this.scene) {
      return;
    }

    const isRunning = this.keyboardController.isPressed(SHIFT);
    const isMovingForward = this.keyboardController.isPressed(...DIRECTION_FORWARD);
    const isTurningLeft = this.keyboardController.isPressed(...DIRECTION_LEFT);
    const isTurningRight = this.keyboardController.isPressed(...DIRECTION_RIGHT);
    // const isJumping = this.keyboardController.isPressed(SPACE);
    const nextAnimationName = !this.isMoving
      ? this.defaultAnimationName
      : isRunning
      ? this.runAnimationName
      : this.walkAnimationName;

    if (this.animationName !== nextAnimationName) {
      const toPlay = this._animations.get(nextAnimationName);
      if (toPlay) {
        const current = this.animationName && this._animations.get(this.animationName);
        if (current) {
          current.fadeOut(this.fadeDuration);
          toPlay.reset().fadeIn(this.fadeDuration).play();
        } else {
          toPlay.reset().play();
        }
        this.animationName = nextAnimationName;
      }
    }

    if (this.isMoving) {
      const velocityModifier = isRunning ? this.velocityMultiplier : 1;
      const velocity = this.velocity * velocityModifier;
      if (isTurningLeft) {
        this.scene.rotation.y += this.turnVelocity * velocityModifier;
      }
      if (isTurningRight) {
        this.scene.rotation.y -= this.turnVelocity * velocityModifier;
      }
      if (isMovingForward) {
        this.scene.position.x += Math.sin(this.scene.rotation.y) * velocity;
        this.scene.position.z += Math.cos(this.scene.rotation.y) * velocity;
      }
    }

    this.mixer.update(delta);
  }
}
