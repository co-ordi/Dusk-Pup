import { motion } from 'motion/react';
import React, { memo } from 'react';
import { Users } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  combo: number;
  timeRemaining: number;
  crowdSize: number;
}

export const ScoreDisplay = memo(function ScoreDisplay({ score, combo, timeRemaining, crowdSize }: ScoreDisplayProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-24 w-full px-6 py-3 bg-linear-to-b from-black/60 to-transparent backdrop-blur-sm">
      <div className="grid h-full grid-cols-3 items-center gap-4">
        {/* Left: Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center leading-none"
        >
          <h1 className="text-3xl md:text-4xl font-black bg-linear-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
            DUSK PUP
          </h1>
          <p className="mt-1 text-[10px] text-gray-400 uppercase tracking-[0.22em]">
            Rhythm Game
          </p>
        </motion.div>

        {/* Center: Score + Yorkies */}
        <div className="flex flex-col items-center justify-center gap-1">
          <motion.div
            className="text-2xl md:text-3xl font-black tabular-nums bg-linear-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg"
            animate={{ scale: [1, 1.14, 1] }}
            transition={{ duration: 0.18 }}
          >
            {score.toLocaleString()}
          </motion.div>

          <motion.div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-linear-to-r from-purple-600/25 to-pink-600/25 border border-purple-400/25 backdrop-blur-sm"
            animate={{ scale: crowdSize > 0 ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 0.26 }}
          >
            <Users className="w-3 h-3 text-purple-300" />
            <span className="text-[11px] font-bold text-purple-200 tabular-nums">
              {crowdSize} Yorkies
            </span>
          </motion.div>
        </div>

        {/* Right: Combo + Time */}
        <div className="flex flex-col items-end justify-center gap-2">
          {/* Reserve space so the HUD never changes height */}
          <div className="h-7 flex items-center justify-end">
            <motion.div
              initial={false}
              animate={combo > 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="px-3 py-1 rounded-full bg-linear-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-black text-[11px] shadow-xl border border-white/20 origin-right tracking-wide"
              style={{ visibility: combo > 1 ? 'visible' : 'hidden' }}
            >
              COMBO ×{combo}
            </motion.div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-linear-to-br from-orange-600/20 to-purple-600/20 border border-orange-400/25 backdrop-blur-sm">
            <div className="text-[10px] text-orange-200/90 uppercase tracking-[0.22em]">
              Time
            </div>
            <div className="text-lg font-black tabular-nums bg-linear-to-r from-orange-300 to-pink-300 bg-clip-text text-transparent">
              {Math.floor(timeRemaining / 1000)}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});