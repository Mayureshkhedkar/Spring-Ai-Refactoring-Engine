/**
 * CodeInputArea - Main IDE-style text area for pasting legacy Java code
 * Features: syntax-aware placeholder, character/line count, refactor button integration
 * FIXED: Dropdown layout overflow, Clear button now properly clears all state via parent
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Copy, X, FileText, Clock } from 'lucide-react';
import { cn, formatNumber, formatDuration } from '../lib/utils';
import { MODEL_CONFIGS, DEFAULT_MODEL_ORDER } from '../constants';
import { MetricBadge } from './MetricBadge';

export function CodeInputArea({
  code,
  onCodeChange,
  onRefactor,
  isLoading,
  totalExecutionTime,
  selectedModels,
  onModelSelect,
  error,
  onClearAll, // NEW: callback to clear ALL state in parent
}) {
  const textareaRef = useRef(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Update line/char counts
  useEffect(() => {
    const lines = code?.split('\n') || [''];
    setLineCount(lines.length);
    setCharCount(code?.length || 0);
  }, [code]);

  // Handle textarea input
  const handleChange = useCallback((e) => {
    onCodeChange(e?.target?.value || '');
  }, [onCodeChange]);

  // Handle keyboard shortcuts (Ctrl/Cmd + Enter to refactor)
  const handleKeyDown = useCallback((e) => {
    if ((e?.ctrlKey || e?.metaKey) && e?.key === 'Enter' && !isLoading) {
      e.preventDefault();
      triggerRefactor();
    }
  }, [isLoading]);

  const triggerRefactor = useCallback(() => {
    if (!code?.trim()) return;
    
    const request = {
      legacyCode: code,
      targetJavaVersion: '21',
      refactoringGoals: ['reduce_complexity', 'modernize_syntax', 'improve_readability'],
      models: selectedModels?.length > 0 ? selectedModels : undefined,
    };
    
    onRefactor(request);
  }, [code, onRefactor, selectedModels]);

  // Clear code only (for the toolbar button)
  const handleClearCode = useCallback(() => {
    onCodeChange('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [onCodeChange]);

  // Clear ALL state (for the header trash button) - calls parent to reset everything
  const handleClearAll = useCallback(() => {
    onClearAll?.();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [onClearAll]);

  // Copy code to clipboard
  const handleCopy = useCallback(async () => {
    if (!code?.trim()) return;
    await navigator.clipboard.writeText(code);
  }, [code]);

  const hasCode = code?.trim().length > 0;
  const allModels = DEFAULT_MODEL_ORDER;

  return (
    <div className="w-full animate-slide-up">
      {/* Header with title and model selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <FileText className="w-5 h-5 text-bg-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Legacy Code Input</h2>
            <p className="text-xs text-text-muted">
              Paste your legacy Java code for automated refactoring
            </p>
          </div>
        </div>

        {/* Model Selector Dropdown - FIXED: Shows "X Models Selected" instead of listing names */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModelSelector(!showModelSelector)}
            className={cn(
              'btn-secondary flex items-center gap-2',
              showModelSelector && 'border-accent-primary/50 bg-accent-primary/5'
            )}
            aria-expanded={showModelSelector}
            aria-haspopup="listbox"
          >
            <span className="hidden sm:inline-flex items-center gap-1.5">
              {selectedModels?.length === allModels.length ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-accent-primary" />
                  <span>All Models</span>
                </>
              ) : (
                <>
                  {selectedModels?.length > 0 ? (
                    // FIXED: Show count instead of listing names to prevent overflow
                    <span className="text-xs text-text-secondary">
                      {selectedModels.length} Model{selectedModels.length > 1 ? 's' : ''} Selected
                    </span>
                  ) : (
                    <span className="text-text-muted text-xs">Select models...</span>
                  )}
                </>
              )}
            </span>
            <Clock className="w-4 h-4" />
          </button>

          {showModelSelector && (
            <div className="absolute right-0 top-full mt-2 z-50 glass-strong rounded-xl p-3 min-w-[200px] shadow-2xl animate-fade-in border border-border-secondary">
              <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-border-primary">
                <span className="text-xs font-medium text-text-secondary">AI Models</span>
                <button
                  onClick={() => onModelSelect(allModels)}
                  className="text-xs text-accent-primary hover:text-accent-secondary"
                >
                  Select All
                </button>
              </div>
              <div className="space-y-1" role="listbox">
                {allModels.map((model) => {
                  const config = MODEL_CONFIGS[model];
                  const isSelected = selectedModels?.includes(model);
                  return (
                    <label
                      key={model}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                        isSelected 
                          ? 'bg-accent-primary/10 border border-accent-primary/30' 
                          : 'hover:bg-bg-tertiary'
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newModels = e.target.checked
                            ? [...(selectedModels || []), model]
                            : (selectedModels || []).filter(m => m !== model);
                          onModelSelect(newModels);
                        }}
                        className="w-4 h-4 accent-accent-primary rounded border-border-primary bg-bg-input"
                      />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config?.color }} />
                      <span className="text-sm text-text-primary">{config?.name}</span>
                    </label>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-border-primary">
                <button
                  onClick={() => onModelSelect([])}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 animate-slide-up">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Main Textarea Container */}
      <div className="relative group">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={hasCode ? '' : 'Paste your legacy Java code here...\n\nExample:\npublic class LegacyService {\n    public void processData() {\n        // Your legacy code\n    }\n}'}
            className={cn(
              'input-area',
              'min-h-[240px]',
              hasCode && 'placeholder-transparent',
              isLoading && 'opacity-60 pointer-events-none'
            )}
            disabled={isLoading}
            aria-label="Legacy Java code input"
            aria-describedby="code-stats"
            spellCheck={false}
          />
          
          {/* Placeholder overlay for better control */}
          {!hasCode && !isLoading && (
            <div className="pointer-events-none absolute inset-5 text-text-muted text-sm font-mono leading-relaxed select-none">
              Paste your legacy Java code here...
              <br /><br />
              <span className="text-xs opacity-60">
                Example:
                <br />public class LegacyService &#123;
                <br />&nbsp;&nbsp;public void processData() &#123;
                <br />&nbsp;&nbsp;&nbsp;&nbsp;// Your legacy code
                <br />&nbsp;&nbsp;&#125;
                <br />&#125;
              </span>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <div className="text-center p-6">
                <div className="w-12 h-12 border-3 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-primary font-medium">Analyzing code with AI models...</p>
                <p className="text-text-muted text-sm mt-1">This may take a few seconds</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 p-3 bg-bg-tertiary/50 rounded-xl border border-border-primary">
          {/* Stats */}
          <div id="code-stats" className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-text-muted" />
              {formatNumber(charCount)} characters
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-text-muted" />
              {formatNumber(lineCount)} lines
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-text-muted" />
              ~{Math.ceil(charCount / 4)} tokens
            </span>
          </div>

          {/* Actions - FIXED: Toolbar clear only clears code, header trash clears all */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!hasCode || isLoading}
              className="btn-ghost flex items-center gap-1.5"
              aria-label="Copy code to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            <button
              type="button"
              onClick={handleClearCode} // Only clears the textarea
              disabled={!hasCode || isLoading}
              className="btn-ghost flex items-center gap-1.5 text-text-muted hover:text-red-400"
              aria-label="Clear code"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              type="button"
              onClick={triggerRefactor}
              disabled={!hasCode || isLoading}
              className="btn-primary flex items-center gap-2 group"
              aria-label="Start refactoring"
            >
              <span className="relative">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span>{isLoading ? 'Refactoring...' : 'Refactor Code'}</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg opacity-0 group-hover:opacity-20 transition-opacity -z-10 blur" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Metric Badge - Total Execution Time */}
      {totalExecutionTime !== undefined && (
        <MetricBadge
          label="Total API Execution Time"
          value={formatDuration(totalExecutionTime)}
          icon={<Clock className="w-3.5 h-3.5" />}
          variant="primary"
          className="mt-4 w-full sm:w-auto"
        />
      )}

      {/* Keyboard shortcut hint */}
      <p className="mt-3 text-center text-xs text-text-muted">
        <kbd className="px-2 py-0.5 bg-bg-tertiary border border-border-primary rounded">Ctrl</kbd> + 
        <kbd className="px-2 py-0.5 bg-bg-tertiary border border-border-primary rounded">Enter</kbd> to refactor
      </p>
    </div>
  );
}