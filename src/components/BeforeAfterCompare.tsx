import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowsLeftRight } from '@phosphor-icons/react';
import { AvantCheckoutView } from './AvantCheckoutView';
import { ApresStorefrontView } from './ApresStorefrontView';

export interface BeforeAfterCompareProps {
  /** When provided (0..1), renders deterministic GPU clip-path curtain reveal for Act 7 (zero motion/react!) */
  deterministicWipe?: number;
  /** Deterministic pulse intensity for Capture Mode */
  deterministicPulse?: number;
  /** Deterministic Ken Burns progress (0..1) on Act 7 jacket showcase */
  heroKenBurns?: number;
  /** Compact mode for 9:16 Capture Stage */
  compact?: boolean;
  /** Visual surface theme for interactive Visitor Mode */
  theme?: 'light' | 'dark';
}

/**
 * Interactive zero-re-render GPU drag comparator (Visitor Mode only) using Motion values.
 * Zero React useState updates during pointermove; divider moves via GPU transform: translate3d.
 */
const InteractiveBeforeAfterSplit: React.FC<{ compact?: boolean; theme?: 'light' | 'dark' }> = ({
  compact = false,
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [ariaVal, setAriaVal] = useState(50);

  const rawPct = useMotionValue(50);
  const smoothPct = useSpring(rawPct, { stiffness: 320, damping: 32, mass: 0.45 });
  const clipRight = useTransform(smoothPct, (v) => 100 - v);
  const clipPath = useMotionTemplate`inset(0 ${clipRight}% 0 0)`;
  const dividerX = useTransform(smoothPct, (v) => `${v}%`);

  const setFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(4, Math.min(96, ((clientX - rect.left) / Math.max(1, rect.width)) * 100));
    rawPct.set(pct);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setAriaVal(Math.round(rawPct.get()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = Math.max(4, rawPct.get() - 5);
      rawPct.set(next);
      setAriaVal(Math.round(next));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(96, rawPct.get() + 5);
      rawPct.set(next);
      setAriaVal(Math.round(next));
    }
  };

  return (
    <div
      ref={containerRef}
      data-cursor="DRAG"
      className="relative w-full overflow-hidden rounded-[26px] select-none cursor-ew-resize touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Base Layer: Finished Luxury Apres Storefront */}
      <div className="w-full">
        <ApresStorefrontView compact={compact} interactive={false} forceVerified theme={theme} />
      </div>

      {/* Clipped Overlay Layer: Legacy Cluttered Avant COD Page (zero-reflow GPU clip-path) */}
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px] bg-[#f3f4f6]"
        style={{ clipPath }}
      >
        <AvantCheckoutView compact={compact} interactive={false} marqueeOffsetPx={0} blinkOn />
        <div className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 font-mono text-[11px] font-bold uppercase text-white shadow-lg">
          Avant · Page COD
        </div>
      </motion.div>

      <div className="pointer-events-none absolute top-3 right-3 rounded-full border border-emerald-400/40 bg-[#060607]/90 px-3 py-1 font-mono text-[11px] font-bold uppercase text-emerald-300 shadow-lg">
        Après · JARMID
      </div>

      {/* Compositor-Only Divider Handle (uses percentage translate on full-width overlay wrapper) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{ x: dividerX }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Comparer Avant et Après"
          aria-valuemin={4}
          aria-valuemax={96}
          aria-valuenow={ariaVal}
          onKeyDown={handleKeyDown}
          className="pointer-events-auto relative h-full w-[2px] -translate-x-1/2 bg-[#f5f5f2] shadow-[0_0_24px_rgba(245,245,242,0.85)]"
        >
          <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-[#060607]/90 text-[#f5f5f2] backdrop-blur-md shadow-2xl">
            <ArrowsLeftRight size={19} weight="bold" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const BeforeAfterCompare: React.FC<BeforeAfterCompareProps> = React.memo(
  ({
    deterministicWipe,
    deterministicPulse,
    heroKenBurns = 0,
    compact = false,
    theme = 'dark',
  }) => {
    // Visitor Interactive Split Mode
    if (typeof deterministicWipe !== 'number') {
      return <InteractiveBeforeAfterSplit compact={compact} theme={theme} />;
    }

    // Deterministic Capture & Playback Mode (zero motion/react runtime!)
    const splitPct = Math.max(0, Math.min(100, (1 - deterministicWipe) * 100));

    return (
      <div className="relative w-full overflow-hidden rounded-[26px] select-none">
        {/* Base Layer: Finished Luxury Apres Storefront with Ken Burns on jacket */}
        <div className="w-full">
          <ApresStorefrontView
            compact={compact}
            interactive={false}
            deterministicPulse={deterministicPulse}
            heroKenBurns={heroKenBurns}
            forceVerified
          />
        </div>

        {/* Clipped Overlay Layer: Legacy Cluttered Avant COD Page */}
        {splitPct > 0.2 && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px] bg-[#f3f4f6]"
            style={{
              clipPath: `inset(0 ${100 - splitPct}% 0 0)`,
            }}
          >
            <AvantCheckoutView compact={compact} interactive={false} marqueeOffsetPx={0} blinkOn />
            <div className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 font-mono text-[11px] font-bold uppercase text-white shadow-lg">
              Avant · Page COD
            </div>
          </div>
        )}

        {splitPct > 4 && splitPct < 96 && (
          <div className="pointer-events-none absolute top-3 right-3 rounded-full border border-emerald-400/40 bg-[#060607]/90 px-3 py-1 font-mono text-[11px] font-bold uppercase text-emerald-300 shadow-lg">
            Après · JARMID
          </div>
        )}

        {/* Luminous Emerald-White Laser Curtain Beam */}
        {splitPct > 0.5 && splitPct < 99.5 && (
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ transform: `translate3d(${splitPct}%, 0, 0)` }}
          >
            <div className="relative h-full w-[2px] -translate-x-1/2 bg-[#f5f5f2] shadow-[0_0_28px_rgba(16,185,129,0.9),0_0_12px_rgba(255,255,255,0.9)]">
              <div
                className="absolute inset-y-0 left-0 w-16"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 100%)',
                }}
              />
              <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-400/60 bg-[#060607] text-[#f5f5f2] shadow-2xl">
                <ArrowsLeftRight size={18} weight="bold" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

BeforeAfterCompare.displayName = 'BeforeAfterCompare';
