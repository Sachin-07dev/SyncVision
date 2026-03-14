import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Clock, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Interviews = () => {
  const navigate = useNavigate();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(90);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const data = await api.sessions.list('interview');
      setSessions(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const createInterview = async () => {
    if (!title.trim()) {
      toast.error('Enter interview title');
      return;
    }
    try {
      const session = await api.sessions.create({
        type: 'interview',
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        scheduledDuration: duration,
      });
      setSessions((prev) => [session, ...prev]);
      setShowNewDialog(false);
      setTitle('');
      setDescription('');
      setStartTime('');
      setDuration(90);
      toast.success('Interview scheduled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create interview');
    }
  };

  const upcoming = sessions.filter((s) => s.status === 'scheduled');
  const past = sessions.filter((s) => s.status !== 'scheduled');

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Interviews</h1>
            <p className="text-muted-foreground mt-1">Conduct secure, AI-assisted technical interviews</p>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow gap-1" size="sm">
                <Plus className="w-4 h-4" /> Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backend Engineer - Candidate" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Interview notes or scope" />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" min={30} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 90)} />
                </div>
                <Button className="w-full bg-gradient-primary" onClick={createInterview}>Create Interview</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Interviews</h2>
              {upcoming.length === 0 ? (
                <Card><CardContent className="p-6 text-muted-foreground">No upcoming interviews.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((interview) => (
                    <Card key={interview.id} className="bg-card/50 border-border/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{interview.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{interview.startTime ? new Date(interview.startTime).toLocaleDateString() : 'Not set'}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{interview.scheduledDuration || 90} min</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => navigate(`/room/${interview.id}`)}>Join</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Past Interviews</h2>
              {past.length === 0 ? (
                <Card><CardContent className="p-6 text-muted-foreground">No past interviews yet.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {past.map((interview) => (
                    <Card key={interview.id} className="bg-card/50 border-border/50">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{interview.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{interview.status}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{interview.status}</Badge>
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

export default Interviews;
