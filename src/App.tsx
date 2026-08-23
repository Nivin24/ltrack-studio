import React, { useState } from 'react';
import { LTrackProvider, useLTrack } from './context/LTrackContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';

import { LoginView } from './views/LoginView';
import { AdminDashboard } from './views/AdminDashboard';
import { MemberDashboard } from './views/MemberDashboard';
import { VisualRoadmapView } from './views/VisualRoadmapView';
import { DailyLearningView } from './views/DailyLearningView';
import { CodeSandboxView } from './views/CodeSandboxView';
import { AssignmentsView } from './views/AssignmentsView';
import { GitHubActivityView } from './views/GitHubActivityView';
import { PeerHelpCommunityView } from './views/PeerHelpCommunityView';
import { LivePairingStudioView } from './views/LivePairingStudioView';
import { SkillMatrixView } from './views/SkillMatrixView';
import { EvidenceProgressView } from './views/EvidenceProgressView';
import { ProfileView } from './views/ProfileView';

const MainContent: React.FC = () => {
  const { isAuthenticated, activeTab, currentUser } = useLTrack();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'admin_dashboard':
        return currentUser.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
      case 'member_dashboard':
        return <MemberDashboard />;
      case 'roadmap':
        return <VisualRoadmapView />;
      case 'daily_learning':
        return <DailyLearningView />;
      case 'code_sandbox':
        return <CodeSandboxView />;
      case 'pairing_studio':
        return <LivePairingStudioView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'peer_help':
        return <PeerHelpCommunityView />;
      case 'github_activity':
        return <GitHubActivityView />;
      case 'skill_matrix':
        return <SkillMatrixView />;
      case 'evidence_engine':
        return <EvidenceProgressView />;
      case 'profile':
        return <ProfileView />;
      default:
        return currentUser.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#0e0e12'
    }}>
      {/* 1. Permanently Fixed Top Navigation Header Bar */}
      <div style={{ flexShrink: 0, zIndex: 100 }}>
        <HeaderBar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
      </div>

      {/* 2. Body Area: Floating Sidebar + Responsive Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        height: 'calc(100vh - 84px)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Floating Left Pill Sidebar (with Mobile Drawer Mode) */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px 20px 16px 16px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <LTrackProvider>
      <RealtimeProvider>
        <MainContent />
      </RealtimeProvider>
    </LTrackProvider>
  );
}

export default App;
