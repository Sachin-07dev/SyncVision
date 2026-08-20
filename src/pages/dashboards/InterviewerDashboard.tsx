import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  Users,
  PenTool,
  Video,
  Clock,
  Loader2,
  Calendar,
  Code,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const InterviewerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.boards.list().catch(() => []),
      api.sessions.list().catch(() => []),
    ]).then(([b, s]) => {
      setBoards(b);
      setSessions(s);
    }).finally(() => setLoading(false));
  }, []);

  const interviews = sessions.filter(s => s.type === 'interview');
  const active = interviews.filter(s => s.status === 'active');
  const completed = interviews.filter(s => s.status === 'completed');
  const scheduled = interviews.filter(s => s.status === 'scheduled');

  const startInterview = () => navigate(`/room/${uuidv4()}`);

  const stats = [
    { label: 'Scheduled', value: scheduled.length, icon: Calendar, color: 'text-blue-400 bg-blue-500/20' },
    { label: 'In Progress', value: active.length, icon: Video, color: 'text-amber-400 bg-amber-500/20' },
    { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/20' },
    { label: 'Total Interviews', value: interviews.length, icon: ClipboardList, color: 'text-red-400 bg-red-500/20' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-amber-400" />
            Welcome, {user?.displayName?.split(' ')[0] || 'Interviewer'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage interviews, review candidates & track assessments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={startInterview}>
            <Video className="w-4 h-4" /> Start Interview
          </Button>
          <Link to="/interviews">
            <Button className="bg-primary" size="sm">
              <ClipboardList className="w-4 h-4 mr-2" /> All Interviews
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer" onClick={startInterview}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">Start Interview</h3>
              <p className="text-xs text-muted-foreground">Launch a coding interview room</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer" onClick={() => navigate('/whiteboard')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Code className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Code Board</h3>
              <p className="text-xs text-muted-foreground">Prepare a coding challenge board</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer" onClick={() => navigate('/schedule')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold">Flagged Sessions</h3>
              <p className="text-xs text-muted-foreground">Review anti-cheat alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Interview Pipeline
            <Link to="/interviews"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No interviews scheduled. Start one now!</p>
          ) : (
            <div className="space-y-2">
              {interviews.slice(0, 8).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      session.status === 'active' ? 'bg-green-400' :
                      session.status === 'scheduled' ? 'bg-blue-400' :
                      session.status === 'completed' ? 'bg-gray-400' : 'bg-amber-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-sm">{session.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{session.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{session.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/room/${session.id}`)}>
                      {session.status === 'active' ? 'Join' : 'Open'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coding Boards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Boards</CardTitle>
        </CardHeader>
        <CardContent>
          {boards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No boards yet. Prepare a coding challenge!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {boards.slice(0, 6).map((board) => (
                <Card key={board.id} className="border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/whiteboard/${board.id}`)}>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm">{board.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(board.updatedAt || board.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewerDashboard;
