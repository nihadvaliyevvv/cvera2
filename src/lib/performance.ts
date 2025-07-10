// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    // Store metric
    const metrics = this.metrics.get(name) || [];
    metrics.push(duration);
    this.metrics.set(name, metrics);

    return duration;
  }

  static getMetrics(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } {
    const metrics = this.metrics.get(name) || [];
    
    if (metrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, total: 0 };
    }

    const total = metrics.reduce((sum, val) => sum + val, 0);
    const average = total / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return {
      count: metrics.length,
      average,
      min,
      max,
      total,
    };
  }

  static getAllMetrics(): Record<string, ReturnType<typeof PerformanceMonitor.getMetrics>> {
    const result: Record<string, ReturnType<typeof PerformanceMonitor.getMetrics>> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }

    return result;
  }

  static clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

// Database query performance monitor
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    PerformanceMonitor.startTimer(operationName);
    
    try {
      const result = await fn(...args);
      const duration = PerformanceMonitor.endTimer(operationName);
      
      // Log slow queries (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      PerformanceMonitor.endTimer(operationName);
      throw error;
    }
  }) as T;
}

// React component performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const startTime = performance.now();
  
  React.useEffect(() => {
    const duration = performance.now() - startTime;
    PerformanceMonitor.startTimer(`${componentName}-render`);
    PerformanceMonitor.endTimer(`${componentName}-render`);
    
    return () => {
      // Log if component took too long to render
      if (duration > 16) { // 16ms = 60fps
        console.warn(`Slow component render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName, startTime]);
}

// API endpoint performance monitoring
export function withApiPerformanceMonitoring(handler: any, endpointName: string) {
  return async (req: any, res: any) => {
    const startTime = performance.now();
    
    try {
      const result = await handler(req, res);
      const duration = performance.now() - startTime;
      
      // Log slow API requests (> 2 seconds)
      if (duration > 2000) {
        console.warn(`Slow API endpoint: ${endpointName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`API error in ${endpointName} after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
}

// Memory usage monitoring
export function logMemoryUsage(context: string = 'Unknown') {
  if (typeof window !== 'undefined') {
    // Browser environment
    const memory = (performance as any).memory;
    if (memory) {
      console.info(`Memory usage (${context}):`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  } else {
    // Node.js environment
    const usage = process.memoryUsage();
    console.info(`Memory usage (${context}):`, {
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
    });
  }
}

// React import for usePerformanceMonitoring
import React from 'react';
