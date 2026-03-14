'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Clock, Calendar, Shield, FileText } from 'lucide-react';
import { MOCK_SESSIONS } from '@/data/mockData';

export default function InterviewsPage() {
  const [showNewDialog, setShowNewDialog] = useState(false);

  const upcomingInterviews = MOCK_SESSIONS.filter(s => s.type === 'interview' && s.status === 'scheduled');

  const pastInterviews = [
    { id: 'int_past_1', title: 'Backend Engineer — John Doe', candidate: 'John Doe', status: 'reviewed', score: 8, suspicion: 2, date: '2 days ago', duration: '72 min' },
    { id: 'int_past_2', title: 'Full-Stack — Emily Chen', candidate: 'Emily Chen', status: 'completed', score: 0, suspicion: 0, date: '4 days ago', duration: '85 min' },
    { id: 'int_past_3', title: 'DevOps — Carlos Rivera', candidate: 'Carlos Rivera', status: 'archived', score: 4, suspicion: 12, date: '1 week ago', duration: '60 min' },
  ];

  const getSuspicionBadge = (score: number) => {
    if (score <= 5) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Clean</Badge>;
    if (score <= 15) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Mild</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">Flagged</Badge>;
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground mt-1">Conduct secure, AI-assisted technical interviews</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild><Button className="bg-gradient-primary shadow-glow gap-1" size="sm"><Plus className="w-4 h-4" /> Schedule Interview</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Candidate Name</Label><Input placeholder="Jane Smith" /></div>
              <div className="space-y-2"><Label>Candidate Email</Label><Input type="email" placeholder="jane@example.com" /></div>
              <div className="space-y-2"><Label>Position</Label><Input placeholder="Senior Frontend Engineer" /></div>
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select defaultValue="one_on_one"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="one_on_one">1-on-1</SelectItem><SelectItem value="panel">Panel (Multi-Interviewer)</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Duration</Label>
                  <Select defaultValue="90"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="45">45 min</SelectItem><SelectItem value="60">60 min</SelectItem><SelectItem value="90">90 min</SelectItem><SelectItem value="120">120 min</SelectItem>
                  </SelectContent></Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Problem Statement (Optional)</Label><Textarea placeholder="Describe the coding problem..." /></div>
              <div className="flex items-center justify-between"><Label>Anti-Cheat Monitoring</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>AI Interview Assist</Label><Switch defaultChecked /></div>
              <Button className="w-full bg-gradient-primary" onClick={() => setShowNewDialog(false)}>Create Interview</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Secure Interview Environment</p>
            <p className="text-xs text-muted-foreground mt-1">Interviews include tab monitoring, paste detection, webcam enforcement, and AI-powered insights. Anti-cheat scores are advisory and visible only to interviewers.</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Interviews</h2>
        {upcomingInterviews.length === 0 ? (
          <Card className="bg-card/50 border-border/50"><CardContent className="p-8 text-center text-muted-foreground">No upcoming interviews scheduled.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <Card key={interview.id} className="bg-card/50 border-border/50 hover:border-amber-500/30 transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-amber-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{interview.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(interview.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{interview.scheduledDuration}min</span>
                    </div>
                  </div>
                  <Link href={`/interview/${interview.id}`}><Button size="sm" className="bg-amber-500 hover:bg-amber-600">Start</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Past Interviews</h2>
        <div className="space-y-3">
          {pastInterviews.map((interview) => (
            <Card key={interview.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{interview.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{interview.candidate}</span><span>&bull;</span><span>{interview.duration}</span><span>&bull;</span><span>{interview.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSuspicionBadge(interview.suspicion)}
                  <Badge variant="outline" className="text-[10px] capitalize">{interview.status}</Badge>
                  <Button variant="ghost" size="sm" className="text-xs gap-1"><FileText className="w-3 h-3" /> Report</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
