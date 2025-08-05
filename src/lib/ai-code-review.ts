import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

// Code review schema
const codeReviewSchema = z.object({
  overallScore: z.number().min(0).max(10),
  issues: z.array(z.object({
    type: z.enum(['security', 'performance', 'style', 'bug', 'optimization']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    line: z.number().optional(),
    message: z.string(),
    suggestion: z.string(),
    example: z.string().optional()
  })),
  strengths: z.array(z.string()),
  recommendations: z.array(z.string())
});

export type CodeReview = z.infer<typeof codeReviewSchema>;

export async function reviewCode(
  code: string, 
  filename: string,
  projectContext?: string
): Promise<CodeReview> {
  const prompt = `
You are an expert code reviewer. Analyze this ${filename} file and provide a comprehensive review.

${projectContext ? `Project Context: ${projectContext}` : ''}

Code to review:
\`\`\`
${code}
\`\`\`

Focus on:
1. **Security vulnerabilities** (XSS, injection, exposed secrets)
2. **Performance issues** (unnecessary renders, memory leaks, inefficient algorithms)
3. **Code quality** (readability, maintainability, best practices)
4. **Potential bugs** (null checks, error handling, edge cases)
5. **Optimization opportunities** (bundle size, loading performance)

Rate the code 0-10 and provide specific, actionable feedback with line numbers when possible.
`;

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    prompt,
    schema: codeReviewSchema,
  });

  return result.object;
}

export async function generateSecurityScan(projectFiles: { path: string; content: string }[]): Promise<{
  vulnerabilities: Array<{
    file: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    fix: string;
  }>;
  securityScore: number;
}> {
  const filesContext = projectFiles.map(f => `${f.path}:\n${f.content}`).join('\n\n---\n\n');
  
  const prompt = `
Perform a comprehensive security audit of this project:

${filesContext}

Identify:
1. XSS vulnerabilities
2. SQL injection risks  
3. Exposed API keys/secrets
4. Insecure dependencies
5. Authentication/authorization issues
6. CSRF vulnerabilities
7. Input validation problems

Provide a security score (0-10) and detailed findings with specific fixes.
`;

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    prompt,
    schema: z.object({
      vulnerabilities: z.array(z.object({
        file: z.string(),
        type: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        fix: z.string()
      })),
      securityScore: z.number().min(0).max(10)
    })
  });

  return result.object;
}