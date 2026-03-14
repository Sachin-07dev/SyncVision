import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Video,
  Users,
  GraduationCap,
  PenTool,
  Clock,
  TrendingUp,
  Cpu,
  HardDrive,
  Plus,
  ArrowRight,
  Calendar,
  Code,
  Presentation,
} from 'lucide-react';
import { MOCK_STATS, MOCK_SESSIONS, MOCK_BOARDS, MOCK_ACTIVITY } from '@/data/mockData';

const boardTypeIcon: Record<string, React.ReactNode> = {
  whiteboard: <PenTool className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  diagram: <TrendingUp className="w-4 h-4" />,
  presentation: <Presentation className="w-4 h-4" />,
};

const sessionTypeColor: Record<string, string> = {
  meeting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  interview: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  lecture: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const sessionTypeIcon: Record<string, React.ReactNode> = {
  meeting: <Video className="w-4 h-4" />,
  interview: <Users className="w-4 h-4" />,
  lecture: <GraduationCap className="w-4 h-4" />,
};

function formatRelativeTime(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff > 0) {
    if (minutes < 60) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h`;
    return `in ${days}d`;
  } else {
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

const DashboardHome = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Boards', value: MOCK_STATS.totalBoards, icon: PenTool, color: 'text-purple-400' },
    { label: 'Meetings', value: MOCK_STATS.totalMeetings, icon: Video, color: 'text-blue-400' },
    { label: 'Interviews', value: MOCK_STATS.totalInterviews, icon: Users, color: 'text-amber-400' },
    { label: 'Collaborators', value: MOCK_STATS.collaborators, icon: Users, color: 'text-emerald-400' },
    { label: 'Hours This Week', value: MOCK_STATS.hoursThisWeek, icon: Clock, color: 'text-cyan-400' },
    { label: 'AI Credits Used', value: MOCK_STATS.aiCreditsUsed.toLocaleString(), icon: Cpu, color: 'text-pink-400' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.displayName?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening across your workspace today.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/meetings">
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" /> New Meeting
              </Button>
            </Link>
            <Link to="/boards">
              <Button className="bg-gradient-primary shadow-glow" size="sm">
                <Plus className="w-4 h-4 mr-2" /> New Board
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                <Link to="/schedule">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_SESSIONS.map((session) => (
                  <Link
                    key={session.id}
                    to={`/${session.type === 'meeting' ? 'meeting' : session.type === 'interview' ? 'interview' : 'lecture'}/${session.id}`}
                  >
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sessionTypeColor[session.type]}`}>
                        {sessionTypeIcon[session.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {session.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{session.hostName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {session.scheduledDuration}min
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`text-[10px] ${sessionTypeColor[session.type]}`}>
                          {session.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(session.startTime)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_ACTIVITY.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                      {item.actorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Boards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Boards</h2>
            <Link to="/boards">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_BOARDS.slice(0, 6).map((board) => (
              <Link key={board.id} to={`/whiteboard/${board.id}`}>
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all hover:shadow-glow group cursor-pointer">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-t-lg flex items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {boardTypeIcon[board.type] || <PenTool className="w-5 h-5 text-primary" />}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {board.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-[10px] capitalize">{board.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          v{board.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {board.collaborators.length} collaborator{board.collaborators.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
