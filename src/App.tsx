import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Public pages
import Index from "./pages/Index";
import Features from "./pages/Features";
import AITutor from "./pages/AITutor";
import Whiteboard from "./pages/Whiteboard";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Dashboard & management pages
import DashboardHome from "./pages/DashboardHome";
import Meetings from "./pages/Meetings";
import MeetingRoom from "./pages/MeetingRoom";
import Interviews from "./pages/Interviews";
import InterviewRoom from "./pages/InterviewRoom";
import Lectures from "./pages/Lectures";
import LectureRoom from "./pages/LectureRoom";
import Boards from "./pages/Boards";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import CollabRoom from "./pages/CollabRoom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/ai-tutor" element={<AITutor />} />
            <Route path="/whiteboard" element={<Whiteboard />} />
            <Route path="/whiteboard/:id" element={<Whiteboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/meeting/:id" element={<MeetingRoom />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/interview/:id" element={<InterviewRoom />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/lecture/:id" element={<LectureRoom />} />
            <Route path="/boards" element={<Boards />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/room/:id" element={<CollabRoom />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
