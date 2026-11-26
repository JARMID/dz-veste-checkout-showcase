import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';

/**
 * Optical Liquid Glass Surface (Theme-Adaptive Web approximation inspired by Apple Liquid Glass & liquid-glass-js).
 * Combines frosted backdrop refraction, dual top/bottom specular Fresnel rim hairlines,
 * and a spring-damped pointer specular highlight (zero React re-renders on pointermove).
 */
export interface LiquidGlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  /** Disable interactive pointer glow inside Capture Mode */
  staticMode?: boolean;
  /** Accent specular tint */
  tint?: 'obsidian' | 'emerald' | 'crimson';
  /** Current visual theme */
  theme?: 'light' | 'dark';
}

export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  children,
  className = '',
  staticMode = false,
  tint = 'obsidian',
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.2);
  const springX = useSpring(rawX, { stiffness: 160, damping: 24, mass: 0.4 });
  const springY = useSpring(rawY, { stiffness: 160, damping: 24, mass: 0.4 });

  const isLight = theme === 'light';
  const tintColor =
    tint === 'emerald'
      ? isLight
        ? 'rgba(5, 150, 105, 0.14)'
        : 'rgba(16, 185, 129, 0.15)'
      : tint === 'crimson'
        ? isLight
          ? 'rgba(220, 38, 38, 0.14)'
          : 'rgba(239, 68, 68, 0.18)'
        : isLight
          ? 'rgba(255, 255, 255, 0.72)'
          : 'rgba(245, 245, 242, 0.11)';

  const spotlightBg = useMotionTemplate`radial-gradient(380px circle at ${springX}px ${springY}px, ${tintColor}, transparent 70%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (staticMode || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set(e.clientX - rect.left);
    rawY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={`liquid-glass-shell relative overflow-hidden ${className}`}
    >
      {/* Top optical Fresnel specular edge */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${
          isLight ? 'via-white' : 'via-white/35'
        }`}
      />
      {/* Spring-tracked specular highlight (Visitor Mode only) */}
      {!staticMode && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover/glass:opacity-100"
          style={{ background: spotlightBg }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * Spring-physics Magnetic Pill wrapper (Emil Kowalski / Design Spells micro-interaction).
 * Pulls gently toward cursor on desktop fine pointers without layout shift.
 */
export interface MagneticPillProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticPill: React.FC<MagneticPillProps> = ({
  children,
  className = '',
  strength = 0.22,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 20, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 280, damping: 20, mass: 0.35 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};
