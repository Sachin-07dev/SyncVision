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
import { GraduationCap, Plus, Users, Clock, Calendar, Radio, Video, BarChart3 } from 'lucide-react';
import { MOCK_SESSIONS } from '@/data/mockData';

export default function LecturesPage() {
  const [showNewDialog, setShowNewDialog] = useState(false);

  const upcomingLectures = MOCK_SESSIONS.filter(s => s.type === 'lecture' && s.status === 'scheduled');

  const pastLectures = [
    { id: 'lec_past_1', title: 'Data Structures — Trees & Graphs', host: 'Dr. Sarah Chen', attendees: 118, duration: '1h 45m', date: '3 days ago' },
    { id: 'lec_past_2', title: 'Introduction to Machine Learning', host: 'Dr. Sarah Chen', attendees: 234, duration: '2h 10m', date: '1 week ago' },
    { id: 'lec_past_3', title: 'System Design Fundamentals', host: 'Michael Park', attendees: 89, duration: '1h 30m', date: '2 weeks ago' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lectures</h1>
          <p className="text-muted-foreground mt-1">Host and attend large-scale interactive lectures</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild><Button className="bg-gradient-primary shadow-glow gap-1" size="sm"><Plus className="w-4 h-4" /> Create Lecture</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create Lecture</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Lecture Title</Label><Input placeholder="Advanced Algorithms — Lecture 5" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea placeholder="What will this lecture cover?" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
              </div>
              <div className="space-y-2"><Label>Expected Attendees</Label>
                <Select defaultValue="100"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="50">Up to 50</SelectItem><SelectItem value="100">Up to 100</SelectItem><SelectItem value="500">Up to 500</SelectItem><SelectItem value="1000">1000+</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="flex items-center justify-between"><Label>Enable Recording</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Enable Q&A</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>Enable Polls</Label><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><Label>AI Lecture Notes</Label><Switch defaultChecked /></div>
              <Button className="w-full bg-gradient-primary" onClick={() => setShowNewDialog(false)}>Create Lecture</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-emerald-400" /></div><div><p className="text-2xl font-bold">12</p><p className="text-xs text-muted-foreground">Total Lectures</p></div></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-blue-400" /></div><div><p className="text-2xl font-bold">1,247</p><p className="text-xs text-muted-foreground">Total Attendees</p></div></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Clock className="w-5 h-5 text-purple-400" /></div><div><p className="text-2xl font-bold">24.5h</p><p className="text-xs text-muted-foreground">Teaching Hours</p></div></CardContent></Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Lectures</h2>
        <div className="space-y-3">
          {upcomingLectures.map((lecture) => (
            <Card key={lecture.id} className="bg-card/50 border-border/50 hover:border-emerald-500/30 transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><GraduationCap className="w-5 h-5 text-emerald-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lecture.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(lecture.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lecture.scheduledDuration}min</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{lecture.roomConfig.maxParticipants} capacity</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] gap-1"><Radio className="w-3 h-3" /> {lecture.roomConfig.recording ? 'Recording' : 'No Recording'}</Badge>
                  <Link href={`/lecture/${lecture.id}`}><Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">Join</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Past Lectures</h2>
        <div className="space-y-3">
          {pastLectures.map((lecture) => (
            <Card key={lecture.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0"><GraduationCap className="w-5 h-5 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lecture.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{lecture.host}</span><span>&bull;</span><span>{lecture.duration}</span><span>&bull;</span><span>{lecture.attendees} attendees</span><span>&bull;</span><span>{lecture.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs gap-1"><Video className="w-3 h-3" /> Recording</Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1"><BarChart3 className="w-3 h-3" /> Analytics</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
