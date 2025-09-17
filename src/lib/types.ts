export interface Trial {
  trialId: string;
  videoUrl: string;
  transcriptUrl: string;
  grade: string;
  trialDate: string;
  tutorId: string;
  region: 'NAM' | 'ISC' | 'ROW';
  channel: 'perf-meta' | 'organic-content' | 'BTL' | 'tutor-referral' | 'parent-referral';
  duration: number; // seconds
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
}