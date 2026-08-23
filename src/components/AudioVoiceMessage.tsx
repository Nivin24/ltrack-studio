import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface AudioVoiceMessageProps {
  audioUrl?: string;
  durationSeconds?: number;
  isMine?: boolean;
  senderName: string;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;
type PlaybackSpeed = typeof SPEED_OPTIONS[number];

// Generate compact consistent waveform bar heights from audio/sender hash
function generateWaveformBars(count: number, seed: string): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const pseudo = Math.abs(Math.sin(hash + i * 0.85) * 0.7 + Math.cos(hash * 0.5 + i * 0.3) * 0.3);
    const height = Math.floor(4 + pseudo * 14); // between 4px and 18px
    bars.push(height);
  }
  return bars;
}

export const AudioVoiceMessage: React.FC<AudioVoiceMessageProps> = ({
  audioUrl,
  durationSeconds = 18,
  isMine = false,
  senderName
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [realDuration, setRealDuration] = useState(durationSeconds || 18);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const waveformBars = useRef(generateWaveformBars(20, senderName + (durationSeconds || 18)));

  const totalDuration = realDuration;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Initialize real audio element when audioUrl is present
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setRealDuration(Math.round(audio.duration));
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl]);

  // Update playback speed on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Synthetic beep for mock audio when no real audioUrl exists
  const playSynthesizedVoice = (playbackSpeed: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + Math.random() * 80, ctx.currentTime);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15 / playbackSpeed);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18 / playbackSpeed);
    } catch {
      // Ignore audioContext block
    }
  };

  // Toggle Play / Pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(true);
      });
    } else {
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.pause();
    }
    if (synthIntervalRef.current) {
      window.clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    setIsPlaying(false);
  };

  // Synthetic fallback timer when no real audioUrl is present
  useEffect(() => {
    if (isPlaying && !audioUrl) {
      const stepMs = 100;
      synthIntervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + (stepMs / 1000) * speed;
          if (next >= totalDuration) {
            pauseAudio();
            return 0;
          }
          if (Math.floor(next * 2) !== Math.floor(prev * 2)) {
            playSynthesizedVoice(speed);
          }
          return next;
        });
      }, stepMs);
    } else if (!isPlaying && !audioUrl) {
      if (synthIntervalRef.current) {
        window.clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
    }

    return () => {
      if (synthIntervalRef.current) {
        window.clearInterval(synthIntervalRef.current);
      }
    };
  }, [isPlaying, speed, totalDuration, audioUrl]);

  // Cycle playback speed: 0.5x -> 1x -> 1.5x -> 2x -> 0.5x
  const handleSpeedCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = SPEED_OPTIONS.indexOf(speed);
    const nextSpeed = SPEED_OPTIONS[(currentIndex + 1) % SPEED_OPTIONS.length];
    setSpeed(nextSpeed);
  };

  // Scrub progress on waveform click
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = progressRatio * totalDuration;
    setCurrentTime(newTime);
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = newTime;
    }
  };

  const progressFraction = Math.min(1, currentTime / (totalDuration || 1));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
        minWidth: '180px',
        maxWidth: '240px',
        padding: '2px 0'
      }}
    >
      {/* Waveform Player Main Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Compact Play/Pause Circle Button */}
        <button
          onClick={togglePlayPause}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isMine
              ? 'linear-gradient(135deg, #d4a373 0%, #c89666 100%)'
              : 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: isMine
              ? '0 2px 8px rgba(212, 163, 115, 0.35)'
              : '0 2px 8px rgba(52, 211, 153, 0.35)',
            transition: 'transform 0.15s ease'
          }}
          title={isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
        >
          {isPlaying ? (
            <Pause size={13} fill="#0e0e12" color="#0e0e12" />
          ) : (
            <Play size={13} fill="#0e0e12" color="#0e0e12" style={{ marginLeft: '1px' }} />
          )}
        </button>

        {/* Compact Interactive Audio Waveform Visualizer */}
        <div
          onClick={handleWaveformClick}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '22px',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '6px',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
          title="Click to seek"
        >
          {waveformBars.current.map((barHeight, idx) => {
            const barFraction = idx / waveformBars.current.length;
            const isPlayed = barFraction <= progressFraction;

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${barHeight}px`,
                  borderRadius: '2px',
                  background: isPlayed
                    ? isMine
                      ? '#d4a373'
                      : '#34d399'
                    : 'rgba(255, 255, 255, 0.22)',
                  transition: 'background 0.1s ease',
                  transform: isPlaying && isPlayed ? 'scaleY(1.1)' : 'scaleY(1)'
                }}
              />
            );
          })}
        </div>

        {/* Compact WhatsApp-Style Speed Control Pill Button */}
        <button
          onClick={handleSpeedCycle}
          style={{
            padding: '2px 6px',
            borderRadius: '8px',
            background: speed === 1 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(212, 163, 115, 0.25)',
            border: '1px solid',
            borderColor: speed === 1 ? 'rgba(255, 255, 255, 0.12)' : '#d4a373',
            color: speed === 1 ? 'var(--text-main)' : '#d4a373',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
            userSelect: 'none'
          }}
          title="Change playback speed (0.5x, 1x, 1.5x, 2x)"
        >
          {speed}x
        </button>
      </div>

      {/* Footer Row: Progress Time & Voice Note Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>

        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: isMine ? '#d4a373' : '#34d399', fontWeight: 600 }}>
          <Mic size={10} /> Voice
        </span>
      </div>
    </div>
  );
};
