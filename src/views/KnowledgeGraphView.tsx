import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initialKnowledgeNodes, initialKnowledgeEdges, domainClusters } from '../data/knowledgeGraphData';
import type { DomainType, NodeStatus } from '../types/knowledgeGraph';
import { useLTrack } from '../context/LTrackContext';
import {
  Network,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap,
  X,
  SlidersHorizontal
} from 'lucide-react';

/**
 * Syntax-highlighted code block matching Code Sandbox & Scratchpad theme
 */
const PythonCodePreview: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');

  const highlightLine = (line: string) => {
    if (line.trim().startsWith('#')) {
      return <span style={{ color: '#64748b', fontStyle: 'italic' }}>{line}</span>;
    }

    const tokens = line.split(/(#.*$|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|\b(?:async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)\b|\b(?:print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)\b|\b\d+(?:\.\d+)?\b|[{}()[\]:.,=+\-*/%><!&|^~]+)/g);

    return tokens.map((token, i) => {
      if (!token) return null;
      if (token.startsWith('#')) return <span key={i} style={{ color: '#64748b', fontStyle: 'italic' }}>{token}</span>;
      if (token.startsWith('"') || token.startsWith("'") || token.startsWith('f"') || token.startsWith("f'")) {
        return <span key={i} style={{ color: '#f8fafc' }}>{token}</span>;
      }
      if (/^(async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)$/.test(token)) {
        return <span key={i} style={{ color: '#f87171', fontWeight: 600 }}>{token}</span>;
      }
      if (/^(print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)$/.test(token) || /^\d+(\.\d+)?$/.test(token)) {
        return <span key={i} style={{ color: '#60a5fa', fontWeight: 600 }}>{token}</span>;
      }
      if (/^[{}()[\]:.,=+\-*/%><!&|^~]+$/.test(token)) {
        return <span key={i} style={{ color: '#f87171' }}>{token}</span>;
      }
      return <span key={i} style={{ color: '#f8fafc' }}>{token}</span>;
    });
  };

  return (
    <div
      style={{
        background: '#0a0a0e',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '12px 14px',
        fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, monospace",
        fontSize: '0.74rem',
        lineHeight: 1.5,
        overflowX: 'auto',
        maxHeight: '160px',
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.6)'
      }}
    >
      <pre style={{ margin: 0, color: '#f8fafc' }}>
        {lines.map((line, idx) => (
          <div key={idx}>{highlightLine(line) || ' '}</div>
        ))}
      </pre>
    </div>
  );
};

export const KnowledgeGraphView: React.FC = () => {
  const { currentUser, topics, setActiveTab } = useLTrack();

  // Mode: 'live' (real person learning progress) vs 'demo' (interactive simulation)
  const [graphMode, setGraphMode] = useState<'live' | 'demo'>('live');

  // Filtering & Search
  const [selectedDomain, setSelectedDomain] = useState<DomainType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Node Selection for Inspector Drawer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('py_basics');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const isHoveringInspectorRef = useRef(false);

  // Movable Node Positions state (persisted or defaults)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('ltrack_knowledge_graph_positions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initialPos: Record<string, { x: number; y: number }> = {};
    initialKnowledgeNodes.forEach((node) => {
      initialPos[node.id] = { x: node.x || 100, y: node.y || 100 };
    });
    return initialPos;
  });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan & Zoom Viewport (Wide View by default)
  const [zoomLevel, setZoomLevel] = useState<number>(0.58);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 50, y: 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const zoomLevelRef = useRef(zoomLevel);
  zoomLevelRef.current = zoomLevel;
  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;

  // Smooth Wheel Zoom anchored to cursor position (strictly decoupled from inspector drawer)
  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If the cursor is currently over the inspector drawer, NEVER zoom or pan the graph
      if (isHoveringInspectorRef.current) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target && target.closest('.inspector-drawer, #inspector-drawer')) {
        return;
      }

      e.preventDefault();

      // Differentiate trackpad pinch (ctrlKey) vs standard scroll wheel
      const zoomFactor = e.ctrlKey ? 0.012 : 0.0015;
      const delta = -e.deltaY * zoomFactor;

      const currentZoom = zoomLevelRef.current;
      const newZoom = Math.min(Math.max(currentZoom + delta, 0.25), 2.5);
      if (newZoom === currentZoom) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentPan = panOffsetRef.current;
      const scaleChange = newZoom / currentZoom;
      const newPanX = mouseX - (mouseX - currentPan.x) * scaleChange;
      const newPanY = mouseY - (mouseY - currentPan.y) * scaleChange;

      setZoomLevel(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // User Independent Mastery State (keyed per user in localStorage)
  const [userMasteryMap, setUserMasteryMap] = useState<Record<string, NodeStatus>>(() => {
    try {
      const saved = localStorage.getItem(`ltrack_user_knowledge_graph_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    // Default Seed Progress for user
    const initialMap: Record<string, NodeStatus> = {};
    initialKnowledgeNodes.forEach((node) => {
      // Check if user has corresponding topic completed in curriculum
      const matchedTopic = topics.find((t) => t.phaseNumber === node.phaseNumber);
      if (matchedTopic?.status === 'completed') {
        initialMap[node.id] = 'mastered';
      } else if (matchedTopic?.status === 'learning') {
        initialMap[node.id] = 'in_progress';
      } else if (node.prerequisites.length === 0) {
        initialMap[node.id] = 'unlocked';
      } else {
        initialMap[node.id] = 'locked';
      }
    });

    // Propagate unlocks based on prerequisites
    initialKnowledgeNodes.forEach((node) => {
      if (initialMap[node.id] === 'locked' && node.prerequisites.length > 0) {
        const allPrereqsDone = node.prerequisites.every(
          (pId) => initialMap[pId] === 'mastered'
        );
        if (allPrereqsDone) {
          initialMap[node.id] = 'unlocked';
        }
      }
    });

    return initialMap;
  });

  // Demo Mode Simulation Map
  const [demoMasteryMap, setDemoMasteryMap] = useState<Record<string, NodeStatus>>(() => {
    const demo: Record<string, NodeStatus> = {};
    initialKnowledgeNodes.forEach((node) => {
      if (['py_basics', 'py_oop', 'py_generators', 'py_asyncio', 'pydantic_v2', 'fastapi_core', 'postgres_core'].includes(node.id)) {
        demo[node.id] = 'mastered';
      } else if (['fastapi_di', 'fastapi_auth', 'postgres_indexing', 'sqlalchemy_async', 'embeddings_vector'].includes(node.id)) {
        demo[node.id] = 'in_progress';
      } else if (['alembic_migrations', 'redis_caching', 'docker_core', 'pgvector_qdrant', 'pytest_suite'].includes(node.id)) {
        demo[node.id] = 'unlocked';
      } else {
        demo[node.id] = 'locked';
      }
    });
    return demo;
  });

  // Save live mastery map per user
  useEffect(() => {
    if (graphMode === 'live') {
      try {
        localStorage.setItem(`ltrack_user_knowledge_graph_${currentUser.id}`, JSON.stringify(userMasteryMap));
      } catch {
        // ignore
      }
    }
  }, [userMasteryMap, currentUser.id, graphMode]);

  // Active Map depending on mode
  const currentMap = graphMode === 'demo' ? demoMasteryMap : userMasteryMap;

  // Compute live node status dynamically
  const getNodeStatus = (nodeId: string): NodeStatus => {
    return currentMap[nodeId] || 'locked';
  };

  // Toggle Mastered Status for a Node (with unlock propagation)
  const handleToggleNodeMastery = (nodeId: string) => {
    const activeSetter = graphMode === 'demo' ? setDemoMasteryMap : setUserMasteryMap;

    activeSetter((prev) => {
      const current = prev[nodeId] || 'locked';
      let nextStatus: NodeStatus = 'mastered';

      if (current === 'mastered') {
        nextStatus = 'unlocked';
      } else if (current === 'unlocked') {
        nextStatus = 'in_progress';
      } else if (current === 'in_progress') {
        nextStatus = 'mastered';
      } else {
        nextStatus = 'mastered'; // Forced unlock in demo/manual
      }

      const updated = { ...prev, [nodeId]: nextStatus };

      // Re-evaluate unlock status for all downstream nodes
      initialKnowledgeNodes.forEach((node) => {
        if (updated[node.id] !== 'mastered') {
          if (node.prerequisites.length === 0) {
            if (updated[node.id] === 'locked') updated[node.id] = 'unlocked';
          } else {
            const allPrereqsMet = node.prerequisites.every((p) => updated[p] === 'mastered');
            if (allPrereqsMet) {
              if (updated[node.id] === 'locked') {
                updated[node.id] = 'unlocked';
              }
            } else {
              if (updated[node.id] === 'unlocked') {
                updated[node.id] = 'locked';
              }
            }
          }
        }
      });

      return updated;
    });
  };

  // Reset Graph to default
  const handleResetGraph = () => {
    if (graphMode === 'demo') {
      const demo: Record<string, NodeStatus> = {};
      initialKnowledgeNodes.forEach((node) => {
        if (['py_basics', 'py_oop', 'py_generators', 'py_asyncio', 'pydantic_v2', 'fastapi_core', 'postgres_core'].includes(node.id)) {
          demo[node.id] = 'mastered';
        } else if (['fastapi_di', 'fastapi_auth', 'postgres_indexing', 'sqlalchemy_async', 'embeddings_vector'].includes(node.id)) {
          demo[node.id] = 'in_progress';
        } else if (['alembic_migrations', 'redis_caching', 'docker_core', 'pgvector_qdrant', 'pytest_suite'].includes(node.id)) {
          demo[node.id] = 'unlocked';
        } else {
          demo[node.id] = 'locked';
        }
      });
      setDemoMasteryMap(demo);
    } else {
      const resetMap: Record<string, NodeStatus> = {};
      initialKnowledgeNodes.forEach((node) => {
        if (node.prerequisites.length === 0) {
          resetMap[node.id] = 'unlocked';
        } else {
          resetMap[node.id] = 'locked';
        }
      });
      setUserMasteryMap(resetMap);
    }
  };

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return initialKnowledgeNodes.find((n) => n.id === selectedNodeId) || initialKnowledgeNodes[0];
  }, [selectedNodeId]);

  // Filtered Nodes
  const filteredNodes = useMemo(() => {
    return initialKnowledgeNodes.filter((node) => {
      if (selectedDomain !== 'all' && node.domain !== selectedDomain) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = node.title.toLowerCase().includes(q);
        const matchDesc = node.description.toLowerCase().includes(q);
        const matchKeys = node.keyConcepts.some((k) => k.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchKeys) return false;
      }
      return true;
    });
  }, [selectedDomain, searchQuery]);

  // Filtered Edges: Only show edges where BOTH source and target nodes are currently visible
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    return initialKnowledgeEdges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [filteredNodes]);

  // Overall Graph Stats
  const stats = useMemo(() => {
    const total = initialKnowledgeNodes.length;
    let mastered = 0;
    let inProgress = 0;
    let unlocked = 0;
    let locked = 0;

    initialKnowledgeNodes.forEach((n) => {
      const st = getNodeStatus(n.id);
      if (st === 'mastered') mastered++;
      else if (st === 'in_progress') inProgress++;
      else if (st === 'unlocked') unlocked++;
      else locked++;
    });

    const completionPct = Math.round((mastered / total) * 100);
    return { total, mastered, inProgress, unlocked, locked, completionPct };
  }, [currentMap]);

  // Recommended Next Node to Learn
  const nextRecommendedNode = useMemo(() => {
    // Look for unlocked or in-progress node with lowest phase number
    const available = initialKnowledgeNodes.filter((n) => {
      const st = getNodeStatus(n.id);
      return st === 'unlocked' || st === 'in_progress';
    });
    available.sort((a, b) => a.phaseNumber - b.phaseNumber);
    return available[0] || null;
  }, [currentMap]);

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);

    const pos = nodePositions[nodeId] || { x: 0, y: 0 };
    const canvasX = (e.clientX - panOffset.x) / zoomLevel;
    const canvasY = (e.clientY - panOffset.y) / zoomLevel;

    setDragOffset({
      x: canvasX - pos.x,
      y: canvasY - pos.y
    });
  };

  // Mouse Pan & Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-canvas-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const canvasX = (e.clientX - panOffset.x) / zoomLevel;
      const canvasY = (e.clientY - panOffset.y) / zoomLevel;
      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.round(canvasX - dragOffset.x),
          y: Math.round(canvasY - dragOffset.y)
        }
      }));
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      try {
        localStorage.setItem('ltrack_knowledge_graph_positions', JSON.stringify(nodePositions));
      } catch {
        // ignore
      }
    }
    setIsPanning(false);
  };

  // Zoom Helpers
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.35), 2.2));
  };

  const handleCenterGraph = () => {
    setZoomLevel(0.56);
    setPanOffset({ x: 50, y: 60 });
  };

  const handleResetPositions = () => {
    const defaultPos: Record<string, { x: number; y: number }> = {};
    initialKnowledgeNodes.forEach((node) => {
      defaultPos[node.id] = { x: node.x || 100, y: node.y || 100 };
    });
    setNodePositions(defaultPos);
    try {
      localStorage.removeItem('ltrack_knowledge_graph_positions');
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', gap: '16px', overflow: 'hidden' }}>
      {/* Top Header & Control Hub */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          borderRadius: '16px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(212, 163, 115, 0.12)',
              border: '1px solid rgba(212, 163, 115, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4a373'
            }}
          >
            <Network size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#eae6e1' }}>
                E2E Knowledge Graph & Neural Skill Web
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: graphMode === 'demo' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                  border: graphMode === 'demo' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(52, 211, 153, 0.35)',
                  color: graphMode === 'demo' ? '#38bdf8' : '#34d399'
                }}
              >
                {graphMode === 'demo' ? 'Demo Sandbox Mode' : `Personalized (${currentUser.name})`}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
              {graphMode === 'demo'
                ? 'Interactive demo showcasing full Python-to-production dependency cascade and unlocked paths.'
                : 'Independently computed from your authentic subtopics, check-ins, PR evaluations, and quiz records.'}
            </p>
          </div>
        </div>

        {/* Mode Switcher & Stats Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '3px',
              display: 'flex',
              gap: '4px'
            }}
          >
            <button
              onClick={() => setGraphMode('live')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: graphMode === 'live' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                color: graphMode === 'live' ? '#34d399' : 'var(--text-muted)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ShieldCheck size={13} /> My Live Progress
            </button>
            <button
              onClick={() => setGraphMode('demo')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: graphMode === 'demo' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: graphMode === 'demo' ? '#38bdf8' : 'var(--text-muted)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={13} /> Interactive Demo
            </button>
          </div>

          {/* Toggle Inspector Button */}
          <button
            onClick={() => setIsInspectorOpen((prev) => !prev)}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              border: isInspectorOpen ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: isInspectorOpen ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: isInspectorOpen ? '#38bdf8' : '#eae6e1',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <SlidersHorizontal size={13} /> {isInspectorOpen ? 'Hide Details' : 'Inspect Skill'}
          </button>

          {/* Mastery Counter */}
          <div
            style={{
              background: 'rgba(212, 163, 115, 0.08)',
              border: '1px solid rgba(212, 163, 115, 0.25)',
              padding: '6px 14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Mastery
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#d4a373' }}>
                {stats.mastered} / {stats.total} ({stats.completionPct}%)
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'conic-gradient(#34d399 ' + stats.completionPct * 3.6 + 'deg, rgba(255,255,255,0.08) 0deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#16161c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#34d399'
                }}
              >
                {stats.completionPct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Graph Work Area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        {/* Full Width Canvas Card */}
        <div
          className="glass-panel"
          style={{
            flex: 1,
            width: '100%',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#09090d',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Domain Filter Bar & Search */}
          <div
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              background: 'rgba(18, 18, 24, 0.85)',
              backdropFilter: 'blur(16px)',
              zIndex: 10
            }}
          >
            {/* Domain Tabs */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', maxWidth: '70%' }}>
              <button
                onClick={() => setSelectedDomain('all')}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedDomain === 'all' ? '#d4a373' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedDomain === 'all' ? '#0e0e12' : '#eae6e1',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                All Domains ({initialKnowledgeNodes.length})
              </button>
              {domainClusters.map((domain) => {
                const count = initialKnowledgeNodes.filter((n) => n.domain === domain.id).length;
                const isSel = selectedDomain === domain.id;
                return (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '8px',
                      border: isSel ? `1px solid ${domain.color}` : '1px solid transparent',
                      background: isSel ? domain.secondaryColor : 'rgba(255, 255, 255, 0.05)',
                      color: isSel ? domain.color : '#eae6e1',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {domain.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search skill nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#eae6e1',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* SVG Graph Interactive Canvas */}
          <div
            id="graph-canvas-bg"
            ref={graphContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              cursor: isPanning ? 'grabbing' : 'grab',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Ambient Background Grid */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                pointerEvents: 'none',
                opacity: 0.7
              }}
            />

            {/* SVG Rendered Graph */}
            <svg
              style={{
                width: '100%',
                height: '100%',
                overflow: 'visible'
              }}
            >
              {/* Arrow Marker Definitions */}
              <defs>
                <marker
                  id="arrow-mastered"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#34d399" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
                </marker>
                <marker
                  id="arrow-highlighted"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#d4a373" />
                </marker>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.35)" />
                </marker>
              </defs>

              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                {/* 1. EDGES / CONNECTING PATHS WITH RELATIONSHIPS (FILTER-AWARE) */}
                {filteredEdges.map((edge) => {
                  const sourceNode = initialKnowledgeNodes.find((n) => n.id === edge.source);
                  const targetNode = initialKnowledgeNodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const srcPos = nodePositions[edge.source] || { x: sourceNode.x || 0, y: sourceNode.y || 0 };
                  const tgtPos = nodePositions[edge.target] || { x: targetNode.x || 0, y: targetNode.y || 0 };

                  // Smart Attachment calculation
                  let srcX = srcPos.x + 220;
                  let srcY = srcPos.y + 40;
                  let tgtX = tgtPos.x;
                  let tgtY = tgtPos.y + 40;

                  if (tgtPos.x + 220 < srcPos.x) {
                    srcX = srcPos.x;
                    tgtX = tgtPos.x + 220;
                  }

                  const dx = tgtX - srcX;
                  const curveOffset = Math.max(Math.abs(dx) * 0.45, 40);
                  const cx1 = srcX + (tgtX > srcX ? curveOffset : -curveOffset);
                  const cy1 = srcY;
                  const cx2 = tgtX - (tgtX > srcX ? curveOffset : -curveOffset);
                  const cy2 = tgtY;

                  const pathData = `M ${srcX} ${srcY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tgtX} ${tgtY}`;

                  // Midpoint of Cubic Bezier curve (t = 0.5)
                  const midX = 0.125 * srcX + 0.375 * cx1 + 0.375 * cx2 + 0.125 * tgtX;
                  const midY = 0.125 * srcY + 0.375 * cy1 + 0.375 * cy2 + 0.125 * tgtY;

                  const srcStatus = getNodeStatus(edge.source);
                  const tgtStatus = getNodeStatus(edge.target);
                  const isFlowActive = srcStatus === 'mastered';
                  const isPathHighlighted =
                    selectedNodeId === edge.source ||
                    selectedNodeId === edge.target ||
                    hoveredNodeId === edge.source ||
                    hoveredNodeId === edge.target;

                  let strokeColor = 'rgba(255, 255, 255, 0.22)';
                  let markerUrl = 'url(#arrow-default)';

                  if (srcStatus === 'mastered' && tgtStatus === 'mastered') {
                    strokeColor = '#34d399';
                    markerUrl = 'url(#arrow-mastered)';
                  } else if (isFlowActive) {
                    strokeColor = '#38bdf8';
                    markerUrl = 'url(#arrow-active)';
                  } else if (isPathHighlighted) {
                    strokeColor = hoveredNodeId ? '#38bdf8' : '#d4a373';
                    markerUrl = hoveredNodeId ? 'url(#arrow-active)' : 'url(#arrow-highlighted)';
                  }

                  const labelText = edge.label || (edge.relationship === 'prerequisite' ? 'Prerequisite' : edge.relationship);
                  const labelWidth = Math.max(labelText.length * 6.6 + 18, 56);

                  return (
                    <g key={edge.id}>
                      {/* Glow Underlay on Highlight */}
                      {isPathHighlighted && (
                        <path
                          d={pathData}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="6"
                          opacity="0.3"
                        />
                      )}

                      {/* Main Edge Path */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isPathHighlighted ? 2.8 : isFlowActive ? 2 : 1.4}
                        strokeDasharray={edge.relationship === 'composes' ? '5 4' : undefined}
                        markerEnd={markerUrl}
                        opacity={isPathHighlighted ? 1 : hoveredNodeId ? 0.35 : 0.75}
                      />

                      {/* Animated Pulse Particle on Active Flows */}
                      {isFlowActive && (
                        <circle r={isPathHighlighted ? 4 : 3} fill={isPathHighlighted ? '#34d399' : '#38bdf8'}>
                          <animateMotion path={pathData} dur="3s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Relationship Pill Badge on Edge Curve */}
                      <g transform={`translate(${midX}, ${midY})`} style={{ pointerEvents: 'none' }}>
                        <rect
                          x={-labelWidth / 2}
                          y="-10"
                          width={labelWidth}
                          height="20"
                          rx="10"
                          fill="#0e0e14"
                          stroke={isPathHighlighted ? strokeColor : isFlowActive ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.18)'}
                          strokeWidth="1.2"
                        />
                        <text
                          textAnchor="middle"
                          y="3.5"
                          fill={isPathHighlighted ? '#ffffff' : isFlowActive ? '#38bdf8' : '#eae6e1'}
                          fontSize="8.5"
                          fontWeight="700"
                          fontFamily="sans-serif"
                        >
                          {labelText}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* 2. MOVABLE DRAGGABLE NODES */}
                {filteredNodes.map((node) => {
                  const pos = nodePositions[node.id] || { x: node.x || 0, y: node.y || 0 };
                  const status = getNodeStatus(node.id);
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isDragging = draggingNodeId === node.id;
                  const isRecommended = nextRecommendedNode?.id === node.id;
                  const domainInfo = domainClusters.find((d) => d.id === node.domain);
                  const nodeColor = domainInfo?.color || '#d4a373';

                  let statusBg = 'rgba(24, 24, 32, 0.96)';
                  let statusBorder = 'rgba(255, 255, 255, 0.12)';
                  let statusIcon = <Lock size={12} color="#71717a" />;
                  let statusLabel = 'Locked';
                  let statusTextColor = '#71717a';

                  if (status === 'mastered') {
                    statusBg = 'rgba(16, 32, 24, 0.96)';
                    statusBorder = 'rgba(52, 211, 153, 0.55)';
                    statusIcon = <CheckCircle2 size={12} color="#34d399" />;
                    statusLabel = 'Mastered';
                    statusTextColor = '#34d399';
                  } else if (status === 'in_progress') {
                    statusBg = 'rgba(28, 30, 42, 0.96)';
                    statusBorder = 'rgba(56, 189, 248, 0.55)';
                    statusIcon = <Zap size={12} color="#38bdf8" />;
                    statusLabel = 'In Progress';
                    statusTextColor = '#38bdf8';
                  } else if (status === 'unlocked') {
                    statusBg = 'rgba(32, 26, 20, 0.96)';
                    statusBorder = 'rgba(212, 163, 115, 0.55)';
                    statusIcon = <Unlock size={12} color="#d4a373" />;
                    statusLabel = 'Ready to Learn';
                    statusTextColor = '#d4a373';
                  }

                  if (isSelected || isHovered || isDragging) {
                    statusBorder = isHovered || isDragging ? nodeColor : '#ffffff';
                  }

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setIsInspectorOpen(true);
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none'
                      }}
                    >
                      {/* Selection / Recommendation Glow Aura */}
                      {(isSelected || isHovered || isRecommended || isDragging) && (
                        <rect
                          x="-4"
                          y="-4"
                          width="228"
                          height="88"
                          rx="14"
                          fill="none"
                          stroke={isRecommended ? '#34d399' : isHovered || isDragging ? nodeColor : '#d4a373'}
                          strokeWidth={isHovered || isDragging ? 2.5 : 2}
                          strokeDasharray={isRecommended ? '4 4' : undefined}
                          opacity={isHovered || isDragging ? 0.95 : 0.8}
                        >
                          {isRecommended && (
                            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
                          )}
                        </rect>
                      )}

                      {/* Main Node Card Body */}
                      <rect
                        x="0"
                        y="0"
                        width="220"
                        height="80"
                        rx="12"
                        fill={statusBg}
                        stroke={statusBorder}
                        strokeWidth={isSelected || isDragging ? 2 : 1}
                        style={{ filter: isDragging ? 'drop-shadow(0 12px 28px rgba(0,0,0,0.8))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
                      />

                      {/* Domain Color Bar */}
                      <rect
                        x="0"
                        y="0"
                        width="5"
                        height="80"
                        rx="2"
                        fill={nodeColor}
                      />

                      {/* Phase Number Badge */}
                      <rect
                        x="12"
                        y="10"
                        width="22"
                        height="16"
                        rx="4"
                        fill="rgba(0, 0, 0, 0.5)"
                      />
                      <text
                        x="23"
                        y="22"
                        textAnchor="middle"
                        fill={nodeColor}
                        fontSize="9"
                        fontWeight="800"
                        fontFamily="sans-serif"
                      >
                        P{node.phaseNumber}
                      </text>

                      {/* Node Title */}
                      <text
                        x="40"
                        y="22"
                        fill={status === 'locked' ? '#9ca3af' : '#ffffff'}
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        {node.title.length > 22 ? node.title.substring(0, 20) + '...' : node.title}
                      </text>

                      {/* Node Domain Label */}
                      <text
                        x="14"
                        y="44"
                        fill="var(--text-dim)"
                        fontSize="9"
                        fontFamily="sans-serif"
                      >
                        {domainInfo?.name || 'Python'}
                      </text>

                      {/* Status Capsule Indicator */}
                      <g transform="translate(14, 52)">
                        <rect
                          x="0"
                          y="0"
                          width="192"
                          height="18"
                          rx="5"
                          fill="rgba(0, 0, 0, 0.35)"
                        />
                        <foreignObject x="6" y="2" width="180" height="14">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pointerEvents: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 700, color: statusTextColor }}>
                              {statusIcon}
                              <span>{statusLabel}</span>
                            </div>
                            <span style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600 }}>
                              {node.estimatedHours}h est.
                            </span>
                          </div>
                        </foreignObject>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Bottom Canvas Overlay Controls */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                display: 'flex',
                gap: '8px',
                background: 'rgba(20, 20, 26, 0.85)',
                backdropFilter: 'blur(12px)',
                padding: '6px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10
              }}
            >
              <button
                onClick={() => handleZoom(0.15)}
                title="Zoom In"
                style={{ background: 'transparent', border: 'none', color: '#eae6e1', cursor: 'pointer', padding: '4px 6px', display: 'flex' }}
              >
                <ZoomIn size={15} />
              </button>
              <button
                onClick={() => handleZoom(-0.15)}
                title="Zoom Out"
                style={{ background: 'transparent', border: 'none', color: '#eae6e1', cursor: 'pointer', padding: '4px 6px', display: 'flex' }}
              >
                <ZoomOut size={15} />
              </button>
              <button
                onClick={handleCenterGraph}
                title="Fit Overview to Screen"
                style={{ background: 'transparent', border: 'none', color: '#eae6e1', cursor: 'pointer', padding: '4px 6px', display: 'flex' }}
              >
                <Maximize2 size={15} />
              </button>
              <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '2px 2px' }} />
              <button
                onClick={handleResetPositions}
                title="Reset Node Layout Positions"
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600 }}
              >
                <RotateCcw size={13} /> Reset Layout
              </button>
              <button
                onClick={handleResetGraph}
                title="Reset Simulation / Mastery"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
              >
                Reset Progress
              </button>
            </div>

            {/* Next Recommended Path Card Overlay */}
            {nextRecommendedNode && (
              <div
                onClick={() => {
                  setSelectedNodeId(nextRecommendedNode.id);
                  setIsInspectorOpen(true);
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(20, 20, 26, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(52, 211, 153, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                    Recommended Next Skill
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#eae6e1' }}>
                    Phase {nextRecommendedNode.phaseNumber}: {nextRecommendedNode.title}
                  </div>
                </div>
                <ChevronRight size={14} color="#34d399" />
              </div>
            )}

            </div>

            {/* Slide-out Floating Deep-Dive Node Inspector Drawer */}
            {isInspectorOpen && selectedNode && (
              <div
                id="inspector-drawer"
                className="glass-panel inspector-drawer"
                onMouseEnter={() => {
                  isHoveringInspectorRef.current = true;
                }}
                onMouseLeave={() => {
                  isHoveringInspectorRef.current = false;
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  bottom: '16px',
                  width: '390px',
                  borderRadius: '20px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'rgba(18, 18, 26, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
                  backdropFilter: 'blur(24px)',
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  zIndex: 30
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Drawer Header with Close X */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: domainClusters.find((d) => d.id === selectedNode.domain)?.secondaryColor,
                          color: domainClusters.find((d) => d.id === selectedNode.domain)?.color,
                          textTransform: 'uppercase'
                        }}
                      >
                        Phase {selectedNode.phaseNumber} • {selectedNode.difficulty}
                      </span>

                      <button
                        onClick={() => setIsInspectorOpen(false)}
                        title="Close Inspector"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: '#eae6e1',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color:
                            getNodeStatus(selectedNode.id) === 'mastered'
                              ? '#34d399'
                              : getNodeStatus(selectedNode.id) === 'in_progress'
                              ? '#38bdf8'
                              : getNodeStatus(selectedNode.id) === 'unlocked'
                              ? '#d4a373'
                              : '#71717a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {getNodeStatus(selectedNode.id) === 'mastered' && <CheckCircle2 size={13} />}
                        {getNodeStatus(selectedNode.id) === 'in_progress' && <Zap size={13} />}
                        {getNodeStatus(selectedNode.id) === 'unlocked' && <Unlock size={13} />}
                        {getNodeStatus(selectedNode.id) === 'locked' && <Lock size={13} />}
                        {getNodeStatus(selectedNode.id).toUpperCase().replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {selectedNode.estimatedHours}h estimated study
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f5f5f7', margin: 0, lineHeight: 1.3 }}>
                      {selectedNode.title}
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.45 }}>
                      {selectedNode.description}
                    </p>
                  </div>

                  {/* Action Buttons: Practice Quiz, Flashcards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => setActiveTab('quizzes')}
                      className="btn btn-secondary"
                      style={{ padding: '8px 10px', fontSize: '0.74rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <HelpCircle size={13} color="#38bdf8" /> Concept Quiz
                    </button>
                    <button
                      onClick={() => setActiveTab('flashcards')}
                      className="btn btn-secondary"
                      style={{ padding: '8px 10px', fontSize: '0.74rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <BookOpen size={13} color="#d4a373" /> Flashcards
                    </button>
                  </div>

                  {/* Toggle Mastery State Action */}
                  <button
                    onClick={() => handleToggleNodeMastery(selectedNode.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      background: getNodeStatus(selectedNode.id) === 'mastered' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.2)',
                      color: getNodeStatus(selectedNode.id) === 'mastered' ? '#ef4444' : '#34d399',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {getNodeStatus(selectedNode.id) === 'mastered' ? (
                      <>
                        <RotateCcw size={14} /> Reopen for Review
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Mark as Mastered & Propagate
                      </>
                    )}
                  </button>

                  {/* Code Snippet Box */}
                  {selectedNode.codeSnippet && (
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Production Pattern:
                      </span>
                      <PythonCodePreview code={selectedNode.codeSnippet} />
                    </div>
                  )}

                  {/* Subtopics Checklist */}
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Core Subtopic Checkpoints ({selectedNode.subtopics.length}):
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedNode.subtopics.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            color: '#eae6e1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <CheckCircle2 size={12} color={getNodeStatus(selectedNode.id) === 'mastered' ? '#34d399' : 'rgba(255, 255, 255, 0.2)'} />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites & Unlocks Links */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {/* Prerequisites */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Prerequisites:
                      </span>
                      {selectedNode.prerequisites.length === 0 ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>None (Root Topic)</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedNode.prerequisites.map((pId) => {
                            const pNode = initialKnowledgeNodes.find((n) => n.id === pId);
                            const pDone = getNodeStatus(pId) === 'mastered';
                            return (
                              <div
                                key={pId}
                                onClick={() => setSelectedNodeId(pId)}
                                style={{
                                  fontSize: '0.72rem',
                                  color: pDone ? '#34d399' : '#eae6e1',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {pDone ? <CheckCircle2 size={11} color="#34d399" /> : <Lock size={11} color="#f87171" />}
                                <span>{pNode?.title || pId}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Unlocks */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Unlocks Downstream:
                      </span>
                      {selectedNode.unlocks.length === 0 ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Capstone Target</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedNode.unlocks.map((uId) => {
                            const uNode = initialKnowledgeNodes.find((n) => n.id === uId);
                            return (
                              <div
                                key={uId}
                                onClick={() => setSelectedNodeId(uId)}
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#38bdf8',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <ArrowRight size={11} />
                                <span>{uNode?.title || uId}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};