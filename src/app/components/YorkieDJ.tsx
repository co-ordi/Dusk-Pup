import { motion } from 'motion/react';
import React from 'react';

interface YorkieDJProps {
  mood: 'idle' | 'hit' | 'perfect' | 'miss';
}

export function YorkieDJ({ mood }: YorkieDJProps) {
  const getMoodAnimation = () => {
    switch (mood) {
      case 'hit':
        return { 
          scale: [1, 1.1, 1], 
          y: [0, -15, 0],
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.3 } 
        };
      case 'perfect':
        return { 
          rotate: [0, -8, 8, -8, 8, 0], 
          scale: [1, 1.2, 1.15, 1.2, 1],
          y: [0, -20, -10, -15, 0],
          transition: { duration: 1, repeat: 0 } 
        };
      case 'miss':
        return { 
          y: [0, 5, 0],
          scale: [1, 0.95, 1],
          transition: { duration: 0.5 } 
        };
      default:
        return { 
          y: [0, -10, 0],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } 
        };
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="relative"
        animate={getMoodAnimation()}
      >
        {/* Yorkie Character - More realistic */}
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="furGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* DJ Headphones */}
          <ellipse cx="75" cy="95" rx="12" ry="18" fill="#1F2937" stroke="#8B5CF6" strokeWidth="2" />
          <ellipse cx="165" cy="95" rx="12" ry="18" fill="#1F2937" stroke="#8B5CF6" strokeWidth="2" />
          <path
            d="M 75 80 Q 120 60 165 80"
            stroke="#8B5CF6"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="75" cy="95" r="8" fill="#A855F7" opacity="0.5" />
          <circle cx="165" cy="95" r="8" fill="#A855F7" opacity="0.5" />

          {/* Body - layered for depth */}
          <ellipse cx="120" cy="160" rx="50" ry="55" fill="url(#bodyGradient)" />
          <ellipse cx="120" cy="160" rx="45" ry="50" fill="url(#furGradient)" opacity="0.7" />
          
          {/* Fur texture lines */}
          <path d="M 85 140 Q 90 145 85 150" stroke="#D97706" strokeWidth="1" opacity="0.3" />
          <path d="M 155 140 Q 150 145 155 150" stroke="#D97706" strokeWidth="1" opacity="0.3" />
          <path d="M 100 155 Q 105 160 100 165" stroke="#D97706" strokeWidth="1" opacity="0.3" />

          {/* Head */}
          <ellipse cx="120" cy="100" rx="55" ry="60" fill="url(#bodyGradient)" />
          <ellipse cx="120" cy="100" rx="50" ry="55" fill="url(#furGradient)" opacity="0.8" />

          {/* Ears - more realistic shape */}
          <motion.g
            animate={mood === 'miss' ? { rotate: -15 } : mood === 'perfect' ? { rotate: [0, 5, -5, 0] } : { rotate: 0 }}
            style={{ transformOrigin: '70px 75px' }}
            transition={{ duration: 0.5 }}
          >
            <ellipse cx="70" cy="75" rx="18" ry="30" fill="#92400E" />
            <ellipse cx="70" cy="75" rx="14" ry="26" fill="#B45309" />
            <ellipse cx="70" cy="75" rx="10" ry="22" fill="#F59E0B" opacity="0.5" />
          </motion.g>
          
          <motion.g
            animate={mood === 'miss' ? { rotate: 15 } : mood === 'perfect' ? { rotate: [0, -5, 5, 0] } : { rotate: 0 }}
            style={{ transformOrigin: '170px 75px' }}
            transition={{ duration: 0.5 }}
          >
            <ellipse cx="170" cy="75" rx="18" ry="30" fill="#92400E" />
            <ellipse cx="170" cy="75" rx="14" ry="26" fill="#B45309" />
            <ellipse cx="170" cy="75" rx="10" ry="22" fill="#F59E0B" opacity="0.5" />
          </motion.g>

          {/* Facial hair/beard detail */}
          <ellipse cx="120" cy="110" rx="35" ry="25" fill="#FCD34D" opacity="0.6" />

          {/* Eyes - expressive */}
          <motion.g
            animate={mood === 'perfect' ? { scale: [1, 1.4, 1] } : {}}
            style={{ transformOrigin: '95px 95px' }}
          >
            <ellipse cx="95" cy="95" rx="8" ry="10" fill="#1F2937" />
            <circle cx="97" cy="93" r="3" fill="white" />
            <circle cx="95" cy="95" r="1.5" fill="#60A5FA" opacity="0.5" />
          </motion.g>
          
          <motion.g
            animate={mood === 'perfect' ? { scale: [1, 1.4, 1] } : {}}
            style={{ transformOrigin: '145px 95px' }}
          >
            <ellipse cx="145" cy="95" rx="8" ry="10" fill="#1F2937" />
            <circle cx="147" cy="93" r="3" fill="white" />
            <circle cx="145" cy="95" r="1.5" fill="#60A5FA" opacity="0.5" />
          </motion.g>

          {/* Nose - triangular and shiny */}
          <path d="M 120 108 L 115 115 L 125 115 Z" fill="#1F2937" />
          <ellipse cx="120" cy="112" rx="6" ry="4" fill="#374151" />
          <circle cx="119" cy="111" r="1.5" fill="white" opacity="0.7" />

          {/* Mouth */}
          <motion.path
            d={mood === 'perfect' ? "M 105 118 Q 120 128 135 118" : "M 108 120 Q 120 125 132 120"}
            stroke="#1F2937"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <line x1="120" y1="115" x2="120" y2="120" stroke="#1F2937" strokeWidth="2" />

          {/* Tongue (when happy) */}
          {mood === 'perfect' && (
            <motion.ellipse
              cx="120"
              cy="125"
              rx="8"
              ry="5"
              fill="#EC4899"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {/* Tail - wagging when happy */}
          <motion.path
            d="M 160 180 Q 180 170 185 160"
            stroke="#D97706"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            animate={
              mood === 'hit' || mood === 'perfect'
                ? { rotate: [0, 20, -10, 15, 0] }
                : { rotate: 0 }
            }
            style={{ transformOrigin: '160px 180px' }}
            transition={{ duration: 0.5, repeat: mood === 'perfect' ? Infinity : 0 }}
          />

          {/* Sparkles on perfect hit */}
          {mood === 'perfect' && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={60 + Math.cos(i * Math.PI / 4) * 80}
                  cy={100 + Math.sin(i * Math.PI / 4) * 80}
                  r="4"
                  fill="#FCD34D"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1.5, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              ))}
            </>
          )}
        </svg>

        {/* DJ Decks beneath Yorkie */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          <div className="relative w-14 h-10 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-lg border-2 border-purple-500/50 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />
            <motion.div 
              className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-1 bg-gray-900 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </div>
          
          <div className="relative w-14 h-10 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-lg border-2 border-orange-500/50 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent" />
            <motion.div 
              className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full shadow-lg"
              animate={{ rotate: -360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-1 bg-gray-900 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-orange-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
