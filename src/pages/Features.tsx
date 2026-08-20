import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Video,
  Brain,
  Code,
  FileText,
  MessageSquare,
  Palette,
  Share2,
  Clock,
  Zap,
  Shield,
  Users,
  Monitor,
  Mic,
  Globe,
  PenTool,
} from "lucide-react";

const Features = () => {
  const aiFeatures = [
    {
      icon: Brain,
      title: "Smart Code Analysis",
      description: "Automatically analyze code complexity, suggest optimizations, and detect potential issues in real-time.",
      color: "text-violet-500",
      bg: "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20",
    },
    {
      icon: FileText,
      title: "Handwriting Recognition",
      description: "Convert handwritten notes to text instantly with advanced OCR technology powered by AI.",
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20",
    },
    {
      icon: MessageSquare,
      title: "AI Tutor Chat",
      description: "Get contextual help and step-by-step explanations from our intelligent AI assistant.",
      color: "text-emerald-500",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    },
    {
      icon: Clock,
      title: "Auto Summarization",
      description: "Automatically generate summaries of your sessions, meetings, and key discussion points.",
      color: "text-amber-500",
      bg: "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/20",
    },
    {
      icon: Shield,
      title: "Plagiarism Detection",
      description: "Detect copied content and code similarity with advanced semantic analysis.",
      color: "text-red-500",
      bg: "bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-500/20",
    },
    {
      icon: Zap,
      title: "Smart Suggestions",
      description: "Get intelligent auto-complete suggestions for diagrams, code, and content as you work.",
      color: "text-pink-500",
      bg: "bg-gradient-to-br from-pink-500/20 to-pink-600/5 border-pink-500/20",
    },
  ];

  const collaborationFeatures = [
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal-clear video conferencing with up to 500 participants and screen sharing.",
      color: "text-emerald-500",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    },
    {
      icon: Share2,
      title: "Real-time Sync",
      description: "See changes instantly as team members draw, type, and collaborate on the canvas.",
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20",
    },
    {
      icon: Palette,
      title: "Infinite Canvas",
      description: "Unlimited space to brainstorm, plan, and create without boundaries or limits.",
      color: "text-violet-500",
      bg: "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20",
    },
    {
      icon: Code,
      title: "Code Sharing",
      description: "Share and collaborate on code snippets with syntax highlighting and live execution.",
      color: "text-amber-500",
      bg: "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/20",
    },
    {
      icon: Monitor,
      title: "Screen Sharing",
      description: "Present your screen with one click — works seamlessly inside any session or meeting.",
      color: "text-cyan-500",
      bg: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
    },
    {
      icon: Globe,
      title: "Team Workspaces",
      description: "Organize boards, sessions, and members into dedicated team or class workspaces.",
      color: "text-pink-500",
      bg: "bg-gradient-to-br from-pink-500/20 to-pink-600/5 border-pink-500/20",
    },
  ];

  const aiTags = ["Code Analysis", "Plagiarism Detection", "Smart Suggestions", "Auto-Summary", "OCR", "Context-Aware"];
  const collabTags = ["Real-time Sync", "Video Calls", "Screen Sharing", "Team Spaces", "Infinite Canvas", "Guest Access"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Platform Features
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-secondary bg-clip-text text-transparent">
                Modern Teams
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to teach, interview, collaborate, and create — powered by AI and real-time technology.
            </p>
          </div>

          {/* Feature Tabs */}
          <Tabs defaultValue="ai" className="w-full">
            <div className="flex justify-center mb-10">
              <TabsList className="bg-muted/40 border border-border/50 rounded-2xl p-1.5 h-auto gap-1">
                <TabsTrigger
                  value="ai"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl px-6 py-3 text-base font-medium gap-2 transition-all"
                >
                  <Sparkles className="w-4.5 h-4.5" />
                  AI Features
                </TabsTrigger>
                <TabsTrigger
                  value="collaboration"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl px-6 py-3 text-base font-medium gap-2 transition-all"
                >
                  <Users className="w-4.5 h-4.5" />
                  Collaboration
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="ai">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {aiFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={index}
                      className="group border border-border/60 bg-card/50 hover:bg-accent/40 hover:border-primary/25 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${feature.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* AI Showcase */}
              <Card className="border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-blue-500/5 overflow-hidden">
                <CardContent className="p-10 sm:p-12 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_60%)]" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Next-Generation AI Assistant
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                      Our AI understands context, provides intelligent suggestions, and learns from your workflow to help you work faster and smarter.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {aiTags.map((tag) => (
                        <span key={tag} className="px-3.5 py-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collaboration">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {collaborationFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={index}
                      className="group border border-border/60 bg-card/50 hover:bg-accent/40 hover:border-primary/25 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${feature.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Collaboration Showcase */}
              <Card className="border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 overflow-hidden">
                <CardContent className="p-10 sm:p-12 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)]" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Seamless Team Collaboration
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                      Work together in real-time with HD video, instant sync, and powerful tools. Distance becomes irrelevant when your team has the right platform.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {collabTags.map((tag) => (
                        <span key={tag} className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
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
};

export default Features;
