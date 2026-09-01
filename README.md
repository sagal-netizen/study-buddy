# StudyBuddy AI

A full-stack AI-powered Learning Management System (LMS) that combines structured course delivery with local LLM inference for personalized tutoring, RAG-based Q&A, and quiz generation. The platform's AI persona is **Lyra** — a friendly, patient tutor that adapts to each course's configured teaching style.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack & Versions](#tech-stack--versions)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Backend](#backend)
  - [Running the Server](#running-the-server)
  - [Database Schema](#database-schema)
  - [API Reference](#api-reference)
  - [AI & RAG Pipeline](#ai--rag-pipeline)
  - [Authentication](#authentication)
- [Frontend](#frontend)
  - [Running the Dev Server](#running-the-dev-server)
  - [Pages & Features](#pages--features)
- [Known Issues](#known-issues)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Next.js 16)                  │
│           http://localhost:3000                         │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP REST (hardcoded to
                      │ http://127.0.0.1:8000)
┌─────────────────────▼───────────────────────────────────┐
│                  FastAPI Backend                         │
│           http://127.0.0.1:8000                         │
│                                                         │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐ │
│  │  PostgreSQL  │  │  ChromaDB  │  │     Ollama      │ │
│  │  (SQLAlchemy)│  │ (local,    │  │  (local LLM)    │ │
│  │  Structured  │  │ ./chroma_  │  │                 │ │
│  │  data / ORM  │  │   data/)   │  │ nomic-embed-text│ │
│  └──────────────┘  │ Embeddings │  │ llama3.2        │ │
│                    └────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

All AI inference runs **locally** — no external API keys or cloud services required.

---

## Tech Stack & Versions

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | latest | REST API framework |
| Uvicorn | latest | ASGI server |
| SQLAlchemy | latest | PostgreSQL ORM |
| Pydantic | latest | Request / response validation |
| python-dotenv | latest | `.env` file loading |
| PyJWT (`jwt`) | latest | JWT token creation and verification |
| pwdlib | latest | Password hashing (bcrypt via `PasswordHash.recommended()`) |
| pypdf | latest | PDF text extraction |
| python-docx | latest | DOCX text extraction |
| python-pptx | latest | PPTX text extraction |
| openpyxl | latest | XLSX text extraction |
| chromadb | latest | Local persistent vector database |
| ollama (Python client) | latest | Interface to local Ollama LLM server |

**Local AI models (via Ollama):**

| Model | Purpose |
|---|---|
| `nomic-embed-text` | Text embedding for RAG ingestion and retrieval |
| `llama3.2` | Chat completion — Lyra Q&A responses and quiz generation |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `next` | `16.3.0` | Full-stack React framework (App Router) |
| `react` | `19.2.8` | UI library |
| `react-dom` | `19.2.8` | DOM renderer |
| `tailwindcss` | `^4` | Utility-first CSS |
| `@tailwindcss/postcss` | `^4` | Tailwind PostCSS integration |
| `typescript` | `^5` | Static typing |
| `eslint` | `^9` | Linting |
| `eslint-config-next` | `16.3.0` | Next.js ESLint rules |

**Fonts:** Cormorant Garamond (headings / display) + Inter (body) — loaded via `next/font/google`

**Design language:** Dark theme; primary background `#070507`, accent red `#8b1234` / `#b21e45`, gold `#c9a56a`.

---

## Project Structure

```
Study Buddy AI/
├── README.md
│
├── backend/
│   ├── .env                          # DATABASE_URL environment variable
│   ├── chroma_data/
│   │   └── chroma.sqlite3            # Persistent ChromaDB vector store
│   ├── uploads/                      # Uploaded study material files (served by FastAPI)
│   └── app/
│       ├── main.py                   # FastAPI app entry point — CORS, routers, DB init
│       ├── base.py                   # SQLAlchemy declarative Base
│       ├── database.py               # DB engine, ChromaDB client, embedding helpers
│       ├── security.py               # JWT creation/decoding, get_current_user, get_current_admin
│       │
│       ├── core/
│       │   └── database.py           # Placeholder (empty)
│       │
│       ├── user/
│       │   ├── model.py              # User SQLAlchemy model
│       │   ├── repository.py         # User DB operations (CRUD)
│       │   └── route.py              # /users/* endpoints
│       │
│       ├── course/
│       │   ├── model.py              # Course, Chapter, Material, CourseTutor models
│       │   ├── repository.py         # Course/Chapter/Material DB operations
│       │   └── route.py              # /courses/*, /chapters/*, /materials/* endpoints
│       │
│       ├── progress/
│       │   ├── model.py              # ChapterProgress model
│       │   ├── repository.py         # Progress DB operations
│       │   ├── route.py              # /progress/* endpoints (not registered in main.py)
│       │   └── __init__.py
│       │
│       ├── ai/
│       │   ├── rag.py                # RAG pipeline — context retrieval + Lyra prompt + Ollama call
│       │   ├── quiz.py               # AI quiz generation with answer-position balancing
│       │   ├── document_processor.py # Document ingestion — extract → chunk → embed → store
│       │   ├── route.py              # POST /ai/ask
│       │   ├── quiz_route.py         # POST /ai/quiz
│       │   └── __init__.py
│       │
│       └── vector_db/
│           ├── database.py           # Alternate ChromaDB client setup (not used in active routes)
│           ├── service.py            # Alternate document processing service (not used in active routes)
│           └── __init__.py
│
└── frontend/
    ├── package.json
    ├── next.config.ts                # Empty Next.js config
    ├── AGENTS.md                     # Next.js agent rules (auto-generated)
    ├── CLAUDE.md                     # Additional agent notes
    └── app/
        ├── layout.tsx                # Root layout — fonts, metadata, globals.css
        ├── page.tsx                  # Landing page (/)
        ├── globals.css               # Global CSS + Tailwind directives
        │
        ├── login/page.tsx            # Student login
        ├── register/page.tsx         # Student registration
        ├── dashboard/page.tsx        # Student dashboard (main hub)
        ├── ai-tutor/page.tsx         # Standalone Lyra chat interface
        ├── quizzes/page.tsx          # AI quiz generator and history
        ├── study-space/page.tsx      # Pomodoro timer with ambient themes
        ├── study-clubs/page.tsx      # Study clubs (frontend-only)
        ├── curiosity/page.tsx        # Random fun facts (static)
        │
        ├── course/
        │   └── [course_id]/page.tsx  # Course detail — chapters, progress, Lyra chat
        │
        ├── admin-login/page.tsx      # Admin login
        └── admin/
            ├── page.tsx              # Admin course management
            └── users/page.tsx        # Admin user analytics dashboard
```

---

## Environment Setup

### Prerequisites

- **Python** 3.11+
- **Node.js** 20+
- **PostgreSQL** (running locally)
- **Ollama** installed and running — see [ollama.com](https://ollama.com)

### Pull the required Ollama models

```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

### Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-dotenv \
            PyJWT pwdlib pypdf python-docx python-pptx openpyxl chromadb ollama
```

Create the `.env` file at `backend/.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/studybuddy_ai
```

Create the PostgreSQL database:

```sql
CREATE DATABASE studybuddy_ai;
```

Tables are created automatically when the server starts (`Base.metadata.create_all`).

### Frontend setup

```bash
cd frontend
npm install
```

---

## Backend

### Running the Server

```bash
cd backend
uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`.  
Interactive docs are at `http://127.0.0.1:8000/docs` (Swagger UI).

---

### Database Schema

All tables are managed by SQLAlchemy and auto-created at startup.

#### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, auto-increment |
| `name` | VARCHAR | NOT NULL |
| `email` | VARCHAR | UNIQUE, NOT NULL |
| `password` | VARCHAR | NOT NULL (bcrypt hash) |
| `role` | VARCHAR | DEFAULT `"student"` — values: `"student"` \| `"admin"` |

#### `courses`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, auto-increment |
| `title` | VARCHAR | NOT NULL |
| `description` | TEXT | NULLABLE |

Relationships: one course → many `chapters` (cascade delete), many `materials` (cascade delete), one `course_tutors` record (cascade delete).

#### `chapters`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `title` | VARCHAR | NOT NULL |
| `content` | TEXT | NULLABLE (lesson summary / body) |
| `notes` | TEXT | NULLABLE (study notes) |
| `course_id` | INTEGER | FK → courses.id, NOT NULL |

#### `materials`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `filename` | VARCHAR | NOT NULL |
| `file_type` | VARCHAR | NULLABLE (e.g. `"pdf"`, `"docx"`) |
| `file_path` | VARCHAR | NOT NULL (absolute path on disk inside `/uploads/`) |
| `course_id` | INTEGER | FK → courses.id, NOT NULL |
| `chapter_id` | INTEGER | FK → chapters.id, NULLABLE |

Files are stored on disk under `backend/uploads/`. Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV, ZIP.

#### `course_tutors`

One record per course — configures the Lyra AI tutor persona for that course.

| Column | Type | Default |
|---|---|---|
| `id` | INTEGER | PK |
| `course_id` | INTEGER | FK → courses.id, UNIQUE |
| `tutor_name` | VARCHAR | `"Lyra"` |
| `personality` | VARCHAR | `"friendly"` |
| `teaching_style` | VARCHAR | `"step-by-step"` |
| `tone` | VARCHAR | `"encouraging"` |
| `difficulty` | VARCHAR | `"beginner-friendly"` |
| `custom_instructions` | TEXT | NULLABLE |

#### `chapter_progress`

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → users.id |
| `chapter_id` | INTEGER | FK → chapters.id |
| `completed` | BOOLEAN | DEFAULT `false` |

> **Note:** The `chapter_progress` table and its routes exist (`app/progress/`) but the progress router is not registered in `main.py`, so these endpoints currently return 404.

#### ChromaDB collection — `study_materials`

Stores text embeddings for all uploaded materials.

| Field | Description |
|---|---|
| `id` | `material_{material_id}_chunk_{index}` |
| `document` | Raw text chunk (400 words per chunk) |
| `embedding` | 768-dim vector from `nomic-embed-text` |
| `metadata.material_id` | Source material ID |
| `metadata.course_id` | Parent course ID |
| `metadata.chapter_id` | Parent chapter ID (or null) |
| `metadata.chunk_index` | Chunk sequence number |
| `metadata.file_type` | File extension |

Persisted to `backend/chroma_data/chroma.sqlite3`.

---

### API Reference

All endpoints are prefixed under `http://127.0.0.1:8000`. CORS is open to `http://localhost:3000` and `http://127.0.0.1:3000`.

#### Health Check

| Method | Path | Description |
|---|---|---|
| GET | `/` | Returns `{ "message": "Welcome to StudyBuddy AI" }` |

#### Users — `/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users/register` | None | Register a new user. Body: `{ name, email, password, role }` |
| POST | `/users/login` | None | Login. Body: `{ email, password }`. Returns `{ access_token, token_type, user }` |
| GET | `/users` | None | List all users |
| GET | `/users/{user_id}` | None | Get a single user by ID |
| PUT | `/users/{user_id}/role` | None | Update a user's role. Body: `{ role }` |
| DELETE | `/users/{user_id}` | None | Delete a user |

#### Courses — `/courses`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/courses` | None | Create a course. Body: `{ title, description? }`. Auto-creates a default Lyra tutor config. |
| GET | `/courses` | None | List all courses |
| GET | `/courses/{course_id}` | None | Get a course with its chapters, materials, and tutor config |
| PUT | `/courses/{course_id}` | None | Update course title/description |
| DELETE | `/courses/{course_id}` | None | Delete course (cascades to all related data) |

#### Chapters — `/courses/{course_id}/chapters` and `/chapters`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/courses/{course_id}/chapters` | None | Add a chapter. Body: `{ title, content?, notes? }` |
| GET | `/courses/{course_id}/chapters` | None | List all chapters for a course |
| GET | `/chapters/{chapter_id}` | None | Get a single chapter |
| PUT | `/chapters/{chapter_id}` | None | Update chapter. Body: `{ title, content?, notes? }` |
| DELETE | `/chapters/{chapter_id}` | None | Delete a chapter |

#### Materials — `/courses/{course_id}/materials`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/courses/{course_id}/materials` | None | Upload course-level material (multipart/form-data). Triggers RAG ingestion. |
| GET | `/courses/{course_id}/materials` | None | List course-level materials |
| POST | `/courses/{course_id}/chapters/{chapter_id}/materials` | None | Upload chapter-level material. Triggers RAG ingestion. |
| GET | `/courses/{course_id}/chapters/{chapter_id}/materials` | None | List chapter-level materials |
| GET | `/materials/{material_id}/download` | None | Download the original file |
| DELETE | `/materials/{material_id}` | None | Delete material record and file from disk |

#### AI Tutor Config — `/courses/{course_id}/tutor`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/courses/{course_id}/tutor` | None | Get the Lyra config for a course (auto-creates if missing) |
| POST | `/courses/{course_id}/tutor` | None | Create or replace the tutor config |
| PUT | `/courses/{course_id}/tutor` | None | Update the tutor config |

#### AI — `/ai`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/ai/ask` | None | `{ question: string, course_id?: number }` | RAG-powered Q&A. Returns `{ answer, sources }` |
| POST | `/ai/quiz` | None | `{ topic: string, number_of_questions?: int, difficulty?: string }` | Generate an MCQ quiz. Returns `{ questions: [...] }` |

**Quiz question shape:**
```json
{
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "answer": 2,
  "explanation": "string"
}
```
`answer` is a zero-based index into `options`.

---

### AI & RAG Pipeline

#### Document Ingestion (on material upload)

```
Upload (PDF / DOCX / TXT)
        │
        ▼
document_processor.py::extract_text()
  • PDF  → pypdf PdfReader, extracts per-page text
  • DOCX → python-docx Document, extracts paragraph text
  • TXT  → plain utf-8 read
        │
        ▼
chunk_text() — splits into 400-word chunks
        │
        ▼
For each chunk:
  create_embedding(chunk)
    → ollama.embeddings(model="nomic-embed-text")
    → 768-dim float vector
        │
        ▼
chromadb.collection.add(
  id   = "material_{id}_chunk_{i}",
  doc  = chunk text,
  emb  = embedding vector,
  meta = { material_id, course_id, chapter_id, chunk_index, file_type }
)
```

#### RAG Q&A (on `/ai/ask`)

```
Student question
        │
        ▼
create_embedding(question) → query vector
        │
        ▼
collection.query(query_embeddings, n_results=5)
  → top-5 most semantically similar chunks
        │
        ▼
Build prompt:
  • Lyra system persona
  • Optional course-context sentence
  • Retrieved chunks as STUDY MATERIAL
  • Student question
        │
        ▼
ollama.chat(model="llama3.2", messages=[prompt])
        │
        ▼
Return { answer, sources }
```

#### Quiz Generation (on `/ai/quiz`)

```
{ topic, number_of_questions, difficulty }
        │
        ▼
Pre-compute answer_positions[]
  (shuffled list of 0-3 to distribute A/B/C/D)
        │
        ▼
ollama.chat(model="llama3.2")
  Prompt includes: topic, difficulty, question count,
  intended answer positions, strict JSON schema
        │
        ▼
Parse + validate JSON response
  (must have exactly 4 options, integer answer 0-3)
        │
        ▼
Post-process: rearrange each question's options
  to force correct answer into target position
  (shuffles distractors, keeps correct answer correct)
        │
        ▼
Return { questions: [...] }
```

---

### Authentication

- Passwords are hashed with `pwdlib.PasswordHash.recommended()` (bcrypt).
- Login returns a JWT signed with `HS256`. Token expires after **60 minutes**.
- Token payload: `{ user_id, email, role, exp }`.
- Two dependency guards are defined in `security.py`:
  - `get_current_user` — validates Bearer token
  - `get_current_admin` — additionally checks `role == "admin"`
- **Important:** As of the current codebase, authentication guards are **not applied** to any route endpoints. All API endpoints are publicly accessible.

The frontend stores auth state in `localStorage`:
- `access_token` — student JWT
- `studentName` — display name
- `user` — full user JSON object
- `admin_access_token` — admin JWT
- `admin_user` — admin user JSON object

---

## Frontend

### Running the Dev Server

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:3000`.

Other scripts:
```bash
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

---

### Pages & Features

#### `/` — Landing Page

Entry page with three CTAs: Login, Sign Up, and Enter StudyBuddy (direct to dashboard).

---

#### `/login` — Student Login

Email + password form. Calls `POST /users/login`. On success, stores `access_token`, `user`, and `studentName` in `localStorage`, then redirects to `/dashboard`.

---

#### `/register` — Student Registration

Name + email + password form. Calls `POST /users/register` with `role: "student"` hardcoded. Redirects to `/login` on success.

---

#### `/dashboard` — Student Dashboard

Main hub after login. Features:

- **Sidebar** — persistent navigation to all sections (Dashboard, AI Tutor, Quizzes, Study Space, Study Clubs, Curiosity Corner)
- **Hero banner** — personalized greeting from `studentName` in localStorage
- **Stats cards:**
  - Study Streak (static "7 days")
  - Quiz Growth — calculated from localStorage quiz history
  - Courses — live count from `GET /courses`
  - Learning Mode (static)
- **Continue Learning** — deep link to the first course from the API
- **My Courses** — grid of all courses from `GET /courses`, each linking to `/course/[id]`
- **Right sidebar** — AI Tutor promo, Quiz promo, Today's Plan (static), progress bar (from quiz history)

---

#### `/course/[course_id]` — Course Detail

Dynamic route for each course. On load, fetches course data, chapters, chapter progress, and AI tutor config. Features:

- Course hero with progress badge and AI tutor personality badge
- Expandable AI chat panel — calls `POST /ai/ask` with `course_id` for context-aware responses
- Overall course progress bar (completed chapters / total)
- Accordion chapter list with content, notes, and materials display
- "Mark as Complete" button per chapter — calls `POST /progress/{user_id}/{chapter_id}/complete`

> **Note:** `user_id` is currently hardcoded to `1`. Progress endpoints also return 404 because the progress router is not registered.

---

#### `/ai-tutor` — AI Tutor Chat

Full-page standalone chat with Lyra. Chat bubbles with user/Lyra avatars. Calls `POST /ai/ask` without a `course_id` (general knowledge mode). State is in-memory only — chat resets on navigation.

---

#### `/quizzes` — AI Quiz

Two-phase UI:

**Setup:**
- Topic text input (free text)
- Difficulty selector: Easy / Medium / Hard
- Question count: 5 or 10
- Generates quiz via `POST /ai/quiz`

**Quiz interface:**
- One question at a time
- A/B/C/D option buttons with correct/wrong color feedback after answering
- Explanation reveal after each answer
- Progress bar across questions

**Results screen:**
- Score and percentage
- Growth comparison vs previous quiz (from localStorage history)
- Performance history table (last 5 entries)
- Quiz history persisted to `localStorage` under `"studybuddy_quiz_history"`

---

#### `/study-space` — Focus & Pomodoro

An immersive focus environment with:

- **6 ambient themes** with animated CSS backgrounds:
  - 🌧 Rain — animated raindrops
  - 🌿 Forest — floating leaf particles
  - 🌙 Midnight — twinkling stars
  - ☕ Café — warm overlay
  - 📚 Library — quiet dark theme
  - 🎯 Pure Focus — minimal

- **Pomodoro timer** — 25-minute countdown with Start / Pause / Reset / Break controls
- **Floating "Ask Lyra" button** — opens an inline chat calling `POST /ai/ask`

---

#### `/study-clubs` — Study Clubs

Social learning feature (entirely frontend, no backend persistence):

- Three hardcoded clubs: Python Learners, AI Explorers, Exam Warriors
- Join / Leave toggles — member count increments locally
- Joined clubs persisted to `localStorage` under `"studybuddy_joined_clubs"`

---

#### `/curiosity` — Curiosity Corner

Displays a random fun fact from a hardcoded array of 6 facts. A "Give me another" button picks a new random fact. No API calls, fully static.

---

#### `/admin-login` — Admin Login

Same `POST /users/login` endpoint as student login. After login, validates `role === "admin"` on the client side. Stores `admin_access_token` and `admin_user` in `localStorage`, then redirects to `/admin`.

---

#### `/admin` — Admin Course Manager

Full course and content management interface:

- Create new courses (POST `/courses`)
- Select a course → view its chapters
- Add chapters with title, content (lesson summary), and notes
- Upload study materials to a chapter (multipart file upload to POST `/courses/{id}/chapters/{id}/materials`) — triggers the full RAG ingestion pipeline
- View uploaded materials list per chapter with file type icons
- Delete materials and courses

---

#### `/admin/users` — Admin User Analytics

Analytics dashboard with three tabs:

**Overview tab:**
- Stats cards: Total Users, Students, average performance
- Bar chart visualization of class-wide progress
- Student directory table

**Student Reports tab:**
- Searchable table of all users
- Individual student report drawer with progress, performance, and activity metrics

**Whole Class tab:**
- Class-wide average metrics
- Per-student progress bar breakdown

> **Note:** Progress and performance figures shown in the admin dashboard are **simulated** (computed deterministically from `student.id`) rather than drawn from real backend data. The progress router is not connected.

---

## Known Issues

The following bugs and incomplete features are present in the codebase at time of writing.

| # | Area | Issue | Impact |
|---|---|---|---|
| 1 | Backend | `app/progress/route.py` is **not imported** in `main.py` | All `/progress/*` calls return `404` — chapter completion is broken |
| 2 | Backend | JWT `SECRET_KEY` is hardcoded as `"studybuddy-secret-key"` in `security.py` | Security risk — should be loaded from `.env` |
| 3 | Backend | No authentication guards applied to any route | All endpoints are publicly accessible without a token |
| 4 | Frontend | `app/quizzes/page.tsx` API URL contains a typo (`8000555554rq1`) | Quiz generation fails with a network error |
| 5 | Frontend | `USER_ID` hardcoded to `1` in `/course/[course_id]/page.tsx` | Progress is always saved/read for user ID 1 regardless of who is logged in |
| 6 | Frontend | Admin user analytics uses simulated data (`id * 17`) | Progress/performance figures are not real |
| 7 | Backend | `app/core/database.py` is empty | Placeholder — no functionality |
| 8 | Backend | Two document processing paths exist (`app/ai/document_processor.py` and `app/vector_db/service.py`) with different chunk sizes (400 words vs 1000 chars) | Only `document_processor.py` is used; `vector_db/service.py` is dead code |

---

## License

This project is for educational purposes.
