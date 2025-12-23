import { motion } from 'motion/react';
import React from 'react';
import { Music2, Star, Zap } from 'lucide-react';

interface Track {
  name: string;
  position: number;
}

interface EndGameScreenProps {
  totalScore: number;
  averageAccuracy: number;
  maxCombo: number;
  tracks: Track[];
  setDescription: string;
  vibeScore: string;
  onPlayAgain: () => void;
}

export function EndGameScreen({
  totalScore,
  averageAccuracy,
  maxCombo,
  tracks,
  setDescription,
  vibeScore,
  onPlayAgain,
}: EndGameScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 p-8"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="max-w-2xl w-full bg-gray-900/90 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Music2 className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
            Dusk Session Complete!
          </h2>
          <p className="text-gray-400">by dusk</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <div className="text-xs text-gray-400 uppercase">Score</div>
            </div>
            <div className="text-2xl font-bold text-white">{totalScore.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-2xl p-4 border border-pink-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-pink-400" />
              <div className="text-xs text-gray-400 uppercase">Max Combo</div>
            </div>
            <div className="text-2xl font-bold text-white">{maxCombo}x</div>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-2xl p-4 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-orange-400" />
              <div className="text-xs text-gray-400 uppercase">Accuracy</div>
            </div>
            <div className="text-2xl font-bold text-white">{averageAccuracy}%</div>
          </div>
        </div>

        {/* AI Vibe Score */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
          <p className="text-sm text-gray-400 mb-1">Vibe Check:</p>
          <p className="text-lg font-bold text-white italic">"{vibeScore}"</p>
        </div>

        {/* Setlist */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Your Setlist
          </h3>
          <p className="text-sm text-gray-400 mb-4">{setDescription}</p>
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <motion.div
                key={track.position}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {track.position}
                </div>
                <div className="text-white font-medium">{track.name}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
