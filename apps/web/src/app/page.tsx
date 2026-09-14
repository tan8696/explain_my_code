'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Code2,
  Zap,
  ArrowDown,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Bug,
  Cpu,
  Layers,
  ChevronRight,
  Lock,
  Flame,
  Share2,
} from 'lucide-react';
import { SourceEditor } from '@/components/editor/SourceEditor';
import { ExplanationPanel, ExplanationData, CreditInfo } from '@/components/ExplanationPanel';
import { LoadingState } from '@/components/LoadingState';
import GradientWaves from '@/components/GradientWaves';
import { EditorErrorBoundary } from '@/components/EditorErrorBoundary';
import { ScrollReveal } from '@/components/ScrollReveal';
import { MobileNav } from '@/components/MobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HistorySidebar } from '@/components/HistorySidebar';
import { useExplanationHistory, HistoryEntry } from '@/hooks/useExplanationHistory';

import { detectLanguage, getPresetExplanation, heuristicAnalysis } from '@/lib/ai-engine';

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const isLocalhostHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // If running on a deployed host, ignore localhost references
    if (!isLocalhostHost && envUrl && envUrl.includes('localhost')) {
      return '';
    }
    // Prevent mixed content blocks on HTTPS
    if (window.location.protocol === 'https:' && envUrl?.startsWith('http://')) {
      return '';
    }
  }
  return envUrl || '';
};

/* ── Language map for Monaco syntax highlighting ───────────────────── */
const LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  'c++': 'cpp',
  cpp: 'cpp',
  c: 'c',
  'c#': 'csharp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  html: 'html',
  css: 'css',
  sql: 'sql',
  shell: 'shell',
  bash: 'shell',
  r: 'r',
  dart: 'dart',
  lua: 'lua',
  perl: 'perl',
  scala: 'scala',
};

/* ── Interactive Preset Code Snippets ──────────────────────────────── */
const PRESETS = [
  {
    id: 'python-greet',
    label: '🐍 Python: Greeting',
    lang: 'python',
    code: `def greet(name):
    if name == "":
        print("Hello, stranger!")
    else:
        print(f"Hello, {name}!")

greet("Alice")
greet("")`,
  },
  {
    id: 'python-bug',
    label: '⚠️ Python: Division Bug',
    lang: 'python',
    code: `def divide_numbers(a, b):
    # Bug: Division by zero will crash
    return a / b

result = divide_numbers(10, 0)
print(f"Result: {result}")`,
  },
  {
    id: 'js-filter',
    label: '⚡ JS: Array Filter',
    lang: 'javascript',
    code: `const numbers = [1, 2, 3, 4, 5, 6];

// Filter out only even numbers
const evens = numbers.filter(n => n % 2 === 0);

console.log("Even numbers:", evens);`,
  },
  {
    id: 'cpp-fibonacci',
    label: '🔢 C++: Fibonacci',
    lang: 'cpp',
    code: `#include <iostream>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int count = 5;
    std::cout << "Fibonacci of 5: " << fibonacci(count) << std::endl;
    return 0;
}`,
  },
  {
    id: 'sql-query',
    label: '🗄️ SQL: Query Users',
    lang: 'sql',
    code: `SELECT user_id, username, email, signup_date
FROM users
WHERE is_active = true
ORDER BY signup_date DESC
LIMIT 10;`,
  },
  {
    id: 'py-bst',
    label: '🌳 Python: Binary Search Tree',
    lang: 'python',
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
        else:
            self._insert_rec(self.root, val)

    def _insert_rec(self, node, val):
        if val < node.val:
            if node.left is None:
                node.left = TreeNode(val)
            else:
                self._insert_rec(node.left, val)
        else:
            if node.right is None:
                node.right = TreeNode(val)
            else:
                self._insert_rec(node.right, val)

    def inorder(self, node):
        if not node:
            return []
        return self.inorder(node.left) + [node.val] + self.inorder(node.right)

bst = BinarySearchTree()
for x in [5, 3, 7, 2, 4]:
    bst.insert(x)
print(bst.inorder(bst.root))`,
  },
  {
    id: 'py-lru-cache',
    label: '⚠️ Python: LRU Cache (Mutable Bug)',
    lang: 'python',
    code: `class LRUCache:
    # Bug: Mutable default argument shared across all instances!
    def __init__(self, capacity=3, cache={}):
        self.capacity = capacity
        self.cache = cache

    def get(self, key):
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key, value):
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        self.cache[key] = value

cache = LRUCache(2)
cache.put(1, 100)
print(cache.get(1))`,
  },
  {
    id: 'ts-async-fetch',
    label: '⚡ TS: Async Fetch & Backoff',
    lang: 'typescript',
    code: `async function fetchWithRetry(url: string, retries: number = 3, delay: number = 1000): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(\`HTTP Error: \${response.status}\`);
        }
        return await response.json();
    } catch (error) {
        if (retries <= 0) {
            console.error("All retries exhausted:", error);
            throw error;
        }
        console.warn(\`Request failed. Retrying in \${delay}ms...\`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, retries - 1, delay * 2);
    }
}`,
  },
];

/* ── Supported Languages List ──────────────────────────────────────── */
const SUPPORTED_LANGS = [
  'Python',
  'TypeScript',
  'JavaScript',
  'Rust',
  'Go',
  'C++',
  'Java',
  'SQL',
  'C#',
  'Kotlin',
  'Swift',
  'Ruby',
  'PHP',
  'Bash',
  'HTML/CSS',
];

export default function Home() {
  const [code, setCode] = useState(PRESETS[0].code);
  const [activePreset, setActivePreset] = useState<string>(PRESETS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExplanationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editorLang, setEditorLang] = useState('python');
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [isResettingCredits, setIsResettingCredits] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // History hook
  const { history, addEntry, removeEntry, clearHistory } = useExplanationHistory();

  // API response cache (LRU in memory)
  const cacheRef = useRef<Map<string, ExplanationData>>(new Map());
  const MAX_CACHE = 30;

  const getCacheKey = (codeStr: string) => {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < codeStr.length; i++) {
      const chr = codeStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `h_${hash}`;
  };

  useEffect(() => {
    let active = true;
    const fetchLatestCredits = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/v1/usage`);
        if (res.ok && active) {
          const data: CreditInfo = await res.json();
          setCredits(data);
        }
      } catch {
        // Route handler may be initializing
      }
    };
    fetchLatestCredits();
    return () => {
      active = false;
    };
  }, []);

  const handleResetCredits = async () => {
    setIsResettingCredits(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/usage/reset`, { method: 'POST' });
      if (res.ok) {
        const data: CreditInfo = await res.json();
        setCredits(data);
      }
    } catch (e) {
      console.error('Failed to reset credits:', e);
    } finally {
      setIsResettingCredits(false);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    setCode(preset.code);
    setEditorLang(preset.lang);
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setCode('');
    setActivePreset('');
    setResult(null);
    setError(null);
  };

  const handleExplain = useCallback(async () => {
    if (!code.trim()) return;

    // Check cache first
    const key = getCacheKey(code.trim());
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResult(cached);
      setError(null);
      if (cached.credits) setCredits(cached.credits);
      const detected = cached.language.toLowerCase();
      setEditorLang(LANGUAGE_MAP[detected] || 'plaintext');
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data: ExplanationData = await res.json();
      setResult(data);

      // Cache the response
      cacheRef.current.set(key, data);
      if (cacheRef.current.size > MAX_CACHE) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey) cacheRef.current.delete(firstKey);
      }

      // Save to history
      addEntry(code, data.language, data.summary, data.bugs?.length || 0, data);

      if (data.credits) {
        setCredits(data.credits);
      }

      // Update editor language based on AI detection
      const detected = data.language.toLowerCase();
      const monacoLang = LANGUAGE_MAP[detected] || 'plaintext';
      setEditorLang(monacoLang);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (err: unknown) {
      console.warn('Network call failed, activating resilient offline heuristic engine:', err);
      try {
        const detected = detectLanguage(code.trim());
        const fallback = getPresetExplanation(code.trim(), detected) || heuristicAnalysis(code.trim());
        fallback.credits = {
          limit: 50,
          used: 0,
          remaining: 50,
          isLimitReached: false,
          quotaExhausted: false,
          reason: 'Running in resilient offline mode.',
          mode: 'offline_heuristic',
          resetAt: 'Midnight UTC',
        };
        setResult(fallback);
        cacheRef.current.set(key, fallback);
        addEntry(code, fallback.language, fallback.summary, fallback.bugs?.length || 0, fallback);
        setEditorLang(LANGUAGE_MAP[fallback.language.toLowerCase()] || 'plaintext');
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      } catch (fallbackErr) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to analyze code. Please check your input or connection.';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [code, addEntry]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter → Explain
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExplain();
      }
      // Ctrl/Cmd + K → Focus editor
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        editorRef.current?.querySelector('textarea')?.focus();
      }
      // Escape → Clear results
      if (e.key === 'Escape' && result) {
        setResult(null);
        setError(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleExplain, result]);

  // Share handler
  const handleShare = useCallback(async () => {
    try {
      const encoded = btoa(encodeURIComponent(code));
      const shareUrl = `${window.location.origin}?code=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(null), 2500);
    } catch {
      setShareMsg('Copy failed');
      setTimeout(() => setShareMsg(null), 2500);
    }
  }, [code]);

  // Load shared code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    if (sharedCode) {
      try {
        const decoded = decodeURIComponent(atob(sharedCode));
        setCode(decoded);
        setActivePreset('');
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        // Invalid shared code, ignore
      }
    }
  }, []);

  // Handle history entry selection
  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setCode(entry.code);
    setActivePreset('');
    setResult(entry.result as ExplanationData);
    setError(null);
    const detected = entry.language.toLowerCase();
    setEditorLang(LANGUAGE_MAP[detected] || 'plaintext');
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-deep)] text-[var(--text-primary)]">
      {/* ── Sticky Top Navigation ──────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 px-6 py-3.5 backdrop-blur-xl border-b transition-colors"
        style={{
          background: 'rgba(6, 6, 12, 0.75)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                }}
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
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
              How It Works
            </a>
            <a href="#workspace" className="hover:text-[var(--text-primary)] transition-colors">
              Workspace
            </a>
            <a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {/* AI Free Tier Credit Tracker — skeleton while loading */}
            {!credits && <div className="credit-skeleton hidden sm:block" />}
            {credits && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all shadow-sm"
                style={{
                  background: credits.isLimitReached
                    ? 'rgba(239, 68, 68, 0.12)'
                    : credits.remaining <= 10
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: credits.isLimitReached
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : credits.remaining <= 10
                    ? '1px solid rgba(245, 158, 11, 0.35)'
                    : '1px solid var(--border-subtle)',
                }}
                title={`Free Tier Protection: ${credits.used}/${credits.limit} used. Resets at ${credits.resetAt}.`}
              >
                {credits.isLimitReached ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                <span
                  className="font-medium"
                  style={{
                    color: credits.isLimitReached
                      ? '#fca5a5'
                      : credits.remaining <= 10
                      ? '#fcd34d'
                      : 'var(--text-secondary)',
                  }}
                >
                  {credits.isLimitReached
                    ? 'Free Limit Reached'
                    : `${credits.remaining}/${credits.limit} Free Credits`}
                </span>

                {/* Dev Reset Button */}
                <button
                  onClick={handleResetCredits}
                  disabled={isResettingCredits}
                  className="ml-1 p-0.5 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="Reset daily credits (Dev/Testing)"
                  aria-label="Reset daily credits"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isResettingCredits ? 'animate-spin text-blue-400' : ''}`}
                  />
                </button>
              </div>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            <a
              href="#workspace"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[var(--white-subtle)] hover:bg-[rgba(255,255,255,0.15)] text-[var(--text-primary)] transition-all border border-[var(--border-subtle)] cursor-pointer shadow-sm"
            >
              <span>Try Explainer</span>
              <ChevronRight className="w-3 h-3" />
            </a>

            {/* Mobile hamburger */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ── Hero section with <GradientWaves /> Background ─────────── */}
      <section className="relative w-full overflow-hidden border-b border-white/5 min-h-[620px] lg:min-h-[700px] flex items-center justify-center">
        {/* React Bits GradientWaves Component */}
        <div className="absolute inset-0 z-0">
          <GradientWaves
            horizonColor="#5227FF"
            waveColor="#FF9FFC"
            crestColor="#FFFFFF"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1.0}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1.0}
            opacity={1.0}
            mouseInteraction={true}
            parallaxStrength={0.5}
            grain={true}
            grainIntensity={0.05}
          />
          {/* Subtle dark vignette mask to blend into theme */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(6, 6, 12, 0.2) 0%, rgba(6, 6, 12, 0.75) 75%, #06060c 100%)',
            }}
          />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 px-6 py-20 text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-6 animate-fade-in shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Next-Gen AI Code Deconstruction
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Main Title */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-delay-1"
            style={{ lineHeight: 1.12 }}
          >
            Understand Any Code <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ffd6fa 50%, #9ca3af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              in Plain English
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-200/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal animate-fade-in-delay-2 drop-shadow-md">
            Demystify complex algorithms, legacy codebases, and confusing stack traces.
            Receive instant line-by-line walk-throughs, architecture flows, and bug detections in zero jargon.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-delay-3">
            <a
              href="#workspace"
              className="btn-primary cursor-pointer text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-purple-600 transition-transform group-hover:rotate-12" />
              <span>Launch Live Workspace</span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>

            <a
              href="#features"
              className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-medium text-white/90 bg-white/5 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all shadow-md"
            >
              Explore Features
            </a>
          </div>

          {/* Metrics Ribbon */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-8 border-t border-white/10 animate-fade-in-delay-4">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">&lt; 800ms</span>
              <span className="text-xs text-white/60">Sub-second Latency</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">25+</span>
              <span className="text-xs text-white/60">Languages Handled</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">100%</span>
              <span className="text-xs text-white/60">Zero Retention</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">50 / Day</span>
              <span className="text-xs text-white/60">Free Tier Limit Guard</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Supported Languages Strip ──────────────────────────────── */}
      <section className="py-6 border-b border-white/5 bg-[#080912]/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono mr-2">
            Native Support:
          </span>
          {SUPPORTED_LANGS.map((lang) => (
            <span
              key={lang}
              className="text-xs px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all font-mono"
            >
              {lang}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features Bento Section ─────────────────────────────────── */}
      <ScrollReveal>
      <section id="features" className="scroll-mt-20 py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-pink-400">
            Engineered For Clarity
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 mb-4">
            Everything you need to master unfamiliar code
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Built with modern LLMs and semantic AST heuristics to ensure you get clear explanations, not generic regurgitations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Line by Line */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Line-by-Line Micro-Analysis</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Breaks down execution flow one statement at a time. Highlights variable bindings, function calls, and control branches in crystal-clear prose.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-blue-400/90 font-medium flex items-center gap-1">
              <span>Synchronized with editor cursor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Bug & Vulnerability Spotting */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Bug className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Flaw & Bug Detection</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Flags dangerous patterns before they hit production: unhandled division-by-zero, mutable default arguments, memory leaks, and silent promise rejections.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-amber-400/90 font-medium flex items-center gap-1">
              <span>Actionable copyable code patches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Logic Narrative */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Algorithmic Narrative</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Converts cryptic loops, recursion, and dynamic programming into intuitive, step-by-step conceptual walkthroughs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-purple-400/90 font-medium flex items-center gap-1">
              <span>Explains the &quot;why&quot;, not just the &quot;what&quot;</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Big-O Complexity */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Big-O Complexity Scoring</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Estimates worst-case Time and Space complexity. Outlines algorithmic scalability and pinpoints performance bottlenecks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-emerald-400/90 font-medium flex items-center gap-1">
              <span>Time & Space optimization suggestions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Zero Data Retention */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Zero-Retention Security</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Your intellectual property is never stored on disk, never cataloged in databases, and never used to train public machine learning models.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-sky-400/90 font-medium flex items-center gap-1">
              <span>Ephemeral RAM processing only</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: AI Quota Guard */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Free-Tier Cost Shield</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Smart token and request throttling keeps your usage within Gemini’s generous free quota. Zero risk of unexpected billing surges.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-rose-400/90 font-medium flex items-center gap-1">
              <span>50 daily requests with instant reset</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── How It Works Section ───────────────────────────────────── */}
      <ScrollReveal delay={100}>
      <section id="how-it-works" className="scroll-mt-20 py-16 px-6 max-w-5xl mx-auto w-full border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Three steps from confusion to mastery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-white text-base mb-4 shadow-inner">
              01
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Paste or Choose Sample</h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Drop any snippet into the Monaco editor or select one of our preset algorithms.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-white text-base mb-4 shadow-inner">
              02
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Deep Semantic Parsing</h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Gemini 2.5 Flash analyzes syntax, logic paths, potential side-effects, and bugs.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-white text-base mb-4 shadow-inner">
              03
            </div>
            <h4 className="text-base font-semibold text-white mb-1.5">Inspect & Learn</h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Review line-by-line annotations, logic flow, and copy bug fixes with one click.
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── Interactive Workspace Section ──────────────────────────── */}
      <section id="workspace" className="scroll-mt-20 pt-16 pb-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 font-mono mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Playground</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Try It Right Now
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Select a preset snippet below or paste your own proprietary code to deconstruct it.
          </p>

          {/* Presets Chips Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                style={{
                  background:
                    activePreset === preset.id
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)',
                  border:
                    activePreset === preset.id
                      ? '1px solid rgba(255, 255, 255, 0.35)'
                      : '1px solid var(--border-subtle)',
                  color:
                    activePreset === preset.id
                      ? '#ffffff'
                      : 'var(--text-secondary)',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="glass-card overflow-hidden shadow-2xl">
          {/* Editor Toolbar */}
          <div
            className="flex items-center justify-between px-4 sm:px-5 py-2.5"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              {/* Traffic Light Dots */}
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              </div>
              <span className="text-xs font-mono hidden sm:inline text-[var(--text-muted)]">
                Source Editor
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs hidden sm:inline text-[var(--text-muted)]">
                  Language:
                </span>
                <select
                  value={editorLang}
                  onChange={(e) => setEditorLang(e.target.value)}
                  className="text-xs px-2.5 py-1 rounded bg-[#131726] border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="sql">SQL</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              {/* Clear button */}
              {code && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors px-2 py-1 rounded hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
                  title="Clear editor code"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}

              {result && (
                <span className="badge badge-language text-xs">
                  {result.language}
                </span>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div ref={editorRef} className="h-[min(340px,50vh)] sm:h-[400px]">
            <EditorErrorBoundary>
              <SourceEditor
                code={code}
                onChange={(val) => {
                  setCode(val || '');
                  if (activePreset) setActivePreset('');
                }}
                language={editorLang}
              />
            </EditorErrorBoundary>
          </div>

          {/* Bottom Control Bar */}
          <div
            className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-3"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              {credits?.isLimitReached ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-300/90 font-medium">
                    Free quota limit reached ({credits.used}/{credits.limit}) · Resets at midnight UTC
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs text-[var(--text-secondary)]">
                    Zero retention · Fully confidential · Gemini 2.5 Flash
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Share button */}
              {code.trim() && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--white-subtle)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                  title="Copy shareable link to clipboard"
                  aria-label="Share code as link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{shareMsg || 'Share'}</span>
                </button>
              )}

              <button
                className="btn-primary cursor-pointer text-sm font-semibold"
                onClick={handleExplain}
                disabled={isLoading || !code.trim()}
                title="Ctrl+Enter"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading
                  ? 'Analyzing…'
                  : credits?.isLimitReached
                  ? 'Explain (Quota Guard)'
                  : 'Explain This Code'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results Display Section ────────────────────────────────── */}
      <section
        id="results"
        className="scroll-mt-20 px-4 sm:px-6 pb-20 max-w-6xl mx-auto w-full"
      >
        {isLoading && <LoadingState />}

        {error && (
          <div
            className="section-card p-5 animate-fade-in"
            style={{
              border: '1px solid rgba(248, 113, 113, 0.2)',
              background: 'rgba(248, 113, 113, 0.05)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>
              {error}
            </p>
          </div>
        )}

        {result && !isLoading && <ExplanationPanel data={result} code={code} />}

        {!result && !isLoading && !error && (
          <div className="text-center py-12">
            <ArrowDown
              className="w-6 h-6 mx-auto mb-3"
              style={{ color: 'var(--text-muted)', opacity: 0.5 }}
            />
            <p className="text-sm text-[var(--text-muted)]">
              Click <strong className="text-white font-semibold">Explain This Code</strong> above to view line-by-line annotations, logic flow, and bug flags.
            </p>
          </div>
        )}
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────── */}
      <ScrollReveal delay={50}>
      <section id="faq" className="scroll-mt-20 py-20 px-6 max-w-4xl mx-auto w-full border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
            Answers & Clarity
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Is my code stored or used to train AI models?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              No. We enforce a strict Zero Data Retention policy. Your code is processed in transient volatile RAM exclusively for the duration of the API call and is immediately wiped. We never save your code to disk or training sets.
            </p>
          </div>

          <div className="glass-card p-5">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              How does the 50 Free Credit Limit work?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              To keep the platform 100% free without unexpected cloud billing surges, each user receives 50 free explanations per 24-hour cycle. If you hit the limit, our server activates an offline guard and resets at midnight UTC.
            </p>
          </div>

          <div className="glass-card p-5">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Bug className="w-4 h-4 text-amber-400" />
              Can it catch subtle logic bugs and edge cases?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Yes! Explain My Code detects common pitfalls like division by zero, mutable default arguments in Python, off-by-one errors in loops, missing null checks, and unhandled Promise rejections.
            </p>
          </div>

          <div className="glass-card p-5">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-pink-400" />
              Which programming languages are supported?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Over 25+ languages are supported, including Python, JavaScript, TypeScript, C++, C, Java, Go, Rust, SQL, C#, Kotlin, Swift, Ruby, PHP, Bash, and HTML/CSS. The engine automatically detects the language if you do not specify it.
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="mt-auto px-6 py-8 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto w-full border-t"
        style={{
          color: 'var(--text-muted)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          <span>© {new Date().getFullYear()} Explain My Code · Built with Next.js 16, FastAPI & Gemini 2.5 Flash</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
            Terms of Service
          </Link>
          <span>·</span>
          <a
            href="https://github.com/tan8696/explain_my_code"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            GitHub
          </a>
          <span>·</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            API v2.0 Live
          </span>
        </div>
      </footer>

      {/* ── History Sidebar ─────────────────────────────────────────── */}
      <HistorySidebar
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeEntry}
        onClear={clearHistory}
      />
    </div>
  );
}
