import { motion } from 'motion/react';
import React, { memo } from 'react';

interface FemaleDJProps {
  combo: number;
  missStreak: number;
  isPerfectHit: boolean;
}

export const FemaleDJ = memo(function FemaleDJ({ combo, missStreak, isPerfectHit }: FemaleDJProps) {
  // Determine animation intensity based on combo
  const getEnergyLevel = () => {
    if (combo >= 20) return 'max';
    if (combo >= 10) return 'high';
    if (combo >= 5) return 'medium';
    return 'low';
  };

  const energyLevel = getEnergyLevel();
  const isHesitant = missStreak >= 3;

  return (
    <div className="relative w-full h-48 flex items-end justify-center">
      {/* DJ Booth */}
      <div className="absolute bottom-0 w-full max-w-sm h-32 bg-linear-to-t from-gray-900 via-gray-800 to-gray-700 rounded-t-2xl border-4 border-purple-600/50 shadow-2xl mx-auto">
        {/* Equipment details */}
        <div className="absolute top-2 left-4 right-4 flex gap-2">
          <div className="flex-1 h-2 bg-purple-600 rounded-full shadow-inner" />
          <div className="flex-1 h-2 bg-pink-600 rounded-full shadow-inner" />
          <div className="flex-1 h-2 bg-orange-600 rounded-full shadow-inner" />
        </div>
        
        {/* Mixer knobs */}
        <div className="absolute top-6 left-4 right-4 flex gap-3 justify-center">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full bg-linear-to-br from-gray-600 to-gray-800 border border-purple-400"
              animate={{ rotate: energyLevel === 'max' ? [0, 30, -30, 0] : energyLevel === 'high' ? [0, 12, -12, 0] : 0 }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.16 }}
            />
          ))}
        </div>

        {/* DJ Character */}
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2"
          animate={{
            y: energyLevel === 'max' ? [0, -7, 0] : energyLevel === 'high' ? [0, -4, 0] : energyLevel === 'medium' ? [0, -2, 0] : 0,
          }}
          transition={{
            duration: energyLevel === 'max' ? 0.32 : energyLevel === 'high' ? 0.48 : 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* DJ Character Image */}
          <motion.img
            src="/Yorkies/DJ.png"
            alt="Female DJ"
            width="140"
            height="140"
            style={{
              imageRendering: 'pixelated',
              filter: isPerfectHit ? 'brightness(1.2) saturate(1.3) drop-shadow(0 0 8px #FCD34D)' :
                     isHesitant ? 'brightness(0.9) saturate(0.8)' : 'none'
            }}
            animate={{
              scale: isHesitant ? [1, 0.96, 1] : 1,
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Subtle smile indicator overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: isPerfectHit || combo >= 10 ? 0.3 :
                      isHesitant ? 0.1 : 0.2
            }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(circle at 70px 85px,
                ${isPerfectHit || combo >= 10 ? 'rgba(252, 211, 77, 0.4)' :
                  isHesitant ? 'rgba(239, 68, 68, 0.2)' :
                  'rgba(34, 197, 94, 0.3)'} 0%,
                transparent 40%)`,
              borderRadius: '50%',
              width: '140px',
              height: '140px',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
});
