# INITIAL.md - Internal Policy Assistant Product Definition

> An AI-powered assistant that helps employees instantly find answers from internal company policies, HR documents, and compliance guidelines.

---

## PRODUCT

### Name
Internal Policy Assistant

### Description
An AI-powered assistant that helps employees instantly find answers from internal company policies, HR documents, and compliance guidelines. Companies can upload their policy documents, and employees can ask questions in natural language to get accurate answers with source references.

### Target User
Small to mid-sized companies (HR teams, compliance teams, and employees)

### Type
- [x] SaaS (Software as a Service)

---

## TECH STACK

### Backend
- [x] FastAPI + Python 3.11+

### Frontend
- [x] React + Vite + TypeScript

### Database
- [x] PostgreSQL + SQLAlchemy

### Authentication
- [x] Email/Password with JWT

### UI Framework
- [x] Chakra UI

### Payments
- [ ] None (add later if needed)

---

## MODULES

### Module 1: Authentication (Required)

**Description:** User authentication and authorization

**Models:**
```
User:
  - id: int (PK)
  - email: str (unique)
  - hashed_password: str
  - full_name: str
  - role: enum (admin, manager, employee)
  - is_active: bool
  - is_verified: bool
  - created_at: datetime
  - updated_at: datetime

RefreshToken:
  - id: int (PK)
  - user_id: int (FK -> User)
  - token: str
  - expires_at: datetime
  - revoked: bool
```

**API Endpoints:**
- POST /auth/register - Create new account
- POST /auth/login - Login with email/password
- POST /auth/refresh - Refresh access token
- POST /auth/logout - Revoke refresh token
- GET /auth/me - Get current user profile
- PUT /auth/me - Update profile
- POST /auth/forgot-password - Request password reset
- POST /auth/reset-password - Reset password with token

**Frontend Pages:**
- /login - Login page
- /register - Registration page
- /forgot-password - Forgot password page
- /profile - User profile page (protected)

---

### Module 2: Documents

**Description:** Upload and manage policy documents for AI processing

**Models:**
```
Document:
  - id: int (PK)
  - user_id: int (FK -> User, uploader)
  - category_id: int (FK -> Category, nullable)
  - title: str
  - description: str (nullable)
  - file_url: str
  - file_type: str (pdf, docx, txt)
  - file_size: int (bytes)
  - content: text (extracted text for search)
  - status: enum (processing, active, archived)
  - created_at: datetime
  - updated_at: datetime
```

**API Endpoints:**
- GET /api/documents - List all documents (with filters)
- POST /api/documents - Upload new document
- GET /api/documents/{id} - Get document details
- PUT /api/documents/{id} - Update document metadata
- DELETE /api/documents/{id} - Delete document
- GET /api/documents/{id}/download - Download original file

**Frontend Pages:**
- /documents - Document list with filters and search
- /documents/upload - Upload new document
- /documents/{id} - Document detail view

---

### Module 3: Chat/Q&A

**Description:** AI-powered question answering interface

**Models:**
```
Conversation:
  - id: int (PK)
  - user_id: int (FK -> User)
  - title: str (auto-generated from first question)
  - created_at: datetime
  - updated_at: datetime

Message:
  - id: int (PK)
  - conversation_id: int (FK -> Conversation)
  - role: enum (user, assistant)
  - content: text
  - source_documents: json (array of document references)
  - feedback: enum (helpful, not_helpful, null)
  - created_at: datetime
```

**API Endpoints:**
- GET /api/conversations - List user's conversations
- POST /api/conversations - Start new conversation
- GET /api/conversations/{id} - Get conversation with messages
- DELETE /api/conversations/{id} - Delete conversation
- POST /api/conversations/{id}/messages - Send message (ask question)
- PUT /api/messages/{id}/feedback - Rate answer (helpful/not helpful)

**Frontend Pages:**
- /chat - Main chat interface
- /chat/history - Conversation history list
- /chat/{id} - View past conversation

---

### Module 4: Categories

**Description:** Organize documents by topic/department

**Models:**
```
Category:
  - id: int (PK)
  - name: str (unique)
  - description: str (nullable)
  - icon: str (icon name, nullable)
  - parent_id: int (FK -> Category, nullable, for subcategories)
  - created_at: datetime
  - updated_at: datetime
```

**API Endpoints:**
- GET /api/categories - List all categories (tree structure)
- POST /api/categories - Create category
- GET /api/categories/{id} - Get category with documents
- PUT /api/categories/{id} - Update category
- DELETE /api/categories/{id} - Delete category (reassign docs)

**Frontend Pages:**
- /categories - Category list/tree view
- /categories/{id} - Category detail with associated documents

---

### Module 5: Analytics

**Description:** Track usage and identify knowledge gaps

**Models:**
```
QueryLog:
  - id: int (PK)
  - user_id: int (FK -> User)
  - question: text
  - had_answer: bool
  - documents_referenced: json
  - created_at: datetime

DocumentView:
  - id: int (PK)
  - document_id: int (FK -> Document)
  - user_id: int (FK -> User)
  - viewed_at: datetime
```

**API Endpoints:**
- GET /api/analytics/overview - Dashboard stats
- GET /api/analytics/top-questions - Most asked questions
- GET /api/analytics/popular-documents - Most viewed documents
- GET /api/analytics/unanswered - Questions without good answers
- GET /api/analytics/usage - Usage over time (charts data)

**Frontend Pages:**
- /analytics - Analytics dashboard with charts

---

### Module 6: Admin Panel

**Description:** Admin-only management interface

**API Endpoints:**
- GET /admin/users - List all users
- PUT /admin/users/{id} - Update user (role, status)
- DELETE /admin/users/{id} - Deactivate user
- GET /admin/stats - Platform statistics
- GET /admin/settings - System settings
- PUT /admin/settings - Update settings

**Frontend Pages:**
- /admin - Admin dashboard
- /admin/users - User management
- /admin/settings - System settings

---

### Module 7: Dashboard

**Description:** User home page with overview

**Frontend Pages:**
- /dashboard - Main dashboard with:
  - Recent conversations
  - Quick ask widget
  - Recently viewed documents
  - Category shortcuts
- /settings - User settings and preferences

---

## MVP SCOPE

### Must Have (MVP)
- [x] User registration and login
- [x] Upload and manage documents
- [x] Basic chat interface to ask questions
- [x] AI returns answers with source references
- [x] Simple category organization

### Nice to Have (Post-MVP)
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Email notifications
- [ ] Multi-tenancy (separate data per company)
- [ ] Advanced search filters
- [ ] Document version history
- [ ] Bulk document upload

---

## ACCEPTANCE CRITERIA

### Authentication
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] JWT tokens work correctly with refresh
- [ ] Protected routes redirect to login
- [ ] Password reset flow works

### Documents
- [ ] User can upload PDF, DOCX, TXT files
- [ ] Documents are processed and text extracted
- [ ] User can view, edit, delete their documents
- [ ] Documents can be assigned to categories
- [ ] File download works correctly

### Chat/Q&A
- [ ] User can start new conversation
- [ ] AI responds with relevant answers
- [ ] Source documents are referenced in answers
- [ ] User can rate answers as helpful/not helpful
- [ ] Chat history is preserved

### Categories
- [ ] Admin can create/edit/delete categories
- [ ] Categories support hierarchy (subcategories)
- [ ] Documents can be filtered by category

### Quality
- [ ] All API endpoints documented in OpenAPI
- [ ] Backend test coverage 80%+
- [ ] Frontend TypeScript strict mode passes
- [ ] Docker builds and runs successfully

---

## SPECIAL REQUIREMENTS

### AI/LLM Integration
- Use OpenAI API or similar for question answering
- Implement RAG (Retrieval Augmented Generation) pattern
- Vector embeddings for document search (consider pgvector)
- Chunk documents for better retrieval

### Security
- [x] Rate limiting on auth endpoints
- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS prevention
- [x] File upload validation (type, size limits)
- [x] Role-based access control (admin, manager, employee)

### Integrations
- [x] Email service for notifications (password reset, etc.)
- [x] File upload service (local or S3-compatible)
- [ ] SSO integration (future)

---

## ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/policy_assistant

# Auth
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/LLM
OPENAI_API_KEY=sk-...

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## AGENTS

> These agents will build your product in parallel:

| Agent | Role | Works On |
|-------|------|----------|
| DATABASE-AGENT | Creates all models and migrations | All database models |
| BACKEND-AGENT | Builds API endpoints and services | All modules' backends |
| FRONTEND-AGENT | Creates UI pages and components | All modules' frontends |
| DEVOPS-AGENT | Sets up Docker, CI/CD, environments | Infrastructure |
| TEST-AGENT | Writes unit and integration tests | All code |
| REVIEW-AGENT | Security and code quality audit | All code |

---

# READY?

```bash
/generate-prp INITIAL.md
```

Then:

```bash
/execute-prp PRPs/internal-policy-assistant-prp.md
```
