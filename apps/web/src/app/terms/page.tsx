'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Scale,
  ArrowLeft,
  Code2,
  Shield,
  Zap,
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
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
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            color: '#60a5fa',
          }}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Fair Use & Service Guidelines</span>
        </div>

        <h1
          className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-8">
          Last updated: September 2026 · Effective immediately
        </p>

        {/* Policy Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing and using Explain My Code, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the application.
            </p>
          </section>

          {/* Section 2 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <Scale className="w-5 h-5 text-blue-400" />
              <h2>2. Intellectual Property & Your Code</h2>
            </div>
            <p>
              You retain 100% full ownership and intellectual property rights to any source code snippets you paste into the editor. Explain My Code does not claim any license, trademark, copyright, or ownership over your code submissions.
            </p>
          </section>

          {/* Section 3 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2>3. Educational Use Disclaimer</h2>
            </div>
            <p>
              Explain My Code utilizes advanced large language models (Google Gemini 2.5 Flash) and heuristic static analysis to generate plain-English explanations, narrative logic, and bug reports.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Explanations are intended for educational and reference assistance only.</li>
              <li>AI may occasionally misunderstand nuances in complex code or overlook domain-specific vulnerabilities.</li>
              <li>You should always review, audit, and test code before deploying it to production or safety-critical systems.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2>4. Quotas, Free Tier & Fair Use</h2>
            </div>
            <p>
              To keep the service universally accessible and prevent automated scraping or denial of service:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>A daily limit of 50 requests applies to the free public tier (resetting at Midnight UTC).</li>
              <li>A 15 requests/minute rate limiter protects against rapid concurrent loops.</li>
              <li>When the daily ceiling is reached, requests automatically switch to offline heuristic analysis.</li>
              <li>Attempting to bypass rate limiters or flood the API is prohibited.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="section-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2>5. Limitation of Liability</h2>
            </div>
            <p>
              Explain My Code is provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis without warranties of any kind. Under no circumstances will the creators or maintainers be liable for any direct, indirect, incidental, or consequential damages resulting from the use of or inability to use this service.
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
        <span>Explain My Code · Plain-English Code Tutor</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="text-white font-medium">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
