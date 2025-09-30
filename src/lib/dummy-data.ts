import { Trial, Transcript, Annotation, Reviewer, TrialWithStatus, IssueAnnotation, IssueDomain, IssueType, IssueSeverity, TrialWithIssues } from './types';

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
    // Generate dates from the last 3 months (Sept 2024 - Jan 2025)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const randomTime = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
    const randomDate = new Date(randomTime);

    // Set random hour between 8-19 (business hours)
    randomDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

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
    emotion: 'positive',
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
    emotion: 'positive',
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
    emotion: 'negative',
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

// Issue data generation
const issueTypesByDomain: Record<IssueDomain, IssueType[]> = {
  'Parent Engagement': [
    'Narrow Reframing',
    'Scheduling & Pacing Rigidity',
    'Failing to Address Parent Concerns'
  ],
  'Student Engagement': [
    'Using Vague Openers',
    'Awkward Rapport Attempt',
    'Failing to Sustain Conversation',
    'Over-reliance on Closed-Ended Questions',
    'Not Addressing Child First',
    'Misusing Child\'s Name/Pronoun',
    'Parent-Dominated Talk (Failure to Redirect)'
  ],
  'Pedagogical Effectiveness': [
    'Pre-emptive Questioning',
    'Using Leading Questions',
    'Insufficient Scaffolding',
    'Interrupting Student\'s Thought Process',
    'Failing to Check for Understanding (CFU)',
    'Incorrect Problem Assessment',
    'Failing to Identify Foundational Gaps',
    'Skipping Concepts Without Assessment'
  ],
  'Process & Platform Adherence': [
    'Rushing or Skipping Key Sections',
    'Discussing Topics on Wrong Slide',
    'Failing to Involve Parent as Required',
    'Mishandling Parent Selections'
  ],
  'Professionalism & Environment': [
    'Low Energy / Unenthusiastic',
    'Scripted or Robotic Delivery',
    'Poor Lighting or Background',
    'Poor Audio Quality',
    'Unprofessional Affiliation Talk'
  ],
  'Linguistic & Communicative Competence': [
    'Grammatical Errors',
    'Non-Idiomatic Phrasing',
    'Use of Non-Standard Pedagogical Terminology',
    'Disfluent Speech / Overuse of Fillers'
  ],
  'Session Flags': [
    'Pre-Trial Misalignment'
  ]
};

const issueDescriptions: Record<IssueType, string[]> = {
  // Parent Engagement
  'Narrow Reframing': [
    'Tutor reduces broad parental goal to narrow tactical objective',
    'Parent wants child to love math but tutor focuses only on curriculum coverage',
    'Missing opportunity to sell higher-level value of confidence building'
  ],
  'Scheduling & Pacing Rigidity': [
    'Tutor insists on 2 classes per week without considering parent preferences',
    'Inflexible regarding class schedules despite parent constraints',
    'Pushes specific frequency without exploring parent needs'
  ],
  'Failing to Address Parent Concerns': [
    'Parent asks direct question but tutor ignores or deflects',
    'Superficial acknowledgment without addressing core issue',
    'Quick pivot away from parent\'s specific query'
  ],

  // Student Engagement
  'Using Vague Openers': [
    'Opens with "Tell me something about yourself" - too broad',
    'Low-effort conversation starter that burdens the child',
    'Fails to provide specific, engaging opening question'
  ],
  'Awkward Rapport Attempt': [
    'Asks odd or judgmental personal questions',
    'Makes child uncomfortable with invasive queries',
    'Failed attempt at connection that pushes child away'
  ],
  'Failing to Sustain Conversation': [
    'Child shares information but tutor responds with irrelevant remark',
    'Single-word acknowledgments followed by silence',
    'Cannot build upon child\'s input effectively'
  ],
  'Over-reliance on Closed-Ended Questions': [
    'Primarily asks yes/no questions that shut down conversation',
    'Prevents deeper interaction and rapport building',
    'Creates stilted, checklist-style interaction'
  ],
  'Not Addressing Child First': [
    'Begins trial by focusing on parent without greeting child',
    'Makes child feel like object rather than center of experience',
    'Ignores student in first 30 seconds of trial'
  ],
  'Misusing Child\'s Name/Pronoun': [
    'Repeatedly uses wrong name despite correction',
    'Consistent use of incorrect gender pronouns',
    'Shows disrespect and carelessness toward student'
  ],
  'Parent-Dominated Talk (Failure to Redirect)': [
    'Parent consistently answers for child without tutor intervention',
    'Cannot assess child abilities due to parent interference',
    'Fails to create space for student participation'
  ],

  // Pedagogical Effectiveness
  'Pre-emptive Questioning': [
    'Asks if student knows topic before letting them attempt',
    'Creates performance anxiety by asking about ability upfront',
    'Undermines diagnostic assessment purpose'
  ],
  'Using Leading Questions': [
    'Questions contain the answer or heavily suggest correct path',
    'Prevents independent thinking and problem solving',
    'Creates illusion of understanding without real learning'
  ],
  'Insufficient Scaffolding': [
    'Provides direct answer instead of guided hints',
    'Gives away critical steps without explanation',
    'No gradual support - jumps to telling rather than teaching'
  ],
  'Interrupting Student\'s Thought Process': [
    'Cuts off student while they\'re thinking or working',
    'Premature correction before student completes attempt',
    'Disrupts natural learning flow and damages confidence'
  ],
  'Failing to Check for Understanding (CFU)': [
    'Moves on without confirming genuine understanding',
    'Relies on fake CFUs like "Right?" with forced agreement',
    'Assumes understanding based on student compliance'
  ],
  'Incorrect Problem Assessment': [
    'Marks "Solved on their Own" after providing significant help',
    'Inaccurate evaluation of student performance level',
    'Corrupts assessment data and misleads parents'
  ],
  'Failing to Identify Foundational Gaps': [
    'Student makes fundamental error but tutor doesn\'t notice',
    'Misses critical learning gaps in basic concepts',
    'Fails to address root cause of student difficulties'
  ],
  'Skipping Concepts Without Assessment': [
    'Decides to skip question without letting student attempt',
    'Pre-emptively labels child as incapable',
    'Misses learning and assessment opportunities'
  ],

  // Process & Platform Adherence
  'Rushing or Skipping Key Sections': [
    'Moves through slides too quickly without proper explanation',
    'Completely omits required sections of trial flow',
    'Incomplete and unprofessional experience'
  ],
  'Discussing Topics on Wrong Slide': [
    'Narration out of sync with on-screen content',
    'Talks about future topics prematurely',
    'Shows lack of preparation and platform control'
  ],
  'Failing to Involve Parent as Required': [
    'Conducts parent-required sections without parent present',
    'Violates trial structure and engagement rules',
    'Undermines trial\'s sales and diagnostic purpose'
  ],
  'Mishandling Parent Selections': [
    'Bypasses parent input on goals and curriculum choices',
    'Makes unilateral selections without consultation',
    'Removes parent agency and invalidates personalization'
  ],

  // Professionalism & Environment
  'Low Energy / Unenthusiastic': [
    'Displays clear lack of energy and engagement',
    'Visible yawning or lethargy during session',
    'Creates boring and uninspiring experience'
  ],
  'Scripted or Robotic Delivery': [
    'Speech sounds overly rehearsed without personalization',
    'Robotic tone prevents genuine human connection',
    'Makes personalized trial feel completely fake'
  ],
  'Poor Lighting or Background': [
    'Video feed is dark or poorly lit',
    'Distracting or unprofessional background',
    'Creates poor first impression'
  ],
  'Poor Audio Quality': [
    'Muffled microphone or significant background noise',
    'Audio cuts out or is difficult to understand',
    'Prevents effective communication'
  ],
  'Unprofessional Affiliation Talk': [
    'Mentions working for competitor brands',
    'Offers tutoring services outside Cuemath platform',
    'Severe breach of professionalism and company policy'
  ],

  // Linguistic & Communicative Competence
  'Grammatical Errors': [
    'Persistent mistakes in sentence structure and tense',
    'Repeated grammatical errors damage credibility',
    'Impacts perceived intelligence and professionalism'
  ],
  'Non-Idiomatic Phrasing': [
    'Uses grammatically correct but unnatural English',
    'Sounds robotic or strange to native speakers',
    'Creates communication barrier with families'
  ],
  'Use of Non-Standard Pedagogical Terminology': [
    'Uses regional terms not common in student curriculum',
    'Confuses student and parent with unfamiliar language',
    'Shows disconnect from local educational system'
  ],
  'Disfluent Speech / Overuse of Fillers': [
    'Excessive use of "uh," "um," and other fillers',
    'Long unnatural pauses that impact clarity',
    'Makes tutor sound nervous and unprepared'
  ],

  // Session Flags
  'Pre-Trial Misalignment': [
    'Trial conducted with wrong grade level or topic',
    'Fundamental setup error in core information',
    'Operational failure that dooms session from start'
  ]
};

const generateDummyIssues = (): IssueAnnotation[] => {
  const issues: IssueAnnotation[] = [];
  const reviewerIds = dummyReviewers.map(r => r.reviewerId);
  const severities: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];

  // Generate issues for each trial (not all trials will have all issues)
  dummyTrials.forEach((trial) => {
    const numIssues = Math.floor(Math.random() * 8) + 1; // 1-8 issues per trial
    const usedIssueTypes = new Set<IssueType>();

    for (let i = 0; i < numIssues; i++) {
      const domains = Object.keys(issueTypesByDomain) as IssueDomain[];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const domainIssues = issueTypesByDomain[randomDomain];
      const randomIssueType = domainIssues[Math.floor(Math.random() * domainIssues.length)];

      // Avoid duplicate issue types in same trial
      if (usedIssueTypes.has(randomIssueType)) continue;
      usedIssueTypes.add(randomIssueType);

      const descriptions = issueDescriptions[randomIssueType];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

      // Weight severity based on domain importance
      let severityWeights: number[];
      if (randomDomain === 'Pedagogical Effectiveness' || randomDomain === 'Student Engagement') {
        severityWeights = [0.1, 0.3, 0.4, 0.2]; // Higher chance of high/critical
      } else if (randomDomain === 'Session Flags') {
        severityWeights = [0.05, 0.15, 0.3, 0.5]; // Very high chance of critical
      } else {
        severityWeights = [0.2, 0.4, 0.3, 0.1]; // More moderate distribution
      }

      const randomValue = Math.random();
      let selectedSeverity: IssueSeverity = 'low';
      let cumulative = 0;
      for (let j = 0; j < severityWeights.length; j++) {
        cumulative += severityWeights[j];
        if (randomValue <= cumulative) {
          selectedSeverity = severities[j];
          break;
        }
      }

      const startTime = Math.floor(Math.random() * (trial.duration - 60));
      const endTime = startTime + Math.floor(Math.random() * 120) + 30; // 30-150 second issues

      const issueDate = new Date(trial.trialDate);
      issueDate.setHours(issueDate.getHours() + 1); // Issues recorded after trial

      issues.push({
        issueId: `issue-${trial.trialId}-${i + 1}`,
        trialId: trial.trialId,
        reviewerId: reviewerIds[Math.floor(Math.random() * reviewerIds.length)],
        domain: randomDomain,
        issueType: randomIssueType,
        severity: selectedSeverity,
        timestamp: {
          start: startTime,
          end: endTime
        },
        description: randomDescription,
        evidence: `Found at ${Math.floor(startTime / 60)}:${(startTime % 60).toString().padStart(2, '0')}`,
        createdAt: issueDate.toISOString(),
        updatedAt: issueDate.toISOString()
      });
    }
  });

  return issues;
};

export const dummyIssues: IssueAnnotation[] = generateDummyIssues();

export const getTrialsWithIssues = (): TrialWithIssues[] => {
  const trialsWithStatus = getTrialsWithStatus();

  return trialsWithStatus.map(trial => {
    const trialIssues = dummyIssues.filter(issue => issue.trialId === trial.trialId);
    const criticalIssues = trialIssues.filter(issue => issue.severity === 'critical');

    // Get top 3 most frequent issue types for this trial
    const issueTypeCounts: Record<string, number> = {};
    trialIssues.forEach(issue => {
      issueTypeCounts[issue.issueType] = (issueTypeCounts[issue.issueType] || 0) + 1;
    });

    const topIssues = Object.entries(issueTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([issueType]) => issueType as IssueType);

    return {
      ...trial,
      issues: trialIssues,
      issueCount: trialIssues.length,
      criticalIssueCount: criticalIssues.length,
      topIssues
    };
  });
};

// Utility function to parse AI analysis timestamp format [HH:MM:SS,ms] to seconds
export const parseAITimestamp = (timestamp: string): number => {
  // Format: [00:00:57,960]
  const match = timestamp.match(/\[(\d{2}):(\d{2}):(\d{2}),(\d{3})\]/);
  if (!match) return 0;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4], 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};