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
  emotion: 'positive' | 'negative';
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

// Issue taxonomy enums
export type IssueDomain =
  | 'Parent Engagement'
  | 'Student Engagement'
  | 'Pedagogical Effectiveness'
  | 'Process & Platform Adherence'
  | 'Professionalism & Environment'
  | 'Linguistic & Communicative Competence'
  | 'Session Flags';

export type IssueType =
  // Parent Engagement
  | 'Narrow Reframing'
  | 'Scheduling & Pacing Rigidity'
  | 'Failing to Address Parent Concerns'
  // Student Engagement
  | 'Using Vague Openers'
  | 'Awkward Rapport Attempt'
  | 'Failing to Sustain Conversation'
  | 'Over-reliance on Closed-Ended Questions'
  | 'Not Addressing Child First'
  | 'Misusing Child\'s Name/Pronoun'
  | 'Parent-Dominated Talk (Failure to Redirect)'
  // Pedagogical Effectiveness
  | 'Pre-emptive Questioning'
  | 'Using Leading Questions'
  | 'Insufficient Scaffolding'
  | 'Interrupting Student\'s Thought Process'
  | 'Failing to Check for Understanding (CFU)'
  | 'Incorrect Problem Assessment'
  | 'Failing to Identify Foundational Gaps'
  | 'Skipping Concepts Without Assessment'
  // Process & Platform Adherence
  | 'Rushing or Skipping Key Sections'
  | 'Discussing Topics on Wrong Slide'
  | 'Failing to Involve Parent as Required'
  | 'Mishandling Parent Selections'
  // Professionalism & Environment
  | 'Low Energy / Unenthusiastic'
  | 'Scripted or Robotic Delivery'
  | 'Poor Lighting or Background'
  | 'Poor Audio Quality'
  | 'Unprofessional Affiliation Talk'
  // Linguistic & Communicative Competence
  | 'Grammatical Errors'
  | 'Non-Idiomatic Phrasing'
  | 'Use of Non-Standard Pedagogical Terminology'
  | 'Disfluent Speech / Overuse of Fillers'
  // Session Flags
  | 'Pre-Trial Misalignment';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IssueAnnotation {
  issueId: string;
  trialId: string;
  reviewerId: string;
  domain: IssueDomain;
  issueType: IssueType;
  severity: IssueSeverity;
  timestamp: {
    start: number;
    end?: number;
  };
  description: string;
  evidence?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrialWithStatus extends Trial {
  annotationStatus: 'Annotated' | 'Not Annotated';
  annotatorNames: string[];
  lastModified: string;
  enrollmentStatus: 'yes' | 'no (>2w since trial)' | 'not yet (<2w since trial)';
}

export interface TrialWithIssues extends TrialWithStatus {
  issues: IssueAnnotation[];
  issueCount: number;
  criticalIssueCount: number;
  topIssues: IssueType[];
}

// AI Analysis types (from ai-analysis.json)
export interface AIAnalysisIssue {
  timestamp: string; // Format: [HH:MM:SS,ms] e.g., [00:00:57,960]
  speaker: string; // e.g., "Tutor", "Student", "Parent"
  theme: string; // Issue category from guidebook
  severity: string; // "Low", "Medium", "High", "Critical"
  quote: string; // Verbatim transcript quote
  context: string; // Situational context
  justification: string; // Why it's an issue
  alternative: string; // Suggested improvement
  analysisPass?: number; // Which analysis pass found this issue (1, 2, or 3)
}

export interface AIAnalysis {
  analysisId: string;
  trialId: string;
  timestamp: string; // ISO timestamp
  modelVersion: string; // e.g., "gemini-2.5-pro"
  status: "completed" | "failed";
  rawResponse?: string;
  issues: AIAnalysisIssue[];
}