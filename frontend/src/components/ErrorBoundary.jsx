/**
 * ErrorBoundary - Catches React errors in child components and displays a fallback UI
 * Prevents the entire app from crashing (white/black screen of death)
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleDismiss = () => {
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/30 rounded-xl min-h-[200px]">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h3>
          <p className="text-text-muted text-sm mb-4 text-center max-w-md">
            This component encountered an error and couldn't render properly.
          </p>
          <div className="flex gap-2">
            <button
              onClick={this.handleRetry}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={this.handleDismiss}
              className="btn-ghost flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Dismiss
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 w-full max-w-md">
              <summary className="text-xs text-text-muted cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-3 bg-bg-input border border-border-primary rounded text-xs text-red-400 overflow-auto max-h-40">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for specific sections that need error isolation
 */
export function withErrorBoundary(Component, fallbackProps = {}) {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...fallbackProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Simple inline error boundary for use in JSX
 */
export function InlineErrorBoundary({ children, fallback }) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}