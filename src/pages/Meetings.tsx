import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Video,
  Plus,
  Users,
  Clock,
  Calendar,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Meetings = () => {
  const navigate = useNavigate();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await api.sessions.list('meeting');
      setSessions(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const createMeeting = async () => {
    if (!title.trim()) {
      toast.error('Enter a meeting title');
      return;
    }
    try {
      const meeting = await api.sessions.create({
        type: 'meeting',
        title: title.trim(),
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        scheduledDuration: duration,
      });
      setSessions((prev) => [meeting, ...prev]);
      setShowNewDialog(false);
      setTitle('');
      setStartTime('');
      setDuration(60);
      toast.success('Meeting scheduled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create meeting');
    }
  };

  const upcomingMeetings = sessions.filter((s) => s.status === 'scheduled');
  const activeMeetings = sessions.filter((s) => s.status === 'active');

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground mt-1">Start, schedule, and manage video meetings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/room/${crypto.randomUUID()}`)}>
              <Video className="w-4 h-4" /> Instant Meeting
            </Button>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary shadow-glow gap-1" size="sm">
                  <Plus className="w-4 h-4" /> Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule a Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Team standup" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" min={15} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 60)} />
                  </div>
                  <Button className="w-full bg-gradient-primary" onClick={createMeeting}>
                    Create Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold mb-4">Active</h2>
              {activeMeetings.length === 0 ? (
                <Card><CardContent className="p-6 text-muted-foreground">No active meetings.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {activeMeetings.map((meeting) => (
                    <Card key={meeting.id} className="bg-card/50 border-border/50">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{meeting.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">Hosted by {meeting.hostName || 'You'}</p>
                        </div>
                        <Button size="sm" onClick={() => navigate(`/room/${meeting.id}`)}>Join</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming</h2>
              {upcomingMeetings.length === 0 ? (
                <Card><CardContent className="p-6 text-muted-foreground">No upcoming meetings.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="bg-card/50 border-border/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{meeting.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{meeting.startTime ? new Date(meeting.startTime).toLocaleDateString() : 'Not set'}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.scheduledDuration || 60} min</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{meeting.participants?.length || 0}</span>
                          </div>
                        </div>
                        <Badge variant="outline">{meeting.status}</Badge>
                        <Button size="sm" className="bg-gradient-primary" onClick={() => navigate(`/room/${meeting.id}`)}>Join</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Meetings;
