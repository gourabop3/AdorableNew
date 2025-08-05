import { NextRequest, NextResponse } from 'next/server';
import { reviewCode, generateSecurityScan } from '@/lib/ai-code-review';
import { generateProjectDocumentation, generateComponentDocumentation } from '@/lib/ai-documentation';
import { analyzePerformance, optimizeComponent } from '@/lib/ai-performance';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'code-review':
        const { code, filename, projectContext } = data;
        const review = await reviewCode(code, filename, projectContext);
        return NextResponse.json({ success: true, data: review });

      case 'security-scan':
        const { projectFiles } = data;
        const securityScan = await generateSecurityScan(projectFiles);
        return NextResponse.json({ success: true, data: securityScan });

      case 'analyze-performance':
        const { projectFiles: analysisFiles } = data;
        const performance = await analyzePerformance(analysisFiles);
        return NextResponse.json({ success: true, data: performance });

      case 'optimize-component':
        const { componentCode, componentName } = data;
        const optimization = await optimizeComponent(componentCode, componentName);
        return NextResponse.json({ success: true, data: optimization });

      case 'generate-documentation':
        const { projectFiles: docFiles, projectName, projectDescription } = data;
        const documentation = await generateProjectDocumentation(docFiles, projectName, projectDescription);
        return NextResponse.json({ success: true, data: documentation });

      case 'component-documentation':
        const { componentCode: compCode, componentName: compName } = data;
        const componentDocs = await generateComponentDocumentation(compCode, compName);
        return NextResponse.json({ success: true, data: componentDocs });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Features API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for feature availability check
export async function GET() {
  return NextResponse.json({
    success: true,
    features: [
      'code-review',
      'security-scan', 
      'analyze-performance',
      'optimize-component',
      'generate-documentation',
      'component-documentation'
    ]
  });
}