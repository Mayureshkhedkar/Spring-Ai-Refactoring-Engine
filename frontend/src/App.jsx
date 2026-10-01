/**
 * App - Main application component for the Automated Code Review & Refactoring Engine
 * Orchestrates the input area, comparison grid, and state management
 * FIXED: Theme toggle, Clear/Delete crash, Error boundaries added
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Settings, HelpCircle, Info, 
  Moon, Sun, Trash2, Download,
  X, Cpu, GitBranch, MessageSquare
} from 'lucide-react';
import { cn } from './lib/utils';
import { MOCK_LEGACY_JAVA, MODEL_CONFIGS, DEFAULT_MODEL_ORDER, REFACTORING_GOALS } from './constants';
import { CodeInputArea } from './components/CodeInputArea';
import { ComparisonGrid } from './components/ComparisonGrid';
import { generateMockModelResult, validateRefactorResponse } from './lib/utils';
import { analyzeCode } from './services/api';
import { ErrorBoundary } from './components/ErrorBoundary';

// JSON examples for documentation
const REQUEST_EXAMPLE = `{
  "legacyCode": "public class LegacyService { ... }",
  "targetJavaVersion": "21",
  "refactoringGoals": ["reduce_complexity", "modernize_syntax"],
  "models": ["nemotron", "gpt4o", "gemini", "claude"]
}`;

const RESPONSE_EXAMPLE = `{
  "requestId": "req_1234567890_abc123",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalExecutionTime": 1234,
  "results": [{
    "model": "nemotron",
    "modelName": "NVIDIA Nemotron",
    "refactoredCode": "public class RefactoredService { ... }",
    "metrics": {
      "responseTime": 0.85,
      "compilerRetries": 0,
      "cyclomaticComplexity": { "original": 18, "refactored": 3, "improvement": 83 },
      "tokenUsage": { "inputTokens": 1200, "outputTokens": 850, "totalTokens": 2050 },
      "linesOfCode": { "original": 45, "refactored": 32, "reduction": 29 },
      "qualityScore": 92
    },
    "compilation": { "success": true, "compilationTime": 456, "javaVersion": "21" }
  }],
  "summary": {
    "fastestModel": "nemotron",
    "bestComplexityReduction": "gpt4o",
    "mostTokenEfficient": "nemotron",
    "highestQuality": "claude",
    "compiledModels": ["nemotron", "gpt4o", "claude"],
    "failedModels": ["gemini"]
  }
}`;

// Simulate API delay
const SIMULATE_API_DELAY = true;

export function App() {
  // Core State
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [loadingModels, setLoadingModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState(DEFAULT_MODEL_ORDER);
  const [totalExecutionTime, setTotalExecutionTime] = useState(undefined);
  const [summary, setSummary] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [isRefactoring, setIsRefactoring] = useState(false);
  
  // UI State
  const [viewMode, setViewMode] = useState('grid');
  const [focusedModel, setFocusedModel] = useState(undefined);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState(() => {
    // FIXED: Initialize theme from localStorage or document.documentElement
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [requestId, setRequestId] = useState(undefined);
  
  // Refs
  const startTimeRef = useRef(0);

  // Initialize with sample code on first load
  useEffect(() => {
    if (!code && !isRefactoring) {
      setCode(MOCK_LEGACY_JAVA);
    }
  }, []);

  // FIXED: Theme management - properly toggle dark class on document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Generate mock response for demonstration (fallback when API unavailable)
  const generateMockResponse = useCallback(async (request) => {
    const modelsToRun = request.models || DEFAULT_MODEL_ORDER;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();
    
    // Simulate progressive loading
    const modelResults = [];
    
    for (const model of modelsToRun) {
      // Simulate individual model delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      
      const mockResult = generateMockModelResult(model);
      modelResults.push({
        model,
        modelName: MODEL_CONFIGS[model].name,
        refactoredCode: mockResult.refactoredCode,
        metrics: mockResult.metrics,
        compilation: mockResult.compilation,
        warnings: mockResult.compilation.success ? undefined : ['Unused import detected'],
      });
    }
    
    const totalTime = Date.now() - startTime;
    
    // Calculate summary
    const successfulModels = modelResults.filter(r => r.compilation.success).map(r => r.model);
    const failedModels = modelResults.filter(r => !r.compilation.success).map(r => r.model);
    
    const fastest = modelResults.reduce((a, b) => 
      a.metrics.responseTime < b.metrics.responseTime ? a : b
    );
    const bestComplexity = modelResults.reduce((a, b) => 
      a.metrics.cyclomaticComplexity.improvement > b.metrics.cyclomaticComplexity.improvement ? a : b
    );
    const mostEfficient = modelResults.reduce((a, b) => 
      a.metrics.tokenUsage.totalTokens < b.metrics.tokenUsage.totalTokens ? a : b
    );
    const highestQuality = modelResults.reduce((a, b) => 
      a.metrics.qualityScore > b.metrics.qualityScore ? a : b
    );

    return {
      requestId,
      timestamp: new Date().toISOString(),
      totalExecutionTime: totalTime,
      results: modelResults,
      summary: {
        fastestModel: fastest.model,
        bestComplexityReduction: bestComplexity.model,
        mostTokenEfficient: mostEfficient.model,
        highestQuality: highestQuality.model,
        compiledModels: successfulModels,
        failedModels: failedModels,
      },
    };
  }, []);

  // Handle refactor request - calls the API
  const handleRefactor = useCallback(async (request) => {
    setError(undefined);
    setIsRefactoring(true);
    setResults([]);
    setSummary(undefined);
    setTotalExecutionTime(undefined);
    setRequestId(undefined);
    startTimeRef.current = Date.now();
    
    // Set loading models
    const modelsToRun = request.models || DEFAULT_MODEL_ORDER;
    setLoadingModels(modelsToRun);
    
    try {
      let response;
      
      if (SIMULATE_API_DELAY) {
        // Use mock response for demo purposes
        response = await generateMockResponse(request);
      } else {
        // Call the real API
        response = await analyzeCode(request.legacyCode, {
          targetJavaVersion: request.targetJavaVersion,
          refactoringGoals: request.refactoringGoals,
          models: request.models,
        });
      }
      
      if (!validateRefactorResponse(response)) {
        throw new Error('Invalid response format from API');
      }
      
      setResults(response.results);
      setSummary(response.summary);
      setTotalExecutionTime(response.totalExecutionTime);
      setRequestId(response.requestId);
      setLoadingModels([]);
      
    } catch (err) {
      console.error('Refactor failed:', err);
      setError(err instanceof Error ? err.message : 'Refactoring failed. Please try again.');
      setLoadingModels([]);
    } finally {
      setIsRefactoring(false);
    }
  }, [generateMockResponse]);

  // Handle retry for a specific model
  const handleRetry = useCallback(async (model) => {
    if (!code?.trim()) return;
    
    setLoadingModels(prev => [...prev, model]);
    setResults(prev => prev.map(r => r.model === model ? { ...r, refactoredCode: '' } : r));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      const mockResult = generateMockModelResult(model);
      
      setResults(prev => prev.map(r => r.model === model ? {
        ...r,
        refactoredCode: mockResult.refactoredCode,
        metrics: mockResult.metrics,
        compilation: mockResult.compilation,
      } : r));
      
      setLoadingModels(prev => prev.filter(m => m !== model));
    } catch (err) {
      setLoadingModels(prev => prev.filter(m => m !== model));
      setError(`Retry failed for ${MODEL_CONFIGS[model]?.name || model}`);
    }
  }, [code]);

  // Handle copy
  const handleCopy = useCallback((model) => {
    const result = results.find(r => r.model === model);
    if (result) {
      navigator.clipboard.writeText(result.refactoredCode);
    }
  }, [results]);

  // Handle focus model
  const handleFocusModel = useCallback((model) => {
    setFocusedModel(model);
    if (model) setViewMode('focus');
    else setViewMode('grid');
  }, []);

  // FIXED: Clear all - safely reset ALL state variables to their correct initial types
  const handleClearAll = useCallback(() => {
    setCode('');
    setResults([]);
    setLoadingModels([]);
    setTotalExecutionTime(undefined);
    setSummary(undefined);
    setError(undefined);
    setRequestId(undefined);
    setFocusedModel(undefined);
    setViewMode('grid');
    // Note: selectedModels and theme are intentionally preserved
  }, []);

  // Export results
  const handleExport = useCallback(() => {
    if (results.length === 0) return;
    
    const exportData = {
      requestId,
      timestamp: new Date().toISOString(),
      totalExecutionTime,
      originalCode: code,
      results: results.map(r => ({
        model: r.model,
        modelName: r.modelName,
        refactoredCode: r.refactoredCode,
        metrics: r.metrics,
        compilation: r.compilation,
      })),
      summary,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refactor-comparison-${requestId || Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, requestId, totalExecutionTime, code, summary]);

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <Cpu className="w-5 h-5 text-bg-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-text-primary tracking-tight">Code Refactoring Engine</h1>
                <p className="text-xs text-text-muted">Automated AI-Powered Code Review & Comparison</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* FIXED: Theme Toggle - reads from document.documentElement */}
              <button
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                className="btn-ghost p-2 rounded-lg"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Export */}
              {hasResults && (
                <button
                  onClick={handleExport}
                  className="btn-secondary flex items-center gap-2 text-sm hidden sm:flex"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              )}

              {/* FIXED: Clear All - calls handleClearAll which resets ALL state */}
              {(hasResults || code) && (
                <button
                  onClick={handleClearAll}
                  className="btn-ghost p-2 rounded-lg text-text-muted hover:text-red-400"
                  aria-label="Clear all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {/* Help */}
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="btn-ghost p-2 rounded-lg"
                aria-label="Help & Documentation"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - WRAPPED IN ERROR BOUNDARY */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Input Area - wrapped in ErrorBoundary */}
        <ErrorBoundary 
          fallback={(error, retry) => (
            <div className="card p-6 text-center">
              <h3 className="text-red-400 mb-2">Input Area Error</h3>
              <p className="text-text-muted mb-4">Failed to render the code input area.</p>
              <button onClick={retry} className="btn-primary">Retry</button>
            </div>
          )}
        >
          <section aria-labelledby="input-heading">
            <CodeInputArea
              code={code}
              onCodeChange={setCode}
              onRefactor={handleRefactor}
              isLoading={isRefactoring}
              totalExecutionTime={totalExecutionTime}
              selectedModels={selectedModels}
              onModelSelect={setSelectedModels}
              error={error}
              onClearAll={handleClearAll} // NEW: Pass clear all callback
            />
          </section>
        </ErrorBoundary>

        {/* Comparison Grid - wrapped in ErrorBoundary */}
        <ErrorBoundary
          fallback={(error, retry) => (
            <div className="card p-6 text-center">
              <h3 className="text-red-400 mb-2">Comparison Grid Error</h3>
              <p className="text-text-muted mb-4">Failed to render the model comparison.</p>
              <button onClick={retry} className="btn-primary">Retry</button>
            </div>
          )}
        >
          {(() => {
            if (hasResults || loadingModels.length > 0) {
              return (
                <section aria-labelledby="comparison-heading" key="comparison">
                  <ComparisonGrid
                    results={results}
                    loadingModels={loadingModels}
                    totalExecutionTime={totalExecutionTime}
                    summary={summary}
                    onCopy={handleCopy}
                    onRetry={handleRetry}
                    onExpandCode={handleFocusModel}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    focusedModel={focusedModel}
                    onFocusModel={handleFocusModel}
                  />
                </section>
              );
            }
            return (
              <section key="empty" className="text-center py-16 sm:py-24">
                <div className="max-w-2xl mx-auto">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center mx-auto mb-6">
                    <Cpu className="w-10 h-10 text-accent-primary/60" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">Ready to Refactor</h2>
                  <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    Paste legacy Java code above and click "Refactor Code" to see how four leading AI models 
                    transform and modernize your codebase with detailed metrics comparison.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted">
                    {DEFAULT_MODEL_ORDER.map((modelKey) => (
                      <div key={modelKey} className="flex items-center gap-2 px-3 py-1.5 bg-bg-tertiary rounded-full border border-border-primary">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_CONFIGS[modelKey]?.color }} />
                        <span>{MODEL_CONFIGS[modelKey]?.shortName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })()}
        </ErrorBoundary>

        {/* Request ID Footer */}
        {requestId && (
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-4 border-t border-border-primary">
            <span>Request ID:</span>
            <code className="font-mono bg-bg-tertiary px-2 py-0.5 rounded">{requestId}</code>
            <span>&bull;</span>
            <span>Generated at {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/90 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto card animate-slide-up">
            <div className="flex items-start justify-between p-6 border-b border-border-primary sticky top-0 bg-bg-card z-10">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Documentation & API Reference</h2>
                <p className="text-sm text-text-muted mt-1">Integration guide for the Automated Code Review Engine</p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="btn-ghost p-2 rounded-lg hover:bg-bg-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 text-sm text-text-secondary">
              <div>
                <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent-primary" />
                  Request Format (POST /api/v1/analyze)
                </h3>
                <pre className="bg-bg-input border border-border-primary rounded-lg p-4 overflow-x-auto text-xs font-mono">
                  {REQUEST_EXAMPLE}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent-primary" />
                  Response Format
                </h3>
                <pre className="bg-bg-input border border-border-primary rounded-lg p-4 overflow-x-auto text-xs font-mono">
                  {RESPONSE_EXAMPLE}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-accent-primary" />
                  Refactoring Goals
                </h3>
                <ul className="space-y-2">
                  {REFACTORING_GOALS.map(goal => (
                    <li key={goal} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent-primary/50" />
                      <code className="font-mono text-xs bg-bg-tertiary px-2 py-0.5 rounded">{goal}</code>
                      <span className="text-text-muted">- {goal.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-border-primary flex flex-wrap gap-3">
                <a href="#" className="btn-secondary flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4" />
                  GitHub Repository
                </a>
                <a href="#" className="btn-secondary flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Follow Updates
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcut: Escape to close modal */}
      <div 
        onKeyDown={(e) => { if (e?.key === 'Escape') setShowHelp(false); }}
        className="sr-only"
        tabIndex={0}
        aria-hidden="true"
      />
    </div>
  );
}