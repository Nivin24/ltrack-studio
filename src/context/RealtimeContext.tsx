import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import { useLTrack } from './LTrackContext';
import {
  type PresenceStatus,
  type OnlineMemberPresence,
  type RealtimeNotification,
  type PairingRoomState,
  type PairingChatMessage
} from '../types/realtime';

export interface IncomingCallInfo {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  topicName?: string;
}

interface RealtimeContextType {
  isConnected: boolean;
  onlinePresence: OnlineMemberPresence[];
  notifications: RealtimeNotification[];
  unreadCount: number;
  myPresenceStatus: PresenceStatus;
  activePairingRoom: PairingRoomState | null;
  pairingMessages: PairingChatMessage[];
  incomingCall: IncomingCallInfo | null;
  isOutgoingCall: boolean;
  setMyPresenceStatus: (status: PresenceStatus) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  sendPairingMessage: (
    text: string,
    codeSnippet?: string,
    language?: string,
    audioUrl?: string,
    audioDurationSeconds?: number,
    isVoiceNote?: boolean
  ) => void;
  deletePairingMessage: (id: string) => void;
  updateScratchpadCode: (code: string) => void;
  updateSharedNotes: (notes: string) => void;
  initiateCall: () => void;
  acceptIncomingCall: () => void;
  rejectIncomingCall: () => void;
  cancelOutgoingCall: () => void;
  endCall: () => void;
  toggleCall: () => void;
  startPairingSession: (partnerUserId: string, topicName: string) => void;
  resolvePairingSession: () => void;
}

const initialMockNotifications: RealtimeNotification[] = [
  {
    id: 'notif_1',
    type: 'pr_graded',
    title: 'Assignment Evaluated: FastAPI Auth',
    message: 'Your Pull Request for Phase 3 was evaluated by Nivin. Score: 9.4/10 (+80 Points)',
    timestamp: '10m ago',
    read: false,
    linkTab: 'assignments'
  },
  {
    id: 'notif_2',
    type: 'help_requested',
    title: 'Peer Help: Alex requested pairing',
    message: 'Alex is struggling with pytest AsyncSession dependency overrides and requested your help.',
    timestamp: '25m ago',
    read: false,
    linkTab: 'live_pairing'
  }
];

const initialMockMessages: PairingChatMessage[] = [
  {
    id: 'msg_1',
    roomId: 'room_fastapi_di',
    senderId: 'usr_2',
    senderName: 'Rahul Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    text: 'Hey Alex! Let us inspect why your `get_db()` fixture is throwing an unclosed AsyncSession error in pytest.',
    timestamp: '10:14 AM'
  },
  {
    id: 'msg_2',
    roomId: 'room_fastapi_di',
    senderId: 'usr_4',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    text: 'Here is what my dependency looks like right now:',
    codeSnippet: `async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()`,
    language: 'python',
    timestamp: '10:15 AM'
  },
  {
    id: 'msg_3',
    roomId: 'room_fastapi_di',
    senderId: 'usr_2',
    senderName: 'Rahul Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    text: 'Found the issue! Listen to this quick audio breakdown of async generator cleanup:',
    isVoiceNote: true,
    audioDurationSeconds: 16,
    timestamp: '10:17 AM'
  }
];

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, members, setActiveTab } = useLTrack();

  const [isConnected, setIsConnected] = useState(false);
  const [myPresenceStatus, setMyPresenceStatus] = useState<PresenceStatus>('coding');

  // Incoming / Outgoing Call Confirmation State
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [isOutgoingCall, setIsOutgoingCall] = useState(false);

  const [notifications, setNotifications] = useState<RealtimeNotification[]>(() => {
    const saved = localStorage.getItem('ltrack_notifications');
    return saved ? JSON.parse(saved) : initialMockNotifications;
  });

  // Active Live Pairing Room
  const [activePairingRoom, setActivePairingRoom] = useState<PairingRoomState | null>(() => {
    return {
      roomId: 'room_fastapi_di',
      topicName: 'FastAPI Dependency Injection & Async Session Fixtures',
      hostUser: {
        id: 'usr_2',
        name: 'Rahul Sharma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      partnerUser: {
        id: 'usr_4',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      scratchpadCode: `# Shared Live Pairing Scratchpad - Phase 4 Concurrency
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

DATABASE_URL = "postgresql+asyncpg://admin:secret@localhost:5432/ltrack"
engine = create_async_engine(DATABASE_URL, echo=True, pool_size=10, max_overflow=20)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Fixed Dependency Injection Fixture
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
        # Auto-closed safely by context manager!`,
      scratchpadLanguage: 'python',
      sharedNotes: '• Verified: asyncpg pooled sessions must use async with syntax\n• Test fixture with AsyncClient overrides dependency_overrides[get_db]',
      status: 'active',
      callActive: false
    };
  });

  const [pairingMessages, setPairingMessages] = useState<PairingChatMessage[]>(() => {
    const saved = localStorage.getItem('ltrack_pairing_messages');
    return saved ? JSON.parse(saved) : initialMockMessages;
  });

  const wsRef = useRef<WebSocket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const peerInstanceRef = useRef<Peer | null>(null);
  const dataConnRef = useRef<DataConnection | null>(null);

  const [onlinePresence, setOnlinePresence] = useState<OnlineMemberPresence[]>([
    {
      userId: 'usr_1',
      userName: 'Nivin (Admin)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'coding',
      currentActivity: 'Evaluating Phase 4 PRs',
      isOnline: true
    },
    {
      userId: 'usr_2',
      userName: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'in_pairing',
      currentActivity: 'Live Pairing on FastAPI DI',
      isOnline: true
    },
    {
      userId: 'usr_3',
      userName: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'studying',
      currentActivity: 'Reading PostgreSQL Async Docs',
      isOnline: true
    },
    {
      userId: 'usr_4',
      userName: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'in_pairing',
      currentActivity: 'Live Pairing on FastAPI DI',
      isOnline: true
    },
    {
      userId: 'usr_5',
      userName: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      status: 'idle',
      currentActivity: 'Docker Hub CI/CD Pipeline',
      isOnline: false
    }
  ]);

  // Handle incoming real-time payload from Cloud WebRTC, WebSocket, or BroadcastChannel
  const handleRealtimePayload = (payload: any) => {
    if (!payload || !payload.type) return;

    if (payload.type === 'notification' && payload.data) {
      setNotifications((prev) => [payload.data, ...prev]);
    } else if (payload.type === 'presence_update' && payload.online_user_ids) {
      setOnlinePresence((prev) =>
        prev.map((p) => ({
          ...p,
          isOnline: payload.online_user_ids.includes(p.userId)
        }))
      );
    } else if (payload.type === 'pairing_chat' && payload.data) {
      const incomingMsg: PairingChatMessage = payload.data;
      setPairingMessages((prev) => {
        if (prev.some((m) => m.id === incomingMsg.id)) return prev;
        const updated = [...prev, incomingMsg];
        localStorage.setItem('ltrack_pairing_messages', JSON.stringify(updated));
        return updated;
      });
    } else if (payload.type === 'pairing_chat_delete' && payload.data?.id) {
      const targetId = payload.data.id;
      setPairingMessages((prev) => {
        const updated = prev.filter((m) => m.id !== targetId);
        localStorage.setItem('ltrack_pairing_messages', JSON.stringify(updated));
        return updated;
      });
    } else if (payload.type === 'code_change' && payload.data?.code !== undefined) {
      setActivePairingRoom((prev) => (prev ? { ...prev, scratchpadCode: payload.data.code } : null));
    } else if (payload.type === 'notes_change' && payload.data?.notes !== undefined) {
      setActivePairingRoom((prev) => (prev ? { ...prev, sharedNotes: payload.data.notes } : null));
    } else if (payload.type === 'incoming_call_request' && payload.data) {
      if (payload.data.callerId !== currentUser.id) {
        setIncomingCall(payload.data);
      }
    } else if (payload.type === 'call_accepted') {
      setIsOutgoingCall(false);
      setIncomingCall(null);
      setActivePairingRoom((prev) => (prev ? { ...prev, callActive: true } : null));
    } else if (payload.type === 'call_rejected') {
      setIsOutgoingCall(false);
      setIncomingCall(null);
    } else if (payload.type === 'call_cancelled') {
      setIncomingCall(null);
      setIsOutgoingCall(false);
    } else if (payload.type === 'call_ended') {
      setActivePairingRoom((prev) => (prev ? { ...prev, callActive: false } : null));
      setIsOutgoingCall(false);
      setIncomingCall(null);
    } else if (payload.type === 'call_toggle') {
      setActivePairingRoom((prev) => (prev ? { ...prev, callActive: !prev.callActive } : null));
    } else if (payload.type === 'session_resolve') {
      setActivePairingRoom((prev) => (prev ? { ...prev, status: 'resolved' } : null));
    }
  };

  // Broadcast payload across all active channels: Cloud P2P, Local BroadcastChannel, and WebSocket
  const broadcastPayload = (payload: any) => {
    // 1. Send via Cloud WebRTC DataConnection
    if (dataConnRef.current && dataConnRef.current.open) {
      try {
        dataConnRef.current.send(payload);
      } catch {}
    }

    // 2. Broadcast over local BroadcastChannel
    if (broadcastRef.current) {
      try {
        broadcastRef.current.postMessage(payload);
      } catch {}
    }

    // 3. Send over WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(payload));
      } catch {}
    }
  };

  // 1. Initialize BroadcastChannel for cross-tab local communication
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('ltrack_realtime_pairing');
      broadcastRef.current = channel;

      channel.onmessage = (event) => {
        handleRealtimePayload(event.data);
      };

      return () => {
        channel.close();
      };
    } catch {}
  }, [currentUser.id]);

  // 2. Initialize Cloud WebRTC PeerJS connection for internet multi-device sync
  useEffect(() => {
    const peerId = `ltrack_usr_${currentUser.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    let peer: Peer | null = null;

    try {
      peer = new Peer(peerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });
      peerInstanceRef.current = peer;

      peer.on('open', () => {
        setIsConnected(true);
      });

      // Handle incoming WebRTC data connection from peer on another laptop
      peer.on('connection', (conn) => {
        dataConnRef.current = conn;
        conn.on('data', (data) => {
          handleRealtimePayload(data);
        });
      });

      peer.on('error', () => {
        setIsConnected(false);
      });
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (peer) peer.destroy();
    };
  }, [currentUser.id]);

  // Connect WebRTC DataConnection to the peer in active pairing room
  useEffect(() => {
    if (!peerInstanceRef.current || !activePairingRoom) return;

    const isHost = currentUser.id === activePairingRoom.hostUser.id;
    const peerUser = isHost ? activePairingRoom.partnerUser : activePairingRoom.hostUser;
    const targetPeerId = `ltrack_usr_${peerUser.id.replace(/[^a-zA-Z0-9]/g, '')}`;

    const connectToPeer = () => {
      try {
        const conn = peerInstanceRef.current!.connect(targetPeerId, {
          reliable: true
        });

        conn.on('open', () => {
          dataConnRef.current = conn;
        });

        conn.on('data', (data) => {
          handleRealtimePayload(data);
        });
      } catch {}
    };

    const timer = setTimeout(connectToPeer, 1000);
    return () => clearTimeout(timer);
  }, [currentUser.id, activePairingRoom?.roomId]);

  // 3. Fallback WebSocket connection for local dev
  useEffect(() => {
    if (window.location.protocol === 'https:') return;

    const wsUrl = `ws://${window.location.hostname}:8080/api/v1/ws/${currentUser.id}`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => setIsConnected(true);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimePayload(data);
        } catch {}
      };
      socket.onclose = () => {};
    } catch {}

    return () => {
      if (socket) socket.close();
    };
  }, [currentUser.id]);

  useEffect(() => {
    localStorage.setItem('ltrack_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Send real-time pairing chat message / voice note
  const sendPairingMessage = (
    text: string,
    codeSnippet?: string,
    language?: string,
    audioUrl?: string,
    audioDurationSeconds?: number,
    isVoiceNote?: boolean
  ) => {
    if (!text.trim() && !codeSnippet?.trim() && !isVoiceNote) return;

    const newMessage: PairingChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId: activePairingRoom?.roomId || 'room_default',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text || '',
      codeSnippet,
      language: language || 'python',
      audioUrl,
      audioDurationSeconds,
      isVoiceNote,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPairingMessages((prev) => {
      const updated = [...prev, newMessage];
      localStorage.setItem('ltrack_pairing_messages', JSON.stringify(updated));
      return updated;
    });

    broadcastPayload({ type: 'pairing_chat', data: newMessage });
  };

  // Delete message for everyone in the room
  const deletePairingMessage = (id: string) => {
    setPairingMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem('ltrack_pairing_messages', JSON.stringify(updated));
      return updated;
    });

    broadcastPayload({ type: 'pairing_chat_delete', data: { id } });
  };

  // Real-time collaborative code sync
  const updateScratchpadCode = (code: string) => {
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, scratchpadCode: code } : null));
      broadcastPayload({ type: 'code_change', data: { code, userId: currentUser.id } });
    }
  };

  // Real-time collaborative notes sync
  const updateSharedNotes = (notes: string) => {
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, sharedNotes: notes } : null));
      broadcastPayload({ type: 'notes_change', data: { notes, userId: currentUser.id } });
    }
  };

  // Start outgoing call to peer (Sends incoming call request with accept/reject prompt)
  const initiateCall = () => {
    if (!activePairingRoom) return;
    setIsOutgoingCall(true);

    const callPayload = {
      callerId: currentUser.id,
      callerName: currentUser.name,
      callerAvatar: currentUser.avatar,
      topicName: activePairingRoom.topicName
    };

    broadcastPayload({ type: 'incoming_call_request', data: callPayload });
  };

  // Accept incoming call from peer
  const acceptIncomingCall = () => {
    setIncomingCall(null);
    setIsOutgoingCall(false);
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, callActive: true } : null));
      broadcastPayload({ type: 'call_accepted', data: { userId: currentUser.id } });
    }
  };

  // Reject / Decline incoming call
  const rejectIncomingCall = () => {
    setIncomingCall(null);
    setIsOutgoingCall(false);
    broadcastPayload({ type: 'call_rejected', data: { userId: currentUser.id } });
  };

  // Cancel outgoing calling request
  const cancelOutgoingCall = () => {
    setIsOutgoingCall(false);
    broadcastPayload({ type: 'call_cancelled', data: { userId: currentUser.id } });
  };

  // End active live voice call
  const endCall = () => {
    setIsOutgoingCall(false);
    setIncomingCall(null);
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, callActive: false } : null));
      broadcastPayload({ type: 'call_ended', data: { userId: currentUser.id } });
    }
  };

  const toggleCall = () => {
    if (activePairingRoom?.callActive) {
      endCall();
    } else if (isOutgoingCall) {
      cancelOutgoingCall();
    } else {
      initiateCall();
    }
  };

  const startPairingSession = (partnerUserId: string, topicName: string) => {
    const partner = members.find((m) => m.id === partnerUserId);
    if (!partner) return;

    setActivePairingRoom({
      roomId: `room_${Date.now()}`,
      topicName: `Live Pairing: ${topicName}`,
      hostUser: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      partnerUser: {
        id: partner.id,
        name: partner.name,
        avatar: partner.avatar
      },
      scratchpadCode: `# Live Pairing Studio: ${topicName}\n# Collaborative Python workspace\n\n`,
      scratchpadLanguage: 'python',
      sharedNotes: '',
      status: 'active',
      callActive: false
    });

    setActiveTab('live_pairing');
  };

  const resolvePairingSession = () => {
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, status: 'resolved' } : null));
      broadcastPayload({ type: 'session_resolve', data: { roomId: activePairingRoom.roomId } });
    }
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        onlinePresence,
        notifications,
        unreadCount,
        myPresenceStatus,
        activePairingRoom,
        pairingMessages,
        incomingCall,
        isOutgoingCall,
        setMyPresenceStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        sendPairingMessage,
        deletePairingMessage,
        updateScrpadCode: updateScratchpadCode,
        updateScratchpadCode,
        updateSharedNotes,
        initiateCall,
        acceptIncomingCall,
        rejectIncomingCall,
        cancelOutgoingCall,
        endCall,
        toggleCall,
        startPairingSession,
        resolvePairingSession
      } as any}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
