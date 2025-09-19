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

const generateDummyTrials = (): Trial[] => {
  const studentNames = [
    'Emma Johnson', 'Liam Chen', 'Sophia Patel', 'Noah Williams', 'Ava Brown',
    'Oliver Singh', 'Isabella Rodriguez', 'Mason Kumar', 'Charlotte Thompson', 'Lucas Garcia',
    'Amelia Davis', 'Ethan Wilson', 'Harper Miller', 'Alexander Anderson', 'Evelyn Taylor',
    'Benjamin Thomas', 'Abigail Jackson', 'Jacob White', 'Emily Harris', 'Michael Martin',
    'Elizabeth Thompson', 'Daniel Garcia', 'Sofia Martinez', 'Matthew Robinson', 'Avery Clark',
    'Andrew Rodriguez', 'Ella Lewis', 'Joshua Lee', 'Scarlett Walker', 'Anthony Hall',
    'Victoria Allen', 'Christopher Young', 'Grace Hernandez', 'Samuel King', 'Chloe Wright',
    'Ryan Lopez', 'Zoe Hill', 'Nathan Scott', 'Lily Green', 'Caleb Adams',
    'Hannah Baker', 'Hunter Gonzalez', 'Lillian Nelson', 'Connor Carter', 'Addison Mitchell',
    'Eli Perez', 'Layla Roberts', 'Aaron Turner', 'Natalie Phillips', 'Ian Campbell'
  ];

  const tutorNames = [
    'Alex Rodriguez', 'Maria Santos', 'David Kim', 'Sarah Thompson', 'Michael Garcia',
    'Rachel Chen', 'James Wilson', 'Lisa Patel', 'Kevin Singh', 'Amanda Davis',
    'Ryan Miller', 'Jessica Anderson', 'Tyler Taylor', 'Ashley White', 'Brandon Harris',
    'Stephanie Martin', 'Jordan Clark', 'Nicole Lewis', 'Austin Lee', 'Megan Walker',
    'Sean Hall', 'Lauren Allen', 'Cameron Young', 'Brittany King', 'Derek Wright',
    'Samantha Lopez', 'Blake Hill', 'Danielle Scott', 'Trevor Green', 'Kaitlyn Adams',
    'Marcus Baker', 'Alyssa Gonzalez', 'Cole Nelson', 'Jasmine Carter', 'Garrett Mitchell',
    'Morgan Perez', 'Shane Roberts', 'Taylor Turner', 'Brooke Phillips', 'Dustin Campbell'
  ];

  const grades = ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
  const regions: ('NAM' | 'ISC' | 'ROW')[] = ['NAM', 'ISC', 'ROW'];
  const channels: ('perf-meta' | 'organic-content' | 'BTL' | 'tutor-referral' | 'parent-referral')[] =
    ['perf-meta', 'organic-content', 'BTL', 'tutor-referral', 'parent-referral'];
  const versions: ('legacy' | 'v3.1' | 'v3.2')[] = ['legacy', 'v3.1', 'v3.2'];

  const trials: Trial[] = [];

  for (let i = 1; i <= 100; i++) {
    const randomDate = new Date(2024,
      Math.floor(Math.random() * 3), // Jan, Feb, Mar
      Math.floor(Math.random() * 28) + 1, // 1-28
      Math.floor(Math.random() * 12) + 8, // 8-19 hours
      Math.floor(Math.random() * 60) // 0-59 minutes
    );

    const duration = Math.floor(Math.random() * 3600) + 900; // 15-75 minutes

    trials.push({
      trialId: `trial-${i.toString().padStart(3, '0')}`,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      transcriptUrl: `/transcripts/trial-${i.toString().padStart(3, '0')}.json`,
      studentId: `student-${i.toString().padStart(3, '0')}`,
      studentName: studentNames[Math.floor(Math.random() * studentNames.length)],
      tutorId: `tutor-${(100 + i).toString()}`,
      tutorName: tutorNames[Math.floor(Math.random() * tutorNames.length)],
      grade: grades[Math.floor(Math.random() * grades.length)],
      trialDate: randomDate.toISOString(),
      region: regions[Math.floor(Math.random() * regions.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      duration,
      trialVersion: versions[Math.floor(Math.random() * versions.length)]
    });
  }

  return trials;
};

export const dummyTrials: Trial[] = generateDummyTrials();

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

    // Calculate enrollment status based on trial date
    const trialDate = new Date(trial.trialDate);
    const now = new Date();
    const daysSinceTrial = Math.floor((now.getTime() - trialDate.getTime()) / (1000 * 60 * 60 * 24));

    let enrollmentStatus: 'yes' | 'no (>2w since trial)' | 'not yet (<2w since trial)';

    if (daysSinceTrial > 14) {
      // For trials older than 2 weeks, mix of all three statuses
      const random = Math.random();
      if (random < 0.5) {
        enrollmentStatus = 'yes';
      } else if (random < 0.75) {
        enrollmentStatus = 'no (>2w since trial)';
      } else {
        enrollmentStatus = 'not yet (<2w since trial)';
      }
    } else {
      // For recent trials (less than 2 weeks), mostly "not yet" with some "yes"
      enrollmentStatus = Math.random() > 0.7 ? 'yes' : 'not yet (<2w since trial)';
    }

    return {
      ...trial,
      annotationStatus: trialAnnotations.length > 0 ? 'Annotated' : 'Not Annotated',
      annotatorNames,
      lastModified: new Date(lastModified).toISOString(),
      enrollmentStatus
    };
  });
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short'
  });
};