"use client";

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        setLoading(true);
        
        // Test basic API endpoints
        const tests = {
          'User Billing API': '/api/user/billing',
          'Auth Status': '/api/auth/status',
        };

        const results: any = {};

        for (const [name, endpoint] of Object.entries(tests)) {
          try {
            const response = await fetch(endpoint);
            results[name] = {
              status: response.status,
              ok: response.ok,
              statusText: response.statusText,
            };
            
            if (response.ok) {
              try {
                const data = await response.json();
                results[name].data = data;
              } catch (e) {
                results[name].data = 'Could not parse JSON';
              }
            }
          } catch (e) {
            results[name] = {
              error: e instanceof Error ? e.message : 'Unknown error',
            };
          }
        }

        // Add environment info (without sensitive data)
        results['Environment'] = {
          'NODE_ENV': process.env.NODE_ENV,
          'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
          'Has DATABASE_URL': !!process.env.DATABASE_URL,
          'Has FREESTYLE_API_KEY': !!process.env.FREESTYLE_API_KEY,
          'Has STACK_PROJECT_ID': !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        };

        setDebugInfo(results);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔍 Debug Information</h1>
        <div className="animate-pulse">Loading debug information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">❌ Debug Error</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Information</h1>
      
      <div className="space-y-6">
        {Object.entries(debugInfo).map(([name, info]) => (
          <div key={name} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">{name}</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(info, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <h3 className="font-semibold mb-2">💡 Next Steps:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Check if all API endpoints return 200 status</li>
          <li>Verify environment variables are set correctly</li>
          <li>Check browser console for JavaScript errors</li>
          <li>Ensure database connection is working</li>
        </ul>
      </div>
    </div>
  );
}