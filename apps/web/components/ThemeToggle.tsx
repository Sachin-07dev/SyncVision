'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className={className} title={resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
      {resolvedTheme === 'dark' ? <Sun className="w-[1.15rem] h-[1.15rem] text-yellow-400" /> : <Moon className="w-[1.15rem] h-[1.15rem] text-indigo-500" />}
    </Button>
  );
}
