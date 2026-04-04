'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional fallback UI. Defaults to a styled retry card. */
  fallback?: ReactNode;
  /** Section name shown in the error card (e.g. "Analytics Charts") */
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable error boundary that wraps heavy components.
 * If a child throws, it catches the error and shows a styled retry card
 * instead of crashing the entire page.
 *
 * Usage:
 *   <ErrorBoundaryWrapper name="Analytics Charts">
 *     <AnalyticsCharts />
 *   </ErrorBoundaryWrapper>
 */
export class ErrorBoundaryWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? ` — ${this.props.name}` : ''}]`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="bg-[#1e293b] border border-red-500/20 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-sm font-semibold text-white mb-1">
            {this.props.name ? `${this.props.name} failed to load` : 'Something went wrong'}
          </h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm rounded-xl cursor-pointer transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
