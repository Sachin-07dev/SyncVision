import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
  BookOpen,
  PenTool,
  Video,
  Users,
  Clock,
  TrendingUp,
  Loader2,
  Plus,
  GraduationCap,
  Calendar,
  BarChart3,
  Presentation,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    Promise.all([
      api.boards.list().catch(() => []),
      api.sessions.list().catch(() => []),
    ]).then(([b, s]) => {
      setBoards(b);
      setSessions(s);
    }).finally(() => setLoading(false));
  }, []);

  const createBoard = async () => {
    if (!newBoardName.trim()) { toast.error('Enter a board name'); return; }
    try {
      const board = await api.boards.create(newBoardName.trim());
      setBoards(prev => [board, ...prev]);
      setNewBoardName('');
      toast.success('Board created!');
    } catch (err: any) { toast.error(err.message); }
  };

  const startLecture = () => navigate(`/room/${uuidv4()}`);

  const lectures = sessions.filter(s => s.type === 'lecture');
  const meetings = sessions.filter(s => s.type === 'meeting');

  const totalStudents = sessions.reduce((sum, s) => sum + (s.participants?.length || 0), 0);
  const teachingHours = Math.round(sessions.reduce((sum, s) => sum + (s.scheduledDuration || 0), 0) / 60 * 10) / 10;

  const stats = [
    { label: 'My Boards', value: boards.length, icon: PenTool, color: 'text-emerald-400 bg-emerald-500/20' },
    { label: 'Lectures Hosted', value: lectures.length, icon: Presentation, color: 'text-blue-400 bg-blue-500/20' },
    { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'text-amber-400 bg-amber-500/20' },
    { label: 'Teaching Hours', value: `${teachingHours}h`, icon: Clock, color: 'text-purple-400 bg-purple-500/20' },
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
            <BookOpen className="w-8 h-8 text-emerald-400" />
            Welcome, {user?.displayName?.split(' ')[0] || 'Teacher'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your classes, boards & lectures
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={startLecture}>
            <Video className="w-4 h-4" /> Start Lecture
          </Button>
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={startLecture}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold">Start Live Lecture</h3>
              <p className="text-xs text-muted-foreground">Launch a real-time class session</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer" onClick={() => navigate('/boards')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Teaching Board</h3>
              <p className="text-xs text-muted-foreground">Create collaborative class material</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => navigate('/schedule')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Schedule</h3>
              <p className="text-xs text-muted-foreground">View & manage your class schedule</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teaching Boards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="New board name..." value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createBoard()} className="max-w-xs" />
            <Button onClick={createBoard} className="gap-1"><Plus className="w-4 h-4" /> Create</Button>
          </div>
          {boards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No boards yet. Create one for your class!</p>
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

      {/* Recent Lectures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Recent Lectures
            <Link to="/lectures"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lectures yet. Start your first live session!</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h3 className="font-medium text-sm">{session.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{session.type} — {session.status}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/room/${session.id}`)}>Open</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
