'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Hand, MessageSquare, Users, ThumbsUp, Heart, Laugh, Lightbulb,
  BarChart3, X, ChevronUp, Clock, Disc, Volume2,
} from 'lucide-react';
import { MOCK_LECTURE_POLLS, MOCK_QUESTIONS } from '@/data/mockData';

const lectureChat = [
  { id: '1', name: 'Emily Zhang', msg: 'Great explanation of memoization!', time: '2m ago' },
  { id: '2', name: 'Carlos Rivera', msg: 'Can you show the recursion tree again?', time: '1m ago' },
  { id: '3', name: 'Priya Sharma', msg: 'The tabulation approach is clearer to me', time: '45s ago' },
  { id: '4', name: 'David Kim', msg: '👍', time: '30s ago' },
  { id: '5', name: 'Lisa Wang', msg: 'How does this compare to greedy?', time: '15s ago' },
  { id: '6', name: 'Ahmed Hassan', msg: 'Interesting perspective on space optimization', time: '10s ago' },
];

const reactions = [
  { label: '👍', count: 24 },
  { label: '❤️', count: 12 },
  { label: '😂', count: 5 },
  { label: '💡', count: 31 },
];

export default function LectureRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<'chat' | 'qa' | 'poll' | null>('chat');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [selectedPollOption, setSelectedPollOption] = useState('');

  const attendeeCount = 142;
  const lectureDuration = '01:23:45';

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      <header className="h-12 flex items-center justify-between px-4 bg-card/30 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-primary rounded-lg flex items-center justify-center"><span className="text-[10px] font-bold text-white">E</span></div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Lecture</Badge>
            <span className="text-sm font-semibold">Advanced Algorithms — Dynamic Programming</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs gap-1"><Disc className="w-3 h-3 text-red-400" /> Recording</Badge>
          <Badge variant="outline" className="text-xs gap-1"><Users className="w-3 h-3" /> {attendeeCount}</Badge>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1"><Clock className="w-3 h-3" /> {lectureDuration}</span>
          <Button variant="destructive" size="sm" onClick={() => router.push('/dashboard')} className="text-xs">Leave</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-[#0d0d15]">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-6">
                <Avatar className="w-24 h-24 mx-auto"><AvatarFallback className="bg-primary/20 text-primary text-3xl">SC</AvatarFallback></Avatar>
                <div><h2 className="text-xl font-bold">Dr. Sarah Chen</h2><p className="text-sm text-muted-foreground">Presenting: Dynamic Programming Patterns</p></div>
                <div className="max-w-2xl mx-auto bg-card/30 rounded-xl p-6 border border-border/30 text-left">
                  <h3 className="text-lg font-semibold mb-4 text-primary">DP Approach: Fibonacci</h3>
                  <pre className="text-sm font-mono text-foreground/80 bg-[#1e1e2e] rounded-lg p-4">
{`// Top-Down (Memoization)
function fib(n: number, memo = {}): number {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fib(n-1, memo) + fib(n-2, memo);
  return memo[n];
}

// Bottom-Up (Tabulation)
function fibTab(n: number): number {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  return dp[n];
}`}
                  </pre>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5">
              <Volume2 className="w-4 h-4 text-green-400" /><div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-green-400 rounded-full" /></div>
            </div>
          </div>

          <div className="h-16 flex items-center justify-center gap-3 px-4 bg-card/30 border-t border-border/30">
            <div className="flex items-center gap-1">
              {reactions.map((r, i) => <Button key={i} variant="outline" size="sm" className="rounded-full h-9 px-3 text-xs gap-1">{r.label} <span className="text-muted-foreground">{r.count}</span></Button>)}
            </div>
            <div className="w-px h-8 bg-border/30 mx-2" />
            <Button variant={isHandRaised ? 'default' : 'outline'} size="sm" className={`rounded-full h-9 gap-1 ${isHandRaised ? 'bg-amber-500 hover:bg-amber-600' : ''}`} onClick={() => setIsHandRaised(!isHandRaised)}><Hand className="w-4 h-4" /> {isHandRaised ? 'Lower Hand' : 'Raise Hand'}</Button>
            <div className="w-px h-8 bg-border/30 mx-2" />
            <Button variant={activePanel === 'chat' ? 'default' : 'outline'} size="sm" className={`rounded-full h-9 gap-1 ${activePanel === 'chat' ? 'bg-primary/20 text-primary' : ''}`} onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}><MessageSquare className="w-4 h-4" /> Chat</Button>
            <Button variant={activePanel === 'qa' ? 'default' : 'outline'} size="sm" className={`rounded-full h-9 gap-1 ${activePanel === 'qa' ? 'bg-primary/20 text-primary' : ''}`} onClick={() => setActivePanel(activePanel === 'qa' ? null : 'qa')}><Lightbulb className="w-4 h-4" /> Q&A <Badge className="bg-primary text-[10px] px-1.5 py-0 h-4">{MOCK_QUESTIONS.filter(q => !q.isAnswered).length}</Badge></Button>
            <Button variant={activePanel === 'poll' ? 'default' : 'outline'} size="sm" className={`rounded-full h-9 gap-1 ${activePanel === 'poll' ? 'bg-primary/20 text-primary' : ''}`} onClick={() => setActivePanel(activePanel === 'poll' ? null : 'poll')}><BarChart3 className="w-4 h-4" /> Polls</Button>
          </div>
        </div>

        {activePanel && (
          <div className="w-80 border-l border-border/30 bg-card/10 flex flex-col">
            {activePanel === 'chat' && (
              <>
                <div className="h-12 flex items-center justify-between px-4 border-b border-border/30">
                  <h2 className="text-sm font-semibold">Live Chat</h2>
                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">Slow Mode: 2s</Badge><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActivePanel(null)}><X className="w-4 h-4" /></Button></div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {lectureChat.map((msg) => (
                      <div key={msg.id} className="space-y-0.5"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-primary">{msg.name}</span><span className="text-[10px] text-muted-foreground">{msg.time}</span></div><p className="text-sm">{msg.msg}</p></div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/30"><div className="flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Send a message..." className="flex-1 h-9 px-3 rounded-lg bg-muted/30 border border-border/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" /><Button size="icon" className="h-9 w-9 bg-primary"><MessageSquare className="w-4 h-4" /></Button></div></div>
              </>
            )}

            {activePanel === 'qa' && (
              <>
                <div className="h-12 flex items-center justify-between px-4 border-b border-border/30"><h2 className="text-sm font-semibold">Questions ({MOCK_QUESTIONS.length})</h2><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActivePanel(null)}><X className="w-4 h-4" /></Button></div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {MOCK_QUESTIONS.sort((a, b) => b.upvotes - a.upvotes).map((q) => (
                      <Card key={q.id} className={`bg-muted/10 border-border/30 ${q.isAnswered ? 'opacity-60' : ''}`}>
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center gap-0.5"><Button variant="ghost" size="icon" className="h-6 w-6"><ChevronUp className="w-4 h-4" /></Button><span className="text-xs font-bold">{q.upvotes}</span></div>
                            <div className="flex-1"><p className="text-sm">{q.text}</p><div className="flex items-center gap-2 mt-2"><span className="text-[10px] text-muted-foreground">{q.userName}</span>{q.isAnswered && <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Answered</Badge>}</div></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/30"><input type="text" placeholder="Ask a question..." className="w-full h-9 px-3 rounded-lg bg-muted/30 border border-border/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" /></div>
              </>
            )}

            {activePanel === 'poll' && (
              <>
                <div className="h-12 flex items-center justify-between px-4 border-b border-border/30"><h2 className="text-sm font-semibold">Active Poll</h2><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActivePanel(null)}><X className="w-4 h-4" /></Button></div>
                <ScrollArea className="flex-1 p-4">
                  {MOCK_LECTURE_POLLS.map((poll) => (
                    <div key={poll.id} className="space-y-4">
                      <h3 className="text-sm font-semibold">{poll.question}</h3>
                      {poll.status === 'closed' ? (
                        <div className="space-y-3">
                          {poll.options.map((opt) => (<div key={opt.id} className="space-y-1"><div className="flex justify-between text-xs"><span>{opt.text}</span><span className="text-muted-foreground">{opt.percentage}%</span></div><Progress value={opt.percentage} className="h-2" /></div>))}
                          <p className="text-xs text-muted-foreground text-center mt-4">{poll.totalVotes} votes &bull; Poll closed</p>
                        </div>
                      ) : (
                        <RadioGroup value={selectedPollOption} onValueChange={setSelectedPollOption}>
                          {poll.options.map((opt) => (<div key={opt.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/20"><RadioGroupItem value={opt.id} id={opt.id} /><Label htmlFor={opt.id} className="text-sm cursor-pointer flex-1">{opt.text}</Label></div>))}
                          <Button size="sm" className="w-full mt-2 bg-gradient-primary">Submit Vote</Button>
                        </RadioGroup>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
