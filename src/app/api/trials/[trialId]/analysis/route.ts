import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { NextRequest } from 'next/server';

type Params = Promise<{ trialId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { trialId } = await params;
    const analysisPath = path.join(process.cwd(), 'data', 'trials', trialId, 'ai-analysis.json');

    // Check if analysis file exists
    if (!fs.existsSync(analysisPath)) {
      return NextResponse.json(
        { error: 'AI analysis not found for this trial' },
        { status: 404 }
      );
    }

    // Read and parse analysis file
    const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error('Error fetching AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI analysis' },
      { status: 500 }
    );
  }
}
