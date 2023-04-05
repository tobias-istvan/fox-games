import { EventDispatcher } from 'three';
import { ALT, CTRL, SHIFT, SPACE } from '../utils/keys';

type Key = string;
export type MetaState = {
  state: string;
  keys: Key[];
};

export class KeyboardStateMachine extends EventDispatcher {
  readonly keyState = new Map<string, boolean>();
  readonly keyCombinationToState = new Map<string, Key[]>();
  constructor(public keys: string[] = [], keyCombinations?: MetaState[]) {
    super();
    keyCombinations?.forEach((combination) => {
      this.keyCombinationToState.set(combination.state, combination.keys);
    });
    this.initEventHandlers();
  }
  initEventHandlers() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }
  private setKeyStateFromKeyboardEvent(event: KeyboardEvent, state: 'up' | 'down') {
    const { key, shiftKey, ctrlKey, altKey } = event;
    this.keyState.set(key.toLowerCase(), state === 'down');
    if (key === ' ') {
      this.keyState.set(SPACE, state === 'down');
    }
    this.keyState.set(SHIFT, shiftKey);
    this.keyState.set(ALT, altKey);
    this.keyState.set(CTRL, ctrlKey);
    this.dispatchEvent(new CustomEvent(state, { detail: { key } }));
    this.dispatchEvent(
      new CustomEvent(`${key.toLowerCase()} ${state}`, {
        detail: { key, shiftKey, altKey, ctrlKey }
      })
    );
    if (this.keys.includes(key)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onKeyDown(event: KeyboardEvent) {
    this.setKeyStateFromKeyboardEvent(event, 'down');
  }
  onKeyUp(event: KeyboardEvent) {
    this.setKeyStateFromKeyboardEvent(event, 'up');
  }
  isPressed(key: string) {
    return this.keyState.get(key);
  }
  isMetaOn(metaState: string) {
    return this.keyCombinationToState.get(metaState)?.every((key) => this.keyState.get(key));
  }
  isOn(...args: string[]) {
    return args.every((key) => this.keyState.get(key)) || args.every((meta) => this.isMetaOn(meta));
  }
}
