/**
 * ModelCard - Individual model result card for the comparison grid
 * Displays refactored code, metrics, compilation status, and model branding
 */

import { useState } from 'react';
import { 
  Cpu, Brain, Sparkles, Bot, 
  Clock, RotateCcw, GitBranch, Coins, CheckCircle, XCircle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { cn, formatDuration, formatTokens, calculateImprovement } from '../lib/utils';
import { MODEL_CONFIGS } from '../constants';
import { CodeBlock } from './CodeBlock';
import { MetricBadge, MetricRow, MetricCard } from './MetricBadge';

export function ModelCard({
  result,
  isLoading = false,
  error,
  onCopy,
  compact = false,
  showDetails = false,
  onToggleDetails,
}) {
  const config = MODEL_CONFIGS[result.model];
  const [expanded, setExpanded] = useState(showDetails);
  
  const metrics = result.metrics;
  const compilation = result.compilation;
  const complexityImprovement = calculateImprovement(
    metrics.cyclomaticComplexity.original,
    metrics.cyclomaticComplexity.refactored
  );
  const locReduction = calculateImprovement(
    metrics.linesOfCode.original,
    metrics.linesOfCode.refactored
  );

  const toggleExpanded = () => {
    setExpanded(!expanded);
    onToggleDetails?.(result.model);
  };

  const handleCopy = () => {
    onCopy?.(result.model);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('model-card card flex flex-col', compact && 'min-h-[400px]')}>
        <div className="flex items-center gap-3 p-3 bg-bg-tertiary/50 rounded-xl border border-border-primary">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/12 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            <div className="h-3 w-5/12 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
          </div>
          <div className="w-20 h-6 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
        </div>
        
        <div className="flex-1 code-block relative">
          <div className="code-block-header">
            <div className="flex items-center gap-3">
              <div className="w-16 h-5 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
              <div className="w-20 h-4 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
              <div className="w-8 h-8 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
          <div className="code-block-content p-4 space-y-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
            ))}
          </div>
        </div>
        
        <div className="p-3 space-y-3 border-t border-border-primary">
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('model-card card flex flex-col', compact && 'min-h-[400px]')}>
        <div className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: config.bgColor }}>
            {getModelIcon(config.icon, { className: 'w-5 h-5', style: { color: config.color } })}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">{config.name}</h3>
            <p className="text-xs text-text-muted">{config.description}</p>
          </div>
          <span className="metric-badge metric-badge-danger">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        </div>
        
        <div className="flex-1 code-block flex items-center justify-center">
          <div className="text-center p-6 text-text-muted">
            <XCircle className="w-12 h-12 mx-auto mb-3 text-red-500/50" />
            <p className="font-medium">Failed to generate refactored code</p>
            <p className="text-sm mt-1 font-mono bg-bg-input p-3 rounded max-h-40 overflow-auto">{error}</p>
          </div>
        </div>
        
        <div className="p-3 border-t border-border-primary">
          <div className="grid grid-cols-2 gap-3 text-center">
            <MetricBadge label="Response Time" value="N/A" variant="neutral" size="sm" />
            <MetricBadge label="Tokens" value="N/A" variant="neutral" size="sm" />
            <MetricBadge label="Complexity" value="N/A" variant="neutral" size="sm" />
            <MetricBadge label="Compilation" value="Failed" variant="danger" size="sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('model-card card flex flex-col relative overflow-hidden', compact && 'min-h-[500px]')}>
      {/* Model Header with colored accent bar */}
      <div className="relative">
        <div 
          className="absolute inset-x-0 top-0 h-1" 
          style={{ background: `linear-gradient(90deg, ${config.color}, ${config.color}dd)` }}
        />
        <div className="p-3 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.bgColor }}
          >
            {getModelIcon(config.icon, { className: 'w-5 h-5', style: { color: config.color } })}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">{config.name}</h3>
            <p className="text-xs text-text-muted truncate">{config.description}</p>
          </div>
          
          {/* Compilation Status Badge */}
          <span className={cn(
            'metric-badge px-2.5 py-1 whitespace-nowrap flex-shrink-0',
            compilation.success ? 'metric-badge-success' : 'metric-badge-danger'
          )}>
            {compilation.success ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compiled</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Failed</span>
              </>
            )}
          </span>
          
          {/* Expand toggle */}
          {!compact && (
            <button
              onClick={toggleExpanded}
              className="btn-ghost p-1.5 rounded-lg text-text-muted hover:text-text-primary"
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              title={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Code Block */}
      <div className="flex-1 min-h-0">
        <CodeBlock
          code={result.refactoredCode}
          language="java"
          filename={`${config.shortName}Refactored.java`}
          maxHeight={compact ? 300 : 350}
          showLineNumbers={!compact}
          onCopy={handleCopy}
          isLoading={false}
        />
      </div>

      {/* Metrics Section */}
      <div className={cn('border-t border-border-primary p-3 space-y-3', expanded && 'animate-slide-up')}>
        {/* Primary Metrics Row */}
        <MetricRow 
          metrics={[
            { 
              label: 'Response Time', 
              value: formatDuration(metrics.responseTime * 1000), 
              icon: <Clock className="w-3.5 h-3.5" />,
              variant: metrics.responseTime < 1.5 ? 'success' : metrics.responseTime < 3 ? 'warning' : 'danger',
            },
            { 
              label: 'Compiler Retries', 
              value: metrics.compilerRetries, 
              icon: <RotateCcw className="w-3.5 h-3.5" />,
              variant: metrics.compilerRetries === 0 ? 'success' : 'warning',
            },
            { 
              label: 'Complexity', 
              value: `${metrics.cyclomaticComplexity.original} → ${metrics.cyclomaticComplexity.refactored}`, 
              icon: <GitBranch className="w-3.5 h-3.5" />,
              variant: complexityImprovement > 50 ? 'success' : complexityImprovement > 20 ? 'warning' : 'danger',
              trend: complexityImprovement > 0 ? 'up' : 'neutral',
              trendValue: complexityImprovement,
            },
            { 
              label: 'Tokens', 
              value: formatTokens(metrics.tokenUsage.totalTokens), 
              icon: <Coins className="w-3.5 h-3.5" />,
              variant: 'neutral',
            },
          ]} 
          gap={2}
        />

        {/* Detailed Metrics (expandable) */}
        {!compact && expanded && (
          <div className="space-y-3 pt-2 border-t border-border-primary/50">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Input Tokens"
                value={formatTokens(metrics.tokenUsage.inputTokens)}
                variant="neutral"
                icon={<Coins className="w-4 h-4" />}
                description="Tokens sent to model"
              />
              <MetricCard
                label="Output Tokens"
                value={formatTokens(metrics.tokenUsage.outputTokens)}
                variant="neutral"
                icon={<Coins className="w-4 h-4" />}
                description="Tokens generated"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Quality Score"
                value={`${metrics.qualityScore}/100`}
                variant={metrics.qualityScore >= 90 ? 'success' : metrics.qualityScore >= 75 ? 'warning' : 'danger'}
                icon={<Sparkles className="w-4 h-4" />}
                description="Code quality assessment"
              />
              <MetricCard
                label="LOC Reduction"
                value={`${metrics.linesOfCode.original} → ${metrics.linesOfCode.refactored}`}
                variant={locReduction > 20 ? 'success' : locReduction > 0 ? 'warning' : 'neutral'}
                icon={<GitBranch className="w-4 h-4" />}
                description={`${locReduction}% reduction`}
                trend={locReduction > 0 ? 'up' : 'neutral'}
                trendValue={locReduction}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Compilation Time"
                value={formatDuration(compilation.compilationTime)}
                variant="neutral"
                icon={<Clock className="w-4 h-4" />}
                description={`Java ${compilation.javaVersion}`}
              />
              <MetricCard
                label="Est. Cost"
                value={metrics.tokenUsage.estimatedCost ? `$${metrics.tokenUsage.estimatedCost.toFixed(4)}` : 'N/A'}
                variant="neutral"
                icon={<Coins className="w-4 h-4" />}
                description="Approximate API cost"
              />
            </div>

            {/* Compilation Output */}
            {compilation.output && (
              <details className="group">
                <summary className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer p-2 rounded-lg hover:bg-bg-tertiary">
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                  <span>Compilation Output</span>
                </summary>
                <pre className="mt-2 p-3 bg-bg-input border border-border-primary rounded-lg text-xs text-text-muted overflow-x-auto max-h-32 font-mono">
                  {compilation.output}
                </pre>
              </details>
            )}

            {/* Errors/Warnings */}
            {(result.errors && result.errors.length > 0) && (
              <details className="group">
                <summary className="flex items-center gap-2 text-xs text-red-400 cursor-pointer p-2 rounded-lg hover:bg-red-500/5">
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                  <span>{result.errors.length} Error(s)</span>
                </summary>
                <ul className="mt-2 ml-4 space-y-1 text-xs text-red-400">
                  {result.errors.map((err, i) => (
                    <li key={i} className="font-mono">{err}</li>
                  ))}
                </ul>
              </details>
            )}

            {(result.warnings && result.warnings.length > 0) && (
              <details className="group">
                <summary className="flex items-center gap-2 text-xs text-amber-400 cursor-pointer p-2 rounded-lg hover:bg-amber-500/5">
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                  <span>{result.warnings.length} Warning(s)</span>
                </summary>
                <ul className="mt-2 ml-4 space-y-1 text-xs text-amber-400">
                  {result.warnings.map((warn, i) => (
                    <li key={i} className="font-mono">{warn}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get model icon component
 */
function getModelIcon(iconName, props) {
  switch (iconName) {
    case 'cpu': return <Cpu {...props} />;
    case 'brain': return <Brain {...props} />;
    case 'sparkles': return <Sparkles {...props} />;
    case 'bot': return <Bot {...props} />;
    default: return <Cpu {...props} />;
  }
}

/**
 * Compact model card for mobile/small screens
 */
export function CompactModelCard({ result, isLoading, error, onCopy }) {
  return <ModelCard result={result} isLoading={isLoading} error={error} onCopy={onCopy} compact={true} />;
}