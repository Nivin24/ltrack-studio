import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useRealtime } from '../context/RealtimeContext';
import {
  Settings,
  User,
  Code2,
  Mic,
  Bell,
  Database,
  Save,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  Check,
  Globe
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    updateMember,
    exportDataJSON,
    importDataJSON,
    resetToDefault
  } = useLTrack();

  const { isConnected } = useRealtime();

  // Settings Tabs
  const [activeSection, setActiveSection] = useState<
    'general' | 'editor' | 'voice' | 'notifications' | 'data'
  >('general');

  // Form State
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [github, setGithub] = useState(currentUser.github || '');
  const [targetHours, setTargetHours] = useState<number>(currentUser.targetHoursPerWeek || 10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editor Settings (Stored in localStorage)
  const [indentSize, setIndentSize] = useState<number>(() => {
    return Number(localStorage.getItem('ltrack_setting_indent_size') || 4);
  });
  const [autoCloseBrackets, setAutoCloseBrackets] = useState<boolean>(() => {
    return localStorage.getItem('ltrack_setting_auto_brackets') !== 'false';
  });
  const [editorFontSize, setEditorFontSize] = useState<string>(() => {
    return localStorage.getItem('ltrack_setting_font_size') || '0.84rem';
  });

  // Voice & Audio Settings
  const [echoCancellation, setEchoCancellation] = useState<boolean>(() => {
    return localStorage.getItem('ltrack_setting_echo_cancel') !== 'false';
  });
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(() => {
    return localStorage.getItem('ltrack_setting_noise_suppress') !== 'false';
  });
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);

  // Notification Settings
  const [soundOnMention, setSoundOnMention] = useState<boolean>(() => {
    return localStorage.getItem('ltrack_setting_sound_mention') !== 'false';
  });
  const [soundOnCall, setSoundOnCall] = useState<boolean>(() => {
    return localStorage.getItem('ltrack_setting_sound_call') !== 'false';
  });

  // Import JSON error state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Save General Profile & Study Goals
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember(currentUser.id, {
      name,
      bio,
      github,
      targetHoursPerWeek: Number(targetHours)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Save Editor Settings
  const handleSaveEditor = () => {
    localStorage.setItem('ltrack_setting_indent_size', String(indentSize));
    localStorage.setItem('ltrack_setting_auto_brackets', String(autoCloseBrackets));
    localStorage.setItem('ltrack_setting_font_size', editorFontSize);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Save Voice Settings
  const handleSaveVoice = () => {
    localStorage.setItem('ltrack_setting_echo_cancel', String(echoCancellation));
    localStorage.setItem('ltrack_setting_noise_suppress', String(noiseSuppression));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Test Chime
  const handleTestAudio = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
      setTestAudioPlaying(true);
      setTimeout(() => setTestAudioPlaying(false), 400);
    } catch {}
  };

  // Save Notification Settings
  const handleSaveNotifications = () => {
    localStorage.setItem('ltrack_setting_sound_mention', String(soundOnMention));
    localStorage.setItem('ltrack_setting_sound_call', String(soundOnCall));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Handle Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDataJSON(content);
      if (ok) {
        setImportStatus('Data imported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const navItems = [
    { id: 'general', label: 'Profile & Study Goals', icon: User },
    { id: 'editor', label: 'Python Editor & IDE', icon: Code2 },
    { id: 'voice', label: 'Voice & WebRTC Audio', icon: Mic },
    { id: 'notifications', label: 'Notifications & Mentions', icon: Bell },
    { id: 'data', label: 'Cloud Sync & Data Backup', icon: Database }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Settings size={12} /> System Preferences
              </span>
              <span style={{ fontSize: '0.74rem', color: isConnected ? '#34d399' : '#d4a373', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={13} /> {isConnected ? 'FastAPI Cloud Online' : 'Local Sandbox Mode'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Settings & Customization
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Configure your personal learning pace, Python IDE keyboard shortcuts, audio devices, and cloud sync backups.
            </p>
          </div>

          {savedSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#34d399', padding: '6px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, animation: 'appleFadeIn 0.2s ease' }}>
              <Check size={14} /> Preferences Saved!
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Split Grid: Left Sidebar Navigation + Right Settings Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Settings Rail */}
        <div className="glass-panel" style={{ padding: '12px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as typeof activeSection)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(212, 163, 115, 0.35)' : '1px solid transparent',
                  background: isActive ? 'rgba(212, 163, 115, 0.14)' : 'transparent',
                  color: isActive ? '#d4a373' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#d4a373' : 'currentColor'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content Panel */}
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
          
          {/* 1. General Profile & Study Goals */}
          {activeSection === 'general' && (
            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                  Profile & Study Goals
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Manage your public engineer identity and study schedule targets.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    GitHub Handle
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Bio & Professional Summary
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell peers what you're working on..."
                />
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#eae6e1' }}>
                    Weekly Study Target
                  </label>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#d4a373' }}>
                    {targetHours} Hours / Week
                  </span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={30}
                  step={1}
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#d4a373', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  <span>4 hrs (Light)</span>
                  <span>10 hrs (Recommended)</span>
                  <span>30 hrs (Intensive)</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Save Profile Settings
                </button>
              </div>
            </form>
          )}

          {/* 2. Python Editor & IDE Preferences */}
          {activeSection === 'editor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                  Python IDE & Code Editor Preferences
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Customize indentation engine, auto-closing mechanics, and editor typography.
                </p>
              </div>

              {/* Indentation Spaces */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Tab & Auto-Indentation Size
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    PEP 8 standard specifies 4 spaces per indentation level.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[2, 4].map((size) => (
                    <button
                      key={size}
                      onClick={() => setIndentSize(size)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: indentSize === size ? '#d4a373' : 'rgba(255, 255, 255, 0.06)',
                        color: indentSize === size ? '#0e0e12' : '#eae6e1',
                        border: 'none'
                      }}
                    >
                      {size} Spaces
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Close Brackets & Quotes */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Auto-Close Bracket & Quote Pairs
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Automatically inserts closing character for (), [], {}, "", ''.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoCloseBrackets}
                  onChange={(e) => setAutoCloseBrackets(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#d4a373', cursor: 'pointer' }}
                />
              </div>

              {/* Font Size */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Code Editor Font Size
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Adjust text scaling across Sandbox and Live Pairing Studio.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: 'Small', val: '0.76rem' },
                    { label: 'Medium', val: '0.84rem' },
                    { label: 'Large', val: '0.92rem' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setEditorFontSize(item.val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: editorFontSize === item.val ? '#d4a373' : 'rgba(255, 255, 255, 0.06)',
                        color: editorFontSize === item.val ? '#0e0e12' : '#eae6e1',
                        border: 'none'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button onClick={handleSaveEditor} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Save Editor Preferences
                </button>
              </div>
            </div>
          )}

          {/* 3. Voice & Audio Hardware */}
          {activeSection === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                  Voice Call & Microphone Hardware
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Control WebRTC audio stream negotiation, noise gating, and call feedback.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Hardware Echo Cancellation
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Eliminates speaker audio feedback during live pairing voice calls.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={echoCancellation}
                  onChange={(e) => setEchoCancellation(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#34d399', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Ambient Noise Suppression
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Filters background keyboard clicks and room fan noise.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={noiseSuppression}
                  onChange={(e) => setNoiseSuppression(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#34d399', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Volume2 size={20} color="#34d399" />
                  <div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                      Audio Output Diagnostics
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Play test chime through active audio output device.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTestAudio}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.76rem', color: testAudioPlaying ? '#34d399' : undefined }}
                >
                  {testAudioPlaying ? 'Playing Chime...' : 'Test Speaker'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button onClick={handleSaveVoice} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Save Voice Settings
                </button>
              </div>
            </div>
          )}

          {/* 4. Notifications & Mentions */}
          {activeSection === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                  Notification & Mention Alerts
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Choose which real-time alerts trigger sounds and toast notifications.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Sound Alert on @username Mention
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Play an alert sound when a teammate tags you in Live Pairing chat.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundOnMention}
                  onChange={(e) => setSoundOnMention(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#d4a373', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Incoming Voice Call Ringer
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Show modal & ring tone when a peer requests voice pairing.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundOnCall}
                  onChange={(e) => setSoundOnCall(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#d4a373', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button onClick={handleSaveNotifications} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={14} /> Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* 5. Cloud Sync & Data Backup */}
          {activeSection === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                  Cloud Sync & Local Data Management
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Export offline JSON snapshots, restore learning progress, or reset to seed state.
                </p>
              </div>

              {importStatus && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: importStatus.includes('success') ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: importStatus.includes('success') ? '#34d399' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                  {importStatus}
                </div>
              )}

              {/* FastAPI Endpoint Card */}
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(212, 163, 115, 0.08)', border: '1px solid rgba(212, 163, 115, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                    Production FastAPI Backend
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#d4a373', fontFamily: 'monospace' }}>
                    https://ltrack-studio.onrender.com
                  </span>
                </div>
                <span className="badge badge-completed" style={{ fontSize: '0.68rem' }}>
                  Connected
                </span>
              </div>

              {/* Export / Import Action Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} color="#d4a373" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>
                      Export Progress Backup
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    Download a full JSON export of all your check-ins, custom tasks, code submissions, and streak metrics.
                  </p>
                  <button
                    onClick={exportDataJSON}
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Download size={13} /> Export JSON
                  </button>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={18} color="#34d399" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>
                      Restore from Backup
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    Upload a previously exported LTrack JSON file to restore your progress onto this machine.
                  </p>
                  <label
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Upload size={13} /> Upload JSON Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Reset Data */}
              <div style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ef4444', display: 'block' }}>
                    Reset Application State
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Reset local database and storage to initial seed state.
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all data to default? This will clear custom tasks and check-ins.')) {
                      resetToDefault();
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={12} /> Reset to Default
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
