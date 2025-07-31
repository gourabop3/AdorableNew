import { useRef, useEffect } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  networkRequests: number;
  errors: string[];
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // Keep last 100 metrics
  private isEnabled = process.env.NODE_ENV === 'development';

  startTimer(label: string): () => void {
    if (!this.isEnabled) return () => {};
    
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      
      if (duration > 100) {
        console.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  trackRenderTime(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetrics = {
      renderTime,
      networkRequests: 0,
      errors: [],
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    if (renderTime > 16) { // 60fps threshold
      console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  trackNetworkRequest(url: string, duration: number) {
    if (!this.isEnabled) return;

    if (duration > 1000) {
      console.warn(`🌐 Slow network request: ${url} took ${duration.toFixed(2)}ms`);
    }
  }

  trackError(error: string, context?: string) {
    if (!this.isEnabled) return;

    console.error(`❌ Error${context ? ` in ${context}` : ''}:`, error);
    
    const metric = this.metrics[this.metrics.length - 1];
    if (metric) {
      metric.errors.push(error);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageRenderTime(): number {
    if (this.metrics.length === 0) return 0;
    
    const total = this.metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / this.metrics.length;
  }

  getSlowRenders(): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.renderTime > 16);
  }

  clear() {
    this.metrics = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for tracking component render performance
export function usePerformanceTracking(componentName: string) {
  const renderStart = useRef(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    performanceMonitor.trackRenderTime(componentName, renderTime);
    renderStart.current = performance.now();
  });
}

// Utility for tracking async operations
export function trackAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const stopTimer = performanceMonitor.startTimer(operationName);
  
  return operation()
    .then((result) => {
      stopTimer();
      return result;
    })
    .catch((error) => {
      stopTimer();
      performanceMonitor.trackError(error.message, operationName);
      throw error;
    });
}