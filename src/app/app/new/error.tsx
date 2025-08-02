'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AppCreationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to help with debugging
    console.error('🚨 App creation error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            App Creation Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'An error occurred while creating your app'}
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={reset}
              className="w-full"
            >
              Try Again
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}