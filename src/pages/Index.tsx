import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "@/styles/whiteboard.css";
import { ChevronRight, Users, Video, PenTool, ArrowUpRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Section ──────────────────────── */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-foreground">
            Collaborate in Real-Time on a{" "}
            <span className="text-primary">Shared Whiteboard</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Draw, brainstorm, and meet with your team — all in one place.
            Built for educators, interviewers, and remote teams.
          </p>

          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-8 h-13 bg-primary hover:bg-primary/90">
                Register for Free <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 h-13">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Whiteboard Demo ──────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
              Try it right now — no sign-up needed
            </p>
          </div>
          <div className="relative group">
            <div
              className="rounded-2xl border border-border overflow-hidden shadow-xl bg-background landing-canvas-demo"
              style={{ height: "540px" }}
            >
              <Excalidraw
                theme="light"
                UIOptions={{
                  canvasActions: {
                    saveToActiveFile: false,
                    loadScene: false,
                    export: { saveFileToDisk: true },
                  },
                }}
              />
            </div>
            {/* Floating "Open full board" badge */}
            <Link
              to="/whiteboard"
              className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Open Full Board <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights (simple) ──────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <PenTool className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Infinite Whiteboard</h3>
                <p className="text-sm text-muted-foreground">
                  Draw shapes, write text, and sketch ideas on an Excalidraw-powered canvas.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <Video className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Video & Audio Calls</h3>
                <p className="text-sm text-muted-foreground">
                  Built-in peer-to-peer video conferencing with screen sharing.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="p-6 text-center">
                <Users className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Real-Time Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Invite your team and work together simultaneously — changes sync instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA Section (clean & simple) ──────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <Card className="border border-border bg-card">
            <CardContent className="p-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">
                Ready to Start Collaborating?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Create a free account and start using ExceliBoard with your team in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="px-8 bg-primary hover:bg-primary/90">
                    Sign Up Free
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
