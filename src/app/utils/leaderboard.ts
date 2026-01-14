
export type Genre = 'deep_house' | 'amapiano' | 'afro_house' | 'gqom';

export interface HighScoreEntry {
  username: string;
  score: number;
  updatedAt: number;
}

export type Leaderboard = Record<Genre, HighScoreEntry | null>;

export const EMPTY_LEADERBOARD: Leaderboard = {
  deep_house: null,
  amapiano: null,
  afro_house: null,
  gqom: null,
};

// Now async
export async function loadLeaderboard(): Promise<Leaderboard> {
  try {
    const response = await fetch('/api/leaderboard');
    if (!response.ok) {
      throw new Error(`Failed to load leaderboard: ${response.statusText}`);
    }
    const data = await response.json();
    return { ...EMPTY_LEADERBOARD, ...data };
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return EMPTY_LEADERBOARD;
  }
}

// Now async
export async function updateHighScore(
  genre: Genre,
  username: string,
  score: number
): Promise<{ success: boolean; leaderboard: Leaderboard }> {
  try {
    const response = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ genre, username, score }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update high score: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      leaderboard: data.leaderboard || EMPTY_LEADERBOARD
    };
  } catch (error) {
    console.error('Failed to update high score:', error);
    return { success: false, leaderboard: EMPTY_LEADERBOARD };
  }
}

export function isNewHighScore(lb: Leaderboard, genre: Genre, score: number) {
  const current = lb[genre];
  if (!current) return score > 0;
  return score > current.score;
}



