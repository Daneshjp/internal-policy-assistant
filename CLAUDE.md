# CLAUDE.md - Internal Policy Assistant Project Rules

> Project-specific rules for Claude Code. This file is read automatically.

---

## Project Overview

**Project Name:** Internal Policy Assistant
**Description:** AI-powered assistant that helps employees find answers from internal company policies, HR documents, and compliance guidelines.
**Tech Stack:**
- Backend: FastAPI + Python 3.11+
- Frontend: React + Vite + TypeScript
- Database: PostgreSQL + SQLAlchemy
- Auth: Email/Password with JWT
- UI: Chakra UI
- AI: OpenAI API with RAG pattern

---

## Project Structure

```
internal-policy-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── conversation.py
│   │   │   ├── category.py
│   │   │   └── analytics.py
│   │   ├── schemas/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── conversations.py
│   │   │   ├── categories.py
│   │   │   ├── analytics.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── document_processor.py
│   │   │   └── email_service.py
│   │   └── auth/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── types/
│   └── package.json
├── .claude/
│   └── commands/
├── skills/
├── agents/
└── PRPs/
```

---

## Code Standards

### Python (Backend)
```python
# ALWAYS use type hints
def get_document(db: Session, document_id: int) -> Document:
    pass

# ALWAYS add docstrings for public functions
def create_document(db: Session, data: DocumentCreate, user_id: int) -> Document:
    """
    Create a new document and trigger processing.

    Args:
        db: Database session
        data: Document creation data
        user_id: ID of the uploading user

    Returns:
        Created Document object
    """
    pass
```

### TypeScript (Frontend)
```typescript
// ALWAYS define interfaces for props and data
interface Document {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  status: 'processing' | 'active' | 'archived';
  categoryId?: number;
  createdAt: string;
}

// NO any types allowed
const fetchDocument = async (id: number): Promise<Document> => {
  // ...
};
```

---

## Forbidden Patterns

### Backend
- Never use `print()` - use `logging` module
- Never store passwords in plain text - use bcrypt
- Never hardcode secrets - use environment variables
- Never use `SELECT *` - specify columns
- Never skip input validation
- Never expose internal errors to users

### Frontend
- Never use `any` type
- Never leave console.log in production
- Never skip error handling in async operations
- Never use inline styles - use Chakra UI
- Never store sensitive data in localStorage

---

## Module-Specific Rules

### Documents Module
- All documents must belong to a user (user_id foreign key)
- Document status must be one of: processing, active, archived
- File types allowed: pdf, docx, txt
- Maximum file size: 10MB
- Text extraction must happen asynchronously
- Store extracted text for vector search

### Chat/Q&A Module
- All conversations must belong to a user
- Messages must reference source documents when available
- Implement streaming responses for better UX
- Log all queries for analytics
- Rate limit API calls to LLM

### Categories Module
- Categories support one level of nesting (parent_id)
- Category names must be unique
- Deleting a category should reassign documents to "Uncategorized"

### Analytics Module
- Track all user queries (anonymized if needed)
- Aggregate data for dashboard charts
- Identify unanswered/poorly-answered questions

---

## API Conventions

- All endpoints prefixed with `/api/` (except auth and admin)
- Auth endpoints: `/auth/`
- Admin endpoints: `/admin/`
- Use plural nouns for resources: `/documents`, `/conversations`, `/categories`
- Return appropriate HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 409: Conflict
  - 422: Validation Error

---

## Authentication

### JWT Configuration
- Access token expires: 30 minutes
- Refresh token expires: 7 days
- Algorithm: HS256
- Tokens stored in httpOnly cookies (preferred) or Authorization header

### Role-Based Access Control
- **admin**: Full access to all features including admin panel
- **manager**: Can manage documents and categories, view analytics
- **employee**: Can view documents and use chat

---

## AI/LLM Integration

### RAG Pattern
1. User asks a question
2. Convert question to embedding vector
3. Search vector database for relevant document chunks
4. Send question + relevant chunks to LLM
5. Return answer with source references

### Document Processing Pipeline
1. Upload file → validate type/size
2. Extract text (PyPDF2, python-docx)
3. Chunk text (500-1000 tokens per chunk)
4. Generate embeddings (OpenAI ada-002)
5. Store in PostgreSQL with pgvector

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/policy_assistant

# Auth
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI/LLM
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-ada-002
CHAT_MODEL=gpt-4

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@yourapp.com

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,docx,txt

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## Development Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d

# Tests
pytest backend/tests -v --cov=app
cd frontend && npm test

# Linting
ruff check backend/
cd frontend && npm run lint && npm run type-check
```

---

## Commit Message Format

```
feat(documents): add PDF text extraction
fix(chat): handle empty responses from LLM
refactor(auth): simplify token refresh logic
test(api): add document upload tests
docs: update API documentation
```

---

## Skills Reference

| Task | Skill to Read |
|------|---------------|
| Database models | skills/DATABASE.md |
| API + Auth | skills/BACKEND.md |
| React + UI | skills/FRONTEND.md |
| Testing | skills/TESTING.md |
| Deployment | skills/DEPLOYMENT.md |

---

## Agent Coordination

For complex tasks, the ORCHESTRATOR coordinates:
- DATABASE-AGENT → Backend models
- BACKEND-AGENT → API development
- FRONTEND-AGENT → UI components
- TEST-AGENT → Testing
- REVIEW-AGENT → Code review
- DEVOPS-AGENT → Deployment

Read agent definitions in `/agents/` folder.
