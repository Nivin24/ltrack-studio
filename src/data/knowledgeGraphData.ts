import type { KnowledgeNode, KnowledgeEdge, DomainClusterInfo } from '../types/knowledgeGraph';

export const domainClusters: DomainClusterInfo[] = [
  {
    id: 'python_core',
    name: 'Python Core & Async',
    color: '#d4a373',
    secondaryColor: 'rgba(212, 163, 115, 0.15)',
    description: 'Foundations of Python 3.12+, AsyncIO concurrency, OOP protocols, and memory management.'
  },
  {
    id: 'web_apis',
    name: 'FastAPI & Architecture',
    color: '#38bdf8',
    secondaryColor: 'rgba(56, 189, 248, 0.15)',
    description: 'High-performance async REST APIs, Dependency Injection, Pydantic v2 schemas, and security.'
  },
  {
    id: 'database',
    name: 'Database & Storage',
    color: '#34d399',
    secondaryColor: 'rgba(52, 211, 153, 0.15)',
    description: 'PostgreSQL relational design, indexing, async SQLAlchemy 2.0, Alembic migrations, and Redis.'
  },
  {
    id: 'devops',
    name: 'Docker & Containers',
    color: '#c084fc',
    secondaryColor: 'rgba(192, 132, 252, 0.15)',
    description: 'Containerization, multi-stage production images, networking, and local multi-service orchestration.'
  },
  {
    id: 'ai_rag',
    name: 'AI, RAG & Agents',
    color: '#fb923c',
    secondaryColor: 'rgba(251, 146, 60, 0.15)',
    description: 'pgvector semantic search, chunking strategies, hybrid retrieval, LLM integration, and ReAct agents.'
  },
  {
    id: 'quality_prod',
    name: 'Quality & Production',
    color: '#f43f5e',
    secondaryColor: 'rgba(244, 63, 94, 0.15)',
    description: 'Pytest testcontainers, GitHub Actions CI/CD, Render cloud deployment, and system telemetry.'
  }
];

export const initialKnowledgeNodes: KnowledgeNode[] = [
  // --- DOMAIN: PYTHON CORE ---
  {
    id: 'py_basics',
    title: 'Python 3.12 Fundamentals',
    domain: 'python_core',
    phaseNumber: 1,
    description: 'Core syntax, memory model, data structures (dicts, sets, tuples), type hints, and comprehension pipelines.',
    difficulty: 'Beginner',
    estimatedHours: 8,
    prerequisites: [],
    unlocks: ['py_oop', 'py_generators'],
    subtopics: ['Primitive Types & Slicing', 'Dictionary Hash Maps', 'Type Annotations', 'List & Dict Comprehensions'],
    keyConcepts: ['Immutability vs Mutability', 'Hash Collision Resistance', 'Structural Pattern Matching'],
    codeSnippet: `def process_metrics(raw_scores: list[int]) -> dict[str, float]:
    cleaned = [s for s in raw_scores if s >= 0]
    return {"mean": sum(cleaned) / len(cleaned) if cleaned else 0.0}`,
    topicRefId: 'p1_python',
    quizCategoryId: 'Python',
    x: 80,
    y: 120
  },
  {
    id: 'py_oop',
    title: 'OOP & Dunder Protocols',
    domain: 'python_core',
    phaseNumber: 1,
    description: 'Object-oriented architecture, magic dunder methods (__enter__, __call__, __repr__), dataclasses, and custom protocols.',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    prerequisites: ['py_basics'],
    unlocks: ['pydantic_v2', 'py_asyncio'],
    subtopics: ['Dunder Methods', 'Dataclasses & Frozen Models', 'Protocol Types (Structural Typing)', 'Context Managers'],
    keyConcepts: ['Duck Typing Protocols', 'MRO (Method Resolution Order)', 'Descriptor Protocol'],
    codeSnippet: `from typing import Protocol

class DatabaseConnection(Protocol):
    async def execute(self, query: str) -> list[dict]: ...`,
    topicRefId: 'p1_python',
    quizCategoryId: 'Python',
    x: 240,
    y: 80
  },
  {
    id: 'py_generators',
    title: 'Generators & Iterators',
    domain: 'python_core',
    phaseNumber: 2,
    description: 'Memory-efficient streaming pipelines with yield, custom iterables, itertools, and lazy evaluation.',
    difficulty: 'Intermediate',
    estimatedHours: 6,
    prerequisites: ['py_basics'],
    unlocks: ['py_asyncio', 'fastapi_di'],
    subtopics: ['yield & yield from', 'Custom __iter__ and __next__', 'Streaming Large Files', 'itertools & Generators'],
    keyConcepts: ['Lazy Evaluation', 'Memory Optimization (O(1) Streaming)', 'Coroutine Suspension'],
    codeSnippet: `def chunk_stream(file_path: str, chunk_size: int = 1024):
    with open(file_path, "r", encoding="utf-8") as f:
        while chunk := f.read(chunk_size):
            yield chunk`,
    topicRefId: 'p2_async',
    quizCategoryId: 'Python',
    x: 240,
    y: 200
  },
  {
    id: 'py_asyncio',
    title: 'AsyncIO & Concurrency',
    domain: 'python_core',
    phaseNumber: 2,
    description: 'Asynchronous event loops, async/await coroutines, asyncio.gather, TaskGroups, cancellation tokens, and non-blocking I/O.',
    difficulty: 'Advanced',
    estimatedHours: 12,
    prerequisites: ['py_oop', 'py_generators'],
    unlocks: ['fastapi_core', 'sqlalchemy_async'],
    subtopics: ['Event Loop & Coroutines', 'asyncio.gather vs TaskGroup', 'Locking & Semaphores', 'Handling Async Timeouts'],
    keyConcepts: ['Cooperative Multitasking', 'Non-blocking I/O Bounds', 'Thread Pool Execution (run_in_executor)'],
    codeSnippet: `import asyncio

async def fetch_parallel(urls: list[str]):
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(client.get(url)) for url in urls]
    return [t.result() for t in tasks]`,
    topicRefId: 'p2_async',
    quizCategoryId: 'Python',
    x: 420,
    y: 140
  },

  // --- DOMAIN: WEB & APIS ---
  {
    id: 'pydantic_v2',
    title: 'Pydantic v2 Schema Modeling',
    domain: 'web_apis',
    phaseNumber: 3,
    description: 'Rust-accelerated Core data validation, Field constraints, root validators, serialization, and JSON Schema generation.',
    difficulty: 'Intermediate',
    estimatedHours: 8,
    prerequisites: ['py_oop'],
    unlocks: ['fastapi_core'],
    subtopics: ['BaseModel & ConfigDict', 'field_validator & model_validator', 'Custom Serializers', 'Generic Models (Result[T])'],
    keyConcepts: ['Type Coercion vs Strict Mode', 'Rust Core Compilation Speed', 'Nested Polymorphic Schemas'],
    codeSnippet: `from pydantic import BaseModel, Field, field_validator

class UserCreate(BaseModel):
    email: str = Field(..., min_length=5)
    score: int = Field(ge=0, le=100)`,
    topicRefId: 'p3_fastapi',
    quizCategoryId: 'FastAPI',
    x: 420,
    y: 20
  },
  {
    id: 'fastapi_core',
    title: 'FastAPI Core Architecture',
    domain: 'web_apis',
    phaseNumber: 3,
    description: 'High-throughput ASGI server endpoints, APIRouter modular routing, request lifecycle, status codes, and OpenAPI documentation.',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    prerequisites: ['py_asyncio', 'pydantic_v2'],
    unlocks: ['fastapi_di', 'fastapi_auth'],
    subtopics: ['ASGI Request Flow', 'APIRouter Organization', 'Path & Query Parameters', 'Exception Handlers'],
    keyConcepts: ['Starlette Underpinnings', 'Automatic Swagger UI Specs', 'Non-blocking Route Handlers'],
    codeSnippet: `from fastapi import FastAPI, APIRouter

app = FastAPI(title="LTrack Engine")
api_router = APIRouter(prefix="/api/v1")

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}`,
    topicRefId: 'p3_fastapi',
    quizCategoryId: 'FastAPI',
    x: 600,
    y: 80
  },
  {
    id: 'fastapi_di',
    title: 'FastAPI Dependency Injection',
    domain: 'web_apis',
    phaseNumber: 4,
    description: 'Hierarchical dependency graphs using Depends(), yield teardown for database sessions, and contextual security scopes.',
    difficulty: 'Advanced',
    estimatedHours: 10,
    prerequisites: ['fastapi_core', 'py_generators'],
    unlocks: ['sqlalchemy_async', 'fastapi_auth'],
    subtopics: ['Depends() Mechanism', 'yield Cleanup Handlers', 'Sub-Dependencies & Overrides', 'Testing with app.dependency_overrides'],
    keyConcepts: ['Inversion of Control (IoC)', 'Session Scoping & Teardown', 'Zero-Coupling Architecture'],
    codeSnippet: `async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise`,
    topicRefId: 'p4_di',
    quizCategoryId: 'FastAPI',
    x: 760,
    y: 40
  },
  {
    id: 'fastapi_auth',
    title: 'Security, JWT & OAuth2',
    domain: 'web_apis',
    phaseNumber: 4,
    description: 'Cryptographic password hashing (bcrypt), JWT token signing with RSA/HS256, OAuth2PasswordBearer, and RBAC authorization.',
    difficulty: 'Advanced',
    estimatedHours: 8,
    prerequisites: ['fastapi_core'],
    unlocks: ['redis_caching'],
    subtopics: ['Passlib & Bcrypt Hashing', 'JWT Claims & Expiration', 'OAuth2Bearer Dependency', 'Role-Based Access (Admin/Member)'],
    keyConcepts: ['Stateless Token Security', 'Replay Attack Prevention', 'Cryptographic Nonces'],
    codeSnippet: `from jose import jwt

def create_access_token(data: dict, secret: str) -> str:
    payload = data.copy()
    payload.update({"exp": datetime.utcnow() + timedelta(hours=24)})
    return jwt.encode(payload, secret, algorithm="HS256")`,
    topicRefId: 'p4_di',
    quizCategoryId: 'FastAPI',
    x: 760,
    y: 160
  },

  // --- DOMAIN: DATABASE & STORAGE ---
  {
    id: 'postgres_core',
    title: 'PostgreSQL Relational Design',
    domain: 'database',
    phaseNumber: 5,
    description: 'ACID transaction guarantees, relational schema design, primary/foreign keys, CASCADE constraints, and complex JOIN queries.',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    prerequisites: ['py_basics'],
    unlocks: ['postgres_indexing', 'sqlalchemy_async'],
    subtopics: ['DDL Schemas & Constraints', 'ACID Transaction Isolation', 'Complex Multi-Table Joins', 'Window Functions'],
    keyConcepts: ['Isolation Levels (Read Committed vs Serializable)', 'MVCC (Multi-Version Concurrency Control)', 'Write-Ahead Log (WAL)'],
    codeSnippet: `BEGIN;
SELECT * FROM accounts WHERE id = 101 FOR UPDATE;
UPDATE accounts SET balance = balance - 500 WHERE id = 101;
UPDATE accounts SET balance = balance + 500 WHERE id = 202;
COMMIT;`,
    topicRefId: 'p5_postgres',
    quizCategoryId: 'PostgreSQL',
    x: 420,
    y: 280
  },
  {
    id: 'postgres_indexing',
    title: 'Postgres Indexing & Query Tuning',
    domain: 'database',
    phaseNumber: 5,
    description: 'Query planning optimization with EXPLAIN (ANALYZE, BUFFERS), B-Tree vs GIN/GiST indexes, partial indexes, and partitioning.',
    difficulty: 'Advanced',
    estimatedHours: 10,
    prerequisites: ['postgres_core'],
    unlocks: ['pgvector_qdrant'],
    subtopics: ['EXPLAIN ANALYZE Cost Models', 'B-Tree Composite Indexes', 'GIN Trigram Search Indexes', 'Partial & Expression Indexes'],
    keyConcepts: ['Seq Scan vs Index Scan', 'Index Selectivity & Cardinality', 'Buffer Cache Hit Ratio'],
    codeSnippet: `CREATE INDEX idx_users_active_email 
ON users (email) 
WHERE is_active = TRUE;

EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'alex@example.com';`,
    topicRefId: 'p5_postgres',
    quizCategoryId: 'PostgreSQL',
    x: 600,
    y: 320
  },
  {
    id: 'sqlalchemy_async',
    title: 'Async SQLAlchemy 2.0 ORM',
    domain: 'database',
    phaseNumber: 6,
    description: 'AsyncEngine, select() 2.0 syntax, AsyncSession lifecycle, selectinload relationship strategies, and database connection pooling.',
    difficulty: 'Advanced',
    estimatedHours: 12,
    prerequisites: ['postgres_core', 'py_asyncio', 'fastapi_di'],
    unlocks: ['alembic_migrations', 'pgvector_qdrant'],
    subtopics: ['DeclarativeBase & Mapped[T]', 'selectinload & joinedload', 'Connection Pool Tuning', 'Async Session Unit of Work'],
    keyConcepts: ['N+1 Query Problem Elimination', 'Session Flush vs Commit', 'Asyncpg Native Binary Protocol'],
    codeSnippet: `from sqlalchemy import select
from sqlalchemy.orm import selectinload

stmt = select(User).options(selectinload(User.assignments)).where(User.is_active == True)
result = await session.execute(stmt)
users = result.scalars().all()`,
    topicRefId: 'p6_orm',
    quizCategoryId: 'PostgreSQL',
    x: 760,
    y: 260
  },
  {
    id: 'alembic_migrations',
    title: 'Alembic Database Migrations',
    domain: 'database',
    phaseNumber: 6,
    description: 'Automated schema revision generation, upgrade/downgrade scripts, safe production migrations, and zero-downtime column additions.',
    difficulty: 'Intermediate',
    estimatedHours: 6,
    prerequisites: ['sqlalchemy_async'],
    unlocks: ['docker_core'],
    subtopics: ['alembic revision --autogenerate', 'Deterministic Revision Tree', 'Online Migration Patterns', 'Multi-Head Resolution'],
    keyConcepts: ['Backward Compatible Schemas', 'Non-blocking Table Alters', 'Transactional DDL'],
    codeSnippet: `def upgrade() -> None:
    op.add_column('users', sa.Column('streak_count', sa.Integer(), server_default='0', nullable=False))

def downgrade() -> None:
    op.drop_column('users', 'streak_count')`,
    topicRefId: 'p6_orm',
    quizCategoryId: 'PostgreSQL',
    x: 940,
    y: 240
  },
  {
    id: 'redis_caching',
    title: 'Redis Caching & Distributed Locks',
    domain: 'database',
    phaseNumber: 7,
    description: 'In-memory caching patterns (Cache-Aside, Write-Through), TTL invalidation, distributed locking with Redlock, and Pub/Sub streams.',
    difficulty: 'Advanced',
    estimatedHours: 8,
    prerequisites: ['fastapi_auth'],
    unlocks: ['docker_compose', 'rag_pipeline'],
    subtopics: ['Cache-Aside Strategy', 'TTL & Stamped Invalidation', 'Redis Pub/Sub Real-time Events', 'Distributed Rate Limiting (Token Bucket)'],
    keyConcepts: ['Cache Stampede Prevention', 'Sub-Millisecond Read Latency', 'Atomic SETNX Locking'],
    codeSnippet: `async def get_cached_profile(user_id: str):
    cached = await redis.get(f"profile:{user_id}")
    if cached:
        return json.loads(cached)
    data = await db.fetch_user(user_id)
    await redis.setex(f"profile:{user_id}", 3600, json.dumps(data))
    return data`,
    topicRefId: 'p7_redis',
    quizCategoryId: 'FastAPI',
    x: 940,
    y: 140
  },

  // --- DOMAIN: DEVOPS & CONTAINERS ---
  {
    id: 'docker_core',
    title: 'Docker & Multi-Stage Builds',
    domain: 'devops',
    phaseNumber: 8,
    description: 'Multi-stage Dockerfiles, minimal distroless/alpine runtimes, caching build layers with uv/pip, and container security.',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    prerequisites: ['alembic_migrations'],
    unlocks: ['docker_compose', 'testcontainers'],
    subtopics: ['Multi-Stage Dockerfiles', 'Layer Cache Optimization', 'Non-Root Security Contexts', '.dockerignore Rules'],
    keyConcepts: ['Minimal Image Footprint', 'BuildKit Cache Mounts', 'OCI Image Standards'],
    codeSnippet: `FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runner
USER nobody
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY backend/ backend/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    topicRefId: 'p8_docker',
    quizCategoryId: 'Docker',
    x: 1120,
    y: 220
  },
  {
    id: 'docker_compose',
    title: 'Docker Compose Orchestration',
    domain: 'devops',
    phaseNumber: 8,
    description: 'Multi-container topologies combining FastAPI, Postgres, pgvector, and Redis with healthchecks and isolated virtual networks.',
    difficulty: 'Intermediate',
    estimatedHours: 8,
    prerequisites: ['docker_core', 'redis_caching'],
    unlocks: ['github_actions', 'testcontainers'],
    subtopics: ['Service Dependency Ordering (depends_on)', 'Healthcheck Probes', 'Named Volumes & Persistence', 'Internal Bridge Networks'],
    keyConcepts: ['Environment Parity', 'Service Discovery by DNS', 'Container Graceful Shutdown'],
    codeSnippet: `services:
  api:
    build: .
    depends_on:
      db:
        condition: service_healthy
  db:
    image: pgvector/pgvector:pg16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]`,
    topicRefId: 'p8_docker',
    quizCategoryId: 'Docker',
    x: 1120,
    y: 120
  },

  // --- DOMAIN: AI, RAG & AGENTS ---
  {
    id: 'embeddings_vector',
    title: 'Vector Embeddings & Mathematics',
    domain: 'ai_rag',
    phaseNumber: 9,
    description: 'High-dimensional semantic embeddings, tokenization (Tiktoken), Cosine Similarity, Dot Product, and Euclidean Distance.',
    difficulty: 'Intermediate',
    estimatedHours: 8,
    prerequisites: ['py_basics'],
    unlocks: ['pgvector_qdrant'],
    subtopics: ['Embedding Dimensionality (1536d/768d)', 'Cosine Similarity Math', 'Token Length Limits', 'OpenAI & FastEmbed Providers'],
    keyConcepts: ['Semantic Vector Space', 'Curse of Dimensionality', 'Normalized Vector Dot Product'],
    codeSnippet: `import numpy as np

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    a, b = np.array(v1), np.array(v2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))`,
    topicRefId: 'p9_vectors',
    quizCategoryId: 'RAG',
    x: 600,
    y: 440
  },
  {
    id: 'pgvector_qdrant',
    title: 'pgvector & Vector Database Indexes',
    domain: 'ai_rag',
    phaseNumber: 9,
    description: 'PostgreSQL pgvector extension, HNSW (Hierarchical Navigable Small World) index tuning, IVFFlat, and sub-second similarity search.',
    difficulty: 'Advanced',
    estimatedHours: 10,
    prerequisites: ['postgres_indexing', 'embeddings_vector', 'sqlalchemy_async'],
    unlocks: ['rag_chunking'],
    subtopics: ['HNSW vs IVFFlat Indexes', 'm & ef_construction Tuning', 'Cosine Distance Operator (<=>)', 'Hybrid Vector + Relational Filters'],
    keyConcepts: ['Approximate Nearest Neighbors (ANN)', 'Recall vs Latency Tradeoff', 'Graph-Based Navigation'],
    codeSnippet: `CREATE INDEX idx_docs_embedding_hnsw 
ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

SELECT title, 1 - (embedding <=> :query_vec) AS similarity 
FROM documents ORDER BY embedding <=> :query_vec LIMIT 5;`,
    topicRefId: 'p9_vectors',
    quizCategoryId: 'RAG',
    x: 780,
    y: 420
  },
  {
    id: 'rag_chunking',
    title: 'RAG Hierarchical Chunking',
    domain: 'ai_rag',
    phaseNumber: 10,
    description: 'Document ingestion pipelines, semantic chunking, sliding window overlaps, metadata enrichment, and structural parsing.',
    difficulty: 'Advanced',
    estimatedHours: 10,
    prerequisites: ['pgvector_qdrant'],
    unlocks: ['rag_pipeline'],
    subtopics: ['Recursive Character Splitting', 'Chunk Overlap Tuning', 'Metadata Header Extraction', 'Markdown & AST Parsing'],
    keyConcepts: ['Context Fragmentation Loss', 'Signal-to-Noise Ratio in Prompts', 'Chunk Sizing vs Token Budget'],
    codeSnippet: `def chunk_document(text: str, chunk_size: int = 500, overlap: int = 100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks`,
    topicRefId: 'p10_rag',
    quizCategoryId: 'RAG',
    x: 960,
    y: 400
  },
  {
    id: 'rag_pipeline',
    title: 'Production RAG & Cross-Encoder Reranking',
    domain: 'ai_rag',
    phaseNumber: 10,
    description: 'End-to-end Retrieval-Augmented Generation, Cross-Encoder rerankers (FlashRank/Cohere), Hallucination guards, and Citations.',
    difficulty: 'Advanced',
    estimatedHours: 12,
    prerequisites: ['rag_chunking', 'redis_caching'],
    unlocks: ['llm_integration'],
    subtopics: ['Two-Stage Retrieval (Bi-Encoder + Cross-Encoder)', 'Context Compression', 'Strict Hallucination Grounding', 'Citation Link Generation'],
    keyConcepts: ['Reranking Reciprocal Rank Fusion (RRF)', 'Lost-in-the-Middle Phenomenon', 'Faithfulness Evaluation'],
    codeSnippet: `async def query_rag_pipeline(question: str):
    q_vec = await embed_query(question)
    candidates = await vector_db.search_ann(q_vec, limit=25)
    top_reranked = await reranker.rerank(question, candidates, top_k=5)
    return await llm.generate_grounded(question, context=top_reranked)`,
    topicRefId: 'p10_rag',
    quizCategoryId: 'RAG',
    x: 1140,
    y: 380
  },
  {
    id: 'llm_integration',
    title: 'LLMs & Structured JSON Outputs',
    domain: 'ai_rag',
    phaseNumber: 11,
    description: 'OpenAI / Anthropic / Gemini SDKs, prompt engineering, system instructions, function calling schemas, and guaranteed JSON mode.',
    difficulty: 'Intermediate',
    estimatedHours: 10,
    prerequisites: ['rag_pipeline'],
    unlocks: ['agentic_ai'],
    subtopics: ['Structured Output Schemas (Pydantic)', 'Streaming Responses (SSE)', 'Token Economy & Rate Limiting', 'Prompt Injection Defense'],
    keyConcepts: ['Constrained Decoding Grammar', 'Few-Shot Grounding', 'Temperature & Top-P Sampling'],
    codeSnippet: `completion = await client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": text}],
    response_format=EvaluationReport
)
report = completion.choices[0].message.parsed`,
    topicRefId: 'p11_llm',
    quizCategoryId: 'RAG',
    x: 1320,
    y: 340
  },
  {
    id: 'agentic_ai',
    title: 'Autonomous AI Agents & ReAct Tool Calling',
    domain: 'ai_rag',
    phaseNumber: 12,
    description: 'Multi-step autonomous reasoning loops (Thought -> Action -> Observation), tool dispatching, loop guards, and scratchpad memory.',
    difficulty: 'Master',
    estimatedHours: 14,
    prerequisites: ['llm_integration'],
    unlocks: ['mcp_protocol', 'production_deploy'],
    subtopics: ['ReAct Reasoning Loop', 'Dynamic Tool Registry & Validation', 'Infinite Loop Detection & Budgets', 'Agent Memory & Conversation States'],
    keyConcepts: ['Deterministic Tool Orchestration', 'Self-Correction on Tool Errors', 'Autonomous Plan Execution'],
    codeSnippet: `async def agent_loop(task: str, max_steps: int = 10):
    for step in range(max_steps):
        decision = await llm.decide_next_step(task, memory.get_history())
        if decision.is_final:
            return decision.answer
        result = await tool_registry.execute(decision.tool_name, decision.tool_args)
        memory.record(step, decision, result)`,
    topicRefId: 'p12_agents',
    quizCategoryId: 'RAG',
    x: 1500,
    y: 300
  },
  {
    id: 'mcp_protocol',
    title: 'Model Context Protocol (MCP)',
    domain: 'ai_rag',
    phaseNumber: 12,
    description: 'Anthropic Model Context Protocol specification, building custom stdio/SSE MCP tool servers, and connecting external AI tools.',
    difficulty: 'Master',
    estimatedHours: 12,
    prerequisites: ['agentic_ai'],
    unlocks: ['production_deploy'],
    subtopics: ['MCP Server Specification', 'Tools, Resources & Prompts', 'Stdio & SSE Transports', 'Tool Schema Generation'],
    keyConcepts: ['Standardized Context Bus', 'Sandboxed Tool Execution', 'Vendor-Neutral LLM Tooling'],
    codeSnippet: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("LTrack Tools")

@mcp.tool()
async def query_student_progress(user_id: str) -> dict:
    """Fetches real-time learning progress for a student."""
    return await db.get_student_summary(user_id)`,
    topicRefId: 'p12_agents',
    quizCategoryId: 'RAG',
    x: 1680,
    y: 280
  },

  // --- DOMAIN: QUALITY & PRODUCTION ---
  {
    id: 'pytest_suite',
    title: 'Pytest Suite & Async Fixtures',
    domain: 'quality_prod',
    phaseNumber: 13,
    description: 'Unit & integration testing, pytest-asyncio, mocking external APIs (respx, unittest.mock), parameterized tests, and code coverage.',
    difficulty: 'Intermediate',
    estimatedHours: 8,
    prerequisites: ['fastapi_core'],
    unlocks: ['testcontainers'],
    subtopics: ['pytest-asyncio Fixtures', 'API Client Testing (httpx.AsyncClient)', 'Mocking External HTTP (respx)', 'Coverage Analysis (pytest-cov)'],
    keyConcepts: ['AAA Pattern (Arrange, Act, Assert)', 'Database Transaction Rollbacks in Tests', 'Deterministic Test Suites'],
    codeSnippet: `@pytest.mark.asyncio
async def test_create_user(async_client: AsyncClient):
    res = await async_client.post("/api/users", json={"email": "test@test.com"})
    assert res.status_code == 201
    assert res.json()["email"] == "test@test.com"`,
    topicRefId: 'p13_testing',
    quizCategoryId: 'Python',
    x: 940,
    y: 20
  },
  {
    id: 'testcontainers',
    title: 'Testcontainers Integration Testing',
    domain: 'quality_prod',
    phaseNumber: 13,
    description: 'Spinning up real ephemeral PostgreSQL and Redis Docker containers inside pytest tests for 100% database engine fidelity.',
    difficulty: 'Advanced',
    estimatedHours: 8,
    prerequisites: ['pytest_suite', 'docker_core'],
    unlocks: ['github_actions'],
    subtopics: ['testcontainers-python API', 'Ephemeral Postgres Lifecycle', 'Alembic Migrations in Test Runner', 'Clean Database Isolation Per Test'],
    keyConcepts: ['Zero-Mock Database Tests', 'Real SQL Dialect Validation', 'Docker-in-Docker CI Testing'],
    codeSnippet: `from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def postgres_container():
    with PostgresContainer("pgvector/pgvector:pg16") as postgres:
        yield postgres.get_connection_url()`,
    topicRefId: 'p13_testing',
    quizCategoryId: 'Docker',
    x: 1320,
    y: 100
  },
  {
    id: 'github_actions',
    title: 'GitHub Actions CI/CD Pipeline',
    domain: 'quality_prod',
    phaseNumber: 14,
    description: 'Automated Continuous Integration workflows, matrix builds, ruff linting, pytest executions, Docker image publishing, and PR checks.',
    difficulty: 'Intermediate',
    estimatedHours: 8,
    prerequisites: ['testcontainers', 'docker_compose'],
    unlocks: ['production_deploy'],
    subtopics: ['Workflow YAML Triggers', 'Ruff & Mypy Lint Steps', 'Service Containers in GitHub Runners', 'Docker Hub / GHCR Container Registry'],
    keyConcepts: ['Automated Branch Protection', 'Fast Feedback Loops', 'Secrets & Environment Scoping'],
    codeSnippet: `name: CI Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r requirements.txt
      - run: pytest --cov=backend`,
    topicRefId: 'p14_cicd',
    quizCategoryId: 'Git',
    x: 1500,
    y: 120
  },
  {
    id: 'production_deploy',
    title: 'Render Cloud Deployment',
    domain: 'quality_prod',
    phaseNumber: 15,
    description: 'Production hosting with render.yaml infrastructure-as-code, zero-downtime rolling deploys, SSL certs, and environment config.',
    difficulty: 'Advanced',
    estimatedHours: 8,
    prerequisites: ['github_actions', 'agentic_ai', 'mcp_protocol'],
    unlocks: ['observability_telemetry'],
    subtopics: ['render.yaml Blueprint', 'Environment Variables & Secrets', 'Gunicorn/Uvicorn Worker Tuning', 'Zero-Downtime Rollouts'],
    keyConcepts: ['12-Factor App Principles', 'Graceful SIGTERM Handling', 'Production Health Probes'],
    codeSnippet: `services:
  - type: web
    name: ltrack-api
    runtime: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT`,
    topicRefId: 'p15_prod',
    quizCategoryId: 'FastAPI',
    x: 1720,
    y: 160
  },
  {
    id: 'observability_telemetry',
    title: 'Observability & Structured Telemetry',
    domain: 'quality_prod',
    phaseNumber: 15,
    description: 'OpenTelemetry tracing, Prometheus metrics (/metrics), JSON structured logging with correlation IDs, and Sentry error capture.',
    difficulty: 'Master',
    estimatedHours: 10,
    prerequisites: ['production_deploy'],
    unlocks: [],
    subtopics: ['Correlation & Request IDs', 'Prometheus Latency Histograms', 'Structured JSON Logging', 'Sentry Crash Reporting'],
    keyConcepts: ['Distributed Tracing Spans', 'P99 Latency SLA Monitoring', 'Log Aggregation'],
    codeSnippet: `from prometheus_client import Histogram, Counter

REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP Latency', ['endpoint'])
ERROR_COUNTER = Counter('http_requests_failed_total', 'Failed Requests', ['endpoint'])`,
    topicRefId: 'p15_prod',
    quizCategoryId: 'FastAPI',
    x: 1900,
    y: 200
  }
];

export const initialKnowledgeEdges: KnowledgeEdge[] = [
  // Python Core internal edges
  { id: 'e1', source: 'py_basics', target: 'py_oop', relationship: 'prerequisite', label: 'Dunder & Classes' },
  { id: 'e2', source: 'py_basics', target: 'py_generators', relationship: 'prerequisite', label: 'yield & Streams' },
  { id: 'e3', source: 'py_oop', target: 'py_asyncio', relationship: 'prerequisite', label: 'Async Protocols' },
  { id: 'e4', source: 'py_generators', target: 'py_asyncio', relationship: 'prerequisite', label: 'Coroutines' },
  { id: 'e5', source: 'py_oop', target: 'pydantic_v2', relationship: 'prerequisite', label: 'Dataclasses to Models' },

  // Python -> Web & APIs
  { id: 'e6', source: 'py_asyncio', target: 'fastapi_core', relationship: 'prerequisite', label: 'Async ASGI Handlers' },
  { id: 'e7', source: 'pydantic_v2', target: 'fastapi_core', relationship: 'prerequisite', label: 'Request/Response Validation' },
  { id: 'e8', source: 'fastapi_core', target: 'fastapi_di', relationship: 'prerequisite', label: 'IoC Dependency Tree' },
  { id: 'e9', source: 'py_generators', target: 'fastapi_di', relationship: 'prerequisite', label: 'yield Teardown Handlers' },
  { id: 'e10', source: 'fastapi_core', target: 'fastapi_auth', relationship: 'prerequisite', label: 'Security Handlers' },
  { id: 'e11', source: 'fastapi_core', target: 'pytest_suite', relationship: 'prerequisite', label: 'Async Client Testing' },

  // Python & Web -> Database
  { id: 'e12', source: 'py_basics', target: 'postgres_core', relationship: 'prerequisite', label: 'Data Relational Mapping' },
  { id: 'e13', source: 'postgres_core', target: 'postgres_indexing', relationship: 'prerequisite', label: 'B-Tree & Index Tuning' },
  { id: 'e14', source: 'postgres_core', target: 'sqlalchemy_async', relationship: 'prerequisite', label: 'Declarative ORM Mapping' },
  { id: 'e15', source: 'py_asyncio', target: 'sqlalchemy_async', relationship: 'prerequisite', label: 'AsyncPG Engine' },
  { id: 'e16', source: 'fastapi_di', target: 'sqlalchemy_async', relationship: 'composes', label: 'Session Injection' },
  { id: 'e17', source: 'sqlalchemy_async', target: 'alembic_migrations', relationship: 'prerequisite', label: 'Model Diff Migrations' },
  { id: 'e18', source: 'fastapi_auth', target: 'redis_caching', relationship: 'prerequisite', label: 'Session/Token Caching' },

  // Database -> DevOps
  { id: 'e19', source: 'alembic_migrations', target: 'docker_core', relationship: 'prerequisite', label: 'Containerizing Service' },
  { id: 'e20', source: 'docker_core', target: 'docker_compose', relationship: 'prerequisite', label: 'Multi-Service Orchestration' },
  { id: 'e21', source: 'redis_caching', target: 'docker_compose', relationship: 'composes', label: 'Redis Service Container' },

  // Database & Python -> AI, RAG & Agents
  { id: 'e22', source: 'py_basics', target: 'embeddings_vector', relationship: 'prerequisite', label: 'Linear Algebra & Vectors' },
  { id: 'e23', source: 'postgres_indexing', target: 'pgvector_qdrant', relationship: 'prerequisite', label: 'HNSW Index Creation' },
  { id: 'e24', source: 'embeddings_vector', target: 'pgvector_qdrant', relationship: 'prerequisite', label: 'Vector Column Types' },
  { id: 'e25', source: 'sqlalchemy_async', target: 'pgvector_qdrant', relationship: 'composes', label: 'Mapped Vector Attributes' },
  { id: 'e26', source: 'pgvector_qdrant', target: 'rag_chunking', relationship: 'prerequisite', label: 'Ingestion & Storage' },
  { id: 'e27', source: 'rag_chunking', target: 'rag_pipeline', relationship: 'prerequisite', label: 'Retrieval & Reranking' },
  { id: 'e28', source: 'redis_caching', target: 'rag_pipeline', relationship: 'enhances', label: 'Semantic Query Caching' },
  { id: 'e29', source: 'rag_pipeline', target: 'llm_integration', relationship: 'prerequisite', label: 'Grounded Context Synthesis' },
  { id: 'e30', source: 'llm_integration', target: 'agentic_ai', relationship: 'prerequisite', label: 'ReAct Agent Loops' },
  { id: 'e31', source: 'agentic_ai', target: 'mcp_protocol', relationship: 'enhances', label: 'Tool Standards Protocol' },

  // DevOps & Testing -> Quality & Production
  { id: 'e32', source: 'pytest_suite', target: 'testcontainers', relationship: 'prerequisite', label: 'Ephemeral Container Tests' },
  { id: 'e33', source: 'docker_core', target: 'testcontainers', relationship: 'prerequisite', label: 'Docker Daemon Control' },
  { id: 'e34', source: 'testcontainers', target: 'github_actions', relationship: 'prerequisite', label: 'Automated CI Quality Gate' },
  { id: 'e35', source: 'docker_compose', target: 'github_actions', relationship: 'prerequisite', label: 'CI Service Containers' },
  { id: 'e36', source: 'github_actions', target: 'production_deploy', relationship: 'prerequisite', label: 'Continuous Deployment' },
  { id: 'e37', source: 'agentic_ai', target: 'production_deploy', relationship: 'composes', label: 'Serving AI Microservice' },
  { id: 'e38', source: 'mcp_protocol', target: 'production_deploy', relationship: 'composes', label: 'Serving MCP Server' },
  { id: 'e39', source: 'production_deploy', target: 'observability_telemetry', relationship: 'enhances', label: 'Production Monitoring' }
];
