# PRP: Internal Policy Assistant

> Implementation blueprint for parallel agent execution

---

## METADATA

| Field | Value |
|-------|-------|
| **Product** | Internal Policy Assistant |
| **Type** | SaaS |
| **Version** | 1.0 |
| **Created** | 2026-02-01 |
| **Complexity** | High (AI/RAG integration) |

---

## PRODUCT OVERVIEW

**Description:** An AI-powered assistant that helps employees instantly find answers from internal company policies, HR documents, and compliance guidelines. Companies can upload their policy documents, and employees can ask questions in natural language to get accurate answers with source references.

**Value Proposition:** Reduces time spent searching through policy documents from hours to seconds. Ensures consistent, accurate answers across the organization. Identifies knowledge gaps through analytics.

**MVP Scope:**
- [ ] User registration and login
- [ ] Upload and manage documents (PDF, DOCX, TXT)
- [ ] Basic chat interface to ask questions
- [ ] AI returns answers with source references
- [ ] Simple category organization

---

## TECH STACK

| Layer | Technology | Skill Reference |
|-------|------------|-----------------|
| Backend | FastAPI + Python 3.11+ | skills/BACKEND.md |
| Frontend | React + TypeScript + Vite | skills/FRONTEND.md |
| Database | PostgreSQL + SQLAlchemy + pgvector | skills/DATABASE.md |
| Auth | JWT + bcrypt | skills/BACKEND.md |
| UI | Chakra UI | skills/FRONTEND.md |
| AI/LLM | OpenAI API (GPT-4 + Ada embeddings) | - |
| Testing | pytest + React Testing Library | skills/TESTING.md |
| Deployment | Docker + GitHub Actions | skills/DEPLOYMENT.md |

---

## DATABASE MODELS

### User Model
```
User:
  - id: int (PK)
  - email: str (unique, indexed)
  - hashed_password: str
  - full_name: str
  - role: enum (admin, manager, employee)
  - is_active: bool (default: true)
  - is_verified: bool (default: false)
  - created_at: datetime
  - updated_at: datetime
```

### RefreshToken Model
```
RefreshToken:
  - id: int (PK)
  - user_id: int (FK -> User)
  - token: str (unique, indexed)
  - expires_at: datetime
  - revoked: bool (default: false)
  - created_at: datetime
```

### Document Model
```
Document:
  - id: int (PK)
  - user_id: int (FK -> User)
  - category_id: int (FK -> Category, nullable)
  - title: str
  - description: str (nullable)
  - file_url: str
  - file_type: str (pdf, docx, txt)
  - file_size: int
  - content: text (extracted text)
  - status: enum (processing, active, archived)
  - created_at: datetime
  - updated_at: datetime
```

### DocumentChunk Model (for RAG)
```
DocumentChunk:
  - id: int (PK)
  - document_id: int (FK -> Document)
  - chunk_index: int
  - content: text
  - embedding: vector(1536) (pgvector)
  - token_count: int
  - created_at: datetime
```

### Category Model
```
Category:
  - id: int (PK)
  - name: str (unique)
  - description: str (nullable)
  - icon: str (nullable)
  - parent_id: int (FK -> Category, nullable)
  - created_at: datetime
  - updated_at: datetime
```

### Conversation Model
```
Conversation:
  - id: int (PK)
  - user_id: int (FK -> User)
  - title: str
  - created_at: datetime
  - updated_at: datetime
```

### Message Model
```
Message:
  - id: int (PK)
  - conversation_id: int (FK -> Conversation)
  - role: enum (user, assistant)
  - content: text
  - source_documents: json (nullable)
  - feedback: enum (helpful, not_helpful, null)
  - created_at: datetime
```

### QueryLog Model
```
QueryLog:
  - id: int (PK)
  - user_id: int (FK -> User)
  - question: text
  - had_answer: bool
  - documents_referenced: json
  - created_at: datetime
```

### DocumentView Model
```
DocumentView:
  - id: int (PK)
  - document_id: int (FK -> Document)
  - user_id: int (FK -> User)
  - viewed_at: datetime
```

---

## MODULES

### Module 1: Authentication
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Create account | Public |
| POST | /auth/login | Get tokens | Public |
| POST | /auth/refresh | Refresh access token | Public |
| POST | /auth/logout | Revoke refresh token | Required |
| GET | /auth/me | Get current user | Required |
| PUT | /auth/me | Update profile | Required |
| POST | /auth/forgot-password | Request reset | Public |
| POST | /auth/reset-password | Reset with token | Public |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /login | LoginPage | LoginForm, Logo, GradientButton |
| /register | RegisterPage | RegisterForm, PasswordStrength |
| /forgot-password | ForgotPasswordPage | EmailForm |
| /reset-password | ResetPasswordPage | NewPasswordForm |
| /profile | ProfilePage | ProfileForm, AvatarUpload |

---

### Module 2: Documents
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/documents | List documents (filterable) | Required |
| POST | /api/documents | Upload document | Required |
| GET | /api/documents/{id} | Get document details | Required |
| PUT | /api/documents/{id} | Update metadata | Required |
| DELETE | /api/documents/{id} | Delete document | Required |
| GET | /api/documents/{id}/download | Download file | Required |

**Backend Services:**
- `document_processor.py`: Extract text from PDF/DOCX/TXT
- `embedding_service.py`: Generate embeddings, chunk documents
- `storage_service.py`: Handle file uploads (local/S3)

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /documents | DocumentListPage | DocumentTable, FilterBar, SearchBox |
| /documents/upload | UploadPage | FileDropzone, CategorySelect, MetadataForm |
| /documents/{id} | DocumentDetailPage | DocumentViewer, MetadataPanel, ActionButtons |

---

### Module 3: Chat/Q&A
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/conversations | List conversations | Required |
| POST | /api/conversations | Start new conversation | Required |
| GET | /api/conversations/{id} | Get with messages | Required |
| DELETE | /api/conversations/{id} | Delete conversation | Required |
| POST | /api/conversations/{id}/messages | Send message | Required |
| PUT | /api/messages/{id}/feedback | Rate answer | Required |

**Backend Services:**
- `ai_service.py`: RAG implementation, OpenAI integration
- `retrieval_service.py`: Vector similarity search

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /chat | ChatPage | ChatWindow, MessageInput, MessageList, SourceCard |
| /chat/history | HistoryPage | ConversationList, SearchBar |
| /chat/{id} | ConversationPage | ChatWindow (read-only), MessageList |

---

### Module 4: Categories
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/categories | List all (tree) | Required |
| POST | /api/categories | Create category | Manager+ |
| GET | /api/categories/{id} | Get with documents | Required |
| PUT | /api/categories/{id} | Update category | Manager+ |
| DELETE | /api/categories/{id} | Delete category | Manager+ |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /categories | CategoriesPage | CategoryTree, CategoryCard |
| /categories/{id} | CategoryDetailPage | CategoryHeader, DocumentList |

---

### Module 5: Analytics
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/analytics/overview | Dashboard stats | Manager+ |
| GET | /api/analytics/top-questions | Most asked | Manager+ |
| GET | /api/analytics/popular-documents | Most viewed | Manager+ |
| GET | /api/analytics/unanswered | Gaps | Manager+ |
| GET | /api/analytics/usage | Time series | Manager+ |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /analytics | AnalyticsPage | StatCards, QuestionChart, DocumentChart, GapsList |

---

### Module 6: Admin Panel
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /admin/users | List all users | Admin |
| PUT | /admin/users/{id} | Update user | Admin |
| DELETE | /admin/users/{id} | Deactivate user | Admin |
| GET | /admin/stats | Platform stats | Admin |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /admin | AdminDashboard | StatCards, RecentActivity |
| /admin/users | UserManagement | UserTable, RoleSelect, StatusToggle |

---

### Module 7: Dashboard
**Agents:** FRONTEND-AGENT

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /dashboard | DashboardPage | QuickAsk, RecentChats, RecentDocs, CategoryShortcuts |
| /settings | SettingsPage | SettingsForm, NotificationPrefs |

---

## PHASE EXECUTION PLAN

### Phase 1: Foundation (4 agents in parallel)

**DATABASE-AGENT:**
- Create all SQLAlchemy models in `backend/app/models/`
- Setup Alembic migrations
- Configure pgvector extension
- Create `database.py` with session management

**BACKEND-AGENT:**
- Create project structure
- Setup `main.py` with FastAPI app
- Configure `config.py` with Pydantic settings
- Setup CORS, middleware, exception handlers
- Create base schemas in `schemas/`

**FRONTEND-AGENT:**
- Initialize Vite + React + TypeScript
- Setup Chakra UI provider
- Create folder structure (components, pages, hooks, services, types)
- Setup React Router
- Create base layout components (Sidebar, Header, Layout)

**DEVOPS-AGENT:**
- Create `Dockerfile` for backend
- Create `Dockerfile` for frontend
- Create `docker-compose.yml`
- Create `.env.example` files
- Setup GitHub Actions CI workflow

**Validation Gate 1:**
```bash
cd backend && pip install -r requirements.txt
cd backend && alembic upgrade head
cd frontend && npm install
docker-compose config
```

---

### Phase 2: Core Modules (sequential, backend before frontend)

**Phase 2.1: Authentication**
- BACKEND-AGENT: Auth router, JWT service, password hashing
- FRONTEND-AGENT: Login, Register, Profile pages

**Phase 2.2: Documents**
- BACKEND-AGENT: Documents router, file upload, text extraction
- FRONTEND-AGENT: Document list, upload, detail pages

**Phase 2.3: Categories**
- BACKEND-AGENT: Categories router with tree structure
- FRONTEND-AGENT: Category list and detail pages

**Phase 2.4: Chat/Q&A**
- BACKEND-AGENT: Conversations router, AI service, RAG pipeline
- FRONTEND-AGENT: Chat interface, history, message components

**Phase 2.5: Dashboard**
- FRONTEND-AGENT: Dashboard page, quick ask widget

**Validation Gate 2:**
```bash
ruff check backend/
cd frontend && npm run lint
cd frontend && npm run type-check
```

---

### Phase 3: Extended Features (parallel)

**BACKEND-AGENT:**
- Analytics endpoints
- Admin endpoints
- Email service integration

**FRONTEND-AGENT:**
- Analytics dashboard
- Admin panel
- Settings page

**Validation Gate 3:**
```bash
ruff check backend/
cd frontend && npm run lint && npm run type-check
```

---

### Phase 4: Quality (3 agents in parallel)

**TEST-AGENT:**
- Backend: pytest tests for all endpoints
- Frontend: React Testing Library tests
- Target: 80%+ coverage

**REVIEW-AGENT:**
- Security audit (auth, file uploads, SQL injection)
- Performance review (N+1 queries, indexing)
- Code quality review

**DEVOPS-AGENT:**
- Finalize Docker setup
- Add health check endpoints
- Configure production settings

**Final Validation:**
```bash
pytest backend/tests -v --cov=app --cov-fail-under=80
cd frontend && npm test -- --coverage
docker-compose build
docker-compose up -d
curl http://localhost:8000/health
```

---

## VALIDATION GATES

| Gate | Commands | Success Criteria |
|------|----------|------------------|
| 1 | `alembic upgrade head` | Migrations run without error |
| 1 | `npm install` | Dependencies installed |
| 1 | `docker-compose config` | Valid compose file |
| 2 | `ruff check backend/` | No lint errors |
| 2 | `npm run type-check` | No TypeScript errors |
| 3 | `pytest --cov --cov-fail-under=80` | 80%+ coverage |
| 3 | `npm test` | All tests pass |
| Final | `docker-compose up -d` | Containers healthy |
| Final | `curl localhost:8000/health` | Returns 200 OK |

---

## FILE STRUCTURE

```
internal-policy-assistant/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── conversation.py
│   │   │   ├── category.py
│   │   │   └── analytics.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── conversation.py
│   │   │   ├── category.py
│   │   │   └── analytics.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── conversations.py
│   │   │   ├── categories.py
│   │   │   ├── analytics.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── document_processor.py
│   │   │   ├── embedding_service.py
│   │   │   ├── ai_service.py
│   │   │   ├── retrieval_service.py
│   │   │   ├── storage_service.py
│   │   │   └── email_service.py
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py
│   │   │   ├── password.py
│   │   │   └── dependencies.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_documents.py
│   │   ├── test_conversations.py
│   │   └── test_categories.py
│   ├── requirements.txt
│   ├── alembic.ini
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── documents/
│   │   │   │   ├── DocumentTable.tsx
│   │   │   │   ├── FileDropzone.tsx
│   │   │   │   └── DocumentViewer.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   └── SourceCard.tsx
│   │   │   └── common/
│   │   │       ├── GradientButton.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDocuments.ts
│   │   │   └── useChat.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── documents.ts
│   │   │   └── conversations.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── CLAUDE.md
├── INITIAL.md
└── PRPs/
    └── internal-policy-assistant-prp.md
```

---

## ENVIRONMENT VARIABLES

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

# Email (optional for MVP)
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

## AGENT ASSIGNMENTS

| Agent | Phase | Deliverables |
|-------|-------|--------------|
| DATABASE-AGENT | 1 | All models, migrations, database.py |
| BACKEND-AGENT | 1, 2, 3 | All routers, services, schemas |
| FRONTEND-AGENT | 1, 2, 3 | All pages, components, hooks |
| DEVOPS-AGENT | 1, 4 | Docker, CI/CD, environment config |
| TEST-AGENT | 4 | All tests, 80%+ coverage |
| REVIEW-AGENT | 4 | Security audit, code review |

---

## NEXT STEP

Execute with parallel agents:

```bash
/execute-prp PRPs/internal-policy-assistant-prp.md
```
