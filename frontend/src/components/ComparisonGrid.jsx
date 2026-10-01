/**
 * ComparisonGrid - 4-column layout for side-by-side model comparison
 * Responsive grid that adapts from 4 columns to single column on mobile
 */

import { useState } from 'react';
import { 
  LayoutGrid, LayoutList, 
  ChevronLeft, ChevronRight, Maximize2,
  RefreshCw,
  Cpu, Brain, Sparkles, Bot, Clock
} from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import { MODEL_CONFIGS, DEFAULT_MODEL_ORDER } from '../constants';
import { ModelCard, CompactModelCard } from './ModelCard';
import { MetricCard, MetricBadge } from './MetricBadge';

export function ComparisonGrid({
  results,
  loadingModels,
  totalExecutionTime,
  summary,
  onCopy,
  onRetry,
  onExpandCode,
  viewMode = 'grid',
  onViewModeChange,
  focusedModel,
  onFocusModel,
}) {
  const [expandedDetails, setExpandedDetails] = useState(new Set());
  
  // Sort results by default model order
  const sortedResults = [...results].sort((a, b) => 
    DEFAULT_MODEL_ORDER.indexOf(a.model) - DEFAULT_MODEL_ORDER.indexOf(b.model)
  );

  const isModelLoading = (model) => loadingModels.includes(model);
  const getResult = (model) => sortedResults.find(r => r.model === model);
  const getLoadingError = () => {
    // In real app, this would come from error state
    return undefined;
  };

  const toggleDetails = (model) => {
    setExpandedDetails(prev => {
      const next = new Set(prev);
      if (next.has(model)) next.delete(model);
      else next.add(model);
      return next;
    });
  };

  // Focus mode - single model detailed view
  if (viewMode === 'focus' && focusedModel) {
    const result = getResult(focusedModel);
    const config = MODEL_CONFIGS[focusedModel];
    
    if (!result) {
      return (
        <div className="card flex items-center justify-center min-h-[400px]">
          <div className="text-center text-text-muted">
            <Maximize2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No data available for {config.name}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-slide-up">
        {/* Focus Mode Header */}
        <div className="flex items-center justify-between mb-4 p-4 card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onFocusModel?.(undefined)}
              className="btn-ghost p-2 rounded-lg hover:bg-bg-tertiary"
              aria-label="Exit focus mode"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              {getModelIcon(config.icon, { className: 'w-6 h-6', style: { color: config.color } })}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{config.name}</h2>
              <p className="text-sm text-text-muted">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExpandCode?.(focusedModel)}
              className="btn-secondary flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Expand Code</span>
            </button>
            <button
              onClick={() => onRetry?.(focusedModel)}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>

        {/* Full-size Code Block */}
        <div className="card overflow-hidden">
          <ModelCard
            result={result}
            isLoading={isModelLoading(focusedModel)}
            error={getLoadingError()}
            onCopy={onCopy}
            compact={false}
            showDetails={true}
            onToggleDetails={toggleDetails}
          />
        </div>
      </div>
    );
  }

  // List mode - stacked cards
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-6 animate-slide-up w-full" role="list" aria-label="Model comparison results">
        {DEFAULT_MODEL_ORDER.map((modelType) => {
          const result = getResult(modelType);
          const isLoading = isModelLoading(modelType);
          const error = getLoadingError();
          const config = MODEL_CONFIGS[modelType];
          
          // Always render a card for each model - show loading/placeholder if no result yet
          return (
            <div key={modelType} role="listitem" className="w-full">
              <ModelCard
                result={result || { 
                  model: modelType, 
                  modelName: config?.name || modelType,
                  refactoredCode: '',
                  metrics: getEmptyMetrics(),
                  compilation: { success: false, compilationTime: 0, javaVersion: '21' }
                }}
                isLoading={isLoading}
                error={error}
                onCopy={onCopy}
                compact={false}
                showDetails={expandedDetails.has(modelType)}
                onToggleDetails={toggleDetails}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Grid mode - 4 column layout
  return (
    <div className="animate-slide-up">
      {/* Grid Header with View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-bg-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Model Comparison</h2>
            <p className="text-xs text-text-muted">
              Side-by-side analysis of {results.length} AI model{results.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-bg-tertiary rounded-xl border border-border-primary">
          {[
            { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
            { mode: 'list', icon: LayoutList, label: 'List' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange?.(mode)}
              className={cn(
                'btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all',
                viewMode === mode 
                  ? 'bg-bg-primary shadow-md text-text-primary' 
                  : 'text-text-muted hover:text-text-primary'
              )}
              aria-pressed={viewMode === mode}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics Row */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" role="region" aria-label="Comparison summary">
          <MetricCard
            label="Fastest Model"
            value={MODEL_CONFIGS[summary.fastestModel]?.shortName || summary.fastestModel}
            icon={<ChevronRight className="w-4 h-4" />}
            variant="success"
            description="Lowest response time"
          />
          <MetricCard
            label="Best Complexity Reduction"
            value={MODEL_CONFIGS[summary.bestComplexityReduction]?.shortName || summary.bestComplexityReduction}
            icon={<ChevronRight className="w-4 h-4" />}
            variant="primary"
            description="Highest complexity improvement"
          />
          <MetricCard
            label="Most Token Efficient"
            value={MODEL_CONFIGS[summary.mostTokenEfficient]?.shortName || summary.mostTokenEfficient}
            icon={<ChevronRight className="w-4 h-4" />}
            variant="warning"
            description="Lowest token usage"
          />
          <MetricCard
            label="Highest Quality"
            value={MODEL_CONFIGS[summary.highestQuality]?.shortName || summary.highestQuality}
            icon={<ChevronRight className="w-4 h-4" />}
            variant="primary"
            description="Best overall score"
          />
        </div>
      )}

      {/* Compilation Status Row */}
      {summary && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-bg-tertiary/50 rounded-xl border border-border-primary" role="region" aria-label="Compilation status">
          <span className="text-xs text-text-muted font-medium">Compilation Status:</span>
          <div className="flex flex-wrap items-center gap-2">
            {summary.compiledModels.map((model) => (
              <span 
                key={model} 
                className="metric-badge metric-badge-success text-xs"
                style={{ borderColor: MODEL_CONFIGS[model].color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_CONFIGS[model].color }} />
                {MODEL_CONFIGS[model].shortName}
              </span>
            ))}
            {summary.failedModels.map((model) => (
              <span 
                key={model} 
                className="metric-badge metric-badge-danger text-xs"
                style={{ borderColor: MODEL_CONFIGS[model].color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_CONFIGS[model].color }} />
                {MODEL_CONFIGS[model].shortName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" 
        role="list" 
        aria-label="Model comparison grid"
      >
        {DEFAULT_MODEL_ORDER.map((modelType) => {
          const result = getResult(modelType);
          const isLoading = isModelLoading(modelType);
          const error = getLoadingError();
          const config = MODEL_CONFIGS[modelType];
          
          if (!result && !isLoading) {
            // Placeholder for models that haven't run yet
            return (
              <div 
                key={modelType} 
                className="card opacity-40"
                role="listitem"
                aria-label={`${config.name} - pending`}
              >
                <div className="flex flex-col h-full min-h-[500px]">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: config.bgColor }}>
                      {getModelIcon(config.icon, { className: 'w-5 h-5', style: { color: config.color } })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{config.name}</h3>
                      <p className="text-xs text-text-muted">{config.description}</p>
                    </div>
                    <span className="metric-badge metric-badge-neutral">Pending</span>
                  </div>
                  <div className="flex-1 code-block flex items-center justify-center">
                    <div className="text-center text-text-muted p-6">
                      <div className="w-12 h-12 rounded-full border-2 border-border-primary border-t-accent-primary animate-spin mx-auto mb-3" />
                      <p className="font-medium">Waiting for refactor...</p>
                      <p className="text-xs mt-1">Click "Refactor Code" to start</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-border-primary">
                    <div className="grid grid-cols-2 gap-3 text-center text-text-muted">
                      <div className="py-3">
                        <p className="text-2xl font-mono font-bold">—</p>
                        <p className="text-xs">Response Time</p>
                      </div>
                      <div className="py-3">
                        <p className="text-2xl font-mono font-bold">—</p>
                        <p className="text-xs">Tokens</p>
                      </div>
                      <div className="py-3">
                        <p className="text-2xl font-mono font-bold">—</p>
                        <p className="text-xs">Complexity</p>
                      </div>
                      <div className="py-3">
                        <p className="text-2xl font-mono font-bold">—</p>
                        <p className="text-xs">Compilation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={modelType} role="listitem">
              <ModelCard
                result={result || { 
                  model: modelType, 
                  modelName: config.name,
                  refactoredCode: '',
                  metrics: getEmptyMetrics(),
                  compilation: { success: false, compilationTime: 0, javaVersion: '21' }
                }}
                isLoading={isLoading}
                error={error}
                onCopy={onCopy}
                compact={false}
                showDetails={expandedDetails.has(modelType)}
                onToggleDetails={toggleDetails}
              />
            </div>
          );
        })}
      </div>

      {/* Total Execution Time Badge */}
      {totalExecutionTime !== undefined && (
        <div className="mt-6 flex justify-center">
          <MetricBadge
            label="Total API Execution Time"
            value={formatDuration(totalExecutionTime)}
            icon={<Clock className="w-4 h-4" />}
            variant="primary"
            size="lg"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Empty metrics for placeholder states
 */
function getEmptyMetrics() {
  return {
    responseTime: 0,
    compilerRetries: 0,
    cyclomaticComplexity: { original: 0, refactored: 0, improvement: 0 },
    tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    linesOfCode: { original: 0, refactored: 0, reduction: 0 },
    qualityScore: 0,
  };
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
 * Simplified grid for mobile
 */
export function MobileComparisonGrid({ 
  results, 
  loadingModels, 
  onCopy,
}) {
  return (
    <div className="space-y-3" role="list">
      {DEFAULT_MODEL_ORDER.map((modelType) => {
        const result = results.find(r => r.model === modelType);
        const isLoading = loadingModels.includes(modelType);
        
        if (!result && !isLoading) return null;
        
        return (
          <CompactModelCard
            key={modelType}
            result={result || { 
              model: modelType, 
              modelName: MODEL_CONFIGS[modelType].name,
              refactoredCode: '',
              metrics: getEmptyMetrics(),
              compilation: { success: false, compilationTime: 0, javaVersion: '21' }
            }}
            isLoading={isLoading}
            onCopy={onCopy}
          />
        );
      })}
    </div>
  );
}