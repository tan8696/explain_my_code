'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Sparkles, ArrowRight, Cpu, HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollReveal } from '@/components/ScrollReveal';

const GradientWaves = dynamic(() => import('@/components/GradientWaves'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-transparent" />,
});

export default function HomePage() {
  const router = useRouter();

  // Automatic hash redirection for backward compatibility (e.g. #workspace -> /workspace)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#workspace') {
        router.replace('/workspace');
      } else if (hash === '#features') {
        router.replace('/features');
      } else if (hash === '#how-it-works') {
        router.replace('/how-it-works');
      } else if (hash === '#faq') {
        router.replace('/faq');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-200 relative overflow-hidden bg-[#0c0418]">
      {/* Fullscreen GradientWaves WebGL Dynamic Horizon Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
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
          fogDepth={18}
          detail="medium"
          brightness={1.3}
          opacity={1.0}
          mouseInteraction={true}
          parallaxStrength={0.5}
          grain={true}
          grainIntensity={0.05}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-16 pb-24">
          {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 pt-4 sm:pt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-cyan-300 font-mono mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Universal AI Code Tutor · Powered by Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Understand Any Code in{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #38bdf8 0%, #a78bfa 50%, #f472b6 100%)',
              }}
            >
              Simple English
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-8">
            Transform confusing source code into simple, relatable stories. Line-by-line mechanical
            explanations, automated runtime bug detection, and core concepts with zero academic jargon.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="btn-primary w-full sm:w-auto text-sm py-3.5 px-8 shadow-2xl flex items-center justify-center gap-2.5 no-underline group"
              style={{
                boxShadow: '0 0 30px rgba(56, 189, 248, 0.35)',
              }}
            >
              <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Launch Studio Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/features"
              className="btn-secondary w-full sm:w-auto text-sm py-3.5 px-6 no-underline text-center"
            >
              <span>Explore Features</span>
            </Link>
          </div>

          {/* Social Proof / Metrics Badge */}
          <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">25+</div>
              <div className="text-[11px] text-[var(--text-muted)]">Languages Supported</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">50 / day</div>
              <div className="text-[11px] text-[var(--text-muted)]">Free Tier Quota</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-fuchsia-300">0 KB</div>
              <div className="text-[11px] text-[var(--text-muted)]">Zero Code Retained</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">&lt; 1.5s</div>
              <div className="text-[11px] text-[var(--text-muted)]">Response Speed</div>
            </div>
          </div>
        </div>

        {/* Live Visual Showcase Preview Card */}
        <ScrollReveal>
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-24">
            <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)] ml-2 hidden sm:inline">
                  Interactive Preview: Division by Zero & Bug Detection
                </span>
              </div>

              <Link
                href="/workspace"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 no-underline"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
              {/* Left Column: Code Input */}
              <div className="p-6 font-mono text-xs leading-relaxed text-slate-300 bg-[#070913]">
                <div className="text-cyan-400/80 mb-2 text-[11px]"># Python Code Example</div>
                <div className="text-violet-400">def <span className="text-blue-300">divide_numbers</span>(a, b):</div>
                <div className="text-slate-500 pl-4"># Bug: Zero denominator triggers runtime crash</div>
                <div className="text-slate-300 pl-4"><span className="text-rose-400">return</span> a / b</div>
                <div className="mt-3 text-slate-400">result = <span className="text-blue-300">divide_numbers</span>(10, 0)</div>
                <div className="text-slate-400">print(f<span className="text-emerald-300">&quot;Result: &#123;result&#125;&quot;</span>)</div>
              </div>

              {/* Right Column: AI Output */}
              <div className="p-6 bg-white/[0.01]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-error text-[10px]">1 Critical Bug Caught</span>
                  <span className="badge badge-info text-[10px]">Python</span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-1.5">
                  Simple English Explanation:
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  This program sets up a division calculation between two numbers, but contains a fatal
                  runtime error because it tries to divide by zero on line 4, which is mathematically
                  impossible.
                </p>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
                  <div className="font-semibold text-rose-300 mb-0.5">⚠️ ZeroDivisionError on Line 3</div>
                  <div>Add a defensive check: <code className="bg-black/40 px-1 py-0.5 rounded text-rose-100">if b == 0: return None</code></div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>


        {/* 3 Pillars Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Link
            href="/features"
            className="glass-card p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all no-underline group block"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>Deep Features</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Line-by-line mechanics, CS concepts, bug scanning, and universal language translation.
            </p>
          </Link>

          <Link
            href="/how-it-works"
            className="glass-card p-6 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all no-underline group block"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Explore our dual-engine architecture combining Gemini 2.5 Flash with offline heuristics.
            </p>
          </Link>

          <Link
            href="/faq"
            className="glass-card p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all no-underline group block"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>Help & FAQ</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Find instant answers to privacy questions, supported languages, limits, and accuracy.
            </p>
          </Link>
        </div>

        {/* Final CTA Strip */}
        <div
          className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(167, 139, 250, 0.12) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
            Start Deconstructing Code Today
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Free forever tier. No login required. Ephemeral memory processing protects your code.
          </p>
          <Link
            href="/workspace"
            className="btn-primary inline-flex items-center gap-2 text-sm py-3 px-8 no-underline shadow-xl"
            style={{
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)',
            }}
          >
            <span>Launch Code Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

        <Footer />
      </div>
    </div>
  );
}
