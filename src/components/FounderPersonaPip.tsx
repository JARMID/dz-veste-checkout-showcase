import React from 'react';
import { clamp01, easeOutExpo, progressBetween } from '../engine/easing';
import type { TimelineFrameState } from '../engine/timeline';

export interface FounderPersonaPipProps {
  frame: TimelineFrameState;
  compact?: boolean;
  /** Keep scale/tilt tightly contained inside editorial cards (e.g. VisitorExperience theater) */
  contained?: boolean;
}

type PoseKey =
  | 'explaining'
  | 'vineboom'
  | 'laughing'
  | 'skeptical'
  | 'facepalm'
  | 'mindblown'
  | 'pointing'
  | 'coding'
  | 'boss'
  | 'shrug'
  | 'coffee'
  | 'shades';

const POSE_SRC: Record<PoseKey, string> = {
  explaining: '/persona/pose_01_explaining.png',
  vineboom: '/persona/pose_02_vineboom_shock.png',
  laughing: '/persona/pose_03_laughing_roast.png',
  skeptical: '/persona/pose_04_skeptical_squint.png',
  facepalm: '/persona/pose_05_facepalm_frustrated.png',
  mindblown: '/persona/pose_06_mindblown_eureka.png',
  pointing: '/persona/pose_07_pointing_screen.png',
  coding: '/persona/pose_08_coding_locked_in.png',
  boss: '/persona/pose_09_arms_crossed_boss.png',
  shrug: '/persona/pose_15_shrug_deadpan.png',
  coffee: '/persona/pose_17_sipping_coffee_unbothered.png',
  shades: '/persona/pose_18_cool_shades_smirk.png',
};

function selectPose(
  time: number,
  act: number
): { pose: PoseKey; badge: string; accent: 'neutral' | 'emerald' | 'crimson' } {
  if (act === 5) {
    return { pose: 'vineboom', badge: 'FAUX REÇU !', accent: 'crimson' };
  }
  if (act === 2) {
    return { pose: 'facepalm', badge: '9 CHAMPS', accent: 'crimson' };
  }
  if (act === 4 && time < 14.85) {
    return { pose: 'shrug', badge: 'CTA GRIS ?', accent: 'crimson' };
  }
  if (act === 3 || (act === 4 && time >= 14.85) || (act === 6 && time < 32.6)) {
    return { pose: 'coding', badge: 'LIVE CODE', accent: 'emerald' };
  }
  if (act === 6) {
    return { pose: 'shades', badge: '18 µs + 2s', accent: 'emerald' };
  }
  if (act === 7) {
    return { pose: 'boss', badge: '48H LIVE', accent: 'emerald' };
  }
  return { pose: 'explaining', badge: 'AUDIT COD', accent: 'neutral' };
}

/**
 * Deterministic 2D Editorial Vector-Comic Founder Reaction Cut-In (zero CSS animations, pure f(t)).
 * Uses Khalef's true-likeness broad-shouldered V2/V3 pack with clean cutout silhouette (zero coffee cup, no dark box cage).
 */
export const FounderPersonaPip: React.FC<FounderPersonaPipProps> = React.memo(
  ({ frame, compact = false, contained = false }) => {
    const { time, act, vineBoom } = frame;
    const { pose, badge, accent } = selectPose(time, act);

    const enterP = 0.92 + 0.08 * easeOutExpo(progressBetween(time, 0.0, 0.35));
    const bobY = contained ? Math.sin(time * 3.0) * 1.6 : Math.sin(time * 3.1) * 3.2;
    const boomBoost =
      act === 5 ? 1.0 + clamp01(vineBoom.impact) * (contained ? 0.08 : 0.2) : 1.0;
    const boomTilt = act === 5 ? vineBoom.shakeX * (contained ? 0.14 : 0.36) : 0;
    const boomShiftX = !contained && act === 5 && boomTilt > 0 ? -(boomTilt * 2.8) : 0;

    // Large, high-clarity 2D editorial cutout when on video capture stage; compact when inside VisitorExperience cards
    const sizePx = contained ? (compact ? 132 : 148) : compact ? 268 : 230;

    const tagBg =
      accent === 'crimson'
        ? '#dc2626'
        : accent === 'emerald'
          ? '#10b981'
          : '#0f172a';
    const tagFg = accent === 'emerald' ? '#04140d' : '#ffffff';

    return (
      <div
        className="pointer-events-none select-none"
        style={{
          opacity: enterP,
          transform: `translate3d(${boomShiftX.toFixed(1)}px, ${(bobY + (1 - enterP) * 16).toFixed(1)}px, 0) scale(${boomBoost.toFixed(4)}) rotate(${boomTilt.toFixed(3)}deg)`,
          transformOrigin: 'bottom right',
        }}
      >
        <div
          className="relative"
          style={{
            width: `${sizePx}px`,
            height: `${sizePx}px`,
            filter:
              accent === 'crimson'
                ? 'drop-shadow(0 16px 28px rgba(220,38,38,0.45)) drop-shadow(0 0 2px rgba(255,255,255,0.88))'
                : accent === 'emerald'
                  ? 'drop-shadow(0 16px 28px rgba(16,185,129,0.38)) drop-shadow(0 0 2px rgba(255,255,255,0.88))'
                  : 'drop-shadow(0 16px 28px rgba(0,0,0,0.58)) drop-shadow(0 0 2px rgba(255,255,255,0.88))',
          }}
        >
          <img
            src={POSE_SRC[pose]}
            alt="Khalef Abdelmadjid 2D Reaction"
            className="h-full w-full object-contain object-bottom"
          />
          <div
            className="absolute bottom-0.5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase shadow-lg"
            style={{
              background: tagBg,
              color: tagFg,
              border: '1.5px solid rgba(255,255,255,0.7)',
            }}
          >
            {badge}
          </div>
        </div>
      </div>
    );
  }
);

FounderPersonaPip.displayName = 'FounderPersonaPip';
