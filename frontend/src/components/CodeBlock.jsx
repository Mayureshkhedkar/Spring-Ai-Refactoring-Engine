/**
 * CodeBlock - Syntax highlighted code display with copy functionality
 * Supports Java syntax highlighting with token classification
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, Download, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Java syntax highlighting tokens
const JAVA_KEYWORDS = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'void', 'volatile', 'while', 'record', 'sealed', 'permits', 'yield',
  'var', 'true', 'false', 'null'
];

const JAVA_TYPES = [
  'String', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character',
  'Byte', 'Short', 'Object', 'List', 'ArrayList', 'Map', 'HashMap',
  'Set', 'HashSet', 'Collection', 'Collections', 'Optional', 'Stream',
  'ConcurrentHashMap', 'HashMap', 'ArrayList', 'LinkedList', 'Vector',
  'Stack', 'Queue', 'Deque', 'PriorityQueue', 'Thread', 'Runnable',
  'ExecutorService', 'Future', 'CompletableFuture', 'LocalDate', 'LocalTime',
  'LocalDateTime', 'Duration', 'Period', 'Instant', 'ZoneId', 'ZonedDateTime'
];

// Tokenize Java code for syntax highlighting
function tokenizeJava(code) {
  const tokens = [];
  
  // Patterns ordered by priority
  const patterns = [
    { type: 'comment', regex: /\/\/.*$/gm },
    { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
    { type: 'string', regex: /"(?:[^"\\]|\\.)*"/g },
    { type: 'string', regex: /'(?:[^'\\]|\\.)*'/g },
    { type: 'annotation', regex: /@\w+/g },
    { type: 'number', regex: /\b\d+(\.\d+)?([fFdD]?)\b/g },
    { type: 'keyword', regex: new RegExp(`\\b(${JAVA_KEYWORDS.join('|')})\\b`, 'g') },
    { type: 'type', regex: new RegExp(`\\b(${JAVA_TYPES.join('|')})\\b`, 'g') },
    { type: 'operator', regex: /[+\-*/%=<>!&|^~?:]/g },
    { type: 'punctuation', regex: /[{}()\[\];,.]/g },
  ];

  // Simple approach: split by lines and tokenize each line
  const lines = code.split('\n');
  
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    let line = lines[lineIdx];
    const lineTokens = [];
    
    // Find all matches in the line
    for (const { type, regex } of patterns) {
      const matches = [...line.matchAll(regex)];
      for (const match of matches) {
        if (match.index !== undefined) {
          lineTokens.push({
            type,
            content: match[0],
            start: match.index,
          });
        }
      }
    }
    
    // Sort by position
    lineTokens.sort((a, b) => a.start - b.start);
    
    // Merge overlapping/adjacent tokens (keep first match)
    const merged = [];
    for (const token of lineTokens) {
      const end = token.start + token.content.length;
      const last = merged[merged.length - 1];
      if (last && token.start < last.end) continue; // Overlap, skip
      merged.push({ ...token, end });
    }
    
    // Build output with plain text between tokens
    let lastEnd = 0;
    for (const token of merged) {
      if (token.start > lastEnd) {
        tokens.push({ type: 'plain', content: line.slice(lastEnd, token.start) });
      }
      tokens.push({ type: token.type, content: token.content });
      lastEnd = token.end;
    }
    
    if (lastEnd < line.length) {
      tokens.push({ type: 'plain', content: line.slice(lastEnd) });
    }
    
    // Add newline if not last line
    if (lineIdx < lines.length - 1) {
      tokens.push({ type: 'plain', content: '\n' });
    }
  }
  
  return tokens;
}

export function CodeBlock({
  code,
  language = 'java',
  filename,
  maxHeight = 400,
  showLineNumbers = true,
  onCopy,
  className,
  isLoading = false,
  error,
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const tokensRef = useRef([]);

  // Tokenize code on change
  useEffect(() => {
    if (language === 'java') {
      tokensRef.current = tokenizeJava(code);
    } else {
      tokensRef.current = [{ type: 'plain', content: code }];
    }
  }, [code, language]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code, onCopy]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `refactored-code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, filename, language]);

  if (isLoading) {
    return (
      <div className={cn('code-block', className)} style={{ maxHeight: `${maxHeight}px` }}>
        <div className="code-block-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            <div className="h-4 w-24 rounded bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            {filename && (
              <div className="h-4 w-32 rounded ml-auto bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
        <div className="code-block-content">
          <div className="space-y-3 p-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary bg-[length:200%_100%] animate-shimmer rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('code-block', className)} style={{ maxHeight: `${maxHeight}px` }}>
        <div className="code-block-header">
          <div className="flex items-center gap-3 text-text-muted">
            <span className="text-xs font-mono">{filename || 'RefactoredCode.java'}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
              Error
            </span>
          </div>
        </div>
        <div className="code-block-content p-6 text-center">
          <div className="text-red-400 mb-2">Failed to load refactored code</div>
          <pre className="text-text-muted text-sm whitespace-pre-wrap">{error}</pre>
        </div>
      </div>
    );
  }

  const lines = code.split('\n');

  return (
    <div className={cn('code-block', className)} style={{ maxHeight: isExpanded ? 'none' : `${maxHeight}px` }}>
      {/* Header */}
      <div className="code-block-header">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showLineNumbers && (
            <span className="text-xs text-text-muted font-mono px-2 py-0.5 bg-bg-input rounded border border-border-primary">
              {lines.length} lines
            </span>
          )}
          <span className="text-xs font-mono text-text-secondary truncate">
            {filename || `RefactoredCode.${language}`}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-bg-input border border-border-primary text-text-muted uppercase tracking-wider">
            {language}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={cn(
              'btn-ghost p-2 rounded-lg transition-colors',
              copied && 'bg-green-500/20 text-green-400'
            )}
            aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleDownload}
            className="btn-ghost p-2 rounded-lg"
            aria-label="Download code"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-ghost p-2 rounded-lg"
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="code-block-content" style={{ maxHeight: isExpanded ? 'none' : `${maxHeight}px` }}>
        <pre className="m-0 font-mono text-sm leading-relaxed">
          {showLineNumbers && (
            <div className="flex flex-col -ml-8 mr-3 select-none">
              {lines.map((_, index) => (
                <span key={index} className="block w-8 text-right pr-3 text-text-muted border-r border-border-primary">
                  {index + 1}
                </span>
              ))}
            </div>
          )}
          {language === 'java' && tokensRef.current.length > 0 ? (
            tokensRef.current.map((token, index) => (
              <span
                key={index}
                className={cn(
                  'token',
                  token.type === 'keyword' && 'token-keyword',
                  token.type === 'type' && 'token-type',
                  token.type === 'string' && 'token-string',
                  token.type === 'comment' && 'token-comment',
                  token.type === 'number' && 'token-number',
                  token.type === 'annotation' && 'token-annotation',
                  token.type === 'operator' && 'token-operator',
                  token.type === 'punctuation' && 'token-punctuation',
                )}
              >
                {token.content.split('\n').map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < token.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </span>
            ))
          ) : (
            code
          )}
        </pre>
      </div>

      {/* Expanded overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-sm flex flex-col"
          onClick={() => setIsExpanded(false)}
        >
          <div className="flex items-center justify-between p-4 border-b border-border-primary">
            <span className="text-sm font-mono text-text-secondary">{filename || `RefactoredCode.${language}`}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="btn-secondary text-sm"
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="btn-secondary text-sm"
              >
                <Download className="w-4 h-4 mr-1" /> Download
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="btn-secondary text-sm"
              >
                <Minimize2 className="w-4 h-4 mr-1" /> Close
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <pre className="m-0 font-mono text-base leading-relaxed max-w-4xl mx-auto">
              {showLineNumbers && (
                <div className="flex flex-col -ml-10 mr-4 select-none">
                  {lines.map((_, index) => (
                    <span key={index} className="block w-10 text-right pr-4 text-text-muted border-r border-border-primary">
                      {index + 1}
                    </span>
                  ))}
                </div>
              )}
              {code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple code block without syntax highlighting (for fallback)
 */
export function SimpleCodeBlock({
  code,
  language = 'java',
  filename,
  maxHeight = 400,
  onCopy,
  className,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  }, [code, onCopy]);

  return (
    <div className={cn('code-block', className)} style={{ maxHeight: `${maxHeight}px` }}>
      <div className="code-block-header">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-text-secondary">{filename || `code.${language}`}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-bg-input border border-border-primary text-text-muted uppercase">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className={cn('btn-ghost p-2 rounded-lg', copied && 'bg-green-500/20 text-green-400')}
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="code-block-content">
        <pre className="m-0 font-mono text-sm leading-relaxed p-4">{code}</pre>
      </div>
    </div>
  );
}

// to be finaliesd
