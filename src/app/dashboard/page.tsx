'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrialsWithStatus, formatDuration, formatDate } from '@/lib/dummy-data';
import { TrialWithStatus } from '@/lib/types';
import { Search, Play, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Dashboard() {
  const [trials] = useState<TrialWithStatus[]>(getTrialsWithStatus());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const filteredTrials = useMemo(() => {
    return trials.filter(trial => {
      const matchesSearch =
        trial.trialId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trial.tutorId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || trial.annotationStatus === statusFilter;
      const matchesRegion = regionFilter === 'all' || trial.region === regionFilter;
      const matchesGrade = gradeFilter === 'all' || trial.grade === gradeFilter;
      const matchesChannel = channelFilter === 'all' || trial.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesRegion && matchesGrade && matchesChannel;
    });
  }, [trials, searchTerm, statusFilter, regionFilter, gradeFilter, channelFilter]);


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
                  placeholder="Search by Trial ID or Tutor ID..."
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
                    <TableHead>Trial ID</TableHead>
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
                    <TableHead>Trial Date</TableHead>
                    <TableHead>Tutor ID</TableHead>
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
                    <TableHead>Duration</TableHead>
                    <TableHead>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent">
                            Status
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
                    <TableHead>Annotators</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrials.map((trial) => (
                    <TableRow key={trial.trialId}>
                      <TableCell className="font-medium">{trial.trialId}</TableCell>
                      <TableCell>{trial.grade}</TableCell>
                      <TableCell>{formatDate(trial.trialDate)}</TableCell>
                      <TableCell>{trial.tutorId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{trial.region}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{trial.channel}</Badge>
                      </TableCell>
                      <TableCell>{formatDuration(trial.duration)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={trial.annotationStatus === 'Annotated' ? 'default' : 'destructive'}
                        >
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
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(trial.lastModified)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/annotate/${trial.trialId}`}>
                          <Button size="sm" className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Annotate
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