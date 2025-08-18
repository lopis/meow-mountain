import { Level } from "../level.state";

export class Level1 extends Level {
  constructor() {
    super(1, 100, 100);
  }

  onUpdate (timeElapsed: number) {
    
  };

  onEnter?: Function | undefined;
  
  onLeave?: Function | undefined;
}
