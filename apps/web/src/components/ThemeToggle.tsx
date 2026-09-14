'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'emc_theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  // Avoid hydration mismatch flash
  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer hover:bg-white/10 border border-transparent hover:border-white/10"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun
        className="w-4 h-4 absolute transition-all duration-300"
        style={{
          opacity: theme === 'light' ? 1 : 0,
          transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
          color: theme === 'light' ? '#f59e0b' : '#fff',
        }}
      />
      <Moon
        className="w-4 h-4 absolute transition-all duration-300"
        style={{
          opacity: theme === 'dark' ? 1 : 0,
          transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
          color: '#94a3b8',
        }}
      />
    </button>
  );
}
