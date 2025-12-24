import { motion } from 'motion/react';
import React, { memo, useMemo } from 'react';

interface YorkieDJProps {
  mood: 'idle' | 'hit' | 'perfect' | 'miss';
}

export const YorkieDJ = memo(function YorkieDJ({ mood }: YorkieDJProps) {
  const moodAnimation = useMemo(() => {
    switch (mood) {
      case 'hit':
        return { 
          scale: [1, 1.14, 1], 
          y: [0, -22, 0],
          rotate: [0, -7, 7, 0],
          transition: { duration: 0.28 } 
        };
      case 'perfect':
        return {
          scale: [1, 1.3, 1.15, 1.3, 1],
          rotate: [0, 360],
          transition: { duration: 1.0, repeat: 0 }
        };
      case 'miss':
        return { 
          y: [0, 8, 0],
          scale: [1, 0.92, 1],
          transition: { duration: 0.45 } 
        };
      default:
        return {};
    }
  }, [mood]);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="relative"
        animate={moodAnimation}
      >
        {/* Main Yorkie Image */}
        <img
          src="/Yorkies/MainYorkie.png"
          alt="Yorkie DJ"
          width="240"
          height="240"
          className="drop-shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* DJ Decks beneath Yorkie */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          <div className="relative w-14 h-10 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-lg border-2 border-purple-500/50 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />
            <motion.div 
              className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg"
              animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
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
                transition={{ duration: 2.0, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-1 bg-gray-900 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-orange-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
