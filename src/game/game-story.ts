import { drawEngine } from "@/core/draw-engine";
import { emit, on } from "@/core/event";
import { DialogState, Story } from "@/core/story-engine";
import { addTimeEvent } from "@/core/timer";

interface SceneProps extends DialogState {
  goal?: string,
  goals?: string[],
};

enum Scene {
  intro = 1,
  spirit,
  barrier,
  temple,
}

const script: Record<Scene, SceneProps> = {
  [Scene.intro]: {
    dialogs: [
      "Zzz...",
      "...Huh?",
      "How long was i sleeping?...",
    ],
  },
  [Scene.spirit]: {
    dialogs: [
      "Evil spirits? Has the magic barrier failed?",
      "This one seems weak.",
      "I'll exorcise it and go check the barrier",
      "> Press (1) to attack",
    ],
    goal: 'find magic barrier obelisk',
  },
  [Scene.barrier]: {
    dialogs: [
      "I don't have enough magic left.",
      "Something must be wrong with the cat altar.",
    ],
    goal: 'repair the cat altar',
  },
  [Scene.temple]: {
    dialogs: [
      "My magic has increased a little.",
      "But the other altars must be damaged too.",
    ],
    goals: [
      'repair all 5 temples',
      'restore the forest magic barrier',
    ],
  },
};

export class GameStory {
  story: Story<typeof script>;

  constructor() {
    this.story = new Story(script);
    on('story-state-exit', (label) => {
      emit('cutscene-end');
      if (label === Scene.intro) {
        emit('wake-up');
        drawEngine.cameraLerpSpeed = 0.08;
        addTimeEvent(() => {
          emit('story-state-enter', Scene.spirit);
        }, 6000);
      }
      if(label === Scene.spirit) {
        emit('enable-scratch');
      }
    });

    on('story-state-enter', () => {
      emit('cutscene-start');
    });

    this.story.enterState(Scene.intro);
  }

  update (timeElapsed: number) {
    this.story.update();
  }
}
