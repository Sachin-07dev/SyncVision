import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  PenTool,
  BookOpen,
  Users,
  Clock,
  ChevronRight,
  CalendarDays,
  Inbox,
  ArrowUpRight,
} from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  type: 'meeting' | 'lecture' | 'interview' | 'board';
  status?: string;
  date: string;
  duration?: string;
  participants?: number;
}

interface ActivityHistoryProps {
  sessions: any[];
  boards: any[];
  tabs?: ('all' | 'meetings' | 'lectures' | 'interviews' | 'boards')[];
}

const typeConfig = {
  meeting: {
    icon: Video,
    color: 'text-emerald-500',
    bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20',
    label: 'Meeting',
    pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  lecture: {
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20',
    label: 'Lecture',
    pill: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
  },
  interview: {
    icon: Users,
    color: 'text-amber-500',
    bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20',
    label: 'Interview',
    pill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  },
  board: {
    icon: PenTool,
    color: 'text-violet-500',
    bg: 'bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20',
    label: 'Board',
    pill: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25',
  },
};

const statusConfig: Record<string, string> = {
  completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  paused: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
};

function buildHistoryItems(sessions: any[], boards: any[]): HistoryItem[] {
  const items: HistoryItem[] = [];

  for (const s of sessions) {
    items.push({
      id: s.id,
      title: s.title || 'Untitled Session',
      type: s.type as HistoryItem['type'],
      status: s.status,
      date: s.endTime || s.startTime || s.createdAt || s.created_at || '',
      duration: s.scheduledDuration ? `${s.scheduledDuration}m` : undefined,
      participants: s.participants?.length,
    });
  }

  for (const b of boards) {
    items.push({
      id: b.id,
      title: b.name || 'Untitled Board',
      type: 'board',
      date: b.updatedAt || b.createdAt || b.updated_at || b.created_at || '',
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const tabIcons: Record<string, any> = {
  all: Inbox,
  meetings: Video,
  lectures: BookOpen,
  interviews: Users,
  boards: PenTool,
};

const tabLabels: Record<string, string> = {
  all: 'All',
  meetings: 'Meetings',
  lectures: 'Lectures',
  interviews: 'Interviews',
  boards: 'Boards',
};

const EmptyState = ({ tab }: { tab: string }) => {
  const Icon = tabIcons[tab] || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-base font-semibold text-muted-foreground mb-1">
        No {tab === 'all' ? 'activity' : tabLabels[tab]?.toLowerCase()} yet
      </h3>
      <p className="text-sm text-muted-foreground/70 max-w-xs">
        {tab === 'all'
          ? 'Your activity timeline will appear here as you use boards, join meetings, and attend sessions.'
          : `When you create or join ${tabLabels[tab]?.toLowerCase()}, they'll show up here.`}
      </p>
    </div>
  );
};

const ActivityHistory = ({ sessions, boards, tabs }: ActivityHistoryProps) => {
  const navigate = useNavigate();
  const allItems = buildHistoryItems(sessions, boards);

  const defaultTabs: ActivityHistoryProps['tabs'] = ['all', 'meetings', 'lectures', 'interviews', 'boards'];
  const visibleTabs = tabs || defaultTabs;

  const filterItems = (tab: string) => {
    if (tab === 'all') return allItems;
    if (tab === 'meetings') return allItems.filter(i => i.type === 'meeting');
    if (tab === 'lectures') return allItems.filter(i => i.type === 'lecture');
    if (tab === 'interviews') return allItems.filter(i => i.type === 'interview');
    if (tab === 'boards') return allItems.filter(i => i.type === 'board');
    return allItems;
  };

  const handleClick = (item: HistoryItem) => {
    if (item.type === 'board') navigate(`/whiteboard/${item.id}`);
    else navigate(`/room/${item.id}`);
  };

  const renderList = (items: HistoryItem[], tab: string) => {
    if (items.length === 0) return <EmptyState tab={tab} />;

    return (
      <div className="space-y-2">
        {items.map((item) => {
          const cfg = typeConfig[item.type];
          const Icon = cfg.icon;
          return (
            <div
              key={`${item.type}-${item.id}`}
              className="group relative flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-accent/50 hover:border-primary/25 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleClick(item)}
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <Icon className={`w-5 h-5 ${cfg.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-[18px] rounded-full border ${cfg.pill}`}>
                    {cfg.label}
                  </Badge>
                  {item.status && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-[18px] rounded-full border capitalize ${statusConfig[item.status] || 'text-muted-foreground'}`}>
                      {item.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {formatFullDate(item.date)}
                  </span>
                  {item.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.duration}
                    </span>
                  )}
                  {item.participants != null && item.participants > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {item.participants} joined
                    </span>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-muted-foreground/80 hidden sm:block">{formatDate(item.date)}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/40 group-hover:bg-primary/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full justify-start bg-muted/40 border border-border/50 rounded-xl p-1 h-auto flex-wrap gap-1">
        {visibleTabs.map((tab) => {
          const Icon = tabIcons[tab];
          const count = filterItems(tab).length;
          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm gap-2 transition-all"
            >
              <Icon className="w-4 h-4" />
              <span>{tabLabels[tab]}</span>
              <span className="ml-0.5 text-[10px] font-bold bg-muted/60 data-[state=active]:bg-primary/10 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {visibleTabs.map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-4">
          {renderList(filterItems(tab), tab)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ActivityHistory;
