# Database Page Specification

## Overview
The Database page (located at `/dashboard`) serves as the main interface for browsing, filtering, and managing trial class videos in the Video Trial Annotation Tool.

## Page URL
- **Route**: `/dashboard`
- **File**: `src/app/dashboard/page.tsx`

## Core Features

### 1. Data Display
- **Trial Videos Table**: Displays a comprehensive list of all trial videos with sortable columns
- **Real-time Count**: Shows total number of trials (`Trial Videos ({count})`)
- **Responsive Design**: Table scrolls horizontally on smaller screens

### 2. Search & Filtering

#### Global Search
- **Location**: Top-left of toolbar, next to date range filter
- **Functionality**: Searches across Student ID, Tutor ID, Student Name, and Tutor Name
- **Placeholder**: "Search by Student ID, Tutor ID, names..."
- **Input Width**: 384px (w-96)

#### Date Range Filter
- **Location**: Next to search bar in toolbar
- **Component**: Custom DateRangePicker with calendar interface
- **Features**:
  - Preset date ranges (Today, Yesterday, Last 7 days, etc.)
  - Calendar selection with dual-month view
  - No default date range applied
  - "Select a date" placeholder when empty

#### Column Filters
- **Filter Types**: Excel-like dropdown filters on specific columns
- **Enabled Columns**:
  - Grade (Grade 3-7 options)
  - Duration (0-20min, 20-40min, 40-60min, 60+ minutes)
  - Region (NAM, ISC, ROW with flag icons)
  - Channel (Performance Meta, Organic Content, BTL, etc.)
  - Trial Version (Legacy, v3.1, v3.2)
  - Annotation Status (Annotated, Not Annotated)
  - Enrolled Status (Yes, No >2w, Not yet <2w)

#### Reset Functionality
- **Reset Button**: Appears when any filters are applied (column filters OR date range)
- **Functionality**: Clears all column filters AND date range filter simultaneously
- **Icon**: Cross icon with "Reset" text

### 3. Table Columns

| Column | Type | Features | Filter |
|--------|------|----------|---------|
| Student Name | Link | Links to admin portal | ❌ |
| Tutor Name | Link | Links to admin portal | ❌ |
| Grade | Text | Shows grade level | ✅ Dropdown |
| Trial Date | Date | IST timezone, no filter | ❌ |
| Duration | Time | MM:SS format | ✅ Range-based |
| Region | Badge | Flag icons + abbreviation | ✅ Dropdown |
| Channel | Badge | Color-coded badges | ✅ Dropdown |
| Trial Version | Badge | Version indicators | ✅ Dropdown |
| Annotation Status | Badge | Annotated/Not Annotated | ✅ Dropdown |
| Enrolled | Badge | Color-coded enrollment status | ✅ Dropdown |
| Annotators | List | Pill badges, no filter | ❌ |
| Actions | Link | "View" button to annotation page | ❌ |

### 4. Enrollment Status Logic
- **Yes** (Green badge): Student successfully enrolled
- **No (>2w since trial)** (Red badge): Student didn't enroll, trial >14 days old
- **Not yet (<2w since trial)** (Yellow badge): Too early to determine, trial <14 days old

#### Data Generation Logic:
```typescript
if (daysSinceTrial > 14) {
  // 50% yes, 25% no, 25% not yet
} else {
  // 30% yes, 70% not yet
}
```

### 5. Navigation & Actions
- **Header**: Video Trial Annotation Tool with theme toggle
- **View Button**: Each row has "View" action linking to `/annotate/{trialId}`
- **External Links**: Student/Tutor names link to admin.leap.cuemath.com

### 6. Table Configuration
```typescript
{
  enableSearch: true,
  enableColumnFilters: true,
  enableRowSelection: false,
  enableColumnVisibility: true,
  enablePagination: true,
  searchPlaceholder: "Search by Student ID, Tutor ID, names...",
  size: 'default'
}
```

### 7. Data Flow
- **Data Source**: `getTrialsWithStatus()` from dummy data
- **Filtering**: Client-side filtering for date range, server-side ready
- **State Management**: React useState for date range and filtered data
- **Real-time Updates**: Filter count updates automatically

### 8. Technical Implementation

#### Components Used:
- `DataTable` - Main table component
- `DateRangePicker` - Custom date range selector
- `ThemeToggle` - Dark/light mode toggle
- Various shadcn/ui components (Badge, Button, etc.)

#### State Management:
```typescript
const [trials] = useState<TrialWithStatus[]>(getTrialsWithStatus());
const [dateRange, setDateRange] = useState<DateRange | null>(null);
const filteredTrials = useMemo(() => { /* filtering logic */ }, [trials, dateRange]);
```

#### Responsive Breakpoints:
- **Mobile**: Single search/filter stack, simplified table
- **Desktop**: Full layout with all columns visible
- **Tablet**: Horizontal scroll for table content

## Future Enhancements
1. **Server-side Filtering**: Move filtering logic to backend for better performance
2. **Export Functionality**: Add CSV/Excel export for filtered results
3. **Bulk Actions**: Select multiple trials for batch operations
4. **Advanced Search**: More granular search options
5. **Real-time Updates**: WebSocket integration for live data updates
6. **Bookmarkable Filters**: URL parameters for shareable filtered views