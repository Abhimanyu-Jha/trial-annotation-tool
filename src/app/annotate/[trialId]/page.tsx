'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  dummyTrials,
  dummyTranscripts,
  dummyAnnotations,
  formatDuration,
  formatDate
} from '@/lib/dummy-data';
import { Annotation } from '@/lib/types';
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
  X
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

  // Ref for textarea to auto-focus
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tab state for transcript/annotations
  const [activeTab, setActiveTab] = useState<'transcript' | 'annotations'>('transcript');

  // Data
  const trial = useMemo(() =>
    dummyTrials.find(t => t.trialId === trialId),
    [trialId]
  );

  const transcript = useMemo(() =>
    dummyTranscripts.find(t => t.trialId === trialId),
    [trialId]
  );

  useEffect(() => {
    if (trial) {
      setAnnotations(dummyAnnotations.filter(ann => ann.trialId === trialId));
    }
  }, [trial, trialId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(Math.min(duration, currentTime + 5));
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          if (!isCreatingAnnotation) {
            startAnnotation();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, isCreatingAnnotation, playerReady, seekTo, startAnnotation, togglePlay]);

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

    const newAnnotation: Annotation = {
      annotationId: `ann-${Date.now()}`,
      trialId: trialId,
      reviewerId: 'rev-001',
      trialPart: annotationPart,
      timestamp: {
        start: annotationStart,
        end: annotationEnd || undefined
      },
      content: annotationContent,
      transcriptSnippet: getTranscriptSnippet(annotationStart || 0, annotationEnd || undefined),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAnnotations(prev => [...prev, newAnnotation]);
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

  if (!trial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Trial Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
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
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{trial.trialId}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{trial.grade}</span>
                <span>•</span>
                <span>{trial.tutorId}</span>
                <span>•</span>
                <span>{formatDate(trial.trialDate)}</span>
                <span>•</span>
                <Badge variant="outline">{trial.region}</Badge>
                <Badge variant="secondary">{trial.channel}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="font-mono">{formatDuration(trial.duration)}</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_2fr] gap-6">
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
                    className="w-full h-full object-contain"
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

                        {/* Annotation markers */}
                        {annotations.map(annotation => (
                          <div
                            key={annotation.annotationId}
                            className="absolute top-0 h-full w-1 bg-red-500 cursor-pointer z-10"
                            style={{ left: `${duration ? (annotation.timestamp.start / duration) * 100 : 0}%` }}
                            title={`${annotation.trialPart}: ${annotation.content.substring(0, 50)}...`}
                            onClick={(e) => {
                              e.stopPropagation();
                              seekTo(annotation.timestamp.start);
                            }}
                          />
                        ))}
                      </div>

                      {/* Hidden range input for accessibility */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeekChange}
                        className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
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
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        onClick={togglePlay}
                        disabled={!playerReady}
                      >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                        disabled={!playerReady}
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
                        onClick={() => {
                          console.log('Debug - Player ready:', playerReady);
                          console.log('Debug - Video element:', playerRef.current);
                          console.log('Debug - Video readyState:', playerRef.current?.readyState);
                          console.log('Debug - Video networkState:', playerRef.current?.networkState);
                          setPlayerReady(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        Debug
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startAnnotation}
                        disabled={!playerReady}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Note
                      </Button>

                      {isCreatingAnnotation && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={setEndTime}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          Set End
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Current timestamp and transcript */}
                  <div className="text-sm">
                    <div className="font-mono text-muted-foreground mb-2">
                      Current: {formatDuration(Math.floor(currentTime))}
                    </div>
                    {currentTranscriptSegment && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {currentTranscriptSegment.speaker}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(currentTranscriptSegment.startTime)} - {formatDuration(currentTranscriptSegment.endTime)}
                          </span>
                        </div>
                        <p className="text-sm">{currentTranscriptSegment.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript & Annotations Panel */}
          <div>
            <Card>
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                      {/* Create Annotation Form - Inline */}
                      {isCreatingAnnotation && (
                        <div className="p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
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
                                <div className="font-mono text-sm bg-background p-2 rounded border">
                                  {annotationStart !== null ? formatDuration(Math.floor(annotationStart)) : '--:--'}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">End Time</label>
                                <div className="font-mono text-sm bg-background p-2 rounded border">
                                  {annotationEnd !== null ? formatDuration(Math.floor(annotationEnd)) : '--:--'}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Trial Part</label>
                              <Select value={annotationPart} onValueChange={(value: string) => setAnnotationPart(value)}>
                                <SelectTrigger className="h-8">
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
                                }}
                                placeholder="Enter your annotation here... (Press Enter to save, Shift+Enter for new line)"
                                className="min-h-[80px] text-sm"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleCreateAnnotation}
                                disabled={!annotationContent.trim()}
                                className="flex items-center gap-2"
                              >
                                <Save className="h-3 w-3" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={resetAnnotationForm}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Existing Annotations */}
                      {annotations.length === 0 && !isCreatingAnnotation ? (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No annotations yet. Click &quot;Add Note&quot; to create one.
                        </p>
                      ) : (
                        annotations.map((annotation) => (
                          <div
                            key={annotation.annotationId}
                            className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => seekTo(annotation.timestamp.start)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {annotation.trialPart}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {formatDuration(annotation.timestamp.start)}
                                  {annotation.timestamp.end && ` - ${formatDuration(annotation.timestamp.end)}`}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAnnotation(annotation.annotationId);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm mb-2">{annotation.content}</p>
                          </div>
                        ))
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