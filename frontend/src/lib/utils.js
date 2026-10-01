/**
 * Utility functions for the Code Review & Refactoring Engine
 */

import { clsx } from 'clsx';

/**
 * Combines class names with clsx for conditional styling
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Formats a duration in milliseconds to a human-readable string
 */
export function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

/**
 * Formats a number with commas for thousands
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

/**
 * Formats token count with k/m suffixes
 */
export function formatTokens(tokens) {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}

/**
 * Calculates percentage improvement
 */
export function calculateImprovement(original, improved) {
  if (original === 0) return 0;
  return Math.round(((original - improved) / original) * 100);
}

/**
 * Gets color class for metric based on value (green for good, red for bad)
 */
export function getMetricColorClass(value, lowerIsBetter = true) {
  if (lowerIsBetter) {
    return value <= 10 ? 'text-green-400' : value <= 20 ? 'text-amber-400' : 'text-red-400';
  }
  return value >= 80 ? 'text-green-400' : value >= 60 ? 'text-amber-400' : 'text-red-400';
}

/**
 * Generates a unique request ID
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce function for input handling
 */
export function debounce(func, wait) {
  let timeoutId = null;
  
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle(func, limit) {
  let inThrottle = false;
  
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Deep clones an object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks if code is valid Java (basic heuristic)
 */
export function isValidJavaCode(code) {
  const trimmed = code.trim();
  return trimmed.length > 0 && 
    (trimmed.includes('class ') || trimmed.includes('interface ') || trimmed.includes('enum '));
}

/**
 * Extracts class name from Java code
 */
export function extractClassName(code) {
  const match = code.match(/(?:public\s+)?(?:abstract\s+)?(?:final\s+)?class\s+(\w+)/);
  return match ? match[1] : null;
}

/**
 * Counts lines of code (non-empty, non-comment)
 */
export function countLOC(code) {
  const lines = code.split('\n');
  return lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
  }).length;
}

/**
 * Estimates cyclomatic complexity (simplified)
 */
export function estimateComplexity(code) {
  const complexityKeywords = [
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'catch',
    '&&', '||', '?', 'throw', 'return'
  ];
  
  let complexity = 1; // Base complexity
  
  for (const keyword of complexityKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  }
  
  return complexity;
}

/**
 * Generates mock model result for development
 */
export function generateMockModelResult(modelType) {
  const baseCode = `public class RefactoredOrderProcessor {
    
    private final List<Order> orders = new ArrayList<>();
    private final Map<String, Customer> customers = new ConcurrentHashMap<>();
    private static final double TAX_RATE = 0.08;
    private static final double VIP_DISCOUNT = 0.10;
    
    public void processOrders() {
        orders.parallelStream()
            .filter(Objects::nonNull)
            .filter(order -> order.getCustomer() != null)
            .forEach(this::processOrder);
    }
    
    private void processOrder(Order order) {
        Customer customer = customers.get(order.getCustomer().getId());
        if (customer == null) return;
        
        double subtotal = order.getItems().stream()
            .filter(Objects::nonNull)
            .filter(item -> item.getPrice() > 0)
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
            
        double total = calculateTotal(subtotal, customer.isVip());
        
        logger.info('Processing order {} for {}: $', order.getId(), customer.getName(), total);
    }
    
    private double calculateTotal(double subtotal, boolean isVip) {
        double total = subtotal * (1 + TAX_RATE);
        return isVip ? total * (1 - VIP_DISCOUNT) : total;
    }
    
    public void addOrder(Order order) {
        if (order != null) {
            orders.add(order);
        }
    }
    
    public List<Order> getOrders() {
        return Collections.unmodifiableList(orders);
    }
}`;

  // Vary the code slightly per model
  const variations = {
    nemotron: baseCode.replace('ConcurrentHashMap', 'HashMap').replace('parallelStream()', 'stream()'),
    gpt4o: baseCode,
    gemini: baseCode.replace('ConcurrentHashMap', 'Map').replace('logger.info', 'System.out.println'),
    claude: baseCode.replace('Collections.unmodifiableList', 'List.copyOf'),
  };
  
  const responseTimes = { nemotron: 0.8, gpt4o: 1.2, gemini: 1.5, claude: 2.1 };
  const retries = { nemotron: 0, gpt4o: 0, gemini: 1, claude: 0 };
  const complexities = { nemotron: { o: 18, r: 4 }, gpt4o: { o: 18, r: 3 }, gemini: { o: 18, r: 5 }, claude: { o: 18, r: 3 } };
  const tokens = { 
    nemotron: { in: 1200, out: 850 }, 
    gpt4o: { in: 1200, out: 920 }, 
    gemini: { in: 1200, out: 1100 }, 
    claude: { in: 1200, out: 980 } 
  };
  const qualityScores = { nemotron: 92, gpt4o: 95, gemini: 88, claude: 94 };
  
  const model = modelType;
  const comp = complexities[model];
  const tok = tokens[model];
  const origLOC = 45;
  const refLOC = 38;
  
  return {
    refactoredCode: variations[model] || baseCode,
    metrics: {
      responseTime: responseTimes[model] + (Math.random() * 0.3 - 0.15),
      compilerRetries: retries[model],
      cyclomaticComplexity: {
        original: comp.o,
        refactored: comp.r,
        improvement: calculateImprovement(comp.o, comp.r),
      },
      tokenUsage: {
        inputTokens: tok.in,
        outputTokens: tok.out,
        totalTokens: tok.in + tok.out,
      },
      linesOfCode: {
        original: origLOC,
        refactored: refLOC,
        reduction: calculateImprovement(origLOC, refLOC),
      },
      qualityScore: qualityScores[model] + Math.floor(Math.random() * 3) - 1,
    },
    compilation: {
      success: retries[model] === 0,
      output: retries[model] > 0 ? 'Warning: Unused import java.util.ConcurrentHashMap' : undefined,
      compilationTime: 450 + Math.floor(Math.random() * 200),
      javaVersion: '21',
    },
  };
}

/**
 * Formats a timestamp for display
 */
export function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Validates API response structure
 */
export function validateRefactorResponse(data) {
  if (!data || typeof data !== 'object') return false;
  const d = data;
  return (
    typeof d.requestId === 'string' &&
    typeof d.timestamp === 'string' &&
    typeof d.totalExecutionTime === 'number' &&
    Array.isArray(d.results) &&
    typeof d.summary === 'object'
  );
}