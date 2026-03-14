import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Code, FileText, CheckCircle, Lightbulb, Zap } from 'lucide-react';

const features = [
  { icon: <Code className="w-6 h-6" />, title: 'Smart Code Analysis', description: 'Get instant feedback on your code including time complexity, best practices, and optimization suggestions.' },
  { icon: <Brain className="w-6 h-6" />, title: 'Contextual Learning', description: 'AI understands your current topic and provides relevant examples and explanations tailored to your level.' },
  { icon: <FileText className="w-6 h-6" />, title: 'Step-by-Step Guidance', description: 'Break down complex problems into manageable steps with detailed explanations at each stage.' },
  { icon: <CheckCircle className="w-6 h-6" />, title: 'Instant Plagiarism Check', description: 'Ensure originality with advanced semantic similarity detection across code and text.' },
  { icon: <Lightbulb className="w-6 h-6" />, title: 'Smart Hints', description: 'Get hints that guide without giving away the answer, promoting deep understanding.' },
  { icon: <Zap className="w-6 h-6" />, title: 'Real-time Assistance', description: 'Chat with AI tutor directly in your whiteboard for immediate help whenever you need it.' },
];

export default function AITutorPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow mx-auto mb-6"><Brain className="w-10 h-10" /></div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">Your Personal{' '}<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Tutor</span></h1>
            <p className="text-xl text-muted-foreground mb-8">Get intelligent, personalized learning support powered by advanced AI. From code analysis to step-by-step problem solving, your AI tutor is always ready to help you learn faster and better.</p>
            <Link href="/boards"><Button size="lg" className="bg-gradient-primary shadow-glow text-lg px-8">Try AI Tutor Now</Button></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:shadow-glow group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: 1, title: 'Write or Draw', desc: 'Start working on your problem or code on the whiteboard', gradient: 'from-primary/10 to-secondary/10 border-primary/20', numGradient: 'bg-gradient-primary' },
                { step: 2, title: 'Ask AI', desc: 'Click the AI Tutor button and ask your question', gradient: 'from-secondary/10 to-primary/10 border-secondary/20', numGradient: 'bg-gradient-secondary' },
                { step: 3, title: 'Get Help', desc: 'Receive instant, contextual guidance and explanations', gradient: 'from-primary/10 to-secondary/10 border-primary/20', numGradient: 'bg-gradient-primary' },
              ].map((s) => (
                <Card key={s.step} className={`bg-gradient-to-br ${s.gradient} text-center`}>
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${s.numGradient} rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-glow`}>{s.step}</div>
                    <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                    <p className="text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-gradient-primary border-0 shadow-glow">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-center mb-8">Perfect For</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                {[
                  { role: 'Students', desc: 'Get help with homework, understand concepts better, and prepare for exams with AI-powered explanations.' },
                  { role: 'Developers', desc: 'Debug code faster, learn best practices, and optimize your solutions with intelligent code analysis.' },
                  { role: 'Educators', desc: 'Provide personalized support to students at scale and track their learning progress.' },
                  { role: 'Teams', desc: 'Onboard new members faster and maintain code quality with instant expert feedback.' },
                ].map((item) => (
                  <div key={item.role} className="flex items-start gap-3"><CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" /><div><strong>{item.role}:</strong> {item.desc}</div></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
