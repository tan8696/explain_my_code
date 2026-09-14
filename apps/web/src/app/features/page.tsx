'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Globe,
  BookOpen,
  ListOrdered,
  Bug,
  Lightbulb,
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const FEATURES = [
  {
    icon: <Globe className="w-6 h-6 text-cyan-400" />,
    title: 'Universal Language Support',
    desc: 'Understand code written in Python, JavaScript, TypeScript, C++, Rust, Go, Java, SQL, C#, Kotlin, Swift, Ruby, PHP, Bash, HTML, CSS, and more. Automatic language detection works seamlessly.',
    tag: '25+ Languages',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-violet-400" />,
    title: 'Plain-English Deconstruction',
    desc: 'Transforms dense code into approachable stories tailored for beginners. Uses relatable analogies like shopping lists and toy boxes rather than intimidating academic jargon.',
    tag: 'Beginner-Friendly',
  },
  {
    icon: <ListOrdered className="w-6 h-6 text-blue-400" />,
    title: 'Line-by-Line Micro Explanations',
    desc: 'Every single line of code is mapped to its exact mechanical purpose. Hover or inspect lines to see what each keyword, parameter, and symbol is doing in runtime memory.',
    tag: 'Deep Inspection',
  },
  {
    icon: <Bug className="w-6 h-6 text-rose-400" />,
    title: 'Runtime Bug & Security Scanner',
    desc: 'Flags fatal runtime bugs like division by zero, Python mutable default arguments, comparison errors, off-by-one index crashes, and unhandled Promise rejections with one-click fixes.',
    tag: 'Automatic Fixes',
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-amber-400" />,
    title: 'Core Concept Extraction',
    desc: 'Identifies foundational computer science concepts implemented in your code (Recursion, Memoization, Higher-Order Functions, OOP) and teaches them with one-sentence definitions.',
    tag: 'Learn as You Code',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    title: 'Zero-Retention Ephemeral Privacy',
    desc: 'Your proprietary source code is processed strictly in memory and discarded the instant the response finishes. Code is never stored, indexed, or used to train public models.',
    tag: '100% Private',
  },
];

const COMPARISON = [
  {
    feature: 'Beginner-friendly plain English',
    us: true,
    rawChat: 'Hit or miss',
    docs: false,
  },
  {
    feature: 'Line-by-line mechanical mapping',
    us: true,
    rawChat: 'Vague summaries',
    docs: false,
  },
  {
    feature: 'Automatic runtime bug & security detection',
    us: true,
    rawChat: 'Only if prompted',
    docs: false,
  },
  {
    feature: 'Zero-cost offline heuristic fallback',
    us: true,
    rawChat: false,
    docs: false,
  },
  {
    feature: 'Zero retention code confidentiality',
    us: true,
    rawChat: 'Stored / Trained on',
    docs: 'Public',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Engine Features & Capabilities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Everything You Need to Understand Code Fast
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Built from the ground up for developers, students, and code reviewers who need fast,
            unambiguous clarity on any source code without technical jargon.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/workspace"
              className="btn-primary text-sm py-3 px-6 shadow-xl no-underline"
              style={{
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.3)',
              }}
            >
              <span>Try Features in Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {FEATURES.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-[var(--text-muted)] border border-white/5">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="glass-card p-8 rounded-2xl mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
            Why Developers Choose Explain My Code
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] text-center mb-8 max-w-xl mx-auto">
            Traditional AI chatbots hallucinate and official documentation is full of impenetrable academic jargon.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[var(--text-muted)] font-mono text-xs">
                  <th className="pb-3">Capability</th>
                  <th className="pb-3 text-cyan-400 font-semibold">Explain My Code</th>
                  <th className="pb-3">Generic AI Chat</th>
                  <th className="pb-3">Official Docs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-4 font-medium text-white">{row.feature}</td>
                    <td className="py-4 text-cyan-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Included</span>
                    </td>
                    <td className="py-4 text-[var(--text-secondary)]">
                      {typeof row.rawChat === 'boolean' ? (
                        row.rawChat ? 'Yes' : 'No'
                      ) : (
                        row.rawChat
                      )}
                    </td>
                    <td className="py-4 text-[var(--text-secondary)]">
                      {typeof row.docs === 'boolean' ? (
                        row.docs ? 'Yes' : 'No'
                      ) : (
                        row.docs
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div
          className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(167, 139, 250, 0.12) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Deconstruct Your Code?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Free tier includes 50 analyses per day. Zero setup, no credit card required.
          </p>
          <Link
            href="/workspace"
            className="btn-primary inline-flex items-center gap-2 text-sm py-3 px-8 no-underline shadow-xl"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
