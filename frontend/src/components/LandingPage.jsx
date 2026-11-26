/**
 * LandingPage - Full-screen overlay shown before the main workspace initializes
 * Enterprise-grade design matching the warm beige/cream theme
 * Curtain reveal animation when isInitialized becomes true
 */

import { useRef, useEffect } from 'react';
import { Cpu, ArrowRight, Shield, Zap, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

export function LandingPage({ onInitialize, isInitialized = false }) {
  const landingRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    landingRef.current?.scrollTo(0, 0);
  }, []);

  return (
    <div
      ref={landingRef}
      className={cn(
        'landing-screen fixed inset-0 w-full h-[100dvh] z-50',
        'overflow-y-auto',
        'bg-bg-primary',
        'transition-transform duration-[800ms] ease-[cubic-bezier(0.77,0,0.175,1)]',
        isInitialized && 'slide-up'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="landing-heading"
    >
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-secondary/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent-primary/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" style={{ backgroundImage: `
        linear-gradient(rgba(194, 166, 130, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(194, 166, 130, 0.08) 1px, transparent 1px)
      `, backgroundSize: '60px 60px' }} />

      {/* Main Content - scrolling container with centered inner wrapper */}
      <div className="relative z-10 min-h-[100%] flex flex-col items-center justify-start px-6 pt-12 pb-16 max-w-[1024px] mx-auto text-center w-full">
        
        {/* Logo / Icon */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-xl shadow-accent-primary/25">
              <Cpu className="w-12 h-12 text-bg-primary" />
            </div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-accent-primary/30 animate-ping opacity-75" />
          </div>
          
          {/* Status badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card/80 border border-border-primary text-text-secondary text-sm font-medium backdrop-blur-sm">
              <Shield className="w-4 h-4 text-accent-primary" />
              Self-Healing Architecture
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card/80 border border-border-primary text-text-secondary text-sm font-medium backdrop-blur-sm">
              <Zap className="w-4 h-4 text-accent-primary" />
              Multi-Model Pipeline
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card/80 border border-border-primary text-text-secondary text-sm font-medium backdrop-blur-sm">
              <Brain className="w-4 h-4 text-accent-primary" />
              AI-Powered Analysis
            </span>
          </div>
        </div>

        {/* Main Typography */}
        <div className="text-center mb-12 max-w-3xl">
          <h1 
            id="landing-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6 tracking-tight"
          >
            AI-Powered Code Review Pipeline
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Automatically analyze, refactor, and verify your legacy Java code 
            using our self-healing AI architecture.
          </p>
        </div>

        {/* Initialize Button - Compact, centered, not stretched */}
        <button
          onClick={onInitialize}
          className={cn(
            'relative overflow-hidden',
            'inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl',
            'bg-gradient-to-r from-accent-primary to-accent-secondary',
            'text-bg-primary font-semibold text-lg',
            'shadow-xl shadow-accent-primary/30',
            'hover:shadow-2xl hover:shadow-accent-primary/40',
            'hover:scale-[1.02] active:scale-[0.98]',
            'transition-all duration-300 ease-out',
            'focus:outline-none focus:ring-4 focus:ring-accent-primary/40'
          )}
          aria-label="Initialize the AI Code Review Engine"
        >
          <span className="relative z-10">Initialize Engine</span>
          <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
          
          {/* Shine effect */}
          <span 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            aria-hidden="true"
          />
        </button>

        {/* Features preview */}
        <div className="mt-16 w-full max-w-4xl">
          <p className="text-center text-text-muted text-sm mb-8 uppercase tracking-wider">
            Engine Capabilities
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-4">
            {[
              { icon: Shield, label: 'Auto-Refactor', desc: 'Legacy Java → Modern patterns' },
              { icon: Zap, label: 'Self-Healing', desc: 'Auto-fix compilation errors' },
              { icon: Brain, label: 'Multi-Model', desc: 'Nemotron, GPT-4o, Gemini, Claude' },
              { icon: Cpu, label: 'Verification', desc: 'Compile & test validation' },
            ].map((feature, i) => (
              <div
                key={feature.label}
                className={cn(
                  'relative p-5 rounded-xl',
                  'bg-bg-card/60 backdrop-blur-sm',
                  'border border-border-primary',
                  'hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10',
                  'transition-all duration-300',
                  'group'
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-primary/25 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-bg-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">{feature.label}</h3>
                  <p className="text-sm text-text-secondary">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-text-muted text-xs uppercase tracking-wider">
            Enterprise Grade • Secure • Scalable
          </p>
        </div>
      </div>
    </div>
  );
}