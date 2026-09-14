'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[EditorErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center"
            style={{
              background: 'rgba(248, 113, 113, 0.05)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              borderRadius: '12px',
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-300 mb-1">
                Editor failed to load
              </h4>
              <p className="text-xs text-red-300/70 max-w-sm">
                The Monaco code editor encountered an error. This can happen with
                ad-blockers or restricted networks. Try refreshing the page.
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
