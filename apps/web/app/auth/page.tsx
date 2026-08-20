'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { GraduationCap, Briefcase, ShieldCheck, UserCheck, Users } from 'lucide-react';

const ROLES: { value: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'student', label: 'Student', desc: 'Join sessions, attend lectures, collaborate on boards', icon: <GraduationCap className="w-5 h-5" /> },
  { value: 'teacher', label: 'Teacher', desc: 'Host meetings, lectures & manage boards', icon: <Briefcase className="w-5 h-5" /> },
  { value: 'interviewer', label: 'Interviewer', desc: 'Conduct secure, AI-assisted technical interviews', icon: <UserCheck className="w-5 h-5" /> },
  { value: 'interviewee', label: 'Interviewee', desc: 'Participate in coding interviews', icon: <Users className="w-5 h-5" /> },
  { value: 'org_admin', label: 'Organization Admin', desc: 'Full platform management & analytics', icon: <ShieldCheck className="w-5 h-5" /> },
];

export default function AuthPage() {
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get('mode') === 'signup';
  const router = useRouter();
  const { login, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { toast.error('Please select a role'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password, name, role);
        toast.success('Account created successfully!');
      } else {
        await login(email, password, role);
        toast.success('Welcome back!');
      }
      router.push('/dashboard');
    } catch {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-primary/20 shadow-glow">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-3xl font-bold text-white">E</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? 'Sign up to start collaborating with SyncVision'
              : 'Sign in to continue to your workspace'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Sign in as</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <span className="flex items-center gap-2">
                        {r.icon}
                        <span>{r.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Role description chips */}
              <div className="grid grid-cols-1 gap-2 mt-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      role === r.value
                        ? 'border-primary/50 bg-primary/10 shadow-glow'
                        : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      role === r.value ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {r.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-primary shadow-glow" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth" className="text-primary hover:underline font-semibold">Sign in</Link>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth?mode=signup" className="text-primary hover:underline font-semibold">Sign up</Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
