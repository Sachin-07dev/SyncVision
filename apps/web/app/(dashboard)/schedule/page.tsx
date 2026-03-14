'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Plus, Video, GraduationCap, UserCheck, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { MOCK_EVENTS } from '@/data/mockData';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const typeColors: Record<string, string> = {
  meeting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  lecture: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  interview: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};
const typeIcons: Record<string, any> = { meeting: Video, lecture: GraduationCap, interview: UserCheck };

export default function SchedulePage() {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const today = new Date();
  const isToday = (day: number | null) => day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    return MOCK_EVENTS.filter(ev => {
      const d = new Date(ev.startTime);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const upcomingEvents = MOCK_EVENTS.filter(ev => new Date(ev.startTime) >= new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your meetings, lectures, and interviews</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild><Button className="bg-gradient-primary shadow-glow gap-1" size="sm"><Plus className="w-4 h-4" /> New Event</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Schedule Event</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Title</Label><Input placeholder="Event title" /></div>
              <div className="space-y-2"><Label>Type</Label>
                <Select defaultValue="meeting"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
              </div>
              <div className="space-y-2"><Label>Duration (min)</Label>
                <Select defaultValue="60"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Add any notes..." /></div>
              <Button className="w-full bg-gradient-primary" onClick={() => setShowNewDialog(false)}>Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                <h2 className="text-lg font-bold w-40 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={goToday}>Today</Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-border/20 rounded-lg overflow-hidden">
              {days.map((d) => (<div key={d} className="bg-muted/20 text-center text-xs font-medium py-2">{d}</div>))}
              {calendarDays.map((day, i) => {
                const evts = getEventsForDay(day);
                return (
                  <div key={i} className={`min-h-[80px] p-1 bg-card/30 ${day ? '' : 'bg-transparent'} ${isToday(day) ? 'ring-1 ring-primary ring-inset' : ''}`}>
                    {day && (
                      <>
                        <span className={`text-xs font-medium block mb-0.5 ${isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{day}</span>
                        {evts.slice(0, 2).map((ev, ei) => {
                          const Icon = typeIcons[ev.type] || Calendar;
                          return <div key={ei} className={`text-[10px] truncate px-1 py-0.5 rounded mb-0.5 ${typeColors[ev.type]}`}>{ev.title}</div>;
                        })}
                        {evts.length > 2 && <span className="text-[10px] text-muted-foreground">+{evts.length - 2} more</span>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Upcoming Events</h2>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2">
                  {upcomingEvents.map((ev) => {
                    const Icon = typeIcons[ev.type] || Calendar;
                    const dt = new Date(ev.startTime);
                    return (
                      <div key={ev.id} className="flex gap-3 p-2 rounded-lg hover:bg-muted/20 transition-all">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[ev.type]}`}><Icon className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ev.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>{dt.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <span>{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>&bull;</span>
                            <span>{ev.duration}min</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
