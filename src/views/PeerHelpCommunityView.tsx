import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useRealtime } from '../context/RealtimeContext';
import { useDebounce } from '../hooks/useDebounce';
import {
  HeartHandshake,
  MessageSquarePlus,
  Search,
  X,
  CheckCircle2
} from 'lucide-react';

export const PeerHelpCommunityView: React.FC = () => {
  const { peerHelpRequests, offerPeerHelp, requestPeerHelp, topics, currentUser } = useLTrack();
  const { broadcastPeerHelpCreated, broadcastPeerHelpOffered } = useRealtime();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [topicName, setTopicName] = useState(topics[0]?.name || 'FastAPI Dependency Injection');
  const [category, setCategory] = useState('FastAPI');
  const [strugglingWith, setStrugglingWith] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(2);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_help' | 'pairing_scheduled' | 'resolved'>('all');

  // Debounced search query
  const debouncedSearch = useDebounce(searchQuery, 220);

  const filteredRequests = peerHelpRequests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch =
      req.userName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      req.topicName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      req.strugglingWith.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      req.category.toLowerCase().includes(debouncedSearch.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleRequestHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strugglingWith.trim()) return;
    
    const newHelp = {
      id: `help_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      topicName,
      category,
      strugglingWith,
      confidenceScore: Number(confidenceScore),
      status: 'needs_help',
      createdAt: 'Just now'
    };

    requestPeerHelp(topicName, category, strugglingWith, Number(confidenceScore));
    broadcastPeerHelpCreated(newHelp);

    setStrugglingWith('');
    setShowRequestModal(false);
  };

  const handleOfferHelp = (reqId: string) => {
    offerPeerHelp(reqId);
    broadcastPeerHelpOffered({
      requestId: reqId,
      helperId: currentUser.id,
      helperName: currentUser.name
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <HeartHandshake size={24} color="#d4a373" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1' }}>
                Peer Help & Collaborative Growth Hub
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              See where teammates are getting stuck and offer peer code pairing. Grow together as a team!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Debounced Search */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search requests (Debounced)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowRequestModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem', height: '34px' }}
            >
              <MessageSquarePlus size={15} /> Request Help
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Requests (${peerHelpRequests.length})` },
            { id: 'needs_help', label: `Needs Help (${peerHelpRequests.filter((r) => r.status === 'needs_help').length})` },
            { id: 'pairing_scheduled', label: `Pairing Active (${peerHelpRequests.filter((r) => r.status === 'pairing_scheduled').length})` },
            { id: 'resolved', label: `Resolved (${peerHelpRequests.filter((r) => r.status === 'resolved').length})` }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              style={{
                padding: '5px 14px',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: statusFilter === st.id ? '#d4a373' : 'var(--border-color)',
                background: statusFilter === st.id ? 'rgba(212, 163, 115, 0.15)' : '#222222',
                color: statusFilter === st.id ? '#d4a373' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Community Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No peer help requests found matching your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredRequests.map((req) => {
            const isResolved = req.status === 'resolved';
            const isPairing = req.status === 'pairing_scheduled';
            const isMyRequest = req.userId === currentUser.id;

            return (
              <div
                key={req.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  background: '#1c1c1c',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  {/* Header with Avatar & Confidence */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={req.userAvatar}
                        alt={req.userName}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#eae6e1' }}>
                          {req.userName} {isMyRequest ? '(You)' : ''}
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {req.createdAt}
                        </span>
                      </div>
                    </div>

                    <span className={`badge badge-${isResolved ? 'completed' : isPairing ? 'learning' : 'risk'}`}>
                      {isResolved ? 'Resolved' : isPairing ? 'Pairing Scheduled' : 'Needs Help'}
                    </span>
                  </div>

                  <div style={{ background: '#222222', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d4a373', marginBottom: '2px', textTransform: 'uppercase' }}>
                      Topic: {req.topicName}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#eae6e1', lineHeight: 1.4 }}>
                      "{req.strugglingWith}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Confidence Score: <strong>{req.confidenceScore} / 5</strong></span>
                    {req.helperName && (
                      <span style={{ color: '#a4bfa6', fontWeight: 600 }}>
                        Helper: {req.helperName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  {!isResolved && !isPairing && !isMyRequest && (
                    <button
                      onClick={() => handleOfferHelp(req.id)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '8px', fontSize: '0.82rem', justifyContent: 'center' }}
                    >
                      <HeartHandshake size={15} /> Offer to Pair & Help
                    </button>
                  )}

                  {isPairing && (
                    <div style={{ fontSize: '0.8rem', color: '#a4bfa6', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#34d399" /> Pair session in progress with {req.helperName}
                    </div>
                  )}

                  {isResolved && (
                    <div style={{ fontSize: '0.8rem', color: '#849c86', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#34d399" /> Concept successfully cleared & resolved
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Help Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <MessageSquarePlus size={22} color="#d4a373" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#eae6e1' }}>
                Ask Teammates For Peer Help
              </h3>
            </div>

            <form onSubmit={handleRequestHelp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Select Topic / Module
                </label>
                <select
                  className="form-control"
                  value={topicName}
                  onChange={(e) => {
                    setTopicName(e.target.value);
                    const sel = topics.find((t) => t.name === e.target.value);
                    if (sel) setCategory(sel.category);
                  }}
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.name} style={{ background: '#1c1c1c' }}>
                      Phase {t.phaseNumber}: {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  What specific concept are you stuck on?
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={strugglingWith}
                  onChange={(e) => setStrugglingWith(e.target.value)}
                  placeholder="e.g. I am having issues getting AsyncSession to properly close with yield in FastAPI dependency injection..."
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Current Confidence (1 to 5)
                </label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  max={5}
                  value={confidenceScore}
                  onChange={(e) => setConfidenceScore(Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Help Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
