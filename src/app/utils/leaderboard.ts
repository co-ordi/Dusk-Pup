export type Genre = 'deep_house' | 'amapiano' | 'afro_house' | 'gqom';

export interface HighScoreEntry {
  username: string;
  score: number;
  updatedAt: number;
}

export type Leaderboard = Record<Genre, HighScoreEntry | null>;

const STORAGE_KEY = 'dusk_pup_leaderboard_v1';

export function getEmptyLeaderboard(): Leaderboard {
  return {
    deep_house: null,
    amapiano: null,
    afro_house: null,
    gqom: null,
  };
}

export function loadLeaderboard(): Leaderboard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyLeaderboard();
    const parsed = JSON.parse(raw) as Partial<Leaderboard>;
    return { ...getEmptyLeaderboard(), ...parsed };
  } catch {
    return getEmptyLeaderboard();
  }
}

export function saveLeaderboard(lb: Leaderboard) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
}

export function isNewHighScore(lb: Leaderboard, genre: Genre, score: number) {
  const current = lb[genre];
  if (!current) return score > 0;
  return score > current.score;
}

export function updateHighScore(lb: Leaderboard, genre: Genre, username: string, score: number): Leaderboard {
  const next: Leaderboard = { ...lb };
  next[genre] = { username: username.trim() || 'Anonymous', score, updatedAt: Date.now() };
  return next;
}


