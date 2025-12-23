import React, { useState, useEffect, useCallback, useRef } from 'react';
import { YorkieDJ } from './components/YorkieDJ';
import { FemaleDJ } from './components/FemaleDJ';
import { CrowdYorkie } from './components/CrowdYorkie';
import { BeatLane, Beat } from './components/BeatLane';
import { ScoreDisplay } from './components/ScoreDisplay';
import { AICommentBox } from './components/AICommentBox';
import { SunsetTimer } from './components/SunsetTimer';
import { EndGameScreen } from './components/EndGameScreen';

type Genre = 'deep_house' | 'amapiano' | 'afro_house' | 'gqom';

const GAME_DURATION = 60000; // 60 seconds
const GENRE_BPMS: Record<Genre, number> = {
  deep_house: 120,
  amapiano: 115,
  afro_house: 122,
  gqom: 130,
};
const LANES = [0, 1, 2, 3];
const LANE_KEYS = ['d', 'f', 'j', 'k'];

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
  const [crowdYorkies, setCrowdYorkies] = useState<CrowdYorkieData[]>([]);
  const [excitedYorkies, setExcitedYorkies] = useState<Set<string>>(new Set());
  const [missStreak, setMissStreak] = useState(0);
  const [isPerfectHit, setIsPerfectHit] = useState(false);
  const [recentMisses, setRecentMisses] = useState<number[]>([]);
  
  const animationFrameRef = useRef<number>();
  const lastCommentTime = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastScoreThreshold = useRef(0);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = (lane: number) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const frequencies = [261.63, 329.63, 392.00, 523.25];
    oscillator.frequency.value = frequencies[lane];
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  // Spawn crowd Yorkie
  const spawnCrowdYorkie = useCallback(() => {
    if (crowdYorkies.length >= 50) return;
    
    const row = Math.floor(crowdYorkies.length / 10);
    const col = crowdYorkies.length % 10;
    
    const newYorkie: CrowdYorkieData = {
      id: `yorkie-${Date.now()}-${Math.random()}`,
      x: 10 + col * 9,
      y: 70 - row * 15,
      variant: Math.random() > 0.5 ? 'standing' : 'sitting',
    };
    
    setCrowdYorkies(prev => [...prev, newYorkie]);
  }, [crowdYorkies.length]);

  // Remove crowd Yorkie (on poor performance)
  const removeCrowdYorkie = useCallback(() => {
    if (crowdYorkies.length === 0) return;
    setCrowdYorkies(prev => prev.slice(0, -1));
  }, [crowdYorkies.length]);

  // Check for crowd spawning based on score
  useEffect(() => {
    const threshold = Math.floor(score / 500) * 500;
    if (threshold > lastScoreThreshold.current && threshold > 0) {
      spawnCrowdYorkie();
      lastScoreThreshold.current = threshold;
    }
  }, [score, spawnCrowdYorkie]);

  // Check for combo milestone spawning
  useEffect(() => {
    if ([10, 20, 30, 40].includes(combo)) {
      spawnCrowdYorkie();
    }
  }, [combo, spawnCrowdYorkie]);

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
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setGameState('playing');
    setBeats([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHitAccuracies([]);
    setCrowdYorkies([]);
    setMissStreak(0);
    setRecentMisses([]);
    setGameStartTime(Date.now());
    setCurrentTime(0);
    lastCommentTime.current = 0;
    lastScoreThreshold.current = 0;
  };

  const generateBeat = useCallback(() => {
    const lane = Math.floor(Math.random() * 4);
    const newBeat: Beat = {
      id: `beat-${Date.now()}-${Math.random()}`,
      lane,
      spawnTime: currentTime,
    };
    setBeats(prev => [...prev, newBeat]);
  }, [currentTime]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const bpm = GENRE_BPMS[selectedGenre];
    const beatInterval = (60 / bpm) * 1000;

    const tick = () => {
      const elapsed = Date.now() - gameStartTime;
      setCurrentTime(elapsed);

      if (elapsed >= GAME_DURATION) {
        endGame();
        return;
      }

      if (elapsed % beatInterval < 16) {
        generateBeat();
      }

      setBeats(prev => prev.filter(beat => currentTime - beat.spawnTime < 3000));

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
  }, [gameState, gameStartTime, currentTime, generateBeat, selectedGenre]);

  const showAIComment = () => {
    const comment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
    setAiComment(comment);
    setTimeout(() => setAiComment(null), 3000);
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    const key = event.key.toLowerCase();
    const laneIndex = LANE_KEYS.indexOf(key);
    if (laneIndex === -1) return;

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

    const FALL_DURATION = 2000;
    const closestBeat = laneBeats.reduce((closest, beat) => {
      const elapsed = currentTime - beat.spawnTime;
      const progress = elapsed / FALL_DURATION;
      const expectedProgress = 0.9;
      const accuracy = Math.abs(progress - expectedProgress);
      
      const closestElapsed = currentTime - closest.spawnTime;
      const closestProgress = closestElapsed / FALL_DURATION;
      const closestAccuracy = Math.abs(closestProgress - expectedProgress);

      return accuracy < closestAccuracy ? beat : closest;
    });

    const elapsed = currentTime - closestBeat.spawnTime;
    const progress = elapsed / FALL_DURATION;
    const expectedProgress = 0.9;
    const accuracy = Math.abs(progress - expectedProgress);

    if (accuracy < 0.15) {
      const isPerfect = accuracy < 0.05;
      const points = isPerfect ? 100 : 50;
      const newCombo = combo + 1;
      
      setScore(s => s + points * (Math.floor(newCombo / 5) + 1));
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      setHitAccuracies(prev => [...prev, (1 - accuracy) * 100]);
      setYorkieMood(isPerfect ? 'perfect' : 'hit');
      setMissStreak(0);
      
      if (isPerfect) {
        setIsPerfectHit(true);
        exciteRandomYorkies();
        setTimeout(() => setIsPerfectHit(false), 500);
      }
      
      playSound(laneIndex);
      setBeats(prev => prev.filter(b => b.id !== closestBeat.id));
      setTimeout(() => setYorkieMood('idle'), isPerfect ? 1000 : 300);
    } else {
      // Miss
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
  }, [gameState, beats, currentTime, combo, exciteRandomYorkies, removeCrowdYorkie]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const endGame = () => {
    setGameState('ended');
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
      "The Yorkie crowd is in love with this set"
    ];

    const descriptions = [
      "A smooth journey through golden hour with deep house energy",
      "Sunset vibes meet amapiano rhythm in this special session",
      "From twilight to dusk, this set captures the magic",
      "Perfect blend of smooth transitions and energetic drops"
    ];

    setEndGameData({
      totalScore: score,
      averageAccuracy,
      maxCombo,
      tracks: selectedTracks,
      setDescription: descriptions[Math.floor(Math.random() * descriptions.length)],
      vibeScore: vibeScores[Math.floor(Math.random() * vibeScores.length)],
    });
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            DUSK PUP
          </h1>
          <p className="text-2xl text-purple-200 mb-12 font-light">by dusk</p>
          
          <div className="mb-12">
            <YorkieDJ mood="idle" />
          </div>

          {/* Genre Selection */}
          <div className="mb-8">
            <p className="text-sm text-gray-300 uppercase tracking-wider mb-4">Select Your Vibe</p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {(Object.keys(GENRE_BPMS) as Genre[]).map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-105'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/10'
                  }`}
                >
                  {genre.replace('_', ' ').toUpperCase()}
                  <div className="text-xs opacity-70 mt-1">{GENRE_BPMS[genre]} BPM</div>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="px-16 py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-2xl shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 border-2 border-white/20"
          >
            Start Vibing
          </button>
          
          <div className="mt-10 text-gray-300 text-sm space-y-2">
            <p className="font-semibold">Use D, F, J, K keys to match the beats</p>
            <p>Build your Yorkie crowd by hitting perfect notes! 🐕</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended' && endGameData) {
    return (
      <EndGameScreen
        {...endGameData}
        onPlayAgain={() => setGameState('menu')}
      />
    );
  }

  const progress = currentTime / GAME_DURATION;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-orange-500/10" />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
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

      {/* Yorkie DJ */}
      <div className="flex justify-center py-6">
        <YorkieDJ mood={yorkieMood} />
      </div>

      {/* Beat Lanes */}
      <div className="flex gap-4 px-8 h-80 relative z-10">
        {LANES.map(lane => (
          <BeatLane
            key={lane}
            lane={lane}
            beats={beats}
            isActive={activeLanes[lane]}
            currentTime={currentTime}
            onHit={() => {}}
          />
        ))}
      </div>

      {/* Crowd Area */}
      <div className="relative h-32 mt-4 px-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-3xl" />
        {crowdYorkies.map((yorkie, index) => (
          <div
            key={yorkie.id}
            style={{
              position: 'absolute',
              left: `${yorkie.x}%`,
              bottom: `${yorkie.y}%`,
              zIndex: Math.floor(yorkie.y),
            }}
          >
            <CrowdYorkie
              index={index}
              combo={combo}
              isExcited={excitedYorkies.has(yorkie.id)}
              variant={yorkie.variant}
            />
          </div>
        ))}
      </div>

      {/* DJ at bottom */}
      <div className="mt-2">
        <FemaleDJ combo={combo} missStreak={missStreak} isPerfectHit={isPerfectHit} />
      </div>

      <SunsetTimer progress={progress} />
      <AICommentBox comment={aiComment} />
    </div>
  );
}

export default App;
