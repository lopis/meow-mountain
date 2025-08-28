import { emit, on } from "@/core/event";
import { Story } from "@/core/story-engine";
import { addTimeEvent } from "@/core/timer";

const script = {
  intro: {
    dialogs: [
      "zzzz.... ??",
      "Have I overslept?",
    ],
    goal: 'reactivate the magical barrier',
  },
  spirit: {
    dialogs: [
      "Evil spirits?\nHas the barrier come down?",
      "this one looks pretty weak."
    ],
  },
  barrier: {
    dialogs: [
      "I don't have enough magic left",
      "Something must wrong with the cat altar",
    ],
    goal: 'fix the cat altar',
  },
  temple: {
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
  story: Story;

  constructor() {
    this.story = new Story(script);
    this.story.enterState('intro');

    on('story-state-exit', (label) => {
      emit('cutscene-end');
      if (label === 'intro') {
        emit('wake-up');
        addTimeEvent(() => {
          emit('story-state-enter', 'spirit');
        }, 6000);
      }
      if(label === 'spirit') {
        emit('enable-scratch');
      }
    });

    on('story-state-enter', () => {
      emit('cutscene-start');
    });
  }

  update (timeElapsed: number) {
    this.story.update();
  }
}
