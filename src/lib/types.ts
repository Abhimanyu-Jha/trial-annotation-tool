export interface Trial {
  trialId: string;
  videoUrl: string;
  transcriptUrl: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  grade: string;
  trialDate: string;
  region: 'NAM' | 'ISC' | 'ROW';
  channel: 'perf-meta' | 'organic-content' | 'BTL' | 'tutor-referral' | 'parent-referral';
  duration: number; // seconds
  trialVersion: 'legacy' | 'v3.1' | 'v3.2';
}

export interface TranscriptSegment {
  startTime: number;
  endTime: number;
  speaker: 'Student' | 'Tutor' | 'Parent';
  text: string;
}

export interface Transcript {
  transcriptId: string;
  trialId: string;
  segments: TranscriptSegment[];
}

export interface AnnotationTranscriptSnippet {
  text: string;
  speakers: string[];
  segments: TranscriptSegment[];
}

export interface Annotation {
  annotationId: string;
  trialId: string;
  reviewerId: string;
  trialPart: 'Trial Part 1' | 'Trial Part 2' | 'Trial Part 3';
  timestamp: {
    start: number;
    end?: number;
  };
  content: string;
  transcriptSnippet?: AnnotationTranscriptSnippet;
  createdAt: string;
  updatedAt: string;
}

export interface Reviewer {
  reviewerId: string;
  name: string;
  email: string;
  role: string;
}

export interface TrialWithStatus extends Trial {
  annotationStatus: 'Annotated' | 'Not Annotated';
  annotatorNames: string[];
  lastModified: string;
  enrollmentStatus: 'yes' | 'no (>2w since trial)' | 'not yet (<2w since trial)';
}