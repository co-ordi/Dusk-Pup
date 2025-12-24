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
      <div className="absolute bottom-0 w-96 h-32 bg-linear-to-t from-gray-900 via-gray-800 to-gray-700 rounded-t-2xl border-4 border-purple-600/50 shadow-2xl">
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
          className="absolute -top-32 left-1/2 -translate-x-1/2"
          animate={{
            y: energyLevel === 'max' ? [0, -7, 0] : energyLevel === 'high' ? [0, -4, 0] : energyLevel === 'medium' ? [0, -2, 0] : 0,
          }}
          transition={{
            duration: energyLevel === 'max' ? 0.32 : energyLevel === 'high' ? 0.48 : 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            {/* Body - Bomber jacket */}
            <motion.ellipse
              cx="70"
              cy="110"
              rx="35"
              ry="30"
              fill="url(#jacketGradient)"
              animate={isHesitant ? { scale: [1, 0.96, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            
            {/* Arms - animated */}
            <motion.g
              animate={{
                rotate: energyLevel === 'max' ? [-8, 8, -8] : energyLevel === 'high' ? [-5, 5, -5] : [-3, 3, -3],
              }}
              transition={{
                duration: energyLevel === 'max' ? 0.42 : 0.85,
                repeat: Infinity,
              }}
              style={{ transformOrigin: '50px 90px' }}
            >
              <ellipse cx="45" cy="105" rx="8" ry="20" fill="#D97706" />
              <ellipse cx="45" cy="105" rx="6" ry="18" fill="#F59E0B" />
            </motion.g>
            
            <motion.g
              animate={{
                rotate: energyLevel === 'max' ? [8, -8, 8] : energyLevel === 'high' ? [5, -5, 5] : [3, -3, 3],
              }}
              transition={{
                duration: energyLevel === 'max' ? 0.42 : 0.85,
                repeat: Infinity,
                delay: 0.18,
              }}
              style={{ transformOrigin: '90px 90px' }}
            >
              <ellipse cx="95" cy="105" rx="8" ry="20" fill="#D97706" />
              <ellipse cx="95" cy="105" rx="6" ry="18" fill="#F59E0B" />
            </motion.g>

            {/* Neck */}
            <rect x="63" y="65" width="14" height="15" rx="7" fill="#D97706" />

            {/* Head */}
            <ellipse cx="70" cy="50" rx="25" ry="28" fill="#F59E0B" />
            
            {/* Hair - curly */}
            <g>
              {/* Curly hair strands */}
              <motion.circle
                cx="50"
                cy="35"
                r="12"
                fill="#1F2937"
                animate={{ y: energyLevel === 'high' || energyLevel === 'max' ? [0, -2, 0] : 0 }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <circle cx="70" cy="28" r="14" fill="#1F2937" />
              <circle cx="90" cy="35" r="12" fill="#1F2937" />
              <circle cx="60" cy="30" r="10" fill="#1F2937" />
              <circle cx="80" cy="32" r="11" fill="#1F2937" />
              
              {/* Bun/ponytail */}
              <ellipse cx="70" cy="25" rx="20" ry="15" fill="#1F2937" />
              <motion.ellipse
                cx="70"
                cy="20"
                rx="15"
                ry="12"
                fill="#374151"
                animate={{
                  y: energyLevel === 'max' ? [0, -3, 0] : energyLevel === 'high' ? [0, -2, 0] : 0,
                }}
                transition={{ duration: 0.42, repeat: Infinity }}
              />
            </g>

            {/* Face */}
            <ellipse cx="62" cy="48" rx="3" ry="4" fill="#1F2937" />
            <ellipse cx="78" cy="48" rx="3" ry="4" fill="#1F2937" />
            
            {/* Smile */}
            <motion.path
              d={
                isPerfectHit || combo >= 10
                  ? "M 60 58 Q 70 65 80 58"
                  : isHesitant
                  ? "M 60 60 Q 70 58 80 60"
                  : "M 60 60 Q 70 62 80 60"
              }
              stroke="#1F2937"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Headphones */}
            <ellipse cx="48" cy="50" rx="6" ry="10" fill="#8B5CF6" />
            <ellipse cx="92" cy="50" rx="6" ry="10" fill="#8B5CF6" />
            <path
              d="M 48 40 Q 70 30 92 40"
              stroke="#8B5CF6"
              strokeWidth="4"
              fill="none"
            />

            {/* Jacket details */}
            <line x1="70" y1="95" x2="70" y2="110" stroke="#374151" strokeWidth="2" />
            
            {/* Celebratory gesture on perfect hit */}
            {isPerfectHit && (
              <motion.g
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <text x="100" y="80" fontSize="20" fill="#FCD34D">✨</text>
              </motion.g>
            )}

            <defs>
              <linearGradient id="jacketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>
    </div>
  );
});
