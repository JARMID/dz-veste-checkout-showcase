import React from 'react';
import { clamp01, easeInOutCubic, easeOutCubic, lerp, progressBetween } from '../engine/easing';

export interface OversizedCursorProps {
  time: number;
  viewport: '9x16' | '16x9';
}

interface CursorPose {
  xPct: number;
  yPct: number;
  /** Velocity-driven heading tilt in degrees (motionmaxxing curved-arc cursor law) */
  rotateDeg: number;
  /** Asymmetric 1:2 tap press scale pivoted on arrow tip (0.82 .. 1.0) */
  scale: number;
  /** Click ripple ring progress (0 = hidden, 0..1 = expanding ring) */
  ripple: number;
  rippleColor: string;
  visible: boolean;
}

function computeTap(t: number, clickT: number): { scale: number; ripple: number } {
  if (t < clickT || t > clickT + 0.44) return { scale: 1, ripple: 0 };
  const dt = t - clickT;
  let scale = 1;
  if (dt < 0.08) {
    scale = lerp(1, 0.81, dt / 0.08);
  } else if (dt < 0.25) {
    scale = lerp(0.81, 1, easeOutCubic((dt - 0.08) / 0.17));
  }
  const ripple = clamp01(dt / 0.4);
  return { scale, ripple };
}

/**
 * Curved parabolic arc interpolation between two points with natural heading lean
 * (eliminates robotic straight-line mouse-macro motion per motionmaxxing ui-demo.md 2.3).
 */
function arcGlide(
  from: { x: number; y: number },
  to: { x: number; y: number },
  p: number,
  arcLiftY: number
): { x: number; y: number; rot: number } {
  const sinArc = Math.sin(p * Math.PI);
  const x = lerp(from.x, to.x, p);
  const y = lerp(from.y, to.y, p) + sinArc * arcLiftY;
  const dir = to.x >= from.x ? 1 : -1;
  const rot = sinArc * dir * 11.5;
  return { x, y, rot };
}

export function computeCursorPose(t: number, viewport: '9x16' | '16x9'): CursorPose {
  const isV = viewport === '9x16';

  const formEntry = isV ? { x: 54, y: 114 } : { x: 36, y: 114 };
  const formInspect = isV ? { x: 58, y: 50 } : { x: 43, y: 52 };
  const formTarget = isV ? { x: 46, y: 42 } : { x: 31, y: 44 };
  const safePark = isV ? { x: 88, y: 69 } : { x: 48, y: 29 };
  const ctaTarget = isV ? { x: 50, y: 58 } : { x: 32, y: 74 };
  const baridiTarget = isV ? { x: 44, y: 51 } : { x: 28, y: 65 };
  const securityTarget = isV ? { x: 48, y: 51 } : { x: 31, y: 64 };
  const exitPoint = { x: 112, y: 112 };

  if (t < 1.35 || t > 36.7) {
    return {
      xPct: formEntry.x,
      yPct: 114,
      rotateDeg: 0,
      scale: 1,
      ripple: 0,
      rippleColor: '#f5f5f2',
      visible: false,
    };
  }

  let xPct = formTarget.x;
  let yPct = formTarget.y;
  let rotateDeg = 0;
  let rippleColor = '#10b981';

  if (t < 5.48) {
    const p = easeOutCubic(progressBetween(t, 1.35, 2.45));
    const g = arcGlide(formEntry, formInspect, p, -5);
    xPct = g.x;
    yPct = g.y;
    rotateDeg = g.rot;
  } else if (t < 9.21) {
    const p = easeInOutCubic(progressBetween(t, 5.5, 6.4));
    const g = arcGlide(formInspect, formTarget, p, 4.5);
    xPct = g.x;
    yPct = g.y;
    rotateDeg = g.rot;
  } else if (t < 12.67) {
    const p = easeOutCubic(progressBetween(t, 9.6, 10.4));
    const g = arcGlide(formTarget, safePark, p, -5.5);
    xPct = g.x;
    yPct = g.y;
    rotateDeg = g.rot;
    rippleColor = '#10b981';
  } else if (t < 15.1) {
    const p = easeInOutCubic(progressBetween(t, 12.75, 13.75));
    const g = arcGlide(safePark, ctaTarget, p, 7);
    xPct = g.x;
    yPct = g.y;
    rotateDeg = g.rot;
  } else if (t < 22.03) {
    const p = easeOutCubic(progressBetween(t, 15.6, 16.5));
    const g = arcGlide(ctaTarget, safePark, p, -6);
    xPct = g.x;
    yPct = g.y;
    rotateDeg = g.rot;
    rippleColor = '#f5f5f2';
  } else if (t < 28.45) {
    if (t < 22.58) {
      const p = easeOutCubic(progressBetween(t, 22.03, 22.52));
      const g = arcGlide(safePark, baridiTarget, p, 5);
      xPct = g.x;
      yPct = g.y;
      rotateDeg = g.rot;
    } else {
      const p = easeOutCubic(progressBetween(t, 23.15, 24.0));
      const g = arcGlide(baridiTarget, safePark, p, -5);
      xPct = g.x;
      yPct = g.y;
      rotateDeg = g.rot;
    }
    rippleColor = '#ef4444';
  } else if (t < 35.7) {
    if (t < 28.95) {
      const p = easeOutCubic(progressBetween(t, 28.45, 28.85));
      const g = arcGlide(safePark, securityTarget, p, 5);
      xPct = g.x;
      yPct = g.y;
      rotateDeg = g.rot;
    } else {
      const p = easeOutCubic(progressBetween(t, 29.2, 30.1));
      const g = arcGlide(securityTarget, safePark, p, -5);
      xPct = g.x;
      yPct = g.y;
      rotateDeg = g.rot;
    }
    rippleColor = '#10b981';
  } else {
    const p = easeInOutCubic(progressBetween(t, 35.7, 36.6));
    const g = arcGlide(safePark, exitPoint, p, 8);
    xPct = g.x;
    yPct = g.y;
    rotateDeg = g.rot;
  }

  const taps = [
    { tap: computeTap(t, 9.21), color: '#10b981' },
    { tap: computeTap(t, 15.15), color: '#f5f5f2' },
    { tap: computeTap(t, 22.59), color: '#ef4444' },
    { tap: computeTap(t, 28.65), color: '#10b981' },
  ];

  let scale = 1;
  let ripple = 0;
  for (const item of taps) {
    if (item.tap.ripple > 0) {
      scale = item.tap.scale;
      ripple = item.tap.ripple;
      rippleColor = item.color;
      break;
    }
  }

  return { xPct, yPct, rotateDeg, scale, ripple, rippleColor, visible: true };
}

export const OversizedCursor: React.FC<OversizedCursorProps> = React.memo(({ time, viewport }) => {
  const pose = computeCursorPose(time, viewport);
  if (!pose.visible) return null;

  const sizePx = viewport === '9x16' ? 60 : 68;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
    >
      <div
        className="absolute"
        style={{
          left: `${pose.xPct}%`,
          top: `${pose.yPct}%`,
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          transform: `translate3d(-21%, -14%, 0) rotate(${pose.rotateDeg.toFixed(2)}deg) scale(${pose.scale})`,
          transformOrigin: '21% 14%',
          filter: 'drop-shadow(0 8px 14px rgba(0, 0, 0, 0.52))',
        }}
      >
        {pose.ripple > 0 && pose.ripple < 1 && (
          <div
            className="absolute rounded-full border-2"
            style={{
              left: '21%',
              top: '14%',
              width: `${28 + pose.ripple * 68}px`,
              height: `${28 + pose.ripple * 68}px`,
              borderColor: pose.rippleColor,
              opacity: (1 - pose.ripple) * 0.85,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
          <path
            d="M5.2 3.2L18.4 13.4L12.6 14.3L15.4 20.1L12.9 21.3L10.1 15.5L5.2 19.3V3.2Z"
            fill="#F5F5F2"
            stroke="#060607"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
});

OversizedCursor.displayName = 'OversizedCursor';
