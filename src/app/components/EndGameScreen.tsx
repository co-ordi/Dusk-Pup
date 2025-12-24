import { motion } from 'motion/react';
import React, { useMemo, useState } from 'react';
import { Music2, Star, Zap, Users } from 'lucide-react';
import { YorkieDJ } from './YorkieDJ';
import { CrowdYorkie } from './CrowdYorkie';
import type { Leaderboard, Genre } from '../utils/leaderboard';

interface Track {
  name: string;
  position: number;
}

interface EndGameScreenProps {
  genre: Genre;
  totalScore: number;
  averageAccuracy: number;
  maxCombo: number;
  tracks: Track[];
  setDescription: string;
  vibeScore: string;
  crowdSize?: number;
  leaderboard: Leaderboard;
  isNewHighScore?: boolean;
  highScoreSubmitted?: boolean;
  onSubmitHighScore: (username: string) => void;
  onPlayAgain: () => void;
}

export function EndGameScreen({
  genre,
  totalScore,
  averageAccuracy,
  maxCombo,
  tracks,
  setDescription,
  vibeScore,
  crowdSize = 0,
  leaderboard,
  isNewHighScore = false,
  highScoreSubmitted = false,
  onSubmitHighScore,
  onPlayAgain,
}: EndGameScreenProps) {
  const [username, setUsername] = useState('');

  const genreLabel = useMemo(() => {
    switch (genre) {
      case 'deep_house':
        return 'Deep House';
      case 'amapiano':
        return 'Amapiano';
      case 'afro_house':
        return 'Afro House';
      case 'gqom':
        return 'Gqom';
      default:
        return genre;
    }
  }, [genre]);

  const genreHigh = leaderboard[genre];
  const showSubmit = isNewHighScore && !highScoreSubmitted;

  // Generate crowd Yorkies for display
  const displayCrowd = Array.from({ length: Math.min(crowdSize, 12) }, (_, i) => ({
    id: `display-${i}`,
    index: i,
    x: 10 + (i % 6) * 15,
    y: 20 + Math.floor(i / 6) * 30,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onPlayAgain();
        }
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
        className="max-w-2xl w-full max-h-[90dvh] bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-3xl border-2 border-purple-500/50 shadow-2xl pointer-events-auto relative overflow-hidden flex flex-col min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-xl animate-pulse" />

        {/* Scrollable content area so the CTA never gets pushed off-screen */}
        <div className="relative z-10 p-6 overflow-y-auto min-h-0 flex-1">
        
        {/* Header with celebration */}
        <div className="text-center mb-3 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-block mb-2"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Music2 className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-1"
          >
            Session Complete! 🎉
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400"
          >
            By Dusk
          </motion.p>
        </div>

        {/* Stats Grid - moved before Yorkie to prevent overlap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-4 relative z-10"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl p-3 border border-purple-500/40 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <div className="text-xs text-gray-400 uppercase">Score</div>
            </div>
            <div className="text-2xl font-bold text-white">{totalScore.toLocaleString()}</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-pink-600/30 to-pink-800/30 rounded-xl p-3 border border-pink-500/40 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-pink-400" />
              <div className="text-xs text-gray-400 uppercase">Combo</div>
            </div>
            <div className="text-2xl font-bold text-white">{maxCombo}x</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl p-3 border border-orange-500/40 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-orange-400" />
              <div className="text-xs text-gray-400 uppercase">Accuracy</div>
            </div>
            <div className="text-2xl font-bold text-white">{Math.max(0, averageAccuracy)}%</div>
          </motion.div>
        </motion.div>

        {/* Leaderboard / High Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mb-4 relative z-10"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-xs text-white/70 uppercase tracking-[0.22em]">
              Leaderboard
            </div>
            <div className="text-xs text-white/60">
              {genreLabel} record
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-white">
                {genreLabel}
              </div>
              <div className="text-sm font-black text-white tabular-nums">
                {genreHigh ? genreHigh.score.toLocaleString() : '—'}
              </div>
            </div>
            <div className="mt-0.5 text-xs text-white/60">
              {genreHigh ? `by ${genreHigh.username}` : 'No score yet — set the first one.'}
            </div>

            {showSubmit && (
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-yellow-500/15 via-pink-500/10 to-purple-500/10 border border-white/10">
                <div className="text-sm font-black text-white mb-2">
                  New High Score!
                </div>
                <div className="flex gap-2">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/35 border border-white/10 text-white text-sm outline-none"
                    maxLength={18}
                  />
                  <button
                    onClick={() => onSubmitHighScore(username)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-bold"
                  >
                    Save
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-white/55">
                  Only shown when you beat the record.
                </div>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['deep_house', 'amapiano', 'afro_house', 'gqom'] as Genre[]).map((g) => {
                const e = leaderboard[g];
                const name =
                  g === 'deep_house' ? 'Deep House' :
                  g === 'amapiano' ? 'Amapiano' :
                  g === 'afro_house' ? 'Afro House' :
                  'Gqom';
                return (
                  <div key={g} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
                    <div className="text-[11px] text-white/70">{name}</div>
                    <div className="text-[11px] font-bold text-white/80 tabular-nums">
                      {e ? e.score.toLocaleString() : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Yorkie Display - positioned after stats, scaled smaller to prevent overlap */}
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.7, type: 'spring' }}
          className="flex justify-center mb-3 relative z-10"
        >
          <div className="relative transform scale-50">
            <YorkieDJ mood="perfect" />
            {/* Celebration particles around Yorkie */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 40,
                  y: Math.sin((i / 8) * Math.PI * 2) * 40,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Crowd Display */}
        {crowdSize > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-3 relative z-10"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-bold text-white">
                {crowdSize} {crowdSize === 1 ? 'Pup' : 'Pups'} Joined the Party! 🐕
              </span>
            </div>
            {/* Mini crowd visualization */}
            <div className="relative h-20 bg-gray-800/30 rounded-lg p-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
              {displayCrowd.map((yorkie, idx) => (
                <motion.div
                  key={yorkie.id}
                  className="absolute"
                  style={{
                    left: `${yorkie.x}%`,
                    bottom: `${yorkie.y}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + idx * 0.05 }}
                >
                  <div className="transform scale-50 origin-bottom">
                    <CrowdYorkie index={yorkie.index} combo={maxCombo} variant="standing" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vibe Score */}
        {vibeScore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 relative z-10"
          >
            <p className="text-xs text-gray-400 mb-1">Vibe Check:</p>
            <p className="text-base font-bold text-white italic">"{vibeScore}"</p>
          </motion.div>
        )}
        </div>

        {/* Sticky footer CTA */}
        <div className="relative z-10 px-6 pb-6 pt-3 border-t border-white/10 bg-black/15 backdrop-blur-md">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-base shadow-lg hover:shadow-2xl transition-all border-2 border-white/20"
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
