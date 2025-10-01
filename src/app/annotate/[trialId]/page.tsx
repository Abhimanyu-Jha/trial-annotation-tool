'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  dummyTrials,
  dummyTranscripts,
  dummyAnnotations,
  formatDuration,
  formatDate,
  dummyReviewers,
  parseAITimestamp
} from '@/lib/dummy-data';
import { Annotation, AIAnalysis, Trial } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Clock,
  Save,
  X,
  CornerDownLeft,
  Edit,
  Filter
} from 'lucide-react';
// Remove next-video import as we'll use standard HTML5 video for external URLs

export default function AnnotatePage() {
  const params = useParams();
  const router = useRouter();
  const trialId = params.trialId as string;

  const playerRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playerReady, setPlayerReady] = useState(false);

  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false);
  const [annotationStart, setAnnotationStart] = useState<number | null>(null);
  const [annotationEnd, setAnnotationEnd] = useState<number | null>(null);
  const [annotationContent, setAnnotationContent] = useState('');
  const [annotationPart, setAnnotationPart] = useState<'Trial Part 1' | 'Trial Part 2' | 'Trial Part 3'>('Trial Part 1');
  const [annotationEmotion, setAnnotationEmotion] = useState<'positive' | 'negative'>('negative');

  // Editing annotation state
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editPart, setEditPart] = useState<'Trial Part 1' | 'Trial Part 2' | 'Trial Part 3'>('Trial Part 1');
  const [editEmotion, setEditEmotion] = useState<'positive' | 'negative'>('negative');

  // Animation state for newly created annotations
  const [newlyCreatedAnnotation, setNewlyCreatedAnnotation] = useState<string | null>(null);

  // Ref for textarea to auto-focus
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tab state for transcript/annotations/ai-analysis
  const [activeTab, setActiveTab] = useState<'transcript' | 'annotations' | 'ai-analysis'>('ai-analysis');

  // AI Analysis state
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // AI Analysis filter state
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedPasses, setSelectedPasses] = useState<number[]>([]);

  // Data
  const [trial, setTrial] = useState<Trial | null>(null);

  // Fetch trial data
  useEffect(() => {
    // First try to find in dummy trials (for backwards compatibility)
    const dummyTrial = dummyTrials.find(t => t.trialId === trialId);

    if (dummyTrial) {
      setTrial(dummyTrial);
    } else {
      // If not found in dummy data, create a trial object with API video URL
      setTrial({
        trialId: trialId,
        videoUrl: `/api/trials/${trialId}/video`,
        transcriptUrl: `/api/trials/${trialId}/transcript`,
        studentId: trialId,
        studentName: trialId.split('-')[0].charAt(0).toUpperCase() + trialId.split('-')[0].slice(1),
        tutorId: 'tutor-001',
        tutorName: 'AI Analysis',
        grade: trialId.includes('g1') ? 'Grade 1' :
               trialId.includes('g2') ? 'Grade 2' :
               trialId.includes('g3') ? 'Grade 3' :
               trialId.includes('g4') ? 'Grade 4' :
               trialId.includes('g5') ? 'Grade 5' :
               trialId.includes('g6') ? 'Grade 6' :
               trialId.includes('g7') ? 'Grade 7' :
               trialId.includes('g8') ? 'Grade 8' : 'Grade 3',
        trialDate: new Date().toISOString(),
        region: 'NAM',
        channel: 'perf-meta',
        duration: 3600,
        trialVersion: 'v3.2'
      });
    }
  }, [trialId]);

  const transcript = useMemo(() =>
    dummyTranscripts.find(t => t.trialId === trialId),
    [trialId]
  );

  useEffect(() => {
    if (trial) {
      const filteredAnnotations = dummyAnnotations.filter(ann => ann.trialId === trialId);
      // Sort annotations chronologically by start time
      filteredAnnotations.sort((a, b) => a.timestamp.start - b.timestamp.start);
      setAnnotations(filteredAnnotations);
    }
  }, [trial, trialId]);

  // Fetch AI analysis
  useEffect(() => {
    async function fetchAIAnalysis() {
      setLoadingAnalysis(true);
      try {
        const response = await fetch(`/api/trials/${trialId}/analysis`);
        if (response.ok) {
          const data = await response.json();
          setAIAnalysis(data);
        }
      } catch (error) {
        console.error('Error fetching AI analysis:', error);
      } finally {
        setLoadingAnalysis(false);
      }
    }

    fetchAIAnalysis();
  }, [trialId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields or when seek slider is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Check if seek slider is focused
      if (e.target instanceof HTMLInputElement && e.target.type === 'range') {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            seekTo(Math.max(0, currentTime - 1)); // 1 second with Shift
          } else {
            seekTo(Math.max(0, currentTime - 5)); // 5 seconds normally
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            seekTo(Math.min(duration, currentTime + 1)); // 1 second with Shift
          } else {
            seekTo(Math.min(duration, currentTime + 5)); // 5 seconds normally
          }
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          if (!isCreatingAnnotation) {
            startAnnotation();
          }
          break;
        case 'Enter':
          if (isCreatingAnnotation && annotationContent.trim()) {
            e.preventDefault();
            handleCreateAnnotation();
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (isCreatingAnnotation) {
            resetAnnotationForm();
          }
          break;
        case 'e':
        case 'E':
          // Only trigger if not typing in input fields
          if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) {
            e.preventDefault();
            if (isCreatingAnnotation) {
              setEndTime();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, isCreatingAnnotation, playerReady, annotationContent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Force video to load when component mounts
    if (playerRef.current && trial?.videoUrl) {
      console.log('Forcing video load for:', trial.videoUrl);
      playerRef.current.load();

      // Fallback: Enable controls after a delay if events don't fire
      const fallbackTimer = setTimeout(() => {
        if (!playerReady) {
          console.log('Fallback: Enabling controls after timeout');
          setPlayerReady(true);
        }
      }, 3000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [trial?.videoUrl, playerReady]);

  const currentTranscriptSegment = useMemo(() => {
    if (!transcript) return null;
    return transcript.segments.find(segment =>
      currentTime >= segment.startTime && currentTime <= segment.endTime
    );
  }, [transcript, currentTime]);

  const handleTimeUpdate = () => {
    if (playerRef.current) {
      setCurrentTime(playerRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (playerRef.current) {
      setDuration(playerRef.current.duration);
      setPlayerReady(true);
      console.log('Video loaded, duration:', playerRef.current.duration);
    }
  };

  const handleCanPlay = () => {
    setPlayerReady(true);
    console.log('Video can play');
  };

  const handleLoadStart = () => {
    console.log('Video load started');
  };

  const handleLoadedData = () => {
    console.log('Video data loaded');
    setPlayerReady(true);
  };

  const handleError = (error: unknown) => {
    console.error('Video error:', error);
    console.log('Video element:', playerRef.current);
  };

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current && playerReady && duration > 0) {
      playerRef.current.currentTime = seconds;
      // If currently annotating, set this as the end time
      if (isCreatingAnnotation && annotationStart !== null) {
        setAnnotationEnd(seconds);
      }
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    seekTo(newTime);
  };

  const togglePlay = async () => {
    if (playerRef.current) {
      try {
        if (playing) {
          playerRef.current.pause();
        } else {
          await playerRef.current.play();
        }
      } catch (error) {
        console.error('Error playing video:', error);
        // Force enable controls if there's an error
        setPlayerReady(true);
      }
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleCreateAnnotation = () => {
    if (annotationStart === null || !annotationContent.trim()) return;

    const newAnnotationId = `ann-${Date.now()}`;
    const newAnnotation: Annotation = {
      annotationId: newAnnotationId,
      trialId: trialId,
      reviewerId: 'rev-001',
      trialPart: annotationPart,
      emotion: annotationEmotion,
      timestamp: {
        start: annotationStart,
        end: annotationEnd || undefined
      },
      content: annotationContent,
      transcriptSnippet: getTranscriptSnippet(annotationStart || 0, annotationEnd || undefined),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAnnotations(prev => {
      const updatedAnnotations = [...prev, newAnnotation];
      // Sort annotations chronologically by start time
      updatedAnnotations.sort((a, b) => a.timestamp.start - b.timestamp.start);
      return updatedAnnotations;
    });

    // Set the newly created annotation for animation
    setNewlyCreatedAnnotation(newAnnotationId);

    // Clear animation after 2 seconds
    setTimeout(() => {
      setNewlyCreatedAnnotation(null);
    }, 2000);

    resetAnnotationForm();
  };

  const getTranscriptSnippet = (start: number, end?: number) => {
    if (!transcript) return undefined;

    const relevantSegments = transcript.segments.filter(segment => {
      if (end) {
        return segment.startTime >= start && segment.endTime <= end;
      } else {
        return Math.abs(segment.startTime - start) <= 2;
      }
    });

    if (relevantSegments.length === 0) return undefined;

    return {
      text: relevantSegments.map(s => s.text).join(' '),
      speakers: [...new Set(relevantSegments.map(s => s.speaker))],
      segments: relevantSegments
    };
  };

  const resetAnnotationForm = () => {
    setIsCreatingAnnotation(false);
    setAnnotationStart(null);
    setAnnotationEnd(null);
    setAnnotationContent('');
    setAnnotationPart('Trial Part 1');
    setAnnotationEmotion('negative');
  };

  const startAnnotation = () => {
    setAnnotationStart(currentTime);
    setIsCreatingAnnotation(true);
    setActiveTab('annotations'); // Switch to annotations tab
    // Pause video when starting annotation
    if (playerRef.current && playing) {
      playerRef.current.pause();
    }
    // Auto-focus the textarea after state updates
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const setEndTime = () => {
    if (annotationStart !== null) {
      setAnnotationEnd(currentTime);
    }
  };

  const deleteAnnotation = (annotationId: string) => {
    setAnnotations(prev => prev.filter(ann => ann.annotationId !== annotationId));
  };

  const startEditingAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation.annotationId);
    setEditContent(annotation.content);
    setEditPart(annotation.trialPart);
    setEditEmotion(annotation.emotion);
    setActiveTab('annotations');
  };

  const saveEditedAnnotation = () => {
    if (!editingAnnotation || !editContent.trim()) return;

    setAnnotations(prev => {
      const updatedAnnotations = prev.map(ann =>
        ann.annotationId === editingAnnotation
          ? { ...ann, content: editContent, trialPart: editPart, emotion: editEmotion, updatedAt: new Date().toISOString() }
          : ann
      );
      // Sort annotations chronologically by start time
      updatedAnnotations.sort((a, b) => a.timestamp.start - b.timestamp.start);
      return updatedAnnotations;
    });
    cancelEditingAnnotation();
  };

  const cancelEditingAnnotation = () => {
    setEditingAnnotation(null);
    setEditContent('');
    setEditPart('Trial Part 1');
    setEditEmotion('negative');
  };

  const getReviewerName = (reviewerId: string) => {
    const reviewer = dummyReviewers.find(r => r.reviewerId === reviewerId);
    return reviewer ? reviewer.name : 'Unknown';
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Domain to themes mapping
  const domainToThemesMap: Record<string, string[]> = {
    'Parent Engagement': [
      'Narrow Reframing',
      'Scheduling & Pacing Rigidity',
      'Failing to Address Parent Concerns',
      'Mishandling Parent Selections',
      'Role Abdication',
    ],
    'Student Engagement': [
      'Using Vague Openers',
      'Awkward Rapport Attempt',
      'Failing to Sustain Conversation',
      'Over-reliance on Closed-Ended Questions',
      'Not Addressing Child First',
      "Misusing Child's Name/Pronoun",
      'Parent-Dominated Talk (Failure to Redirect)',
    ],
    'Pedagogical Effectiveness': [
      'Pre-emptive Questioning',
      'Using Leading Questions',
      'Insufficient Scaffolding',
      "Interrupting Student's Thought Process",
      'Failing to Check for Understanding (CFU)',
      'Incorrect Problem Assessment',
      'Failing to Identify Foundational Gaps',
      'Skipping Concepts Without Assessment',
    ],
    'Process & Platform Adherence': [
      'Rushing or Skipping Key Sections',
      'Discussing Topics on Wrong Slide',
      'Failing to Involve Parent as Required',
    ],
    'Professionalism & Environment': [
      'Low Energy / Unenthusiastic',
      'Scripted or Robotic Delivery',
      'Poor Lighting or Background',
      'Poor Audio Quality',
      'Unprofessional Affiliation Talk',
    ],
    'Linguistic & Communicative Competence': [
      'Grammatical Errors',
      'Non-Idiomatic Phrasing',
      'Use of Non-Standard Pedagogical Terminology',
      'Disfluent Speech / Overuse of Fillers',
    ],
    'Session Flags': [
      'Pre-Trial Misalignment',
    ],
  };

  // Map themes to domains
  const getDomainForTheme = (theme: string): string => {
    const domainMap: Record<string, string> = {
      'Narrow Reframing': 'Parent Engagement',
      'Scheduling & Pacing Rigidity': 'Parent Engagement',
      'Failing to Address Parent Concerns': 'Parent Engagement',
      'Mishandling Parent Selections': 'Parent Engagement',
      'Using Vague Openers': 'Student Engagement',
      'Awkward Rapport Attempt': 'Student Engagement',
      'Failing to Sustain Conversation': 'Student Engagement',
      'Over-reliance on Closed-Ended Questions': 'Student Engagement',
      'Not Addressing Child First': 'Student Engagement',
      "Misusing Child's Name/Pronoun": 'Student Engagement',
      'Parent-Dominated Talk (Failure to Redirect)': 'Student Engagement',
      'Pre-emptive Questioning': 'Pedagogical Effectiveness',
      'Using Leading Questions': 'Pedagogical Effectiveness',
      'Insufficient Scaffolding': 'Pedagogical Effectiveness',
      "Interrupting Student's Thought Process": 'Pedagogical Effectiveness',
      'Failing to Check for Understanding (CFU)': 'Pedagogical Effectiveness',
      'Incorrect Problem Assessment': 'Pedagogical Effectiveness',
      'Failing to Identify Foundational Gaps': 'Pedagogical Effectiveness',
      'Skipping Concepts Without Assessment': 'Pedagogical Effectiveness',
      'Rushing or Skipping Key Sections': 'Process & Platform Adherence',
      'Discussing Topics on Wrong Slide': 'Process & Platform Adherence',
      'Failing to Involve Parent as Required': 'Process & Platform Adherence',
      'Low Energy / Unenthusiastic': 'Professionalism & Environment',
      'Scripted or Robotic Delivery': 'Professionalism & Environment',
      'Poor Lighting or Background': 'Professionalism & Environment',
      'Poor Audio Quality': 'Professionalism & Environment',
      'Unprofessional Affiliation Talk': 'Professionalism & Environment',
      'Grammatical Errors': 'Linguistic & Communicative Competence',
      'Non-Idiomatic Phrasing': 'Linguistic & Communicative Competence',
      'Use of Non-Standard Pedagogical Terminology': 'Linguistic & Communicative Competence',
      'Disfluent Speech / Overuse of Fillers': 'Linguistic & Communicative Competence',
      'Role Abdication': 'Parent Engagement',
      'Pre-Trial Misalignment': 'Session Flags',
    };
    return domainMap[theme] || 'General';
  };

  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      // Remove domain and its themes
      setSelectedDomains(prev => prev.filter(d => d !== domain));
      setSelectedThemes(prev => prev.filter(t => !domainToThemesMap[domain]?.includes(t)));
    } else {
      // Add domain and all its themes
      setSelectedDomains(prev => [...prev, domain]);
      setSelectedThemes(prev => [...prev, ...(domainToThemesMap[domain] || [])]);
    }
  };

  const toggleTheme = (theme: string, domain: string) => {
    if (selectedThemes.includes(theme)) {
      // Remove theme
      setSelectedThemes(prev => prev.filter(t => t !== theme));
      // Check if we should remove the domain
      const domainThemes = domainToThemesMap[domain] || [];
      const remainingThemes = domainThemes.filter(t => selectedThemes.includes(t) && t !== theme);
      if (remainingThemes.length === 0) {
        setSelectedDomains(prev => prev.filter(d => d !== domain));
      }
    } else {
      // Add theme
      setSelectedThemes(prev => [...prev, theme]);
      // Check if we should add the domain
      const domainThemes = domainToThemesMap[domain] || [];
      const allThemesSelected = domainThemes.every(t => selectedThemes.includes(t) || t === theme);
      if (allThemesSelected && !selectedDomains.includes(domain)) {
        setSelectedDomains(prev => [...prev, domain]);
      }
    }
  };

  const togglePass = (pass: number) => {
    setSelectedPasses(prev =>
      prev.includes(pass)
        ? prev.filter(p => p !== pass)
        : [...prev, pass]
    );
  };

  const clearAllFilters = () => {
    setSelectedDomains([]);
    setSelectedThemes([]);
    setSelectedPasses([]);
  };

  if (!trial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Trial Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{trial.tutorName} / {trial.studentName} ({trial.grade})</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatDate(trial.trialDate)}</span>
                <span>•</span>
                <Badge variant="outline">
                  {trial.region === 'NAM' ? '🇺🇸' : trial.region === 'ISC' ? '🇮🇳' : '🇦🇪'} {trial.region}
                </Badge>
                <Badge
                  className={
                    trial.channel === 'perf-meta' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30' :
                    trial.channel === 'organic-content' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30' :
                    trial.channel === 'BTL' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30' :
                    trial.channel === 'tutor-referral' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30' :
                    'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/30'
                  }
                >
                  {trial.channel}
                </Badge>
                <Badge variant="secondary">
                  {trial.trialVersion}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-mono">{formatDuration(trial.duration)}</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6">
          {/* Video Player with Controls */}
          <div>
            <Card>
              <CardContent className="p-4">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    src={trial.videoUrl}
                    ref={playerRef}
                    controls={false}
                    className="w-full h-full object-contain cursor-pointer"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadStart={handleLoadStart}
                    onLoadedData={handleLoadedData}
                    onLoadedMetadata={handleLoadedMetadata}
                    onCanPlay={handleCanPlay}
                    onCanPlayThrough={() => {
                      console.log('Video can play through');
                      setPlayerReady(true);
                    }}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onError={handleError}
                    onClick={togglePlay}
                    preload="auto"
                    playsInline
                  />
                </div>

                {/* Video Controls */}
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatDuration(Math.floor(currentTime))}</span>
                      <span>{formatDuration(Math.floor(duration))}</span>
                    </div>
                    <div className="relative">
                      <div className="w-full h-2 bg-secondary rounded-lg relative cursor-pointer" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        const newTime = percent * duration;
                        seekTo(newTime);
                      }}>
                        {/* Progress fill */}
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-lg"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />

                        {/* Annotation markers - dots inside the seekbar */}
                        {annotations.map(annotation => {
                          const position = duration ? (annotation.timestamp.start / duration) * 100 : 0;
                          const emotionColor = annotation.emotion === 'positive' ? 'bg-green-500' : 'bg-orange-500';
                          return (
                            <div
                              key={annotation.annotationId}
                              className={`absolute w-1 h-1 ${emotionColor} rounded-full cursor-pointer z-10`}
                              style={{
                                left: `${Math.max(2, Math.min(98, position))}%`,
                                top: '50%',
                                transform: 'translateY(-50%) translateX(-50%)'
                              }}
                              title={`${annotation.trialPart}: ${annotation.content.substring(0, 50)}...`}
                              onClick={(e) => {
                                e.stopPropagation();
                                seekTo(annotation.timestamp.start);
                              }}
                            />
                          );
                        })}

                        {/* AI Analysis issue markers - dots inside the seekbar */}
                        {aiAnalysis?.issues?.map((issue, index) => {
                          const issueTime = parseAITimestamp(issue.timestamp);
                          const position = duration ? (issueTime / duration) * 100 : 0;
                          const severityColor =
                            issue.severity.toLowerCase() === 'critical' ? 'bg-red-500' :
                            issue.severity.toLowerCase() === 'high' ? 'bg-orange-500' :
                            issue.severity.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                            'bg-gray-400';

                          return (
                            <div
                              key={`ai-issue-${index}`}
                              className={`absolute w-1.5 h-1.5 ${severityColor} rounded-full cursor-pointer z-10 border border-white dark:border-gray-800`}
                              style={{
                                left: `${Math.max(2, Math.min(98, position))}%`,
                                top: '50%',
                                transform: 'translateY(-50%) translateX(-50%)'
                              }}
                              title={`${issue.severity}: ${issue.theme} - ${issue.quote.substring(0, 50)}...`}
                              onClick={(e) => {
                                e.stopPropagation();
                                seekTo(issueTime);
                                setActiveTab('ai-analysis');
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Hidden range input for accessibility */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeekChange}
                        className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ pointerEvents: 'none' }}
                        tabIndex={-1}
                      />
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => seekTo(Math.max(0, currentTime - 10))}
                        disabled={!playerReady}
                        title="Seek back 10 seconds"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        onClick={togglePlay}
                        disabled={!playerReady}
                        title="Play/Pause"
                      >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                        disabled={!playerReady}
                        title="Seek forward 10 seconds"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>

                      <Select value={playbackRate.toString()} onValueChange={(value) => changePlaybackRate(parseFloat(value))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startAnnotation}
                        disabled={!playerReady}
                        className="flex items-center gap-2"
                        title="Add annotation (A)"
                      >
                        <Plus className="h-4 w-4" />
                        Add Note
                        <Kbd className="ml-1">A</Kbd>
                      </Button>

                      {isCreatingAnnotation && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={setEndTime}
                          className="flex items-center gap-2"
                          title="Set end time (E)"
                        >
                          <Clock className="h-4 w-4" />
                          Set End
                          <Kbd className="ml-1">E</Kbd>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Keyboard shortcuts info */}
                  <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium mb-2">Keyboard Shortcuts:</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex items-center gap-2">
                        <Kbd>Space</Kbd>
                        <span>Play/Pause</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>A</Kbd>
                        <span>Add Note</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>←</Kbd><Kbd>→</Kbd>
                        <span>Seek ±5s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>E</Kbd>
                        <span>Set End Time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>Shift</Kbd><Kbd>←</Kbd><Kbd>→</Kbd>
                        <span>Seek ±1s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>Esc</Kbd>
                        <span>Cancel</span>
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript & Annotations Panel */}
          <div className="h-full max-h-[calc(100vh-12rem)]">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex border-b">
                    <button
                      onClick={() => setActiveTab('transcript')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'transcript'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Transcript
                    </button>
                    <button
                      onClick={() => setActiveTab('annotations')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'annotations'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Annotations ({annotations.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('ai-analysis')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'ai-analysis'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      AI Analysis {aiAnalysis && `(${aiAnalysis.issues?.length || 0})`}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <div className="space-y-3 h-full overflow-y-auto">
                  {activeTab === 'transcript' && transcript && (
                    <>
                      {transcript.segments.map((segment, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            currentTranscriptSegment === segment
                              ? 'bg-primary/10 border border-primary/20'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          onClick={() => seekTo(segment.startTime)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {segment.speaker}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(segment.startTime)}
                            </span>
                          </div>
                          <p className="text-sm">{segment.text}</p>
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'annotations' && (
                    <>
                      {/* Existing Annotations with inline creation form */}
                      {annotations.length === 0 && !isCreatingAnnotation ? (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No annotations yet. Click &quot;Add Note&quot; to create one.
                        </p>
                      ) : (
                        // Create a combined list with proper chronological ordering
                        (() => {
                          type AnnotationOrCreating = Annotation | {
                            type: 'creating';
                            timestamp: { start: number };
                            annotationId: string;
                          };

                          const items: AnnotationOrCreating[] = [...annotations];

                          // Add the creation form at the correct chronological position
                          if (isCreatingAnnotation && annotationStart !== null) {
                            const insertIndex = items.findIndex(ann => ann.timestamp.start > annotationStart);
                            const createFormItem: AnnotationOrCreating = {
                              type: 'creating' as const,
                              timestamp: { start: annotationStart },
                              annotationId: 'creating-form'
                            };

                            if (insertIndex === -1) {
                              items.push(createFormItem);
                            } else {
                              items.splice(insertIndex, 0, createFormItem);
                            }
                          }

                          return items.map((item) => {
                            if ('type' in item && item.type === 'creating') {
                              return (
                                <div key="creating-form" className="p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium">Creating New Annotation</h4>
                                      <Button variant="ghost" size="sm" onClick={resetAnnotationForm}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                                        <div className="font-mono text-sm bg-background p-2 rounded border text-foreground">
                                          {annotationStart !== null ? formatDuration(Math.floor(annotationStart)) : '--:--'}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground">End Time</label>
                                        <div className="font-mono text-sm bg-background p-2 rounded border text-foreground">
                                          {annotationEnd !== null ? formatDuration(Math.floor(annotationEnd)) : '--:--'}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground">Trial Part</label>
                                        <Select value={annotationPart} onValueChange={(value: string) => setAnnotationPart(value as "Trial Part 1" | "Trial Part 2" | "Trial Part 3")}>
                                          <SelectTrigger className="h-8 bg-background dark:bg-background">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Trial Part 1">Trial Part 1</SelectItem>
                                            <SelectItem value="Trial Part 2">Trial Part 2</SelectItem>
                                            <SelectItem value="Trial Part 3">Trial Part 3</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-muted-foreground">Emotion</label>
                                        <Select value={annotationEmotion} onValueChange={(value: string) => setAnnotationEmotion(value as "positive" | "negative")}>
                                          <SelectTrigger className="h-8 bg-background dark:bg-background">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="negative">Negative</SelectItem>
                                            <SelectItem value="positive">Positive</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground">Content</label>
                                      <Textarea
                                        ref={textareaRef}
                                        value={annotationContent}
                                        onChange={(e) => setAnnotationContent(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (annotationContent.trim()) {
                                              handleCreateAnnotation();
                                            }
                                          }
                                          if (e.key === 'Escape') {
                                            e.preventDefault();
                                            resetAnnotationForm();
                                          }
                                          // Remove E key handling from textarea since it should only work globally when not typing
                                        }}
                                        placeholder="Enter your annotation here... (Press Enter to save, Shift+Enter for new line)"
                                        className="min-h-[80px] text-sm bg-background dark:bg-background"
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={handleCreateAnnotation}
                                        disabled={!annotationContent.trim()}
                                        className="flex items-center gap-2"
                                        title="Save annotation (Enter)"
                                      >
                                        <Save className="h-3 w-3" />
                                        Save
                                        <Kbd className="ml-1">
                                          <CornerDownLeft className="h-3 w-3" />
                                        </Kbd>
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={resetAnnotationForm} title="Cancel (Escape)">
                                        Cancel
                                        <Kbd className="ml-1">Esc</Kbd>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            const annotation = item as Annotation;
                            return (
                              <div key={annotation.annotationId}>
                                {editingAnnotation === annotation.annotationId ? (
                              /* Editing Mode */
                              <div className="p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Editing Annotation</h4>
                                    <Button variant="ghost" size="sm" onClick={cancelEditingAnnotation}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                                      <div className="font-mono text-sm bg-background p-2 rounded border text-foreground">
                                        {formatDuration(Math.floor(annotation.timestamp.start))}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground">End Time</label>
                                      <div className="font-mono text-sm bg-background p-2 rounded border text-foreground">
                                        {annotation.timestamp.end ? formatDuration(Math.floor(annotation.timestamp.end)) : '--:--'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground">Trial Part</label>
                                      <Select value={editPart} onValueChange={(value: string) => setEditPart(value as "Trial Part 1" | "Trial Part 2" | "Trial Part 3")}>
                                        <SelectTrigger className="h-8 bg-background dark:bg-background">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Trial Part 1">Trial Part 1</SelectItem>
                                          <SelectItem value="Trial Part 2">Trial Part 2</SelectItem>
                                          <SelectItem value="Trial Part 3">Trial Part 3</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground">Emotion</label>
                                      <Select value={editEmotion} onValueChange={(value: string) => setEditEmotion(value as "positive" | "negative")}>
                                        <SelectTrigger className="h-8 bg-background dark:bg-background">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="negative">Negative</SelectItem>
                                          <SelectItem value="positive">Positive</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground">Content</label>
                                    <Textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          if (editContent.trim()) {
                                            saveEditedAnnotation();
                                          }
                                        }
                                        if (e.key === 'Escape') {
                                          e.preventDefault();
                                          cancelEditingAnnotation();
                                        }
                                      }}
                                      placeholder="Enter your annotation here..."
                                      className="min-h-[80px] text-sm bg-background dark:bg-background"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={saveEditedAnnotation}
                                      disabled={!editContent.trim()}
                                      className="flex items-center gap-2"
                                    >
                                      <Save className="h-3 w-3" />
                                      Save
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={cancelEditingAnnotation}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <div
                                className={`p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-500 ${
                                  newlyCreatedAnnotation === annotation.annotationId
                                    ? 'animate-pulse bg-green-50 border-green-300 shadow-lg scale-[1.02] mx-1 dark:bg-green-900/20 dark:border-green-700'
                                    : ''
                                }`}
                                onClick={() => seekTo(annotation.timestamp.start)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {getInitials(getReviewerName(annotation.reviewerId))}
                                      </AvatarFallback>
                                    </Avatar>
                                    <Badge variant="outline" className="text-xs">
                                      {annotation.trialPart}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {formatDuration(annotation.timestamp.start)}
                                      {annotation.timestamp.end && ` - ${formatDuration(annotation.timestamp.end)}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditingAnnotation(annotation);
                                      }}
                                      title="Edit annotation"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAnnotation(annotation.annotationId);
                                      }}
                                      title="Delete annotation"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm mb-2">{annotation.content}</p>
                              </div>
                            )}
                          </div>
                        );
                      });
                        })()
                      )}
                    </>
                  )}

                  {activeTab === 'ai-analysis' && (
                    <>
                      {loadingAnalysis ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-muted-foreground text-sm">Loading AI analysis...</div>
                        </div>
                      ) : !aiAnalysis ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-muted-foreground text-sm">No AI analysis available for this trial.</div>
                        </div>
                      ) : aiAnalysis.issues && aiAnalysis.issues.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-muted-foreground text-sm">No issues found in AI analysis.</div>
                        </div>
                      ) : (
                        <>
                          {/* Compact Filter UI */}
                          <div className="flex items-center gap-2 mb-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2">
                                  <Filter className="h-3.5 w-3.5" />
                                  Filter
                                  {(selectedThemes.length > 0 || selectedPasses.length > 0) && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                                      {selectedThemes.length + selectedPasses.length}
                                    </Badge>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-3" align="start">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Filter Issues</h4>
                                    {(selectedThemes.length > 0 || selectedPasses.length > 0) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="h-6 px-2 text-xs"
                                      >
                                        Clear
                                      </Button>
                                    )}
                                  </div>

                                  {/* Pass Filter */}
                                  <div className="border rounded p-2">
                                    <div className="text-xs font-medium mb-1.5">Analysis Pass</div>
                                    <div className="flex gap-1.5 flex-wrap">
                                      {Array.from(new Set(aiAnalysis.issues?.map(issue => issue.analysisPass).filter(Boolean))).sort((a, b) => a - b).map(pass => {
                                        const issuesInPass = aiAnalysis.issues?.filter(
                                          issue => issue.analysisPass === pass
                                        ).length || 0;
                                        if (issuesInPass === 0) return null;

                                        return (
                                          <label
                                            key={pass}
                                            className="flex items-center gap-1.5 cursor-pointer px-2 py-1 border rounded hover:bg-accent"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={selectedPasses.includes(pass)}
                                              onChange={() => togglePass(pass)}
                                              className="rounded border-gray-300 h-3 w-3"
                                            />
                                            <span className="text-xs">{pass}</span>
                                            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                              {issuesInPass}
                                            </Badge>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                                    {Object.keys(domainToThemesMap).map(domain => {
                                      const domainThemes = domainToThemesMap[domain];
                                      const issuesInDomain = aiAnalysis.issues?.filter(issue =>
                                        domainThemes.includes(issue.theme)
                                      ).length || 0;

                                      if (issuesInDomain === 0) return null;

                                      const isDomainSelected = selectedDomains.includes(domain);

                                      return (
                                        <div key={domain} className="border rounded p-1.5">
                                          <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={isDomainSelected}
                                              onChange={() => toggleDomain(domain)}
                                              className="rounded border-gray-300 h-3.5 w-3.5"
                                            />
                                            <span className="text-xs font-medium flex-1">{domain}</span>
                                            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                              {issuesInDomain}
                                            </Badge>
                                          </label>

                                          {isDomainSelected && (
                                            <div className="ml-5 mt-1 space-y-0.5 pt-1 border-t">
                                              {domainThemes.map(theme => {
                                                const issuesWithTheme = aiAnalysis.issues?.filter(
                                                  issue => issue.theme === theme
                                                ).length || 0;
                                                if (issuesWithTheme === 0) return null;

                                                return (
                                                  <label key={theme} className="flex items-center gap-1.5 cursor-pointer py-0.5">
                                                    <input
                                                      type="checkbox"
                                                      checked={selectedThemes.includes(theme)}
                                                      onChange={() => toggleTheme(theme, domain)}
                                                      className="rounded border-gray-300 h-3 w-3"
                                                    />
                                                    <span className="text-[11px] text-muted-foreground flex-1">
                                                      {theme}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                      {issuesWithTheme}
                                                    </span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Active Filter Chips */}
                          {(selectedThemes.length > 0 || selectedPasses.length > 0) && (
                            <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b">
                              {selectedPasses.map(pass => (
                                <Badge
                                  key={`pass-${pass}`}
                                  variant="secondary"
                                  className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-secondary/80"
                                  onClick={() => togglePass(pass)}
                                >
                                  {pass}
                                  <X className="h-3 w-3" />
                                </Badge>
                              ))}
                              {selectedThemes.map(theme => {
                                const domain = getDomainForTheme(theme);
                                return (
                                  <Badge
                                    key={theme}
                                    variant="secondary"
                                    className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-secondary/80"
                                    onClick={() => toggleTheme(theme, domain)}
                                  >
                                    {theme}
                                    <X className="h-3 w-3" />
                                  </Badge>
                                );
                              })}
                            </div>
                          )}

                          {/* Issues List */}
                          {(() => {
                            // Filter issues based on selected themes and passes
                            let filteredIssues = aiAnalysis.issues;

                            // Filter by themes if any are selected
                            if (selectedThemes.length > 0) {
                              filteredIssues = filteredIssues?.filter(issue =>
                                selectedThemes.includes(issue.theme)
                              );
                            }

                            // Filter by passes if any are selected
                            if (selectedPasses.length > 0) {
                              filteredIssues = filteredIssues?.filter(issue =>
                                issue.analysisPass && selectedPasses.includes(issue.analysisPass)
                              );
                            }

                            if (!filteredIssues || filteredIssues.length === 0) {
                              return (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-muted-foreground text-sm">No issues match the selected filters.</div>
                                </div>
                              );
                            }

                            return filteredIssues.map((issue, index) => {
                            const issueTimestamp = parseAITimestamp(issue.timestamp);
                            const severityColor =
                              issue.severity.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30' :
                              issue.severity.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30' :
                              issue.severity.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/30' :
                              'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:hover:bg-gray-900/30';

                            const domain = getDomainForTheme(issue.theme);

                            return (
                              <div
                                key={index}
                                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => seekTo(issueTimestamp)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs font-mono">
                                      {issue.timestamp}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {issue.speaker}
                                    </Badge>
                                    <Badge className={`text-xs ${severityColor}`}>
                                      {issue.severity}
                                    </Badge>
                                    {issue.analysisPass && (
                                      <Badge variant="secondary" className="text-xs">
                                        {issue.analysisPass}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="mb-2">
                                  <div className="text-xs text-muted-foreground mb-1">{domain}</div>
                                  <div className="text-sm font-semibold text-primary">{issue.theme}</div>
                                </div>

                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium text-muted-foreground">Quote: </span>
                                    <span className="italic">&quot;{issue.quote}&quot;</span>
                                  </div>

                                  <div>
                                    <span className="font-medium text-muted-foreground">Context: </span>
                                    <span>{issue.context}</span>
                                  </div>

                                  <div>
                                    <span className="font-medium text-muted-foreground">Issue: </span>
                                    <span>{issue.justification}</span>
                                  </div>

                                  <div className="pt-2 border-t">
                                    <span className="font-medium text-green-600 dark:text-green-400">Suggested Alternative: </span>
                                    <span className="text-green-700 dark:text-green-300">{issue.alternative}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                          })()}
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}