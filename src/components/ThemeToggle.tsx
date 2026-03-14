import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-[1.15rem] h-[1.15rem] text-yellow-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-[1.15rem] h-[1.15rem] text-indigo-500 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
};

export default ThemeToggle;
