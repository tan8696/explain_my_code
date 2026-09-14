'use client';

import React, { useState } from 'react';
import { History, Trash2, X, ChevronRight, Bug, CheckCircle2 } from 'lucide-react';
import type { HistoryEntry } from '@/hooks/useExplanationHistory';

interface HistorySidebarProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}

export function HistorySidebar({ history, onSelect, onRemove, onClear }: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0 && !isOpen) return null;

  return (
    <>
      {/* Toggle pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
        style={{
          background: 'rgba(15, 18, 32, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          color: '#fff',
        }}
        aria-label="Toggle explanation history"
      >
        <History className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-medium">{history.length}</span>
      </button>

      {/* Sidebar panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            style={{ animation: 'fade-in 0.2s ease-out both' }}
          />

          {/* Panel */}
          <div
            className="fixed right-0 top-0 bottom-0 z-50 w-[340px] max-w-[90vw] flex flex-col"
            style={{
              background: 'rgba(6, 6, 12, 0.98)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              animation: 'history-slide-in 0.3s ease-out both',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">History</span>
                <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                  {history.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button
                    onClick={onClear}
                    className="text-xs text-red-400/70 hover:text-red-400 px-2 py-1 rounded hover:bg-red-400/10 transition-colors cursor-pointer"
                    title="Clear all history"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close history"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Entries list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
              {history.length === 0 ? (
                <div className="text-center py-12 text-xs text-white/30">
                  No explanations yet. Explain some code to see your history here.
                </div>
              ) : (
                history.map((entry, i) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      onSelect(entry);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl transition-all group cursor-pointer hover:bg-white/[0.04]"
                    style={{
                      border: '1px solid rgba(255,255,255,0.04)',
                      animation: `fade-in 0.3s ${i * 40}ms ease-out both`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.6)',
                          }}
                        >
                          {entry.language}
                        </span>
                        {entry.bugsCount > 0 ? (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400/80">
                            <Bug className="w-3 h-3" />
                            {entry.bugsCount}
                          </span>
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400/60" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-white/30">{timeAgo(entry.timestamp)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(entry.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-400/10 transition-all cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3 h-3 text-red-400/60" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                      {truncate(entry.summary, 120)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-400/60 font-medium group-hover:text-blue-400/90 transition-colors">
                      <span>Load explanation</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
