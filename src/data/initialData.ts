import type {
  User,
  Topic,
  Assignment,
  Submission,
  DailyCheckIn,
  RiskAlert,
  ActivityItem,
  GitCommit,
  GitPullRequestItem,
  MemberGitQuality,
  PeerHelpRequest,
  GuidanceNote
} from '../types/ltrack';

export const initialMembers: User[] = [
  {
    id: 'usr_1',
    name: 'Nivin (You)',
    email: 'nivin@devtrack.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    github: 'nivin-dev',
    joinedDate: '2026-08-01',
    streak: 14,
    overallProgress: 84,
    currentPhase: 'Phase 4: FastAPI Dependency Injection',
    targetHoursPerWeek: 10,
    bio: 'Fullstack & AI Lead Coordinator. Passionate about Python, FastAPI, and Autonomous AI Agents.'
  },
  {
    id: 'usr_2',
    name: 'Rahul Sharma',
    email: 'rahul@devtrack.io',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    github: 'rahulsharma-code',
    joinedDate: '2026-08-01',
    streak: 12,
    overallProgress: 78,
    currentPhase: 'Phase 4: FastAPI Dependency Injection',
    targetHoursPerWeek: 8,
    bio: 'Backend & Data Science Enthusiast.'
  },
  {
    id: 'usr_3',
    name: 'Priya Patel',
    email: 'priya@devtrack.io',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    github: 'priyapatel-tech',
    joinedDate: '2026-08-02',
    streak: 9,
    overallProgress: 65,
    currentPhase: 'Phase 3: REST & Async Basics',
    targetHoursPerWeek: 8,
    bio: 'Software engineer building web APIs and ML models.'
  },
  {
    id: 'usr_4',
    name: 'Alex Chen',
    email: 'alex@devtrack.io',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    github: 'alexchen-dev',
    joinedDate: '2026-08-03',
    streak: 2,
    overallProgress: 42,
    currentPhase: 'Phase 2: HTTP Fundamentals',
    targetHoursPerWeek: 6,
    bio: 'Transitioning from Data Analytics to AI Engineering.'
  },
  {
    id: 'usr_5',
    name: 'Sarah Jenkins',
    email: 'sarah@devtrack.io',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    github: 'sarah-j-code',
    joinedDate: '2026-08-04',
    streak: 15,
    overallProgress: 91,
    currentPhase: 'Phase 5: PostgreSQL & SQLAlchemy',
    targetHoursPerWeek: 12,
    bio: 'Systems engineer focusing on Docker & Agentic Workflows.'
  }
];

export const initialTopics: Topic[] = [
  {
    id: 'top_1',
    name: 'Python Foundations & Async',
    phaseNumber: 1,
    category: 'Python',
    description: 'Master core Python syntax, OOP, type hinting, decorators, generators, and async/await event loops.',
    status: 'completed',
    prerequisites: [],
    estimatedMinutes: 360,
    assignmentId: 'asgn_1',
    resources: [
      { title: 'Python Official Docs - Asyncio', url: 'https://docs.python.org/3/library/asyncio.html', type: 'docs' },
      { title: 'Real Python - Type Hinting Guide', url: 'https://realpython.com/python-type-checking/', type: 'article' }
    ],
    subtopics: [
      { id: 'sub_1_1', name: 'Variables, Data Types & Control Flow', status: 'completed', confidence: 5 },
      { id: 'sub_1_2', name: 'Functions, *args, **kwargs & Type Hints', status: 'completed', confidence: 5 },
      { id: 'sub_1_3', name: 'OOP, Classes, Inheritance & Dunder Methods', status: 'completed', confidence: 4 },
      { id: 'sub_1_4', name: 'Custom Decorators & Context Managers', status: 'completed', confidence: 4 },
      { id: 'sub_1_5', name: 'Asyncio Event Loop & async/await Syntax', status: 'completed', confidence: 4 }
    ]
  },
  {
    id: 'top_2',
    name: 'HTTP Protocol & REST API Design',
    phaseNumber: 2,
    category: 'HTTP',
    description: 'Understand HTTP methods (GET, POST, PUT, DELETE, PATCH), status codes, headers, CORS, and RESTful resource conventions.',
    status: 'completed',
    prerequisites: ['Python Foundations & Async'],
    estimatedMinutes: 240,
    assignmentId: 'asgn_2',
    resources: [
      { title: 'MDN Web Docs - HTTP Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', type: 'docs' }
    ],
    subtopics: [
      { id: 'sub_2_1', name: 'HTTP Methods & Idempotency Rules', status: 'completed', confidence: 5 },
      { id: 'sub_2_2', name: 'HTTP Request/Response Headers & Status Codes', status: 'completed', confidence: 5 },
      { id: 'sub_2_3', name: 'REST Resource Naming & Endpoint Design', status: 'completed', confidence: 4 },
      { id: 'sub_2_4', name: 'CORS & Security Headers Basics', status: 'completed', confidence: 4 }
    ]
  },
  {
    id: 'top_3',
    name: 'FastAPI Fundamentals & Pydantic V2',
    phaseNumber: 3,
    category: 'FastAPI',
    description: 'Build fast asynchronous REST APIs using FastAPI, automatic OpenAPI documentation, and Pydantic schema validation.',
    status: 'completed',
    prerequisites: ['HTTP Protocol & REST API Design'],
    estimatedMinutes: 300,
    assignmentId: 'asgn_3',
    resources: [
      { title: 'FastAPI Official Documentation', url: 'https://fastapi.tiangolo.com/', type: 'docs' },
      { title: 'Pydantic V2 Schema Validation', url: 'https://docs.pydantic.dev/latest/', type: 'docs' }
    ],
    subtopics: [
      { id: 'sub_3_1', name: 'Path Parameters & Query Parameters', status: 'completed', confidence: 5 },
      { id: 'sub_3_2', name: 'Request Bodies & Pydantic BaseModel Validation', status: 'completed', confidence: 5 },
      { id: 'sub_3_3', name: 'Response Models & Status Code Definitions', status: 'completed', confidence: 4 },
      { id: 'sub_3_4', name: 'Handling HTTP Exceptions & Custom Handlers', status: 'completed', confidence: 4 }
    ]
  },
  {
    id: 'top_4',
    name: 'FastAPI Dependency Injection',
    phaseNumber: 4,
    category: 'FastAPI',
    description: 'Master FastAPI Depends(), function & class dependencies, nested dependencies, and dependency overrides for testing.',
    status: 'learning',
    prerequisites: ['FastAPI Fundamentals & Pydantic V2'],
    estimatedMinutes: 280,
    assignmentId: 'asgn_4',
    resources: [
      { title: 'FastAPI Dependencies Deep Dive', url: 'https://fastapi.tiangolo.com/tutorial/dependencies/', type: 'docs' }
    ],
    subtopics: [
      { id: 'sub_4_1', name: 'Basic Depends() & Function Dependencies', status: 'completed', confidence: 5 },
      { id: 'sub_4_2', name: 'Class-based Dependencies (__call__)', status: 'completed', confidence: 4 },
      { id: 'sub_4_3', name: 'Sub-dependencies / Nested Dependencies', status: 'learning', confidence: 3 },
      { id: 'sub_4_4', name: 'Global Dependencies & Router Dependencies', status: 'learning', confidence: 3 },
      { id: 'sub_4_5', name: 'Dependency Overrides in pytest', status: 'not_started', confidence: 1 }
    ]
  },
  {
    id: 'top_5',
    name: 'PostgreSQL & SQLAlchemy 2.0 Async ORM',
    phaseNumber: 5,
    category: 'PostgreSQL',
    description: 'Relational database schema design, async connection pooling, SQLAlchemy 2.0 models, migrations with Alembic.',
    status: 'not_started',
    prerequisites: ['FastAPI Dependency Injection'],
    estimatedMinutes: 400,
    assignmentId: 'asgn_5',
    resources: [
      { title: 'SQLAlchemy 2.0 Async Unified Tutorial', url: 'https://docs.sqlalchemy.org/en/20/', type: 'docs' },
      { title: 'Alembic Migration Guide', url: 'https://alembic.sqlalchemy.org/', type: 'docs' }
    ],
    subtopics: [
      { id: 'sub_5_1', name: 'PostgreSQL Tables, Keys & Indexes', status: 'not_started' },
      { id: 'sub_5_2', name: 'SQLAlchemy AsyncSession & Engine Setup', status: 'not_started' },
      { id: 'sub_5_3', name: 'Declarative Models & Relationships (1:N, N:M)', status: 'not_started' },
      { id: 'sub_5_4', name: 'Alembic Database Migrations Workflow', status: 'not_started' }
    ]
  },
  {
    id: 'top_6',
    name: 'OAuth2, JWT & RBAC Security',
    phaseNumber: 6,
    category: 'FastAPI',
    description: 'Implement JWT token generation, bcrypt password hashing, token validation middleware, and Role-Based Access Control.',
    status: 'not_started',
    prerequisites: ['PostgreSQL & SQLAlchemy 2.0 Async ORM'],
    estimatedMinutes: 320,
    resources: [],
    subtopics: [
      { id: 'sub_6_1', name: 'Password Hashing with Passlib & Bcrypt', status: 'not_started' },
      { id: 'sub_6_2', name: 'OAuth2 Password Bearer Flow', status: 'not_started' },
      { id: 'sub_6_3', name: 'JWT Access & Refresh Token Lifecycles', status: 'not_started' },
      { id: 'sub_6_4', name: 'Role-Based Access Control (RBAC) Dependency', status: 'not_started' }
    ]
  },
  {
    id: 'top_7',
    name: 'Machine Learning Model APIs (Scikit-Learn)',
    phaseNumber: 7,
    category: 'ML',
    description: 'Package trained Machine Learning models (Scikit-Learn, Joblib) into async inference APIs with FastAPI.',
    status: 'not_started',
    prerequisites: ['FastAPI Fundamentals & Pydantic V2'],
    estimatedMinutes: 300,
    resources: [],
    subtopics: [
      { id: 'sub_7_1', name: 'Model Serialization & Joblib/Pickle Loading', status: 'not_started' },
      { id: 'sub_7_2', name: 'Feature Validation Schemas with Pydantic', status: 'not_started' },
      { id: 'sub_7_3', name: 'Batch Inference Endpoint Optimization', status: 'not_started' }
    ]
  },
  {
    id: 'top_8',
    name: 'AI Integration (OpenAI & Anthropic APIs)',
    phaseNumber: 8,
    category: 'AI',
    description: 'Integrate LLM APIs, prompt engineering, structured JSON outputs, streaming responses (SSE), and token management.',
    status: 'not_started',
    prerequisites: ['Machine Learning Model APIs (Scikit-Learn)'],
    estimatedMinutes: 360,
    resources: [],
    subtopics: [
      { id: 'sub_8_1', name: 'Async LLM API Calls & Client Setup', status: 'not_started' },
      { id: 'sub_8_2', name: 'Structured JSON Outputs with Function Calling', status: 'not_started' },
      { id: 'sub_8_3', name: 'Server-Sent Events (SSE) Streaming Responses', status: 'not_started' }
    ]
  },
  {
    id: 'top_9',
    name: 'RAG (Retrieval-Augmented Generation)',
    phaseNumber: 9,
    category: 'RAG',
    description: 'Build RAG pipelines using Vector Databases (Qdrant/Pinecone), document chunking, embeddings, and semantic search.',
    status: 'not_started',
    prerequisites: ['AI Integration (OpenAI & Anthropic APIs)'],
    estimatedMinutes: 420,
    resources: [],
    subtopics: [
      { id: 'sub_9_1', name: 'Text Embedding Models & Vector Math Basics', status: 'not_started' },
      { id: 'sub_9_2', name: 'Vector DB Ingestion & Metadata Filtering', status: 'not_started' },
      { id: 'sub_9_3', name: 'Semantic Retrieval & Context Reranking', status: 'not_started' }
    ]
  },
  {
    id: 'top_10',
    name: 'Model Context Protocol (MCP)',
    phaseNumber: 10,
    category: 'MCP',
    description: 'Understand and build Model Context Protocol (MCP) servers and tools to expose local DBs and APIs to AI tools.',
    status: 'not_started',
    prerequisites: ['RAG (Retrieval-Augmented Generation)'],
    estimatedMinutes: 360,
    resources: [],
    subtopics: [
      { id: 'sub_10_1', name: 'MCP Specification & Architecture Overview', status: 'not_started' },
      { id: 'sub_10_2', name: 'Building MCP Tools, Resources & Prompts', status: 'not_started' },
      { id: 'sub_10_3', name: 'Connecting MCP Server to AI Clients', status: 'not_started' }
    ]
  },
  {
    id: 'top_11',
    name: 'Agentic AI & Multi-Agent Frameworks',
    phaseNumber: 11,
    category: 'Agentic AI',
    description: 'Design autonomous AI agents with tool use, memory loops, plan-and-execute strategies, and multi-agent coordination.',
    status: 'not_started',
    prerequisites: ['Model Context Protocol (MCP)'],
    estimatedMinutes: 450,
    resources: [],
    subtopics: [
      { id: 'sub_10_1', name: 'Agent Loop: Thought -> Action -> Observation', status: 'not_started' },
      { id: 'sub_10_2', name: 'Stateful Agent Memory & Dynamic Tool Dispatch', status: 'not_started' },
      { id: 'sub_10_3', name: 'Multi-Agent Collaboration & Orchestration', status: 'not_started' }
    ]
  },
  {
    id: 'top_12',
    name: 'Docker & Microservices Containerization',
    phaseNumber: 12,
    category: 'Docker',
    description: 'Containerize FastAPI, PostgreSQL, Redis, and AI worker services using Dockerfiles and Docker Compose.',
    status: 'not_started',
    prerequisites: ['Agentic AI & Multi-Agent Frameworks'],
    estimatedMinutes: 300,
    resources: [],
    subtopics: [
      { id: 'sub_12_1', name: 'Multi-stage Dockerfile Optimization for Python', status: 'not_started' },
      { id: 'sub_12_2', name: 'Docker Compose Networking & Environment Secrets', status: 'not_started' }
    ]
  },
  {
    id: 'top_13',
    name: 'CI/CD Pipelines & Automated Testing',
    phaseNumber: 13,
    category: 'CI/CD',
    description: 'Configure GitHub Actions pipelines for automated pytest runs, linting (Ruff/Black), Docker image builds, and zero-cost deployment.',
    status: 'not_started',
    prerequisites: ['Docker & Microservices Containerization'],
    estimatedMinutes: 280,
    resources: [],
    subtopics: [
      { id: 'sub_13_1', name: 'GitHub Actions Workflow Triggers & Secrets', status: 'not_started' },
      { id: 'sub_13_2', name: 'Automated Pytest & Coverage Reporting', status: 'not_started' }
    ]
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asgn_1',
    topicId: 'top_1',
    title: 'Async Task Execution Decorator',
    description: 'Build a custom Python decorator that logs function execution time and supports both synchronous and async/await functions gracefully.',
    difficulty: 'Easy',
    deadline: '2026-08-10',
    expectedMinutes: 45,
    requiredGithub: true
  },
  {
    id: 'asgn_2',
    topicId: 'top_2',
    title: 'HTTP Client & API Error Handler',
    description: 'Write an HTTP client wrapper using httpx that automatically retries 5xx server errors and cleanly formats 4xx client errors.',
    difficulty: 'Medium',
    deadline: '2026-08-15',
    expectedMinutes: 60,
    requiredGithub: true
  },
  {
    id: 'asgn_3',
    topicId: 'top_3',
    title: 'FastAPI CRUD Endpoint for Items',
    description: 'Implement a full CRUD FastAPI router with Pydantic field validation (min length, pattern matching, custom validator) and proper HTTP status codes.',
    difficulty: 'Medium',
    deadline: '2026-08-20',
    expectedMinutes: 75,
    requiredGithub: true
  },
  {
    id: 'asgn_4',
    topicId: 'top_4',
    title: 'JWT Auth & Database Session Dependencies',
    description: 'Create reusable FastAPI dependencies for getting current authenticated user from JWT Bearer header and yielding scoped DB sessions.',
    difficulty: 'Hard',
    deadline: '2026-08-25',
    expectedMinutes: 90,
    requiredGithub: true
  }
];

export const initialSubmissions: Submission[] = [
  {
    id: 'subm_1',
    assignmentId: 'asgn_4',
    userId: 'usr_2', // Rahul
    submittedAt: '2026-08-21T18:30:00Z',
    githubPr: 'https://github.com/rahulsharma-code/ltrack-learning/pull/4',
    branch: 'feature/fastapi-deps',
    notes: 'Implemented get_db and get_current_user dependencies with dependency override tests in pytest.',
    codeSnippet: `from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = verify_jwt_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user`,
    status: 'evaluated',
    evaluation: {
      codeQuality: 9,
      understanding: 9,
      testing: 8,
      documentation: 8,
      overallScore: 8.5,
      feedback: 'Excellent async exception handling and clean dependency separation! Consider adding refresh token verification next.',
      gradedAt: '2026-08-21T20:10:00Z',
      gradedBy: 'Nivin (Admin)'
    }
  },
  {
    id: 'subm_2',
    assignmentId: 'asgn_4',
    userId: 'usr_3', // Priya
    submittedAt: '2026-08-21T21:15:00Z',
    githubPr: 'https://github.com/priyapatel-tech/ltrack-learning/pull/2',
    branch: 'feature/auth-dep',
    notes: 'Completed basic token verification dependency. Working on nested permission dependencies.',
    codeSnippet: `def get_user_db(db: Session = Depends(get_db)):
    return UserDAO(db)`,
    status: 'submitted'
  }
];

export const initialCheckIns: DailyCheckIn[] = [
  {
    id: 'chk_1',
    userId: 'usr_2',
    date: '2026-08-21',
    completedLearning: 'yes',
    timeSpentMinutes: 60,
    confidenceScore: 4,
    difficulty: 'medium',
    whatLearned: 'Understood Depends() and how FastAPI caches dependency call results within a single request lifetime.',
    confusedAbout: 'When to use class-based dependencies vs simple function dependencies.',
    toRevise: 'Practice class-based dependency overrides in unit tests.'
  },
  {
    id: 'chk_2',
    userId: 'usr_3',
    date: '2026-08-21',
    completedLearning: 'yes',
    timeSpentMinutes: 45,
    confidenceScore: 4,
    difficulty: 'easy',
    whatLearned: 'Created custom exception handlers for Pydantic validation errors.',
    confusedAbout: 'Async context manager dependencies.',
    toRevise: 'Yield dependencies in FastAPI.'
  }
];

export const initialRiskAlerts: RiskAlert[] = [
  {
    id: 'risk_1',
    userId: 'usr_4',
    userName: 'Alex Chen',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    severity: 'high',
    reasons: [
      'Overdue on Assignment #3 (FastAPI CRUD Endpoint)',
      'No daily check-in submitted for 4 consecutive days',
      'Confidence rating on HTTP status codes dropped to 2/5'
    ],
    recommendedAction: 'Schedule a 15-minute 1-on-1 review session focused on HTTP methods and Pydantic validation.'
  }
];

export const initialActivityFeed: ActivityItem[] = [
  {
    id: 'act_1',
    userId: 'usr_2',
    userName: 'Rahul Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'graded',
    detail: 'Assignment #4 (JWT Auth & Database Session Dependencies) graded 8.5/10 by Nivin',
    timestamp: '2 hours ago'
  },
  {
    id: 'act_2',
    userId: 'usr_3',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'submission',
    detail: 'Submitted Pull Request for Assignment #4',
    timestamp: '3 hours ago'
  },
  {
    id: 'act_3',
    userId: 'usr_2',
    userName: 'Rahul Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'checkin',
    detail: 'Completed Daily Check-In (60 mins, 4★ confidence)',
    timestamp: '5 hours ago'
  },
  {
    id: 'act_4',
    userId: 'usr_5',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    type: 'streak',
    detail: 'Reached a 🔥 15-Day Learning Streak milestone!',
    timestamp: 'Yesterday'
  }
];

export const initialGitCommits: GitCommit[] = [
  {
    id: 'git_1',
    userId: 'usr_2',
    authorName: 'Rahul Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hash: 'a9f3b2c',
    message: 'feat(auth): implement oauth2 password bearer token validation with jwt (#14)',
    type: 'feat',
    scope: 'auth',
    conventionalScore: 100,
    qualityFeedback: 'Excellent conventional format with clear scope and PR link reference.',
    branch: 'feature/oauth2-jwt',
    timestamp: '2 hours ago'
  },
  {
    id: 'git_2',
    userId: 'usr_3',
    authorName: 'Priya Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    hash: '7c4e1a0',
    message: 'fix(database): resolve asyncpg connection pool deadlock in pytest fixtures',
    type: 'fix',
    scope: 'database',
    conventionalScore: 95,
    qualityFeedback: 'Great imperative message and accurate scope identification.',
    branch: 'fix/asyncpg-fixtures',
    timestamp: '4 hours ago'
  },
  {
    id: 'git_3',
    userId: 'usr_4',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    hash: 'e1d2f89',
    message: 'docs(readme): add installation guide for docker-compose and postgresql',
    type: 'docs',
    scope: 'readme',
    conventionalScore: 90,
    qualityFeedback: 'Clean documentation commit adhering to semantic specifications.',
    branch: 'docs/docker-setup',
    timestamp: 'Yesterday'
  },
  {
    id: 'git_4',
    userId: 'usr_5',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    hash: '4b8d76e',
    message: 'test(api): add unit tests for custom error handlers and 404 responses',
    type: 'test',
    scope: 'api',
    conventionalScore: 95,
    qualityFeedback: 'Proper test prefix with concise target summary.',
    branch: 'test/error-handlers',
    timestamp: '2 days ago'
  },
  {
    id: 'git_5',
    userId: 'usr_1',
    authorName: 'Nivin (Admin)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hash: '0c78a31',
    message: 'refactor(middleware): optimize rate limiter token bucket algorithm',
    type: 'refactor',
    scope: 'middleware',
    conventionalScore: 100,
    qualityFeedback: 'Flawless commit structure with active verb.',
    branch: 'refactor/rate-limiter',
    timestamp: '3 days ago'
  }
];

export const initialPullRequests: GitPullRequestItem[] = [
  {
    id: 'pr_101',
    prNumber: 14,
    userId: 'usr_2',
    userName: 'Rahul Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'feat(auth): Implement OAuth2 JWT Authentication & Protected Routes',
    branch: 'feature/oauth2-jwt',
    status: 'open',
    additions: 184,
    deletions: 22,
    reviewers: ['Nivin (Admin)', 'Priya Patel'],
    githubUrl: 'https://github.com/group/devtrack-learning/pull/14',
    createdAt: '3 hours ago'
  },
  {
    id: 'pr_102',
    prNumber: 13,
    userId: 'usr_3',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'fix(database): SQLAlchemy AsyncSession Dependency Injection & Migrations',
    branch: 'fix/asyncpg-fixtures',
    status: 'merged',
    additions: 96,
    deletions: 48,
    reviewers: ['Nivin (Admin)'],
    githubUrl: 'https://github.com/group/devtrack-learning/pull/13',
    createdAt: 'Yesterday'
  },
  {
    id: 'pr_103',
    prNumber: 12,
    userId: 'usr_5',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'feat(rag): Vector Database Search Pipeline using LangChain & Qdrant',
    branch: 'feature/rag-pipeline',
    status: 'in_review',
    additions: 320,
    deletions: 15,
    reviewers: ['Rahul Sharma'],
    githubUrl: 'https://github.com/group/devtrack-learning/pull/12',
    createdAt: '2 days ago'
  }
];

export const initialGitQuality: MemberGitQuality[] = [
  {
    userId: 'usr_2',
    userName: 'Rahul Sharma',
    overallScore: 96,
    grade: 'A+',
    conventionalCommitsCount: 18,
    totalCommitsCount: 19,
    prsCreated: 4,
    prsReviewed: 6,
    linesAdded: 1240,
    linesDeleted: 280
  },
  {
    userId: 'usr_3',
    userName: 'Priya Patel',
    overallScore: 92,
    grade: 'A',
    conventionalCommitsCount: 14,
    totalCommitsCount: 15,
    prsCreated: 3,
    prsReviewed: 5,
    linesAdded: 890,
    linesDeleted: 140
  },
  {
    userId: 'usr_5',
    userName: 'Sarah Jenkins',
    overallScore: 94,
    grade: 'A',
    conventionalCommitsCount: 16,
    totalCommitsCount: 17,
    prsCreated: 4,
    prsReviewed: 4,
    linesAdded: 1450,
    linesDeleted: 190
  },
  {
    userId: 'usr_4',
    userName: 'Alex Rivera',
    overallScore: 78,
    grade: 'B',
    conventionalCommitsCount: 8,
    totalCommitsCount: 12,
    prsCreated: 2,
    prsReviewed: 2,
    linesAdded: 620,
    linesDeleted: 110
  }
];

export const initialPeerHelpRequests: PeerHelpRequest[] = [
  {
    id: 'help_1',
    userId: 'usr_4',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    topicName: 'FastAPI Dependency Injection',
    category: 'FastAPI',
    strugglingWith: 'Having difficulty grasping sub-dependencies and yield fixtures in pytest.',
    confidenceScore: 2,
    helperId: 'usr_2',
    helperName: 'Rahul Sharma',
    status: 'pairing_scheduled',
    createdAt: '1 day ago'
  },
  {
    id: 'help_2',
    userId: 'usr_3',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    topicName: 'SQLAlchemy Async ORM',
    category: 'PostgreSQL',
    strugglingWith: 'Async session deadlock when running concurrent async queries in FastAPI.',
    confidenceScore: 2,
    status: 'needs_help',
    createdAt: '3 hours ago'
  },
  {
    id: 'help_3',
    userId: 'usr_5',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    topicName: 'Docker Multi-stage Builds',
    category: 'Docker',
    strugglingWith: 'Reducing production image size and caching pip wheels properly.',
    confidenceScore: 3,
    helperId: 'usr_1',
    helperName: 'Nivin (Admin)',
    status: 'resolved',
    createdAt: '2 days ago'
  }
];

export const initialGuidanceNotes: GuidanceNote[] = [
  {
    id: 'guide_1',
    userId: 'usr_4',
    coordinatorName: 'Nivin (Admin)',
    actionPlan: 'Pair with Rahul Sharma on Wednesday 6 PM to walk through FastAPI Depends() and yield generator teardowns.',
    suggestedResource: 'https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/',
    assignedMentor: 'Rahul Sharma',
    createdAt: 'Yesterday'
  }
];



