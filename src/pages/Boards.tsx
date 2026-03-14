import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PenTool,
  Code,
  Presentation,
  TrendingUp,
  Plus,
  Users,
  Clock,
  Grid3X3,
  List,
  Search,
  Loader2,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { BoardType } from '@/types';

const boardTypeConfig: Record<BoardType, { icon: JSX.Element; color: string; bg: string }> = {
  whiteboard: { icon: <PenTool className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  code: { icon: <Code className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  presentation: { icon: <Presentation className="w-5 h-5" />, color: 'text-green-400', bg: 'bg-green-500/20' },
  diagram: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

const Boards = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardType, setNewBoardType] = useState<BoardType>('whiteboard');

  useEffect(() => {
    const loadBoards = async () => {
      setLoading(true);
      try {
        const result = await api.boards.list();
        setBoards(result || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load boards');
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, []);

  const createBoard = async () => {
    if (!newBoardName.trim()) {
      toast.error('Enter a board name');
      return;
    }
    try {
      const board = await api.boards.create(newBoardName.trim(), newBoardType);
      setBoards((prev) => [board, ...prev]);
      setNewBoardName('');
      setNewBoardType('whiteboard');
      setShowNewDialog(false);
      toast.success('Board created');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create board');
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      await api.boards.delete(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
      toast.success('Board deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete board');
    }
  };

  const filtered = boards.filter((b) => {
    if (filterType !== 'all' && b.type !== filterType) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Boards</h1>
            <p className="text-muted-foreground mt-1">Create and manage collaborative boards</p>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow gap-1" size="sm">
                <Plus className="w-4 h-4" /> New Board
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Board</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Board Name</Label>
                  <Input
                    placeholder="My awesome board..."
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(boardTypeConfig) as BoardType[]).map((type) => {
                      const config = boardTypeConfig[type];
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setNewBoardType(type)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            newBoardType === type
                              ? 'border-primary/70 bg-primary/5'
                              : 'border-border/50 hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center ${config.color}`}>
                            {config.icon}
                          </div>
                          <span className="text-sm font-medium capitalize">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button className="w-full bg-gradient-primary" onClick={createBoard}>
                  Create Board
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="pl-9"
            />
          </div>
          <Tabs value={filterType} onValueChange={setFilterType}>
            <TabsList>
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="whiteboard" className="text-xs">Whiteboard</TabsTrigger>
              <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
              <TabsTrigger value="diagram" className="text-xs">Diagram</TabsTrigger>
              <TabsTrigger value="presentation" className="text-xs">Slides</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex border border-border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Board Grid / List */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No boards found. Create your first board.
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((board) => {
              const config = boardTypeConfig[board.type];
              return (
                <Card key={board.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all hover:shadow-glow group cursor-pointer h-full">
                    <CardContent className="p-0">
                      <Link to={`/whiteboard/${board.id}`} className="block h-36 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-t-lg flex items-center justify-center relative">
                        <div className={`w-14 h-14 rounded-xl ${config.bg} flex items-center justify-center ${config.color} group-hover:scale-110 transition-transform`}>
                          {config.icon}
                        </div>
                        {board.isPublic && (
                          <Badge className="absolute top-2 right-2 text-[10px]" variant="outline">Public</Badge>
                        )}
                      </Link>
                      <div className="p-4">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {board.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{board.type}</Badge>
                          <span className="text-[10px] text-muted-foreground">v{board.version}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{board.collaborators?.length || 1}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{new Date(board.updatedAt || board.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteBoard(board.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((board) => {
              const config = boardTypeConfig[board.type];
              return (
                <Card key={board.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all group cursor-pointer">
                    <CardContent className="p-3 flex items-center gap-4">
                      <Link to={`/whiteboard/${board.id}`} className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center ${config.color} flex-shrink-0`}>
                        {config.icon}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">{board.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Updated {new Date(board.updatedAt || board.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          {' • '}v{board.version}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{board.type}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" /> {board.collaborators?.length || 1}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteBoard(board.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Boards;
