import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Brain,
  Code,
  FileText,
  CheckCircle,
  Lightbulb,
  Zap,
  Sparkles,
  GraduationCap,
  Wrench,
  Users,
} from "lucide-react";

const AITutor = () => {
  const features = [
    {
      icon: Code,
      title: "Smart Code Analysis",
      description: "Get instant feedback on your code including time complexity, best practices, and optimization suggestions.",
      color: "text-violet-500",
      bg: "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20",
    },
    {
      icon: Brain,
      title: "Contextual Learning",
      description: "AI understands your current topic and provides relevant examples and explanations tailored to your level.",
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20",
    },
    {
      icon: FileText,
      title: "Step-by-Step Guidance",
      description: "Break down complex problems into manageable steps with detailed explanations at each stage.",
      color: "text-emerald-500",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    },
    {
      icon: CheckCircle,
      title: "Instant Plagiarism Check",
      description: "Ensure originality with advanced semantic similarity detection across code and text.",
      color: "text-red-500",
      bg: "bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-500/20",
    },
    {
      icon: Lightbulb,
      title: "Smart Hints",
      description: "Get hints that guide without giving away the answer, promoting deep understanding.",
      color: "text-amber-500",
      bg: "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/20",
    },
    {
      icon: Zap,
      title: "Real-time Assistance",
      description: "Chat with AI tutor directly in your whiteboard for immediate help whenever you need it.",
      color: "text-pink-500",
      bg: "bg-gradient-to-br from-pink-500/20 to-pink-600/5 border-pink-500/20",
    },
  ];

  const steps = [
    {
      num: "1",
      title: "Write or Draw",
      description: "Start working on your problem or code on the whiteboard",
      color: "text-violet-500",
      bg: "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20",
      iconBg: "bg-gradient-to-br from-violet-500 to-blue-500",
    },
    {
      num: "2",
      title: "Ask AI",
      description: "Click the AI Tutor button and ask your question",
      color: "text-emerald-500",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    },
    {
      num: "3",
      title: "Get Help",
      description: "Receive instant, contextual guidance and explanations",
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    },
  ];

  const useCases = [
    {
      icon: GraduationCap,
      role: "Students",
      description: "Get help with homework, understand concepts better, and prepare for exams with AI-powered explanations.",
      color: "text-violet-500",
      bg: "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20",
    },
    {
      icon: Code,
      role: "Developers",
      description: "Debug code faster, learn best practices, and optimize your solutions with intelligent code analysis.",
      color: "text-emerald-500",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    },
    {
      icon: Users,
      role: "Educators",
      description: "Provide personalized support to students at scale and track their learning progress.",
      color: "text-blue-500",
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20",
    },
    {
      icon: Wrench,
      role: "Teams",
      description: "Onboard new members faster and maintain code quality with instant expert feedback.",
      color: "text-amber-500",
      bg: "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/20",
    },
  ];

  const featureTags = ["Code Analysis", "Plagiarism Detection", "Smart Hints", "Step-by-Step", "Real-time Chat", "Context-Aware"];
  const useCaseTags = ["Students", "Developers", "Educators", "Teams", "Personalized", "Adaptive"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary">
              <Brain className="w-3.5 h-3.5 mr-1.5" /> AI-Powered Learning
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-secondary bg-clip-text text-transparent">
                AI Tutor
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Get intelligent, personalized learning support powered by advanced AI.
              From code analysis to step-by-step problem solving, your AI tutor is
              always ready to help you learn faster and better.
            </p>
            <Link to="/whiteboard">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary shadow-md hover:shadow-lg text-lg px-8">
                Try AI Tutor Now
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="features" className="w-full">
            <div className="flex justify-center mb-10">
              <TabsList className="bg-muted/40 border border-border/50 rounded-2xl p-1.5 h-auto gap-1">
                <TabsTrigger
                  value="features"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl px-6 py-3 text-base font-medium gap-2 transition-all"
                >
                  <Sparkles className="w-4.5 h-4.5" />
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="howItWorks"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-xl px-6 py-3 text-base font-medium gap-2 transition-all"
                >
                  <Wrench className="w-4.5 h-4.5" />
                  How It Works
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="features">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {features.map((feature, index) => {
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

              {/* Features Showcase */}
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
                      {featureTags.map((tag) => (
                        <span key={tag} className="px-3.5 py-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="howItWorks">
              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {steps.map((step, index) => (
                  <Card
                    key={index}
                    className="group border border-border/60 bg-card/50 hover:bg-accent/40 hover:border-primary/25 hover:shadow-lg transition-all duration-300 text-center"
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto border ${step.bg} group-hover:scale-110 transition-transform duration-300`}>
                        <span className={`text-lg font-bold ${step.color}`}>{step.num}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Perfect For — as feature cards */}
              <h3 className="text-2xl font-bold text-center mb-6">Perfect For</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {useCases.map((uc, index) => {
                  const Icon = uc.icon;
                  return (
                    <Card
                      key={index}
                      className="group border border-border/60 bg-card/50 hover:bg-accent/40 hover:border-primary/25 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${uc.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${uc.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{uc.role}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Use Cases Showcase */}
              <Card className="border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-blue-500/5 overflow-hidden">
                <CardContent className="p-10 sm:p-12 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)]" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Built for Everyone
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                      Whether you're a student, developer, educator, or team lead — the AI Tutor adapts to your workflow and helps you achieve more.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {useCaseTags.map((tag) => (
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

export default AITutor;
