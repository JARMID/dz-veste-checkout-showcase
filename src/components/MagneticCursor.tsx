import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export interface MagneticCursorProps {
  theme?: 'light' | 'dark';
}

/**
 * Restrained Awwwards Fine-Pointer Cursor (Visitor Mode desktop only).
 * Driven exclusively via Motion useMotionValue + useSpring (zero useState on pointermove).
 * Only expands into a crisp pill badge over elements declaring `data-cursor="LABEL"`.
 */
export const MagneticCursor: React.FC<MagneticCursorProps> = ({ theme = 'dark' }) => {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 360, damping: 30, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 360, damping: 30, mass: 0.35 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let currentLabel: string | null = null;
    let isShown = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!isShown) {
        isShown = true;
        setVisible(true);
      }
      const target = e.target as HTMLElement | null;
      const cursorEl = target?.closest<HTMLElement>('[data-cursor]');
      const nextLabel = cursorEl?.getAttribute('data-cursor') || null;
      if (nextLabel !== currentLabel) {
        currentLabel = nextLabel;
        setLabel(nextLabel);
      }
    };

    const onLeave = () => {
      isShown = false;
      setVisible(false);
      currentLabel = null;
      setLabel(null);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [rawX, rawY]);

  if (!enabled) return null;

  const isLight = theme === 'light';

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 hidden md:flex items-center justify-center"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: label ? 1 : 0.42,
      }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
    >
      {label ? (
        <div
          className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md shadow-xl ${
            isLight
              ? 'border-[#09090b]/20 bg-[#09090b]/92 text-[#f5f5f2]'
              : 'border-white/25 bg-[#0a0b0f]/90 text-[#f5f5f2]'
          }`}
        >
          {label}
        </div>
      ) : (
        <div
          className={`h-4 w-4 rounded-full border ${
            isLight
              ? 'border-[#09090b]/75 bg-[#09090b]/15'
              : 'border-[#f5f5f2]/75 bg-[#f5f5f2]/20'
          }`}
        />
      )}
    </motion.div>
  );
};
