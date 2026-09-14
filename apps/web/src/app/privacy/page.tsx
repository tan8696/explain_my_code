'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  Cpu,
  ArrowLeft,
  FileCheck2,
  HelpCircle,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <Link href="/" className="flex items-center gap-3 no-underline">
          <BrandLogo size={32} withText badge="v2.0" />
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </Link>
      </header>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full animate-fade-in">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            color: '#34d399',
          }}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strict Zero-Retention Code Privacy</span>
        </div>

        <h1
          className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-8">
          Last updated: September 2026 · Effective immediately
        </p>

        {/* Highlight Banner */}
        <div
          className="section-card p-6 mb-10 border border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(52, 211, 153, 0.03) 100%)',
          }}
        >
          <div className="flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-white mb-1">
                Our Core Promise: Your Code Is Never Retained
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                We believe privacy is paramount when working with source code. When you paste code into Explain My Code, it is processed ephemerally in memory to generate an educational explanation and immediately discarded. It is never stored in a database, never shared with third parties for marketing, and never used to train public AI models.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <Lock className="w-5 h-5 text-blue-400" />
              <h2>1. Information We Process</h2>
            </div>
            <p>
              When using Explain My Code, the only data you provide is the source code snippet you choose to submit in the web editor.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>Source Code Input:</strong> We accept snippets up to 50,000 characters. Code is treated strictly as untrusted input data.
              </li>
              <li>
                <strong>No Account or Personal Information:</strong> Explain My Code does not require user accounts, email addresses, credit cards, or logins.
              </li>
              <li>
                <strong>No Tracking Cookies:</strong> We do not use advertising or behavioral tracking cookies.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h2>2. How AI Explanations Are Generated</h2>
            </div>
            <p>
              Depending on backend availability and quota state, code is analyzed in one of two modes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="text-xs font-semibold text-white">Live AI Analysis (Gemini 2.5 Flash)</span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Code is transmitted over encrypted TLS 1.3 to Google Cloud Vertex / Gemini API under strict stateless enterprise API guidelines. Google does not use customer API payloads to train foundational models.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="text-xs font-semibold text-white">Offline Heuristic Fallback</span>
                <p className="text-xs text-[var(--text-secondary)]">
                  When the daily free credit limit is reached or the server operates offline, analysis is performed using local static pattern matching without transmitting any data over the internet.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <Server className="w-5 h-5 text-amber-400" />
              <h2>3. Daily Free-Tier Limit & Usage Telemetry</h2>
            </div>
            <p>
              To maintain free access and protect against Denial of Service or unanticipated cloud billing, our backend maintains an anonymous daily request counter:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>The counter records solely: the current UTC date and the number of requests serviced (e.g. 15/50).</li>
              <li>No user IP addresses, submitted snippets, or session fingerprints are associated with this counter.</li>
              <li>Usage counters automatically reset every day at Midnight UTC.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <h2>4. Client-Side Execution</h2>
            </div>
            <p>
              Code editing, language switching, syntax highlighting, and Markdown report exports happen client-side in your browser using Microsoft&apos;s open-source Monaco Editor. No drafts or keystrokes are sent to our server until you explicitly click <strong>Explain This Code</strong>.
            </p>
          </section>

          {/* Section 5 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <h2>5. Contact & Open Source</h2>
            </div>
            <p>
              Explain My Code is an open developer utility. If you have questions regarding this privacy policy or wish to inspect the complete source code, you can view the open repository on GitHub.
            </p>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link href="/" className="btn-primary no-underline text-xs sm:text-sm py-2.5 px-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Code Explainer</span>
          </Link>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-4 text-center text-xs flex flex-wrap items-center justify-between gap-4 max-w-4xl mx-auto w-full"
        style={{
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <BrandLogo size={18} />
          <span>Explain My Code · Plain-English Code Tutor</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>·</span>
          <Link href="/privacy" className="text-white font-medium">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
