import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserRole } from "@/types";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get("mode") === "signup";
  const navigate = useNavigate();
  const { login, signup, loginAsRole } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      signup(email, password, name);
      toast.success("Account created successfully!");
    } else {
      login(email, password);
      toast.success("Welcome back!");
    }
    navigate("/dashboard");
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    toast.success(`Signed in as ${role.replace('_', ' ')}`);
    navigate("/dashboard");
  };

  const demoRoles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'teacher', label: 'Teacher', desc: 'Host meetings, lectures & boards' },
    { role: 'student', label: 'Student', desc: 'Join sessions & collaborate' },
    { role: 'interviewer', label: 'Interviewer', desc: 'Conduct secure interviews' },
    { role: 'org_admin', label: 'Admin', desc: 'Full platform management' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-primary/20 shadow-glow">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-3xl font-bold">E</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Sign up to start collaborating with ExceliBoard"
              : "Sign in to continue to your workspace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-primary shadow-glow">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/auth?mode=signup" className="text-primary hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card/50 px-2 text-muted-foreground">Quick Demo Access</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map(({ role, label, desc }) => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role)}
                  className="p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                >
                  <Badge variant="outline" className="text-[10px] mb-1">{label}</Badge>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
