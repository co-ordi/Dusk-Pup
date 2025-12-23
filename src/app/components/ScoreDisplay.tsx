import { motion } from 'motion/react';
import React from 'react';
import { Users } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  combo: number;
  timeRemaining: number;
  crowdSize: number;
}

export function ScoreDisplay({ score, combo, timeRemaining, crowdSize }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between w-full px-8 py-6 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
      {/* Game Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
          DUSK PUP
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Deep House Rhythm</p>
      </motion.div>

      {/* Score and Combo */}
      <div className="flex flex-col items-end gap-2">
        <motion.div
          className="text-4xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg"
          key={score}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.2 }}
        >
          {score.toLocaleString()}
        </motion.div>
        {combo > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-bold text-sm shadow-xl border border-white/20"
          >
            COMBO x{combo}
          </motion.div>
        )}
        
        {/* Crowd Size */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/30 backdrop-blur-sm"
          animate={{ scale: crowdSize > 0 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.3 }}
          key={crowdSize}
        >
          <Users className="w-4 h-4 text-purple-300" />
          <span className="text-sm font-bold text-purple-200">{crowdSize} Yorkies</span>
        </motion.div>
      </div>

      {/* Time Remaining */}
      <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-br from-orange-600/20 to-purple-600/20 border border-orange-400/30 backdrop-blur-sm">
        <div className="text-xs text-orange-300 uppercase tracking-wider">Until Dusk</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-orange-300 to-pink-300 bg-clip-text text-transparent">
          {Math.floor(timeRemaining / 1000)}s
        </div>
      </div>
    </div>
  );
}