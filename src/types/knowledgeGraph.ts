export type DomainType =
  | 'python_core'
  | 'web_apis'
  | 'database'
  | 'devops'
  | 'ai_rag'
  | 'quality_prod';

export type NodeStatus = 'locked' | 'unlocked' | 'in_progress' | 'mastered';

export interface KnowledgeNode {
  id: string;
  title: string;
  domain: DomainType;
  phaseNumber: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  estimatedHours: number;
  prerequisites: string[]; // IDs of required nodes
  unlocks: string[]; // IDs of nodes unlocked upon mastery
  subtopics: string[];
  keyConcepts: string[];
  codeSnippet?: string;
  topicRefId?: string; // Links to curriculum phase topic in LTrackContext
  quizCategoryId?: string;
  x?: number; // Spatial position in graph
  y?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  relationship: 'prerequisite' | 'enhances' | 'composes';
  label?: string;
}

export interface DomainClusterInfo {
  id: DomainType;
  name: string;
  color: string;
  secondaryColor: string;
  description: string;
}

export interface UserGraphProgress {
  userId: string;
  nodeMastery: Record<string, {
    status: NodeStatus;
    masteryPct: number;
    completedSubtopicsCount: number;
    totalSubtopicsCount: number;
    lastUpdated?: string;
  }>;
}
