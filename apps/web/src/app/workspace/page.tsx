'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  RotateCcw,
  History as HistoryIcon,
  Flame,
  Share2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SourceEditor } from '@/components/editor/SourceEditor';
import { ExplanationPanel, ExplanationData, CreditInfo } from '@/components/ExplanationPanel';
import { LoadingState } from '@/components/LoadingState';
import { EditorErrorBoundary } from '@/components/EditorErrorBoundary';
import { HistorySidebar } from '@/components/HistorySidebar';
import { useExplanationHistory, HistoryEntry } from '@/hooks/useExplanationHistory';
import { detectLanguage, getPresetExplanation, heuristicAnalysis } from '@/lib/ai-engine';

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const isLocalhostHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhostHost && envUrl && envUrl.includes('localhost')) {
      return '';
    }
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

/* ── Presets ───────────────────────────────────────────────────────── */
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
    label: '🗄️ SQL: User Query',
    lang: 'sql',
    code: `SELECT user_id, username, email, signup_date
FROM users
WHERE is_active = true
ORDER BY signup_date DESC
LIMIT 10;`,
  },
  {
    id: 'python-bst',
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
    id: 'python-lru',
    label: '💾 Python: LRU Cache Bug',
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
    id: 'ts-retry',
    label: '🔄 TS: Async Retry & Backoff',
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

export default function WorkspacePage() {
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
    let hash = 0;
    for (let i = 0; i < codeStr.length; i++) {
      const chr = codeStr.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
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
        // Route handler may be starting
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

      cacheRef.current.set(key, data);
      if (cacheRef.current.size > MAX_CACHE) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey) cacheRef.current.delete(firstKey);
      }

      addEntry(code, data.language, data.summary, data.bugs?.length || 0, data);

      if (data.credits) {
        setCredits(data.credits);
      }

      const detected = data.language.toLowerCase();
      const monacoLang = LANGUAGE_MAP[detected] || 'plaintext';
      setEditorLang(monacoLang);

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
      } catch {
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

  // Keyboard shortcut: Ctrl/Cmd + Enter to trigger explanation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExplain();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExplain]);

  const handleShare = () => {
    if (!result) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg('Link copied to clipboard!');
      setTimeout(() => setShareMsg(null), 2500);
    });
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setCode(entry.code);
    setActivePreset('');
    setResult((entry.result as ExplanationData) || null);
    setError(null);
    const detected = entry.language.toLowerCase();
    setEditorLang(LANGUAGE_MAP[detected] || 'plaintext');
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar
        credits={credits}
        onResetCredits={handleResetCredits}
        isResettingCredits={isResettingCredits}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Workspace Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold">
                AI Code Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Interactive Code Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Paste arbitrary code or pick a preset to deconstruct syntax, logic flow, and security bugs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const sidebar = document.getElementById('history-sidebar');
                if (sidebar) sidebar.classList.toggle('translate-x-full');
              }}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
              title="View your recent code explanation history"
            >
              <HistoryIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>History</span>
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                  {history.length}
                </span>
              )}
            </button>
            {result && (
              <button
                onClick={handleShare}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
                title="Share this explanation"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{shareMsg || 'Share'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Presets Chips Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono text-[var(--text-muted)]">Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
        <div className="glass-card overflow-hidden shadow-2xl mb-8">
          {/* Editor Toolbar */}
          <div
            className="flex items-center justify-between px-4 sm:px-5 py-2.5"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
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
          <div ref={editorRef} className="h-[380px] sm:h-[480px]">
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
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs text-[var(--text-secondary)]">
                    Zero retention · Fully confidential · Gemini 2.5 Flash
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] font-mono">
                ⌘ + Enter
              </span>
              <button
                onClick={handleExplain}
                disabled={isLoading || !code.trim()}
                className="btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
                }}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin shrink-0" />
                    <span>Analyzing Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Explain This Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="mb-12">
            <LoadingState />
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="banner banner-error mb-8 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-rose-300">Explanation Notice</h4>
              <p className="text-xs text-rose-200/80 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-rose-300 hover:text-white cursor-pointer px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results / Explanation Panel */}
        {result && (
          <div id="results" className="mb-12 scroll-mt-24">
            <ExplanationPanel data={result} code={code} />
          </div>
        )}
      </main>

      <Footer />

      {/* History Sidebar */}
      <HistorySidebar
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeEntry}
        onClear={clearHistory}
      />
    </div>
  );
}
