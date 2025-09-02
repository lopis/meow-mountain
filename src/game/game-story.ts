import { drawEngine } from '@/core/draw-engine';
import { emit, on } from '@/core/event';
import { DialogState, Story } from '@/core/story-engine';
import { addTimeEvent } from '@/core/timer';

export interface SceneProps extends DialogState {
  goals?: string[],
};

enum Scene {
  intro = 1,
  spirit,
  barrier,
  temple,
  noMagic,
}

const script: Record<Scene, SceneProps> = {
  [Scene.intro]: {
    dialogs: [
      'Zzzzz...',
      'Yawwwn...',
      'How long was i sleeping?...',
    ],
  },
  [Scene.spirit]: {
    dialogs: [
      'Evil spirits?',
      'Has the magic barrier failed\nwhile I slept??',
      'This one seems weak.',
      "I'll exorcise it and then\ngo check the barrier",
      '> Press (1) to attack\n> Hold (1) to charge',
    ],
    goals: ['find magic barrier obelisk'],
  },
  [Scene.barrier]: {
    dialogs: [
      'I have no magic power left!',
      'My magic comes from villagers\nworshiping me...',
      'Something must be wrong with\nthe cat altar.',
    ],
    goals: ['repair the cat altar'],
  },
  [Scene.noMagic]: {
    dialogs: [
      "I don't have enough magic!",
      'Something must be wrong with\nthe cat altars in the valley',
    ],
  },
  [Scene.temple]: {
    dialogs: [
      'My magic has increased a little.',
      'But the other altars...\nthey must be damaged too.',
    ],
    goals: [
      'repair all 5 temples',
      'restore the forest magic barrier',
    ],
  },
};

const postIntro = () => {
  emit('wake-up');
  emit('spawn-first-spirit');
  drawEngine.cameraLerpSpeed = 0.08;
};

export class GameStory {
  story: Story<typeof script>;

  constructor() {
    this.story = new Story(script);

    on('story-state-exit', (label: Scene) => {
      emit('cutscene-end', script[label]);
      if (label === Scene.intro) {
        postIntro();
        addTimeEvent(() => {
          emit('story-state-enter', Scene.spirit);
        }, 3000);
      }
      if(label === Scene.spirit) {
        emit('enable-scratch');
      }
    });

    on('story-state-enter', () => {
      emit('cutscene-start');
    });

    on('not-enough-magic', () => {
      if (script[Scene.barrier].isDone) {
        emit('story-state-enter', Scene.noMagic);
      } else {
        emit('story-state-enter', Scene.barrier);
      }
    });

    on('statue-restored', () => {
      emit('story-state-enter', Scene.temple);
    });

    // addTimeEvent(() => this.story.enterState(Scene.intro), 1000);
    setTimeout(() => {
      postIntro();
    }, 10);
  }

  update (timeElapsed: number) {
    this.story.update(timeElapsed);
  }
}
