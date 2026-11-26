/**
 * ModelResultCard - Displays individual model analysis results
 * Enterprise aesthetic with metrics and code display
 */

import { cn } from '../lib/utils';
import { Clock, Zap, GitBranch, RotateCcw, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';

export function ModelResultCard({ result, index }) {
  const hasRetries = result.retry_count > 0;
  const isBest = index === 0; // First result is "best"

  return (
    <div className={cn(
      'card rounded-2xl p-6 flex flex-col',
      'bg-white dark:bg-bg-card',
      'border border-[#E5E0D8] dark:border-border-primary',
      'shadow-sm hover:shadow-lg transition-shadow duration-300',
      isBest && 'ring-2 ring-[#C2A682]/30'
    )}>
      
      {/* Model Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br from-[#C2A682] to-[#B39773]'
          )}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#3E3A35] dark:text-text-primary">
              {result.model_name}
            </h3>
            {isBest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#C2A682]/10 text-[#C2A682]">
                <CheckCircle className="w-3 h-3" />
                Best Match
              </span>
            )}
          </div>
        </div>
        
        {/* Retry Badge - Highlighted if > 0 */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
            hasRetries 
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
          )}>
            {hasRetries ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>Retried {result.retry_count}x</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Clean Pass</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5 p-4 bg-[#F9F8F4] dark:bg-bg-tertiary rounded-xl">
        {/* Time Complexity */}
        <div className="text-center">
          <p className="text-xs font-medium text-[#6E6961] dark:text-text-muted uppercase tracking-wider mb-1">
            Time Complexity
          </p>
          <p className="font-mono text-lg font-semibold text-[#3E3A35] dark:text-text-primary">
            {result.time_complexity}
          </p>
        </div>

        {/* Space Complexity */}
        <div className="text-center">
          <p className="text-xs font-medium text-[#6E6961] dark:text-text-muted uppercase tracking-wider mb-1">
            Space Complexity
          </p>
          <p className="font-mono text-lg font-semibold text-[#3E3A35] dark:text-text-primary">
            {result.space_complexity}
          </p>
        </div>

        {/* Cyclomatic Complexity */}
        <div className="text-center">
          <p className="text-xs font-medium text-[#6E6961] dark:text-text-muted uppercase tracking-wider mb-1">
            Cyclomatic
          </p>
          <p className="font-mono text-lg font-semibold text-[#3E3A35] dark:text-text-primary">
            {result.cyclomatic_complexity}
          </p>
        </div>

        {/* Latency */}
        <div className="text-center">
          <p className="text-xs font-medium text-[#6E6961] dark:text-text-muted uppercase tracking-wider mb-1">
            Latency (ms)
          </p>
          <p className="font-mono text-lg font-semibold text-[#3E3A35] dark:text-text-primary">
            {result.response_time_ms}
          </p>
        </div>

        {/* Retries */}
        <div className="text-center">
          <p className="text-xs font-medium text-[#6E6961] dark:text-text-muted uppercase tracking-wider mb-1">
            Retries
          </p>
          <p className={cn(
            'font-mono text-lg font-semibold',
            hasRetries ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
          )}>
            {result.retry_count}
          </p>
        </div>
      </div>

      {/* Refactored Code Block */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#6E6961] dark:text-text-muted uppercase tracking-wider">
            Refactored Code
          </span>
          <button
            className="btn-ghost p-1.5 rounded-lg text-text-muted hover:text-text-primary"
            aria-label="Copy refactored code"
            onClick={() => navigator.clipboard.writeText(result.refactored_code)}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <pre className="bg-[#1a1d23] dark:bg-bg-input text-[#e8e8ed] dark:text-text-primary p-4 rounded-xl overflow-x-auto max-h-64 text-sm font-mono leading-relaxed">
          <code>{result.refactored_code}</code>
        </pre>
      </div>
    </div>
  );
}