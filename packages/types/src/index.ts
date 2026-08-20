// ═══════════════════════════════════════════════
// SyncVision — Shared Type Definitions
// ═══════════════════════════════════════════════

export type UserRole = 'student' | 'teacher' | 'interviewer' | 'interviewee' | 'org_admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  orgId?: string;
  timezone: string;
  locale: string;
  createdAt: string;
  lastActiveAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEffects: boolean;
  compactMode: boolean;
}

export type SessionType = 'meeting' | 'interview' | 'lecture';
export type SessionStatus = 'scheduled' | 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  type: SessionType;
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  participants: Participant[];
  startTime: string;
  endTime?: string;
  scheduledDuration?: number;
  status: SessionStatus;
  roomConfig: RoomConfig;
  createdAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: 'host' | 'co-host' | 'presenter' | 'participant' | 'viewer';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: string;
  status: 'connected' | 'disconnected' | 'waiting';
}

export interface RoomConfig {
  waitingRoom: boolean;
  recording: boolean;
  chat: boolean;
  boardType?: BoardType;
  maxParticipants: number;
  allowScreenShare: boolean;
}

export type BoardType = 'whiteboard' | 'code' | 'presentation' | 'diagram';

export interface Board {
  id: string;
  name: string;
  type: BoardType;
  ownerId: string;
  orgId?: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  collaborators: string[];
  isPublic: boolean;
  version: number;
}

export interface Interview extends Session {
  interviewType: 'one_on_one' | 'panel' | 'assessment';
  candidateId: string;
  candidateName: string;
  problemStatement?: string;
  suspicionScore: number;
  antiCheatSignals: AntiCheatSignal[];
  aiInsights?: AIInterviewInsight[];
  notes: InterviewNote[];
  timeline: TimelineEvent[];
}

export interface AntiCheatSignal {
  id: string;
  type: 'tab_switch' | 'window_blur' | 'large_paste' | 'camera_off' | 'devtools_open' | 'typing_anomaly';
  timestamp: string;
  metadata?: Record<string, unknown>;
  weight: number;
}

export interface AIInterviewInsight {
  id: string;
  type: 'follow_up_question' | 'skill_signal' | 'code_analysis' | 'summary';
  content: string;
  confidence: number;
  timestamp: string;
}

export interface InterviewNote {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  isPrivate: boolean;
}

export interface TimelineEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actorId: string;
}

export interface Lecture extends Session {
  attendeeCount: number;
  polls: Poll[];
  questionsQueue: Question[];
  isRecording: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Question {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isAnswered: boolean;
  upvotes: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'file' | 'code' | 'system';
  timestamp: string;
  reactions: MessageReaction[];
  replyTo?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface ScheduledEvent {
  id: string;
  orgId?: string;
  type: SessionType;
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  participants: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  recurrence?: string;
  reminders: number[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  roomConfig: RoomConfig;
}

export interface DashboardStats {
  totalBoards: number;
  totalMeetings: number;
  totalInterviews: number;
  totalLectures: number;
  collaborators: number;
  hoursThisWeek: number;
  aiCreditsUsed: number;
  storageUsedMB: number;
}

export interface ActivityItem {
  id: string;
  type: 'board_created' | 'meeting_started' | 'interview_completed' | 'lecture_ended' | 'user_joined';
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorAvatar?: string;
}

export interface Notification {
  id: string;
  type: 'meeting_invite' | 'interview_scheduled' | 'lecture_starting' | 'board_shared' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Socket event types
export interface SocketUser {
  id: string;
  socketId: string;
  displayName: string;
  email?: string;
  role: string;
  avatarUrl?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: string;
}

export interface DrawStroke {
  id?: string;
  userId?: string;
  userName?: string;
  tool: string;
  color: string;
  lineWidth: number;
  points: { x: number; y: number }[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  logoUrl?: string;
  memberCount: number;
  settings: OrgSettings;
}

export interface OrgSettings {
  recordingEnabled: boolean;
  aiEnabled: boolean;
  maxParticipants: number;
  brandColor?: string;
}
