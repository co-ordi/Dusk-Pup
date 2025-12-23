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
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative">
            {/* Speech bubble tail pointing up */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-purple-600"></div>
            
            {/* Comment bubble */}
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl border-2 border-white/20">
              <p className="text-white font-bold text-lg whitespace-nowrap">
                {comment}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
