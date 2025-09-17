import { Trial, Transcript, Annotation, Reviewer, TrialWithStatus } from './types';

export const dummyReviewers: Reviewer[] = [
  {
    reviewerId: 'rev-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Senior Reviewer'
  },
  {
    reviewerId: 'rev-002',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'Reviewer'
  },
  {
    reviewerId: 'rev-003',
    name: 'Emma Williams',
    email: 'emma.williams@example.com',
    role: 'Lead Reviewer'
  }
];

export const dummyTrials: Trial[] = [
  {
    trialId: 'trial-001',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcriptUrl: '/transcripts/trial-001.json',
    grade: 'Grade 5',
    trialDate: '2024-01-15T10:30:00Z',
    tutorId: 'tutor-101',
    region: 'NAM',
    channel: 'perf-meta',
    duration: 1800 // 30 minutes
  },
  {
    trialId: 'trial-002',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcriptUrl: '/transcripts/trial-002.json',
    grade: 'Grade 7',
    trialDate: '2024-01-16T14:20:00Z',
    tutorId: 'tutor-102',
    region: 'ISC',
    channel: 'organic-content',
    duration: 2100 // 35 minutes
  },
  {
    trialId: 'trial-003',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcriptUrl: '/transcripts/trial-003.json',
    grade: 'Grade 3',
    trialDate: '2024-01-17T09:15:00Z',
    tutorId: 'tutor-103',
    region: 'ROW',
    channel: 'BTL',
    duration: 1500 // 25 minutes
  },
  {
    trialId: 'trial-004',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcriptUrl: '/transcripts/trial-004.json',
    grade: 'Grade 6',
    trialDate: '2024-01-18T16:45:00Z',
    tutorId: 'tutor-104',
    region: 'NAM',
    channel: 'tutor-referral',
    duration: 1950 // 32.5 minutes
  },
  {
    trialId: 'trial-005',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    transcriptUrl: '/transcripts/trial-005.json',
    grade: 'Grade 4',
    trialDate: '2024-01-19T11:00:00Z',
    tutorId: 'tutor-105',
    region: 'ISC',
    channel: 'parent-referral',
    duration: 1650 // 27.5 minutes
  }
];

export const dummyTranscripts: Transcript[] = [
  {
    transcriptId: 'trans-001',
    trialId: 'trial-001',
    segments: [
      {
        startTime: 0,
        endTime: 5,
        speaker: 'Tutor',
        text: 'Hi there! Welcome to your trial class. My name is Alex and I\'ll be your tutor today.'
      },
      {
        startTime: 5,
        endTime: 8,
        speaker: 'Student',
        text: 'Hi Alex! I\'m excited to be here.'
      },
      {
        startTime: 8,
        endTime: 15,
        speaker: 'Tutor',
        text: 'That\'s wonderful! Today we\'re going to work on some exciting math problems. Let\'s start with fractions.'
      },
      {
        startTime: 15,
        endTime: 18,
        speaker: 'Student',
        text: 'Okay, I need help with fractions.'
      },
      {
        startTime: 18,
        endTime: 25,
        speaker: 'Tutor',
        text: 'Perfect! Let\'s begin with adding fractions with the same denominator. Can you tell me what 1/4 + 2/4 equals?'
      },
      {
        startTime: 25,
        endTime: 30,
        speaker: 'Student',
        text: 'Um... is it 3/4?'
      },
      {
        startTime: 30,
        endTime: 35,
        speaker: 'Tutor',
        text: 'Excellent! That\'s absolutely correct. You just add the numerators and keep the denominator the same.'
      }
    ]
  },
  {
    transcriptId: 'trans-002',
    trialId: 'trial-002',
    segments: [
      {
        startTime: 0,
        endTime: 6,
        speaker: 'Tutor',
        text: 'Good afternoon! I\'m Maria, and I\'ll be guiding you through algebra today.'
      },
      {
        startTime: 6,
        endTime: 10,
        speaker: 'Student',
        text: 'Hi Maria! I\'m a bit nervous about algebra.'
      },
      {
        startTime: 10,
        endTime: 15,
        speaker: 'Parent',
        text: 'Don\'t worry sweetie, Maria will help you understand it step by step.'
      },
      {
        startTime: 15,
        endTime: 22,
        speaker: 'Tutor',
        text: 'That\'s right! Algebra is just like solving puzzles. Let\'s start with simple equations like x + 3 = 7.'
      },
      {
        startTime: 22,
        endTime: 27,
        speaker: 'Student',
        text: 'So I need to find what x is?'
      },
      {
        startTime: 27,
        endTime: 33,
        speaker: 'Tutor',
        text: 'Exactly! We want to isolate x. What would you subtract from both sides?'
      },
      {
        startTime: 33,
        endTime: 36,
        speaker: 'Student',
        text: 'I think... subtract 3?'
      },
      {
        startTime: 36,
        endTime: 40,
        speaker: 'Tutor',
        text: 'Perfect! So x = 4. You\'re getting the hang of this!'
      }
    ]
  }
];

export const dummyAnnotations: Annotation[] = [
  {
    annotationId: 'ann-001',
    trialId: 'trial-001',
    reviewerId: 'rev-001',
    trialPart: 'Trial Part 1',
    timestamp: { start: 0, end: 15 },
    content: 'Great introduction by the tutor. Warm and welcoming tone that puts the student at ease.',
    transcriptSnippet: {
      text: 'Hi there! Welcome to your trial class. My name is Alex and I\'ll be your tutor today. Hi Alex! I\'m excited to be here. That\'s wonderful! Today we\'re going to work on some exciting math problems.',
      speakers: ['Tutor', 'Student'],
      segments: [
        {
          startTime: 0,
          endTime: 5,
          speaker: 'Tutor',
          text: 'Hi there! Welcome to your trial class. My name is Alex and I\'ll be your tutor today.'
        },
        {
          startTime: 5,
          endTime: 8,
          speaker: 'Student',
          text: 'Hi Alex! I\'m excited to be here.'
        },
        {
          startTime: 8,
          endTime: 15,
          speaker: 'Tutor',
          text: 'That\'s wonderful! Today we\'re going to work on some exciting math problems. Let\'s start with fractions.'
        }
      ]
    },
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    annotationId: 'ann-002',
    trialId: 'trial-001',
    reviewerId: 'rev-001',
    trialPart: 'Trial Part 2',
    timestamp: { start: 25, end: 35 },
    content: 'Excellent positive reinforcement. The tutor validates the student\'s correct answer and explains the reasoning.',
    transcriptSnippet: {
      text: 'Um... is it 3/4? Excellent! That\'s absolutely correct. You just add the numerators and keep the denominator the same.',
      speakers: ['Student', 'Tutor'],
      segments: [
        {
          startTime: 25,
          endTime: 30,
          speaker: 'Student',
          text: 'Um... is it 3/4?'
        },
        {
          startTime: 30,
          endTime: 35,
          speaker: 'Tutor',
          text: 'Excellent! That\'s absolutely correct. You just add the numerators and keep the denominator the same.'
        }
      ]
    },
    createdAt: '2024-01-20T10:35:00Z',
    updatedAt: '2024-01-20T10:35:00Z'
  },
  {
    annotationId: 'ann-003',
    trialId: 'trial-002',
    reviewerId: 'rev-002',
    trialPart: 'Trial Part 1',
    timestamp: { start: 6, end: 22 },
    content: 'Good parent involvement and tutor\'s reassuring approach to address student anxiety about algebra.',
    transcriptSnippet: {
      text: 'Hi Maria! I\'m a bit nervous about algebra. Don\'t worry sweetie, Maria will help you understand it step by step. That\'s right! Algebra is just like solving puzzles.',
      speakers: ['Student', 'Parent', 'Tutor'],
      segments: [
        {
          startTime: 6,
          endTime: 10,
          speaker: 'Student',
          text: 'Hi Maria! I\'m a bit nervous about algebra.'
        },
        {
          startTime: 10,
          endTime: 15,
          speaker: 'Parent',
          text: 'Don\'t worry sweetie, Maria will help you understand it step by step.'
        },
        {
          startTime: 15,
          endTime: 22,
          speaker: 'Tutor',
          text: 'That\'s right! Algebra is just like solving puzzles. Let\'s start with simple equations like x + 3 = 7.'
        }
      ]
    },
    createdAt: '2024-01-21T14:25:00Z',
    updatedAt: '2024-01-21T14:25:00Z'
  }
];

export const getTrialsWithStatus = (): TrialWithStatus[] => {
  return dummyTrials.map(trial => {
    const trialAnnotations = dummyAnnotations.filter(ann => ann.trialId === trial.trialId);
    const annotatorIds = [...new Set(trialAnnotations.map(ann => ann.reviewerId))];
    const annotatorNames = annotatorIds.map(id =>
      dummyReviewers.find(rev => rev.reviewerId === id)?.name || 'Unknown'
    );

    const lastModified = trialAnnotations.length > 0
      ? Math.max(...trialAnnotations.map(ann => new Date(ann.updatedAt).getTime()))
      : new Date(trial.trialDate).getTime();

    return {
      ...trial,
      annotationStatus: trialAnnotations.length > 0 ? 'Annotated' : 'Not Annotated',
      annotatorNames,
      lastModified: new Date(lastModified).toISOString()
    };
  });
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};