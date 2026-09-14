'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Code2, Search, Cpu } from 'lucide-react';

const ANALYSIS_STEPS = [
  { label: 'Detecting language & parsing syntax tree', icon: Code2 },
  { label: 'Tracing step-by-step narrative logic', icon: Cpu },
  { label: 'Scanning for syntax errors & logical bugs', icon: Search },
  { label: 'Synthesizing plain-English beginner concepts', icon: Sparkles },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Status Banner with Step Progress ──────────────────────── */}
      <div
        className="section-card p-5 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(107, 138, 255, 0.04) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 shrink-0">
              <div
                className="absolute inset-0 rounded-lg border border-white/40 animate-ping opacity-25"
              />
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Gemini AI is analyzing your code
                </span>
                <span className="badge badge-info text-[10px] py-0.5 px-2 font-mono">
                  Stage {currentStep + 1}/4
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {ANALYSIS_STEPS[currentStep].label}…
              </p>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {ANALYSIS_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 transition-all duration-300"
                style={{
                  opacity: idx <= currentStep ? 1 : 0.3,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background:
                      idx < currentStep
                        ? '#34d399'
                        : idx === currentStep
                        ? '#ffffff'
                        : 'rgba(255, 255, 255, 0.2)',
                    boxShadow:
                      idx === currentStep
                        ? '0 0 8px rgba(255, 255, 255, 0.6)'
                        : 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Shimmer progress bar */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-white transition-all duration-500 rounded-full"
            style={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Mock Tab Bar Skeleton ─────────────────────────────────── */}
      <div className="tab-bar">
        {['Summary', 'Line by Line', 'Logic', 'Bugs', 'Concepts', 'Output'].map((tab, i) => (
          <div
            key={i}
            className={`tab-btn flex items-center gap-2 cursor-default ${i === 0 ? 'active' : ''}`}
          >
            <div className="skeleton w-3.5 h-3.5 rounded" />
            <span className="opacity-60">{tab}</span>
          </div>
        ))}
      </div>

      {/* ── Summary Card Skeleton ─────────────────────────────────── */}
      <div className="section-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="skeleton h-5 w-36 rounded-md" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-11/12 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
      </div>

      {/* ── Line-by-Line Breakdown Skeleton ───────────────────────── */}
      <div className="section-card overflow-hidden">
        <div className="px-6 py-3.5 border-b border-white/5 flex items-center justify-between">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="line-row py-3">
              <span className="line-num">{i}</span>
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Concepts Grid Skeleton ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="section-card p-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="skeleton w-4 h-4 rounded-full" />
              <div className="skeleton h-4 w-28 rounded" />
            </div>
            <div className="skeleton h-3.5 w-full rounded" />
            <div className="skeleton h-3.5 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
