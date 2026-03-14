'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic, MicOff, Camera, CameraOff, Phone, Play, Brain, Shield,
  Clock, AlertTriangle, MessageSquare, FileText, Eye, CheckCircle, Timer,
} from 'lucide-react';
import { MOCK_INTERVIEW } from '@/data/mockData';

const scoreSeverity = (score: number) => {
  if (score <= 5) return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Normal' };
  if (score <= 15) return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Mild' };
  return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Suspicious' };
};

const signalLabels: Record<string, string> = {
  tab_switch: 'Tab Switch', window_blur: 'Window Blur', large_paste: 'Large Paste',
  camera_off: 'Camera Off', devtools_open: 'DevTools Opened', typing_anomaly: 'Typing Anomaly',
};

const codeContent = `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]`;

export default function InterviewRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState('ai');
  const [noteInput, setNoteInput] = useState('');
  const [timeRemaining] = useState(54 * 60 + 23);

  const interview = MOCK_INTERVIEW;
  const severity = scoreSeverity(interview.suspicionScore);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      <header className="h-12 flex items-center justify-between px-4 bg-card/30 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-primary rounded-lg flex items-center justify-center"><span className="text-[10px] font-bold text-white">E</span></div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Interview</Badge>
            <span className="text-sm font-semibold">{interview.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${severity.bg} border border-current/20`}>
            <Shield className={`w-3.5 h-3.5 ${severity.color}`} />
            <span className={`text-xs font-semibold ${severity.color}`}>Score: {interview.suspicionScore} — {severity.label}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30">
            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
          <Button variant="destructive" size="sm" onClick={() => router.push('/dashboard')}>
            <Phone className="w-4 h-4 mr-1 rotate-[135deg]" /> End
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video */}
        <div className="w-64 border-r border-border/30 flex flex-col bg-card/10">
          <div className="p-2">
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 aspect-video border border-border/30">
              <div className="w-full h-full flex items-center justify-center"><Avatar className="w-12 h-12"><AvatarFallback className="bg-primary/20 text-primary text-sm">MP</AvatarFallback></Avatar></div>
              <div className="absolute bottom-1 left-2 text-[10px] font-medium text-white/80">You (Interviewer)</div>
            </div>
          </div>
          <div className="p-2 pt-0">
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-muted/20 to-muted/10 aspect-video border border-border/30">
              <div className="w-full h-full flex items-center justify-center"><Avatar className="w-12 h-12"><AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm">JS</AvatarFallback></Avatar></div>
              <div className="absolute bottom-1 left-2 text-[10px] font-medium text-white/80">{interview.candidateName}</div>
              <div className="absolute top-2 left-2"><div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" /></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 py-3 border-t border-border/30">
            <Button variant={isMicOn ? 'outline' : 'destructive'} size="icon" className="rounded-full w-10 h-10" onClick={() => setIsMicOn(!isMicOn)}>{isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}</Button>
            <Button variant={isCamOn ? 'outline' : 'destructive'} size="icon" className="rounded-full w-10 h-10" onClick={() => setIsCamOn(!isCamOn)}>{isCamOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}</Button>
          </div>
          <div className="flex-1 border-t border-border/30 overflow-hidden">
            <div className="p-3"><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> Proctoring Log</h3></div>
            <ScrollArea className="h-40 px-3">
              <div className="space-y-2">
                {interview.antiCheatSignals.map((signal) => (
                  <div key={signal.id} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{signalLabels[signal.type]}</span>
                      <p className="text-muted-foreground">{new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                {interview.timeline.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-2 text-xs">
                    <Clock className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-muted-foreground">{evt.description}</span>
                      <p className="text-muted-foreground/70">{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Center: Code Board */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border/30 p-3 bg-card/20">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px]">Medium</Badge>
              <h2 className="text-sm font-semibold">Two Sum</h2>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
          </div>
          <div className="flex-1 relative bg-[#1e1e2e]">
            <div className="absolute inset-0 p-4 font-mono text-sm overflow-auto">
              <pre className="text-[13px] leading-6">
                {codeContent.split('\n').map((line, i) => (
                  <div key={i} className="flex"><span className="w-8 text-right pr-4 text-muted-foreground/40 select-none text-xs">{i + 1}</span><span className="text-foreground/90">{line}</span></div>
                ))}
              </pre>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-emerald-500/20 rounded-full px-2 py-0.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /><span className="text-[10px] text-emerald-400">Jane</span></div>
              <div className="flex items-center gap-1 bg-primary/20 rounded-full px-2 py-0.5"><div className="w-1.5 h-1.5 bg-primary rounded-full" /><span className="text-[10px] text-primary">You</span></div>
            </div>
          </div>
          <div className="h-32 border-t border-border/30 bg-[#0d0d15]">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Output</span>
              <Button size="sm" variant="ghost" className="h-6 text-xs gap-1"><Play className="w-3 h-3" /> Run</Button>
            </div>
            <div className="p-3 font-mono text-xs text-green-400">
              <div>$ ts-node solution.ts</div><div className="mt-1">[0, 1]</div><div>[1, 2]</div>
              <div className="mt-1 text-muted-foreground">✓ All test cases passed (2/2)</div>
            </div>
          </div>
        </div>

        {/* Right: AI Panel */}
        <div className="w-80 border-l border-border/30 bg-card/10 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b border-border/30 bg-transparent h-10">
              <TabsTrigger value="ai" className="text-xs gap-1 flex-1"><Brain className="w-3 h-3" /> AI Assist</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs gap-1 flex-1"><FileText className="w-3 h-3" /> Notes</TabsTrigger>
              <TabsTrigger value="chat" className="text-xs gap-1 flex-1"><MessageSquare className="w-3 h-3" /> Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Visible only to interviewer</div>
                  {interview.aiInsights?.map((insight) => (
                    <Card key={insight.id} className="bg-muted/20 border-border/30">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{insight.type.replace(/_/g, ' ')}</Badge>
                          <span className="text-[10px] text-muted-foreground">{Math.round(insight.confidence * 100)}% confidence</span>
                        </div>
                        <p className="text-xs leading-relaxed">{insight.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h4>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2"><Brain className="w-3 h-3" /> Generate follow-up questions</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2"><CheckCircle className="w-3 h-3" /> Analyze code quality</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2"><FileText className="w-3 h-3" /> Generate summary</Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 m-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {interview.notes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted/20 rounded-lg border border-border/30">
                      <p className="text-xs">{note.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{note.isPrivate && ' • Private'}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-border/30">
                <Textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add a private note..." className="text-xs min-h-[60px] bg-muted/20 border-border/30 resize-none" />
                <Button size="sm" className="w-full mt-2 bg-gradient-primary text-xs">Save Note</Button>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 m-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1"><div className="p-4 space-y-3"><div className="text-center text-xs text-muted-foreground">Chat messages will appear here</div></div></ScrollArea>
              <div className="p-3 border-t border-border/30">
                <div className="flex gap-2">
                  <input type="text" placeholder="Message candidate..." className="flex-1 h-8 px-3 rounded-lg bg-muted/30 border border-border/30 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  <Button size="icon" className="h-8 w-8 bg-primary"><MessageSquare className="w-3 h-3" /></Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
