import { drawEngine } from '@/core/draw-engine';
import { emit, on } from '@/core/event';
import { DialogState, Story, StoryEngineEvent } from '@/core/story-engine';
import { addTimeEvent } from '@/core/timer';
import { GameEvent } from './event-manifest';

export interface SceneProps extends DialogState {
  goals?: string[],
};

const enum Scene {
  intro = 1,
  spirit,
  barrier,
  temple,
  noMagic,
  villagers,
}

const script = {} as Record<Scene, SceneProps>;

// Use programmatic assignment to avoid preserving enum string names
script[Scene.intro] = {
  dialogs: [
    'Zzzzz...',
    'Yawwwn...',
    'How long was i sleeping?...',
  ],
};

script[Scene.spirit] = {
  dialogs: [
    'Evil spirits?',
    'Has the magic barrier failed\nwhile I slept??',
    'This one seems weak.',
    "I'll exorcise it and then\ngo check the barrier",
    '> Press (1) to attack',
  ],
  goals: ['find magic barrier obelisk'],
};

script[Scene.barrier] = {
  dialogs: [
    'I have no magic power left!',
    'My magic comes from villagers\nworshiping me...',
    'Something must be wrong with\nthe cat altar.',
  ],
  goals: ['repair the cat altar'],
};

script[Scene.noMagic] = {
  dialogs: [
    "I don't have enough magic!",
    'Something must be wrong with\nthe cat altars in the valley',
  ],
};

script[Scene.temple] = {
  dialogs: [
    'My magic has increased a little.',
    'But the other altars...\nthey must be damaged too.',
  ],
  goals: [
    'repair all 5 temples',
    'restore the forest magic barrier',
  ],
};

script[Scene.villagers] = {
  dialogs: [
    'Villagers are very supersticious.',
    'I should not let them see me,\nthat will empower the evil spirits.',
  ],
};

const postIntro = () => {
  emit(GameEvent.WAKE_UP);
  emit(GameEvent.SPAWN_FIRST_SPIRIT);
  drawEngine.cameraLerpSpeed = 0.08;
};

export class GameStory {
  story: Story<typeof script>;

  constructor() {
    this.story = new Story(script);

    on(StoryEngineEvent.STORY_STATE_EXIT, (label: Scene) => {
      emit(GameEvent.CUTSCENE_END, script[label]);
      if (label === Scene.intro) {
        postIntro();
        addTimeEvent(() => {
          emit(StoryEngineEvent.STORY_STATE_ENTER, Scene.spirit);
        }, 3000);
      }
      if(label === Scene.spirit) {
        emit(GameEvent.ENABLE_SCRATCH);
      }
    });

    on(StoryEngineEvent.STORY_STATE_ENTER, () => {
      emit(GameEvent.CUTSCENE_START);
    });

    on(GameEvent.NOT_ENOUGH_MAGIC, () => {
      if (script[Scene.barrier].isDone) {
        emit(StoryEngineEvent.STORY_STATE_ENTER, Scene.noMagic);
      } else {
        emit(StoryEngineEvent.STORY_STATE_ENTER, Scene.barrier);
      }
    });

    on(GameEvent.STATUE_RESTORED, () => {
      emit(StoryEngineEvent.STORY_STATE_ENTER, Scene.temple);
    });

    on(GameEvent.SCARED, () => {
      if (!script[Scene.villagers].isDone) {
        emit(StoryEngineEvent.STORY_STATE_ENTER, Scene.villagers);
      }
    });

    addTimeEvent(() => this.story.enterState(Scene.intro), 1000);
    // setTimeout(() => {
    //   postIntro();
    // }, 10);
  }

  update (timeElapsed: number) {
    this.story.update(timeElapsed);
  }
}
