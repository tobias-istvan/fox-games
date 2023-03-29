import { Player, type PlayerOptions } from './Player';

export class Soldier extends Player {
  constructor(options: Omit<PlayerOptions, 'name' | 'modelPath' | 'defaultAnimationName'>) {
    super({
      name: 'Soldier',
      defaultAnimationName: 'Idle',
      modelPath: 'assets/models/character.glb',
      ...options
    });
    this.velocity = 0.01;
    this.velocityMultiplier = 2;
    this.walkAnimationName = 'CharacterArmature|Walk';
    this.runAnimationName = 'CharacterArmature|Run';
  }
}
