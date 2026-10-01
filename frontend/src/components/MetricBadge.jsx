/**
 * MetricBadge - Reusable metric display component with variants
 * Used for displaying execution time, complexity scores, token usage, etc.
 */

import { cn } from '../lib/utils';

export function MetricBadge({
  label,
  value,
  icon,
  variant = 'neutral',
  size = 'md',
  className,
  trend,
  trendValue,
  onClick,
}) {
  const baseStyles = 'inline-flex items-center gap-2 font-mono';
  
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5',
  };
  
  const variantStyles = {
    primary: 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    neutral: 'bg-bg-tertiary border-border-primary text-text-secondary',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        'border rounded-full transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg hover:border-opacity-50',
        onClick && 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary',
        onClick && variant === 'primary' && 'focus:ring-accent-primary',
        onClick && variant === 'success' && 'focus:ring-green-500',
        onClick && variant === 'warning' && 'focus:ring-amber-500',
        onClick && variant === 'danger' && 'focus:ring-red-500',
        onClick && variant === 'neutral' && 'focus:ring-border-secondary',
        className
      )}
      aria-label={`${label}: ${value}`}
    >
      {icon && (
        <span className={cn(iconSize[size], 'flex-shrink-0')}>
          {icon}
        </span>
      )}
      
      <span className="font-medium tabular-nums">{value}</span>
      
      {trend && trendValue !== undefined && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded',
            trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}
        >
          {trend === 'up' ? '▲' : '▼'} {Math.abs(trendValue)}%
        </span>
      )}
      
      {/* Label only shown on larger sizes or when not compact */}
      {size !== 'sm' && (
        <span className="text-text-muted font-normal hidden sm:inline">{label}</span>
      )}
    </button>
  );
}

/**
 * Compact metric row for dense displays
 */
export function MetricRow({ metrics, gap = 3, wrap = true }) {
  return (
    <div className={cn('flex items-center', wrap && 'flex-wrap', `gap-${gap}`)}>
      {metrics.map((metric, index) => (
        <MetricBadge
          key={`${metric.label}-${index}`}
          label={metric.label}
          value={metric.value}
          icon={metric.icon}
          variant={metric.variant}
          size="sm"
          trend={metric.trend}
          trendValue={metric.trendValue}
        />
      ))}
    </div>
  );
}

/**
 * Large metric card for dashboard-style displays
 */
export function MetricCard({
  label,
  value,
  icon,
  variant = 'primary',
  description,
  trend,
  trendValue,
  trendLabel,
  className,
}) {
  const variantStyles = {
    primary: 'border-accent-primary/30 bg-accent-primary/5',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
    neutral: 'border-border-primary bg-bg-tertiary/50',
  };

  return (
    <div className={cn(
      'card p-5 flex flex-col',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              backgroundColor: variant === 'primary' ? 'rgba(0, 212, 170, 0.15)' :
                               variant === 'success' ? 'rgba(34, 197, 94, 0.15)' :
                               variant === 'warning' ? 'rgba(251, 191, 36, 0.15)' :
                               variant === 'danger' ? 'rgba(239, 68, 68, 0.15)' :
                               'rgba(107, 114, 128, 0.15)'
            }}>
              {icon}
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
            {description && (
              <p className="text-[11px] text-text-muted mt-0.5">{description}</p>
            )}
          </div>
        </div>
        
        {trend && trendValue !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg',
            trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {trend === 'up' ? '▲' : '▼'} {Math.abs(trendValue)}%
            {trendLabel && <span className="text-text-muted font-normal ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <p className="text-3xl font-mono font-bold text-text-primary tabular-nums">{value}</p>
      </div>
    </div>
  );
}