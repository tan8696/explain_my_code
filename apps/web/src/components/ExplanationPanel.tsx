'use client';

import React, { useState } from 'react';
import {
  FileText,
  List,
  Workflow,
  Bug,
  Lightbulb,
  Terminal,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { BugCard } from './BugCard';

/* ── Types ──────────────────────────────────────────────────────────── */

interface LineExplanation {
  lineNumber: number;
  code: string;
  explanation: string;
}

interface BugItem {
  line: number;
  severity: string;
  description: string;
  fix: string;
}

interface Concept {
  name: string;
  explanation: string;
}

export interface CreditInfo {
  limit: number;
  used: number;
  remaining: number;
  isLimitReached: boolean;
  quotaExhausted: boolean;
  reason?: string;
  mode: string;
  resetAt: string;
}

export interface ExplanationData {
  language: string;
  summary: string;
  lineByLine: LineExplanation[];
  logic: string;
  bugs: BugItem[];
  concepts: Concept[];
  output: string;
  credits?: CreditInfo;
}

interface ExplanationPanelProps {
  data: ExplanationData;
  code?: string;
}

/* ── Tab definitions ────────────────────────────────────────────────── */

const TABS = [
  { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
  { id: 'lines', label: 'Line by Line', icon: <List className="w-4 h-4" /> },
  { id: 'logic', label: 'Logic', icon: <Workflow className="w-4 h-4" /> },
  { id: 'bugs', label: 'Bugs', icon: <Bug className="w-4 h-4" /> },
  { id: 'concepts', label: 'Concepts', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'output', label: 'Output', icon: <Terminal className="w-4 h-4" /> },
] as const;

type TabId = (typeof TABS)[number]['id'];

/* ── Component ──────────────────────────────────────────────────────── */

export function ExplanationPanel({ data }: ExplanationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [copied, setCopied] = useState(false);

  const generateMarkdownReport = () => {
    let md = `# Code Explanation — ${data.language}\n\n`;
    md += `## 📌 Summary\n${data.summary}\n\n`;

    if (data.bugs.length > 0) {
      md += `## ⚠️ Bugs & Issues (${data.bugs.length})\n`;
      data.bugs.forEach((b, i) => {
        md += `### ${i + 1}. Line ${b.line} [${b.severity.toUpperCase()}]\n`;
        md += `- **Issue:** ${b.description}\n`;
        md += `- **Fix:** ${b.fix}\n\n`;
      });
    } else {
      md += `## ✅ Bugs & Issues\nNo bugs detected. Code looks clean!\n\n`;
    }

    md += `## 📑 Line-by-Line Breakdown\n`;
    data.lineByLine.forEach((l) => {
      md += `**Line ${l.lineNumber}:** \`${l.code.trim()}\`\n> ${l.explanation}\n\n`;
    });

    md += `## 🔀 Logic Flow\n${data.logic}\n\n`;

    if (data.concepts.length > 0) {
      md += `## 💡 Key Concepts\n`;
      data.concepts.forEach((c) => {
        md += `- **${c.name}:** ${c.explanation}\n`;
      });
      md += `\n`;
    }

    md += `## 📟 Expected Output\n\`\`\`\n${data.output}\n\`\`\`\n`;
    return md;
  };

  const handleCopy = async () => {
    const report = generateMarkdownReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const report = generateMarkdownReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `explanation-${data.language.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Free-tier limit or quota exhausted alert banner */}
      {data.credits && (data.credits.isLimitReached || data.credits.quotaExhausted) && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl animate-fade-in"
          style={{
            border: '1px solid rgba(245, 158, 11, 0.35)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
          }}
        >
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <div className="font-semibold flex items-center gap-2 text-amber-300">
              <span>Free-Tier Protection Active</span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                Zero-Cost Heuristic Fallback
              </span>
            </div>
            <p className="mt-1 leading-relaxed text-amber-200/90 text-xs">
              {data.credits.reason ||
                `Daily free-tier credit limit reached (${data.credits.used}/${data.credits.limit}). AI generation is paused so you never incur billing or API overage charges. This explanation was safely generated by the built-in offline engine.`}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-amber-300/80">
              <span>
                <strong>Limit:</strong> {data.credits.limit} requests/day
              </span>
              <span>
                <strong>Used Today:</strong> {data.credits.used}
              </span>
              <span>
                <strong>Remaining:</strong> {data.credits.remaining}
              </span>
              <span>
                <strong>Resets:</strong> {data.credits.resetAt}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action bar above tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Results for <strong className="text-white">{data.language}</strong>
          </span>
          {data.bugs.length === 0 ? (
            <span className="badge badge-green text-[11px] py-0.5 px-2">
              <CheckCircle2 className="w-3 h-3" /> Clean Code
            </span>
          ) : (
            <span className="badge badge-error text-[11px] py-0.5 px-2">
              {data.bugs.length} Issue{data.bugs.length > 1 ? 's' : ''}
            </span>
          )}

          {data.credits && !data.credits.isLimitReached && (
            <span
              className="badge text-[11px] py-0.5 px-2 hidden sm:inline-flex items-center gap-1.5"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
              }}
            >
              <Zap className="w-3 h-3 text-blue-400" />
              {data.credits.mode === 'gemini_live' ? 'Gemini 2.5 Flash' : 'Offline Mode'} · {data.credits.remaining} left today
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
            title="Copy full explanation as Markdown"
            aria-label="Copy explanation as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--green)]" />
                <span className="text-[var(--green)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
            title="Download explanation markdown report"
            aria-label="Download markdown report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar overflow-x-auto" role="tablist" aria-label="Explanation sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`tab-btn flex items-center gap-2 cursor-pointer ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span className="inline">{tab.label}</span>
            {/* Bug count badge */}
            {tab.id === 'bugs' && data.bugs.length > 0 && (
              <span
                className="ml-1 text-xs font-bold rounded-full px-2 py-0.5"
                style={{
                  background: 'var(--red-subtle)',
                  color: 'var(--red)',
                }}
              >
                {data.bugs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="tab-content-enter"
        key={activeTab}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'summary' && <SummaryTab data={data} />}
        {activeTab === 'lines' && <LinesTab lines={data.lineByLine} />}
        {activeTab === 'logic' && <LogicTab logic={data.logic} />}
        {activeTab === 'bugs' && <BugsTab bugs={data.bugs} />}
        {activeTab === 'concepts' && <ConceptsTab concepts={data.concepts} />}
        {activeTab === 'output' && <OutputTab output={data.output} />}
      </div>
    </div>
  );
}

/* ── Summary ────────────────────────────────────────────────────────── */

function SummaryTab({ data }: { data: ExplanationData }) {
  return (
    <div className="section-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          What this code does
        </h3>
        <span className="badge badge-language">{data.language}</span>
        {data.bugs.length === 0 && (
          <span className="badge badge-green">
            <CheckCircle2 className="w-3 h-3" /> No bugs
          </span>
        )}
        {data.bugs.length > 0 && (
          <span className="badge badge-error">
            {data.bugs.length} issue{data.bugs.length > 1 ? 's' : ''} found
          </span>
        )}
      </div>
      <p
        className="text-base leading-relaxed"
        style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
      >
        {data.summary}
      </p>
    </div>
  );
}

/* ── Line by Line ───────────────────────────────────────────────────── */

function LinesTab({ lines }: { lines: LineExplanation[] }) {
  return (
    <div className="section-card overflow-hidden animate-fade-in">
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Line-by-line breakdown
        </h3>
      </div>
      <div>
        {lines.map((line, i) => (
          <div
            key={i}
            className="line-row"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <span className="line-num">{line.lineNumber}</span>
            <code className="line-code">{line.code}</code>
            <span className="line-explanation">{line.explanation}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Logic ──────────────────────────────────────────────────────────── */

function LogicTab({ logic }: { logic: string }) {
  return (
    <div className="section-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-5 h-5 text-white" />
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          How this code works
        </h3>
      </div>
      <p
        className="leading-relaxed whitespace-pre-wrap"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 14,
          lineHeight: 1.8,
        }}
      >
        {logic}
      </p>
    </div>
  );
}

/* ── Bugs ───────────────────────────────────────────────────────────── */

function BugsTab({ bugs }: { bugs: BugItem[] }) {
  if (bugs.length === 0) {
    return (
      <div className="section-card p-8 text-center animate-fade-in">
        <CheckCircle2
          className="w-10 h-10 mx-auto mb-3"
          style={{ color: 'var(--green)' }}
        />
        <h3
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          No bugs detected
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          The analyzer didn&apos;t find any syntax errors or critical bugs. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {bugs.map((bug, i) => (
        <div key={i} className={`animate-fade-in-delay-${Math.min(i + 1, 4)}`}>
          <BugCard {...bug} />
        </div>
      ))}
    </div>
  );
}

/* ── Concepts ───────────────────────────────────────────────────────── */

function ConceptsTab({ concepts }: { concepts: Concept[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
      {concepts.map((concept, i) => (
        <div
          key={i}
          className="section-card p-5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb
              className="w-4 h-4 shrink-0"
              style={{ color: 'var(--amber)' }}
            />
            <h4
              className="font-semibold text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              {concept.name}
            </h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
            {concept.explanation}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Output ─────────────────────────────────────────────────────────── */

function OutputTab({ output }: { output: string }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-5 h-5" style={{ color: 'var(--green)' }} />
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Expected Output
        </h3>
      </div>
      <div className="terminal-box">{output}</div>
    </div>
  );
}
