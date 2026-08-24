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
  subtopicName?: string;
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

export interface Flashcard {
  id: string;
  category: string;
  subtopicName?: string;
  phaseNumber: number;
  title: string;
  prompt: string;
  codeSnippet?: string;
  answer: string;
  explanation: string;
  keyTakeaway: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface QuizAttemptRecord {
  id: string;
  userId: string;
  category: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  timeSpentSeconds: number;
  timestamp: string; // Indian Standard Time format
  failedQuestions: {
    questionId: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
}
