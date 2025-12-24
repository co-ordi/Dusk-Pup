import { motion, AnimatePresence } from 'motion/react';
import React from 'react';

interface AICommentBoxProps {
  comment: string | null;
}

export function AICommentBox({ comment }: AICommentBoxProps) {
  return (
    <AnimatePresence>
      {comment && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-4 right-4 z-50 pointer-events-none"
        >
          {/* Comment bubble (compact) */}
          <div className="max-w-[220px] px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl border border-white/15">
            <p className="text-white font-semibold text-xs leading-snug">
              {comment}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
