import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ObsidianShaderBackdropProps {
  /** When set, disables rAF and renders synchronously for exact frame determinism */
  deterministicTime?: number;
  /** 0..1 intensity of crimson caustic energy (Act 5 Vine Boom impact) */
  crimsonIntensity?: number;
  /** 0..1 intensity of emerald specular energy (Act 6-7 HMAC / AI verified) */
  emeraldIntensity?: number;
  /** Optional scroll progress 0..1 to warp fluid silk ribbons in Visitor Mode */
  scrollProgress?: number;
  /** Light Mode (Liquid Satin Pearl-Chrome Holographic Silk) vs Dark Mode (Obsidian Titanium Silk) */
  lightMode?: boolean;
  className?: string;
}

const VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * Dual-Theme 3D-Normal Liquid Silk & Thin-Film Holographic Pearl/Titanium Fragment Shader.
 * Computes true analytical 3D surface normals of domain-warped fluid silk so:
 * - Dark Mode: Sculptural Obsidian + Liquid Titanium specular folds + Emerald/Crimson caustic energy
 * - Light Mode: Crisp Satin Porcelain-Pearl + Liquid Silver-Chrome 3D silk folds + Grazing Thin-Film
 *   Opal/Emerald Fresnel shimmer strictly on sharp wave crests (zero muddy blue blotches!)
 */
const FRAGMENT_SHADER = `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uPointerVel;
uniform float uCrimson;
uniform float uEmerald;
uniform float uLightMix;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.56;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  v += a * noise(p);
  p = rot * p * 2.02;
  a *= 0.5;
  v += a * noise(p);
  return v;
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.54;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

float silkHeight(vec2 p, float t) {
  vec2 q = vec2(
    fbm2(p * 1.26 + vec2(t * 0.56, -t * 0.34)),
    fbm2(p * 1.26 + vec2(4.2 - t * 0.38, 1.9 + t * 0.44))
  );
  vec2 r = vec2(
    fbm2(p * 1.52 + 1.82 * q + vec2(1.7, 9.2 - t * 0.25)),
    fbm2(p * 1.52 + 1.82 * q + vec2(8.3 + t * 0.23, 2.8))
  );
  return fbm3(p * 1.44 + 1.95 * r + vec2(0.0, t * 0.20));
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(uRes, vec2(1.0));
  float minDim = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / minDim;

  // Interactive cursor fluid wake & optical lens ripple
  vec2 mouseP = ((uPointer * uRes) - 0.5 * uRes) / minDim;
  vec2 toMouse = p - mouseP;
  float mouseDist = length(toMouse);
  float ripple = exp(-mouseDist * 3.8) * (0.05 + uPointerVel * 0.16);
  float waveRing = sin(mouseDist * 17.0 - uTime * 4.0) * exp(-mouseDist * 3.2) * (0.010 + uPointerVel * 0.06);
  p += normalize(toMouse + vec2(0.0001)) * (ripple + waveRing);
  p += (uPointer - 0.5) * 0.12;

  float t = uTime * 0.16;
  float h = silkHeight(p, t);

  // Analytical 3D surface normal for true sculpted liquid-silk specular reflection
  float eps = 0.018;
  float hx = silkHeight(p + vec2(eps, 0.0), t);
  float hy = silkHeight(p + vec2(0.0, eps), t);
  vec3 normal = normalize(vec3((h - hx) * 4.4, (h - hy) * 4.4, 0.38));

  // Studio 2-point architectural lighting
  vec3 lightKey = normalize(vec3(-0.45, 0.65, 0.72));
  vec3 lightRim = normalize(vec3(0.75, -0.35, 0.52));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  float diffKey = max(0.0, dot(normal, lightKey));
  float specKey = pow(max(0.0, dot(reflect(-lightKey, normal), viewDir)), 18.0);
  float specRim = pow(max(0.0, dot(reflect(-lightRim, normal), viewDir)), 12.0);
  float fresnel = pow(1.0 - max(0.0, normal.z), 2.1);
  float ridge = pow(smoothstep(0.24, 0.86, h), 1.75);
  float caustic = pow(max(0.0, 1.0 - abs(h - 0.56) * 7.2), 2.3);
  float pointerGlow = exp(-mouseDist * 2.3) * (0.26 + uPointerVel * 0.45);

  // Physical thin-film interference strictly modulated by Fresnel grazing angle + wave phase
  float filmPhase = h * 7.5 + fresnel * 3.8 + uTime * 0.15;
  vec3 filmIridescence = 0.5 + 0.5 * cos(filmPhase + vec3(0.0, 2.05, 4.1));

  // --- DARK MODE: Holographic Liquid Obsidian & Brushed Titanium Silk ---
  vec3 darkBase = vec3(0.020, 0.022, 0.028);
  vec3 darkSilk = vec3(0.145, 0.162, 0.194);
  vec3 darkHolo = mix(vec3(0.16, 0.56, 0.46), vec3(0.46, 0.62, 0.78), filmIridescence.b);
  vec3 darkEmerald = vec3(0.05, 0.46, 0.32);
  vec3 darkCrimson = vec3(0.68, 0.08, 0.11);

  vec3 darkCol = mix(darkBase, darkSilk, ridge * 0.55 + diffKey * 0.32);
  darkCol += darkHolo * (fresnel * 0.42 + caustic * 0.34 + pointerGlow * 0.22);
  darkCol += vec3(0.46, 0.49, 0.55) * (specKey * 0.44 + specRim * 0.22);
  darkCol += darkEmerald * (ridge * 0.44 + fresnel * 0.38 + specKey * 0.32) * uEmerald;
  darkCol += darkCrimson * (ridge * 0.62 + fresnel * 0.52 + specKey * 0.50) * uCrimson;

  float dist = length(uv - vec2(0.5, 0.40));
  darkCol *= (0.58 + 0.42 * smoothstep(1.22, 0.14, dist));

  // --- LIGHT MODE: Sculptural Satin Porcelain-Pearl + Liquid Platinum Holographic Silk ---
  // Neutral architectural pearl-platinum base (zero muddy blue sky blotches!)
  vec3 pearlBase = vec3(0.956, 0.958, 0.962);
  vec3 satinShadow = vec3(0.842, 0.849, 0.864);
  vec3 chromeCrest = vec3(1.0, 1.0, 1.0);

  // Jewel-like thin-film pearl opal shimmer ONLY on curved grazing Fresnel silk edges & caustic ridges
  vec3 pearlPrism = mix(vec3(0.62, 0.92, 0.82), vec3(0.82, 0.85, 0.98), filmIridescence.b);
  pearlPrism = mix(pearlPrism, vec3(0.96, 0.86, 0.93), filmIridescence.r * 0.45);

  vec3 lightCol = mix(satinShadow, pearlBase, clamp(0.32 + diffKey * 0.78, 0.0, 1.0));
  // Subtle sculpted chrome-silver contour valleys
  lightCol = mix(lightCol, vec3(0.80, 0.82, 0.85), fresnel * 0.34);
  // Crisp holographic opal sheen strictly tracing the silk crests & grazing ridges
  lightCol = mix(lightCol, pearlPrism, clamp((fresnel * 0.42 + caustic * 0.40 + pointerGlow * 0.24), 0.0, 0.54));
  // Bright luminous porcelain specular light ridges (gives true sculpted 3D silk depth!)
  lightCol = mix(lightCol, chromeCrest, clamp(specKey * 0.78 + specRim * 0.36 + caustic * 0.18, 0.0, 0.92));
  // Delicate narrative emerald/crimson reflection on silk edges
  lightCol = mix(lightCol, vec3(0.54, 0.89, 0.76), clamp((fresnel * 0.32 + caustic * 0.28) * uEmerald, 0.0, 0.28));
  lightCol = mix(lightCol, vec3(0.96, 0.74, 0.77), clamp((fresnel * 0.42 + caustic * 0.35) * uCrimson, 0.0, 0.36));

  vec3 col = mix(darkCol, lightCol, uLightMix);

  // Micro-dither eliminates 8-bit gradient banding cleanly
  float dither = (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  col = clamp(col + dither, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

interface GlResources {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  uTime: WebGLUniformLocation | null;
  uRes: WebGLUniformLocation | null;
  uPointer: WebGLUniformLocation | null;
  uPointerVel: WebGLUniformLocation | null;
  uCrimson: WebGLUniformLocation | null;
  uEmerald: WebGLUniformLocation | null;
  uLightMix: WebGLUniformLocation | null;
}

function initWebGL(canvas: HTMLCanvasElement): GlResources | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);

  return {
    gl,
    program,
    uTime: gl.getUniformLocation(program, 'uTime'),
    uRes: gl.getUniformLocation(program, 'uRes'),
    uPointer: gl.getUniformLocation(program, 'uPointer'),
    uPointerVel: gl.getUniformLocation(program, 'uPointerVel'),
    uCrimson: gl.getUniformLocation(program, 'uCrimson'),
    uEmerald: gl.getUniformLocation(program, 'uEmerald'),
    uLightMix: gl.getUniformLocation(program, 'uLightMix'),
  };
}

export const ObsidianShaderBackdrop: React.FC<ObsidianShaderBackdropProps> = React.memo(
  ({
    deterministicTime,
    crimsonIntensity = 0,
    emeraldIntensity = 0.28,
    scrollProgress = 0,
    lightMode = false,
    className = '',
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<GlResources | null>(null);
    const pointerRef = useRef<{ x: number; y: number; tx: number; ty: number; vel: number }>({
      x: 0.5,
      y: 0.5,
      tx: 0.5,
      ty: 0.5,
      vel: 0,
    });
    const lightMixRef = useRef<number>(lightMode ? 1 : 0);
    const moodRef = useRef({
      crimson: crimsonIntensity,
      emerald: emeraldIntensity,
      scroll: scrollProgress,
      targetLight: lightMode ? 1 : 0,
    });
    moodRef.current = {
      crimson: crimsonIntensity,
      emerald: emeraldIntensity,
      scroll: scrollProgress,
      targetLight: lightMode ? 1 : 0,
    };

    const [fallbackCss, setFallbackCss] = useState(false);
    const isDeterministic = typeof deterministicTime === 'number';

    const drawFrame = (timeVal: number) => {
      const res = glRef.current;
      const canvas = canvasRef.current;
      if (!res || !canvas) return;
      const { gl, uTime, uRes, uPointer, uPointerVel, uCrimson, uEmerald, uLightMix } = res;
      if (gl.isContextLost()) {
        setFallbackCss(true);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const dpr = isDeterministic ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const scale = isDeterministic ? 0.5 : 0.68;
      const targetW = Math.max(2, Math.floor(rect.width * dpr * scale));
      const targetH = Math.max(2, Math.floor(rect.height * dpr * scale));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, timeVal + moodRef.current.scroll * 6.5);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uPointer, pointerRef.current.x, pointerRef.current.y);
      gl.uniform1f(uPointerVel, isDeterministic ? 0 : pointerRef.current.vel);
      gl.uniform1f(uCrimson, moodRef.current.crimson);
      gl.uniform1f(uEmerald, moodRef.current.emerald);
      gl.uniform1f(uLightMix, isDeterministic ? (moodRef.current.targetLight) : lightMixRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    useLayoutEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const onContextLost = (e: Event) => {
        e.preventDefault();
        glRef.current = null;
        setFallbackCss(true);
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);

      const resources = initWebGL(canvas);
      if (!resources) {
        setFallbackCss(true);
        return () => {
          canvas.removeEventListener('webglcontextlost', onContextLost);
        };
      }
      glRef.current = resources;
      lightMixRef.current = lightMode ? 1 : 0;
      if (typeof deterministicTime === 'number') {
        drawFrame(deterministicTime);
      } else {
        drawFrame(0);
      }
      return () => {
        canvas.removeEventListener('webglcontextlost', onContextLost);
        glRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
      if (!isDeterministic || fallbackCss) return;
      drawFrame(deterministicTime);
    });

    useEffect(() => {
      if (isDeterministic || fallbackCss) return;
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        lightMixRef.current = moodRef.current.targetLight;
        drawFrame(1.4);
        return;
      }

      let rafId = 0;
      let running = !document.hidden;
      const start = performance.now();

      const onPointerMove = (e: PointerEvent) => {
        const nx = e.clientX / Math.max(1, window.innerWidth);
        const ny = 1 - e.clientY / Math.max(1, window.innerHeight);
        const dx = nx - pointerRef.current.tx;
        const dy = ny - pointerRef.current.ty;
        const speed = Math.min(1.0, Math.hypot(dx, dy) * 18);
        pointerRef.current.tx = nx;
        pointerRef.current.ty = ny;
        pointerRef.current.vel = Math.max(pointerRef.current.vel, speed);
      };
      const onVisibility = () => {
        running = !document.hidden;
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);

      const loop = (now: number) => {
        if (running) {
          pointerRef.current.x += (pointerRef.current.tx - pointerRef.current.x) * 0.065;
          pointerRef.current.y += (pointerRef.current.ty - pointerRef.current.y) * 0.065;
          pointerRef.current.vel *= 0.92;
          lightMixRef.current += (moodRef.current.targetLight - lightMixRef.current) * 0.1;
          drawFrame((now - start) / 1000);
        }
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', onVisibility);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDeterministic, fallbackCss, lightMode]);

    if (fallbackCss) {
      return (
        <div
          aria-hidden="true"
          className={`pointer-events-none ${className}`}
          style={{
            background: lightMode
              ? `radial-gradient(circle at 24% 26%, rgba(16,185,129,0.12), transparent 52%), radial-gradient(circle at 78% 64%, rgba(203,213,225,0.35), transparent 56%), #f6f7f9`
              : `radial-gradient(circle at 30% 25%, rgba(16,185,129,${0.08 + emeraldIntensity * 0.14}), transparent 55%), radial-gradient(circle at 75% 65%, rgba(239,68,68,${crimsonIntensity * 0.28}), transparent 55%), #060608`,
          }}
        />
      );
    }

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none block h-full w-full ${className}`}
      />
    );
  }
);

ObsidianShaderBackdrop.displayName = 'ObsidianShaderBackdrop';
