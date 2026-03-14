'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List, Plus, Search, Star, Users, MoreVertical, Clock, Pen, FileText, Share2 } from 'lucide-react';
import { MOCK_BOARDS } from '@/data/mockData';

export default function BoardsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showNewDialog, setShowNewDialog] = useState(false);

  const filtered = MOCK_BOARDS.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const typeColors: Record<string, string> = { meeting: 'bg-blue-500/20 text-blue-400', lecture: 'bg-emerald-500/20 text-emerald-400', personal: 'bg-purple-500/20 text-purple-400', interview: 'bg-amber-500/20 text-amber-400' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Boards</h1>
          <p className="text-muted-foreground mt-1">Collaborative whiteboards and documents</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild><Button className="bg-gradient-primary shadow-glow gap-1" size="sm"><Plus className="w-4 h-4" /> New Board</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create Board</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Board Name</Label><Input placeholder="e.g., Sprint Planning Board" /></div>
              <div className="space-y-2"><Label>Type</Label>
                <Select defaultValue="personal"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Template</Label>
                <Select defaultValue="blank"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="blank">Blank Canvas</SelectItem>
                  <SelectItem value="flowchart">Flowchart</SelectItem>
                  <SelectItem value="mindmap">Mind Map</SelectItem>
                  <SelectItem value="kanban">Kanban Board</SelectItem>
                  <SelectItem value="wireframe">Wireframe</SelectItem>
                </SelectContent></Select>
              </div>
              <Button className="w-full bg-gradient-primary" onClick={() => setShowNewDialog(false)}>Create Board</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search boards..." className="pl-9" /></div>
        <Tabs value={category} onValueChange={setCategory}><TabsList className="bg-muted/30"><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="personal">Personal</TabsTrigger><TabsTrigger value="shared">Shared</TabsTrigger><TabsTrigger value="starred">Starred</TabsTrigger></TabsList></Tabs>
        <div className="flex gap-1 ml-auto"><Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" className="h-9 w-9" onClick={() => setView('grid')}><LayoutGrid className="w-4 h-4" /></Button><Button variant={view === 'list' ? 'default' : 'outline'} size="icon" className="h-9 w-9" onClick={() => setView('list')}><List className="w-4 h-4" /></Button></div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Link href="/whiteboard/new" className="block">
            <Card className="bg-card/30 border-dashed border-2 border-border/50 hover:border-primary/50 transition-all h-full flex items-center justify-center min-h-[200px] cursor-pointer">
              <CardContent className="flex flex-col items-center gap-2 p-6"><Plus className="w-8 h-8 text-muted-foreground" /><span className="text-sm text-muted-foreground">Blank Board</span></CardContent>
            </Card>
          </Link>
          {filtered.map((board) => (
            <Link key={board.id} href={`/whiteboard/${board.id}`} className="block">
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 relative"><div className="absolute inset-0 flex items-center justify-center"><Pen className="w-8 h-8 text-muted-foreground/30" /></div><div className="absolute top-2 right-2 flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"><Star className="w-4 h-4" /></Button></div></div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate">{board.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={`text-[10px] ${typeColors[board.type] || 'bg-muted/20 text-muted-foreground'}`}>{board.type}</Badge>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(board.lastModified).toLocaleDateString()}</span>
                      <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {board.collaborators}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((board) => (
            <Link key={board.id} href={`/whiteboard/${board.id}`} className="block">
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-primary/60" /></div>
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{board.title}</p><p className="text-[10px] text-muted-foreground">Modified {new Date(board.lastModified).toLocaleDateString()}</p></div>
                  <Badge className={`text-[10px] ${typeColors[board.type] || ''}`}>{board.type}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {board.collaborators}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Share2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-4 h-4" /></Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
