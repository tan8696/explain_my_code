'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Code2,
  ArrowLeft,
  Terminal,
  Sparkles,
  Shield,
  FileText,
  Bug,
  Zap,
  Copy,
  Check,
  RotateCcw,
  CornerDownLeft,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface TerminalLog {
  id: string;
  command?: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'explain' | 'terminal'>('explain');
  const [terminalInput, setTerminalInput] = useState('');
  const logCounterRef = React.useRef(3);

  const displayPath = pathname || '/unknown-route';

  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>(() => [
    {
      id: '1',
      output: 'ExplainMyCode Runtime v2.0 · Route Dispatcher',
    },
    {
      id: '2',
      command: `resolveRoute("${pathname || '/unknown-route'}")`,
      output: `Error: 404 Not Found — No matching handler for symbol "${pathname || '/unknown-route'}"`,
      isError: true,
    },
    {
      id: '3',
      output: 'Type "help" or click a shortcut below for quick actions.',
    },
  ]);

  const handleCopyDiagnostics = async () => {
    const diagnostics = [
      'Explain My Code - Error Diagnostics',
      `Error: HTTP 404 Not Found`,
      `Path: ${displayPath}`,
      `Timestamp: ${new Date().toISOString()}`,
      `User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}`,
      `Status: ROUTE_NOT_FOUND`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(diagnostics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const executeTerminalCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    logCounterRef.current += 1;
    const id = String(logCounterRef.current);

    if (!trimmed) return;

    if (trimmed === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    }

    if (trimmed === 'cd /' || trimmed === 'home' || trimmed === 'cd ~') {
      setTerminalLogs((prev) => [
        ...prev,
        { id, command: cmd, output: 'Navigating to home workspace...' },
      ]);
      setTimeout(() => {
        router.push('/');
      }, 500);
      setTerminalInput('');
      return;
    }

    if (trimmed === 'help') {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id,
          command: cmd,
          output: (
            <div className="space-y-1">
              <p>Available commands:</p>
              <p className="text-[var(--text-muted)]">  cd /         - Navigate back to home workspace</p>
              <p className="text-[var(--text-muted)]">  explain 404  - Plain-English breakdown of this error</p>
              <p className="text-[var(--text-muted)]">  ls routes    - List registered valid routes</p>
              <p className="text-[var(--text-muted)]">  ping router  - Test routing table status</p>
              <p className="text-[var(--text-muted)]">  clear        - Clear terminal log</p>
            </div>
          ),
        },
      ]);
      setTerminalInput('');
      return;
    }

    if (trimmed === 'explain 404' || trimmed === 'explain') {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id,
          command: cmd,
          output:
            'A 404 error means the client requested a resource that the web server could not locate. Like asking a library for a book that is not in the catalog.',
        },
      ]);
      setTerminalInput('');
      return;
    }

    if (trimmed === 'ls' || trimmed === 'ls routes') {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id,
          command: cmd,
          output: 'Valid routes: / (Workspace), /privacy (Privacy Policy), /terms (Terms of Service)',
        },
      ]);
      setTerminalInput('');
      return;
    }

    if (trimmed === 'ping router' || trimmed === 'ping') {
      setTerminalLogs((prev) => [
        ...prev,
        {
          id,
          command: cmd,
          output: 'PING router.internal (127.0.0.1): 42 routes checked. 0 matching handlers for current query.',
        },
      ]);
      setTerminalInput('');
      return;
    }

    setTerminalLogs((prev) => [
      ...prev,
      {
        id,
        command: cmd,
        output: `command not recognized: ${trimmed}. Type "help" for a list of commands.`,
        isError: true,
      },
    ]);
    setTerminalInput('');
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTerminalCommand(terminalInput);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden">
      {/* ── Ambient Glow Backdrop ──────────────────────────────────── */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(107, 138, 255, 0.12) 0%, rgba(239, 68, 68, 0.06) 50%, transparent 80%)',
        }}
      />
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
        }}
      />

      {/* ── Top Header ────────────────────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between relative z-10"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
            style={{ background: '#ffffff' }}
          >
            <Code2 className="w-4 h-4 text-black" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-base tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Explain My Code
            </span>
            <span className="badge badge-info text-[10px] py-0.5 px-2">v2.0</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors bg-transparent border-none cursor-pointer py-1 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </Link>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10 animate-fade-in">
        <div className="max-w-3xl w-full">
          {/* Header Status & Code Pill */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono mb-4 shadow-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
              }}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>STATUS: 404_ROUTE_NOT_FOUND</span>
            </div>

            <h1
              className="text-5xl sm:text-7xl font-black tracking-tight mb-3"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #9ca3af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              404
            </h1>

            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Lost in the source code?
            </h2>

            <p
              className="text-xs sm:text-sm max-w-lg mx-auto"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
            >
              The requested symbol{' '}
              <code className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.08)] font-mono text-[var(--accent-bright)] text-xs">
                {displayPath}
              </code>{' '}
              could not be resolved in the router symbol table.
            </p>
          </div>

          {/* ── Interactive Code Debugger Card ──────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden mb-8 border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(13, 15, 24, 0.75)',
            }}
          >
            {/* Editor Window Bar */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b border-[var(--border-subtle)]"
              style={{ background: 'rgba(255, 255, 255, 0.02)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-[var(--text-muted)] ml-2">
                  router.dispatch.ts:404
                </span>
              </div>

              {/* Tab Selector & Copy button */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg p-0.5 bg-[rgba(255,255,255,0.04)] border border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveTab('explain')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all border-none cursor-pointer ${
                      activeTab === 'explain'
                        ? 'bg-[rgba(255,255,255,0.12)] text-white'
                        : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    Plain English
                  </button>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all border-none cursor-pointer ${
                      activeTab === 'terminal'
                        ? 'bg-[rgba(255,255,255,0.12)] text-white'
                        : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    Mini Terminal
                  </button>
                </div>

                <button
                  onClick={handleCopyDiagnostics}
                  className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-white px-2 py-1 rounded-md border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] transition-all cursor-pointer"
                  title="Copy error diagnostics to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Log</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code / Tab Content */}
            {activeTab === 'explain' ? (
              <div className="p-4 sm:p-6 space-y-4 font-sans">
                {/* Code Snippet */}
                <div
                  className="rounded-xl p-3 sm:p-4 font-mono text-xs overflow-x-auto"
                  style={{
                    background: 'rgba(6, 6, 12, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="text-[var(--text-muted)]">
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-300">targetPath</span> ={' '}
                    <span className="text-emerald-300">&quot;{displayPath}&quot;</span>;
                  </div>
                  <div className="text-[var(--text-muted)]">
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-300">handler</span> = router.resolve(targetPath);
                  </div>
                  <div className="text-[var(--text-muted)] mt-1">
                    <span className="text-purple-400">if</span> (!handler) {'{'}
                  </div>
                  <div className="pl-4 text-red-400">
                    <span className="text-red-400">throw new</span>{' '}
                    <span className="text-amber-300">RouteNotFoundError</span>(
                    <span className="text-red-300">&quot;HTTP 404: Symbol not found in registry&quot;</span>
                    );
                  </div>
                  <div className="text-[var(--text-muted)]">{'}'}</div>
                </div>

                {/* Plain-English Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div
                    className="p-3 rounded-xl border border-[var(--border-subtle)]"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>What happened?</span>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed m-0">
                      The web server evaluated your request against all 42 registered endpoints and found 0 matching routes.
                    </p>
                  </div>

                  <div
                    className="p-3 rounded-xl border border-[var(--border-subtle)]"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Why it failed</span>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed m-0">
                      This usually means the URL had a slight typo, or the page was relocated during a recent application update.
                    </p>
                  </div>

                  <div
                    className="p-3 rounded-xl border border-[var(--border-subtle)]"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <div className="flex items-center gap-1.5 text-green-400 font-semibold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Recommended fix</span>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed m-0">
                      Jump right into the home workspace below, or pick an interactive code tutorial sample to explore.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 font-mono text-xs">
                {/* Terminal Log Output */}
                <div
                  className="rounded-xl p-3 sm:p-4 mb-3 h-52 overflow-y-auto space-y-2"
                  style={{
                    background: 'rgba(6, 6, 12, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {terminalLogs.map((log) => (
                    <div key={log.id}>
                      {log.command && (
                        <div className="text-[var(--accent-bright)] flex items-center gap-1.5">
                          <span className="text-[var(--text-muted)]">&gt;</span>
                          <span>{log.command}</span>
                        </div>
                      )}
                      <div
                        className={
                          log.isError
                            ? 'text-red-400'
                            : 'text-[var(--text-secondary)] leading-relaxed'
                        }
                      >
                        {log.output}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Command Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[11px] text-[var(--text-muted)] mr-1">Shortcuts:</span>
                  {['cd /', 'explain 404', 'ls routes', 'ping router', 'clear'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => executeTerminalCommand(cmd)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono text-[var(--text-secondary)] hover:text-white bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.09)] border border-[var(--border-subtle)] transition-all cursor-pointer"
                    >
                      ${' '}{cmd}
                    </button>
                  ))}
                </div>

                {/* Terminal Input */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2">
                  <span className="text-emerald-400">&gt;</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type a command (e.g. 'help', 'cd /', 'explain 404')..."
                    className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-white placeholder-[var(--text-muted)]"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] cursor-pointer"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Quick Navigation Bento Grid ─────────────────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 text-center sm:text-left">
              Where would you like to go?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Card 1: Main Workspace (Hero CTA) */}
              <Link
                href="/"
                className="col-span-1 sm:col-span-2 lg:col-span-1 p-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.2)] transition-all no-underline group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                    </div>
                    <span className="badge badge-info text-[9px] py-0.5 px-1.5">Primary</span>
                  </div>
                  <div className="font-semibold text-sm text-white group-hover:text-[var(--accent-bright)] transition-colors mb-1">
                    Code Explainer Workspace
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
                    Paste any code in 20+ languages for instant line-by-line breakdown & bug detection.
                  </p>
                </div>
                <div className="mt-3 text-xs text-[var(--accent-bright)] font-medium flex items-center gap-1">
                  <span>Open Workspace</span>
                  <ArrowLeft className="w-3 h-3 rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Card 2: Python Bug Demo */}
              <Link
                href="/?preset=python-bug"
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all no-underline group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Bug className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Preset</span>
                  </div>
                  <div className="font-semibold text-sm text-white group-hover:text-red-300 transition-colors mb-1">
                    Python Bug Detection
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
                    Try analyzing a division-by-zero bug and see the AI explanation & fix.
                  </p>
                </div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] group-hover:text-white font-medium flex items-center gap-1">
                  <span>Try Demo</span>
                  <ArrowLeft className="w-3 h-3 rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Card 3: JS Array Filter */}
              <Link
                href="/?preset=js-filter"
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all no-underline group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Preset</span>
                  </div>
                  <div className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors mb-1">
                    JS Array Operations
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
                    Explore modern JavaScript functional array mapping & filtering explained in plain English.
                  </p>
                </div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] group-hover:text-white font-medium flex items-center gap-1">
                  <span>Try Demo</span>
                  <ArrowLeft className="w-3 h-3 rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Card 4: Privacy Policy */}
              <Link
                href="/privacy"
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all no-underline group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Legal</span>
                  </div>
                  <div className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors mb-1">
                    Privacy Policy
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
                    Learn how your code is processed ephemerally with zero persistent storage.
                  </p>
                </div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] group-hover:text-white font-medium flex items-center gap-1">
                  <span>Read Policy</span>
                  <ArrowLeft className="w-3 h-3 rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Card 5: Terms of Service */}
              <Link
                href="/terms"
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all no-underline group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Legal</span>
                  </div>
                  <div className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors mb-1">
                    Terms of Service
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
                    Fair usage terms, rate limiting rules, and community guidelines.
                  </p>
                </div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] group-hover:text-white font-medium flex items-center gap-1">
                  <span>Read Terms</span>
                  <ArrowLeft className="w-3 h-3 rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Card 6: Quick Return Action */}
              <div
                onClick={() => router.back()}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">Browser</span>
                  </div>
                  <div className="font-semibold text-sm text-white group-hover:text-purple-300 transition-colors mb-1">
                    Previous Page
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
                    Step back one page in your browser history to return to where you were.
                  </p>
                </div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] group-hover:text-white font-medium flex items-center gap-1">
                  <span>Go Back</span>
                  <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Action Bar ───────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-primary no-underline text-xs sm:text-sm py-2.5 px-6 shadow-lg shadow-white/10"
            >
              <Sparkles className="w-4 h-4" />
              <span>Back to Code Explainer</span>
            </Link>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs sm:text-sm py-2.5 px-5 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Previous Page</span>
            </button>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-4 text-center text-xs flex flex-wrap items-center justify-center gap-4 relative z-10"
        style={{
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span>Explain My Code · Universal Plain-English Code Tutor</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
