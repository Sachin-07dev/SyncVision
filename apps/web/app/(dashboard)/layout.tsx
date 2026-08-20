'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard, Video, Users, GraduationCap, PenTool, Brain,
  Calendar, Settings, Shield, BarChart3, Bell, LogOut, ChevronLeft,
  ChevronRight, Plus, Search, Menu,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, notifications, unreadCount } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const initials = user?.displayName?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

  const mainNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Video, label: 'Meetings', path: '/meetings' },
    { icon: Users, label: 'Interviews', path: '/interviews' },
    { icon: GraduationCap, label: 'Lectures', path: '/lectures' },
    { icon: PenTool, label: 'Boards', path: '/boards' },
    { icon: Brain, label: 'AI Assistant', path: '/ai-tutor' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
  ];

  const adminNav = [
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Shield, label: 'Admin', path: '/admin' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const showAdmin = user?.role === 'org_admin' || user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow flex-shrink-0">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            {!sidebarCollapsed && <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SyncVision</span>}
          </Link>
        </div>

        <div className="p-3">
          <Button onClick={() => router.push('/boards')} className={`bg-gradient-primary shadow-glow ${sidebarCollapsed ? 'w-full px-0' : 'w-full'}`} size={sidebarCollapsed ? 'icon' : 'default'}>
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">New Session</span>}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{!sidebarCollapsed && 'Main'}</div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`} title={sidebarCollapsed ? item.label : undefined}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {showAdmin && (
            <>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mt-6 mb-2">{!sidebarCollapsed && 'Management'}</div>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`} title={sidebarCollapsed ? item.label : undefined}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border hidden lg:block">
          <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center px-4 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search boards, meetings, users..." className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive">{unreadCount}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.slice(0, 5).map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3">
                    <span className={`text-sm font-medium ${n.isRead ? 'text-muted-foreground' : ''}`}>{n.title}</span>
                    <span className="text-xs text-muted-foreground">{n.message}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback></Avatar>
                  {user && <span className="hidden sm:inline text-sm">{user.displayName}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.displayName}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    <Badge variant="outline" className="w-fit mt-1 text-[10px] capitalize">{user?.role?.replace('_', ' ')}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="w-4 h-4 mr-2" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
