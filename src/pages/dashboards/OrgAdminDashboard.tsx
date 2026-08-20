import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  Shield,
  Users,
  BarChart3,
  Activity,
  Monitor,
  Clock,
  Loader2,
  Settings,
  UserPlus,
  AlertTriangle,
} from 'lucide-react';

const OrgAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.sessions.list().catch(() => []),
      api.boards.list().catch(() => []),
    ]).then(([s, b]) => { setSessions(s); setBoards(b); }).finally(() => setLoading(false));
  }, []);

  const activeSessions = sessions.filter(s => s.status === 'active');
  const meetings = sessions.filter(s => s.type === 'meeting');
  const totalParticipants = sessions.reduce((sum, s) => sum + (s.participants?.length || 0), 0);
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.scheduledDuration || 0), 0) / sessions.length)
    : 0;

  const stats = [
    { label: 'Total Sessions', value: sessions.length, icon: Monitor, color: 'text-blue-400 bg-blue-500/20' },
    { label: 'Active Now', value: activeSessions.length, icon: Activity, color: 'text-green-400 bg-green-500/20' },
    { label: 'Total Meetings', value: meetings.length, icon: Users, color: 'text-purple-400 bg-purple-500/20' },
    { label: 'Boards', value: boards.length, icon: Monitor, color: 'text-orange-400 bg-orange-500/20' },
    { label: 'Participants', value: totalParticipants, icon: UserPlus, color: 'text-cyan-400 bg-cyan-500/20' },
    { label: 'Avg. Duration', value: `${avgDuration}m`, icon: Clock, color: 'text-pink-400 bg-pink-500/20' },
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
            <Shield className="w-8 h-8 text-purple-400" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform overview, user management & system health
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-1">
              <BarChart3 className="w-4 h-4" /> Analytics
            </Button>
          </Link>
          <Link to="/settings">
            <Button className="bg-primary" size="sm">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Sessions & Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" /> Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions yet.</p>
              ) : (
                sessions.slice(0, 5).map((s, i) => (
                  <div key={s.id || i} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{s.type} — {s.status}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] capitalize ${
                      s.status === 'active' ? 'text-green-400 border-green-500/30' :
                      s.status === 'scheduled' ? 'text-blue-400 border-blue-500/30' :
                      'text-muted-foreground border-border'
                    }`}>{s.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5" /> Recent Boards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {boards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No boards yet.</p>
              ) : (
                boards.slice(0, 5).map((b, i) => (
                  <div key={b.id || i} className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/whiteboard/${b.id}`)}>
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(b.updatedAt || b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{b.type || 'whiteboard'}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => navigate('/admin')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Full Analytics</h3>
              <p className="text-xs text-muted-foreground">Deep-dive into platform metrics</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Platform Settings</h3>
              <p className="text-xs text-muted-foreground">Configure org-wide settings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer" onClick={() => navigate('/admin')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold">Flagged Sessions</h3>
              <p className="text-xs text-muted-foreground">Review security alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;
