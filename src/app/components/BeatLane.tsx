import { motion, AnimatePresence } from 'motion/react';
import React, { useMemo, memo } from 'react';

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
  hitBeats?: Set<string>;
  fallDuration?: number; // Duration in ms for beats to fall
  onHit: (beatId: string, accuracy: number) => void;
}

const LANE_COLORS = [
  'from-purple-500 to-purple-700',
  'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700',
  'from-yellow-500 to-yellow-700',
];

const LANE_KEYS = ['A', 'S', 'K', 'L']; // Left: A, S | Right: K, L

export const BeatLane = memo(function BeatLane({ lane, beats, isActive, currentTime, hitBeats = new Set(), fallDuration = 2000, onHit }: BeatLaneProps) {
  const laneBeats = useMemo(() => beats.filter(b => b.lane === lane), [beats, lane]);
  const FALL_DURATION = fallDuration; // Duration scales with BPM
  const HIT_ZONE_THRESHOLD = 150; // ms window for hitting

  return (
    <div className="relative flex-1 h-full" style={{ contain: 'layout style paint', willChange: 'contents' }}>
      {/* Hit Zone */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-20 border-4 rounded-lg ${
          isActive ? 'border-white bg-white/20' : 'border-gray-600 bg-gray-800/40'
        } transition-all duration-150`}
        animate={
          isActive
            ? { scale: [1, 1.08, 1], rotate: [0, -1.2, 1.2, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={isActive ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.12, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl font-bold text-white">{LANE_KEYS[lane]}</span>
        </div>
      </motion.div>

      {/* Hit explosion effect */}
      <AnimatePresence>
        {Array.from(hitBeats).filter(beatId => laneBeats.some(b => b.id === beatId)).map(beatId => (
          <motion.div
            key={`hit-${beatId}`}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-20 h-20 pointer-events-none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${LANE_COLORS[lane]} blur-md`} style={{ filter: 'blur(8px)' }} />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Beats falling - using CSS transforms for better performance */}
      <AnimatePresence>
        {laneBeats.map(beat => {
          const elapsed = currentTime - beat.spawnTime;
          const progress = Math.min(elapsed / FALL_DURATION, 1);
          const topPercent = progress * 100;
          const isHit = hitBeats.has(beat.id);

          return (
            <motion.div
              key={beat.id}
              className={`absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br ${LANE_COLORS[lane]} shadow-lg border-2 border-white/50`}
              initial={{ opacity: 0, scale: 0.5, top: '-80px' }}
              animate={{ 
                opacity: isHit ? 0 : 1, 
                scale: isHit ? [1, 1.7, 0] : 1,
                top: `${topPercent}%`,
              }}
              exit={{ opacity: 0, scale: [1, 1.5, 0] }}
              transition={{ 
                duration: isHit ? 0.3 : 0,
                ease: isHit ? 'easeOut' : 'linear'
              }}
              style={{
                boxShadow: isHit ? '0 0 60px rgba(255, 255, 255, 1)' : '0 0 24px rgba(255, 255, 255, 0.55)',
                willChange: 'transform, top, opacity',
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
});
