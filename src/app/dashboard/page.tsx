'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrialsWithStatus, formatDuration, formatDate, dummyReviewers } from '@/lib/dummy-data';
import { TrialWithStatus } from '@/lib/types';
import { Search, Play, ChevronDown, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Dashboard() {
  const [trials] = useState<TrialWithStatus[]>(getTrialsWithStatus());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [trialVersionFilter, setTrialVersionFilter] = useState<string>('all');
  const [annotatorFilter, setAnnotatorFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [durationFilter, setDurationFilter] = useState<string>('all');

  const filteredTrials = useMemo(() => {
    return trials.filter(trial => {
      const matchesSearch =
        trial.trialId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trial.tutorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trial.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trial.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trial.tutorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || trial.annotationStatus === statusFilter;
      const matchesRegion = regionFilter === 'all' || trial.region === regionFilter;
      const matchesGrade = gradeFilter === 'all' || trial.grade === gradeFilter;
      const matchesChannel = channelFilter === 'all' || trial.channel === channelFilter;
      const matchesTrialVersion = trialVersionFilter === 'all' || trial.trialVersion === trialVersionFilter;
      const matchesAnnotator = annotatorFilter === 'all' || trial.annotatorNames.some(name =>
        name.toLowerCase().includes(annotatorFilter.toLowerCase())
      );

      const trialDate = new Date(trial.trialDate);
      const matchesDateRange =
        (!startDate || trialDate >= new Date(startDate)) &&
        (!endDate || trialDate <= new Date(endDate));

      const matchesDuration = durationFilter === 'all' || (
        durationFilter === '0-20' && trial.duration <= 1200 ||
        durationFilter === '20-40' && trial.duration > 1200 && trial.duration <= 2400 ||
        durationFilter === '40-60' && trial.duration > 2400 && trial.duration <= 3600 ||
        durationFilter === '60+' && trial.duration > 3600
      );

      return matchesSearch && matchesStatus && matchesRegion && matchesGrade &&
             matchesChannel && matchesTrialVersion && matchesAnnotator && matchesDateRange && matchesDuration;
    });
  }, [trials, searchTerm, statusFilter, regionFilter, gradeFilter, channelFilter, trialVersionFilter, annotatorFilter, startDate, endDate, durationFilter]);


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Video Trial Annotation Tool</h1>
              <p className="text-muted-foreground mt-1">Manage and annotate trial class videos</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

        {/* Trials Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Trial Videos ({filteredTrials.length})</CardTitle>
                <CardDescription>
                  Click &quot;Annotate&quot; to start reviewing and annotating a trial video
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Student ID, Tutor ID, names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Tutor Name</TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Grade
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setGradeFilter('all')}>
                            All Grades
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setGradeFilter('Grade 3')}>
                            Grade 3
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setGradeFilter('Grade 4')}>
                            Grade 4
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setGradeFilter('Grade 5')}>
                            Grade 5
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setGradeFilter('Grade 6')}>
                            Grade 6
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setGradeFilter('Grade 7')}>
                            Grade 7
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Trial Date
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => { setStartDate(''); setEndDate(''); }}>
                            All Dates
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setStartDate('2024-01-01'); setEndDate('2024-01-31'); }}>
                            January 2024
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStartDate('2024-02-01'); setEndDate('2024-02-29'); }}>
                            February 2024
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStartDate('2024-03-01'); setEndDate('2024-03-31'); }}>
                            March 2024
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Duration
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setDurationFilter('all')}>
                            All Durations
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDurationFilter('0-20')}>
                            0-20 minutes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDurationFilter('20-40')}>
                            20-40 minutes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDurationFilter('40-60')}>
                            40-60 minutes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDurationFilter('60+')}>
                            60+ minutes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Region
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setRegionFilter('all')}>
                            All Regions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setRegionFilter('NAM')}>
                            NAM
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRegionFilter('ISC')}>
                            ISC
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRegionFilter('ROW')}>
                            ROW
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Channel
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setChannelFilter('all')}>
                            All Channels
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setChannelFilter('perf-meta')}>
                            Perf-Meta
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setChannelFilter('organic-content')}>
                            Organic Content
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setChannelFilter('BTL')}>
                            BTL
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setChannelFilter('tutor-referral')}>
                            Tutor Referral
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setChannelFilter('parent-referral')}>
                            Parent Referral
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Trial Version
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setTrialVersionFilter('all')}>
                            All Versions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setTrialVersionFilter('legacy')}>
                            Legacy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTrialVersionFilter('v3.1')}>
                            v3.1
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTrialVersionFilter('v3.2')}>
                            v3.2
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Annotation Status
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                            All Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setStatusFilter('Annotated')}>
                            Annotated
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter('Not Annotated')}>
                            Not Annotated
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Annotators
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setAnnotatorFilter('all')}>
                            All Annotators
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {dummyReviewers.map((reviewer) => (
                            <DropdownMenuItem key={reviewer.reviewerId} onClick={() => setAnnotatorFilter(reviewer.name)}>
                              {reviewer.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrials.map((trial) => (
                    <TableRow key={trial.trialId} className="group">
                      <TableCell className="font-medium">
                        <Link href={`https://admin.leap.cuemath.com/student/${trial.studentId}`} target="_blank">
                          <Button variant="link" className="h-auto p-0 text-black hover:text-gray-700 font-medium cursor-pointer">
                            {trial.studentName}
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`https://admin.leap.cuemath.com/tutor/${trial.tutorId}`} target="_blank">
                          <Button variant="link" className="h-auto p-0 text-black hover:text-gray-700 font-medium cursor-pointer">
                            {trial.tutorName}
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell>{trial.grade}</TableCell>
                      <TableCell>{formatDate(trial.trialDate)}</TableCell>
                      <TableCell>{formatDuration(trial.duration)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {trial.region === 'NAM' ? '🇺🇸' : trial.region === 'ISC' ? '🇮🇳' : '🇦🇪'} {trial.region}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            trial.channel === 'perf-meta' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                            trial.channel === 'organic-content' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            trial.channel === 'BTL' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                            trial.channel === 'tutor-referral' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                            'bg-pink-100 text-pink-800 hover:bg-pink-200'
                          }
                        >
                          {trial.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {trial.trialVersion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {trial.annotationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {trial.annotatorNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {trial.annotatorNames.map((name, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/annotate/${trial.trialId}`}>
                          <Button variant="link" className="h-auto p-0 text-black hover:text-gray-700 font-medium cursor-pointer">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTrials.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No trials found matching your filters.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}