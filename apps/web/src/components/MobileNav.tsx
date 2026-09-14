'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Code2 } from 'lucide-react';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#workspace', label: 'Workspace' },
  { href: '#faq', label: 'FAQ' },
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
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="md:hidden" ref={menuRef}>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white/80" />
        )}
      </button>

      {/* Overlay + Slide-down menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            style={{ animation: 'fade-in 0.2s ease-out both' }}
          />

          {/* Menu panel */}
          <div
            className="fixed top-0 left-0 right-0 z-50 px-6 pt-4 pb-6"
            style={{
              background: 'rgba(6, 6, 12, 0.97)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              animation: 'mobile-nav-slide-down 0.3s ease-out both',
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setIsOpen(false)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                  }}
                >
                  <Code2 className="w-4 h-4 text-black" />
                </div>
                <span className="font-semibold text-base tracking-tight text-white">
                  Explain My Code
                </span>
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
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  style={{
                    animation: `fade-in 0.3s ${80 + i * 50}ms ease-out both`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  {link.label}
                </a>
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
              <a
                href="#workspace"
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full justify-center text-sm py-3"
              >
                Launch Workspace
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
