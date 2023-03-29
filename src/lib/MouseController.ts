import { Vector2 } from 'three';

export class MouseController {
  readonly position: Vector2 = new Vector2(0, 0);
  constructor() {
    this.setEventHandlers();
  }
  setEventHandlers() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  onMouseMove(event: MouseEvent) {
    const { clientX: x, clientY: y } = event;
    this.position.set(x, y);
  }
}
