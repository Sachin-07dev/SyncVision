import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Video, Brain, Users, Zap, Shield, ChevronRight, Check } from 'lucide-react';

const features = [
  { icon: <Sparkles className="w-6 h-6" />, title: 'AI-Powered Whiteboard', description: 'Intelligent canvas that understands your drawings and provides real-time suggestions.' },
  { icon: <Video className="w-6 h-6" />, title: 'Video Conferencing', description: 'Built-in HD video calls with screen sharing and real-time collaboration.' },
  { icon: <Brain className="w-6 h-6" />, title: 'Smart AI Tutor', description: 'Get instant help with code analysis, problem-solving, and personalized learning paths.' },
  { icon: <Users className="w-6 h-6" />, title: 'Real-time Collaboration', description: 'Work together seamlessly with your team in real-time, anywhere in the world.' },
  { icon: <Zap className="w-6 h-6" />, title: 'Lightning Fast', description: 'Optimized performance for smooth drawing and instant synchronization.' },
  { icon: <Shield className="w-6 h-6" />, title: 'Enterprise Security', description: 'Bank-level encryption and compliance with industry security standards.' },
];

const useCases = [
  { title: 'Education', description: 'Transform online learning with interactive lessons and AI-powered tutoring.', benefits: ['Interactive lessons', 'Instant feedback', 'Progress tracking'] },
  { title: 'Remote Teams', description: 'Boost productivity with seamless collaboration tools and video conferencing.', benefits: ['Real-time sync', 'Video calls', 'Team spaces'] },
  { title: 'Brainstorming', description: 'Bring ideas to life with infinite canvas and intelligent organization.', benefits: ['Infinite canvas', 'AI suggestions', 'Easy sharing'] },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm text-primary font-medium">🚀 Now with AI-Powered Features</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Collaborate Smarter with{' '}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">AI-Powered</span>{' '}
              Whiteboard
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The ultimate collaborative workspace combining real-time whiteboarding, video conferencing, and intelligent AI tutoring — all in one seamless platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/whiteboard">
                <Button size="lg" className="bg-gradient-primary shadow-glow text-lg px-8 h-14">
                  Try Demo Board <ChevronRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-primary/30 hover:bg-primary/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 animate-slide-up">
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-elevated bg-card/50 backdrop-blur">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-float">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <p className="text-muted-foreground">Interactive whiteboard demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything You Need to <span className="text-primary">Collaborate</span></h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Powerful features designed for teams, educators, and innovators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:shadow-glow group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built for Every <span className="text-secondary">Use Case</span></h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From classrooms to boardrooms, SyncVision adapts to your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((uc, i) => (
              <Card key={i} className="bg-card border-primary/10">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{uc.title}</h3>
                  <p className="text-muted-foreground mb-6">{uc.description}</p>
                  <ul className="space-y-3">
                    {uc.benefits.map((b, j) => (
                      <li key={j} className="flex items-center gap-2"><Check className="w-5 h-5 text-secondary" /><span>{b}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="bg-gradient-primary border-0 shadow-glow">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Transform Your Collaboration?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">Join thousands of teams already using SyncVision to work smarter, not harder.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth?mode=signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 h-14">Start Free Trial</Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent border-white hover:bg-white/10">Learn More</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
