import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import {
  GraduationCap,
  PenTool,
  Video,
  Brain,
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Loader2,
  ExternalLink,
  Calendar,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(() => {
    const saved = localStorage.getItem('SyncVision_daily_target');
    return saved ? JSON.parse(saved) : { hours: 2 };
  });
  const [targetInput, setTargetInput] = useState(dailyTarget);
  const [studiedToday, setStudiedToday] = useState(() => {
    const saved = localStorage.getItem('SyncVision_studied_today');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toDateString()) return parsed.hours;
    }
    return 0;
  });
  const [hoursInput, setHoursInput] = useState(studiedToday);

  useEffect(() => {
    Promise.all([
      api.boards.list().catch(() => []),
      api.sessions.list().catch(() => []),
    ]).then(([b, s]) => {
      setBoards(b);
      setSessions(s);
    }).finally(() => setLoading(false));
  }, []);

  const upcomingLectures = sessions.filter(s => s.type === 'lecture' && s.status !== 'completed');
  const upcomingInterviews = sessions.filter(s => s.type === 'interview' && s.status !== 'completed');

  const targetProgress = Math.min(100, Math.round((studiedToday / Math.max(dailyTarget.hours, 0.5)) * 100));

  const saveTarget = () => {
    setDailyTarget(targetInput);
    localStorage.setItem('SyncVision_daily_target', JSON.stringify(targetInput));
    toast.success('Daily target updated!');
    setShowTargetDialog(false);
  };

  const logStudyHours = () => {
    setStudiedToday(hoursInput);
    localStorage.setItem('SyncVision_studied_today', JSON.stringify({ date: new Date().toDateString(), hours: hoursInput }));
    toast.success('Study hours logged!');
  };

  const stats = [
    { label: 'My Boards', value: boards.length, icon: PenTool, color: 'text-blue-400 bg-blue-500/20' },
    { label: 'Upcoming Lectures', value: upcomingLectures.length, icon: GraduationCap, color: 'text-emerald-400 bg-emerald-500/20' },
    { label: 'Upcoming Interviews', value: upcomingInterviews.length, icon: Users, color: 'text-amber-400 bg-amber-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-400" />
            Welcome, {user?.displayName?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your learning hub — boards, lectures & study tools
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/ai-tutor">
            <Button variant="outline" size="sm" className="gap-1">
              <Brain className="w-4 h-4" /> AI Tutor
            </Button>
          </Link>
          <Link to="/whiteboard">
            <Button className="bg-primary" size="sm">
              <PenTool className="w-4 h-4 mr-2" /> New Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}

        {/* Daily Target Card */}
        <Card
          className="bg-card/50 border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer"
          onClick={() => { setTargetInput(dailyTarget); setHoursInput(studiedToday); setShowTargetDialog(true); }}
        >
          <CardContent className="p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-purple-400 bg-purple-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-2xl font-bold">{studiedToday}h</p>
              <p className="text-sm text-muted-foreground">/ {dailyTarget.hours}h</p>
              {targetProgress >= 100 && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            </div>
            <Progress value={targetProgress} className="h-1.5 mb-1" />
            <p className="text-xs text-muted-foreground">Daily Target</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer" onClick={() => navigate('/lectures')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Join Lecture</h3>
              <p className="text-xs text-muted-foreground">Browse upcoming lectures</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={() => navigate('/whiteboard')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold">Study Board</h3>
              <p className="text-xs text-muted-foreground">Open a whiteboard to study</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => navigate('/ai-tutor')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Tutor</h3>
              <p className="text-xs text-muted-foreground">Get help with your studies</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Boards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            My Study Boards
            <Link to="/boards"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {boards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No boards yet. Create one to start studying!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {boards.slice(0, 6).map((board) => (
                <Card key={board.id} className="border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/whiteboard/${board.id}`)}>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm">{board.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Upcoming Sessions
            <Link to="/schedule"><Button variant="ghost" size="sm">View Schedule</Button></Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions. Check back later!</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      session.type === 'lecture' ? 'bg-blue-500/20 text-blue-400' :
                      session.type === 'interview' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {session.type === 'lecture' ? <BookOpen className="w-4 h-4" /> :
                       session.type === 'interview' ? <Users className="w-4 h-4" /> :
                       <Video className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{session.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{session.type} — {session.status}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/room/${session.id}`)}>
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Target Dialog */}
      <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" /> Set Your Daily Target
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <p className="text-sm text-muted-foreground">
              Set a daily study hours goal and track your progress.
            </p>

            {/* Today's Progress */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="text-sm font-semibold">Today's Progress</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hours studied</span>
                <span className="font-medium">{studiedToday}h / {dailyTarget.hours}h</span>
              </div>
              <Progress value={targetProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {targetProgress >= 100 ? '🎉 Target complete! Great job!' : `${targetProgress}% complete`}
              </p>
            </div>

            {/* Log Hours */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Log Study Hours</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={hoursInput}
                  onChange={(e) => setHoursInput(Number(e.target.value) || 0)}
                  placeholder="Hours studied today"
                />
                <Button variant="outline" onClick={logStudyHours}>Log</Button>
              </div>
            </div>

            {/* Set Target */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Set Daily Target</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={targetInput.hours}
                  onChange={(e) => setTargetInput({ hours: Number(e.target.value) || 1 })}
                  placeholder="Target hours per day"
                />
                <Button className="bg-gradient-primary" onClick={saveTarget}>Save</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
