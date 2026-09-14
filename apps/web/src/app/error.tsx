'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application runtime error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="section-card p-8 max-w-md w-full animate-fade-in border border-red-500/20 bg-red-500/5">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>

        <h2 className="text-xl font-bold mb-2 text-white">Something went wrong</h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          An unexpected error interrupted execution. Your code and session have not been compromised.
        </p>

        {error.message && (
          <div className="text-left font-mono text-[11px] p-3 rounded-lg bg-black/40 border border-white/5 text-red-300 mb-6 overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary text-xs py-2 px-4 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors no-underline"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
