import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { drawEngine } from './core/draw-engine';
import { updateTimeEvents } from './core/timer';
import { gameData } from './game/game-data';
import { menuState } from './game-states/menu.state';

// @ts-ignore -- is not undefined for sure
document.querySelector('link[type="image/x-icon"]').href = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'.9em\' font-size=\'90\'%3E💟%3C/text%3E%3C/svg%3E';


async function init() {
  await drawEngine.init();
}

let previousTime = 0;
let fpsBacklog: number[] = [];

function update(currentTime: number) {
  currentTime = performance.now();
  let delta = currentTime - previousTime;
    
  previousTime = currentTime;
  fpsBacklog.push(1000 / delta);
  if (fpsBacklog.length === 15) {
    fps.innerHTML = `${Math.round(fpsBacklog.reduce((a, b) => a + b) / 15)} FPS`;
    fpsBacklog = [];
  }

  drawEngine.clear();

  if (gameData.paused){
    delta = 0;
  }

  const state = gameStateMachine.getState();
  controls.queryController();
  state.onUpdate(delta);
  // state.postRender && state.postRender(delta);
  updateTimeEvents(delta);

  // if (gameData.pause){
  //   drawEngine.renderPause();
  // }
};

init()
.then(() => {
  createGameStateMachine(menuState);
  setInterval(update, 16);
});
