"use client";

import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance-monitor';

interface DebugPanelProps {
  appId: string;
  isVisible?: boolean;
}

export function DebugPanel({ appId, isVisible = false }: DebugPanelProps) {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [isEnabled, setIsEnabled] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled]);

  if (!isVisible || !isEnabled) return null;

  const averageRenderTime = performanceMonitor.getAverageRenderTime();
  const slowRenders = performanceMonitor.getSlowRenders();
  const recentErrors = metrics.slice(-5).flatMap(m => m.errors);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <button
          onClick={() => performanceMonitor.clear()}
          className="text-red-400 hover:text-red-300"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">App ID:</span> {appId}
        </div>
        
        <div>
          <span className="text-gray-400">Avg Render Time:</span>{' '}
          <span className={averageRenderTime > 16 ? 'text-red-400' : 'text-green-400'}>
            {averageRenderTime.toFixed(2)}ms
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Slow Renders:</span>{' '}
          <span className={slowRenders.length > 0 ? 'text-red-400' : 'text-green-400'}>
            {slowRenders.length}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Recent Errors:</span>{' '}
          <span className={recentErrors.length > 0 ? 'text-red-400' : 'text-green-400'}>
            {recentErrors.length}
          </span>
        </div>
        
        {recentErrors.length > 0 && (
          <div className="mt-2 p-2 bg-red-900/50 rounded text-xs">
            {recentErrors.slice(-3).map((error, i) => (
              <div key={i} className="text-red-300 truncate">
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}