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
import { GraduationCap, Plus, Users, Clock, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Lectures = () => {
  const navigate = useNavigate();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLectures = async () => {
    setLoading(true);
    try {
      const data = await api.sessions.list('lecture');
      setSessions(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, []);

  const createLecture = async () => {
    if (!title.trim()) {
      toast.error('Enter lecture title');
      return;
    }
    try {
      const lecture = await api.sessions.create({
        type: 'lecture',
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        scheduledDuration: duration,
      });
      setSessions((prev) => [lecture, ...prev]);
      setShowNewDialog(false);
      setTitle('');
      setDescription('');
      setStartTime('');
      setDuration(60);
      toast.success('Lecture created');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lecture');
    }
  };

  const upcoming = sessions.filter((s) => s.status === 'scheduled');

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Lectures</h1>
            <p className="text-muted-foreground mt-1">Host and attend large-scale interactive lectures</p>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow gap-1" size="sm">
                <Plus className="w-4 h-4" /> Create Lecture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Lecture</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Lecture Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="System Design 101" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Lecture notes" />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" min={30} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 60)} />
                </div>
                <Button className="w-full bg-gradient-primary" onClick={createLecture}>Create Lecture</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sessions.length}</p>
                    <p className="text-xs text-muted-foreground">Total Lectures</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sessions.reduce((sum, s) => sum + (s.participants?.length || 0), 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Participants</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sessions.reduce((sum, s) => sum + (s.scheduledDuration || 0), 0)}m</p>
                    <p className="text-xs text-muted-foreground">Planned Duration</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Lectures</h2>
              {upcoming.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No upcoming lectures.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((lecture) => (
                    <Card key={lecture.id} className="bg-card/50 border-border/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{lecture.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{lecture.startTime ? new Date(lecture.startTime).toLocaleDateString() : 'Not set'}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lecture.scheduledDuration || 60} min</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">{lecture.status}</Badge>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => navigate(`/room/${lecture.id}`)}>Join</Button>
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

export default Lectures;
