import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Users,
  BarChart3,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  UserPlus,
  Clock,
  Monitor,
  Search,
  ChevronRight,
  BanIcon,
} from 'lucide-react';

const AdminDashboard = () => {
  const platformStats = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: <Users className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/20' },
    { label: 'Active Sessions', value: '156', change: '+8%', icon: <Activity className="w-5 h-5" />, color: 'text-green-400 bg-green-500/20' },
    { label: 'Total Meetings', value: '8,432', change: '+23%', icon: <Monitor className="w-5 h-5" />, color: 'text-purple-400 bg-purple-500/20' },
    { label: 'Flagged Sessions', value: '7', change: '-2', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-orange-400 bg-orange-500/20' },
    { label: 'New This Week', value: '124', change: '+18%', icon: <UserPlus className="w-5 h-5" />, color: 'text-cyan-400 bg-cyan-500/20' },
    { label: 'Avg. Session', value: '42m', change: '+5m', icon: <Clock className="w-5 h-5" />, color: 'text-pink-400 bg-pink-500/20' },
  ];

  const recentUsers = [
    { name: 'Sarah Johnson', email: 'sarah@company.com', role: 'teacher', status: 'active', joined: '2 hours ago' },
    { name: 'James Wilson', email: 'james@university.edu', role: 'student', status: 'active', joined: '5 hours ago' },
    { name: 'Emily Davis', email: 'emily@school.org', role: 'teacher', status: 'pending', joined: '1 day ago' },
    { name: 'Mark Thompson', email: 'mark@tech.io', role: 'interviewer', status: 'active', joined: '2 days ago' },
    { name: 'Lisa Chen', email: 'lisa@startup.com', role: 'student', status: 'suspended', joined: '3 days ago' },
  ];

  const flaggedSessions = [
    { id: 'int_flag_1', type: 'interview', candidate: 'User #4521', reason: 'Tab switching detected (8 times)', severity: 'high', time: '25 min ago' },
    { id: 'int_flag_2', type: 'interview', candidate: 'User #3892', reason: 'Clipboard paste detected', severity: 'medium', time: '1 hour ago' },
    { id: 'int_flag_3', type: 'interview', candidate: 'User #7234', reason: 'Multiple faces detected', severity: 'high', time: '3 hours ago' },
    { id: 'int_flag_4', type: 'meeting', candidate: 'Room #156', reason: 'Unusual recording activity', severity: 'low', time: '5 hours ago' },
  ];

  const systemHealth = [
    { service: 'WebRTC Signaling', status: 'operational', uptime: '99.98%' },
    { service: 'Media Server', status: 'operational', uptime: '99.95%' },
    { service: 'AI Processing', status: 'operational', uptime: '99.87%' },
    { service: 'Database', status: 'operational', uptime: '99.99%' },
    { service: 'Storage CDN', status: 'degraded', uptime: '98.50%' },
    { service: 'Auth Service', status: 'operational', uptime: '99.99%' },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': case 'operational': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending': case 'degraded': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'suspended': case 'outage': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-muted-foreground bg-muted/20 border-border/30';
    }
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/20';
      case 'low': return 'text-yellow-400 bg-yellow-500/20';
      default: return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and management</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">System Healthy</Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {platformStats.map((stat, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                <p className="text-[10px] mt-1 text-green-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="users" className="gap-1"><Users className="w-3 h-3" /> Users</TabsTrigger>
            <TabsTrigger value="security" className="gap-1"><Shield className="w-3 h-3" /> Security</TabsTrigger>
            <TabsTrigger value="system" className="gap-1"><Monitor className="w-3 h-3" /> System</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="w-3 h-3" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Users */}
          <TabsContent value="users">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search users..." className="pl-9 w-64 h-8 text-sm" />
                    </div>
                    <Button size="sm" className="gap-1"><UserPlus className="w-3 h-3" /> Add User</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{u.role}</Badge>
                      <Badge className={`text-[10px] capitalize ${statusColor(u.status)}`}>{u.status}</Badge>
                      <p className="text-xs text-muted-foreground w-20">{u.joined}</p>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Flagged Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flaggedSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/10 border border-border/30">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${severityColor(session.severity)}`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{session.reason}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="capitalize">{session.type}</span>
                          <span>•</span>
                          <span>{session.candidate}</span>
                          <span>•</span>
                          <span>{session.time}</span>
                        </div>
                      </div>
                      <Badge className={`text-[10px] capitalize ${severityColor(session.severity)}`}>{session.severity}</Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs">Review</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive">
                          <BanIcon className="w-3 h-3" /> Ban
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System */}
          <TabsContent value="system">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemHealth.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          s.status === 'operational' ? 'bg-green-400' : s.status === 'degraded' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400 animate-pulse'
                        }`} />
                        <p className="text-sm font-medium">{s.service}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xs text-muted-foreground">{s.uptime} uptime</p>
                        <Badge className={`text-[10px] capitalize ${statusColor(s.status)}`}>{s.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Meetings', count: 342, percent: 85 },
                      { label: 'Interviews', count: 156, percent: 62 },
                      { label: 'Lectures', count: 98, percent: 45 },
                      { label: 'Board Sessions', count: 521, percent: 92 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="text-muted-foreground">{item.count} this week</span>
                        </div>
                        <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary rounded-full transition-all"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Top Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'TechCorp University', users: 456, sessions: 1234 },
                      { name: 'Global Academy', users: 312, sessions: 987 },
                      { name: 'StartupHub Inc.', users: 189, sessions: 654 },
                      { name: 'Education First', users: 234, sessions: 567 },
                      { name: 'DevSchool Pro', users: 145, sessions: 432 },
                    ].map((org, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{org.name}</p>
                            <p className="text-[11px] text-muted-foreground">{org.users} users</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{org.sessions} sessions</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
