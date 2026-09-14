'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Code2,
  Workflow,
  Cpu,
  Layers,
  FileCheck2,
  Terminal,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const STEPS = [
  {
    num: '01',
    title: 'Ephemeral Code Ingestion',
    desc: 'When you submit a snippet, the code is loaded temporarily into memory on an isolated execution thread. We treat all code as untrusted input. It is never persisted into any database, never cached on disk, and never shared.',
    badge: 'Privacy First',
  },
  {
    num: '02',
    title: 'Free-Tier Guard & Rate Limiting',
    desc: 'The AICreditManager inspects your sliding-window rate limit (15 requests per minute) and daily quota (50 requests/day). This prevents API exhaustion and guarantees zero surprise charges.',
    badge: 'Reliability',
  },
  {
    num: '03',
    title: 'Dual-Engine Deconstruction (AI + Heuristics)',
    desc: 'The request executes via Google Gemini 2.5 Flash using structured JSON generation with beginner-friendly pedagogy. If offline or if quota limits trigger, our custom AST heuristic engine kicks in seamlessly with zero downtime.',
    badge: 'Resilience',
  },
  {
    num: '04',
    title: '6-Layer Report Synthesis',
    desc: 'The output is parsed into six distinct pedagogical perspectives: a plain English summary, line-by-line mechanical annotations, a narrative execution story, a bug/security scanner, computer science concepts, and simulated terminal output.',
    badge: 'Multi-Perspective',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-mono mb-4">
            <Workflow className="w-3.5 h-3.5 text-violet-400" />
            <span>Architecture & Execution Pipeline</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            How Explain My Code Deconstructs Your Code
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            A look under the hood at our dual-engine architecture combining Google Gemini 2.5 Flash,
            sliding-window rate protection, and zero-cost offline heuristic fallbacks.
          </p>
        </div>

        {/* Architecture Diagram Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl mb-16">
          <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>Execution Flow</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-cyan-400 font-mono text-xs mb-1">Step 1</div>
              <div className="font-semibold text-white text-sm mb-1">Browser Client</div>
              <div className="text-[11px] text-[var(--text-muted)]">Next.js 16 Monaco Editor</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-violet-400 font-mono text-xs mb-1">Step 2</div>
              <div className="font-semibold text-white text-sm mb-1">Credit Guard</div>
              <div className="text-[11px] text-[var(--text-muted)]">15 RPM & Quota Check</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-blue-400 font-mono text-xs mb-1">Step 3</div>
              <div className="font-semibold text-white text-sm mb-1">Gemini / Heuristic</div>
              <div className="text-[11px] text-[var(--text-muted)]">Structured JSON Engine</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-emerald-400 font-mono text-xs mb-1">Step 4</div>
              <div className="font-semibold text-white text-sm mb-1">Interactive UI</div>
              <div className="text-[11px] text-[var(--text-muted)]">6 Breakdown Dimensions</div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Deep Dive */}
        <div className="space-y-6 mb-16">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-start gap-6 hover:border-white/20 transition-all"
            >
              <div className="text-3xl sm:text-4xl font-black font-mono text-white/20 shrink-0">
                {step.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-cyan-300 border border-white/10">
                    {step.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-10">
          <Link
            href="/workspace"
            className="btn-primary inline-flex items-center gap-2 text-sm py-3 px-8 shadow-xl no-underline"
          >
            <span>Launch Interactive Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
