import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { GraduationCap, BookOpen, Users, Shield, ChevronDown, ChevronUp, Sparkles, HelpCircle } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "student", label: "Student", description: "Join sessions & collaborate with peers" },
  { value: "teacher", label: "Teacher / Educator", description: "Host lectures, meetings & manage boards" },
  { value: "interviewer", label: "Interviewer", description: "Conduct technical & coding interviews" },
  { value: "org_admin", label: "Organization Admin", description: "Full platform management & analytics" },
  { value: "other", label: "Other", description: "Custom role — specify your own" },
];

const DEMO_ROLES = [
  {
    value: "student",
    label: "Student",
    description: "Attend lectures, join boards, collaborate",
    icon: GraduationCap,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60",
  },
  {
    value: "teacher",
    label: "Teacher / Educator",
    description: "Host lectures, create boards, manage class",
    icon: BookOpen,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60",
  },
  {
    value: "interviewer",
    label: "Interviewer",
    description: "Conduct interviews, review code, score candidates",
    icon: Users,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60",
  },
  {
    value: "org_admin",
    label: "Org Admin",
    description: "Full platform view, analytics, user management",
    icon: Shield,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60",
  },
  {
    value: "other",
    label: "Other",
    description: "Explore with a custom role",
    icon: HelpCircle,
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/30 hover:border-gray-500/60",
  },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get("mode") === "signup";
  const navigate = useNavigate();
  const { login, signup, loginAsDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [customRoleName, setCustomRoleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDemoPicker, setShowDemoPicker] = useState(false);

  const handleDemoLogin = (demoRole: string) => {
    if (demoRole === 'other') {
      const name = prompt('Enter your custom role name (e.g., Freelancer, Mentor, Parent):');
      if (!name?.trim()) return;
      loginAsDemo(demoRole, name.trim());
      toast.success(`Entered as Demo — ${name.trim()}`);
    } else {
      loginAsDemo(demoRole);
      toast.success(`Entered as Demo ${DEMO_ROLES.find(r => r.value === demoRole)?.label}`);
    }
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (role === 'other' && !customRoleName.trim()) {
          setError('Please enter your custom role name');
          setIsSubmitting(false);
          return;
        }
        await signup(email, password, name, role, role === 'other' ? customRoleName.trim() : undefined);
        toast.success("Account created successfully!");
      } else {
        await login(email, password);
        toast.success("Welcome back!");
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-border">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo to="/" size="lg" showText={false} />
          </div>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Sign up to start collaborating with SyncVision"
              : "Sign in to continue to your workspace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
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

                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              — {type.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {role === 'other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customRoleName">Your Role Name</Label>
                    <Input
                      id="customRoleName"
                      placeholder="e.g., Freelancer, Mentor, Parent, Researcher..."
                      value={customRoleName}
                      onChange={(e) => setCustomRoleName(e.target.value)}
                      required
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      Describe your role so we can tailor your experience.
                    </p>
                  </div>
                )}
              </>
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
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
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
                Don&apos;t have an account?{" "}
                <Link to="/auth?mode=signup" className="text-primary hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            )}
          </div>

          {/* ── Demo Access ── */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">or explore without an account</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5"
              onClick={() => setShowDemoPicker((v) => !v)}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Try Demo Account
              {showDemoPicker ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </Button>

            {showDemoPicker && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Choose a role to explore the full experience — no sign-up needed.
                </p>
                {DEMO_ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleDemoLogin(r.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${r.bg}`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-background/60 flex items-center justify-center flex-shrink-0 ${r.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{r.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
