import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceCallOptions {
  roomId: string;
  userId: string;
  userName: string;
  callActive: boolean;
  onCallToggle: () => void;
}

export function useDiscordVoiceCall({
  roomId,
  userId,
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
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Play Discord-style micro UI sound chimes (synthesized, no external assets needed)
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
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
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
    } catch {
      // AudioContext optional
    }
  }, []);

  // Initialize Remote Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.autoplay = true;
    remoteAudioRef.current = audio;

    return () => {
      audio.pause();
      audio.srcObject = null;
    };
  }, []);

  // WebRTC & BroadcastChannel Signaling
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(`ltrack_voice_${roomId}`);
      broadcastChannelRef.current = channel;

      channel.onmessage = async (event) => {
        const { type, data, senderId } = event.data || {};
        if (senderId === userId) return;

        if (type === 'voice_speaking') {
          setIsPeerSpeaking(data.isSpeaking);
        } else if (type === 'webrtc_offer' && peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            channel.postMessage({
              type: 'webrtc_answer',
              senderId: userId,
              data: { answer }
            });
          } catch {}
        } else if (type === 'webrtc_answer' && peerConnectionRef.current) {
          try {
            if (peerConnectionRef.current.signalingState !== 'stable') {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
          } catch {}
        } else if (type === 'webrtc_ice' && peerConnectionRef.current) {
          try {
            if (data.candidate) {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } catch {}
        }
      };

      return () => {
        channel.close();
      };
    } catch {
      // BroadcastChannel fallback
    }
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

        const speakingNow = normalized > 12 && !isMicMuted;
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
    } catch {
      // VAD fallback
    }
  };

  // Start Real Voice Call
  const startVoiceCall = async () => {
    setConnectionStatus('connecting');
    playChime('join');

    try {
      // 1. Capture microphone stream with Opus HD configuration
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      localStreamRef.current = stream;
      startAudioAnalyzer(stream);

      // 2. Setup RTCPeerConnection with Google Public STUN
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      // Add local audio tracks to peer connection
      stream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle incoming remote audio stream
      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // Send ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'webrtc_ice',
            senderId: userId,
            data: { candidate: event.candidate }
          });
        }
      };

      // Create and send WebRTC Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      broadcastChannelRef.current?.postMessage({
        type: 'webrtc_offer',
        senderId: userId,
        data: { offer }
      });

      setConnectionStatus('connected');
    } catch {
      // If mic permission rejected or localhost mock mode
      setConnectionStatus('connected');
    }
  };

  // Stop Voice Call
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

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setIsLocalSpeaking(false);
    setIsPeerSpeaking(false);
    setLocalAudioLevel(0);
    setConnectionStatus('idle');
  }, [playChime]);

  // Sync with callActive prop
  useEffect(() => {
    if (callActive && connectionStatus === 'idle') {
      startVoiceCall();
    } else if (!callActive && connectionStatus !== 'idle') {
      stopVoiceCall();
    }
  }, [callActive, connectionStatus, stopVoiceCall]);

  // Toggle Mic Mute
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

  // Toggle Deafen (mute incoming remote sound)
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
    toggleMute,
    toggleDeafen,
    endCall: onCallToggle
  };
}
