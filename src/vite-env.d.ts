/// <reference types="vite/client" />

interface Window {
  __seek?: (t: number) => number;
  __seekReady?: boolean;
  __duration?: number;
  __viewport?: '9x16' | '16x9';
}
