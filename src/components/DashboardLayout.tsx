import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Video,
  Users,
  GraduationCap,
  PenTool,
  Brain,
  Calendar,
  Settings,
  Shield,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Menu,
  Sparkles,
  History,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  // Role-specific navigation
  const roleNavMap: Record<string, { icon: any; label: string; path: string }[]> = {
    student: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: GraduationCap, label: 'Lectures', path: '/lectures' },
      { icon: PenTool, label: 'My Boards', path: '/boards' },
      { icon: Video, label: 'Meetings', path: '/meetings' },
      { icon: Brain, label: 'AI Tutor', path: '/ai-tutor/chat' },
      { icon: Calendar, label: 'Schedule', path: '/schedule' },
      { icon: History, label: 'History', path: '/history' },
    ],
    teacher: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: GraduationCap, label: 'Lectures', path: '/lectures' },
      { icon: PenTool, label: 'Boards', path: '/boards' },
      { icon: Video, label: 'Meetings', path: '/meetings' },
      { icon: Users, label: 'Interviews', path: '/interviews' },
      { icon: Brain, label: 'AI Assistant', path: '/ai-tutor/chat' },
      { icon: Calendar, label: 'Schedule', path: '/schedule' },
      { icon: History, label: 'History', path: '/history' },
    ],
    interviewer: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Interviews', path: '/interviews' },
      { icon: PenTool, label: 'Code Boards', path: '/boards' },
      { icon: Video, label: 'Meetings', path: '/meetings' },
      { icon: Calendar, label: 'Schedule', path: '/schedule' },
      { icon: History, label: 'History', path: '/history' },
    ],
    org_admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Video, label: 'Meetings', path: '/meetings' },
      { icon: Users, label: 'Interviews', path: '/interviews' },
      { icon: GraduationCap, label: 'Lectures', path: '/lectures' },
      { icon: PenTool, label: 'Boards', path: '/boards' },
      { icon: Brain, label: 'AI Assistant', path: '/ai-tutor/chat' },
      { icon: Calendar, label: 'Schedule', path: '/schedule' },
      { icon: History, label: 'History', path: '/history' },
    ],
    other: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: PenTool, label: 'Boards', path: '/boards' },
      { icon: Video, label: 'Meetings', path: '/meetings' },
      { icon: Brain, label: 'AI Assistant', path: '/ai-tutor/chat' },
      { icon: Calendar, label: 'Schedule', path: '/schedule' },
      { icon: History, label: 'History', path: '/history' },
    ],
  };

  const mainNav = roleNavMap[user?.role || 'other'] || roleNavMap.other;

  const adminNav = [
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Shield, label: 'Admin', path: '/admin' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const showAdmin = user?.role === 'org_admin' || user?.role === 'super_admin';

  const roleLabel = user?.role === 'other' && user?.customRoleName
    ? user.customRoleName
    : user?.role?.replace('_', ' ');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo Banner */}
      {isDemo && (
        <div className="w-full bg-primary/90 text-primary-foreground text-xs px-4 py-1.5 flex items-center justify-between gap-2 z-[60]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <strong>Demo Mode</strong> — You are previewing as <strong>{user?.displayName}</strong>. Data is not saved.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="underline text-primary-foreground/80 hover:text-primary-foreground text-xs">
              Switch role
            </Link>
            <span className="opacity-40">|</span>
            <button onClick={() => { logout(); navigate('/'); }} className="underline text-primary-foreground/80 hover:text-primary-foreground text-xs">
              Exit demo
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-1">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Logo to="/dashboard" size="sm" showText={!sidebarCollapsed} />
        </div>

        {/* Quick Create */}
        <div className="p-3">
          <Button
            onClick={() => navigate('/boards')}
            className={`bg-gradient-primary shadow-glow ${sidebarCollapsed ? 'w-full px-0' : 'w-full'}`}
            size={sidebarCollapsed ? 'icon' : 'default'}
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">New Session</span>}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {showAdmin && (
            <>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mt-6 mb-2">
                {!sidebarCollapsed && 'Management'}
              </div>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                      active
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-border hidden lg:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center px-4 gap-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search boards, meetings, users..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {user && <span className="hidden sm:inline text-sm">{user.displayName}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.displayName}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    <Badge variant="outline" className="w-fit mt-1 text-[10px] capitalize">
                      {roleLabel}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
