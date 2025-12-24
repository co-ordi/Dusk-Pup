import React, { useState, useEffect, useCallback, useRef, useMemo, startTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { YorkieDJ } from './components/YorkieDJ';
import { FemaleDJ } from './components/FemaleDJ';
import { CrowdYorkie } from './components/CrowdYorkie';
import { BeatLane, Beat } from './components/BeatLane';
import { ScoreDisplay } from './components/ScoreDisplay';
import { AICommentBox } from './components/AICommentBox';
import { SunsetTimer } from './components/SunsetTimer';
import { EndGameScreen } from './components/EndGameScreen';
import { ComboRewardToast, ComboRewardVariant } from './components/ComboRewardToast';
import { AFRO_EFFECT_BASE_URL, AFRO_EFFECT_FILES, COMBO_REWARD_FILES, LOGDRUM_FILES } from './audio/afroEffectsManifest';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { useIsMobile } from './components/ui/use-mobile';
import { MobileControls } from './components/MobileControls';
import { loadLeaderboard, saveLeaderboard, updateHighScore, isNewHighScore, type Leaderboard } from './utils/leaderboard';

type Genre = 'deep_house' | 'amapiano' | 'afro_house' | 'gqom';

const GAME_DURATION = 60000; // 60 seconds
const GENRE_BPMS: Record<Genre, number> = {
  amapiano: 100,      // Slowest - easier
  deep_house: 110,     // Medium-slow
  afro_house: 125,     // Medium-fast
  gqom: 140,           // Fastest - harder
};
const LANES = [0, 1, 2, 3];
const LANE_KEYS = ['a', 's', 'k', 'l']; // Left: A, S | Right: K, L

const MOCK_COMMENTS = [
  "That transition was BUTTER! 🔥",
  "Smooth as silk! Keep it going!",
  "The Yorkie approves! 🐕",
  "Now we're vibing! ✨",
  "Ooh that combo though! 💜",
  "Golden hour energy! ☀️",
  "Dusk never sounded this good! 🌅",
  "Keep those beats flowing! 🎵",
  "The crowd is feeling it! 🎶",
  "Pure deep house magic! ⭐"
];

const MOCK_TRACKS = [
  "Twilight Groove in Am",
  "Purple Hour Shuffle",
  "Sunset Boulevard Mix",
  "Golden Beat Theory",
  "Dusk Till Dawn Loop",
  "Orange Sky Rhythm",
  "Silky Smooth Transition",
  "Amber Light Special"
];

interface CrowdYorkieData {
  id: string;
  x: number;
  y: number;
  variant: 'sitting' | 'standing';
}

function App() {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'ended'>('menu');
  const [selectedGenre, setSelectedGenre] = useState<Genre>('deep_house');
  const [beats, setBeats] = useState<Beat[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [yorkieMood, setYorkieMood] = useState<'idle' | 'hit' | 'perfect' | 'miss'>('idle');
  const [activeLanes, setActiveLanes] = useState<boolean[]>([false, false, false, false]);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [hitAccuracies, setHitAccuracies] = useState<number[]>([]);
  const [endGameData, setEndGameData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard>(() => {
    try {
      return loadLeaderboard();
    } catch {
      return {
        deep_house: null,
        amapiano: null,
        afro_house: null,
        gqom: null,
      };
    }
  });
  const [crowdYorkies, setCrowdYorkies] = useState<CrowdYorkieData[]>([]);
  const [excitedYorkies, setExcitedYorkies] = useState<Set<string>>(new Set());
  const [missStreak, setMissStreak] = useState(0);
  const [isPerfectHit, setIsPerfectHit] = useState(false);
  const [recentMisses, setRecentMisses] = useState<number[]>([]);
  const [hitBeats, setHitBeats] = useState<Set<string>>(new Set()); // Track beats that were hit for animation
  const [comboMilestonesReached, setComboMilestonesReached] = useState<Set<number>>(new Set()); // Track combo milestones
  const [comboReward, setComboReward] = useState<{ combo: number; id: string; variant: ComboRewardVariant } | null>(null);
  const [flyingDog, setFlyingDog] = useState<{ id: string; dogImage: string; direction: 'left' | 'right'; isMobile: boolean } | null>(null);
  const [landedDogs, setLandedDogs] = useState<Array<{ id: string; dogImage: string; x: number; y: number }>>([]);
  const [specialGuests, setSpecialGuests] = useState<Set<string>>(new Set()); // Track which DogFriends appeared

  // Performance monitoring
  const totalAnimatedElements = crowdYorkies.length + landedDogs.length + (flyingDog ? 1 : 0);
  const performanceMode = totalAnimatedElements > 20; // More aggressive: enable when >20 animated elements

  // Memoized random values for all landed dogs to avoid hooks in map
  const landedDogRandoms = useMemo(() => {
    const randoms: Record<string, { flipDelay: number; drift1: number; drift2: number; driftDuration: number }> = {};
    landedDogs.forEach(dog => {
      if (!randoms[dog.id]) {
        randoms[dog.id] = {
          flipDelay: Math.random() * 2 + 1,
          drift1: Math.random() * 40 - 20,
          drift2: Math.random() * 40 - 20,
          driftDuration: 15 + Math.random() * 10
        };
      }
    });
    return randoms;
  }, [landedDogs.map(d => d.id).join(',')]); // Depend on dog IDs to recalculate when dogs change
  const [menuMusicStatus, setMenuMusicStatus] = useState<'idle' | 'loading' | 'playing' | 'blocked'>('idle');
  
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastCommentTime = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const menuMusicRef = useRef<HTMLAudioElement | null>(null);
  const menuMusicFadeRafRef = useRef<number | null>(null);
  const menuMusicNeedsKickRef = useRef(false);
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameMusicFadeRafRef = useRef<number | null>(null);
  const afroBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const afroLoadedRef = useRef(false);
  const afroLoadingPromiseRef = useRef<Promise<void> | null>(null);
  const lastComboRewardAtRef = useRef<number>(-Infinity);
  const comboRewardClearTimeoutRef = useRef<number | undefined>(undefined);
  const endGameSfxPlayedRef = useRef(false);
  const lastScoreThreshold = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsCheckRef = useRef(Date.now());
  const tickCountRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const gameStartTimeRef = useRef(0);

  // Prevent scrolling and screen movement during game - AGGRESSIVE
  useEffect(() => {
    // Always lock the viewport
    const lockViewport = () => {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';
      document.documentElement.style.top = '0';
      document.documentElement.style.left = '0';
    };

    lockViewport();

    if (gameState === 'playing') {
      // Prevent ALL wheel scrolling
      const preventWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };

      // Prevent ALL touch scrolling
      const preventTouch = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };

      // Prevent ALL keyboard scrolling and movement
      const preventKeyboardScroll = (e: KeyboardEvent) => {
        // Prevent ALL keys that could cause scrolling or movement
        const scrollKeys = [
          'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
          ' ', 'Space', 'PageUp', 'PageDown', 'Home', 'End',
          'Tab', 'Enter'
        ];
        
        // Only allow game keys (a, s, k, l) - prevent everything else
        const gameKeys = ['a', 's', 'k', 'l'];
        const keyLower = e.key.toLowerCase();
        
        if (!gameKeys.includes(keyLower) || scrollKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      };

      // Prevent scroll events
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };

      // Add listeners with highest priority
      window.addEventListener('wheel', preventWheel, { passive: false, capture: true });
      window.addEventListener('touchmove', preventTouch, { passive: false, capture: true });
      window.addEventListener('touchstart', preventTouch, { passive: false, capture: true });
      window.addEventListener('touchend', preventTouch, { passive: false, capture: true });
      window.addEventListener('keydown', preventKeyboardScroll, { passive: false, capture: true });
      window.addEventListener('keyup', preventKeyboardScroll, { passive: false, capture: true });
      window.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      document.addEventListener('wheel', preventWheel, { passive: false, capture: true });
      document.addEventListener('touchmove', preventTouch, { passive: false, capture: true });
      document.addEventListener('scroll', preventScroll, { passive: false, capture: true });

      // Prevent focus from causing scroll
      const preventFocusScroll = (e: FocusEvent) => {
        if (e.target && e.target instanceof HTMLElement) {
          e.target.scrollIntoView = () => {};
        }
      };
      window.addEventListener('focus', preventFocusScroll, { capture: true });

      return () => {
        window.removeEventListener('wheel', preventWheel, { capture: true });
        window.removeEventListener('touchmove', preventTouch, { capture: true });
        window.removeEventListener('touchstart', preventTouch, { capture: true });
        window.removeEventListener('touchend', preventTouch, { capture: true });
        window.removeEventListener('keydown', preventKeyboardScroll, { capture: true });
        window.removeEventListener('keyup', preventKeyboardScroll, { capture: true });
        window.removeEventListener('scroll', preventScroll, { capture: true });
        document.removeEventListener('wheel', preventWheel, { capture: true });
        document.removeEventListener('touchmove', preventTouch, { capture: true });
        document.removeEventListener('scroll', preventScroll, { capture: true });
        window.removeEventListener('focus', preventFocusScroll, { capture: true });
      };
    } else {
      // Unlock when not playing
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      document.documentElement.style.top = '';
      document.documentElement.style.left = '';
    }
  }, [gameState]);

  useEffect(() => {
    // #region agent log - hypothesis B: Audio context initialization
    fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'App.tsx:audioContext.useEffect',
        message: 'Audio context initialization',
        data: { hasAudioContext: !!audioContextRef.current },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'B'
      })
    }).catch(() => {});
    // #endregion

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const ensureMenuMusic = () => {
    if (!menuMusicRef.current) {
      const a = new Audio();
      // Prefer AAC/M4A for Safari compatibility; fall back to MP3.
      const canPlayM4a =
        typeof a.canPlayType === 'function' && a.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
      a.src = canPlayM4a ? '/AfroEffects/dusk-lite.m4a' : '/AfroEffects/dusk.mp3';
      // Safari/iOS is sensitive to large media + seeking; metadata preload is safer.
      a.preload = 'metadata';
      a.loop = true;
      a.crossOrigin = 'anonymous';
      a.muted = false;
      // iOS Safari: prefer inline playback behavior.
      a.setAttribute('playsinline', 'true');
      (a as any).playsInline = true;
      a.load();
      menuMusicRef.current = a;
    }
    return menuMusicRef.current;
  };

  const fadeAudio = (
    audio: HTMLAudioElement,
    to: number,
    durationMs: number,
    rafRef: React.MutableRefObject<number | null>
  ) => {
    return new Promise<void>((resolve) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const from = audio.volume;
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / durationMs);
        audio.volume = from + (to - from) * p;
        if (p >= 1) {
          rafRef.current = null;
          resolve();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    });
  };

  const tryRandomSeekMenuMusic = (audio: HTMLAudioElement) => {
    const dur = audio.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;

    // Use seekable range if available (Safari can reject seeks outside currently seekable range).
    let maxSeek = dur;
    try {
      if (audio.seekable && audio.seekable.length > 0) {
        maxSeek = audio.seekable.end(audio.seekable.length - 1);
      }
    } catch {
      // ignore
    }

    // Avoid starting right at the end so it feels like a continuous mix.
    const safeWindow = Math.max(0, maxSeek - 30);
    const target = Math.random() * safeWindow;
    try {
      audio.currentTime = target;
    } catch {
      // Seeking can fail on Safari before enough data is buffered. It's fine to ignore.
    }
  };

  const startMenuMusic = async () => {
    const audio = ensureMenuMusic();
    audio.loop = true;

    audio.volume = 0;
    setMenuMusicStatus('loading');
    try {
      await audio.play();
      menuMusicNeedsKickRef.current = false;
      // Try to jump to a random point once playback is permitted.
      tryRandomSeekMenuMusic(audio);
      await fadeAudio(audio, 0.38, 900, menuMusicFadeRafRef);
      setMenuMusicStatus('playing');
    } catch {
      // Autoplay is often blocked until user interaction; we'll retry on first click/tap.
      menuMusicNeedsKickRef.current = true;
      setMenuMusicStatus('blocked');
    }
  };

  // Safari (and some mobile browsers) require play() to be called synchronously within a user gesture.
  // This helper is intentionally NOT async and does not await before calling play().
  const kickMenuMusicFromGesture = () => {
    const audio = ensureMenuMusic();
    audio.loop = true;
    audio.muted = false;

    audio.volume = 0;
    setMenuMusicStatus('loading');

    // Critical: call play() immediately in this gesture call stack.
    const p = audio.play();
    p.then(() => {
      menuMusicNeedsKickRef.current = false;
      // After play is allowed, attempt a random seek; if Safari refuses, we just keep playing.
      // Delay a tick so metadata/seekable has a chance to populate.
      setTimeout(() => tryRandomSeekMenuMusic(audio), 0);
      fadeAudio(audio, 0.38, 900, menuMusicFadeRafRef).then(() => setMenuMusicStatus('playing'));

      // Safari sometimes resolves play() but doesn't actually start playback after a refresh.
      // Add a small watchdog to detect stalled playback and re-prompt for a user gesture.
      const t0 = audio.currentTime;
      setTimeout(() => {
        const stalled = audio.paused || Math.abs(audio.currentTime - t0) < 0.05;
        if (stalled) {
          menuMusicNeedsKickRef.current = true;
          setMenuMusicStatus('blocked');
        }
      }, 900);
    }).catch(() => {
      menuMusicNeedsKickRef.current = true;
      setMenuMusicStatus('blocked');
    });
  };

  const stopMenuMusic = async () => {
    const audio = menuMusicRef.current;
    if (!audio) return;
    try {
      await fadeAudio(audio, 0, 450, menuMusicFadeRafRef);
    } finally {
      audio.pause();
    }
    setMenuMusicStatus('idle');
  };

  const ensureGameMusic = (genre: Genre) => {
    if (!gameMusicRef.current) {
      gameMusicRef.current = new Audio();
      // Safari/iOS is sensitive to large media + seeking; metadata preload is safer.
      gameMusicRef.current.preload = 'metadata';
      gameMusicRef.current.loop = true;
      gameMusicRef.current.crossOrigin = 'anonymous';
      gameMusicRef.current.setAttribute('playsinline', 'true');
      (gameMusicRef.current as any).playsInline = true;
    }

    const a = gameMusicRef.current;
    const canPlayM4a =
      typeof a.canPlayType === 'function' && a.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';

    // In-game genre music (currently wired for amapiano only)
    if (genre === 'amapiano') {
      a.src = canPlayM4a ? '/AfroEffects/amapiano-lite.m4a' : '/AfroEffects/amapiano.mp3';
    } else if (genre === 'deep_house') {
      a.src = canPlayM4a ? '/AfroEffects/DuskJam-lite.m4a' : '/AfroEffects/DuskJam.mp3';
    } else if (genre === 'gqom') {
      a.src = canPlayM4a ? '/AfroEffects/lala-lite.m4a' : '/AfroEffects/lala.mp3';
    } else if (genre === 'afro_house') {
      a.src = canPlayM4a ? '/AfroEffects/afhouse-lite.m4a' : '/AfroEffects/afhouse.mp3';
    } else {
      a.src = '';
    }

    a.load();
    return a;
  };

  const stopGameMusic = async () => {
    const a = gameMusicRef.current;
    if (!a || !a.src) return;
    try {
      await fadeAudio(a, 0, 450, gameMusicFadeRafRef);
    } finally {
      a.pause();
    }
  };

  // Safari-friendly: must call play() synchronously inside Start button gesture.
  const kickGameMusicFromGesture = (genre: Genre) => {
    const a = ensureGameMusic(genre);
    if (!a.src) return;

    a.loop = true;
    a.muted = false;
    a.volume = 0;

    const p = a.play();
    p.then(() => {
      // Randomize once playback is allowed/buffering.
      setTimeout(() => tryRandomSeekMenuMusic(a), 0);
      // Slightly louder in-game mixes across genres (keep subtle).
      fadeAudio(a, 0.42, 900, gameMusicFadeRafRef);
    }).catch(() => {
      // If blocked, player can still play silently; they can toggle menu music to grant permission.
    });
  };

  // Menu background music: plays only on menu, fades out entering game/other screens.
  useEffect(() => {
    if (gameState === 'menu') {
      startMenuMusic();
      return;
    }
    stopMenuMusic();
  }, [gameState]);

  // Stop in-game music whenever we are not actively playing.
  useEffect(() => {
    if (gameState !== 'playing') {
      stopGameMusic();
    }
  }, [gameState]);

  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const ensureAfroEffectsLoaded = async (ctx: AudioContext) => {
    if (afroLoadedRef.current) return;
    if (afroLoadingPromiseRef.current) return afroLoadingPromiseRef.current;

    afroLoadingPromiseRef.current = (async () => {
      const files = AFRO_EFFECT_FILES.filter((f) => {
        const lower = f.toLowerCase();
        return lower.endsWith('.mp3') || lower.endsWith('.wav');
      });
      const settled = await Promise.allSettled(
        files.map(async (file) => {
          const res = await fetch(`${AFRO_EFFECT_BASE_URL}/${encodeURIComponent(file)}`);
          if (!res.ok) throw new Error(`Failed to fetch AfroEffects file: ${file}`);
          const buf = await res.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(buf.slice(0));
          return [file, audioBuffer] as const;
        })
      );

      const okEntries = settled
        .filter((r): r is PromiseFulfilledResult<readonly [string, AudioBuffer]> => r.status === 'fulfilled')
        .map((r) => r.value);

      if (okEntries.length === 0) {
        throw new Error('Failed to decode any AfroEffects audio files');
      }

      afroBuffersRef.current = new Map(okEntries);
      afroLoadedRef.current = true;
    })().finally(() => {
      afroLoadingPromiseRef.current = null;
    });

    return afroLoadingPromiseRef.current;
  };

  const playFallbackOscillator = (lane: number) => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const frequencies = [261.63, 329.63, 392.0, 523.25];
    oscillator.frequency.value = frequencies[lane];
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const playAfroBuffer = (
    ctx: AudioContext,
    audioBuffer: AudioBuffer,
    opts: { volume: number; maxSeconds: number; fadeSeconds: number }
  ) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    // Hard cap (or shorter if the buffer is shorter)
    const playSeconds = Math.min(audioBuffer.duration, opts.maxSeconds);
    const stopAt = now + playSeconds;

    // Fade-out (no hard cut). Fade in the final portion of playback.
    const fadeStart = Math.max(now, stopAt - opts.fadeSeconds);

    gainNode.gain.setValueAtTime(opts.volume, now);
    gainNode.gain.setValueAtTime(opts.volume, fadeStart);
    // Linear ramp is less “snappy” than exponential and reads as a smoother fade.
    gainNode.gain.linearRampToValueAtTime(0.0001, stopAt);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(now);
    source.stop(stopAt);
  };

  const playSound = (lane: number) => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    // Main gameplay SFX: always logdrums (fixed-per-lane)
    if (!afroLoadedRef.current || LOGDRUM_FILES.length === 0) {
      playFallbackOscillator(lane);
      return;
    }

    const file = LOGDRUM_FILES[lane] ?? LOGDRUM_FILES[Math.floor(Math.random() * LOGDRUM_FILES.length)];
    const audioBuffer = afroBuffersRef.current.get(file);
    if (!audioBuffer) {
      playFallbackOscillator(lane);
      return;
    }

    // Slightly lower logdrums so they sit under the mix; keep combo rewards louder.
    // Lighter button SFX so the in-game mixes stay on top (keep quieter than combo rewards).
    playAfroBuffer(ctx, audioBuffer, { volume: 0.085, maxSeconds: 20, fadeSeconds: 0.25 });
  };

  const playComboRewardSound = () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (!afroLoadedRef.current || COMBO_REWARD_FILES.length === 0) return;

    const file = COMBO_REWARD_FILES[Math.floor(Math.random() * COMBO_REWARD_FILES.length)];
    const audioBuffer = afroBuffersRef.current.get(file);
    if (!audioBuffer) return;

    // Combo wins: longer cap and smoother/longer fade so it feels earned (and not abruptly cut).
    playAfroBuffer(ctx, audioBuffer, { volume: 0.165, maxSeconds: 20, fadeSeconds: 0.7 });
  };

  const playEndGameSfx = () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (!afroLoadedRef.current || COMBO_REWARD_FILES.length === 0) return;

    const file = COMBO_REWARD_FILES[Math.floor(Math.random() * COMBO_REWARD_FILES.length)];
    const audioBuffer = afroBuffersRef.current.get(file);
    if (!audioBuffer) return;

    // Short celebratory stinger (not the mixes, not logdrums) with a tidy fade.
    playAfroBuffer(ctx, audioBuffer, { volume: 0.185, maxSeconds: 8, fadeSeconds: 0.45 });
  };

  // Spawn crowd Pup - limit to 50 for maximum fun, but continue scoring
  const spawnCrowdYorkie = useCallback(() => {
    setCrowdYorkies(prev => {
      // Performance limit: reduce spawning when too many elements
      const maxPups = performanceMode ? 25 : 50;
      if (prev.length >= maxPups) {
        // Still give score bonus even when not spawning more pups
        setScore(currentScore => currentScore + (performanceMode ? 25 : 50)); // Reduced bonus in performance mode
        return prev;
      }

      // Position Yorkies randomly across the dance floor area
      // Dance floor is 160px high, yorkies are ~48px tall
      const danceFloorWidth = 100; // percentage
      const danceFloorHeight = 160; // pixels
      const yorkieHeight = 48; // pixels

      // Random position within dance floor bounds
      const x = Math.random() * (danceFloorWidth - 10) + 5; // 5-95% to keep them on screen
      const y = Math.random() * (danceFloorHeight - yorkieHeight - 20) + 10; // 10-92px to fit within dance floor

    const newYorkie: CrowdYorkieData = {
      id: `yorkie-${Date.now()}-${Math.random()}`,
        x: x,
        y: y,
      variant: Math.random() > 0.5 ? 'standing' : 'sitting',
    };

      return [...prev, newYorkie];
    });
  }, []);

  // Remove crowd Yorkie (on poor performance)
  const removeCrowdYorkie = useCallback(() => {
    if (crowdYorkies.length === 0) return;
    setCrowdYorkies(prev => prev.slice(0, -1));
  }, [crowdYorkies.length]);

  // Check for crowd spawning based on score - lowered threshold for easier spawning
  useEffect(() => {
    const threshold = Math.floor(score / 200) * 200; // Every 200 points instead of 500
    if (threshold > lastScoreThreshold.current && threshold > 0) {
      spawnCrowdYorkie();
      lastScoreThreshold.current = threshold;
    }
  }, [score, spawnCrowdYorkie]);

  // Check for combo milestone spawning - track which milestones have been reached
  // Lowered milestones for easier Yorkie spawning
  useEffect(() => {
    const milestones = [3, 6, 10, 15, 20, 25]; // Much easier to reach
    milestones.forEach(milestone => {
      if (combo >= milestone && !comboMilestonesReached.has(milestone)) {
        setComboMilestonesReached(prev => new Set([...prev, milestone]));
      spawnCrowdYorkie();
    }
    });
  }, [combo, comboMilestonesReached, spawnCrowdYorkie]);

  // Perfect hit reaction - excite random Yorkies
  const exciteRandomYorkies = useCallback(() => {
    if (crowdYorkies.length === 0) return;
    const count = Math.min(5, crowdYorkies.length);
    const excited = new Set<string>();
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * crowdYorkies.length);
      excited.add(crowdYorkies[randomIndex].id);
    }
    setExcitedYorkies(excited);
    setTimeout(() => setExcitedYorkies(new Set()), 300);
  }, [crowdYorkies]);

  const startGame = async () => {
    // #region agent log - hypothesis B: Audio context issues
    fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'App.tsx:startGame',
        message: 'startGame called',
        data: { selectedGenre, gameState },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'B'
      })
    }).catch(() => {});
    // #endregion

    // Fade out menu music as we enter the game (do not await; keep gesture stack available for Safari).
    stopMenuMusic();
    // Start in-game genre music (amapiano currently supported).
    kickGameMusicFromGesture(selectedGenre);

    // Trigger resume in the gesture stack (Safari/Chrome autoplay rules are strict about timing).
    const ctx = ensureAudioContext();
    const resumePromise =
      ctx?.state && ctx.state !== 'running'
        ? ctx.resume()
        : Promise.resolve();
    await resumePromise;

    // Load AfroEffects samples (once). If loading fails, we still start the game and fall back to the oscillator.
    try {
      if (ctx) {
        await ensureAfroEffectsLoaded(ctx);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('AfroEffects load failed, using fallback oscillator:', e);
      afroLoadedRef.current = false;
    }

    // Reset combo reward spacing + UI
    lastComboRewardAtRef.current = -Infinity;
    setComboReward(null);
    endGameSfxPlayedRef.current = false;
    if (comboRewardClearTimeoutRef.current) {
      window.clearTimeout(comboRewardClearTimeoutRef.current);
      comboRewardClearTimeoutRef.current = undefined;
    }

    const startTime = Date.now();
    
    // Set refs first (synchronous)
    gameStartTimeRef.current = startTime;
    currentTimeRef.current = 0;
    lastCommentTime.current = 0;
    lastScoreThreshold.current = 0;
    lastBeatTimeRef.current = 0;
    lastRenderTimeRef.current = 0;
    
    // Update state - set gameState first to trigger re-render
    setGameState('playing');
    setBeats([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHitAccuracies([]);
    setCrowdYorkies([]);
    setMissStreak(0);
    setRecentMisses([]);
    setHitBeats(new Set());
    setComboMilestonesReached(new Set());
    setSpecialGuests(new Set()); // Reset special guests for new game
    setGameStartTime(startTime);
    setCurrentTime(0);
    // Reset lane beat timing
    lastBeatTimePerLaneRef.current = [0, 0, 0, 0];
  };

  // Track last beat spawn time per lane to prevent overlapping
  const lastBeatTimePerLaneRef = useRef<number[]>([0, 0, 0, 0]);
  const selectedGenreRef = useRef<Genre>(selectedGenre);
  const leaderboardRef = useRef<Leaderboard>(leaderboard);
  
  // Update genre ref when it changes
  useEffect(() => {
    selectedGenreRef.current = selectedGenre;
  }, [selectedGenre]);

  useEffect(() => {
    leaderboardRef.current = leaderboard;
    // Persist leaderboard changes
    try {
      saveLeaderboard(leaderboard);
    } catch {
      // ignore
    }
  }, [leaderboard]);
  
  const generateBeatRef = useRef<(elapsed: number) => void>((elapsed: number) => {
    const bpm = GENRE_BPMS[selectedGenreRef.current];
    const beatInterval = (60 / bpm) * 1000;
    // Prevent "note stacking" in the same lane:
    // - Require a stronger minimum spacing per lane
    // - Scale spacing with fall duration so faster genres still don't pile up visually
    const fallDuration = Math.round((100 / bpm) * 2500);
    const minSpacing = Math.max(beatInterval * 0.9, fallDuration * 0.65);
    
    // Limit total beats to prevent performance issues
    setBeats(prev => {
      if (prev.length >= 50) {
        // Remove oldest beats if we have too many
        const filtered = prev.filter(beat => elapsed - beat.spawnTime < 2500);
        if (filtered.length >= 50) return filtered;
      }
      
      // Find lanes that have enough spacing from last beat
      const availableLanes = [0, 1, 2, 3].filter(lane => {
        const timeSinceLastBeat = elapsed - lastBeatTimePerLaneRef.current[lane];
        return timeSinceLastBeat >= minSpacing;
      });
      
      // If no lanes available, skip this beat
      if (availableLanes.length === 0) return prev;
      
      // Randomly select from available lanes
      const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
      lastBeatTimePerLaneRef.current[lane] = elapsed;
      
    const newBeat: Beat = {
        id: `beat-${elapsed}-${Math.random()}`,
      lane,
        spawnTime: elapsed,
      };
      return [...prev, newBeat];
    });
  });

  const endGame = useCallback(() => {
    if (!endGameSfxPlayedRef.current) {
      endGameSfxPlayedRef.current = true;
      playEndGameSfx();
    }
    setGameState('ended');
    const genreAtEnd = selectedGenreRef.current;
    // Calculate average accuracy: hitAccuracies now stores accuracy percentages directly
    const averageAccuracy = hitAccuracies.length > 0 
      ? Math.round(hitAccuracies.reduce((a, b) => a + b, 0) / hitAccuracies.length)
      : 0;
    
    const selectedTracks = MOCK_TRACKS
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .map((name, index) => ({ name, position: index + 1 }));

    const vibeScores = [
      "Silky smooth transitions with fire energy",
      "Golden hour vibes all the way through",
      "Pure sunset magic in every beat",
      "Dusk never looked this good",
      "The Pup crowd is in love with this set"
    ];

    const descriptions = [
      "A smooth journey through golden hour with deep house energy",
      "Sunset vibes meet amapiano rhythm in this special session",
      "From twilight to dusk, this set captures the magic",
      "Perfect blend of smooth transitions and energetic drops"
    ];

    const currentLb = leaderboardRef.current;
    const newHigh = isNewHighScore(currentLb, genreAtEnd, score);

    setEndGameData({
      genre: genreAtEnd,
      totalScore: score,
      averageAccuracy,
      maxCombo,
      tracks: selectedTracks,
      setDescription: descriptions[Math.floor(Math.random() * descriptions.length)],
      vibeScore: vibeScores[Math.floor(Math.random() * vibeScores.length)],
      crowdSize: crowdYorkies.length,
      specialGuests: Array.from(specialGuests), // Add special guests to end game data
      isNewHighScore: newHigh,
      highScoreSubmitted: false,
    });
  }, [score, maxCombo, hitAccuracies, crowdYorkies.length]);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }
    
    // Use ref for gameStartTime to avoid stale closure issues
    const startTime = gameStartTimeRef.current;
    if (startTime === 0) {
      // Wait a bit and retry - this shouldn't happen but handle it gracefully
      const timeoutId = setTimeout(() => {
        if (gameStartTimeRef.current > 0) {
          // Retry by triggering effect again
          setGameStartTime(gameStartTimeRef.current);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    
    const bpm = GENRE_BPMS[selectedGenre];
    const beatInterval = (60 / bpm) * 1000;

    const tick = () => {
      const startTime = performance.now();
      // #region agent log - hypothesis E: Performance monitoring
      fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'App.tsx:tick',
          message: 'Game loop tick with performance',
          data: {
            elapsed: Date.now() - gameStartTimeRef.current,
            gameState,
            combo,
            score,
            activeAnimations: {
              crowdYorkies: crowdYorkies.length,
              landedDogs: landedDogs.length,
              flyingDog: !!flyingDog
            },
            memoryEstimate: (performance as any).memory ? {
              used: (performance as any).memory.usedJSHeapSize,
              total: (performance as any).memory.totalJSHeapSize,
              limit: (performance as any).memory.jsHeapSizeLimit
            } : null
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'performance',
          hypothesisId: 'E'
        })
      }).catch(() => {});
      // #endregion

      const elapsed = Date.now() - gameStartTimeRef.current; // Use ref instead of state
      currentTimeRef.current = elapsed;

      // Performance monitoring
      const tickEndTime = performance.now();
      const tickDuration = tickEndTime - startTime;

      if (tickDuration > 16.67) { // Slower than 60fps
        // #region agent log - hypothesis E: Slow frame detection
        fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'App.tsx:tick.performance',
            message: 'Slow frame detected',
            data: {
              tickDuration,
              targetFPS: 60,
              actualFPS: 1000 / tickDuration,
              animationCount: crowdYorkies.length + landedDogs.length + (flyingDog ? 1 : 0)
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'performance',
            hypothesisId: 'E'
          })
        }).catch(() => {});
        // #endregion
      }
      
      // Only update state every ~16ms (60fps) to reduce re-renders
      // Use startTransition for non-urgent updates
      if (elapsed - lastRenderTimeRef.current >= 16) {
        startTransition(() => {
      setCurrentTime(elapsed);
        });
        lastRenderTimeRef.current = elapsed;
      }

      if (elapsed >= GAME_DURATION) {
        endGame();
        return;
      }
      // Only spawn beat if enough time has passed (avoid duplicate spawns)
      if (elapsed - lastBeatTimeRef.current >= beatInterval - 50 && generateBeatRef.current) {
        generateBeatRef.current(elapsed);
        lastBeatTimeRef.current = elapsed;
      }

        // Only filter beats every 200ms to reduce state updates
        const shouldFilter = elapsed % 200 < 16;
        if (shouldFilter) {
          startTransition(() => {
            setBeats(prev => prev.filter(beat => {
              const age = elapsed - beat.spawnTime;
              return age < 3000 && age >= -100; // Keep beats that are visible or about to be
            }));
          });
        }

      if (elapsed - lastCommentTime.current > 10000) {
        showAIComment();
        lastCommentTime.current = elapsed;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, selectedGenre, endGame]); // Added endGame to deps

  const showAIComment = () => {
    const comment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
    setAiComment(comment);
    setTimeout(() => setAiComment(null), 3000);
  };

  const triggerLane = useCallback((laneIndex: number) => {
    if (gameState !== 'playing') return;
    if (laneIndex < 0 || laneIndex > 3) return;

    // Main button SFX should always fire on press (independent of hit/miss)
    playSound(laneIndex);

    setActiveLanes(prev => {
      const newLanes = [...prev];
      newLanes[laneIndex] = true;
      return newLanes;
    });
    setTimeout(() => {
      setActiveLanes(prev => {
        const newLanes = [...prev];
        newLanes[laneIndex] = false;
        return newLanes;
      });
    }, 100);

    const laneBeats = beats.filter(b => b.lane === laneIndex);
    if (laneBeats.length === 0) return;

    // Use ref to avoid stale-closure BPM when switching genres.
    const bpm = GENRE_BPMS[selectedGenreRef.current];
    const FALL_DURATION = Math.round((100 / bpm) * 2500);
    const currentTimeNow = currentTimeRef.current;

    const closestBeat = laneBeats.reduce((closest, beat) => {
      const elapsed = currentTimeNow - beat.spawnTime;
      const progress = elapsed / FALL_DURATION;
      const expectedProgress = 0.85;
      const accuracy = Math.abs(progress - expectedProgress);
      
      const closestElapsed = currentTimeNow - closest.spawnTime;
      const closestProgress = closestElapsed / FALL_DURATION;
      const closestAccuracy = Math.abs(closestProgress - expectedProgress);

      return accuracy < closestAccuracy ? beat : closest;
    });

    const elapsed = currentTimeNow - closestBeat.spawnTime;
    const progress = elapsed / FALL_DURATION;
    const expectedProgress = 0.85;
    const accuracy = Math.abs(progress - expectedProgress);
    const expectedHitTime = FALL_DURATION * expectedProgress;
    const timeAccuracy = Math.abs(elapsed - expectedHitTime);

    if (accuracy < 0.25 || timeAccuracy < 200) {
      const isPerfect = accuracy < 0.08 || timeAccuracy < 50;
      const points = isPerfect ? 100 : 50;
      const newCombo = combo + 1;
      
      setHitBeats(prev => new Set([...prev, closestBeat.id]));
      setTimeout(() => {
        setHitBeats(prev => {
          const next = new Set(prev);
          next.delete(closestBeat.id);
          return next;
        });
      }, 300);
      
      const accuracyPercent = Math.max(0, Math.min(100, (1 - (accuracy / 0.25)) * 100));
      
      setScore(s => s + points * (Math.floor(newCombo / 5) + 1));
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      setHitAccuracies(prev => [...prev, accuracyPercent]);
      setYorkieMood(isPerfect ? 'perfect' : 'hit');
      setMissStreak(0);
      
      if (isPerfect) {
        setIsPerfectHit(true);
        exciteRandomYorkies();
        setTimeout(() => setIsPerfectHit(false), 500);
      }
      
      if (newCombo > 0 && newCombo % 6 === 0 && audioContextRef.current) { // Less frequent combo rewards for performance
        // #region agent log - hypothesis D: Combo reward state issues
        fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'App.tsx:comboReward.trigger',
            message: 'Combo reward triggered',
            data: { newCombo, audioContextState: audioContextRef.current?.state },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'initial',
            hypothesisId: 'D'
          })
        }).catch(() => {});
        // #endregion

        const nowSec = audioContextRef.current.currentTime;
        const cooldownSec = 4;
        if (nowSec - lastComboRewardAtRef.current >= cooldownSec) {
          lastComboRewardAtRef.current = nowSec;
          const rewardId = `combo-reward-${Date.now()}-${Math.random()}`;
          const variant = (Math.floor(Math.random() * 3) as unknown) as ComboRewardVariant;
          setComboReward({ combo: newCombo, id: rewardId, variant });

          // Trigger flying dog animation (mobile-optimized)
          const dogImages = ['/DogFriends/Subject copy 5.png', '/DogFriends/Subject copy 6.png'];
          const selectedDogIndex = Math.floor(Math.random() * dogImages.length);
          const selectedDog = dogImages[selectedDogIndex];
          const dogId = `flying-dog-${Date.now()}-${Math.random()}`;
          setFlyingDog({
            id: dogId,
            dogImage: selectedDog,
            direction: selectedDogIndex === 0 ? 'right' : 'left',
            isMobile: isMobile
          });

          if (comboRewardClearTimeoutRef.current) {
            window.clearTimeout(comboRewardClearTimeoutRef.current);
          }
          comboRewardClearTimeoutRef.current = window.setTimeout(() => setComboReward(null), 1300);
          window.setTimeout(() => playComboRewardSound(), 120);
        }
      }

      setBeats(prev => prev.filter(b => b.id !== closestBeat.id));
      setTimeout(() => setYorkieMood('idle'), isPerfect ? 1000 : 300);
    } else {
      setCombo(0);
      setYorkieMood('miss');
      setMissStreak(prev => prev + 1);
      
      const now = Date.now();
      setRecentMisses(prev => {
        const recent = [...prev.filter(t => now - t < 10000), now];
        if (recent.length >= 3) {
          removeCrowdYorkie();
          return [];
        }
        return recent;
      });
      
      setTimeout(() => setYorkieMood('idle'), 500);
    }
  }, [gameState, beats, combo, exciteRandomYorkies, removeCrowdYorkie]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const laneIndex = LANE_KEYS.indexOf(key);

    if (laneIndex !== -1 || ['a', 's', 'k', 'l'].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    if (laneIndex === -1) return;
    triggerLane(laneIndex);
  }, [triggerLane]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Prevent default for ALL keys during gameplay to prevent any scrolling
      if (gameState === 'playing') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Only process game keys
        if (['a', 's', 'k', 'l'].includes(key)) {
          handleKeyPress(event);
        }
      } else {
        // In menu, only prevent game keys
        if (['a', 's', 'k', 'l'].includes(key)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
        handleKeyPress(event);
      }
    };
    
    // Use capture phase to catch events early and prevent other handlers
    window.addEventListener('keydown', keyHandler, { passive: false, capture: true });
    // Also add in bubble phase as backup
    window.addEventListener('keydown', keyHandler, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', keyHandler, { capture: true });
      window.removeEventListener('keydown', keyHandler);
    };
  }, [handleKeyPress, gameState]);


  // Memoize background particles to avoid recreating on every render
  const backgroundParticles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  // Memoize crowd Yorkies rendering data
  const crowdYorkiesData = useMemo(() => {
    const sizeScale =
      crowdYorkies.length >= 38 ? 0.72 : crowdYorkies.length >= 32 ? 0.78 : crowdYorkies.length >= 26 ? 0.85 : 0.92;
    return crowdYorkies.map((yorkie, index) => ({
      ...yorkie,
      index,
      isExcited: excitedYorkies.has(yorkie.id),
      sizeScale,
    }));
  }, [crowdYorkies, excitedYorkies]);

  if (gameState === 'menu') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center p-6 relative overflow-hidden"
        style={{ backgroundColor: '#0f0f23' }}
        onPointerDown={() => {
          if (menuMusicNeedsKickRef.current) kickMenuMusicFromGesture();
        }}
        onClick={() => {
          if (menuMusicNeedsKickRef.current) kickMenuMusicFromGesture();
        }}
        onKeyDownCapture={() => {
          if (menuMusicNeedsKickRef.current) kickMenuMusicFromGesture();
        }}
      >
        {/* Cover image wash (menu) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(\"/Image/Cover%20Image.jpeg\")',
            backgroundSize: 'cover',
            backgroundPosition: '50% center',
            opacity: 0.12,
            transform: 'scale(1.06)',
            filter: 'saturate(1.05) contrast(1.05)',
          }}
        />

        {/* Animated sunset gradient (menu) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 25% 20%, rgba(168,85,247,0.35) 0%, rgba(236,72,153,0.18) 35%, rgba(0,0,0,0) 70%),' +
              'radial-gradient(circle at 80% 40%, rgba(251,146,60,0.22) 0%, rgba(139,92,246,0.12) 40%, rgba(0,0,0,0) 75%),' +
              'linear-gradient(135deg, rgba(17,24,39,0.0) 0%, rgba(139,92,246,0.08) 40%, rgba(236,72,153,0.06) 100%)',
            backgroundSize: '220% 220%',
            animation: 'sunsetDrift 22s ease-in-out infinite, sunsetPulse 10s ease-in-out infinite',
            mixBlendMode: 'screen',
          }}
        />

        {/* Menu music toggle (subtle, top-left) */}
        <div className="fixed top-4 left-4 z-50 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (menuMusicStatus === 'playing' || menuMusicStatus === 'loading') {
                stopMenuMusic();
                return;
              }
              kickMenuMusicFromGesture();
            }}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-black/35 hover:bg-black/45 border border-white/10 backdrop-blur-md shadow-lg transition-colors"
            aria-label={menuMusicStatus === 'playing' ? 'Music on' : 'Music off'}
            title={menuMusicStatus === 'playing' ? 'Music on' : 'Music off'}
          >
            {menuMusicStatus === 'loading' ? (
              <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
            ) : menuMusicStatus === 'playing' ? (
              <Volume2 className="w-4 h-4 text-white/85" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/70" />
            )}
            <span className="text-xs font-semibold tracking-wide text-white/80 group-hover:text-white/90">
              Music
            </span>
            <span
              className={`ml-1 inline-flex h-2 w-2 rounded-full ${
                menuMusicStatus === 'playing'
                  ? 'bg-emerald-400'
                  : menuMusicStatus === 'loading'
                  ? 'bg-amber-300'
                  : 'bg-white/30'
              }`}
            />
          </button>
        </div>

        <div className="text-center max-w-2xl w-full" style={{ marginTop: '-2rem' }}>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 bg-clip-text text-transparent mb-1 drop-shadow-2xl pulse-text" style={{ letterSpacing: '0.1em', marginTop: '-0.5rem' }}>
            DUSK PUP
          </h1>
          <p className="text-xl text-pink-300 mb-3 font-light glitter-text" style={{ letterSpacing: '0.08em', marginTop: '-0.25rem' }}>By Dusk</p>

          {/* Spacer to maintain original layout */}
          <div className="mb-6 h-44"></div>

          {/* Genre Selection */}
          <div className="mb-6" style={{ marginTop: '1.5rem' }}>
            <p className="text-xs text-gray-300 uppercase tracking-wider mb-3">Select Your Vibe</p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {(Object.keys(GENRE_BPMS) as Genre[]).map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-105'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/10'
                  }`}
                >
                  {genre.replace('_', ' ').toUpperCase()}
                  <div className="text-xs opacity-70 mt-0.5">{GENRE_BPMS[genre]} BPM</div>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="px-12 py-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 border-2 border-white/20 mb-4"
          >
            Start Vibing
          </button>
          
          <div className="text-gray-300 text-xs space-y-1">
            <p className="font-semibold">Use A, S (left) and K, L (right) keys to match the beats</p>
            <p>Build your Pup crowd by hitting perfect notes! 🐕</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended' && endGameData) {
    return (
      <EndGameScreen
        {...endGameData}
        leaderboard={leaderboard}
        onSubmitHighScore={(username: string) => {
          const genre = endGameData.genre as 'deep_house' | 'amapiano' | 'afro_house' | 'gqom';
          const updated = updateHighScore(leaderboardRef.current, genre, username, endGameData.totalScore);
          setLeaderboard(updated);
          setEndGameData((prev: any) => (prev ? { ...prev, highScoreSubmitted: true } : prev));
        }}
        onPlayAgain={() => {
          stopGameMusic();
          setGameState('menu');
          setEndGameData(null);
        }}
      />
    );
  }

  const progress = currentTime / GAME_DURATION;
  const eclipseOpacity = Math.max(0, Math.min(0.78, (progress - 0.18) / 0.82));

  // Performance monitoring for renders
  const renderStartTime = performance.now();
  // #region agent log - hypothesis E: Render performance
  fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'App.tsx:render',
      message: 'Component render with performance',
      data: {
        gameState,
        combo,
        score,
        landedDogsCount: landedDogs.length,
        flyingDog: !!flyingDog,
        totalAnimations: landedDogs.length + crowdYorkies.length + (flyingDog ? 1 : 0)
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'performance',
      hypothesisId: 'E'
    })
  }).catch(() => {});
  // #endregion

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 overflow-hidden pt-24 ${
        isMobile ? 'pb-24' : ''
      }`}
      style={{
        backgroundColor: '#0f0f23',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'fixed',
        width: '100%',
        height: '100dvh',
        minHeight: '100vh',
        top: 0,
        left: 0,
        overflow: 'hidden',
        willChange: 'contents',
      }}
    >
      {/* Simplified animated background for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/3 to-orange-500/5" />
        {/* Reduced sunset wash animation */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(168,85,247,0.18) 0%, rgba(236,72,153,0.08) 40%, rgba(0,0,0,0) 75%),' +
              'radial-gradient(circle at 85% 35%, rgba(251,146,60,0.12) 0%, rgba(139,92,246,0.06) 45%, rgba(0,0,0,0) 80%)',
            backgroundSize: '220% 220%',
            animation: performanceMode ? 'none' : 'sunsetDrift 32s ease-in-out infinite', // Disable in performance mode
            mixBlendMode: 'screen',
            opacity: crowdYorkies.length > 20 ? 0.4 : 0.6, // Reduce opacity when crowded
          }}
        />
        {/* Simplified eclipse fade */}
        <div
          className="absolute inset-0"
          style={{
            opacity: eclipseOpacity * 0.7, // Reduced opacity for performance
            background:
              'radial-gradient(circle at 50% 22%, rgba(255,186,120,0.06) 0%, rgba(88,28,135,0.12) 35%, rgba(3,7,18,0.6) 72%, rgba(0,0,0,0.8) 100%)',
            mixBlendMode: 'multiply',
          }}
        />
        {/* Minimal particle count for performance */}
        {backgroundParticles.slice(0, performanceMode ? 10 : crowdYorkies.length > 15 ? 15 : 25).map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400/15 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: performanceMode ? 'none' : `pulse ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <ScoreDisplay 
        score={score} 
        combo={combo} 
        timeRemaining={GAME_DURATION - currentTime}
        crowdSize={crowdYorkies.length}
      />
      
      <ComboRewardToast reward={comboReward} />

      {/* Flying Dog Animation */}
      <AnimatePresence>
        {flyingDog && (
          <motion.div
            key={flyingDog.id}
            className="fixed z-60 pointer-events-none"
            initial={{
              x: flyingDog.direction === 'right' ? '-80px' : 'calc(100vw + 80px)',
              y: flyingDog.isMobile ? Math.random() * 80 + 40 : Math.random() * 100 + 50, // Start high up (mobile-optimized)
              rotate: 0,
              scale: flyingDog.isMobile ? 0.6 : 0.8 // Smaller on mobile
            }}
            animate={{
              x: flyingDog.direction === 'right' ? 'calc(100vw + 80px)' : '-80px',
              y: flyingDog.isMobile ? 380 : 420, // Land on dance floor (adjusted for mobile)
              rotate: flyingDog.direction === 'right' ? 360 : -360, // Single spin for performance
              scale: flyingDog.isMobile ? 0.6 : 0.8
            }}
            exit={{
              opacity: 0,
              scale: flyingDog.isMobile ? 0.4 : 0.5
            }}
            transition={{
              duration: flyingDog.isMobile ? 1.8 : 2.2, // Faster animation for performance
              ease: 'easeOut'
            }}
            onAnimationComplete={() => {
              // Add dog to landed dogs on dance floor (same area as yorkies)
              if (flyingDog) {
                const landX = Math.random() * 80 + 10; // Random horizontal position (10-90%)
                const landY = Math.random() * 40 + 8; // Random vertical position matching yorkie range (8-48px from bottom)
                setLandedDogs(prev => [...prev.slice(-2), { // Keep only last 3 landed dogs for better performance
                  id: flyingDog.id,
                  dogImage: flyingDog.dogImage,
                  x: landX,
                  y: landY
                }]);

                // Track special guest appearance
                const guestName = flyingDog.dogImage.replace('/DogFriends/', '').replace('.png', '');
                setSpecialGuests(prev => new Set([...prev, guestName]));
              }
              setFlyingDog(null);
            }}
          >
            <img
              src={flyingDog.dogImage}
              alt="Flying Dog Friend"
              width={flyingDog.isMobile ? "45" : "60"}
              height={flyingDog.isMobile ? "45" : "60"}
              style={{
                imageRendering: 'pixelated',
                filter: flyingDog.isMobile
                  ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))'
                  : 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' // Subtle glow on mobile
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>


      {/* Dancefloor Area - Yorkie DJ and crowd together */}
      <div className="relative flex justify-center py-0" style={{ 
        height: '160px', 
        minHeight: '160px', 
        maxHeight: '160px',
        position: 'relative',
        contain: 'layout style paint',
        willChange: 'contents',
      }}>
        {/* Dancefloor background - enhanced dancefloor with disco lights */}
        <div className="absolute inset-x-0 bottom-0 h-40 rounded-t-3xl overflow-hidden">
          {/* Base floor with darker pattern */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-800/70 to-gray-700/50" />
          
          {/* Dancefloor checkerboard pattern */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(255,255,255,0.15) 15px, rgba(255,255,255,0.15) 16px),
              repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(255,255,255,0.15) 15px, rgba(255,255,255,0.15) 16px)
            `,
          }} />
          
          {/* Disco ball effect - rotating light spots */}
          <div className="absolute inset-0 opacity-30" style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 40%, rgba(255,192,203,0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 60%, rgba(192,192,255,0.3) 0%, transparent 50%)
            `,
            animation: 'pulse 3s ease-in-out infinite',
          }} />
          
          {/* Colored stage lights - moving across floor */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-b from-purple-500/30 via-transparent to-transparent" style={{
              animation: 'slideRight 4s ease-in-out infinite',
            }} />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-b from-pink-500/30 via-transparent to-transparent" style={{
              animation: 'slideLeft 4s ease-in-out infinite',
            }} />
            <div className="absolute top-0 left-1/3 w-1/3 h-full bg-gradient-to-b from-orange-500/20 via-transparent to-transparent" style={{
              animation: 'pulse 2s ease-in-out infinite',
            }} />
          </div>
          
          {/* Shine/gloss effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-400/10 to-pink-400/15" />
          
          {/* Edge glow */}
          <div className="absolute inset-0 border-t-2 border-purple-500/50 shadow-[0_-10px_30px_rgba(192,38,211,0.3)]" />
        </div>
        
        {/* Main Yorkie DJ - positioned at top of dancefloor, scaled down */}
        <div className="relative z-30 transform scale-[0.7]">
        <YorkieDJ mood={yorkieMood} />
        </div>

        {/* Crowd Area - positioned below main Yorkie on dancefloor - fixed height to prevent layout shifts */}
        <div className="absolute bottom-0 left-0 right-0 h-40 px-8 overflow-visible" style={{ 
          contain: 'layout style paint', 
          zIndex: 20,
          height: '160px',
          minHeight: '160px',
          maxHeight: '160px',
          position: 'absolute',
          pointerEvents: 'none',
          willChange: 'transform',
        }}>
          {crowdYorkiesData.map((yorkieData) => (
            <div
              key={yorkieData.id}
              className="absolute"
              style={{
                left: `${yorkieData.x}%`,
                bottom: `${yorkieData.y}px`,
                zIndex: Math.floor(yorkieData.y) + 20,
                willChange: 'transform',
                pointerEvents: 'none',
                transform: `translate3d(0, 0, 0) scale(${yorkieData.sizeScale})`,
                transformOrigin: 'bottom center',
              }}
            >
              <CrowdYorkie
                index={yorkieData.index}
                combo={combo}
                isExcited={yorkieData.isExcited}
                variant={yorkieData.variant}
              />
            </div>
          ))}

          {/* Landed Dog Friends on the same dance floor */}
          {landedDogs.map((dog, index) => {
            // #region agent log - hypothesis A: React re-render issues
            fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'App.tsx:landedDogs.map',
                message: 'Rendering landed dog',
                data: { dogId: dog.id, totalDogs: landedDogs.length, combo },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'initial',
                hypothesisId: 'A'
              })
            }).catch(() => {});
            // #endregion

            // Simplified dance flip timing for better performance
            const getFlipSpeed = () => {
              if (combo >= 20) return { min: 1.5, max: 3.0 }; // Moderate speed for high combos
              if (combo >= 10) return { min: 2.0, max: 3.5 }; // Medium speed for decent combos
              return { min: 2.5, max: 4.0 }; // Slow for low combos
            };

            const flipSpeed = getFlipSpeed();
            // Aggressive performance optimization - reduce animation complexity
            const shouldSimplify = performanceMode || isMobile || landedDogs.length > 2 || index > 1;

            const flipDuration = shouldSimplify
              ? flipSpeed.max // Simplified animation for performance
              : Math.random() * (flipSpeed.max - flipSpeed.min) + flipSpeed.min;

            return (
              <motion.div
                key={dog.id}
                className="absolute"
              style={{
                left: `${dog.x}%`,
                bottom: `${dog.y}px`,
                zIndex: Math.floor(dog.y) + 15, // Slightly behind yorkies
                willChange: 'transform',
                pointerEvents: 'none',
                transform: 'translate3d(0, 0, 0)',
                transformOrigin: 'bottom center',
                backfaceVisibility: 'hidden', // Performance optimization
                WebkitBackfaceVisibility: 'hidden',
              }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{
                  scale: isMobile ? 0.5 : 0.6,
                  opacity: 1,
                  scaleX: shouldSimplify ? [1, -1, 1] : [1, -1, 1], // Simplified animation for performance
                  x: shouldSimplify
                    ? [0, (landedDogRandoms[dog.id]?.drift1 || 0) * 0.2, 0] // Even more minimal drift
                    : [0, (landedDogRandoms[dog.id]?.drift1 || 0) * 0.5, 0] // Simplified full drift
                }}
                transition={{
                  duration: 0.5,
                  scaleX: {
                    duration: shouldSimplify ? flipDuration * 1.5 : flipDuration, // Slower flips for simplified dogs
                    repeat: Infinity,
                    delay: landedDogRandoms[dog.id]?.flipDelay || 1,
                    ease: 'easeInOut',
                  },
                  x: {
                    duration: shouldSimplify
                      ? 25 // Fixed slow duration for simplified dogs
                      : Math.max(20, landedDogRandoms[dog.id]?.driftDuration || 20), // Minimum 20s for full animation
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                }}
              >
                <img
                  src={dog.dogImage}
                  alt="Landed Dog Friend"
                  width={isMobile ? "32" : "40"}
                  height={isMobile ? "32" : "40"}
                  style={{
                    imageRendering: 'pixelated',
                    filter: isMobile
                      ? 'drop-shadow(0 0 3px rgba(255,255,255,0.3))'
                      : 'drop-shadow(0 0 4px rgba(255,255,255,0.4))'
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Beat Lanes - use CSS containment for better performance */}
      <div
        className={`flex gap-3 px-6 relative z-10 mt-2 ${isMobile ? 'h-44' : 'h-56'}`}
        style={{ contain: 'layout style paint' }}
      >
        {LANES.map(lane => {
          // Calculate fall duration based on BPM: slower BPM = longer fall (easier), faster BPM = shorter fall (harder)
          // Base duration of 2500ms at 100 BPM, scales inversely with BPM
          const bpm = GENRE_BPMS[selectedGenreRef.current];
          const fallDuration = Math.round((100 / bpm) * 2500);
          
          return (
          <BeatLane
            key={lane}
            lane={lane}
            beats={beats}
            isActive={activeLanes[lane]}
            currentTime={currentTime}
              hitBeats={hitBeats}
              fallDuration={fallDuration}
            onHit={() => {}}
            />
          );
        })}
      </div>

      {/* DJ at bottom - made smaller and positioned to not overlap */}
      <div className="mt-2 transform scale-[0.75] origin-bottom">
        <FemaleDJ combo={combo} missStreak={missStreak} isPerfectHit={isPerfectHit} />
      </div>

      <SunsetTimer progress={progress} />
      <AICommentBox comment={aiComment} />
      <MobileControls
        isVisible={isMobile && gameState === 'playing'}
        activeLanes={activeLanes}
        onPress={(laneIndex) => triggerLane(laneIndex)}
      />

      {/* Performance monitoring - measure render time */}
      {(() => {
        const renderEndTime = performance.now();
        const renderDuration = renderEndTime - renderStartTime;

        if (renderDuration > 16.67) { // Slower than 60fps
          // #region agent log - hypothesis E: Slow render detection
          fetch('http://127.0.0.1:7243/ingest/28deec04-3579-4497-a4b5-71b4d65cebfc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'App.tsx:render.performance',
              message: 'Slow render detected',
              data: {
                renderDuration,
                targetFPS: 60,
                actualFPS: 1000 / renderDuration,
                animationCount: landedDogs.length + crowdYorkies.length + (flyingDog ? 1 : 0)
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'performance',
              hypothesisId: 'E'
            })
          }).catch(() => {});
          // #endregion
        }

        return null; // This doesn't render anything
      })()}
    </div>
  );
}

export default App;
