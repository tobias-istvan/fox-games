export class CharacterStateMachine {
  currentState: State | null;
  states: Record<string, State>;
  constructor() {
    this.currentState = null;
    this.states = {};
  }

  addState(name: string, state: State) {
    this.states[name] = state;
  }

  setState(name: string) {
    const prevState = this.currentState;
    if (prevState && prevState.name === name) {
      return;
    }
    const state = this.states[name];
    if (!state) {
      throw new Error(`State '${name}' does not exist`);
    }
    if (prevState) {
      prevState.exit();
    }
    this.currentState = state;
    state.enter(prevState ?? undefined);
  }

  update(deltaTime: number) {
    if (this.currentState) {
      this.currentState.update(deltaTime);
    }
  }
}

class State {
  constructor(public name: string) {}
  enter(prevState?: State) {}
  update(delta: number) {}
  exit() {}
}
