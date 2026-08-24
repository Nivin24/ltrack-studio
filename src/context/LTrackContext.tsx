import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Topic,
  Subtopic,
  Assignment,
  Submission,
  DailyCheckIn,
  RiskAlert,
  ActivityItem,
  EvidenceScore,
  ProgressStatus,
  GitCommit,
  GitPullRequestItem,
  MemberGitQuality,
  PeerHelpRequest,
  GuidanceNote
} from '../types/ltrack';
import {
  initialMembers,
  initialTopics,
  initialAssignments,
  initialSubmissions,
  initialCheckIns,
  initialRiskAlerts,
  initialActivityFeed,
  initialGitCommits,
  initialPullRequests,
  initialGitQuality,
  initialPeerHelpRequests,
  initialGuidanceNotes
} from '../data/initialData';

interface LTrackContextType {
  isAuthenticated: boolean;
  currentUser: User;
  members: User[];
  topics: Topic[];
  assignments: Assignment[];
  submissions: Submission[];
  checkIns: DailyCheckIn[];
  riskAlerts: RiskAlert[];
  activityFeed: ActivityItem[];
  gitCommits: GitCommit[];
  pullRequests: GitPullRequestItem[];
  gitQuality: MemberGitQuality[];
  peerHelpRequests: PeerHelpRequest[];
  guidanceNotes: GuidanceNote[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  login: (userId: string, portal: 'admin' | 'member') => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  toggleRole: () => void;
  toggleSubtopic: (topicId: string, subtopicId: string) => void;
  addDailyCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => void;
  addSubmission: (submission: Omit<Submission, 'id' | 'userId' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (submissionId: string, evalData: { codeQuality: number; understanding: number; testing: number; documentation: number; feedback: string }) => void;
  
  // Topics CRUD
  createTopic: (topic: Omit<Topic, 'id'>) => void;
  updateTopic: (topicId: string, data: Partial<Topic>) => void;
  deleteTopic: (topicId: string) => void;
  createSubtopic: (topicId: string, subtopic: Omit<Subtopic, 'id'>) => void;
  deleteSubtopic: (topicId: string, subtopicId: string) => void;

  // Assignments CRUD
  createAssignment: (newAsgn: Omit<Assignment, 'id'>) => void;
  updateAssignment: (assignmentId: string, data: Partial<Assignment>) => void;
  deleteAssignment: (assignmentId: string) => void;

  // Members CRUD
  createMember: (member: Omit<User, 'id' | 'joinedDate' | 'streak' | 'overallProgress'>) => void;
  updateMember: (userId: string, data: Partial<User>) => void;
  deleteMember: (userId: string) => void;

  // Peer Help & Guidance
  offerPeerHelp: (requestId: string) => void;
  requestPeerHelp: (topicName: string, category: string, strugglingWith: string, confidenceScore: number) => void;
  addGuidanceNote: (userId: string, actionPlan: string, suggestedResource: string, assignedMentor?: string) => void;

  addGitCommit: (message: string, branch: string) => void;
  calculateEvidence: (topicId: string, userId?: string) => EvidenceScore;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'ltrack_v1_app_state';

const LTrackContext = createContext<LTrackContextType | undefined>(undefined);

export const LTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_auth');
    return saved ? JSON.parse(saved) : true;
  });

  const [members, setMembers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_curr_user');
    return saved || 'usr_2';
  });

  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_topics');
    return saved ? JSON.parse(saved) : initialTopics;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_assignments');
    return saved ? JSON.parse(saved) : initialAssignments;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_submissions');
    return saved ? JSON.parse(saved) : initialSubmissions;
  });

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_checkins');
    return saved ? JSON.parse(saved) : initialCheckIns;
  });

  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_risk_alerts');
    return saved ? JSON.parse(saved) : initialRiskAlerts;
  });

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_activity');
    return saved ? JSON.parse(saved) : initialActivityFeed;
  });

  const [gitCommits, setGitCommits] = useState<GitCommit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_git_commits');
    return saved ? JSON.parse(saved) : initialGitCommits;
  });

  const [pullRequests] = useState<GitPullRequestItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_pull_requests');
    return saved ? JSON.parse(saved) : initialPullRequests;
  });

  const [gitQuality, setGitQuality] = useState<MemberGitQuality[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_git_quality');
    return saved ? JSON.parse(saved) : initialGitQuality;
  });

  const [peerHelpRequests, setPeerHelpRequests] = useState<PeerHelpRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_peer_help');
    return saved ? JSON.parse(saved) : initialPeerHelpRequests;
  });

  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_guidance_notes');
    return saved ? JSON.parse(saved) : initialGuidanceNotes;
  });

  const currentUser = members.find((m) => m.id === currentUserId) || members[0];

  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentUser.role === 'admin' ? 'admin_dashboard' : 'member_dashboard';
  });

  // Listen for real-time peer help sync events
  useEffect(() => {
    const handleCreated = (e: any) => {
      const newHelp: PeerHelpRequest = e.detail;
      if (newHelp) {
        setPeerHelpRequests((prev) => {
          if (prev.some((p) => p.id === newHelp.id)) return prev;
          const updated = [newHelp, ...prev];
          localStorage.setItem(STORAGE_KEY + '_peer_help', JSON.stringify(updated));
          return updated;
        });
      }
    };

    const handleOffered = (e: any) => {
      const { requestId, helperId, helperName } = e.detail || {};
      if (requestId) {
        setPeerHelpRequests((prev) => {
          const updated = prev.map((r) =>
            r.id === requestId
              ? { ...r, helperId, helperName, status: 'pairing_scheduled' as const }
              : r
          );
          localStorage.setItem(STORAGE_KEY + '_peer_help', JSON.stringify(updated));
          return updated;
        });
      }
    };

    window.addEventListener('ltrack_peer_help_created', handleCreated);
    window.addEventListener('ltrack_peer_help_offered', handleOffered);

    return () => {
      window.removeEventListener('ltrack_peer_help_created', handleCreated);
      window.removeEventListener('ltrack_peer_help_offered', handleOffered);
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_auth', JSON.stringify(isAuthenticated));
    localStorage.setItem(STORAGE_KEY + '_members', JSON.stringify(members));
    localStorage.setItem(STORAGE_KEY + '_curr_user', currentUserId);
    localStorage.setItem(STORAGE_KEY + '_topics', JSON.stringify(topics));
    localStorage.setItem(STORAGE_KEY + '_assignments', JSON.stringify(assignments));
    localStorage.setItem(STORAGE_KEY + '_submissions', JSON.stringify(submissions));
    localStorage.setItem(STORAGE_KEY + '_checkins', JSON.stringify(checkIns));
    localStorage.setItem(STORAGE_KEY + '_risk_alerts', JSON.stringify(riskAlerts));
    localStorage.setItem(STORAGE_KEY + '_activity', JSON.stringify(activityFeed));
    localStorage.setItem(STORAGE_KEY + '_git_commits', JSON.stringify(gitCommits));
    localStorage.setItem(STORAGE_KEY + '_peer_help', JSON.stringify(peerHelpRequests));
    localStorage.setItem(STORAGE_KEY + '_guidance_notes', JSON.stringify(guidanceNotes));
  }, [isAuthenticated, members, currentUserId, topics, assignments, submissions, checkIns, riskAlerts, activityFeed, gitCommits, peerHelpRequests, guidanceNotes]);

  const login = (userId: string, portal: 'admin' | 'member') => {
    setCurrentUserId(userId);
    setIsAuthenticated(true);
    if (portal === 'admin') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('member_dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const toggleRole = () => {
    const newRole = currentUser.role === 'admin' ? 'member' : 'admin';
    setMembers((prev) =>
      prev.map((m) => (m.id === currentUser.id ? { ...m, role: newRole } : m))
    );
    if (newRole === 'admin') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('member_dashboard');
    }
  };

  const toggleSubtopic = (topicId: string, subtopicId: string) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const updatedSubtopics = t.subtopics.map((s) => {
            if (s.id === subtopicId) {
              const nextStatus: ProgressStatus = s.status === 'completed' ? 'not_started' : 'completed';
              return { ...s, status: nextStatus };
            }
            return s;
          });

          const allCompleted = updatedSubtopics.every((s) => s.status === 'completed');
          const anyInProgress = updatedSubtopics.some((s) => s.status === 'completed' || s.status === 'learning');

          return {
            ...t,
            subtopics: updatedSubtopics,
            status: allCompleted ? 'completed' : anyInProgress ? 'learning' : 'not_started'
          };
        }
        return t;
      })
    );
  };

  const addDailyCheckIn = (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => {
    const newCheckIn: DailyCheckIn = {
      ...checkIn,
      id: `chk_${Date.now()}`,
      userId: currentUser.id
    };
    setCheckIns((prev) => [newCheckIn, ...prev]);

    setMembers((prev) =>
      prev.map((m) => (m.id === currentUser.id ? { ...m, streak: m.streak + 1 } : m))
    );

    // If confidence is low, create peer help request automatically
    if (checkIn.confidenceScore <= 2 && checkIn.confusedAbout) {
      const newHelp: PeerHelpRequest = {
        id: `help_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        topicName: currentUser.currentPhase,
        category: 'Learning Doubt',
        strugglingWith: checkIn.confusedAbout,
        confidenceScore: checkIn.confidenceScore,
        status: 'needs_help',
        createdAt: 'Just now'
      };
      setPeerHelpRequests((prev) => [newHelp, ...prev]);
    }
  };

  const addSubmission = (sub: Omit<Submission, 'id' | 'userId' | 'submittedAt' | 'status'>) => {
    const newSubmission: Submission = {
      ...sub,
      id: `sub_${Date.now()}`,
      userId: currentUser.id,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'submitted'
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
  };

  const gradeSubmission = (
    submissionId: string,
    evalData: { codeQuality: number; understanding: number; testing: number; documentation: number; feedback: string }
  ) => {
    const overall = parseFloat(
      ((evalData.codeQuality + evalData.understanding + evalData.testing + evalData.documentation) / 4).toFixed(1)
    );

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            status: 'evaluated',
            evaluation: {
              ...evalData,
              overallScore: overall,
              gradedAt: new Date().toISOString().split('T')[0],
              gradedBy: currentUser.name
            }
          };
        }
        return s;
      })
    );
  };

  // --- TOPICS CRUD ---
  const createTopic = (newTopic: Omit<Topic, 'id'>) => {
    const topicId = `top_${Date.now()}`;
    const topic: Topic = {
      ...newTopic,
      id: topicId
    };
    setTopics((prev) => [...prev, topic]);
  };

  const updateTopic = (topicId: string, data: Partial<Topic>) => {
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, ...data } : t)));
  };

  const deleteTopic = (topicId: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const createSubtopic = (topicId: string, sub: Omit<Subtopic, 'id'>) => {
    const subId = `subt_${Date.now()}`;
    const subtopic: Subtopic = { ...sub, id: subId };
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, subtopics: [...t.subtopics, subtopic] } : t))
    );
  };

  const deleteSubtopic = (topicId: string, subtopicId: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== subtopicId) }
          : t
      )
    );
  };

  // --- ASSIGNMENTS CRUD ---
  const createAssignment = (newAsgn: Omit<Assignment, 'id'>) => {
    const asgnId = `asgn_${Date.now()}`;
    const assignment: Assignment = {
      ...newAsgn,
      id: asgnId
    };
    setAssignments((prev) => [assignment, ...prev]);
  };

  const updateAssignment = (assignmentId: string, data: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, ...data } : a)));
  };

  const deleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  // --- MEMBERS CRUD ---
  const createMember = (newMem: Omit<User, 'id' | 'joinedDate' | 'streak' | 'overallProgress'>) => {
    const memberId = `usr_${Date.now()}`;
    const member: User = {
      ...newMem,
      id: memberId,
      joinedDate: new Date().toISOString().split('T')[0],
      streak: 0,
      overallProgress: 0
    };
    setMembers((prev) => [...prev, member]);
  };

  const updateMember = (userId: string, data: Partial<User>) => {
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, ...data } : m)));
  };

  const deleteMember = (userId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  // --- PEER HELP & GUIDANCE ---
  const offerPeerHelp = (requestId: string) => {
    setPeerHelpRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              helperId: currentUser.id,
              helperName: currentUser.name,
              status: 'pairing_scheduled' as const
            }
          : r
      )
    );
  };

  const requestPeerHelp = (topicName: string, category: string, strugglingWith: string, confidenceScore: number) => {
    const newHelp: PeerHelpRequest = {
      id: `help_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      topicName,
      category,
      strugglingWith,
      confidenceScore,
      status: 'needs_help',
      createdAt: 'Just now'
    };
    setPeerHelpRequests((prev) => [newHelp, ...prev]);
  };

  const addGuidanceNote = (userId: string, actionPlan: string, suggestedResource: string, assignedMentor?: string) => {
    const newNote: GuidanceNote = {
      id: `guide_${Date.now()}`,
      userId,
      coordinatorName: currentUser.name,
      actionPlan,
      suggestedResource,
      assignedMentor,
      createdAt: 'Just now'
    };
    setGuidanceNotes((prev) => [newNote, ...prev]);
  };

  const addGitCommit = (message: string, branch: string) => {
    const match = message.match(/^(feat|fix|refactor|docs|test|chore|perf)(\(([^)]+)\))?:\s*(.+)$/i);
    let type: GitCommit['type'] = 'unconventional';
    let scope = undefined;
    let score = 50;
    let feedback = 'Commit message does not follow Conventional Commits format (<type>(<scope>): <subject>).';

    if (match) {
      type = match[1].toLowerCase() as GitCommit['type'];
      scope = match[3];
      const subject = match[4];

      score = 80;
      if (scope) score += 10;
      if (subject.length > 15) score += 10;
      feedback = 'Great conventional commit format adhering to semantic versioning standards.';
    }

    const newCommit: GitCommit = {
      id: `git_${Date.now()}`,
      userId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      hash: Math.random().toString(16).substring(2, 9),
      message,
      type,
      scope,
      conventionalScore: score,
      qualityFeedback: feedback,
      branch: branch || 'main',
      timestamp: 'Just now'
    };

    setGitCommits((prev) => [newCommit, ...prev]);

    setGitQuality((prev) =>
      prev.map((q) => {
        if (q.userId === currentUser.id) {
          const newTotal = q.totalCommitsCount + 1;
          const newConv = type !== 'unconventional' ? q.conventionalCommitsCount + 1 : q.conventionalCommitsCount;
          const newOverall = Math.round((newConv / newTotal) * 100);
          return {
            ...q,
            totalCommitsCount: newTotal,
            conventionalCommitsCount: newConv,
            overallScore: newOverall,
            grade: newOverall >= 95 ? 'A+' : newOverall >= 90 ? 'A' : newOverall >= 80 ? 'B' : 'C'
          };
        }
        return q;
      })
    );
  };

  const calculateEvidence = (topicId: string, userId?: string): EvidenceScore => {
    const targetUserId = userId || currentUser.id;
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) {
      return {
        topicId,
        topicName: 'Unknown',
        conceptCompletionPct: 0,
        assignmentScorePct: 0,
        checkInConfidencePct: 0,
        verifiedMasteryPct: 0,
        subtopicsPoints: 0,
        prPoints: 0,
        confidencePoints: 0,
        statusPoints: 0,
        nextActionRecommendation: 'Select a topic to start learning',
        credentialEligible: false,
        evidenceItems: []
      };
    }

    const totalSubtopics = topic.subtopics.length;
    const completedSubtopics = topic.subtopics.filter((s) => s.status === 'completed').length;
    const conceptCompletionPct = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

    const topicSubmission = submissions.find(
      (s) => s.assignmentId === topic.assignmentId && s.userId === targetUserId && s.status === 'evaluated'
    );
    const assignmentScorePct = topicSubmission?.evaluation
      ? Math.round((topicSubmission.evaluation.overallScore / 10) * 100)
      : 0;

    const userCheckIns = checkIns.filter((c) => c.userId === targetUserId);
    const checkInConfidencePct = userCheckIns.length > 0
      ? Math.round(
          (userCheckIns.reduce((acc, c) => acc + c.confidenceScore, 0) / (userCheckIns.length * 5)) * 100
        )
      : 70;

    const subtopicsPoints = Math.round(0.35 * conceptCompletionPct);
    const prPoints = Math.round(0.35 * assignmentScorePct);
    const confidencePoints = Math.round(0.15 * checkInConfidencePct);
    const statusVal = topic.status === 'completed' ? 100 : topic.status === 'learning' ? 50 : 0;
    const statusPoints = Math.round(0.15 * statusVal);

    const verifiedMasteryPct = Math.min(100, subtopicsPoints + prPoints + confidencePoints + statusPoints);

    const evidenceItems: string[] = [];
    if (completedSubtopics > 0) evidenceItems.push(`${completedSubtopics}/${totalSubtopics} Syllabus Subtopics Completed (+${subtopicsPoints} pts)`);
    if (topicSubmission?.evaluation) {
      evidenceItems.push(`PR #${topicSubmission.githubPr.split('/').pop()} Graded ${topicSubmission.evaluation.overallScore}/10 (+${prPoints} pts)`);
    }
    if (userCheckIns.length > 0) {
      evidenceItems.push(`${userCheckIns.length} Consistency Check-Ins Logged (+${confidencePoints} pts)`);
    }
    evidenceItems.push(`Phase Status: ${topic.status.toUpperCase()} (+${statusPoints} pts)`);

    // Next Action Recommendation
    let nextActionRecommendation = 'Complete all checklist subtopics to boost score.';
    if (completedSubtopics < totalSubtopics) {
      nextActionRecommendation = `Finish ${totalSubtopics - completedSubtopics} remaining subtopic${totalSubtopics - completedSubtopics > 1 ? 's' : ''} to add +${Math.round(0.35 * ((totalSubtopics - completedSubtopics) / totalSubtopics) * 100)}% verified proof.`;
    } else if (!topicSubmission) {
      nextActionRecommendation = `Submit your GitHub Pull Request for Phase ${topic.phaseNumber} assignment to unlock +35% verified proof.`;
    } else if (topicSubmission.status !== 'evaluated') {
      nextActionRecommendation = 'Your PR is in review by peer mentors. Approval will lock in +35% proof.';
    } else if (verifiedMasteryPct >= 80) {
      nextActionRecommendation = 'Verified Mastery Achieved! Skill Credential unlocked and verified.';
    }

    return {
      topicId: topic.id,
      topicName: topic.name,
      conceptCompletionPct,
      assignmentScorePct,
      checkInConfidencePct,
      verifiedMasteryPct,
      subtopicsPoints,
      prPoints,
      confidencePoints,
      statusPoints,
      nextActionRecommendation,
      credentialEligible: verifiedMasteryPct >= 80,
      evidenceItems
    };
  };

  const exportDataJSON = () => {
    const data = {
      members,
      topics,
      assignments,
      submissions,
      checkIns,
      riskAlerts,
      activityFeed,
      gitCommits,
      peerHelpRequests,
      guidanceNotes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ltrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.members && data.topics) {
        setMembers(data.members);
        setTopics(data.topics);
        if (data.assignments) setAssignments(data.assignments);
        if (data.submissions) setSubmissions(data.submissions);
        if (data.checkIns) setCheckIns(data.checkIns);
        if (data.riskAlerts) setRiskAlerts(data.riskAlerts);
        if (data.activityFeed) setActivityFeed(data.activityFeed);
        if (data.gitCommits) setGitCommits(data.gitCommits);
        if (data.peerHelpRequests) setPeerHelpRequests(data.peerHelpRequests);
        if (data.guidanceNotes) setGuidanceNotes(data.guidanceNotes);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefault = () => {
    setMembers(initialMembers);
    setTopics(initialTopics);
    setAssignments(initialAssignments);
    setSubmissions(initialSubmissions);
    setCheckIns(initialCheckIns);
    setRiskAlerts(initialRiskAlerts);
    setActivityFeed(initialActivityFeed);
    setPeerHelpRequests(initialPeerHelpRequests);
    setGuidanceNotes(initialGuidanceNotes);
    localStorage.clear();
  };

  return (
    <LTrackContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        members,
        topics,
        assignments,
        submissions,
        checkIns,
        riskAlerts,
        activityFeed,
        gitCommits,
        pullRequests,
        gitQuality,
        peerHelpRequests,
        guidanceNotes,
        activeTab,
        setActiveTab,
        login,
        logout,
        switchUser,
        toggleRole,
        toggleSubtopic,
        addDailyCheckIn,
        addSubmission,
        gradeSubmission,
        createTopic,
        updateTopic,
        deleteTopic,
        createSubtopic,
        deleteSubtopic,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        createMember,
        updateMember,
        deleteMember,
        offerPeerHelp,
        requestPeerHelp,
        addGuidanceNote,
        addGitCommit,
        calculateEvidence,
        exportDataJSON,
        importDataJSON,
        resetToDefault
      }}
    >
      {children}
    </LTrackContext.Provider>
  );
};

export const useLTrack = () => {
  const context = useContext(LTrackContext);
  if (!context) {
    throw new Error('useLTrack must be used within an LTrackProvider');
  }
  return context;
};
