import { motion } from 'motion/react';
import React, { memo, useMemo } from 'react';

// Available yorkie images (excluding DJ.png)
const YORKIE_IMAGES = [
  '/Yorkies/MainYorkie.png',
  '/Yorkies/Subject.png',
  '/Yorkies/Subject copy.png',
  '/Yorkies/Subject copy 2.png',
  '/Yorkies/Subject copy 3.png',
  '/Yorkies/Subject copy 4.png',
];

interface CrowdYorkieProps {
  index: number;
  combo: number;
  isExcited?: boolean;
  variant?: 'sitting' | 'standing';
}

export const CrowdYorkie = memo(function CrowdYorkie({ index, combo, isExcited = false, variant = 'standing' }: CrowdYorkieProps) {
  const bounceSpeed = useMemo(() => {
    // Simplified bounce speeds for better performance
    if (combo >= 15) return 0.4;
    if (combo >= 8) return 0.6;
    return 1.5; // Slower default for performance
  }, [combo]);
  const delay = (index * 0.1) % 1;

  // Simplified dance flip timing for better performance
  const getFlipSpeed = () => {
    if (combo >= 15) return { min: 2.0, max: 3.5 }; // Moderate speed for good combos
    if (combo >= 8) return { min: 2.5, max: 4.0 }; // Medium speed for decent combos
    return { min: 3.0, max: 4.5 }; // Slow for low combos
  };

  const flipSpeed = getFlipSpeed();
  const flipDelay = useMemo(() => Math.random() * 2 + 1, []); // 1-3 seconds initial delay
  const flipDuration = useMemo(() => Math.random() * (flipSpeed.max - flipSpeed.min) + flipSpeed.min, [combo]);

  // Select yorkie image based on index
  const yorkieImage = YORKIE_IMAGES[index % YORKIE_IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: isExcited ? [0, -12, 0] : [0, -6, 0],
        scaleX: [1, -1, 1], // Mirror flip dance animation
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        y: {
          duration: isExcited ? 0.26 : bounceSpeed * 0.9,
          repeat: Infinity,
          delay,
          ease: 'easeInOut',
        },
        scaleX: {
          duration: flipDuration,
          repeat: Infinity,
          delay: flipDelay,
          ease: 'easeInOut',
        },
      }}
      className="relative"
      style={{ display: 'block' }}
    >
      <img
        src={yorkieImage}
        alt={`Crowd Yorkie ${index}`}
        width="40"
        height="48"
        style={{
          imageRendering: 'pixelated',
          filter: isExcited ? 'brightness(1.2) saturate(1.3)' : 'none'
        }}
      />
    </motion.div>
  );
});
