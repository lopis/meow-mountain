import { drawEngine } from "@/core/draw-engine";
import { emit, on } from "@/core/event";
import { DialogState, Story } from "@/core/story-engine";
import { addTimeEvent } from "@/core/timer";

export interface SceneProps extends DialogState {
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
      "Zzzzz...",
      "Yawwwn...",
      "How long was i sleeping?...",
    ],
  },
  [Scene.spirit]: {
    dialogs: [
      "Evil spirits?",
      "Has the magic barrier failed\nwhile I slept??",
      "This one seems weak.",
      "I'll exorcise it and then\ngo check the barrier",
      "> Press (1) to attack",
    ],
    goals: ['find magic barrier obelisk'],
  },
  [Scene.barrier]: {
    dialogs: [
      "I don't have enough magic left.",
      "Something must be wrong with the cat altar.",
    ],
    goals: ['repair the cat altar'],
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

    on('story-state-exit', (label: Scene) => {
      emit('cutscene-end', script[label]);
      if (label === Scene.intro) {
        emit('wake-up');
        emit('spawn-first-spirit');
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
