import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Features", path: "/features" },
    { name: "AI Tutor", path: "/ai-tutor" },
    { name: "Whiteboard", path: "/whiteboard" },
    { name: "Pricing", path: "/pricing" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold">E</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ExceliBoard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth/User Area */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                    {user.displayName.charAt(0)}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium leading-none">{user.displayName}</p>
                    <Badge variant="outline" className="text-[9px] capitalize mt-0.5 px-1">{user.role.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="bg-gradient-primary shadow-glow">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <ThemeToggle className="w-full" />
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full gap-2" onClick={() => { handleLogout(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-primary shadow-glow">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
