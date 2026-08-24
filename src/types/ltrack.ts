export type Role = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  github: string;
  joinedDate: string;
  streak: number;
  overallProgress: number; // 0 - 100
  currentPhase: string;
  targetHoursPerWeek: number;
  bio: string;
}

export type ProgressStatus = 'completed' | 'learning' | 'not_started';

export interface ResourceLink {
  title: string;
  url: string;
  type: 'docs' | 'video' | 'article' | 'repo';
}

export interface Subtopic {
  id: string;
  name: string;
  status: ProgressStatus;
  confidence?: number; // 1-5
}

export interface Topic {
  id: string;
  name: string;
  phaseNumber: number; // 1 to 15
  category: string; // e.g. "Python", "FastAPI", "PostgreSQL", "ML", "AI", "RAG", "MCP", "Agentic AI", "Docker", "CI/CD"
  description: string;
  status: ProgressStatus;
  subtopics: Subtopic[];
  prerequisites: string[];
  estimatedMinutes: number;
  assignmentId?: string;
  quizId?: string;
  resources: ResourceLink[];
  iconName?: string;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedLearning: 'yes' | 'partially' | 'no';
  timeSpentMinutes: number;
  confidenceScore: number; // 1 to 5
  difficulty: 'easy' | 'medium' | 'hard';
  whatLearned: string;
  confusedAbout: string;
  toRevise: string;
}

export interface AssignmentEvaluation {
  codeQuality: number; // 1-10
  understanding: number; // 1-10
  testing: number; // 1-10
  documentation: number; // 1-10
  overallScore: number; // 1-10 calculated
  feedback: string;
  gradedAt: string;
  gradedBy: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  submittedAt: string;
  githubPr: string;
  branch: string;
  notes: string;
  codeSnippet: string;
  status: 'submitted' | 'evaluated' | 'revision_requested';
  evaluation?: AssignmentEvaluation;
}

export interface Assignment {
  id: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deadline: string;
  expectedMinutes: number;
  requiredGithub: boolean;
}

export interface RiskAlert {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  severity: 'high' | 'medium' | 'low';
  reasons: string[];
  recommendedAction: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'checkin' | 'submission' | 'graded' | 'subtopic' | 'streak';
  detail: string;
  timestamp: string;
}

export interface EvidenceScore {
  topicId: string;
  topicName: string;
  conceptCompletionPct: number;
  assignmentScorePct: number;
  checkInConfidencePct: number;
  verifiedMasteryPct: number;
  subtopicsPoints: number;
  prPoints: number;
  confidencePoints: number;
  statusPoints: number;
  nextActionRecommendation: string;
  credentialEligible: boolean;
  evidenceItems: string[];
}

export interface GitCommit {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  hash: string;
  message: string;
  type: 'feat' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore' | 'unconventional';
  scope?: string;
  conventionalScore: number; // 0 - 100
  qualityFeedback: string;
  branch: string;
  timestamp: string;
}

export interface GitPullRequestItem {
  id: string;
  prNumber: number;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  branch: string;
  status: 'open' | 'merged' | 'in_review';
  additions: number;
  deletions: number;
  reviewers: string[];
  githubUrl: string;
  createdAt: string;
}

export interface MemberGitQuality {
  userId: string;
  userName: string;
  overallScore: number; // 0 - 100%
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  conventionalCommitsCount: number;
  totalCommitsCount: number;
  prsCreated: number;
  prsReviewed: number;
  linesAdded: number;
  linesDeleted: number;
}

export interface PeerHelpRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  topicName: string;
  category: string;
  strugglingWith: string;
  confidenceScore: number; // 1 to 5
  helperId?: string;
  helperName?: string;
  status: 'needs_help' | 'pairing_scheduled' | 'resolved';
  createdAt: string;
}

export interface GuidanceNote {
  id: string;
  userId: string;
  coordinatorName: string;
  actionPlan: string;
  suggestedResource: string;
  assignedMentor?: string;
  createdAt: string;
}

