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
    if (combo >= 20) return 0.3;
    if (combo >= 10) return 0.5;
    if (combo >= 5) return 0.7;
    return 1.2;
  }, [combo]);
  const delay = (index * 0.1) % 1;

  // Select yorkie image based on index
  const yorkieImage = YORKIE_IMAGES[index % YORKIE_IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: isExcited ? [0, -12, 0] : [0, -6, 0],
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
