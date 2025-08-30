import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { controls } from '@/core/controls';
import { drawEngine } from './core/draw-engine';
import { updateTimeEvents } from './core/timer';
import { menuState } from './game-states/menu.state';

// @ts-ignore -- is not undefined for sure
document.querySelector('link[type="image/x-icon"]').href = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'.9em\' font-size=\'85\'%3E💜%3C/text%3E%3C/svg%3E';

let previousTime = 0;
let fpsBacklog: number[] = [];
let paused = false;

window.addEventListener('blur', () => {
  paused = true;
});
window.addEventListener('focus', () => {
  paused = false;
});

function update(currentTime: number) {
  if (paused) return;

  currentTime = performance.now();
  let delta = currentTime - previousTime;
  previousTime = currentTime;
  if (delta > 1000) {
    return;
  }
    
  fpsBacklog.push(1000 / delta);
  if (fpsBacklog.length === 15) {
    fps.innerHTML = `${Math.round(fpsBacklog.reduce((a, b) => a + b) / 15)} FPS`;
    fpsBacklog = [];
  }

  drawEngine.clear();

  const state = gameStateMachine.getState();
  controls.queryController();
  state.onUpdate(delta);
  // state.postRender && state.postRender(delta);
  updateTimeEvents(delta);

  // if (gameData.pause){
  //   drawEngine.renderPause();
  // }
};


createGameStateMachine(menuState);
setInterval(update, 16);
