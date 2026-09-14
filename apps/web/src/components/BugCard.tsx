'use client';

import React, { useState } from 'react';
import { AlertTriangle, XCircle, Info, Check, Copy, Sparkles } from 'lucide-react';

interface BugCardProps {
  line: number;
  severity: string;
  description: string;
  fix: string;
}

const severityConfig: Record<
  string,
  {
    icon: React.ReactNode;
    badge: string;
    border: string;
    bg: string;
  }
> = {
  error: {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    badge: 'badge-error',
    border: 'rgba(248, 113, 113, 0.2)',
    bg: 'rgba(248, 113, 113, 0.05)',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    badge: 'badge-warning',
    border: 'rgba(251, 191, 36, 0.2)',
    bg: 'rgba(251, 191, 36, 0.05)',
  },
  info: {
    icon: <Info className="w-4 h-4 text-blue-400" />,
    badge: 'badge-info',
    border: 'rgba(107, 138, 255, 0.2)',
    bg: 'rgba(107, 138, 255, 0.05)',
  },
};

/**
 * Parses raw fix string to cleanly separate markdown code fences and textual explanation.
 */
function parseFixString(rawFix: string): { explanation: string; code: string | null } {
  if (!rawFix) return { explanation: '', code: null };

  // 1. Check for multiline fenced code blocks ```lang\ncode\n```
  const fenceMatch = rawFix.match(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/);
  if (fenceMatch) {
    const code = fenceMatch[1].trim();
    const explanation = rawFix.replace(/```(?:[a-zA-Z0-9_-]+)?\n?[\s\S]*?```/, '').trim();
    return { explanation, code };
  }

  // 2. Check for inline code snippet `code`
  const inlineMatch = rawFix.match(/`([^`]+)`/);
  if (inlineMatch && inlineMatch[1].length > 10) {
    const code = inlineMatch[1].trim();
    const explanation = rawFix.replace(/`[^`]+`/, '').trim();
    return { explanation, code };
  }

  return { explanation: rawFix, code: null };
}

export function BugCard({ line, severity, description, fix }: BugCardProps) {
  const [copied, setCopied] = useState(false);
  const config = severityConfig[severity.toLowerCase()] || severityConfig.info;
  const { explanation, code } = parseFixString(fix);

  const handleCopyCode = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="rounded-xl p-5 transition-all duration-300 shadow-sm"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge ${config.badge}`}>{severity}</span>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              Line {line}
            </span>
          </div>

          <p
            className="text-sm mb-3 leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {description}
          </p>

          {/* Solution / Fix Block */}
          <div
            className="rounded-lg p-3 text-xs"
            style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Proposed Solution:
              </span>

              {code && (
                <button
                  onClick={() => handleCopyCode(code)}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer"
                  title="Copy proposed code fix"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {explanation && (
              <p className="text-slate-300 mb-2 leading-relaxed whitespace-pre-wrap">
                {explanation}
              </p>
            )}

            {code && (
              <div className="relative group mt-1">
                <pre className="p-2.5 rounded bg-[#070913] border border-white/10 font-mono text-[11.5px] text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                  <code>{code}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
