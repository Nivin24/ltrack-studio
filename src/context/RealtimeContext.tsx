import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLTrack } from './LTrackContext';
import type {
  OnlineMemberPresence,
  RealtimeNotification,
  PairingChatMessage,
  PairingRoomState,
  PresenceStatus
} from '../types/realtime';

interface RealtimeContextType {
  isConnected: boolean;
  onlinePresence: OnlineMemberPresence[];
  notifications: RealtimeNotification[];
  unreadCount: number;
  activePairingRoom: PairingRoomState | null;
  pairingMessages: PairingChatMessage[];
  myPresenceStatus: PresenceStatus;
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
  toggleCall: () => void;
  startPairingSession: (partnerUserId: string, topicName: string) => void;
  resolvePairingSession: () => void;
  closePairingSession: () => void;
}

const initialMockNotifications: RealtimeNotification[] = [
  {
    id: 'notif_1',
    type: 'pr_graded',
    title: 'PR Solution Evaluated! 🎉',
    message: 'Nivin (Admin) graded your PR #14 on OAuth2 JWT Authentication with 9.8/10.',
    linkTab: 'assignments',
    senderName: 'Nivin (Admin)',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    read: false,
    timestamp: '5m ago'
  },
  {
    id: 'notif_2',
    type: 'help_requested',
    title: 'New Peer Help Request 🆘',
    message: 'Alex Rivera is seeking help on FastAPI pytest fixtures in Phase 4.',
    linkTab: 'peer_help',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    read: false,
    timestamp: '25m ago'
  },
  {
    id: 'notif_3',
    type: 'guidance_received',
    title: 'Personalized Guidance Dispatched 🎯',
    message: 'Coordinator posted a 1-on-1 action plan for Async ORM concurrency.',
    linkTab: 'profile',
    senderName: 'Nivin (Admin)',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    read: true,
    timestamp: '2h ago'
  }
];

const initialPairingSampleMessages: PairingChatMessage[] = [
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

  const [pairingMessages, setPairingMessages] = useState<PairingChatMessage[]>(initialPairingSampleMessages);

  const wsRef = useRef<WebSocket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Online presence list derived from members
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

  // Handle incoming real-time payload from WebSocket or BroadcastChannel
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
        return [...prev, incomingMsg];
      });
    } else if (payload.type === 'pairing_chat_delete' && payload.data?.id) {
      const targetId = payload.data.id;
      setPairingMessages((prev) => prev.filter((m) => m.id !== targetId));
    } else if (payload.type === 'code_change' && payload.data?.code !== undefined) {
      setActivePairingRoom((prev) => (prev ? { ...prev, scratchpadCode: payload.data.code } : null));
    } else if (payload.type === 'notes_change' && payload.data?.notes !== undefined) {
      setActivePairingRoom((prev) => (prev ? { ...prev, sharedNotes: payload.data.notes } : null));
    } else if (payload.type === 'call_toggle') {
      setActivePairingRoom((prev) => (prev ? { ...prev, callActive: !prev.callActive } : null));
    } else if (payload.type === 'session_resolve') {
      setActivePairingRoom((prev) => (prev ? { ...prev, status: 'resolved' } : null));
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
    } catch {
      // BroadcastChannel fallback
    }
  }, []);

  // 2. Connect to WebSocket server
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8080/api/v1/ws/${currentUser.id}`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimePayload(data);
        } catch {
          // ignore
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

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

    setPairingMessages((prev) => [...prev, newMessage]);

    const payload = { type: 'pairing_chat', data: newMessage };

    // Broadcast over BroadcastChannel for instant cross-tab sync
    if (broadcastRef.current) {
      broadcastRef.current.postMessage(payload);
    }

    // Send over WebSocket to remote users
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // Delete message for everyone in the room
  const deletePairingMessage = (id: string) => {
    setPairingMessages((prev) => prev.filter((m) => m.id !== id));

    const payload = { type: 'pairing_chat_delete', data: { id } };

    if (broadcastRef.current) {
      broadcastRef.current.postMessage(payload);
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // Real-time collaborative code sync
  const updateScratchpadCode = (code: string) => {
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, scratchpadCode: code } : null));

      const payload = { type: 'code_change', data: { code, userId: currentUser.id } };

      if (broadcastRef.current) {
        broadcastRef.current.postMessage(payload);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }
    }
  };

  // Real-time collaborative notes sync
  const updateSharedNotes = (notes: string) => {
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, sharedNotes: notes } : null));

      const payload = { type: 'notes_change', data: { notes, userId: currentUser.id } };

      if (broadcastRef.current) {
        broadcastRef.current.postMessage(payload);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }
    }
  };

  // Toggle call state across participants
  const toggleCall = () => {
    if (activePairingRoom) {
      setActivePairingRoom((prev) => (prev ? { ...prev, callActive: !prev.callActive } : null));

      const payload = { type: 'call_toggle', data: { userId: currentUser.id } };

      if (broadcastRef.current) {
        broadcastRef.current.postMessage(payload);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }
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

      const payload = { type: 'session_resolve', data: { roomId: activePairingRoom.roomId } };

      if (broadcastRef.current) {
        broadcastRef.current.postMessage(payload);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }
    }
  };

  const closePairingSession = () => {
    setActivePairingRoom(null);
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        onlinePresence,
        notifications,
        unreadCount,
        activePairingRoom,
        pairingMessages,
        myPresenceStatus,
        setMyPresenceStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        sendPairingMessage,
        deletePairingMessage,
        updateScratchpadCode,
        updateSharedNotes,
        toggleCall,
        startPairingSession,
        resolvePairingSession,
        closePairingSession
      }}
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
