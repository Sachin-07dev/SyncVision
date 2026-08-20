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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Video,
  Plus,
  Users,
  Clock,
  Calendar,
  Loader2,
  Link2,
  MoreVertical,
  XCircle,
  CalendarClock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Meetings = () => {
  const navigate = useNavigate();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinLink, setJoinLink] = useState('');
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

  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [postponeTarget, setPostponeTarget] = useState<any>(null);
  const [newStartTime, setNewStartTime] = useState('');

  const cancelMeeting = async () => {
    if (!cancelTarget) return;
    try {
      await api.sessions.updateStatus(cancelTarget.id, 'cancelled');
      setSessions((prev) => prev.map((s) => s.id === cancelTarget.id ? { ...s, status: 'cancelled' } : s));
      toast.success('Meeting cancelled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel meeting');
    } finally {
      setCancelTarget(null);
    }
  };

  const postponeMeeting = async () => {
    if (!postponeTarget || !newStartTime) return;
    try {
      const updated = await api.sessions.update(postponeTarget.id, { startTime: new Date(newStartTime).toISOString() });
      setSessions((prev) => prev.map((s) => s.id === postponeTarget.id ? { ...s, startTime: updated.startTime } : s));
      toast.success('Meeting postponed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to postpone meeting');
    } finally {
      setPostponeTarget(null);
      setNewStartTime('');
    }
  };

  const upcomingMeetings = sessions.filter((s) => s.status === 'scheduled');
  const activeMeetings = sessions.filter((s) => s.status === 'active');
  const cancelledMeetings = sessions.filter((s) => s.status === 'cancelled');

  const handleJoinByLink = () => {
    const trimmed = joinLink.trim();
    if (!trimmed) {
      toast.error('Please paste a meeting link or room ID');
      return;
    }
    // Extract room ID from a full URL or use the raw value as an ID
    let roomId = trimmed;
    try {
      const url = new URL(trimmed);
      const segments = url.pathname.split('/').filter(Boolean);
      const roomIdx = segments.indexOf('room');
      if (roomIdx !== -1 && segments[roomIdx + 1]) {
        roomId = segments[roomIdx + 1];
      } else if (segments.length > 0) {
        roomId = segments[segments.length - 1];
      }
    } catch {
      // Not a URL — treat as raw room ID
    }
    setShowJoinDialog(false);
    setJoinLink('');
    navigate(`/room/${encodeURIComponent(roomId)}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground mt-1">Start, schedule, and manage video meetings</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Link2 className="w-4 h-4" /> Join by Link
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Join a Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Meeting Link or Room ID</Label>
                    <Input
                      value={joinLink}
                      onChange={(e) => setJoinLink(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinByLink()}
                      placeholder="https://...  or paste a room ID"
                    />
                  </div>
                  <Button className="w-full bg-gradient-primary" onClick={handleJoinByLink}>
                    Join Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setPostponeTarget(meeting); setNewStartTime(''); }}>
                              <CalendarClock className="w-4 h-4 mr-2" /> Postpone
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setCancelTarget(meeting)}>
                              <XCircle className="w-4 h-4 mr-2" /> Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            {cancelledMeetings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Cancelled</h2>
                <div className="space-y-3">
                  {cancelledMeetings.map((meeting) => (
                    <Card key={meeting.id} className="bg-card/50 border-border/50 opacity-60">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate line-through">{meeting.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{meeting.startTime ? new Date(meeting.startTime).toLocaleDateString() : 'Not set'}</span>
                          </div>
                        </div>
                        <Badge variant="destructive">Cancelled</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Cancel Confirmation */}
        <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel <strong>{cancelTarget?.title}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
              <AlertDialogAction onClick={cancelMeeting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Cancel Meeting
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Postpone Dialog */}
        <Dialog open={!!postponeTarget} onOpenChange={(open) => { if (!open) { setPostponeTarget(null); setNewStartTime(''); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Postpone Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Reschedule <strong>{postponeTarget?.title}</strong> to a new time.</p>
              <div className="space-y-2">
                <Label>New Start Time</Label>
                <Input type="datetime-local" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
              </div>
              <Button className="w-full bg-gradient-primary" disabled={!newStartTime} onClick={postponeMeeting}>
                Confirm Postpone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Meetings;
