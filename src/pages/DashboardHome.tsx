import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
  Plus,
  Video,
  PenTool,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([
        api.boards.list().catch(() => []),
        api.sessions.list().catch(() => []),
      ]);
      setBoards(b);
      setSessions(s);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) {
      toast.error('Enter a board name');
      return;
    }
    try {
      const board = await api.boards.create(newBoardName.trim());
      setBoards(prev => [board, ...prev]);
      setNewBoardName('');
      toast.success('Board created!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      await api.boards.delete(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      toast.success('Board deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const startMeeting = () => {
    const roomId = uuidv4();
    navigate(`/room/${roomId}`);
  };

  const createSession = async () => {
    if (!newSessionTitle.trim()) {
      toast.error('Enter a session title');
      return;
    }
    try {
      const session = await api.sessions.create({
        type: 'meeting',
        title: newSessionTitle.trim(),
        startTime: new Date().toISOString(),
      });
      setSessions(prev => [session, ...prev]);
      setNewSessionTitle('');
      toast.success('Session created!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {user?.displayName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your boards, meetings, and sessions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startMeeting} className="gap-1">
              <Video className="w-4 h-4" /> Quick Meeting
            </Button>
            <Link to="/whiteboard">
              <Button className="bg-primary" size="sm">
                <PenTool className="w-4 h-4 mr-2" /> New Board
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Create Board */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Boards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="New board name..."
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createBoard()}
                    className="max-w-xs"
                  />
                  <Button onClick={createBoard} className="gap-1">
                    <Plus className="w-4 h-4" /> Create
                  </Button>
                </div>

                {boards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No boards yet. Create your first one!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {boards.map((board) => (
                      <Card key={board.id} className="border">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-sm">{board.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => navigate(`/room/${board.id}`)}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => deleteBoard(board.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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
              <CardHeader>
                <CardTitle className="text-lg">Sessions & Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="New session title..."
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createSession()}
                    className="max-w-xs"
                  />
                  <Button onClick={createSession} variant="outline" className="gap-1">
                    <Plus className="w-4 h-4" /> Create Session
                  </Button>
                </div>

                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sessions yet. Start a quick meeting or create a scheduled session.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <h3 className="font-medium text-sm">{session.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {session.type} — {session.status}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/room/${session.id}`)}
                        >
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
