import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";

const CollabRoom = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [guestName, setGuestName] = useState(() => localStorage.getItem("exceliboard_guest_name") || "");
  const [guestJoined, setGuestJoined] = useState(false);
  const [guestId] = useState(() => {
    const existing = localStorage.getItem("exceliboard_guest_id");
    if (existing) return existing;
    const generated = globalThis.crypto?.randomUUID?.() || `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("exceliboard_guest_id", generated);
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
    screenStream,
  } = useWebRTC(
    roomId || "default",
    currentUserId,
    currentDisplayName
  );

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Connect on mount
  useEffect(() => {
    const canJoin = Boolean(roomId) && ((isAuthenticated && !!user) || guestJoined);
    if (canJoin) {
      connect();
    }
    return () => disconnect();
  }, [roomId, isAuthenticated, user, guestJoined, connect, disconnect]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput("");
  };

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
    localStorage.setItem("exceliboard_guest_name", trimmed);
    setGuestName(trimmed);
    setGuestJoined(true);
    toast.success("Joined room as guest");
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Room link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBoardChange = (elements: any, state: any) => {
    // Debounce and send updates
    sendBoardUpdate({ elements });
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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">E</span>
          </div>
          <span className="font-semibold text-sm">Room: {roomId?.slice(0, 8)}...</span>
          <Button variant="ghost" size="sm" onClick={copyRoomLink} className="gap-1 text-xs">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Users className="w-3 h-3" />
            {peers.length + 1}
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

          <Button
            variant={screenStream ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={screenStream ? stopScreenShare : startScreenShare}
          >
            {screenStream ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </Button>

          <Button
            variant={showChat ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          <Button variant="destructive" size="sm" onClick={handleLeave} className="gap-1 ml-2">
            <Phone className="w-4 h-4" /> Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Whiteboard */}
        <div className="flex-1 relative">
          <Excalidraw
            theme="light"
            onChange={handleBoardChange}
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: { saveFileToDisk: true },
              },
            }}
          />
        </div>

        {/* Sidebar: Video + Chat */}
        <div className="w-72 border-l border-border flex flex-col bg-card">
          {/* Video Grid */}
          <div className="p-2 space-y-2 max-h-[40%] overflow-y-auto">
            {/* Local video */}
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                You
              </span>
            </div>

            {/* Remote videos */}
            {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
              <RemoteVideo key={peerId} stream={stream} peerId={peerId} peers={peers} />
            ))}
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="flex-1 flex flex-col border-t border-border">
              <div className="p-2 text-xs font-semibold border-b border-border flex justify-between items-center">
                <span>Chat</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowChat(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
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
            </div>
          )}

          {/* Participants list if chat hidden */}
          {!showChat && (
            <div className="flex-1 border-t border-border p-2">
              <div className="text-xs font-semibold mb-2">Participants ({peers.length + 1})</div>
              <div className="space-y-1">
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
          )}
        </div>
      </div>
    </div>
  );
};

// Remote video component
function RemoteVideo({ stream, peerId, peers }: { stream: MediaStream; peerId: string; peers: any[] }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  const peer = peers.find((p: any) => p.peerId === peerId);
  return (
    <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
        {peer?.displayName || "Peer"}
      </span>
    </div>
  );
}

export default CollabRoom;
