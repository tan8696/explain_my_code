'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { CreditInfo } from './ExplanationPanel';

interface NavbarProps {
  credits?: CreditInfo | null;
  onResetCredits?: () => void;
  isResettingCredits?: boolean;
}

export function Navbar({
  credits: propCredits,
  onResetCredits,
  isResettingCredits,
}: NavbarProps) {
  const pathname = usePathname();
  const [credits, setCredits] = useState<CreditInfo | null>(propCredits || null);
  const [internalResetting, setInternalResetting] = useState(false);

  useEffect(() => {
    if (propCredits !== undefined) {
      setCredits(propCredits);
    }
  }, [propCredits]);

  useEffect(() => {
    // If not passed as props, fetch usage independently
    if (propCredits === undefined) {
      let active = true;
      const fetchCredits = async () => {
        try {
          const res = await fetch('/v1/usage');
          if (res.ok && active) {
            const data: CreditInfo = await res.json();
            setCredits(data);
          }
        } catch {
          // ignore offline
        }
      };
      fetchCredits();
      return () => {
        active = false;
      };
    }
  }, [propCredits]);

  const handleReset = async () => {
    if (onResetCredits) {
      onResetCredits();
      return;
    }
    setInternalResetting(true);
    try {
      const res = await fetch('/v1/usage/reset', { method: 'POST' });
      if (res.ok) {
        const data: CreditInfo = await res.json();
        setCredits(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInternalResetting(false);
    }
  };

  const navLinks = [
    { href: '/workspace', label: 'Workspace', highlight: true },
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/faq', label: 'FAQ' },
  ];

  const resetting = isResettingCredits ?? internalResetting;

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-6 py-3 transition-colors"
      style={{
        background: 'var(--header-bg)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo size={32} withText badge="v2.0" />
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2.5">
          {/* Credit Tracker Pill */}
          {credits && (
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                credits.isLimitReached
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-[var(--border-subtle)] bg-white/5 text-[var(--text-secondary)]'
              }`}
              title={`Daily credit limit: ${credits.used}/${credits.limit} requests used. Resets at midnight UTC.`}
            >
              {credits.isLimitReached ? (
                <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
              )}
              <span className="font-mono text-[11px] font-semibold text-white">
                {credits.remaining}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">/ {credits.limit} left</span>

              {process.env.NODE_ENV !== 'production' && (
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  title="Reset credits (dev only)"
                  className="ml-1 opacity-50 hover:opacity-100 hover:text-cyan-400 transition-opacity cursor-pointer p-0.5"
                  aria-label="Reset credits"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${resetting ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          )}

          {/* Launch Workspace CTA (when not on workspace) */}
          {pathname !== '/workspace' && (
            <Link
              href="/workspace"
              className="hidden lg:inline-flex items-center gap-1.5 btn-primary text-xs py-1.5 px-3.5 no-underline shadow-lg"
              style={{
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Drawer Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
