'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Plus, Users, Clock, Calendar, ArrowRight, Copy } from 'lucide-react';
import { MOCK_SESSIONS } from '@/data/mockData';

export default function MeetingsPage() {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');

  const upcomingMeetings = MOCK_SESSIONS.filter(s => s.type === 'meeting' && s.status === 'scheduled');

  const pastMeetings = [
    { id: 'mtg_past_1', title: 'Weekly Team Sync', host: 'Dr. Sarah Chen', duration: '45 min', participants: 6, date: '2 days ago' },
    { id: 'mtg_past_2', title: 'Design Review — V1.5', host: 'Alex Johnson', duration: '32 min', participants: 4, date: '3 days ago' },
    { id: 'mtg_past_3', title: 'Client Onboarding', host: 'Michael Park', duration: '58 min', participants: 8, date: '5 days ago' },
    { id: 'mtg_past_4', title: 'Engineering Standup', host: 'Dr. Sarah Chen', duration: '15 min', participants: 12, date: '1 week ago' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground mt-1">Start, schedule, and manage video meetings</p>
        </div>
        <div className="flex gap-2">
          <Link href="/meeting/instant"><Button variant="outline" size="sm" className="gap-1"><Video className="w-4 h-4" /> Instant Meeting</Button></Link>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild><Button className="bg-gradient-primary shadow-glow gap-1" size="sm"><Plus className="w-4 h-4" /> Schedule Meeting</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Schedule a Meeting</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2"><Label>Title</Label><Input value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} placeholder="Team standup, design review..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
                  <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select defaultValue="60"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem><SelectItem value="120">2 hours</SelectItem>
                  </SelectContent></Select>
                </div>
                <div className="flex items-center justify-between"><Label>Enable Waiting Room</Label><Switch /></div>
                <div className="flex items-center justify-between"><Label>Record Meeting</Label><Switch /></div>
                <Button className="w-full bg-gradient-primary" onClick={() => setShowNewDialog(false)}>Create Meeting</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 flex items-center gap-4">
          <Input placeholder="Enter meeting ID or link..." className="flex-1" />
          <Button className="bg-gradient-primary gap-1"><ArrowRight className="w-4 h-4" /> Join</Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming</h2>
        {upcomingMeetings.length === 0 ? (
          <Card className="bg-card/50 border-border/50"><CardContent className="p-8 text-center text-muted-foreground">No upcoming meetings. Schedule one to get started.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0"><Video className="w-5 h-5 text-blue-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{meeting.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(meeting.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{meeting.roomConfig.maxParticipants} max</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="w-4 h-4" /></Button>
                    <Link href={`/meeting/${meeting.id}`}><Button size="sm" className="bg-gradient-primary">Join</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent</h2>
        <div className="space-y-3">
          {pastMeetings.map((meeting) => (
            <Card key={meeting.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0"><Video className="w-5 h-5 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{meeting.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{meeting.host}</span><span>&bull;</span><span>{meeting.duration}</span><span>&bull;</span><span>{meeting.participants} participants</span><span>&bull;</span><span>{meeting.date}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">Completed</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
