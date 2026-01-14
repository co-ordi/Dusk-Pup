import React, { memo } from 'react';

const LANE_STYLE = [
  {
    label: 'A',
    bg: 'from-purple-600/70 to-purple-800/70',
    ring: 'ring-purple-300/40',
  },
  {
    label: 'S',
    bg: 'from-orange-500/70 to-orange-800/70',
    ring: 'ring-orange-300/40',
  },
  {
    label: 'K',
    bg: 'from-pink-500/70 to-pink-800/70',
    ring: 'ring-pink-300/40',
  },
  {
    label: 'L',
    bg: 'from-yellow-500/70 to-yellow-800/70',
    ring: 'ring-yellow-300/40',
  },
];

interface MobileControlsProps {
  isVisible: boolean;
  activeLanes: boolean[];
  onPress: (laneIndex: number) => void;
}

export const MobileControls = memo(function MobileControls({ isVisible, activeLanes, onPress }: MobileControlsProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-50 pointer-events-none"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
      }}
    >
      <div className="pointer-events-auto px-4">
        <div className="mx-auto max-w-xl grid grid-cols-4 gap-3">
          {LANE_STYLE.map((lane, idx) => {
            const isActive = !!activeLanes[idx];
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Lane ${lane.label}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPress(idx);
                }}
                className={[
                  'h-16 rounded-2xl select-none touch-none',
                  'bg-linear-to-b',
                  lane.bg,
                  'shadow-xl border border-white/10 backdrop-blur-md',
                  'ring-2',
                  lane.ring,
                  isActive ? 'scale-[1.03] brightness-125' : 'scale-100 brightness-100',
                  'active:scale-[0.98] transition-transform',
                ].join(' ')}
              >
                <div className="h-full flex items-center justify-center">
                  <span className="text-white/90 font-black text-xl drop-shadow">
                    {lane.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-center text-[10px] text-white/50">
          Tap A · S · K · L
        </div>
      </div>
    </div>
  );
});



