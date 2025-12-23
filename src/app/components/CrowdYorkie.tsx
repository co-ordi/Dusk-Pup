import { motion } from 'motion/react';
import React from 'react';

interface CrowdYorkieProps {
  index: number;
  combo: number;
  isExcited?: boolean;
  variant?: 'sitting' | 'standing';
}

export function CrowdYorkie({ index, combo, isExcited = false, variant = 'standing' }: CrowdYorkieProps) {
  const getAnimationSpeed = () => {
    if (combo >= 20) return 0.3;
    if (combo >= 10) return 0.5;
    if (combo >= 5) return 0.7;
    return 1.2;
  };

  const bounceSpeed = getAnimationSpeed();
  const delay = (index * 0.1) % 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: isExcited ? [0, -8, 0] : [0, -4, 0],
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        y: {
          duration: isExcited ? 0.3 : bounceSpeed,
          repeat: Infinity,
          delay,
          ease: 'easeInOut',
        },
      }}
      className="absolute"
    >
      <svg width="50" height="60" viewBox="0 0 50 60" fill="none">
        {/* Yorkie body */}
        <ellipse 
          cx="25" 
          cy={variant === 'sitting' ? '45' : '42'} 
          rx="12" 
          ry={variant === 'sitting' ? '10' : '13'} 
          fill="#D97706" 
        />
        <ellipse 
          cx="25" 
          cy={variant === 'sitting' ? '45' : '42'} 
          rx="10" 
          ry={variant === 'sitting' ? '8' : '11'} 
          fill="#F59E0B" 
        />

        {/* Head */}
        <ellipse cx="25" cy="25" rx="13" ry="14" fill="#D97706" />
        <ellipse cx="25" cy="25" rx="11" ry="12" fill="#F59E0B" />

        {/* Ears */}
        <ellipse cx="17" cy="18" rx="4" ry="8" fill="#92400E" />
        <ellipse cx="33" cy="18" rx="4" ry="8" fill="#92400E" />

        {/* Eyes */}
        <circle cx="21" cy="24" r="2" fill="#1F2937" />
        <circle cx="29" cy="24" r="2" fill="#1F2937" />
        <circle cx="22" cy="23" r="0.8" fill="white" />
        <circle cx="30" cy="23" r="0.8" fill="white" />

        {/* Nose */}
        <ellipse cx="25" cy="28" rx="2.5" ry="2" fill="#1F2937" />

        {/* Paws - raised when excited */}
        {isExcited && (
          <>
            <motion.ellipse
              cx="18"
              cy="38"
              rx="3"
              ry="5"
              fill="#D97706"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            <motion.ellipse
              cx="32"
              cy="38"
              rx="3"
              ry="5"
              fill="#D97706"
              animate={{ rotate: [10, -10, 10] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </>
        )}

        {/* Accessories (random) */}
        {index % 3 === 0 && (
          <motion.circle
            cx="20"
            cy="20"
            r="1.5"
            fill="#EC4899"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        {index % 4 === 0 && (
          <rect x="15" y="30" width="20" height="2" rx="1" fill="#8B5CF6" opacity="0.7" />
        )}
      </svg>
    </motion.div>
  );
}
