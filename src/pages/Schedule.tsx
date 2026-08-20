import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  MoreVertical,
  XCircle,
  CalendarClock,
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
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [postponeTarget, setPostponeTarget] = useState<any>(null);
  const [newStartTime, setNewStartTime] = useState('');

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

  const cancelEvent = async () => {
    if (!cancelTarget) return;
    try {
      await api.sessions.updateStatus(cancelTarget.id, 'cancelled');
      setEvents((prev) => prev.map((e) => e.id === cancelTarget.id ? { ...e, status: 'cancelled' } : e));
      toast.success(`${cancelTarget.type === 'lecture' ? 'Lecture' : cancelTarget.type === 'meeting' ? 'Meeting' : 'Session'} cancelled`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setCancelTarget(null);
    }
  };

  const postponeEvent = async () => {
    if (!postponeTarget || !newStartTime) return;
    try {
      const updated = await api.sessions.update(postponeTarget.id, { startTime: new Date(newStartTime).toISOString() });
      setEvents((prev) => prev.map((e) => e.id === postponeTarget.id ? { ...e, startTime: updated.startTime } : e));
      toast.success('Session postponed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to postpone');
    } finally {
      setPostponeTarget(null);
      setNewStartTime('');
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
                      <div key={event.id} className="flex items-start gap-3">
                        <button onClick={() => navigate(`/room/${event.id}`)} className="flex items-start gap-3 flex-1 text-left min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor(event.type)}`}>
                            {typeIcon(event.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium truncate ${event.status === 'cancelled' ? 'line-through opacity-60' : ''}`}>{event.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.participants?.length || 0}</span>
                            </div>
                          </div>
                        </button>
                        {event.status !== 'cancelled' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setPostponeTarget(event); setNewStartTime(''); }}>
                                <CalendarClock className="w-4 h-4 mr-2" /> Postpone
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setCancelTarget(event)}>
                                <XCircle className="w-4 h-4 mr-2" /> Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {event.status === 'cancelled' && (
                          <Badge variant="destructive" className="text-[9px] flex-shrink-0">Cancelled</Badge>
                        )}
                      </div>
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

        {/* Cancel Confirmation */}
        <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel <strong>{cancelTarget?.title}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Session</AlertDialogCancel>
              <AlertDialogAction onClick={cancelEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Cancel Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Postpone Dialog */}
        <Dialog open={!!postponeTarget} onOpenChange={(open) => { if (!open) { setPostponeTarget(null); setNewStartTime(''); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Postpone Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Reschedule <strong>{postponeTarget?.title}</strong> to a new time.</p>
              <div className="space-y-2">
                <Label>New Start Time</Label>
                <Input type="datetime-local" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
              </div>
              <Button className="w-full bg-gradient-primary" disabled={!newStartTime} onClick={postponeEvent}>
                Confirm Postpone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
