import { motion, AnimatePresence } from 'motion/react';
import React from 'react';

export interface Beat {
  id: string;
  lane: number;
  spawnTime: number;
}

interface BeatLaneProps {
  lane: number;
  beats: Beat[];
  isActive: boolean;
  currentTime: number;
  onHit: (beatId: string, accuracy: number) => void;
}

const LANE_COLORS = [
  'from-purple-500 to-purple-700',
  'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700',
  'from-yellow-500 to-yellow-700',
];

const LANE_KEYS = ['D', 'F', 'J', 'K'];

export function BeatLane({ lane, beats, isActive, currentTime, onHit }: BeatLaneProps) {
  const laneBeats = beats.filter(b => b.lane === lane);
  const FALL_DURATION = 2000; // 2 seconds to fall
  const HIT_ZONE_THRESHOLD = 150; // ms window for hitting

  return (
    <div className="relative flex-1 h-full">
      {/* Hit Zone */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-20 border-4 rounded-lg ${
          isActive ? 'border-white bg-white/20' : 'border-gray-600 bg-gray-800/40'
        } transition-all duration-150`}
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl font-bold text-white">{LANE_KEYS[lane]}</span>
        </div>
      </motion.div>

      {/* Beats falling */}
      <AnimatePresence>
        {laneBeats.map(beat => {
          const elapsed = currentTime - beat.spawnTime;
          const progress = Math.min(elapsed / FALL_DURATION, 1);

          return (
            <motion.div
              key={beat.id}
              className={`absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br ${LANE_COLORS[lane]} shadow-lg border-2 border-white/50`}
              initial={{ top: '-80px' }}
              animate={{ top: `${progress * 100}%` }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-white/30 to-transparent" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Lane guide line */}
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-gray-600 to-transparent opacity-30" />
    </div>
  );
}
