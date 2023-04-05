import { ALT, CTRL, SHIFT, SPACE } from '../utils/keys';

export class KeyboardController {
  readonly keyState = new Map();
  constructor(private keys: string[]) {
    this.keyState = new Map(keys.map((key) => [key, false]));
    this.initEventHandlers();
  }
  initEventHandlers() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    // document.addEventListener('mousemove', this.onMouseMove.bind(this));
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
  isPressed(...args: string[]) {
    return args.some((key) => this.keyState.get(key));
  }
}
