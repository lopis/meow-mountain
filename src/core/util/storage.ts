const STORAGE_KEY = 'whiskers_valley';

export function loadLevel(): number {
  const storage = localStorage.getItem(`${STORAGE_KEY}_save`) || "";
  return parseInt(storage, 10) || 0;
}

export function saveLevel(boss: number) {
  localStorage.setItem(`${STORAGE_KEY}_save`, boss.toString());
}

export function saveHiScore(level: number) {
  localStorage.setItem(`${STORAGE_KEY}_hs`, level.toString());
}

export function loadHiScore(): number {
  const storage = localStorage.getItem(`${STORAGE_KEY}_hs`) || "";

  return parseInt(storage, 10) || 0;
}
