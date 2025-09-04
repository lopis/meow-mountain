import { controls } from './controls';
import { emit, on } from './event';

export interface DialogState {
  dialogs: string[];
  isDone?: boolean;
}

export interface Script {
  [stateKey: string]: DialogState;
}

export const enum StoryEngineEvent {
  // Story events
  STORY_STATE_ENTER = 1,
  STORY_STATE_EXIT = 2,
  STORY_DIALOG = 3,
};

export class Story<T extends Script> {
  private currentStateKey: keyof T | null = null;
  private currentDialogIndex = 0;
  public isActive = false;
  private previousSpacePressed = false;
  public currentState: keyof T | null = null;
  
  fullText = '';
  visibleCharacters = 0;
  textAnimationTimer = 0;
  charactersPerSecond = 20;
  textAnimationState = 2; // 0=typing, 1=complete, 2=waiting

  constructor(private readonly script: T) {
    on(StoryEngineEvent.STORY_STATE_ENTER, (stateKey: keyof T) => {
      this.enterState(stateKey);
    });
  }

  public enterState(stateKey: keyof T) {
    if (!this.script[stateKey]) {
      return;
    }

    this.currentStateKey = stateKey;
    this.currentState = stateKey;
    this.currentDialogIndex = 0;
    this.isActive = true;
    this.previousSpacePressed = false;
  }

  update(timeElapsed: number) {
    if (!this.isActive || !this.currentStateKey) {
      return;
    }

    const spacePressed = controls.keyMap.get('Space');
    const spaceJustPressed = spacePressed && !this.previousSpacePressed;
    this.previousSpacePressed = spacePressed || false;

    // Update typewriter animation
    if (this.textAnimationState === 0) { // typing
      this.textAnimationTimer += timeElapsed;
      const targetCharacters = Math.floor((this.textAnimationTimer / 1000) * this.charactersPerSecond);
      
      if (targetCharacters >= this.fullText.length) {
        // Animation complete
        this.visibleCharacters = this.fullText.length;
        this.textAnimationState = 1; // complete
        this.emitCurrentVisibleText();
      } else if (targetCharacters > this.visibleCharacters) {
        // Show more characters
        this.visibleCharacters = targetCharacters;
        this.emitCurrentVisibleText();
      }
    }

    if (spaceJustPressed) {
      this.handleSpacePress();
    }
  }

  private handleSpacePress() {
    if (!this.currentStateKey) {
      return;
    }

    if (this.textAnimationState === 0) { // typing
      // Skip typing animation - show full text immediately
      this.visibleCharacters = this.fullText.length;
      this.textAnimationState = 1; // complete
      this.emitCurrentVisibleText();
      return;
    }

    if (this.textAnimationState === 1) { // complete
      // Move to next dialog or exit
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
  }

  private emitCurrentVisibleText() {
    const visibleText = this.fullText.substring(0, this.visibleCharacters);
    emit(StoryEngineEvent.STORY_DIALOG, visibleText);
  }

  private showCurrentDialog() {
    if (!this.currentStateKey) {
      return;
    }

    const currentState = this.script[this.currentStateKey];
    currentState.isDone = true;
    this.fullText = currentState.dialogs[this.currentDialogIndex];
    
    // Reset typewriter animation
    this.visibleCharacters = 0;
    this.textAnimationTimer = 0;
    this.textAnimationState = 0; // typing
    
    // Start with empty text
    this.emitCurrentVisibleText();
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
    
    emit(StoryEngineEvent.STORY_STATE_EXIT, stateKey);
  }
}
