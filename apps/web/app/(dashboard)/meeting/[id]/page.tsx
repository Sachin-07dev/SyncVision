'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff, Phone,
  MessageSquare, Users, PenTool, MoreVertical, Hand, SmilePlus,
  Maximize, Grid3X3, Copy, Disc,
} from 'lucide-react';
import { MOCK_CHAT } from '@/data/mockData';

const participants = [
  { id: '1', name: 'Dr. Sarah Chen', isSpeaking: true, isMuted: false, isVideoOn: true, role: 'host' },
  { id: '2', name: 'Alex Johnson', isSpeaking: false, isMuted: false, isVideoOn: true, role: 'participant' },
  { id: '3', name: 'Michael Park', isSpeaking: false, isMuted: true, isVideoOn: true, role: 'co-host' },
  { id: '4', name: 'Emily Zhang', isSpeaking: false, isMuted: false, isVideoOn: false, role: 'participant' },
];

export default function MeetingRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 bg-card/30 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center"><span className="text-xs font-bold text-white">E</span></div>
          <div>
            <h1 className="text-sm font-semibold">Product Sprint Planning</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Meeting ID: {id || 'mtg_001'}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5"><Copy className="w-3 h-3" /></Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRecording && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />Recording</Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1"><Users className="w-3 h-3" /> {participants.length}</Badge>
          <span className="text-xs text-muted-foreground font-mono">00:34:12</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            {viewMode === 'grid' ? (
              <div className="h-full grid grid-cols-2 gap-3">
                {participants.map((p) => (
                  <div key={p.id} className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border ${p.isSpeaking ? 'border-primary/50 shadow-glow' : 'border-border/30'}`}>
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                      <Avatar className="w-20 h-20"><AvatarFallback className={`${p.isVideoOn ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'} text-2xl`}>{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{p.name}</span>
                          {p.role === 'host' && <Badge className="text-[10px] bg-primary/30 text-primary border-0 py-0 h-4">Host</Badge>}
                        </div>
                        {p.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>
                    {p.isSpeaking && <div className="absolute top-3 left-3"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /></div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col gap-3">
                <div className="flex-1 rounded-xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border border-primary/30 shadow-glow relative">
                  <div className="w-full h-full flex items-center justify-center"><Avatar className="w-32 h-32"><AvatarFallback className="bg-primary/20 text-primary text-4xl">SC</AvatarFallback></Avatar></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent"><span className="text-sm font-medium">Dr. Sarah Chen</span></div>
                </div>
                <div className="flex gap-2 h-24">
                  {participants.slice(1).map((p) => (
                    <div key={p.id} className="flex-1 rounded-lg overflow-hidden bg-muted/20 border border-border/30 flex items-center justify-center">
                      <Avatar className="w-10 h-10"><AvatarFallback className="text-xs">{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="h-20 flex items-center justify-center gap-3 px-4 bg-card/30 border-t border-border/30">
            <Button variant={isMicOn ? 'outline' : 'destructive'} size="icon" className="rounded-full w-12 h-12" onClick={() => setIsMicOn(!isMicOn)}>{isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}</Button>
            <Button variant={isCamOn ? 'outline' : 'destructive'} size="icon" className="rounded-full w-12 h-12" onClick={() => setIsCamOn(!isCamOn)}>{isCamOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}</Button>
            <Button variant={isScreenSharing ? 'default' : 'outline'} size="icon" className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-primary' : ''}`} onClick={() => setIsScreenSharing(!isScreenSharing)}>{isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}</Button>
            <Separator orientation="vertical" className="h-8 mx-1" />
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12" onClick={() => setIsRecording(!isRecording)}><Disc className={`w-5 h-5 ${isRecording ? 'text-red-500' : ''}`} /></Button>
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12"><PenTool className="w-5 h-5" /></Button>
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12"><Hand className="w-5 h-5" /></Button>
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12"><SmilePlus className="w-5 h-5" /></Button>
            <Separator orientation="vertical" className="h-8 mx-1" />
            <Button variant={showChat ? 'default' : 'outline'} size="icon" className={`rounded-full w-12 h-12 ${showChat ? 'bg-primary/20 text-primary' : ''}`} onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}><MessageSquare className="w-5 h-5" /></Button>
            <Button variant={showParticipants ? 'default' : 'outline'} size="icon" className={`rounded-full w-12 h-12 ${showParticipants ? 'bg-primary/20 text-primary' : ''}`} onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}><Users className="w-5 h-5" /></Button>
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12" onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}>{viewMode === 'grid' ? <Maximize className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}</Button>
            <Separator orientation="vertical" className="h-8 mx-1" />
            <Button variant="destructive" size="icon" className="rounded-full w-12 h-12" onClick={() => router.push('/dashboard')}><Phone className="w-5 h-5 rotate-[135deg]" /></Button>
          </div>
        </div>

        {/* Side Panel */}
        {(showChat || showParticipants) && (
          <div className="w-80 border-l border-border/30 bg-card/20 flex flex-col">
            {showChat ? (
              <>
                <div className="h-14 flex items-center justify-between px-4 border-b border-border/30">
                  <h2 className="font-semibold text-sm">Chat</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowChat(false)}><MoreVertical className="w-4 h-4" /></Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {MOCK_CHAT.map((msg) => (
                      <div key={msg.id}>
                        {msg.type === 'system' ? (
                          <div className="text-center"><span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">{msg.content}</span></div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primary">{msg.senderName}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {msg.type === 'code' ? <pre className="text-xs bg-muted/30 rounded-lg p-2 overflow-x-auto font-mono">{msg.content}</pre> : <p className="text-sm">{msg.content}</p>}
                            {msg.reactions.length > 0 && <div className="flex gap-1 mt-1">{msg.reactions.map((r, i) => <span key={i} className="text-xs bg-muted/30 rounded-full px-2 py-0.5">{r.emoji} {r.count}</span>)}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/30">
                  <div className="flex gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 h-9 px-3 rounded-lg bg-muted/30 border border-border/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" onKeyDown={(e) => e.key === 'Enter' && setChatInput('')} />
                    <Button size="icon" className="h-9 w-9 bg-primary"><MessageSquare className="w-4 h-4" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-14 flex items-center justify-between px-4 border-b border-border/30">
                  <h2 className="font-semibold text-sm">Participants ({participants.length})</h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20">
                        <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-primary/20 text-primary">{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{p.role}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {p.isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-green-400" />}
                          {p.isVideoOn ? <Camera className="w-4 h-4 text-green-400" /> : <CameraOff className="w-4 h-4 text-red-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
