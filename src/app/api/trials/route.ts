import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const trialsDir = path.join(process.cwd(), 'data', 'trials');

    // Check if trials directory exists
    if (!fs.existsSync(trialsDir)) {
      return NextResponse.json({ trials: [] });
    }

    // Read all trial folders
    const trialFolders = fs.readdirSync(trialsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Filter trials that have ai-analysis.json
    const trialsWithAnalysis = trialFolders.filter(trialId => {
      const analysisPath = path.join(trialsDir, trialId, 'ai-analysis.json');
      return fs.existsSync(analysisPath);
    });

    // Build trial objects
    const trials = trialsWithAnalysis.map(trialId => {
      const analysisPath = path.join(trialsDir, trialId, 'ai-analysis.json');

      // Read analysis to get basic info
      const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));

      return {
        trialId,
        videoUrl: `/api/trials/${trialId}/video`,
        transcriptUrl: `/api/trials/${trialId}/transcript`,
        hasAnalysis: true,
        analysisId: analysisData.analysisId,
        analysisTimestamp: analysisData.timestamp,
        issueCount: analysisData.issues?.length || 0,
      };
    });

    return NextResponse.json({ trials });
  } catch (error) {
    console.error('Error fetching trials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trials' },
      { status: 500 }
    );
  }
}
