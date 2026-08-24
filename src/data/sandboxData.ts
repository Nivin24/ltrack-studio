import type { CodingChallenge, QuizQuestion, Flashcard } from '../types/sandbox';

export const initialChallenges: CodingChallenge[] = [
  {
    id: 'chal_1',
    title: 'FastAPI Dependency with Yield Teardown',
    phaseNumber: 4,
    category: 'FastAPI',
    difficulty: 'Medium',
    timeLimitMinutes: 20,
    points: 40,
    description: `Implement an asynchronous database session generator dependency function \`get_db_session()\` for FastAPI.
The function must:
1. Yield an active mock session object \`{"status": "connected", "tx_id": 101}\`.
2. Ensure that code after the \`yield\` statement executes upon route completion to close/teardown the session safely.
3. Return the teardown log string in the result.`,
    initialCode: `from typing import AsyncGenerator

async def get_db_session() -> AsyncGenerator[dict, None]:
    # TODO: Initialize mock session
    session = {"status": "connected", "tx_id": 101}
    try:
        # TODO: Yield session to caller
        yield session
    finally:
        # TODO: Clean up session
        session["status"] = "closed"
`,
    solutionTemplate: `async def get_db_session() -> AsyncGenerator[dict, None]:
    session = {"status": "connected", "tx_id": 101}
    try:
        yield session
    finally:
        session["status"] = "closed"`,
    language: 'python',
    testCases: [
      {
        id: 'tc_1',
        name: 'Session Yields Active State',
        input: 'next(generator)',
        expectedOutput: '{"status": "connected", "tx_id": 101}'
      },
      {
        id: 'tc_2',
        name: 'Session Cleaned Up in Finally',
        input: 'close(generator)',
        expectedOutput: '{"status": "closed", "tx_id": 101}'
      }
    ],
    hints: [
      'Use a try...finally block around your yield statement.',
      'The finally block is guaranteed to execute even if an exception occurs during request processing.'
    ]
  },
  {
    id: 'chal_2',
    title: 'Vector Cosine Similarity Calculator',
    phaseNumber: 9,
    category: 'RAG / Vector DB',
    difficulty: 'Medium',
    timeLimitMinutes: 25,
    points: 50,
    description: `Write a pure Python vector dot-product and cosine similarity calculator function \`cosine_similarity(vec_a, vec_b)\` without using heavy external libraries.
Cosine similarity formula:
$$\\text{similarity} = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|}$$
Return the float rounded to 4 decimal places. Return 0.0 if either vector has zero magnitude.`,
    initialCode: `import math
from typing import List

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    # TODO: Calculate dot product and vector magnitudes
    if len(vec_a) != len(vec_b) or not vec_a:
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    
    if mag_a == 0 or mag_b == 0:
        return 0.0
        
    return round(dot_product / (mag_a * mag_b), 4)
`,
    solutionTemplate: `def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    return round(dot_product / (mag_a * mag_b), 4) if (mag_a and mag_b) else 0.0`,
    language: 'python',
    testCases: [
      {
        id: 'tc_3',
        name: 'Identical Direction Vectors',
        input: '[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]',
        expectedOutput: '1.0'
      },
      {
        id: 'tc_4',
        name: 'Orthogonal Vectors (90 deg)',
        input: '[1.0, 0.0], [0.0, 1.0]',
        expectedOutput: '0.0'
      },
      {
        id: 'tc_5',
        name: 'Opposite Vectors (180 deg)',
        input: '[1.0, 0.0], [-1.0, 0.0]',
        expectedOutput: '-1.0'
      }
    ],
    hints: [
      'Compute dot product with sum(a * b for a, b in zip(vec_a, vec_b)).',
      'Compute magnitude with math.sqrt(sum(x ** 2 for x in vec)).'
    ]
  },
  {
    id: 'chal_3',
    title: 'Model Context Protocol (MCP) Tool Validator',
    phaseNumber: 13,
    category: 'Agentic AI / MCP',
    difficulty: 'Hard',
    timeLimitMinutes: 30,
    points: 75,
    description: `Build a schema validator for dynamic AI tools complying with the Model Context Protocol specification.
The function \`validate_mcp_tool(tool_dict)\` must return \`{"valid": bool, "errors": list[str]}\`.
Validation Rules:
1. Tool \`name\` must be a non-empty snake_case string (regex: \`^[a-z0-9_]+$\`).
2. Tool \`description\` must be at least 10 characters long.
3. \`inputSchema\` must be a dictionary with \`"type": "object"\` and contain a \`"properties"\` key.`,
    initialCode: `import re
from typing import Dict, Any

def validate_mcp_tool(tool: Dict[str, Any]) -> Dict[str, Any]:
    errors = []
    
    # 1. Validate tool name
    name = tool.get("name")
    if not isinstance(name, str) or not re.match(r"^[a-z0-9_]+$", name):
        errors.append("Invalid or missing snake_case tool name")
        
    # 2. Validate description
    desc = tool.get("description")
    if not isinstance(desc, str) or len(desc) < 10:
        errors.append("Description must be at least 10 characters")
        
    # 3. Validate inputSchema
    schema = tool.get("inputSchema")
    if not isinstance(schema, dict) or schema.get("type") != "object" or "properties" not in schema:
        errors.append("inputSchema must be an object with properties dict")
        
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }
`,
    solutionTemplate: `def validate_mcp_tool(tool: Dict[str, Any]) -> Dict[str, Any]:
    errors = []
    if not re.match(r'^[a-z0-9_]+$', str(tool.get('name', ''))):
        errors.append('Invalid name')
    if len(str(tool.get('description', ''))) < 10:
        errors.append('Short description')
    if not isinstance(tool.get('inputSchema'), dict) or tool['inputSchema'].get('type') != 'object':
        errors.append('Invalid schema')
    return {'valid': len(errors) == 0, 'errors': errors}`,
    language: 'python',
    testCases: [
      {
        id: 'tc_6',
        name: 'Valid MCP Tool Declaration',
        input: '{"name": "fetch_user", "description": "Fetches user records by ID", "inputSchema": {"type": "object", "properties": {"user_id": {"type": "string"}}}}',
        expectedOutput: '{"valid": True, "errors": []}'
      },
      {
        id: 'tc_7',
        name: 'Invalid Capital Name',
        input: '{"name": "FetchUser", "description": "Too short", "inputSchema": {}}',
        expectedOutput: '{"valid": False, "errors": ["Invalid or missing snake_case tool name", "Description must be at least 10 characters", "inputSchema must be an object with properties dict"]}'
      }
    ],
    hints: [
      'Check for valid snake_case regex: ^[a-z0-9_]+$',
      'Ensure inputSchema has type=="object" and contains "properties".'
    ]
  }
];

export const initialQuizzes: QuizQuestion[] = [
  {
    id: 'quiz_1',
    phaseNumber: 4,
    category: 'FastAPI',
    subtopicName: 'Depends() with Yield',
    question: 'Why should database sessions in FastAPI dependency injection utilize `yield` instead of a standard `return` statement?',
    codeSnippet: `async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`,
    options: [
      { id: 'opt_a', text: 'Because `return` executes synchronously and blocks the main thread.' },
      { id: 'opt_b', text: 'Because `yield` pauses execution during route handling and resumes in `finally` after the response is sent, guaranteeing connection teardown.' },
      { id: 'opt_c', text: 'Because `return` is not supported by Python Pydantic V2 models.' },
      { id: 'opt_d', text: 'Because `yield` converts the database connection into a WebSocket stream.' }
    ],
    correctOptionId: 'opt_b',
    explanation: 'FastAPI dependencies with `yield` act as context managers. Execution pauses when yielding the database session to your route, and automatically resumes in the `finally` block once the HTTP response is sent, ensuring zero connection leaks.'
  },
  {
    id: 'quiz_2',
    phaseNumber: 5,
    category: 'PostgreSQL',
    subtopicName: 'ACID Transactions',
    question: 'What is the primary danger of running `session.commit()` inside an unhandled loop when using SQLAlchemy AsyncSession?',
    codeSnippet: `for item in batch:
    session.add(item)
    await session.commit() # DANGER!`,
    options: [
      { id: 'opt_a', text: 'It creates nested database tables automatically.' },
      { id: 'opt_b', text: 'Partial failure mid-loop leaves the database in an inconsistent state instead of an atomic transaction rollback.' },
      { id: 'opt_c', text: 'It downgrades PostgreSQL to SQLite in-memory mode.' },
      { id: 'opt_d', text: 'It deletes the connection pool configuration.' }
    ],
    correctOptionId: 'opt_b',
    explanation: 'Transactions must adhere to ACID properties. Committing inside an unhandled loop commits partial changes, leaving orphaned records if a later iteration fails. Always use `async with session.begin():` to ensure atomic all-or-nothing transactions.'
  },
  {
    id: 'quiz_3',
    phaseNumber: 9,
    category: 'RAG & Vector DBs',
    subtopicName: 'Document Chunking',
    question: 'What is the primary purpose of "Chunk Overlap" when splitting text for RAG vector embeddings?',
    options: [
      { id: 'opt_a', text: 'To compress vector dimensions by 50%.' },
      { id: 'opt_b', text: 'To encrypt sensitive embedding vectors in memory.' },
      { id: 'opt_c', text: 'To preserve contextual continuity across chunk boundaries so sentences and phrases are not severed.' },
      { id: 'opt_d', text: 'To speed up token generation in OpenAI API calls.' }
    ],
    correctOptionId: 'opt_c',
    explanation: 'Chunk overlap (e.g. 50-100 tokens) ensures that sentences spanning across chunk boundaries retain their semantic meaning, preventing context loss during similarity search.'
  },
  {
    id: 'quiz_4',
    phaseNumber: 1,
    category: 'Python',
    subtopicName: 'AsyncIO Event Loop',
    question: 'What happens when you call a standard blocking function (like `time.sleep(5)`) inside an `async def` FastAPI route?',
    codeSnippet: `import time

@app.get("/sync-block")
async def block_route():
    time.sleep(5) # What happens here?
    return {"status": "done"}`,
    options: [
      { id: 'opt_a', text: 'FastAPI automatically spawns a background thread to handle it.' },
      { id: 'opt_b', text: 'It halts the entire single-threaded AsyncIO event loop, blocking all concurrent requests to the server for 5 seconds.' },
      { id: 'opt_c', text: 'Python converts it to non-blocking asyncio.sleep(5) automatically.' },
      { id: 'opt_d', text: 'The request times out with a 404 Not Found error.' }
    ],
    correctOptionId: 'opt_b',
    explanation: 'AsyncIO runs on a single event loop. Synchronous blocking calls like `time.sleep` or blocking I/O freeze the entire thread, preventing any other concurrent async tasks from executing. Always use `await asyncio.sleep()` or offload to `run_in_executor()`.'
  },
  {
    id: 'quiz_5',
    phaseNumber: 6,
    category: 'Docker',
    subtopicName: 'Multi-Stage Builds',
    question: 'What is the main benefit of utilizing multi-stage Docker builds for Python FastAPI applications?',
    codeSnippet: `FROM python:3.12-slim as builder
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-alpine
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12`,
    options: [
      { id: 'opt_a', text: 'It creates multiple containers simultaneously on startup.' },
      { id: 'opt_b', text: 'It keeps the final production container image lightweight by excluding compilers and build dependencies.' },
      { id: 'opt_c', text: 'It prevents the container from connecting to the host network.' },
      { id: 'opt_d', text: 'It automatically restarts failed containers in production.' }
    ],
    correctOptionId: 'opt_b',
    explanation: 'Multi-stage builds separate the compile/build environment from the runtime environment. Only the compiled wheels and binaries are copied to the final container, shrinking image size from ~800MB to ~120MB and reducing security attack surfaces.'
  },
  {
    id: 'quiz_6',
    phaseNumber: 3,
    category: 'Git',
    subtopicName: 'Conventional Commits',
    question: 'According to the Conventional Commits specification, which prefix should be used when introducing a non-functional code refactor that neither fixes a bug nor adds a feature?',
    options: [
      { id: 'opt_a', text: 'fix:' },
      { id: 'opt_b', text: 'chore:' },
      { id: 'opt_c', text: 'refactor:' },
      { id: 'opt_d', text: 'style:' }
    ],
    correctOptionId: 'opt_c',
    explanation: 'The `refactor:` type is specifically designated for code changes that neither fix a bug nor add a feature, but restructure code for cleanliness, readability, or performance.'
  }
];

export const initialFlashcards: Flashcard[] = [
  {
    id: 'fc_1',
    category: 'FastAPI',
    subtopicName: 'Depends() with Yield',
    phaseNumber: 4,
    title: 'FastAPI Depends() & Yield Teardown',
    prompt: 'How does FastAPI manage resource cleanup and teardown when using `yield` in a dependency?',
    codeSnippet: `async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()`,
    answer: 'The code before `yield` runs prior to route execution. `yield` provides the dependency instance to the route. The code after `yield` (or in `finally`) runs strictly after the response has been sent.',
    explanation: 'This implements the Context Manager pattern natively in FastAPI, guaranteeing that database connections, HTTP clients, and file handles are closed even if an unhandled exception occurs inside the route handler.',
    keyTakeaway: 'Always wrap `yield` in a `try...finally` block to ensure zero connection leaks in high-concurrency environments.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_2',
    category: 'Python',
    subtopicName: 'AsyncIO & Event Loop',
    phaseNumber: 1,
    title: 'Blocking I/O vs Async I/O',
    prompt: 'Why should you never execute synchronous blocking libraries (like `requests` or `time.sleep`) inside async coroutines?',
    codeSnippet: `# BAD:
import time
async def fetch():
    time.sleep(2) # Freezes event loop

# GOOD:
import asyncio
async def fetch():
    await asyncio.sleep(2) # Yields control`,
    answer: 'Python async operates on a single-threaded cooperative event loop. Synchronous blocking calls block the entire OS thread, freezing all concurrent requests for all users.',
    explanation: 'Async functions cooperate by yielding control back to the event loop during I/O wait. When a blocking call is made, it cannot yield, starving all other coroutines in the queue.',
    keyTakeaway: 'Use `httpx.AsyncClient` instead of `requests` and `asyncio.sleep` instead of `time.sleep`.',
    difficulty: 'Beginner'
  },
  {
    id: 'fc_3',
    category: 'PostgreSQL',
    subtopicName: 'ACID Transactions',
    phaseNumber: 5,
    title: 'Atomic Transactions & Rollbacks',
    prompt: 'What guarantees does `session.begin()` provide during a multi-table database mutation?',
    codeSnippet: `async with session.begin():
    session.add(User(...))
    session.add(AuditLog(...))
    # If anything raises here, entire batch rolls back automatically`,
    answer: 'It provides Atomicity and Isolation. Either all database writes commit successfully, or all changes roll back to the state before the block started.',
    explanation: 'Without atomic transactions, partial failures (e.g. network timeout after creating user but before audit log) leave corrupt, orphaned data across tables.',
    keyTakeaway: 'Never manually call `.commit()` on every loop iteration. Use `async with session.begin():` for all-or-nothing consistency.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_4',
    category: 'Docker',
    subtopicName: 'Multi-Stage Builds',
    phaseNumber: 6,
    title: 'Multi-Stage Docker Builds',
    prompt: 'How do multi-stage Docker builds drastically reduce image size and improve security?',
    codeSnippet: `# Stage 1: Build
FROM python:3.12 as builder
RUN pip install --user -r requirements.txt

# Stage 2: Minimal Runtime
FROM python:3.12-slim
COPY --from=builder /root/.local /root/.local`,
    answer: 'Heavy compilers (gcc, build-essentials) and cache files remain in the disposable builder stage, while only the runtime binaries and installed packages are copied to the production image.',
    explanation: 'This cuts container image size from ~900MB down to ~120MB, speeds up CI/CD deployment rollouts, and removes unnecessary build tools that attackers could exploit.',
    keyTakeaway: 'Multi-stage builds separate the artifact creation environment from the lean runtime container.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_5',
    category: 'RAG & Vector DBs',
    subtopicName: 'Cosine Similarity',
    phaseNumber: 9,
    title: 'Vector Dot Product & Cosine Similarity',
    prompt: 'What does a Cosine Similarity score of 1.0, 0.0, and -1.0 indicate about two text embedding vectors?',
    codeSnippet: `similarity = (A . B) / (||A|| * ||B||)`,
    answer: '1.0 indicates identical directional semantic meaning; 0.0 indicates orthogonal/unrelated concepts; -1.0 indicates diametrically opposite semantics.',
    explanation: 'Cosine similarity measures the angle between two high-dimensional vectors rather than their magnitude, making it invariant to document length.',
    keyTakeaway: 'Cosine similarity scales between -1 and 1 and is the industry standard metric for semantic similarity search in RAG.',
    difficulty: 'Advanced'
  },
  {
    id: 'fc_6',
    category: 'Git',
    subtopicName: 'Interactive Rebase',
    phaseNumber: 3,
    title: 'Git Rebase vs Merge',
    prompt: 'When should you choose `git rebase` over `git merge` when integrating changes from main?',
    codeSnippet: `# Linear history:
git checkout feature/auth
git rebase main

# Branch graph join:
git merge main`,
    answer: 'Rebasing replays your feature commits on top of the latest main commit, creating a clean linear commit history without polluting the log with merge commits.',
    explanation: 'Rebasing is preferred for feature branches before submitting a Pull Request. However, never rebase public shared branches like `main`.',
    keyTakeaway: 'Rebase local feature branches for linear commit storytelling; merge for integrating finalized PRs.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_7',
    category: 'Python',
    subtopicName: 'Generators & Memory',
    phaseNumber: 1,
    title: 'Generators & Lazy Evaluation',
    prompt: 'What is the memory advantage of using `(x*2 for x in large_dataset)` vs `[x*2 for x in large_dataset]`?',
    codeSnippet: `# Generator Expression:
gen = (x * 2 for x in range(10_000_000)) # ~120 bytes RAM

# List Comprehension:
lst = [x * 2 for x in range(10_000_000)] # ~80 MB RAM`,
    answer: 'Generators yield items one by one on-demand via the iterator protocol (`__next__`), using $O(1)$ constant memory regardless of data stream size.',
    explanation: 'Lists allocate all elements in heap memory upfront. Generators compute values lazily upon iteration, preventing Out-Of-Memory (OOM) crashes in streaming pipelines.',
    keyTakeaway: 'Use generator expressions or `yield` when streaming large files, database result cursors, or infinite series.',
    difficulty: 'Beginner'
  },
  {
    id: 'fc_8',
    category: 'FastAPI',
    subtopicName: 'Pydantic V2 Validation',
    phaseNumber: 4,
    title: 'Pydantic V2 @field_validator vs @model_validator',
    prompt: 'When should you use `@field_validator` vs `@model_validator(mode="after")` in Pydantic V2?',
    codeSnippet: `class UserSignup(BaseModel):
    password: str
    confirm_password: str
    
    @model_validator(mode='after')
    def verify_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError('Passwords must match')
        return self`,
    answer: 'Use `@field_validator` for single-attribute validations (e.g. email regex). Use `@model_validator` for cross-field validations that compare multiple model attributes together.',
    explanation: 'Single-field validators only receive a single value. Model validators execute across the entire instantiated object context.',
    keyTakeaway: 'Always use `@model_validator(mode="after")` when comparing interdependent fields like password confirmation or date ranges.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_9',
    category: 'PostgreSQL',
    subtopicName: 'B-Tree & GIN Indexes',
    phaseNumber: 5,
    title: 'B-Tree vs GIN Indexing',
    prompt: 'When should you choose a Generalized Inverted Index (GIN) over a standard B-Tree index in PostgreSQL?',
    codeSnippet: `CREATE INDEX idx_logs_payload ON audit_logs USING gin (payload_jsonb jsonb_path_ops);
CREATE INDEX idx_users_email ON users USING btree (email);`,
    answer: 'Use B-Tree for scalar equality and range queries (`=`, `<`, `>`). Use GIN for composite data types containing multiple elements like `JSONB`, full-text search vectors, and arrays (`@>`, `?&`).',
    explanation: 'A GIN index maps individual keys/elements to rows, enabling high-speed sub-millisecond filtering inside nested JSONB document attributes.',
    keyTakeaway: 'Always apply GIN with `jsonb_path_ops` for high-throughput JSONB containment filters.',
    difficulty: 'Advanced'
  },
  {
    id: 'fc_10',
    category: 'Docker',
    subtopicName: 'Bridge & Overlay Networks',
    phaseNumber: 6,
    title: 'Docker Container Networking & DNS',
    prompt: 'How do containers on a custom user-defined Docker network discover and communicate with each other?',
    codeSnippet: `# In docker-compose.yml:
services:
  api:
    image: my-fastapi:latest
  db:
    image: postgres:16-alpine

# API connects via:
DATABASE_URL="postgresql://db:5432/production"`,
    answer: 'Docker runs an internal embedded DNS server on `127.0.0.11` that automatically resolves service and container names to their internal virtual IP addresses.',
    explanation: 'On the default bridge network, containers cannot resolve each other by name without legacy `--link`. Custom user-defined bridge networks provide automatic internal DNS routing.',
    keyTakeaway: 'Never hardcode container IPs. Use service names on user-defined networks for dynamic DNS resolution.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_11',
    category: 'RAG & Vector DBs',
    subtopicName: 'Hybrid Search & BM25',
    phaseNumber: 9,
    title: 'Dense Vector vs Sparse BM25 Search',
    prompt: 'Why does state-of-the-art RAG combine Dense Vector Search with Sparse BM25 (Hybrid Search)?',
    codeSnippet: `Hybrid Score = (0.7 * Dense_Cosine_Score) + (0.3 * Sparse_BM25_Score)`,
    answer: 'Dense vector search captures semantic concepts and synonyms, while Sparse BM25 excels at exact keyword matches, serial numbers, product SKUs, and rare terminology.',
    explanation: 'Vector embeddings alone frequently struggle with exact alphanumeric codes or rare acronyms. Hybrid search with Reciprocal Rank Fusion (RRF) delivers the best retrieval accuracy.',
    keyTakeaway: 'Use Hybrid Search (Dense + BM25) to prevent hallucinations when users search for exact technical terms or model numbers.',
    difficulty: 'Advanced'
  },
  {
    id: 'fc_12',
    category: 'Agentic AI / MCP',
    subtopicName: 'Model Context Protocol',
    phaseNumber: 13,
    title: 'Model Context Protocol (MCP) Tool Calling',
    prompt: 'What are the three core architectural primitives exposed by an MCP Server to AI Clients?',
    codeSnippet: `{
  "tools": [...],     # Callable executable functions
  "resources": [...], # Read-only contextual data URIs
  "prompts": [...]    # Reusable structured prompt templates
}`,
    answer: '1. Tools (executable actions with side effects), 2. Resources (read-only document/data attachments), 3. Prompts (standardized prompt templates for human-in-the-loop workflows).',
    explanation: 'MCP standardizes how LLM agents interact with external data and execution environments, replacing proprietary ad-hoc plugins with an open protocol.',
    keyTakeaway: 'Tools execute commands, Resources supply raw data context, and Prompts guide model reasoning.',
    difficulty: 'Advanced'
  },
  {
    id: 'fc_13',
    category: 'Python',
    subtopicName: 'GIL & Multiprocessing',
    phaseNumber: 1,
    title: 'Global Interpreter Lock (GIL)',
    prompt: 'Why doesn’t `threading.Thread` speed up CPU-bound operations in standard CPython, and what should you use instead?',
    codeSnippet: `# CPU-Bound: Use ProcessPoolExecutor
from concurrent.futures import ProcessPoolExecutor

with ProcessPoolExecutor() as executor:
    results = list(executor.map(cpu_heavy_task, data))`,
    answer: 'CPython’s GIL allows only one OS thread to execute Python bytecode at any given moment. For CPU-bound tasks, use `multiprocessing` or `ProcessPoolExecutor` to spawn separate OS processes with independent GILs.',
    explanation: 'Threads in Python are effective for I/O-bound concurrency (network, disk) where the GIL is released during wait, but cannot achieve true parallelism for compute-heavy workloads.',
    keyTakeaway: 'Use `asyncio`/threading for I/O-bound tasks; use `multiprocessing` for CPU-intensive calculations.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_14',
    category: 'FastAPI',
    subtopicName: 'BackgroundTasks',
    phaseNumber: 4,
    title: 'FastAPI BackgroundTasks vs Celery',
    prompt: 'When is FastAPI’s built-in `BackgroundTasks` suitable, and when should you upgrade to a distributed queue like Celery or ARQ?',
    codeSnippet: `@app.post("/order")
async def create_order(bg_tasks: BackgroundTasks):
    # In-memory execution after response:
    bg_tasks.add_task(send_confirmation_email, "user@example.com")
    return {"status": "order_received"}`,
    answer: '`BackgroundTasks` runs in-memory on the same worker process after the HTTP response is sent. It is ideal for lightweight jobs (emails, audit logs), but not for long-running heavy tasks or mission-critical jobs that must survive server restarts.',
    explanation: 'If the server crashes mid-task, in-memory `BackgroundTasks` are lost forever. Celery/ARQ provide Redis/RabbitMQ persistence, retries, rate limiting, and distributed worker pooling.',
    keyTakeaway: 'Use `BackgroundTasks` for quick transient jobs; use Celery/ARQ with Redis for durable, long-running pipelines.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_15',
    category: 'PostgreSQL',
    subtopicName: 'Connection Pooling & PgBouncer',
    phaseNumber: 5,
    title: 'PostgreSQL Connection Pooling & PgBouncer',
    prompt: 'Why does PostgreSQL degrade if thousands of concurrent client connections open directly to the database?',
    codeSnippet: `# SQLAlchemy Async Engine with Pool:
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_recycle=300
)`,
    answer: 'PostgreSQL forks a dedicated OS backend process (consuming ~5-10MB RAM each) for every direct client connection. Too many open connections exhaust memory and cause severe CPU context-switching thrashing.',
    explanation: 'Connection poolers like PgBouncer or SQLAlchemy engine pools maintain a small pool of persistent connections (e.g. 20-50), multiplexing thousands of incoming client requests over them efficiently.',
    keyTakeaway: 'Always configure connection pooling in async microservices to prevent database connection exhaustion.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_16',
    category: 'Docker',
    subtopicName: 'Volumes vs Bind Mounts',
    phaseNumber: 6,
    title: 'Named Volumes vs Bind Mounts',
    prompt: 'What is the primary difference between a Docker Named Volume and a Host Bind Mount?',
    codeSnippet: `# Named Volume (Managed by Docker engine):
volumes:
  - postgres_data:/var/lib/postgresql/data

# Bind Mount (Direct host directory mapping):
volumes:
  - ./src:/app/src`,
    answer: 'Named Volumes are managed and stored within Docker’s internal filesystem storage (`/var/lib/docker/volumes`), offering optimized I/O performance. Bind mounts map a specific host directory directly for hot-reloading in development.',
    explanation: 'Named Volumes are safe for database persistence across container lifecycles and OS platforms. Bind mounts are preferred for live local code development.',
    keyTakeaway: 'Use Named Volumes for database storage and production persistence; use Bind Mounts for local development hot-reload.',
    difficulty: 'Beginner'
  },
  {
    id: 'fc_17',
    category: 'Git',
    subtopicName: 'Squash & Merge',
    phaseNumber: 3,
    title: 'Squash and Merge PR Strategy',
    prompt: 'What is the primary benefit of selecting "Squash and Merge" when merging feature branches to main?',
    codeSnippet: `# On main:
"feat(auth): add OAuth2 JWT login flow with refresh tokens (#42)"
# (Condenses 15 work-in-progress micro-commits into 1 clean commit)`,
    answer: 'It condenses all intermediate WIP commits ("fix typo", "wip test", "lint") into a single, cohesive, atomic commit on the `main` branch with a clean conventional message.',
    explanation: 'Squashing keeps the production `main` branch history easy to audit, bisect (`git bisect`), and rollback without digging through noisy experimental commits.',
    keyTakeaway: 'Use Squash & Merge on pull requests to maintain an immaculate, release-ready git commit log.',
    difficulty: 'Beginner'
  },
  {
    id: 'fc_18',
    category: 'Python',
    subtopicName: 'Context Managers',
    phaseNumber: 1,
    title: 'Python Context Managers (`__enter__` & `__exit__`)',
    prompt: 'What method in a custom Context Manager determines whether an exception is suppressed or propagated?',
    codeSnippet: `class SuppressTimeout:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is TimeoutError:
            return True # Suppresses exception!
        return False # Propagates exception`,
    answer: 'The `__exit__(self, exc_type, exc_val, exc_tb)` method. Returning `True` suppresses the raised exception, while returning `False` (or `None`) allows the exception to propagate upward.',
    explanation: 'Context managers guarantee resource cleanup. The 4 arguments in `__exit__` provide full diagnostic introspection into any raised exception.',
    keyTakeaway: 'Return `True` in `__exit__` only when intentionally catching and swallowing a specific expected exception.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_19',
    category: 'FastAPI',
    subtopicName: 'OAuth2 & JWT',
    phaseNumber: 4,
    title: 'Stateless JWT Authentication Flow',
    prompt: 'Why are JSON Web Tokens (JWT) signed with a private secret key rather than encrypted?',
    codeSnippet: `# Header.Payload.Signature
encoded_jwt = jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm="HS256")`,
    answer: 'JWTs are encoded and digitally signed, meaning the payload is readable by any client, but cannot be tampered with or modified without invalidating the cryptographic signature.',
    explanation: 'Because the server verifies the cryptographic signature with `SECRET_KEY`, it does not need to query the database on every single authenticated request, enabling horizontal scalability.',
    keyTakeaway: 'Never store sensitive secrets (like raw passwords or API keys) inside JWT payloads because payloads are base64 decoded.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_20',
    category: 'PostgreSQL',
    subtopicName: 'EXPLAIN ANALYZE',
    phaseNumber: 5,
    title: 'Query Plan Optimization with EXPLAIN ANALYZE',
    prompt: 'What is the crucial difference between running `EXPLAIN` vs `EXPLAIN ANALYZE` in PostgreSQL?',
    codeSnippet: `EXPLAIN ANALYZE 
SELECT * FROM orders WHERE user_id = 42 AND status = 'shipped';`,
    answer: '`EXPLAIN` outputs estimated cost and row counts generated by the query planner without running the query. `EXPLAIN ANALYZE` actually executes the query and returns real execution time in milliseconds and actual buffer hits.',
    explanation: '`EXPLAIN ANALYZE` is the gold-standard profiling tool to detect slow Sequential Scans (`Seq Scan`) that require indexing.',
    keyTakeaway: 'Be careful running `EXPLAIN ANALYZE` on `DELETE` or `UPDATE` statements in production because it will execute the mutation!',
    difficulty: 'Advanced'
  },
  {
    id: 'fc_21',
    category: 'RAG & Vector DBs',
    subtopicName: 'Reranking Models',
    phaseNumber: 9,
    title: 'Two-Stage Retrieval & Cross-Encoder Rerankers',
    prompt: 'Why do production RAG systems use a Cross-Encoder Reranker after the initial Bi-Encoder vector retrieval stage?',
    codeSnippet: `# Stage 1: Fast Vector Search (Top 50 Candidates)
# Stage 2: Deep Cross-Encoder Rerank (Top 5 High-Precision Results)`,
    answer: 'Bi-encoders embed query and document independently (fast, but loses interaction). Cross-encoders process the query and document together through full transformer self-attention, providing significantly higher semantic relevance ranking.',
    explanation: 'Running a cross-encoder over millions of docs is too slow. The two-stage architecture gets the best of both worlds: fast bi-encoder candidate filtering followed by high-accuracy cross-encoder reranking.',
    keyTakeaway: 'Add a reranker (e.g. Cohere Rerank or BGE-Reranker) to boost RAG answer accuracy by 25-40%.',
    difficulty: 'Advanced'
  },
  {
    id: 'fc_22',
    category: 'Docker',
    subtopicName: 'Docker Compose Healthchecks',
    phaseNumber: 6,
    title: 'Container Healthchecks & Service Dependencies',
    prompt: 'Why is `depends_on: [db]` alone insufficient when starting a FastAPI app alongside a PostgreSQL container?',
    codeSnippet: `services:
  web:
    depends_on:
      db:
        condition: service_healthy # Waits for DB to accept TCP queries!
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5`,
    answer: '`depends_on` only waits for the database container to launch, not for PostgreSQL to complete internal socket initialization and start accepting queries. The API crashes if it attempts connecting before initialization finishes.',
    explanation: 'Adding `pg_isready` healthcheck with `condition: service_healthy` ensures dependent containers only start once the database is fully online and ready.',
    keyTakeaway: 'Always pair `depends_on` with `condition: service_healthy` for robust container orchestration.',
    difficulty: 'Intermediate'
  },
  {
    id: 'fc_23',
    category: 'Git',
    subtopicName: 'Git Bisect',
    phaseNumber: 3,
    title: 'Automated Regression Hunting with `git bisect`',
    prompt: 'How does `git bisect` leverage binary search to locate the exact commit that introduced a bug?',
    codeSnippet: `git bisect start
git bisect bad HEAD
git bisect good v1.0.0
git bisect run pytest tests/test_payment.py`,
    answer: 'It performs binary search across git commit history, checking out the midpoint commit automatically until it pinpoints the single commit that broke the test suite.',
    explanation: 'Instead of manually testing hundreds of commits linearly ($O(N)$), `git bisect` isolates the culprit in $\\log_2(N)$ steps (e.g. searching 1,000 commits takes only ~10 steps).',
    keyTakeaway: 'Use `git bisect run <test_command>` to locate hard-to-find regressions automatically.',
    difficulty: 'Advanced'
  },
  {
    id: 'fc_24',
    category: 'Python',
    subtopicName: 'Descriptors & Metaclasses',
    phaseNumber: 1,
    title: 'Python Descriptors Protocol (`__get__` & `__set__`)',
    prompt: 'What core Python features (like `@property`, `@classmethod`, and ORM fields) are implemented using the Descriptor Protocol?',
    codeSnippet: `class ValidatedString:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, instance, owner):
        return instance.__dict__.get(self.name)
    def __set__(self, instance, value):
        if not isinstance(value, str):
            raise TypeError(f"{self.name} must be a string")
        instance.__dict__[self.name] = value`,
    answer: 'Descriptors are objects that customize attribute access, assignment, and deletion. They power Python properties, methods, static methods, and SQLAlchemy/Django ORM model fields under the hood.',
    explanation: 'Whenever you define an attribute on a class that implements `__get__` or `__set__`, Python delegates attribute lookups on instances to that descriptor object.',
    keyTakeaway: 'Descriptors enable reusable attribute-level validation and caching patterns across classes.',
    difficulty: 'Advanced'
  }
];
