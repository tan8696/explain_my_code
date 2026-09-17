'use client';

import { useState, useEffect, useCallback } from 'react';

export interface HistoryEntry {
  id: string;
  code: string;
  language: string;
  summary: string;
  bugsCount: number;
  timestamp: number;
  result: unknown; // Full ExplanationData stored for replay
}

const STORAGE_KEY = 'emc_explanation_history';
const MAX_ENTRIES = 20;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useExplanationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryEntry[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistory(parsed);
      }
    } catch {
      // Corrupted storage, start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist to localStorage whenever history changes
  const persist = useCallback((entries: HistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Storage full, trim oldest entries
      const trimmed = entries.slice(0, Math.floor(MAX_ENTRIES / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }, []);

  const addEntry = useCallback(
    (code: string, language: string, summary: string, bugsCount: number, result: unknown) => {
      setHistory((prev) => {
        // Deduplicate by code content
        const filtered = prev.filter((e) => e.code.trim() !== code.trim());
        const newEntry: HistoryEntry = {
          id: generateId(),
          code,
          language,
          summary,
          bugsCount,
          timestamp: Date.now(),
          result,
        };
        const updated = [newEntry, ...filtered].slice(0, MAX_ENTRIES);
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}
