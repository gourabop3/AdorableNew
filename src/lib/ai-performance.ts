import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

const performanceAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  issues: z.array(z.object({
    type: z.enum(['memory', 'rendering', 'network', 'bundle', 'runtime']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    file: z.string(),
    line: z.number().optional(),
    description: z.string(),
    impact: z.string(),
    solution: z.string(),
    example: z.string().optional()
  })),
  optimizations: z.array(z.object({
    category: z.string(),
    description: z.string(),
    implementation: z.string(),
    impact: z.enum(['low', 'medium', 'high'])
  })),
  bundleAnalysis: z.object({
    size: z.string(),
    recommendations: z.array(z.string())
  })
});

export type PerformanceAnalysis = z.infer<typeof performanceAnalysisSchema>;

export async function analyzePerformance(
  projectFiles: { path: string; content: string }[]
): Promise<PerformanceAnalysis> {
  const codeContext = projectFiles
    .filter(f => f.path.match(/\.(ts|tsx|js|jsx)$/))
    .slice(0, 8)
    .map(f => `${f.path}:\n${f.content.slice(0, 3000)}`)
    .join('\n\n---\n\n');

  const prompt = `
Perform a comprehensive performance analysis of this React/Next.js project:

${codeContext}

Analyze for:
1. **React Performance Issues**:
   - Unnecessary re-renders
   - Missing React.memo/useMemo/useCallback
   - Large component trees
   - Inefficient state updates

2. **Bundle Size Issues**:
   - Large dependencies
   - Code splitting opportunities
   - Tree shaking problems
   - Duplicate code

3. **Runtime Performance**:
   - Expensive calculations in render
   - Memory leaks
   - Inefficient algorithms
   - DOM manipulation issues

4. **Network Performance**:
   - API call optimization
   - Image optimization
   - Lazy loading opportunities
   - Caching strategies

5. **Core Web Vitals**:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

Rate performance 0-100 and provide specific, actionable optimizations.
`;

  const result = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    prompt,
    schema: performanceAnalysisSchema,
  });

  return result.object;
}

export async function optimizeComponent(
  componentCode: string,
  componentName: string
): Promise<{
  optimizedCode: string;
  optimizations: Array<{
    type: string;
    description: string;
    before: string;
    after: string;
  }>;
  performance: {
    renderOptimizations: string[];
    memoryOptimizations: string[];
    bundleOptimizations: string[];
  };
}> {
  const prompt = `
Optimize this React component for maximum performance:

Component: ${componentName}

\`\`\`
${componentCode}
\`\`\`

Apply these optimizations:
1. **React.memo** for unnecessary re-renders
2. **useMemo** for expensive calculations
3. **useCallback** for function references
4. **Code splitting** for large components
5. **Lazy loading** for images/content
6. **Virtual scrolling** for large lists
7. **Debouncing** for user inputs
8. **State optimization** to reduce updates

Return the optimized code and explain each optimization applied.
`;

  const result = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    prompt,
    schema: z.object({
      optimizedCode: z.string(),
      optimizations: z.array(z.object({
        type: z.string(),
        description: z.string(),
        before: z.string(),
        after: z.string()
      })),
      performance: z.object({
        renderOptimizations: z.array(z.string()),
        memoryOptimizations: z.array(z.string()),
        bundleOptimizations: z.array(z.string())
      })
    })
  });

  return result.object;
}

export async function analyzeBundleSize(
  packageJson: string,
  buildOutput?: string
): Promise<{
  analysis: {
    totalSize: string;
    largestDependencies: Array<{
      name: string;
      size: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    unusedDependencies: string[];
    recommendations: string[];
  };
  optimizations: {
    codeSplitting: string[];
    treeshaking: string[];
    bundleOptimization: string[];
  };
}> {
  const prompt = `
Analyze bundle size and dependencies for optimization:

Package.json:
\`\`\`
${packageJson}
\`\`\`

${buildOutput ? `Build Output:\n${buildOutput}` : ''}

Provide:
1. **Dependency Analysis**: Which packages are largest/unnecessary
2. **Code Splitting**: Where to split bundles
3. **Tree Shaking**: Opportunities to reduce imports
4. **Bundle Optimization**: Webpack/Vite optimizations
5. **Alternative Libraries**: Smaller alternatives to large deps

Focus on actionable recommendations to reduce bundle size.
`;

  const result = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    prompt,
    schema: z.object({
      analysis: z.object({
        totalSize: z.string(),
        largestDependencies: z.array(z.object({
          name: z.string(),
          size: z.string(),
          impact: z.enum(['low', 'medium', 'high'])
        })),
        unusedDependencies: z.array(z.string()),
        recommendations: z.array(z.string())
      }),
      optimizations: z.object({
        codeSplitting: z.array(z.string()),
        treeshaking: z.array(z.string()),
        bundleOptimization: z.array(z.string())
      })
    })
  });

  return result.object;
}

export async function generateOptimizationPlan(
  currentPerformance: PerformanceAnalysis,
  priority: 'bundle' | 'runtime' | 'user-experience' = 'user-experience'
): Promise<{
  plan: Array<{
    step: number;
    title: string;
    description: string;
    implementation: string;
    estimatedImpact: string;
    timeRequired: string;
  }>;
  quickWins: string[];
  longTermGoals: string[];
}> {
  const prompt = `
Create an optimization implementation plan based on this performance analysis:

Performance Issues:
${JSON.stringify(currentPerformance.issues, null, 2)}

Priority: ${priority}

Create a step-by-step plan that:
1. **Prioritizes by impact** and effort required
2. **Groups related optimizations** together
3. **Provides clear implementation steps**
4. **Estimates time and impact** for each step
5. **Identifies quick wins** vs long-term improvements

Focus on ${priority === 'bundle' ? 'reducing bundle size' : 
priority === 'runtime' ? 'improving runtime performance' : 
'enhancing user experience metrics (Core Web Vitals)'}
`;

  const result = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    prompt,
    schema: z.object({
      plan: z.array(z.object({
        step: z.number(),
        title: z.string(),
        description: z.string(),
        implementation: z.string(),
        estimatedImpact: z.string(),
        timeRequired: z.string()
      })),
      quickWins: z.array(z.string()),
      longTermGoals: z.array(z.string())
    })
  });

  return result.object;
}