"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  error?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: string;
  onStepComplete?: (stepId: string) => void;
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  onStepComplete 
}: ProgressIndicatorProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const completed = steps
      .filter(step => step.status === 'completed')
      .map(step => step.id);
    setCompletedSteps(completed);
  }, [steps]);

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <Circle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatus = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'running':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              step.status === 'running' 
                ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' 
                : step.status === 'completed'
                ? 'border-green-200 bg-green-50 dark:bg-green-900/10'
                : step.status === 'error'
                ? 'border-red-200 bg-red-50 dark:bg-red-900/10'
                : 'border-gray-200 bg-gray-50 dark:bg-gray-900/10'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${getStepStatus(step)}`}>
                    {step.title}
                  </h3>
                  
                  {step.status === 'running' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      In progress...
                    </span>
                  )}
                  
                  {step.status === 'completed' && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Completed
                    </span>
                  )}
                  
                  {step.status === 'error' && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Failed
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
                
                {/* Show result for completed steps */}
                {step.status === 'completed' && step.result && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {step.result}
                    </p>
                  </div>
                )}
                
                {/* Show error for failed steps */}
                {step.status === 'error' && step.error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {step.error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{completedSteps.length} of {steps.length} completed</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedSteps.length / steps.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}