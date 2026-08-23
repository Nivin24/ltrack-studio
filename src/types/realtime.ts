export type PresenceStatus = 'coding' | 'studying' | 'in_pairing' | 'idle';

export interface OnlineMemberPresence {
  userId: string;
  userName: string;
  avatar: string;
  status: PresenceStatus;
  currentActivity: string;
  isOnline: boolean;
  connectedAt?: string;
}

export type NotificationType =
  | 'pr_graded'
  | 'help_offered'
  | 'help_requested'
  | 'guidance_received'
  | 'pairing_invite';

export interface RealtimeNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkTab?: string;
  senderName?: string;
  senderAvatar?: string;
  read: boolean;
  timestamp: string;
}

export interface PairingChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  codeSnippet?: string;
  language?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  isVoiceNote?: boolean;
  timestamp: string;
}

export interface PairingRoomState {
  roomId: string;
  topicName: string;
  hostUser: { id: string; name: string; avatar: string };
  partnerUser: { id: string; name: string; avatar: string };
  scratchpadCode: string;
  scratchpadLanguage: string;
  sharedNotes: string;
  status: 'active' | 'resolved';
  callActive: boolean;
}
