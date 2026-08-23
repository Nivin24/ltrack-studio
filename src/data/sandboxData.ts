import type { CodingChallenge, QuizQuestion } from '../types/sandbox';

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
        name: 'Embeddings Semantic Match',
        input: '[0.5, 0.8, 0.2], [0.4, 0.9, 0.1]',
        expectedOutput: '0.9881'
      }
    ],
    hints: [
      'Dot product is the sum of element-wise multiplications: sum(a * b for a, b in zip(vec_a, vec_b)).',
      'Magnitude is math.sqrt(sum(x**2 for x in vec)).'
    ]
  },
  {
    id: 'chal_3',
    title: 'Model Context Protocol (MCP) Tool Validator',
    phaseNumber: 10,
    category: 'MCP',
    difficulty: 'Hard',
    timeLimitMinutes: 30,
    points: 60,
    description: `Build an MCP Tool Schema Validator function \`validate_mcp_tool(tool_dict)\` that verifies whether an AI agent tool dictionary conforms to the standard MCP specification.
A valid MCP tool must have:
- \`name\` (string, non-empty, snake_case alphanumeric).
- \`description\` (string, >= 10 chars).
- \`inputSchema\` (dict containing \`type == "object"\` and a \`properties\` dict).
Return \`{"valid": True, "errors": []}\` if valid, otherwise \`{"valid": False, "errors": ["..."]}\`.`,
    initialCode: `from typing import Dict, Any, List
import re

def validate_mcp_tool(tool: Dict[str, Any]) -> Dict[str, Any]:
    errors: List[str] = []
    
    # 1. Validate name
    name = tool.get("name")
    if not isinstance(name, str) or not re.match(r'^[a-z0-9_]+$', name):
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
    question: 'Why should database sessions in FastAPI dependency injection utilize `yield` instead of a standard `return` statement?',
    codeSnippet: `async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`,
    options: [
      { id: 'opt_a', text: 'Because `return` executes synchronously and slows down the thread pool.' },
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
    question: 'What is the primary danger of running `session.commit()` inside an unhandled loop when using SQLAlchemy AsyncSession?',
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
    question: 'What is the function of "Chunk Overlap" when splitting documents for RAG vector embeddings?',
    options: [
      { id: 'opt_a', text: 'To compress vector sizes by 50%.' },
      { id: 'opt_b', text: 'To encrypt sensitive embedding vectors in memory.' },
      { id: 'opt_c', text: 'To preserve contextual continuity across chunk boundaries so phrases are not awkwardly severed.' },
      { id: 'opt_d', text: 'To speed up token generation in OpenAI API calls.' }
    ],
    correctOptionId: 'opt_c',
    explanation: 'Chunk overlap (e.g. 50-100 tokens) ensures that sentences spanning across chunk boundaries retain their semantic meaning, preventing context loss during similarity search.'
  }
];
