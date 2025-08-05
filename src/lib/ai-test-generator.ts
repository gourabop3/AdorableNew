import { google } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

const testSuiteSchema = z.object({
  framework: z.enum(['jest', 'vitest', 'react-testing-library', 'cypress']),
  testFile: z.string(),
  tests: z.array(z.object({
    describe: z.string(),
    tests: z.array(z.object({
      it: z.string(),
      code: z.string(),
      type: z.enum(['unit', 'integration', 'e2e'])
    }))
  })),
  setup: z.string().optional(),
  mocks: z.array(z.string()).optional()
});

export type TestSuite = z.infer<typeof testSuiteSchema>;

export async function generateTests(
  code: string,
  filename: string,
  testType: 'unit' | 'integration' | 'e2e' = 'unit'
): Promise<TestSuite> {
  const prompt = `
Generate comprehensive ${testType} tests for this ${filename} file.

Code to test:
\`\`\`
${code}
\`\`\`

Requirements:
1. **Unit Tests**: Test individual functions and components
2. **Edge Cases**: Handle null, undefined, empty values
3. **Error Scenarios**: Test error handling and validation
4. **User Interactions**: Click events, form submissions, etc.
5. **Async Operations**: API calls, timers, promises
6. **Accessibility**: Screen reader compatibility, keyboard navigation

Generate tests using React Testing Library and Jest. Include:
- Proper setup and teardown
- Mock implementations for external dependencies
- Descriptive test names
- Good test coverage for all code paths
- Performance considerations

Make tests readable, maintainable, and comprehensive.
`;

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    prompt,
    schema: testSuiteSchema,
  });

  return result.object;
}

export async function generateE2ETests(
  appDescription: string,
  userFlows: string[]
): Promise<{
  cypressTests: string;
  playwrightTests: string;
}> {
  const prompt = `
Generate end-to-end tests for this application:

App Description: ${appDescription}

User Flows to Test:
${userFlows.map((flow, i) => `${i + 1}. ${flow}`).join('\n')}

Generate both Cypress and Playwright test files that cover:
1. **Happy Path**: Complete user journeys
2. **Error Scenarios**: Network failures, validation errors
3. **Cross-browser**: Different browsers and devices
4. **Performance**: Page load times, API response times
5. **Accessibility**: Keyboard navigation, screen reader support

Include proper selectors, waits, and assertions.
`;

  const result = await generateText({
    model: google('gemini-1.5-pro'),
    prompt,
  });

  // Parse the response to extract Cypress and Playwright tests
  const sections = result.text.split('---');
  return {
    cypressTests: sections[0] || result.text,
    playwrightTests: sections[1] || result.text
  };
}

export async function generatePerformanceTests(projectFiles: { path: string; content: string }[]): Promise<{
  lightHouseTests: string;
  bundleAnalysis: string;
  recommendations: string[];
}> {
  const filesContext = projectFiles.slice(0, 5).map(f => `${f.path}:\n${f.content.slice(0, 1000)}`).join('\n\n---\n\n');
  
  const prompt = `
Analyze this project for performance testing opportunities:

${filesContext}

Generate:
1. **Lighthouse Tests**: Automated performance auditing
2. **Bundle Analysis**: Check for large dependencies and code splitting opportunities
3. **Performance Recommendations**: Specific optimizations for this codebase

Focus on:
- Page load performance
- Runtime performance
- Bundle size optimization
- Image optimization
- Lazy loading opportunities
- Memory usage
`;

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    prompt,
    schema: z.object({
      lightHouseTests: z.string(),
      bundleAnalysis: z.string(),
      recommendations: z.array(z.string())
    })
  });

  return result.object;
}