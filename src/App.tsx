import React from 'react';
import { MotionConfig } from 'motion/react';
import { CaptureStage, type CaptureViewport } from './components/CaptureStage';
import { VisitorExperience } from './components/VisitorExperience';

export interface AppRouteConfig {
  readonly capture: boolean;
  readonly viewport: CaptureViewport;
  readonly theme: 'dark' | 'light';
  readonly initialTime: number;
}

export function parseAppRoute(search: string): AppRouteConfig {
  const params = new URLSearchParams(search);
  const capture = params.get('capture') === '1' || params.get('capture') === 'true';
  const rawViewport = params.get('viewport');
  const viewport: CaptureViewport = rawViewport === '16x9' ? '16x9' : '9x16';
  const theme: 'dark' | 'light' = params.get('theme') === 'light' ? 'light' : 'dark';
  const rawT = Number(params.get('t') ?? '0');
  const initialTime = Number.isFinite(rawT) ? Math.max(0, rawT) : 0;
  return { capture, viewport, theme, initialTime };
}

export const App: React.FC = () => {
  const route = parseAppRoute(typeof window !== 'undefined' ? window.location.search : '');

  // Capture Mode renders completely outside MotionConfig so zero JS motion runtime executes
  if (route.capture) {
    return <CaptureStage viewport={route.viewport} theme={route.theme} initialTime={route.initialTime} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <VisitorExperience />
    </MotionConfig>
  );
};

export default App;
