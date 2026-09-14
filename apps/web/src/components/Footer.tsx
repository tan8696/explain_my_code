'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  return (
    <footer
      className="mt-auto px-6 py-10 text-xs flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto w-full border-t"
      style={{
        color: 'var(--text-muted)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
        <BrandLogo size={22} />
        <div>
          <span className="font-medium text-[var(--text-primary)]">Explain My Code</span>
          <span className="mx-1.5">·</span>
          <span>© {new Date().getFullYear()} · Universal Simple English Code Tutor</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center text-[var(--text-secondary)]">
        <Link href="/workspace" className="hover:text-white transition-colors">
          Workspace
        </Link>
        <span>·</span>
        <Link href="/features" className="hover:text-white transition-colors">
          Features
        </Link>
        <span>·</span>
        <Link href="/how-it-works" className="hover:text-white transition-colors">
          How It Works
        </Link>
        <span>·</span>
        <Link href="/faq" className="hover:text-white transition-colors">
          FAQ
        </Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy
        </Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-white transition-colors">
          Terms
        </Link>
        <span>·</span>
        <a
          href="https://github.com/tan8696/explain_my_code"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
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
  );
}

export default Footer;
