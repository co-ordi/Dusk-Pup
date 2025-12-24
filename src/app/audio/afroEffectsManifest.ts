/**
 * Static manifest of AfroEffects audio files.
 *
 * These files live under `public/AfroEffects/` and are fetched at runtime as:
 * `/AfroEffects/<filename>`.
 */
export const AFRO_EFFECT_FILES: string[] = [
  'amapiano-fx-3_scoviniebeatz-432582.mp3',
  'amapiano-loop-base-banny-fernandes-297939.mp3',
  'barcardi-whistle-345123.mp3',
  'cliche-house-chords-bassline-82794.mp3',
  'deep-house-26350.mp3',
  'deep-house-pluck-25180.mp3',
  'delayed-deep-house-bass-1-102063.mp3',
  'drum-a-simple-afro-house-drumbreak-loop-110bpm-4bars-440884.mp3',
  'echo_lead-345121.mp3',
  'inhambu-whistle-bird-190067.mp3',
  'log-drum-hit-low.wav',
  'sauce-logdrum-1-431888.mp3',
  'sauce-logdrum-2-431880.mp3',
  'sauce-logdrum-3-431879.mp3',
  'whistle-84607.mp3',
];

export const AFRO_EFFECT_BASE_URL = '/AfroEffects';

export const LOGDRUM_FILES: string[] = [
  'log-drum-hit-low.wav',
  'sauce-logdrum-1-431888.mp3',
  'sauce-logdrum-2-431880.mp3',
  'sauce-logdrum-3-431879.mp3',
];

export const COMBO_REWARD_FILES: string[] = AFRO_EFFECT_FILES.filter(
  (f) => !LOGDRUM_FILES.includes(f)
);


