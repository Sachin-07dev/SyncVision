import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Video, Brain, Code, FileText, MessageSquare, Palette, Share2, Clock } from 'lucide-react';

const aiFeatures = [
  { icon: <Brain className="w-6 h-6" />, title: 'Smart Code Analysis', description: 'Automatically analyze code complexity, suggest optimizations, and detect potential issues.' },
  { icon: <FileText className="w-6 h-6" />, title: 'Handwriting Recognition', description: 'Convert handwritten notes to text instantly with advanced OCR technology.' },
  { icon: <MessageSquare className="w-6 h-6" />, title: 'AI Tutor Chat', description: 'Get contextual help and explanations from our intelligent AI assistant.' },
  { icon: <Clock className="w-6 h-6" />, title: 'Auto Summarization', description: 'Automatically generate summaries of your sessions and key discussion points.' },
];

const collaborationFeatures = [
  { icon: <Video className="w-6 h-6" />, title: 'HD Video Calls', description: 'Crystal-clear video conferencing with screen sharing capabilities.' },
  { icon: <Share2 className="w-6 h-6" />, title: 'Real-time Sync', description: 'See changes instantly as team members draw, type, and collaborate.' },
  { icon: <Palette className="w-6 h-6" />, title: 'Infinite Canvas', description: 'Unlimited space to brainstorm, plan, and create without boundaries.' },
  { icon: <Code className="w-6 h-6" />, title: 'Code Sharing', description: 'Share and collaborate on code snippets with syntax highlighting.' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">Powerful Features for{' '}<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Modern Teams</span></h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Discover all the tools and capabilities that make SyncVision the ultimate collaborative workspace for teams, educators, and innovators.</p>
          </div>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="ai" className="text-lg"><Sparkles className="w-4 h-4 mr-2" />AI Features</TabsTrigger>
              <TabsTrigger value="collaboration" className="text-lg"><Video className="w-4 h-4 mr-2" />Collaboration</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {aiFeatures.map((feature, i) => (
                  <Card key={i} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:shadow-glow group">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform">{feature.icon}</div>
                      <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground text-lg">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-12 text-center">
                  <Brain className="w-16 h-16 mx-auto mb-6 text-primary" />
                  <h3 className="text-3xl font-bold mb-4">Next-Generation AI Assistant</h3>
                  <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">Our AI doesn&apos;t just recognize text—it understands context, provides intelligent suggestions, and learns from your workflow to help you work faster and smarter.</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {['Code Analysis', 'Plagiarism Detection', 'Smart Suggestions', 'Auto-Summary'].map((t) => (<span key={t} className="px-4 py-2 bg-primary/20 rounded-full text-sm">{t}</span>))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collaboration" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {collaborationFeatures.map((feature, i) => (
                  <Card key={i} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:shadow-glow group">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform">{feature.icon}</div>
                      <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground text-lg">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
                <CardContent className="p-12 text-center">
                  <Video className="w-16 h-16 mx-auto mb-6 text-secondary" />
                  <h3 className="text-3xl font-bold mb-4">Seamless Team Collaboration</h3>
                  <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">Work together in real-time with HD video, instant sync, and powerful collaboration tools. Distance becomes irrelevant when your team has the right tools.</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {['Real-time Sync', 'Video Calls', 'Screen Sharing', 'Team Spaces'].map((t) => (<span key={t} className="px-4 py-2 bg-secondary/20 rounded-full text-sm">{t}</span>))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
