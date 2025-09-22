// Event enumeration for better minification
// Converting string event names to numeric constants
export const enum GameEvent {
  CUTSCENE_START = 4,
  CUTSCENE_END,
  
  // Game action events
  WAKE_UP,
  TELEPORT,
  RESTORE,
  ENABLE_SCRATCH,
  ENTER_VILLAGE,
  SLEEP,
  
  // Combat events
  ATTACK_PLAYER,
  STATUE_RESTORED,
  NEXT_STATUE_DIALOG,
  NOT_ENOUGH_MAGIC,
  
  // Entity events
  SCARED,
  PARTICLE,
  SPAWN_FIRST_SPIRIT,
  
  // Game state events
  GAME_OVER,
  GAME_END,
  FADE_OUT,
  PAUSE,
  UNPAUSE,
}
