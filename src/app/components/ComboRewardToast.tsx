import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

export type ComboRewardVariant = 0 | 1 | 2;

interface ComboRewardToastProps {
  reward: { combo: number; id: string; variant: ComboRewardVariant } | null;
}

export function ComboRewardToast({ reward }: ComboRewardToastProps) {
  const variant: ComboRewardVariant = reward?.variant ?? 0;

  const theme = (() => {
    switch (variant) {
      case 1:
        return {
          flash:
            'radial-gradient(circle at 30% 40%, rgba(251,146,60,0.22) 0%, rgba(236,72,153,0.18) 38%, rgba(0,0,0,0) 70%)',
          accent:
            'radial-gradient(circle at 50% 50%, rgba(251,146,60,0.32) 0%, rgba(236,72,153,0.20) 35%, rgba(0,0,0,0) 70%)',
          chip: 'Vibe Reward',
        };
      case 2:
        return {
          flash:
            'radial-gradient(circle at 70% 55%, rgba(139,92,246,0.22) 0%, rgba(59,130,246,0.14) 40%, rgba(0,0,0,0) 70%)',
          accent:
            'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.32) 0%, rgba(59,130,246,0.18) 35%, rgba(0,0,0,0) 70%)',
          chip: 'Combo Spark',
        };
      default:
        return {
          flash:
            'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.18) 0%, rgba(139,92,246,0.14) 40%, rgba(0,0,0,0) 70%)',
          accent:
            'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.30) 0%, rgba(139,92,246,0.18) 35%, rgba(0,0,0,0) 70%)',
          chip: 'Combo Drop',
        };
    }
  })();

  return (
    <AnimatePresence>
      {reward && (
        <>
          {/* Ambient flash layer (varies per trigger, consistent theme) */}
          <motion.div
            key={`${reward.id}-flash`}
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{ background: theme.flash }}
          />

          <motion.div
            key={reward.id}
            className="fixed inset-x-0 top-[42%] z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, y: 18, scale: 0.92, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, scale: 0.92, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: theme.accent,
                  transform: 'scale(1.4)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />

              {/* Card */}
              <motion.div
                className="relative px-5 py-3 rounded-2xl border border-white/15 bg-black/35 backdrop-blur-md shadow-2xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
              >
                <div
                  className="text-[10px] font-black uppercase tracking-[0.45em] text-white/80 text-center"
                  style={{ textShadow: '0 0 16px rgba(236,72,153,0.35)' }}
                >
                  {theme.chip}
                </div>
                <div
                  className="mt-1 text-lg sm:text-xl font-black tracking-tight text-center bg-clip-text text-transparent bg-linear-to-r from-purple-200 via-pink-300 to-orange-300"
                  style={{ textShadow: '0 0 24px rgba(139,92,246,0.35)' }}
                >
                  x{reward.combo}
                </div>
                <div className="mt-0.5 text-[11px] text-white/70 text-center">
                  Reward SFX unlocked
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


