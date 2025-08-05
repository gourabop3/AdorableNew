import { google } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

const documentationSchema = z.object({
  title: z.string(),
  description: z.string(),
  installation: z.string(),
  usage: z.string(),
  api: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string()
    })),
    returns: z.string(),
    example: z.string()
  })),
  examples: z.array(z.object({
    title: z.string(),
    description: z.string(),
    code: z.string()
  })),
  troubleshooting: z.array(z.object({
    problem: z.string(),
    solution: z.string()
  }))
});

export type Documentation = z.infer<typeof documentationSchema>;

export async function generateProjectDocumentation(
  projectFiles: { path: string; content: string }[],
  projectName: string,
  projectDescription?: string
): Promise<Documentation> {
  const codeContext = projectFiles
    .filter(f => f.path.match(/\.(ts|tsx|js|jsx)$/))
    .slice(0, 10)
    .map(f => `${f.path}:\n${f.content.slice(0, 2000)}`)
    .join('\n\n---\n\n');

  const prompt = `
Generate comprehensive documentation for the "${projectName}" project.

${projectDescription ? `Project Description: ${projectDescription}` : ''}

Project Code:
${codeContext}

Create documentation that includes:
1. **Clear project description** and purpose
2. **Installation instructions** step-by-step
3. **Usage guide** with examples
4. **API documentation** for all public functions/components
5. **Code examples** for common use cases
6. **Troubleshooting guide** for common issues

Make it beginner-friendly but comprehensive for developers.
`;

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    prompt,
    schema: documentationSchema,
  });

  return result.object;
}

export async function generateAPIDocumentation(
  apiFiles: { path: string; content: string }[]
): Promise<{
  endpoints: Array<{
    method: string;
    path: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    responses: Array<{
      status: number;
      description: string;
      example: string;
    }>;
    example: string;
  }>;
}> {
  const apiContext = apiFiles.map(f => `${f.path}:\n${f.content}`).join('\n\n---\n\n');

  const prompt = `
Generate API documentation for these API routes:

${apiContext}

For each endpoint, provide:
1. HTTP method and path
2. Clear description of functionality
3. Request parameters (query, body, headers)
4. Response formats and status codes
5. Example requests and responses
6. Error handling scenarios

Format as OpenAPI/Swagger compatible documentation.
`;

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    prompt,
    schema: z.object({
      endpoints: z.array(z.object({
        method: z.string(),
        path: z.string(),
        description: z.string(),
        parameters: z.array(z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean(),
          description: z.string()
        })),
        responses: z.array(z.object({
          status: z.number(),
          description: z.string(),
          example: z.string()
        })),
        example: z.string()
      }))
    })
  });

  return result.object;
}

export async function generateComponentDocumentation(
  componentCode: string,
  componentName: string
): Promise<{
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
  }>;
  examples: Array<{
    title: string;
    code: string;
    description: string;
  }>;
  storybook: string;
}> {
  const prompt = `
Generate comprehensive documentation for this React component:

Component Name: ${componentName}

Code:
\`\`\`
${componentCode}
\`\`\`

Provide:
1. **Component description** and use cases
2. **Props documentation** with types and descriptions
3. **Usage examples** with different scenarios
4. **Storybook stories** for interactive documentation

Make it clear and helpful for other developers.
`;

  const result = await generateObject({
    model: google('gemini-1.5-pro'),
    prompt,
    schema: z.object({
      description: z.string(),
      props: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean(),
        default: z.string().optional(),
        description: z.string()
      })),
      examples: z.array(z.object({
        title: z.string(),
        code: z.string(),
        description: z.string()
      })),
      storybook: z.string()
    })
  });

  return result.object;
}

export async function generateJSDocComments(code: string): Promise<string> {
  const prompt = `
Add comprehensive JSDoc comments to this code:

\`\`\`
${code}
\`\`\`

Add JSDoc comments for:
1. **Functions**: Parameters, return values, examples
2. **Classes**: Description, constructor parameters
3. **Interfaces/Types**: Property descriptions
4. **Complex logic**: Inline comments explaining algorithms

Follow JSDoc standards and make comments helpful for IntelliSense.
Return the complete code with JSDoc comments added.
`;

  const result = await generateText({
    model: google('gemini-1.5-pro'),
    prompt,
  });

  return result.text;
}