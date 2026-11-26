import React from 'react';
import { GitBranch } from '@phosphor-icons/react';
import { DIFF_SCRIPTS, type DiffLine, type DiffScript } from '../data/diffScripts';

export interface VSCodeDiffPanelProps {
  scriptId: DiffScript['id'];
  typingProgress: number;
  opacity: number;
  cursorBlinkOn: boolean;
  compact?: boolean;
  footerMetric?: {
    label: string;
    before: string;
    after: string;
    accent?: 'emerald' | 'chalk';
  };
}

function renderHighlightedCode(code: string): React.ReactNode {
  // Rich deterministic syntax tokenizer covering strings, templates, comments, keywords, JSX tags, functions, numbers
  const parts = code.split(
    /(`[^`]*`|'[^']*'|"[^"]*"|\/\/.*$|<\/?[A-Za-z][A-Za-z0-9]*|\b(?:const|await|return|className|type|label|verify|sla)\b|\b[a-zA-Z_]\w*(?=\()|\b\d+(?:px|us|µs|s)?\b)/g
  );
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('//')) {
      return (
        <span key={idx} className="text-[#6e7681] italic">
          {part}
        </span>
      );
    }
    if (part.startsWith("'") || part.startsWith('"') || part.startsWith('`')) {
      return (
        <span key={idx} className="text-[#a5d6ff]">
          {part}
        </span>
      );
    }
    if (part.startsWith('<')) {
      return (
        <span key={idx} className="text-[#7ee787]">
          {part}
        </span>
      );
    }
    if (/^(const|await|return|className|type|label|verify|sla)$/.test(part)) {
      return (
        <span key={idx} className="text-[#ff7b72]">
          {part}
        </span>
      );
    }
    if (/^\d+(?:px|us|µs|s)?$/.test(part)) {
      return (
        <span key={idx} className="text-[#79c0ff]">
          {part}
        </span>
      );
    }
    if (/^[a-zA-Z_]\w*$/.test(part) && (parts[idx + 1]?.startsWith('(') ?? false)) {
      return (
        <span key={idx} className="text-[#d2a8ff]">
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function computeTypedLines(
  lines: readonly DiffLine[],
  typingProgress: number
): { line: DiffLine; visibleText: string; isTypingHead: boolean; rowAlpha: number }[] {
  const addLines = lines.filter((l) => l.kind === 'add');
  const totalAddChars = addLines.reduce((acc, l) => acc + l.code.length, 0);
  let remainingChars = Math.round(totalAddChars * Math.max(0, Math.min(1, typingProgress)));
  let headPlaced = false;

  return lines.map((line) => {
    if (line.kind !== 'add') {
      return { line, visibleText: line.code, isTypingHead: false, rowAlpha: 1 };
    }
    if (remainingChars <= 0) {
      const isHead = !headPlaced && typingProgress > 0.01;
      if (isHead) headPlaced = true;
      return { line, visibleText: '', isTypingHead: isHead, rowAlpha: isHead ? 0.6 : 0.14 };
    }
    if (remainingChars >= line.code.length) {
      remainingChars -= line.code.length;
      return { line, visibleText: line.code, isTypingHead: false, rowAlpha: 1 };
    }
    const slice = line.code.slice(0, remainingChars);
    const localP = slice.length / Math.max(1, line.code.length);
    remainingChars = 0;
    headPlaced = true;
    return { line, visibleText: slice, isTypingHead: true, rowAlpha: 0.45 + localP * 0.55 };
  });
}

export const VSCodeDiffPanel: React.FC<VSCodeDiffPanelProps> = React.memo(
  ({ scriptId, typingProgress, opacity, cursorBlinkOn, compact = false, footerMetric }) => {
    const script = DIFF_SCRIPTS[scriptId];
    const typedRows = computeTypedLines(script.lines, typingProgress);
    const compilePulse = typingProgress > 0.85 ? (typingProgress - 0.85) / 0.15 : 0;

    return (
      <div
        className="relative w-full overflow-hidden rounded-[22px] border border-white/[0.14] bg-[#0b0e14]/95 shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
        style={{
          opacity,
          transform: `translate3d(0, ${(1 - opacity) * 16}px, 0) scale(${0.97 + opacity * 0.03})`,
        }}
      >
        {/* Top optical specular compile beam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(16,185,129,${0.3 + compilePulse * 0.7}) ${Math.round(typingProgress * 100)}%, transparent 100%)`,
          }}
        />

        {/* VS Code Window Chrome */}
        <div
          className={`flex items-center justify-between border-b border-white/[0.08] bg-[#11151d] ${
            compact ? 'px-4 py-2.5' : 'px-5 py-3'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span
              className={`truncate font-mono font-semibold text-[#e6edf3] ${
                compact ? 'text-[14px]' : 'text-[13px]'
              }`}
            >
              {script.filename}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-[#8b949e]">
              <GitBranch size={12} />
              {script.branchLabel}
            </span>
            <span className="rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
              {script.summaryBadge}
            </span>
          </div>
        </div>

        {/* Code Diff Body */}
        <div
          className={`font-mono leading-relaxed ${
            compact ? 'px-3 py-3 text-[15px] space-y-1' : 'px-4 py-3.5 text-[14px] space-y-1.5'
          }`}
        >
          {typedRows.map(({ line, visibleText, isTypingHead, rowAlpha }, index) => {
            const isRemove = line.kind === 'remove';
            const isAdd = line.kind === 'add';
            const rowBg = isRemove
              ? 'bg-red-500/[0.14]'
              : isAdd
                ? isTypingHead
                  ? 'bg-emerald-500/[0.22]'
                  : 'bg-emerald-500/[0.12]'
                : '';
            const gutterColor = isRemove
              ? 'text-red-400'
              : isAdd
                ? 'text-emerald-400'
                : 'text-[#484f58]';
            const sign = isRemove ? '-' : isAdd ? '+' : ' ';

            return (
              <div
                key={`${script.id}-${index}`}
                className={`flex items-start gap-2.5 rounded-md px-2.5 py-1 ${rowBg}`}
                style={{
                  opacity: rowAlpha,
                  transform: isAdd ? `translate3d(${(1 - rowAlpha) * 8}px, 0, 0)` : undefined,
                }}
              >
                <span className="w-6 shrink-0 select-none text-right text-[11px] text-[#484f58] tabular-nums">
                  {line.lineNo}
                </span>
                <span className={`w-3 shrink-0 select-none font-bold ${gutterColor}`}>
                  {sign}
                </span>
                <code
                  className={`min-w-0 flex-1 whitespace-pre-wrap break-all ${
                    isRemove
                      ? 'text-red-200/85 line-through decoration-red-400/70'
                      : 'text-[#e6edf3]'
                  }`}
                >
                  {isRemove ? visibleText : renderHighlightedCode(visibleText)}
                  {isTypingHead && (
                    <span
                      className="ml-0.5 inline-block h-[1.1em] w-[2.5px] align-middle bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]"
                      style={{ opacity: cursorBlinkOn ? 1 : 0.15 }}
                    />
                  )}
                </code>
              </div>
            );
          })}
        </div>

        {/* Live Delta Footer */}
        {footerMetric && (
          <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#11151d] px-4 py-2.5 font-mono text-[12px]">
            <span className="text-[#8b949e] uppercase tracking-wider">{footerMetric.label}</span>
            <div className="flex items-center gap-2.5 tabular-nums">
              <span className="text-red-400 line-through">{footerMetric.before}</span>
              <span className="text-[#52525b]">→</span>
              <span
                className={
                  footerMetric.accent === 'chalk'
                    ? 'font-bold text-[#f5f5f2]'
                    : 'font-bold text-emerald-300'
                }
              >
                {footerMetric.after}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VSCodeDiffPanel.displayName = 'VSCodeDiffPanel';
