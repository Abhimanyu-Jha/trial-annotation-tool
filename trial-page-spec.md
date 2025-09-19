# Trial Page Specification

## Overview
The Trial page (located at `/annotate/[trialId]`) is the core annotation interface where reviewers can watch trial videos and create/edit annotations in real-time.

## Page URL
- **Route**: `/annotate/[trialId]`
- **File**: `src/app/annotate/[trialId]/page.tsx`
- **Dynamic Parameter**: `trialId` - Unique identifier for the trial video

## Core Features

### 1. Video Player Interface

#### Video Controls
- **Primary Video Player**: HTML5 video element with external URL support
- **Play/Pause Button**: Toggle video playback (Space bar shortcut)
- **Seek Slider**: Progress bar with drag-to-seek functionality
- **Playback Speed**: Dropdown selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- **Skip Controls**:
  - Skip backward 10 seconds
  - Skip forward 10 seconds
- **Current Time Display**: Shows current position and total duration (MM:SS format)

#### Video Player Features
- **Loading States**: Handles video loading with fallback mechanisms
- **Error Handling**: Graceful error handling for video playback issues
- **Auto-load**: Forces video load on component mount
- **Cross-origin Support**: Supports external video URLs (like Google Cloud Storage)

### 2. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Space** | Play/Pause video |
| **A** | Start new annotation at current time |
| **E** | Set end time for current annotation |
| **Enter** | Save annotation (when creating) |
| **Escape** | Cancel annotation creation |
| **← Arrow** | Seek backward 5 seconds |
| **Shift + ←** | Seek backward 1 second |
| **→ Arrow** | Seek forward 5 seconds |
| **Shift + →** | Seek forward 1 second |

### 3. Annotation System

#### Creating Annotations
1. **Start Annotation**: Press 'A' or click "New Annotation" button
2. **Set Time Range**:
   - Start time: Automatically set to current video time
   - End time: Press 'E' or seek to desired end position
3. **Content Input**: Multi-line textarea for annotation text
4. **Trial Part Selection**: Dropdown (Trial Part 1, 2, or 3)
5. **Save**: Press Enter or click Save button
6. **Cancel**: Press Escape or click Cancel button

#### Annotation Features
- **Auto-pause**: Video pauses when starting annotation
- **Auto-focus**: Textarea automatically receives focus
- **Auto-transcript**: Relevant transcript segments included automatically
- **Real-time Preview**: Shows time range and content as you type

#### Editing Annotations
- **Inline Editing**: Click edit button on existing annotations
- **Content Modification**: Edit text and trial part
- **Save/Cancel**: Save changes or cancel without saving
- **Timestamp Preservation**: Start/end times remain unchanged

#### Annotation Display
- **Chronological Order**: Annotations sorted by start time
- **Color Coding**: Different colors for different trial parts
- **Reviewer Info**: Shows annotator name with avatar
- **Timestamps**: Clickable timestamps to seek to annotation time
- **Actions**: Edit and delete buttons for each annotation

### 4. Transcript Integration

#### Transcript Display
- **Side Panel**: Transcript shown alongside annotations
- **Current Segment Highlighting**: Active transcript segment highlighted based on video time
- **Speaker Identification**: Shows Speaker (Student/Tutor/Parent) for each segment
- **Time-synced**: Transcript follows video playback automatically

#### Transcript Features
- **Clickable Segments**: Click to seek to specific transcript time
- **Auto-scroll**: Transcript auto-scrolls to current segment
- **Speaker-based Styling**: Different styling for different speakers

### 5. Layout & Navigation

#### Header Section
- **Back Button**: Returns to dashboard with arrow icon
- **Trial Information**:
  - Student and Tutor names (linked to admin portal)
  - Trial metadata (date, duration, grade, etc.)
- **Theme Toggle**: Dark/light mode switch

#### Main Content Areas
- **Left Panel (60%)**: Video player and controls
- **Right Panel (40%)**: Tabbed interface for:
  - **Transcript Tab**: Shows synchronized transcript
  - **Annotations Tab**: Shows all annotations and creation form

#### Trial Information Card
- **Student Details**: Name, ID, Grade
- **Tutor Details**: Name, ID
- **Trial Metadata**: Date, Duration, Region, Channel, Version
- **Links**: External links to admin portal for student/tutor profiles

### 6. State Management

#### Video State
```typescript
const [playing, setPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [playbackRate, setPlaybackRate] = useState(1);
const [playerReady, setPlayerReady] = useState(false);
```

#### Annotation State
```typescript
const [annotations, setAnnotations] = useState<Annotation[]>([]);
const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false);
const [annotationStart, setAnnotationStart] = useState<number | null>(null);
const [annotationEnd, setAnnotationEnd] = useState<number | null>(null);
const [annotationContent, setAnnotationContent] = useState('');
const [annotationPart, setAnnotationPart] = useState<'Trial Part 1' | 'Trial Part 2' | 'Trial Part 3'>('Trial Part 1');
```

#### Editing State
```typescript
const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
const [editContent, setEditContent] = useState('');
const [editPart, setEditPart] = useState<'Trial Part 1' | 'Trial Part 2' | 'Trial Part 3'>('Trial Part 1');
```

### 7. Data Integration

#### Data Sources
- **Trial Data**: `dummyTrials.find(t => t.trialId === trialId)`
- **Transcript Data**: `dummyTranscripts.find(t => t.trialId === trialId)`
- **Annotations**: `dummyAnnotations.filter(ann => ann.trialId === trialId)`
- **Reviewers**: `dummyReviewers` for annotator information

#### Data Flow
1. **Load Trial**: Fetch trial data based on URL parameter
2. **Load Media**: Initialize video player with trial video URL
3. **Load Transcript**: Fetch and display synchronized transcript
4. **Load Annotations**: Fetch existing annotations and sort chronologically
5. **Real-time Updates**: Update annotations list when creating/editing

### 8. Error Handling

#### Video Errors
- **404 Errors**: Handle missing video files gracefully
- **CORS Issues**: Support for cross-origin video resources
- **Loading Timeouts**: Fallback mechanisms for slow loading
- **Playback Failures**: User-friendly error messages

#### Data Errors
- **Missing Trial**: Show "Trial Not Found" with back button
- **Missing Transcript**: Graceful degradation without transcript
- **Annotation Failures**: Validate content before saving

### 9. Responsive Design

#### Desktop Layout (>1024px)
- **Side-by-side**: Video on left, transcript/annotations on right
- **Full Controls**: All keyboard shortcuts and controls available
- **Dual-pane**: Separate areas for video and annotation workflow

#### Tablet Layout (768px-1024px)
- **Stacked Layout**: Video on top, controls below
- **Touch-friendly**: Larger touch targets for mobile interaction
- **Collapsible Panels**: Hide/show transcript and annotation panels

#### Mobile Layout (<768px)
- **Single Column**: Full-width video with stacked controls
- **Tab-based Navigation**: Switch between transcript and annotations
- **Simplified Controls**: Essential controls only

### 10. Performance Optimizations

#### Video Optimization
- **Lazy Loading**: Video loads only when component mounts
- **Memory Management**: Proper cleanup of video resources
- **Seeking Optimization**: Efficient seeking without re-buffering

#### Rendering Optimization
- **useMemo**: Memoized calculations for transcript segments
- **useCallback**: Optimized event handlers
- **Minimal Re-renders**: Efficient state updates

### 11. Accessibility Features

#### Keyboard Navigation
- **Full Keyboard Support**: All features accessible via keyboard
- **Focus Management**: Proper focus handling for form elements
- **Skip Links**: Jump between major interface sections

#### Screen Reader Support
- **ARIA Labels**: Proper labeling for video controls
- **Semantic HTML**: Proper heading structure and landmarks
- **Alt Text**: Descriptive text for all interactive elements

### 12. Future Enhancements

#### Advanced Features
1. **Collaborative Annotations**: Real-time collaboration between reviewers
2. **Annotation Templates**: Pre-defined annotation templates
3. **Video Chapters**: Bookmark important video sections
4. **Export Options**: Export annotations to various formats
5. **Advanced Search**: Search within annotations and transcripts
6. **Quality Metrics**: Track annotation quality and consistency
7. **Integration APIs**: Connect with external annotation tools
8. **Video Analytics**: Track viewing patterns and engagement
9. **Batch Operations**: Select and modify multiple annotations
10. **Version Control**: Track annotation history and changes

#### Technical Improvements
1. **WebSocket Integration**: Real-time collaborative features
2. **Offline Support**: Cache videos and annotations for offline work
3. **Progressive Loading**: Load video in segments for faster start
4. **AI Assistance**: Auto-suggest annotations based on content
5. **Advanced Video Controls**: Frame-by-frame stepping, slow-motion
6. **Multi-camera Support**: Support for multiple video angles
7. **Annotation Validation**: Automated quality checks
8. **Performance Monitoring**: Track and optimize performance metrics