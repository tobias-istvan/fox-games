import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Events } from './Events';
import {
  DIRECTIONS,
  DIRECTION_BACKWARD,
  DIRECTION_FORWARD,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  KEYS
} from '../utils/keys';

export type CharacterOptions = {
  name: string;
  model: string;
  defaultAnimationName: string;
};
export class Player {
  emit: ((eventName: string, data?: CustomEventInit) => void) | undefined;
  on: ((eventName: string, callback: (event: CustomEvent) => void) => void) | undefined;
  events = new Events(this);
  fadeDuration = 0.2;

  private keyState = new Map(KEYS.map((key) => [key, false]));
  private position = new THREE.Vector3(0, 0, 0);

  private _hunger = 0;
  private _thirst = 0;
  private _tiredness = 0;
  private _matingUrge = 0;
  private runVelocity = 7;
  private walkVelocity = 2.1;
  private turnVelocity = 0.005;

  private loader: GLTFLoader = new GLTFLoader();
  private mixer: THREE.AnimationMixer | undefined;
  protected _scene: THREE.Group | undefined;
  protected _loaded = false;

  private model: string;
  readonly name: string;

  public error: ErrorEvent | undefined;

  public character: GLTF | undefined;
  private _animations: Map<string, THREE.AnimationAction> = new Map();
  private animationName: string | undefined;
  private defaultAnimationName: string;

  constructor({ name, model, defaultAnimationName: defaultClipName }: CharacterOptions) {
    this.name = name;
    this.model = model;
    this.defaultAnimationName = defaultClipName;

    this.loader = new GLTFLoader();

    this.loadModel(model);
  }

  get scene() {
    return this._scene;
  }
  get loaded() {
    return this._loaded;
  }

  loadModel(modelPath: string) {
    if (modelPath) {
      this.model = modelPath;
    }
    this.loader.load(
      this.model,
      (gltf) => {
        try {
          this.character = gltf;
          this._scene = gltf.scene;
          this._scene.traverse((object: object) => {
            if ('isMesh' in object && object.isMesh && 'castShadow' in object) {
              object.castShadow = true;
            }
          });
          this._animations = new Map();
          this.mixer = new THREE.AnimationMixer(this._scene);
          this.character.animations.forEach((a: THREE.AnimationClip) => {
            if (!this.mixer) {
              return;
            }
            this._animations.set(a.name, this.mixer.clipAction(a));
          });
          this._scene.rotateY(Math.PI);
          this._loaded = true;
          this.emit?.('loaded', {
            detail: {
              model: gltf
            }
          });
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

  switchToClip(name: string) {
    if (!this.character || !this.mixer) {
      return;
    }
    const animation = THREE.AnimationClip.findByName(this.character?.animations, name);
    if (!animation) {
      throw new Error(`No clip found with name ${name}`);
    }
    this.mixer.clipAction(animation).play();
  }

  update(delta: number, keyState: Map<string, boolean>) {
    if (!this.character || !this.mixer) {
      return;
    }

    const direction = DIRECTIONS.find((d) => {
      return keyState.get(d.toLowerCase());
    });

    const nextAnimationName = direction
      ? keyState.get('shift')
        ? 'Gallop'
        : 'Walk'
      : this.defaultAnimationName;

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

    if (direction) {
      this.character.scene.position.z +=
        (keyState.get('shift') ? this.runVelocity : this.walkVelocity) *
        delta *
        (direction === DIRECTION_FORWARD ? -1 : 1);
      if (direction === DIRECTION_BACKWARD && this.character.scene.rotation.y !== Math.PI) {
        this.character.scene.rotation.y = Math.PI;
      }
      if (direction === DIRECTION_FORWARD && this.character.scene.rotation.y === Math.PI) {
        this.character.scene.rotation.y = 0;
      }
      // if (direction === DIRECTION_LEFT) {
      //   this.character.scene.rotation.y += this.turnVelocity;
      // }
      // if (direction === DIRECTION_RIGHT) {
      //   this.character.scene.rotation.y -= this.turnVelocity;
      // }
    }

    this.mixer.update(delta);
  }
}
