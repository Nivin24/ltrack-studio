export interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  phaseNumber: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimitMinutes: number;
  points: number;
  description: string;
  initialCode: string;
  solutionTemplate: string;
  language: string;
  testCases: TestCase[];
  hints: string[];
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  phaseNumber: number;
  category: string;
  question: string;
  codeSnippet?: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface UserChallengeSubmission {
  challengeId: string;
  code: string;
  passedCount: number;
  totalCount: number;
  status: 'passed' | 'failed' | 'attempted';
  submittedAt: string;
}
