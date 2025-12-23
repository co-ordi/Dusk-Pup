import { motion } from 'motion/react';
import React from 'react';

interface SunsetTimerProps {
  progress: number; // 0 to 1
}

export function SunsetTimer({ progress }: SunsetTimerProps) {
  // Interpolate colors from day to dusk
  const getGradientColors = () => {
    const percentage = progress * 100;
    return {
      from: percentage < 50 ? '#F59E0B' : '#8B5CF6',
      via: percentage < 50 ? '#EC4899' : '#DB2777',
      to: '#1F2937',
    };
  };

  const colors = getGradientColors();

  return (
    <div className="w-full px-8 py-4">
      <div className="relative w-full h-6 bg-gray-800/50 rounded-full overflow-hidden border-2 border-gray-700">
        {/* Progress bar with gradient */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`,
            width: `${progress * 100}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Sun/Moon icon */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 border-2 border-white shadow-lg"
          style={{
            left: `calc(${progress * 100}% - 16px)`,
          }}
          animate={{
            boxShadow: progress > 0.8 
              ? '0 0 20px rgba(139, 92, 246, 0.8)' 
              : '0 0 20px rgba(251, 191, 36, 0.8)',
          }}
        >
          {progress > 0.8 && (
            <div className="absolute inset-1 rounded-full bg-purple-400/50" />
          )}
        </motion.div>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white mix-blend-difference">
            {Math.floor(progress * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
