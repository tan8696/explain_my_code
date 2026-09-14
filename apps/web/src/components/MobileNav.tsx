'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const NAV_LINKS = [
  { href: '/workspace', label: 'Workspace' },
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      {isOpen && (
        <div
          className="fixed top-0 right-0 bottom-0 z-50 w-72 p-6 flex flex-col justify-between"
          style={{
            background: '#0d1117',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
          }}
          role="dialog"
          aria-label="Mobile Navigation"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setIsOpen(false)}
              >
                <BrandLogo size={28} withText badge="" />
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  style={{
                    animation: `fade-in 0.3s ${80 + i * 50}ms ease-out both`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div
              className="mt-5 pt-5"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                animation: 'fade-in 0.3s 300ms ease-out both',
              }}
            >
              <Link
                href="/workspace"
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full justify-center text-sm py-3 no-underline"
              >
                Launch Studio
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
