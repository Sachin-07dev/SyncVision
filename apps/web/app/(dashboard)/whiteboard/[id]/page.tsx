'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MousePointer, Pen, Square, Circle, Type, Eraser, ArrowRight,
  Minus, ImageIcon, Undo2, Redo2, ZoomIn, ZoomOut, Maximize,
  Download, Share2, Users, Palette, Hand, X, MessageSquare,
  ChevronDown, Trash2, Save,
} from 'lucide-react';

type Tool = 'select' | 'pen' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'line' | 'text' | 'image' | 'pan';

const tools: { id: Tool; icon: any; label: string }[] = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'image', icon: ImageIcon, label: 'Image' },
  { id: 'pan', icon: Hand, label: 'Pan' },
];

const colors = ['#fff', '#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8'];
const strokeWidths = [2, 4, 6, 8];

export default function WhiteboardPage() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [strokeColor, setStrokeColor] = useState('#fff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const collaborators = [
    { name: 'Sarah Chen', color: '#60a5fa' },
    { name: 'Michael Park', color: '#4ade80' },
    { name: 'Emily Zhang', color: '#f472b6' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = canvas.parentElement?.clientWidth || window.innerWidth; canvas.height = canvas.parentElement?.clientHeight || window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startDraw = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'pen' && activeTool !== 'eraser') return;
    setIsDrawing(true);
    setLastPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }, [activeTool]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !lastPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = activeTool === 'eraser' ? '#0a0a0f' : strokeColor;
    ctx.lineWidth = activeTool === 'eraser' ? strokeWidth * 4 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setLastPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }, [isDrawing, lastPos, strokeColor, strokeWidth, activeTool]);

  const endDraw = useCallback(() => { setIsDrawing(false); setLastPos(null); }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      <header className="h-12 flex items-center justify-between px-3 bg-card/30 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => router.push('/boards')}><X className="w-3 h-3" /> Back</Button>
          <div className="h-5 w-px bg-border/30" />
          <span className="text-sm font-semibold">Untitled Board</span>
          <Badge variant="outline" className="text-[10px]">Auto-saved</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {collaborators.map((c, i) => (<div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: c.color }}>{c.name[0]}</div>))}
          </div>
          <Badge variant="outline" className="text-[10px] gap-1"><Users className="w-3 h-3" /> {collaborators.length}</Badge>
          <Button variant="outline" size="sm" className="text-xs gap-1"><Share2 className="w-3 h-3" /> Share</Button>
          <Button variant="outline" size="sm" className="text-xs gap-1"><Download className="w-3 h-3" /> Export</Button>
          <Button variant="outline" size="sm" className="text-xs gap-1"><Save className="w-3 h-3" /> Save</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Toolbar */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 bg-card/80 backdrop-blur-md p-1.5 rounded-xl border border-border/30 shadow-xl">
          {tools.map((tool) => (<Button key={tool.id} variant={activeTool === tool.id ? 'default' : 'ghost'} size="icon" className={`h-9 w-9 ${activeTool === tool.id ? 'bg-primary text-primary-foreground' : ''}`} title={tool.label} onClick={() => setActiveTool(tool.id)}><tool.icon className="w-4 h-4" /></Button>))}
          <div className="h-px bg-border/30 my-1" />
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowColorPicker(!showColorPicker)}><div className="w-5 h-5 rounded-full border-2 border-border" style={{ backgroundColor: strokeColor }} /></Button>
            {showColorPicker && (
              <div className="absolute left-12 top-0 bg-card/90 backdrop-blur-md p-3 rounded-xl border border-border/30 shadow-xl space-y-3 z-20">
                <div className="grid grid-cols-5 gap-1.5">{colors.map((c) => (<button key={c} onClick={() => { setStrokeColor(c); setShowColorPicker(false); }} className={`w-6 h-6 rounded-full border-2 transition-all ${strokeColor === c ? 'border-primary scale-110' : 'border-border/30'}`} style={{ backgroundColor: c }} />))}</div>
                <div className="flex items-center gap-2">{strokeWidths.map((w) => (<button key={w} onClick={() => setStrokeWidth(w)} className={`rounded-full border ${strokeWidth === w ? 'border-primary' : 'border-border/30'}`} style={{ width: w + 12, height: w + 12, backgroundColor: strokeColor }} />))}</div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <canvas ref={canvasRef} className="flex-1 cursor-crosshair" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} />

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/30 shadow-xl">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(25, zoom - 25))}><ZoomOut className="w-4 h-4" /></Button>
          <span className="text-xs font-mono w-10 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(400, zoom + 25))}><ZoomIn className="w-4 h-4" /></Button>
          <div className="w-px h-5 bg-border/30 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(100)}><Maximize className="w-4 h-4" /></Button>
          <div className="w-px h-5 bg-border/30 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7"><Undo2 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Redo2 className="w-4 h-4" /></Button>
          <div className="w-px h-5 bg-border/30 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="w-4 h-4" /></Button>
        </div>

        {/* Chat toggle */}
        <Button variant={showChat ? 'default' : 'outline'} size="icon" className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full shadow-xl" onClick={() => setShowChat(!showChat)}><MessageSquare className="w-4 h-4" /></Button>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-72 border-l border-border/30 bg-card/20 flex flex-col">
            <div className="h-12 flex items-center justify-between px-4 border-b border-border/30"><h2 className="text-sm font-semibold">Board Chat</h2><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowChat(false)}><X className="w-4 h-4" /></Button></div>
            <div className="flex-1 p-4"><p className="text-xs text-muted-foreground text-center mt-12">No messages yet. Start the conversation!</p></div>
            <div className="p-3 border-t border-border/30"><input type="text" placeholder="Message..." className="w-full h-9 px-3 rounded-lg bg-muted/30 border border-border/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
