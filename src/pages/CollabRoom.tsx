import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import { api } from "@/lib/api";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SyncVisionIcon } from "@/components/Logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MonitorOff,
  Phone,
  MessageSquare,
  X,
  Send,
  Users,
  Copy,
  Check,
  PenTool,
  Maximize2,
  Minimize2,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Share2,
  Brain,
  FileText,
  Code2,
  Lightbulb,
  Search,
  Loader2,
  BookOpen,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const CollabRoom = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [guestName, setGuestName] = useState(() => localStorage.getItem("SyncVision_guest_name") || "");
  const [guestJoined, setGuestJoined] = useState(false);
  const [guestId] = useState(() => {
    const existing = localStorage.getItem("SyncVision_guest_id");
    if (existing) return existing;
    const generated = globalThis.crypto?.randomUUID?.() || `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("SyncVision_guest_id", generated);
    return generated;
  });

  const currentDisplayName = isAuthenticated
    ? user?.displayName || "User"
    : guestName.trim() || "Guest";

  const currentUserId = isAuthenticated ? user?.id || "auth_user" : guestId;

  const {
    peers,
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    chatMessages,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendChat,
    sendBoardUpdate,
    shareBoard,
    boardShares,
    remoteBoardData,
    acceptBoardShare,
    dismissBoardShare,
    screenStream,
  } = useWebRTC(
    roomId || "default",
    currentUserId,
    currentDisplayName
  );

  const [showChat, setShowChat] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(true); // Show by default
  const [maxVisible, setMaxVisible] = useState(4);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedSharePeers, setSelectedSharePeers] = useState<string[]>([]);
  
  // ── Resizable panel state ──
  const [videoPanelWidth, setVideoPanelWidth] = useState(320); // Default 320px
  const [isResizing, setIsResizing] = useState(false);
  const [hiddenParticipants, setHiddenParticipants] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0); // Pagination for participant views

  // ── AI Assistant state ──
  const [sidebarTab, setSidebarTab] = useState<"chat" | "ai">("chat");
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const excalidrawRef = useRef<any>(null);
  const prevMsgCountRef = useRef(chatMessages.length);
  const showChatRef = useRef(showChat);
  showChatRef.current = showChat;

  // Connect on mount (stable — refs prevent re-fires)
  const connectRef = useRef(connect);
  const disconnectRef = useRef(disconnect);
  connectRef.current = connect;
  disconnectRef.current = disconnect;

  const hasUser = !!user;
  useEffect(() => {
    const canJoin = Boolean(roomId) && ((isAuthenticated && hasUser) || guestJoined);
    if (canJoin) {
      connectRef.current();
    }
    return () => disconnectRef.current();
  }, [roomId, isAuthenticated, hasUser, guestJoined]);

  // ── Handle panel resizing ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX - 16; // 16px for padding
      // Constrain between 200px and 600px
      if (newWidth >= 200 && newWidth <= 600) {
        setVideoPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  // ── Calculate how many users fit in the panel based on width ──
  const usersPerPage = videoPanelWidth < 280 ? 4 : videoPanelWidth < 400 ? 6 : 8;
  const allUsers = Array.from(remoteStreams.entries());
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const paginatedUsers = allUsers.slice(
    currentPage * usersPerPage,
    (currentPage + 1) * usersPerPage
  );

  // Reset page if out of range
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Attach screen share stream
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Track unread messages
  useEffect(() => {
    const newCount = chatMessages.length - prevMsgCountRef.current;
    if (newCount > 0 && !showChatRef.current) {
      setUnreadCount((c) => c + newCount);
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages.length]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput("");
  };

  // ── AI Assistant helpers ──
  const getTranscript = useCallback(() => {
    return chatMessages
      .map((m) => `[${m.displayName}]: ${m.message}`)
      .join("\n");
  }, [chatMessages]);

  const sendAiMessage = useCallback(async (userContent: string, systemContext?: string) => {
    setAiLoading(true);
    const newUserMsg = { role: "user" as const, content: userContent };
    setAiMessages((prev) => [...prev, newUserMsg]);

    try {
      const messagesForApi = systemContext
        ? [{ role: "user", content: systemContext }, newUserMsg]
        : [...aiMessages, newUserMsg];

      const res = await api.ai.chat(messagesForApi);
      const assistantMsg = res.message;
      setAiMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ AI service is unavailable right now. Please try again." },
      ]);
    } finally {
      setAiLoading(false);
    }
  }, [aiMessages]);

  const handleAiQuickAction = useCallback((action: string) => {
    const transcript = getTranscript();
    const contextNote = transcript
      ? `Here is the meeting/session chat transcript so far:\n\`\`\`\n${transcript}\n\`\`\`\n\n`
      : "No chat messages yet in this session.\n\n";

    const prompts: Record<string, string> = {
      summarize: `${contextNote}Please provide a well-structured summary of this meeting transcript. Include:\n- **Key Discussion Points** (main topics covered)\n- **Decisions Made**\n- **Action Items** (if any)\n- **Important Q&A**\nFormat it cleanly with markdown.`,
      
      analyze_code: `${contextNote}Analyze any code snippets shared in this session. For each code snippet:\n- **Language Detection**\n- **What it does** (brief explanation)\n- **Code Quality** (bugs, improvements, best practices)\n- **Time/Space Complexity** (if applicable)\n- **Suggestions** for optimization\nIf no code was shared, mention that.`,
      
      study_guide: `${contextNote}Based on this session's discussion, create a **Study Guide** that includes:\n- **Key Concepts** covered\n- **Important Definitions**\n- **Practice Questions** (3-5 questions to test understanding)\n- **Further Reading** suggestions\nFormat it clearly for a student to review later.`,
      
      action_items: `${contextNote}Extract all **Action Items** and **To-Do's** from this session transcript. Format as:\n- **Task** — Assigned to (if mentioned) — Priority/Deadline (if mentioned)\nIf no clear action items, provide suggestions based on the discussion.`,
      
      plagiarism_check: `${contextNote}Review the content shared in this session for originality:\n- Flag any text or code that appears to be directly copied from common sources\n- Check code snippets for common patterns that suggest copy-paste from tutorials/StackOverflow\n- Rate originality on a scale of 1-10\n- Provide specific feedback on which parts seem original vs. borrowed\nNote: This is a heuristic analysis, not a definitive plagiarism check.`,
      
      explain: `${contextNote}Based on the latest discussion topic in this session, provide a **step-by-step explanation** that:\n- Breaks down the concept into simple parts\n- Uses analogies where helpful\n- Provides examples\n- Suggests practice exercises`,
    };

    const prompt = prompts[action];
    if (prompt) {
      sendAiMessage(prompt);
    }
  }, [getTranscript, sendAiMessage]);

  const handleAiSend = () => {
    if (!aiInput.trim() || aiLoading) return;
    const transcript = getTranscript();
    const context = transcript
      ? `Context — meeting chat transcript:\n\`\`\`\n${transcript}\n\`\`\`\n\nUser question: ${aiInput.trim()}`
      : aiInput.trim();
    sendAiMessage(context);
    setAiInput("");
  };

  // Scroll AI messages
  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const handleLeave = () => {
    disconnect();
    navigate(isAuthenticated ? "/dashboard" : "/");
  };

  const handleJoinAsGuest = () => {
    const trimmed = guestName.trim();
    if (trimmed.length < 2) {
      toast.error("Enter a display name (at least 2 characters)");
      return;
    }
    localStorage.setItem("SyncVision_guest_name", trimmed);
    setGuestName(trimmed);
    setGuestJoined(true);
    toast.success("Joined room as guest");
  };

  const copyRoomLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts (HTTP on mobile)
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Room link copied!");
    } catch {
      toast.error("Could not copy — long-press the URL bar to copy");
    }
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Debounced board sync ──
  const boardDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteUpdateRef = useRef(false);

  const handleBoardChangeDebounced = (elements: any, _appState: any) => {
    // Ignore onChange fired by our own remote-update application
    if (isRemoteUpdateRef.current) return;

    // Clear any pending send
    if (boardDebounceRef.current) clearTimeout(boardDebounceRef.current);

    // Wait until user finishes the gesture (300 ms idle) before broadcasting
    boardDebounceRef.current = setTimeout(() => {
      const toSend = elements
        .filter((el: any) => !el.isDeleted)
        .map((el: any) => ({ ...el }));
      sendBoardUpdate({ elements: toSend });
    }, 300);
  };

  // When a board is shared to us, auto-open the board and load content
  const prevShareCountRef = useRef(boardShares.length);
  useEffect(() => {
    if (boardShares.length > prevShareCountRef.current) {
      const latest = boardShares[boardShares.length - 1];
      if (!latest.accepted) {
        acceptBoardShare(latest.id);
        setShowBoard(true);
        toast.success(`${latest.fromDisplayName} shared a board with you`);
        setTimeout(() => {
          if (excalidrawRef.current) {
            excalidrawRef.current.updateScene({
              elements: latest.boardData?.elements || [],
            });
          }
        }, 300);
      }
    }
    prevShareCountRef.current = boardShares.length;
  }, [boardShares, acceptBoardShare]);

  // Apply real-time board updates from remote peers by MERGING (not replacing)
  useEffect(() => {
    if (!remoteBoardData || !excalidrawRef.current || !showBoard) return;

    const remoteElements: any[] = remoteBoardData.elements || [];
    if (remoteElements.length === 0) return;

    // Current local elements
    const localElements: any[] = excalidrawRef.current.getSceneElements() || [];

    // Merge by element ID — keep whichever has the higher version
    const merged = new Map<string, any>();
    for (const el of localElements) {
      merged.set(el.id, el);
    }

    let hasChanges = false;
    for (const remote of remoteElements) {
      const local = merged.get(remote.id);
      if (!local) {
        merged.set(remote.id, remote);
        hasChanges = true;
      } else if ((remote.version || 0) >= (local.version || 0)) {
        merged.set(remote.id, remote);
        hasChanges = true;
      }
    }

    if (!hasChanges) return;

    // Apply merged elements without triggering outgoing broadcast
    isRemoteUpdateRef.current = true;
    excalidrawRef.current.updateScene({
      elements: Array.from(merged.values()),
    });
    // Let Excalidraw process the update before re-enabling outgoing broadcasts
    requestAnimationFrame(() => {
      isRemoteUpdateRef.current = false;
    });
  }, [remoteBoardData, showBoard]);

  const handleShareBoard = () => {
    if (selectedSharePeers.length === 0) {
      toast.error('Select at least one participant');
      return;
    }
    // Get current Excalidraw elements
    const elements = excalidrawRef.current?.getSceneElements?.() || [];
    shareBoard(selectedSharePeers, { elements }, 'Meeting Board');
    toast.success(`Board shared with ${selectedSharePeers.length} participant(s)`);
    setShowShareDialog(false);
    setSelectedSharePeers([]);
  };

  const toggleSharePeer = (peerId: string) => {
    setSelectedSharePeers((prev) =>
      prev.includes(peerId) ? prev.filter((id) => id !== peerId) : [...prev, peerId]
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Loading room...
      </div>
    );
  }

  if (!isAuthenticated && !guestJoined) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Join Meeting Room</h2>
          <p className="text-sm text-muted-foreground">
            You can join directly from this link without creating an account.
          </p>
          <div className="space-y-2">
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your display name"
              onKeyDown={(e) => e.key === "Enter" && handleJoinAsGuest()}
            />
            <Button className="w-full" onClick={handleJoinAsGuest}>
              Join Room
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/auth") }>
              Sign in instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalParticipants = peers.length + 1;
  const remoteEntries = Array.from(remoteStreams.entries());
  const remoteCount = remoteEntries.length;

  // If ≤3 remotes, all fit on screen. If 4+, show only maxVisible in the main grid.
  const useOverflow = remoteCount > 3;
  const visibleEntries = useOverflow ? remoteEntries.slice(0, maxVisible) : remoteEntries;
  const overflowEntries = useOverflow ? remoteEntries.slice(maxVisible) : [];
  const visibleCount = visibleEntries.length;

  // Grid layout for the visible tiles
  const getGridClass = () => {
    if (visibleCount <= 1) return "grid-cols-1 grid-rows-1";
    if (visibleCount <= 2) return "grid-cols-2 grid-rows-1";
    if (visibleCount <= 3) return "grid-cols-3 grid-rows-1";
    if (visibleCount <= 4) return "grid-cols-2 grid-rows-2";
    if (visibleCount <= 6) return "grid-cols-3 grid-rows-2";
    return "grid-cols-4 grid-rows-2";
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ── Top Bar ─────────────────────────────── */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <SyncVisionIcon size={28} />
          <span className="font-semibold text-sm">Room: {roomId?.slice(0, 8)}...</span>
          <Button variant="ghost" size="sm" onClick={copyRoomLink} className="gap-1 text-xs">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Users className="w-3 h-3" />
            {totalParticipants}
          </div>

          <Button
            variant={isAudioEnabled ? "outline" : "destructive"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>

          <Button
            variant={isVideoEnabled ? "outline" : "destructive"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>

          {/* Screen share — hide on mobile (not supported) */}
          {typeof navigator.mediaDevices?.getDisplayMedia === 'function' && (
            <Button
              variant={screenStream ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={screenStream ? stopScreenShare : startScreenShare}
              title={screenStream ? "Stop sharing" : "Share screen"}
            >
              {screenStream ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </Button>
          )}

          <Button
            variant={showBoard ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowBoard(!showBoard)}
            title={showBoard ? "Close board" : "Open board"}
          >
            <PenTool className="w-4 h-4" />
          </Button>

          <Button
            variant={showChat && sidebarTab === "chat" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 relative"
            onClick={() => {
              if (!showChat) {
                setUnreadCount(0);
                setSidebarTab("chat");
                setShowChat(true);
              } else if (sidebarTab !== "chat") {
                setSidebarTab("chat");
                setUnreadCount(0);
              } else {
                setShowChat(false);
              }
            }}
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          <Button
            variant={showChat && sidebarTab === "ai" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (!showChat) {
                setSidebarTab("ai");
                setShowChat(true);
              } else if (sidebarTab !== "ai") {
                setSidebarTab("ai");
              } else {
                setShowChat(false);
              }
            }}
            title="AI Assistant"
          >
            <Brain className="w-4 h-4" />
          </Button>

          <Button variant="destructive" size="sm" onClick={handleLeave} className="gap-1 ml-2">
            <Phone className="w-4 h-4" /> Leave
          </Button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Center area: Video Gallery OR Board ── */}
        <div className="flex-1 flex flex-col relative">

          {/* ── Floating draggable self-view (PiP) ── */}
          <DraggableSelfView
            localStream={localStream}
            displayName={currentDisplayName}
            isAudioEnabled={isAudioEnabled}
          />

          {/* Board Mode: board fills left area, videos go to right side */}
          {showBoard ? (
            <div className="flex-1 flex gap-2 p-2">
              {/* Board takes most of the space */}
              <div className="flex-1 flex flex-col relative">
                {/* Share Board button floating over the board */}
                {peers.length > 0 && (
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 z-50 gap-1 bg-gradient-primary shadow-lg"
                    onClick={() => { setSelectedSharePeers([]); setShowShareDialog(true); }}
                  >
                    <Share2 className="w-4 h-4" /> Share Board
                  </Button>
                )}
                <Excalidraw
                  theme="light"
                  onChange={handleBoardChangeDebounced}
                  excalidrawAPI={(api: any) => { excalidrawRef.current = api; }}
                  UIOptions={{
                    canvasActions: {
                      saveToActiveFile: false,
                      loadScene: false,
                      export: { saveFileToDisk: true },
                    },
                  }}
                />
              </div>

              {/* Resizable divider - only show if video panel is visible */}
              {showParticipantsPanel && remoteStreams.size > 0 && (
                <div
                  onMouseDown={() => setIsResizing(true)}
                  className={`w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors ${
                    isResizing ? "bg-primary" : ""
                  }`}
                />
              )}

              {/* Video panel on the right side - resizable and collapsible with pagination */}
              {showParticipantsPanel && remoteStreams.size > 0 && (
                <div 
                  style={{ width: `${videoPanelWidth}px` }}
                  className="shrink-0 border-l border-border bg-black/20 flex flex-col overflow-hidden"
                >
                  {/* Header with participant count and close button */}
                  <div className="flex-shrink-0 px-3 py-2 border-b border-border flex items-center justify-between bg-muted/30">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Participants ({remoteStreams.size})
                    </span>
                    <button
                      onClick={() => setShowParticipantsPanel(false)}
                      className="text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                      title="Hide participant panel"
                    >
                      Hide
                    </button>
                  </div>

                  {/* Video grid area - shows paginated participants */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 grid gap-2 p-2 overflow-hidden"
                      style={{
                        gridTemplateColumns: usersPerPage <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                        gridAutoRows: 'minmax(120px, 1fr)'
                      }}
                    >
                      {paginatedUsers.map(([peerId, stream]) => (
                        <div 
                          key={peerId} 
                          className="relative rounded-lg overflow-hidden border border-border bg-black min-h-0"
                        >
                          <RemoteVideoCompact stream={stream} peerId={peerId} peers={peers} />
                        </div>
                      ))}
                    </div>

                    {/* Pagination controls - bottom navigation */}
                    {totalPages > 1 && (
                      <div className="flex-shrink-0 flex items-center justify-between px-2 py-2 border-t border-border bg-muted/20">
                        <button
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="p-1 rounded hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {currentPage + 1} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={currentPage === totalPages - 1}
                          className="p-1 rounded hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Video-only mode: gallery layout like Teams */
            <div className="flex-1 flex flex-col">
              {/* Screen share takes main area if active */}
              {screenStream && (
                <div className="flex-1 relative bg-black flex items-center justify-center">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="max-w-full max-h-full object-contain"
                  />
                  <span className="absolute top-3 left-3 text-xs bg-black/70 text-white px-2 py-1 rounded-lg flex items-center gap-1.5">
                    <Monitor className="w-3 h-3" /> You are sharing your screen
                  </span>
                </div>
              )}

              {/* Video gallery (remotes only — self-view is floating) */}
              <div className={`${screenStream ? "h-28 shrink-0 border-t border-border bg-card/50 flex items-center gap-2 px-3 overflow-x-auto" : "flex-1 p-4 flex flex-col"}`}>
                {screenStream ? (
                  /* Compact video strip when screen sharing */
                  <>
                    {remoteEntries.map(([peerId, stream]) => (
                      <RemoteVideoCompact key={peerId} stream={stream} peerId={peerId} peers={peers} />
                    ))}
                  </>
                ) : (
                  <>
                    {/* Grid layout selector — only show when 4+ remotes */}
                    {useOverflow && (
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Show:</span>
                          {[4, 6, 8].map((n) => (
                            <button
                              key={n}
                              onClick={() => setMaxVisible(n)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                maxVisible === n
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        {(peers.length - visibleCount) > 0 && (
                          <button
                            onClick={() => setShowParticipantsPanel(!showParticipantsPanel)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Users className="w-3.5 h-3.5" />
                            +{peers.length - visibleCount} more
                            {showParticipantsPanel ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Main video grid */}
                    <div className={`grid ${getGridClass()} gap-3 w-full flex-1 min-h-0`}>
                      {visibleEntries.map(([peerId, stream]) => (
                        <RemoteVideoGallery key={peerId} stream={stream} peerId={peerId} peers={peers} />
                      ))}
                      {/* If alone, show a centered message */}
                      {remoteCount === 0 && (
                        <div className="flex items-center justify-center col-span-full row-span-full">
                          <div className="text-center text-muted-foreground space-y-2">
                            <Users className="w-12 h-12 mx-auto opacity-30" />
                            <p className="text-lg font-medium">Waiting for others to join...</p>
                            <p className="text-sm">Share the room link to invite participants</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Other Participants Panel ────────── */}
        {showParticipantsPanel && (peers.length > maxVisible || overflowEntries.length > 0) && (
          <div className="w-64 border-l border-border flex flex-col bg-card/95">
            <div className="p-3 text-sm font-semibold border-b border-border flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Other Participants ({peers.length - visibleCount})
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowParticipantsPanel(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {/* Peers with streams (overflow from the visible grid) */}
              {overflowEntries.map(([peerId, stream]) => {
                const peer = peers.find((p) => p.peerId === peerId);
                const name = peer?.displayName || peerId.slice(0, 8);
                return (
                  <div key={peerId} className="rounded-lg border border-border overflow-hidden bg-background">
                    <div className="relative aspect-video bg-muted">
                      <video
                        ref={(el) => {
                          if (el && el.srcObject !== stream) el.srcObject = stream;
                        }}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-2 py-1.5 text-xs font-medium truncate text-center">
                      {name}
                    </div>
                  </div>
                );
              })}
              {/* Peers without streams (beyond WebRTC connection cap — audience mode) */}
              {peers
                .filter((p) => !remoteStreams.has(p.peerId) && !visibleEntries.some(([id]) => id === p.peerId))
                .map((p) => (
                  <div key={p.peerId} className="rounded-lg border border-border overflow-hidden bg-background">
                    <div className="relative aspect-video bg-muted flex items-center justify-center">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-lg font-bold text-secondary-foreground">
                        {p.displayName?.charAt(0) || '?'}
                      </div>
                    </div>
                    <div className="px-2 py-1.5 text-xs font-medium truncate text-center">
                      {p.displayName}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Sidebar: Chat / AI Assistant ────────── */}
        {showChat && (
          <div className="w-80 border-l border-border flex flex-col bg-card">
            {/* Tab header */}
            <div className="border-b border-border flex items-center">
              <button
                className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${sidebarTab === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSidebarTab("chat")}
              >
                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                Chat
              </button>
              <button
                className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${sidebarTab === "ai" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSidebarTab("ai")}
              >
                <Brain className="w-3.5 h-3.5 inline mr-1" />
                AI Assistant
              </button>
              <Button variant="ghost" size="icon" className="h-7 w-7 mx-1" onClick={() => setShowChat(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* ── Chat Tab ── */}
            {sidebarTab === "chat" && (
              <>
                {/* Participants */}
                <div className="p-2 border-b border-border">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Participants ({totalParticipants})
                  </div>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    <div className="text-xs flex items-center gap-2 p-1 rounded bg-muted/50">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                        {currentDisplayName?.charAt(0)}
                      </div>
                      {currentDisplayName} (You)
                    </div>
                    {peers.map((p) => (
                      <div key={p.peerId} className="text-xs flex items-center gap-2 p-1 rounded">
                        <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-[9px] font-bold text-secondary-foreground">
                          {p.displayName?.charAt(0)}
                        </div>
                        {p.displayName}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-semibold text-primary">{msg.displayName}: </span>
                      <span className="text-foreground">{msg.message}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-2 border-t border-border flex gap-1">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Type a message..."
                    className="text-xs h-8"
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSendChat}>
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </>
            )}

            {/* ── AI Assistant Tab ── */}
            {sidebarTab === "ai" && (
              <>
                {/* Quick Actions */}
                <div className="p-2 border-b border-border">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      className="flex items-center gap-1.5 text-[11px] p-2 rounded-lg border border-border hover:bg-muted/70 transition-colors text-left disabled:opacity-50"
                      onClick={() => handleAiQuickAction("summarize")}
                      disabled={aiLoading}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Summarize Transcript</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-[11px] p-2 rounded-lg border border-border hover:bg-muted/70 transition-colors text-left disabled:opacity-50"
                      onClick={() => handleAiQuickAction("analyze_code")}
                      disabled={aiLoading}
                    >
                      <Code2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>Code Analysis</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-[11px] p-2 rounded-lg border border-border hover:bg-muted/70 transition-colors text-left disabled:opacity-50"
                      onClick={() => handleAiQuickAction("study_guide")}
                      disabled={aiLoading}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Study Guide</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-[11px] p-2 rounded-lg border border-border hover:bg-muted/70 transition-colors text-left disabled:opacity-50"
                      onClick={() => handleAiQuickAction("action_items")}
                      disabled={aiLoading}
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>Action Items</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-[11px] p-2 rounded-lg border border-border hover:bg-muted/70 transition-colors text-left disabled:opacity-50"
                      onClick={() => handleAiQuickAction("plagiarism_check")}
                      disabled={aiLoading}
                    >
                      <Search className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>Plagiarism Check</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-[11px] p-2 rounded-lg border border-border hover:bg-muted/70 transition-colors text-left disabled:opacity-50"
                      onClick={() => handleAiQuickAction("explain")}
                      disabled={aiLoading}
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      <span>Step-by-Step Guide</span>
                    </button>
                  </div>
                </div>

                {/* AI Messages */}
                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                  {aiMessages.length === 0 && !aiLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium">AI Assistant</p>
                      <p className="text-[10px] mt-1">Use quick actions above or ask anything about this session</p>
                    </div>
                  )}
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`text-xs ${msg.role === "user" ? "ml-6" : "mr-2"}`}>
                      {msg.role === "user" ? (
                        <div className="bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-3 py-2 whitespace-pre-wrap break-words">
                          {msg.content.length > 200
                            ? msg.content.includes("User question:")
                              ? msg.content.split("User question:").pop()?.trim()
                              : msg.content.slice(0, 80) + "..."
                            : msg.content}
                        </div>
                      ) : (
                        <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                          <AiMarkdown content={msg.content} />
                        </div>
                      )}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
                      <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        AI is thinking...
                      </div>
                    </div>
                  )}
                  <div ref={aiEndRef} />
                </div>

                {/* AI Input */}
                <div className="p-2 border-t border-border space-y-1">
                  <div className="flex gap-1">
                    <Textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAiSend();
                        }
                      }}
                      placeholder="Ask AI about this session..."
                      className="text-xs min-h-[32px] max-h-20 resize-none"
                      rows={1}
                    />
                    <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleAiSend} disabled={aiLoading || !aiInput.trim()}>
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                  {aiMessages.length > 0 && (
                    <button
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setAiMessages([])}
                    >
                      Clear AI chat
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Share Board Dialog ── */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Select participants to share your current board with. They'll be able to view and edit it.
            </p>
            {peers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No other participants in the room.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {/* Select All */}
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer border-b border-border pb-3">
                  <Checkbox
                    checked={selectedSharePeers.length === peers.length && peers.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSharePeers(peers.map((p) => p.peerId));
                      } else {
                        setSelectedSharePeers([]);
                      }
                    }}
                  />
                  <span className="text-sm font-medium">Select All ({peers.length})</span>
                </label>
                {peers.map((p) => (
                  <label key={p.peerId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <Checkbox
                      checked={selectedSharePeers.includes(p.peerId)}
                      onCheckedChange={() => toggleSharePeer(p.peerId)}
                    />
                    <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-secondary-foreground">
                      {p.displayName?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm">{p.displayName}</span>
                  </label>
                ))}
              </div>
            )}
            <Button
              className="w-full bg-gradient-primary"
              disabled={selectedSharePeers.length === 0}
              onClick={handleShareBoard}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share with {selectedSharePeers.length} participant{selectedSharePeers.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Compact video (used in strip above board or during screen share) */
function RemoteVideoCompact({ stream, peerId, peers }: { stream: MediaStream; peerId: string; peers: any[] }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  const peer = peers.find((p: any) => p.peerId === peerId);
  return (
    <div className="relative w-full h-full bg-muted overflow-hidden">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/60 text-white px-1 rounded">
        {peer?.displayName || "Peer"}
      </span>
    </div>
  );
}

/* ── Gallery video tile (full-size grid) */
function RemoteVideoGallery({ stream, peerId, peers }: { stream: MediaStream; peerId: string; peers: any[] }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  const peer = peers.find((p: any) => p.peerId === peerId);
  return (
    <div className="relative rounded-2xl overflow-hidden bg-muted min-h-0">
      <video ref={ref} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-lg">
        {peer?.displayName || "Peer"}
      </span>
    </div>
  );
}

/* ── Lightweight markdown renderer for AI responses ── */
function AiMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={elements.length} className="bg-background rounded-md p-2 my-1 overflow-x-auto text-[10px] border border-border">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(<h4 key={elements.length} className="font-bold text-xs mt-2 mb-0.5">{renderInline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={elements.length} className="font-bold text-sm mt-2 mb-0.5">{renderInline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={elements.length} className="font-bold text-sm mt-2 mb-0.5">{renderInline(line.slice(2))}</h2>);
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <div key={elements.length} className="border-l-2 border-primary/40 pl-2 my-1 text-muted-foreground italic">
          {renderInline(line.slice(2))}
        </div>
      );
    }
    // List item
    else if (/^[-*•]\s/.test(line)) {
      elements.push(
        <div key={elements.length} className="flex gap-1.5 my-0.5">
          <span className="text-muted-foreground shrink-0">•</span>
          <span>{renderInline(line.replace(/^[-*•]\s/, ""))}</span>
        </div>
      );
    }
    // Numbered list
    else if (/^\d+[.)]\s/.test(line)) {
      const match = line.match(/^(\d+[.)])\s(.*)/);
      elements.push(
        <div key={elements.length} className="flex gap-1.5 my-0.5">
          <span className="text-muted-foreground shrink-0">{match?.[1]}</span>
          <span>{renderInline(match?.[2] || "")}</span>
        </div>
      );
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={elements.length} className="h-1" />);
    }
    // Normal paragraph
    else {
      elements.push(<p key={elements.length} className="my-0.5">{renderInline(line)}</p>);
    }
    i++;
  }

  return <div className="text-xs whitespace-pre-wrap break-words leading-relaxed">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Process bold, italic, inline code
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={parts.length}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={parts.length}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code key={parts.length} className="bg-background px-1 py-0.5 rounded text-[10px] border border-border">
          {match[4]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts.length > 0 ? parts : text;
}

/* ── Draggable floating self-view (PiP) ──────── */
function DraggableSelfView({
  localStream,
  displayName,
  isAudioEnabled,
}: {
  localStream: MediaStream | null;
  displayName: string;
  isAudioEnabled: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 16, y: window.innerHeight - 150 - 16 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (videoRef.current && localStream) videoRef.current.srcObject = localStream;
  }, [localStream]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;
    // Clamp within viewport
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 150;
    setPos({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="fixed z-[100] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-grab active:cursor-grabbing select-none"
      style={{
        width: 200,
        height: 150,
        left: pos.x,
        top: pos.y,
        touchAction: "none",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover bg-muted"
      />
      <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-md">
        {displayName} (You)
      </span>
      {!isAudioEnabled && (
        <span className="absolute top-1.5 right-1.5 bg-red-500/80 rounded-full p-0.5">
          <MicOff className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </div>
  );
}

export default CollabRoom;
