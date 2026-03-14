import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  GraduationCap,
  Users,
  Code2,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Schedule = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.sessions.list();
        setEvents(data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      if (!event.startTime) return false;
      const eventDate = new Date(event.startTime);
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Video className="w-3 h-3" />;
      case 'interview': return <Code2 className="w-3 h-3" />;
      case 'lecture': return <GraduationCap className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'text-blue-400 bg-blue-500/20';
      case 'interview': return 'text-orange-400 bg-orange-500/20';
      case 'lecture': return 'text-emerald-400 bg-emerald-500/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const upcomingEvents = useMemo(
    () => events
      .filter((e) => e.startTime && new Date(e.startTime) >= today)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6),
    [events]
  );

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-24 border border-border/20 bg-card/20 rounded-lg" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    cells.push(
      <div
        key={day}
        className={`h-24 border rounded-lg p-1.5 transition-colors ${
          isToday(day)
            ? 'border-primary/50 bg-primary/5'
            : 'border-border/20 bg-card/30 hover:bg-card/50'
        }`}
      >
        <div className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
          {day}
        </div>
        <div className="space-y-0.5">
          {dayEvents.slice(0, 2).map((event) => (
            <button
              key={event.id}
              onClick={() => navigate(`/room/${event.id}`)}
              className={`w-full text-[10px] px-1 py-0.5 rounded flex items-center gap-1 truncate text-left ${typeColor(event.type)}`}
            >
              {typeIcon(event.type)}
              <span className="truncate">{event.title}</span>
            </button>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming sessions</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{MONTHS[month]} {year}</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
                      <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAYS.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">{cells}</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Upcoming</h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <button key={event.id} onClick={() => navigate(`/room/${event.id}`)} className="w-full text-left flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor(event.type)}`}>
                          {typeIcon(event.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.participants?.length || 0}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">{event.type}</Badge>
                      </button>
                    ))}
                    {upcomingEvents.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
