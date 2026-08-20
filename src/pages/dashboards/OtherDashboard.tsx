import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
  Sparkles,
  PenTool,
  Video,
  Brain,
  Clock,
  Users,
  Loader2,
  Plus,
  Calendar,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const OtherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');

  useEffect(() => {
    Promise.all([
      api.boards.list().catch(() => []),
      api.sessions.list().catch(() => []),
    ]).then(([b, s]) => {
      setBoards(b);
      setSessions(s);
    }).finally(() => setLoading(false));
  }, []);

  const roleName = user?.customRoleName || 'Explorer';

  const createBoard = async () => {
    if (!newBoardName.trim()) { toast.error('Enter a board name'); return; }
    try {
      const board = await api.boards.create(newBoardName.trim());
      setBoards(prev => [board, ...prev]);
      setNewBoardName('');
      toast.success('Board created!');
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteBoard = async (id: string) => {
    try {
      await api.boards.delete(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      toast.success('Board deleted');
    } catch (err: any) { toast.error(err.message); }
  };

  const startMeeting = () => navigate(`/room/${uuidv4()}`);

  const createSession = async () => {
    if (!newSessionTitle.trim()) { toast.error('Enter a session title'); return; }
    try {
      const session = await api.sessions.create({ type: 'meeting', title: newSessionTitle.trim(), startTime: new Date().toISOString() });
      setSessions(prev => [session, ...prev]);
      setNewSessionTitle('');
      toast.success('Session created!');
    } catch (err: any) { toast.error(err.message); }
  };

  const stats = [
    { label: 'My Boards', value: boards.length, icon: PenTool, color: 'text-indigo-400 bg-indigo-500/20' },
    { label: 'Sessions', value: sessions.length, icon: Video, color: 'text-teal-400 bg-teal-500/20' },
    { label: 'Upcoming', value: sessions.filter(s => s.status === 'scheduled').length, icon: Users, color: 'text-amber-400 bg-amber-500/20' },
    { label: 'Completed', value: sessions.filter(s => s.status === 'completed').length, icon: Clock, color: 'text-pink-400 bg-pink-500/20' },
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
            <Sparkles className="w-8 h-8 text-indigo-400" />
            Welcome, {user?.displayName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your workspace as <Badge variant="outline" className="ml-1 capitalize">{roleName}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={startMeeting}>
            <Video className="w-4 h-4" /> Quick Meeting
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
        <Card className="border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-pointer" onClick={() => navigate('/whiteboard')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold">Whiteboard</h3>
              <p className="text-xs text-muted-foreground">Open a blank canvas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-teal-500/20 hover:border-teal-500/40 transition-colors cursor-pointer" onClick={startMeeting}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold">Start Meeting</h3>
              <p className="text-xs text-muted-foreground">Video call with collaborators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => navigate('/ai-tutor')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Get AI-powered help</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boards */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Your Boards</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="New board name..." value={newBoardName} onChange={e => setNewBoardName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createBoard()} className="max-w-xs" />
            <Button onClick={createBoard} className="gap-1"><Plus className="w-4 h-4" /> Create</Button>
          </div>
          {boards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No boards yet. Create your first one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {boards.map(board => (
                <Card key={board.id} className="border">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-sm">{board.name}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(board.updatedAt || board.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/whiteboard/${board.id}`)}><ExternalLink className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBoard(board.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Sessions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="New session title..." value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && createSession()} className="max-w-xs" />
            <Button onClick={createSession} variant="outline" className="gap-1"><Plus className="w-4 h-4" /> Create Session</Button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h3 className="font-medium text-sm">{session.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{session.type} — {session.status}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/room/${session.id}`)}>Join</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default OtherDashboard;
