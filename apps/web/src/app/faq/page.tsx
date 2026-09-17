'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Search, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Which programming languages are supported?',
    a: 'Explain My Code supports over 25+ programming languages including Python, JavaScript, TypeScript, C++, C, Java, Go, Rust, SQL, C#, Kotlin, Swift, Ruby, PHP, Bash, and HTML/CSS. The engine automatically detects the language upon submission.',
    category: 'Languages',
  },
  {
    q: 'How is my source code privacy protected?',
    a: 'Your source code is processed strictly ephemerally in volatile memory. It is never persisted into any database, never cached on disk, and never shared with external parties or used to train public AI models. Once your explanation is generated, the code is immediately discarded.',
    category: 'Privacy',
  },
  {
    q: 'What happens when my daily credit quota is reached?',
    a: 'Each user receives 50 free live Gemini AI requests per day, resetting at Midnight UTC. If you exhaust your quota, the application automatically falls back to our intelligent offline heuristic engine, allowing you to continue analyzing code without interruptions or fees.',
    category: 'Limits',
  },
  {
    q: 'What kinds of bugs and security vulnerabilities does it catch?',
    a: 'The scanner detects runtime exceptions such as Division by Zero, Python Mutable Default Arguments in function signatures, assignment typos inside conditionals (`if a = 1`), off-by-one array index errors, unhandled Promise rejections, and unsafe recursion base cases.',
    category: 'Analysis',
  },
  {
    q: 'Can I use Explain My Code for proprietary codebase snippets?',
    a: 'Yes. Because we operate with zero data retention, enterprise developers and researchers routinely paste internal utility functions, algorithms, and logic blocks to deconstruct their behaviors safely.',
    category: 'Privacy',
  },
  {
    q: 'How does this compare to generic ChatGPT or Claude?',
    a: 'Generic AI chatbots often respond with long-winded paragraphs laden with jargon, or hallucinate outputs. Explain My Code enforces a structured 6-layer pedagogy designed specifically for learning, complete with line-by-line mechanical mapping and actionable bug fixes.',
    category: 'Comparison',
  },
  {
    q: 'Is there a character limit on code snippets?',
    a: 'Yes, snippets up to 50,000 characters (roughly 1,500 lines of standard formatted code) can be analyzed in a single request.',
    category: 'Limits',
  },
];

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Help Center & FAQ</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Everything you need to know about Explain My Code, privacy policies, supported languages,
            and free-tier protection.
          </p>

          {/* Search Box */}
          <div className="mt-8 relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions (e.g. privacy, languages, credits)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 mb-16">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              No questions found matching &ldquo;{searchTerm}&rdquo;. Try another search term.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-xl overflow-hidden border border-white/5 transition-all"
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-semibold text-sm sm:text-base text-white pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-white/5">
                      <p>{faq.a}</p>
                      <div className="mt-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)] border border-white/5">
                          Category: {faq.category}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions */}
        <div className="glass-card p-8 rounded-2xl text-center mb-12">
          <h3 className="text-lg font-bold text-white mb-2">Still Have Questions?</h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Explain My Code is an open developer utility. Check out our GitHub repository or jump straight into the studio.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/workspace"
              className="btn-primary text-xs sm:text-sm py-2.5 px-6 no-underline"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/tan8696/explain_my_code"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs sm:text-sm py-2.5 px-5 no-underline"
            >
              <span>View GitHub</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
