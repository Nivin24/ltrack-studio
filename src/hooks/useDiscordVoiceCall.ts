import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { type MediaConnection } from 'peerjs';

interface VoiceCallOptions {
  roomId: string;
  userId: string;
  peerUserId: string;
  userName: string;
  callActive: boolean;
  onCallToggle: () => void;
}

export function useDiscordVoiceCall({
  roomId,
  userId,
  peerUserId,
  callActive,
  onCallToggle
}: VoiceCallOptions) {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [isPeerSpeaking, setIsPeerSpeaking] = useState(false);
  const [localAudioLevel, setLocalAudioLevel] = useState(0); // 0 - 100
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Play Discord-style sound chimes
  const playChime = useCallback((type: 'join' | 'leave' | 'mute' | 'unmute') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'join') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'leave') {
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'mute') {
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'unmute') {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {}
  }, []);

  // Broadcast channel for local fallback presence
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(`ltrack_voice_${roomId}`);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, data, senderId } = event.data || {};
        if (senderId === userId) return;

        if (type === 'voice_speaking') {
          setIsPeerSpeaking(data.isSpeaking);
        }
      };

      return () => {
        channel.close();
      };
    } catch {}
  }, [roomId, userId]);

  // Voice Activity Detection (VAD) & Audio Level Analyzer
  const startAudioAnalyzer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setLocalAudioLevel(normalized);

        const speakingNow = normalized > 10 && !isMicMuted;
        setIsLocalSpeaking((prev) => {
          if (prev !== speakingNow) {
            broadcastChannelRef.current?.postMessage({
              type: 'voice_speaking',
              senderId: userId,
              data: { isSpeaking: speakingNow }
            });
          }
          return speakingNow;
        });

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {}
  };

  // Attach Remote Stream to Audio Element
  const attachRemoteStream = (remoteStream: MediaStream) => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => {
        console.warn('Audio auto-play waiting for interaction:', err);
      });
    }
  };

  // Initialize PeerJS Voice Instance
  useEffect(() => {
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    const voicePeerId = `ltrack_voice_${cleanUserId}`;
    let peer: Peer | null = null;

    try {
      peer = new Peer(voicePeerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });
      peerRef.current = peer;

      // Handle incoming voice call from peer
      peer.on('call', async (incomingCall) => {
        try {
          // If we don't have mic yet, acquire it now
          let stream = localStreamRef.current;
          if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              },
              video: false
            });
            localStreamRef.current = stream;
            startAudioAnalyzer(stream);
          }

          incomingCall.answer(stream);
          callRef.current = incomingCall;

          incomingCall.on('stream', (remoteStream) => {
            attachRemoteStream(remoteStream);
            setConnectionStatus('connected');
          });
        } catch (err) {
          console.error('Error answering voice call:', err);
        }
      });
    } catch {}

    return () => {
      if (peer) peer.destroy();
    };
  }, [userId]);

  // Start Real Voice Call - Triggered when callActive is TRUE
  const startVoiceCall = async () => {
    setConnectionStatus('connecting');
    playChime('join');

    try {
      // 1. Acquire local microphone
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
        localStreamRef.current = stream;
        startAudioAnalyzer(stream);
      }

      // 2. If this user is caller or initiator, call the peer
      if (peerRef.current && peerUserId) {
        const cleanPeerId = peerUserId.replace(/[^a-zA-Z0-9]/g, '');
        const targetVoicePeerId = `ltrack_voice_${cleanPeerId}`;
        const outgoingCall = peerRef.current.call(targetVoicePeerId, stream);
        callRef.current = outgoingCall;

        if (outgoingCall) {
          outgoingCall.on('stream', (remoteStream) => {
            attachRemoteStream(remoteStream);
            setConnectionStatus('connected');
          });

          outgoingCall.on('error', (err) => {
            console.warn('Outgoing call peer error:', err);
          });
        }
      }
    } catch (err) {
      console.error('Failed to start voice call:', err);
      setConnectionStatus('idle');
    }
  };

  // Stop Voice Call and Release Microphone
  const stopVoiceCall = useCallback(() => {
    playChime('leave');

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setIsLocalSpeaking(false);
    setIsPeerSpeaking(false);
    setLocalAudioLevel(0);
    setConnectionStatus('idle');
  }, [playChime]);

  // Synchronize with callActive state
  useEffect(() => {
    if (callActive && connectionStatus === 'idle') {
      startVoiceCall();
    } else if (!callActive && connectionStatus !== 'idle') {
      stopVoiceCall();
    }
  }, [callActive, connectionStatus, stopVoiceCall]);

  // Toggle Mute Mic
  const toggleMute = () => {
    const nextMute = !isMicMuted;
    setIsMicMuted(nextMute);
    playChime(nextMute ? 'mute' : 'unmute');

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMute;
      });
    }

    if (nextMute) {
      setIsLocalSpeaking(false);
      broadcastChannelRef.current?.postMessage({
        type: 'voice_speaking',
        senderId: userId,
        data: { isSpeaking: false }
      });
    }
  };

  // Toggle Deafen Sound
  const toggleDeafen = () => {
    const nextDeafen = !isDeafened;
    setIsDeafened(nextDeafen);
    playChime(nextDeafen ? 'mute' : 'unmute');

    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = nextDeafen;
    }
  };

  return {
    isMicMuted,
    isDeafened,
    isLocalSpeaking,
    isPeerSpeaking,
    localAudioLevel,
    connectionStatus,
    remoteAudioRef,
    toggleMute,
    toggleDeafen,
    endCall: onCallToggle
  };
}
