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
      "Evil spirits? Has the barrier come down?",
      "Looks pretty weak."
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
      if (label === 'intro') {
        emit('wake-up');
        emit('cutscene-end');
        addTimeEvent(() => {
          debugger;
          emit('story-state-enter');
        }, 2000);
      }
    });
  }

  update (timeElapsed: number) {
    this.story.update();
  }
}
