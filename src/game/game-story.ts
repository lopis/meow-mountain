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
      "zzzz.... ??",
      "Have I overslept?",
    ],
    goal: 'reactivate the magical barrier',
  },
  [Scene.spirit]: {
    dialogs: [
      "Evil spirits?\nHas the barrier come down?",
      "this one looks pretty weak."
    ],
  },
  [Scene.barrier]: {
    dialogs: [
      "I don't have enough magic left",
      "Something must wrong with the cat altar",
    ],
    goal: 'fix the cat altar',
  },
  [Scene.temple]: {
    dialogs: [
      "My magic increased a litle",
      "but the other altars must be damaged too"
    ],
    goals: [
      'fix all 5 temples',
      'restore forst magic barrier',
    ]
  }
};

export class GameStory {
  story: Story<typeof script>;

  constructor() {
    this.story = new Story(script);
    on('story-state-exit', (label) => {
      emit('cutscene-end');
      if (label === Scene.intro) {
        emit('wake-up');
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
