import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import ActivityHistory from '@/components/ActivityHistory';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  Loader2,
  History,
  Video,
  BookOpen,
  Users,
  PenTool,
} from 'lucide-react';

const HistoryPage = () => {
  const { user } = useAuth();
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

  const roleTabs = (): ('all' | 'meetings' | 'lectures' | 'interviews' | 'boards')[] => {
    switch (user?.role) {
      case 'student':
      case 'interviewee':
        return ['all', 'lectures', 'meetings', 'boards'];
      case 'teacher':
        return ['all', 'lectures', 'meetings', 'interviews', 'boards'];
      case 'interviewer':
        return ['all', 'interviews', 'meetings', 'boards'];
      case 'other':
        return ['all', 'meetings', 'boards'];
      default:
        return ['all', 'meetings', 'lectures', 'interviews', 'boards'];
    }
  };

  const meetingCount = sessions.filter(s => s.type === 'meeting').length;
  const lectureCount = sessions.filter(s => s.type === 'lecture').length;
  const interviewCount = sessions.filter(s => s.type === 'interview').length;

  const summaryStats = [
    { label: 'Meetings', value: meetingCount, icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Lectures', value: lectureCount, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Interviews', value: interviewCount, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Boards', value: boards.length, icon: PenTool, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Activity History</h1>
            <p className="text-muted-foreground mt-0.5">
              Track all your past meetings, lectures, interviews & boards in one place.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your activity...</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {summaryStats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                        <Icon className={`w-5 h-5 ${s.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold leading-none">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Activity Timeline */}
            <ActivityHistory sessions={sessions} boards={boards} tabs={roleTabs()} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
