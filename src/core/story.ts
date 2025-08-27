import { controls } from './controls';
import { emit, on } from './event';

interface DialogState {
  dialogs: string[];
}

interface Script {
  [stateKey: string]: DialogState;
}

type StoryEventName = 'story-state-enter' | 'story-dialog' | 'story-state-exit';

export class Story {
  private currentStateKey: string | null = null;
  private currentDialogIndex = 0;
  public isActive = false;
  private previousSpacePressed = false;
  public currentState: string | null = null;

  constructor(private readonly script: Script) {
    
    // Listen for story-state-enter events
    on('story-state-enter', (stateKey: string) => {
      this.enterState(stateKey);
    });
  }

  private enterState(stateKey: string) {
    if (!this.script[stateKey]) {
      return;
    }

    this.currentStateKey = stateKey;
    this.currentState = stateKey;
    this.currentDialogIndex = 0;
    this.isActive = true;
    this.previousSpacePressed = false;
    
    this.showCurrentDialog();
  }

  update() {
    if (!this.isActive || !this.currentStateKey) {
      return;
    }

    const spacePressed = controls.keyMap.get('Space');
    const spaceJustPressed = spacePressed && !this.previousSpacePressed;
    this.previousSpacePressed = spacePressed || false;

    if (spaceJustPressed) {
      this.handleSpacePress();
    }
  }

  private handleSpacePress() {
    if (!this.currentStateKey) {
      return;
    }

    const currentState = this.script[this.currentStateKey];
    
    if (this.currentDialogIndex < currentState.dialogs.length - 1) {
      // Move to next dialog
      this.currentDialogIndex++;
      this.showCurrentDialog();
    } else {
      // All dialogs complete, exit state
      this.exitCurrentState();
    }
  }

  private showCurrentDialog() {
    if (!this.currentStateKey) {
      return;
    }

    const currentState = this.script[this.currentStateKey];
    const dialogText = currentState.dialogs[this.currentDialogIndex];
    
    emit('story-dialog' satisfies StoryEventName, dialogText);
  }

  private exitCurrentState() {
    if (!this.currentStateKey) {
      return;
    }

    const stateKey = this.currentStateKey;
    this.isActive = false;
    this.currentStateKey = null;
    this.currentState = null;
    this.currentDialogIndex = 0;
    
    emit('story-state-exit' satisfies StoryEventName, stateKey);
  }
}