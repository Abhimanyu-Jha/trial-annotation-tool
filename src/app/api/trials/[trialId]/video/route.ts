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
    const videoPath = path.join(process.cwd(), 'data', 'trials', trialId, 'video.mp4');

    // Check if video file exists
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json(
        { error: 'Video not found for this trial' },
        { status: 404 }
      );
    }

    // Get file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    // Handle range requests for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
      };

      // Create a ReadableStream from the Node.js stream
      const stream = new ReadableStream({
        start(controller) {
          file.on('data', (chunk) => {
            try {
              controller.enqueue(chunk);
            } catch (error) {
              // Controller might be closed due to cancellation
              file.destroy();
            }
          });
          file.on('end', () => {
            try {
              controller.close();
            } catch {
              // Already closed
            }
          });
          file.on('error', (error) => {
            try {
              controller.error(error);
            } catch {
              // Controller already closed
            }
          });
        },
        cancel() {
          file.destroy();
        },
      });

      return new NextResponse(stream, {
        status: 206,
        headers,
      });
    } else {
      // No range request, send entire file
      const file = fs.readFileSync(videoPath);
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': fileSize.toString(),
        },
      });
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json(
      { error: 'Failed to stream video' },
      { status: 500 }
    );
  }
}
