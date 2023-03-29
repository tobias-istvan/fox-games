import { Player, type PlayerOptions } from './Player';

export class Fox extends Player {
  constructor(options: Omit<PlayerOptions, 'name' | 'modelPath' | 'defaultAnimationName'>) {
    super({
      name: 'Fox',
      defaultAnimationName: 'Idle',
      modelPath: 'assets/models/Fox.glb',
      ...options
    });
    this.runAnimationName = 'Gallop';
  }
}
