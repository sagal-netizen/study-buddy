# StudyBuddy AI — Deployment Guide

This document covers local development setup, every required environment variable, and the deployment limitations you must understand before moving to a cloud host.

---

## Local Development

### Prerequisites

| Requirement | Minimum version | Notes |
|---|---|---|
| Python | 3.11 | 3.12+ also works |
| Node.js | 20 | LTS recommended |
| PostgreSQL | 14+ | Must be running locally |
| Ollama | latest | [ollama.com](https://ollama.com) |

### 1. Pull the required Ollama models

```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

Both models must be downloaded before you start the backend. The embedding model is used at material-upload time and at every AI question; the chat model is used for Lyra responses and quiz generation.

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic \
            python-dotenv PyJWT pwdlib pypdf python-docx \
            python-pptx openpyxl chromadb ollama
```

Copy the example environment file and fill in real values:

```bash
cp .env.example .env
```

Edit `backend/.env` — the required values are marked below.

Create the PostgreSQL database:

```sql
CREATE DATABASE studybuddy_ai;
```

Start the server:

```bash
uvicorn app.main:app --reload
```

API available at: `http://127.0.0.1:8000`  
Swagger UI at: `http://127.0.0.1:8000/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local   # already done — edit if needed
npm run dev
```

App available at: `http://localhost:3000`

---

## Backend Environment Variables

All variables are loaded from `backend/.env` via `python-dotenv`.

### Required

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/studybuddy_ai` | PostgreSQL connection string. On a cloud host, use the connection string provided by your database provider (e.g. Supabase, Neon, Railway). |
| `SECRET_KEY` | *(see below)* | JWT signing secret. **Must be a long random string.** Generate one with: `python -c "import secrets; print(secrets.token_hex(32))"`. Never use the placeholder value in production. |

### Optional — defaults work for standard local Ollama

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Base URL of the Ollama HTTP server. Change this if Ollama is running on a different machine or port. |
| `OLLAMA_CHAT_MODEL` | `llama3.2` | Model used for Lyra Q&A responses and quiz generation. |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Model used to create text embeddings for RAG ingestion and retrieval. |

### Optional — defaults work for standard local setup

| Variable | Default | Description |
|---|---|---|
| `FRONTEND_URL` | `http://localhost:3000` | Comma-separated list of allowed CORS origins. Set this to your deployed frontend URL in production (e.g. `https://your-app.vercel.app`). Multiple origins: `https://app.example.com,https://www.example.com`. |
| `CHROMA_PERSIST_DIRECTORY` | `./chroma_data` | Filesystem path where ChromaDB stores its SQLite database. Must point to a **persistent** volume on cloud hosts — see limitations below. |
| `UPLOAD_DIRECTORY` | `<backend_root>/uploads` | Filesystem path where uploaded study material files are saved. Must point to a **persistent** volume on cloud hosts — see limitations below. |

---

## Frontend Environment Variables

Set in `frontend/.env.local` for local development.  
Set in your hosting provider's environment dashboard for production.

| Variable | Local value | Production value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | `https://your-backend-domain.com` |

This variable is embedded into the browser bundle at build time. If you change it, you must rebuild the frontend.

---

## Generating a Secure SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output into your `backend/.env` as the value for `SECRET_KEY`. Never commit this value to source control.

---

## Deployment Limitations

Read this section carefully before choosing a cloud hosting provider.

### 1. PostgreSQL — must use a hosted database

The backend requires a live PostgreSQL server. On any cloud host, you must provision a managed PostgreSQL database separately and supply its connection string as `DATABASE_URL`.

Free-tier options: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app).

### 2. Ollama — requires a machine capable of running local LLMs

Ollama runs large language models locally on the host machine. This means:

- The server must have enough RAM and/or VRAM to load `llama3.2` (~2 GB) and `nomic-embed-text`.
- **Ollama does not run on standard serverless platforms** (Vercel functions, Netlify functions, AWS Lambda, etc.) because they have no persistent process, no GPU, and strict memory limits.
- You need a **persistent VM or container** — e.g. a VPS (DigitalOcean Droplet, Hetzner, Linode), a Docker container on Railway/Render, or a self-hosted server.
- Alternatively, you can replace Ollama with an external API-based LLM (e.g. OpenAI, Groq) by changing `OLLAMA_BASE_URL` and `OLLAMA_CHAT_MODEL` — but this requires modifying the `ollama.Client` calls in `rag.py` and `quiz.py` to use the target provider's SDK. That change is outside the scope of this phase.

### 3. ChromaDB — requires persistent storage

ChromaDB stores its vector embeddings in a SQLite file at `CHROMA_PERSIST_DIRECTORY`. On cloud hosts with **ephemeral filesystems** (containers that reset on redeploy), this data will be lost on every deployment.

To make ChromaDB data persistent you must either:
- Mount a **persistent volume** at the `CHROMA_PERSIST_DIRECTORY` path (supported by Railway, Render, Fly.io with volumes).
- Or migrate to a hosted vector database (e.g. Chroma Cloud, Pinecone, Weaviate) — which requires modifying `database.py`.

### 4. File uploads — require persistent storage

Uploaded study materials (PDFs, DOCX files, etc.) are stored on the local filesystem at `UPLOAD_DIRECTORY`. The same ephemeral filesystem issue applies.

To make uploads persistent you must either:
- Mount a **persistent volume** at the `UPLOAD_DIRECTORY` path.
- Or migrate file storage to an object storage service (e.g. AWS S3, Cloudflare R2, Supabase Storage) — which requires modifying `course/route.py`'s `save_uploaded_file` helper.

> **Do not assume** that uploading a file on one deployment will make it accessible on the next, unless you have confirmed persistent storage is configured.

### 5. AI workload and free-tier limits

Running `llama3.2` through Ollama is computationally expensive. Most free-tier cloud plans (512 MB RAM, shared CPU) will be unable to load or run the model. Plan for at least 4 GB RAM on the backend host.

---

## Recommended Free-Tier Deployment Stack

This is one viable path that avoids the limitations above. It is a starting point, not the only option.

| Component | Service | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Set `NEXT_PUBLIC_API_URL` in Vercel's environment settings |
| Backend + Ollama | [Railway](https://railway.app) or self-hosted VPS | Must have enough RAM for Ollama |
| PostgreSQL | [Neon](https://neon.tech) (free tier) | Supply connection string as `DATABASE_URL` |
| ChromaDB + Uploads | Persistent volume on the same backend host | Mount at `CHROMA_PERSIST_DIRECTORY` and `UPLOAD_DIRECTORY` |

---

## Pre-Deployment Checklist

Before deploying to production, verify all of the following.

### Backend

- [ ] `DATABASE_URL` points to the production PostgreSQL database
- [ ] `SECRET_KEY` is a securely generated random string (not the placeholder)
- [ ] `FRONTEND_URL` is set to the production frontend origin
- [ ] `OLLAMA_BASE_URL` points to the production Ollama instance
- [ ] `CHROMA_PERSIST_DIRECTORY` points to a persistent volume path
- [ ] `UPLOAD_DIRECTORY` points to a persistent volume path
- [ ] `backend/.env` is **not committed** to version control (covered by `.gitignore`)
- [ ] Ollama is running and both models are pulled on the host

### Frontend

- [ ] `NEXT_PUBLIC_API_URL` is set to the production backend URL in your hosting dashboard
- [ ] The production Next.js build has been triggered after setting the env var
- [ ] `frontend/.env.local` is **not committed** (covered by `.gitignore`)

### Database

- [ ] Tables have been created (FastAPI creates them automatically on first startup via `Base.metadata.create_all`)
- [ ] At least one admin user has been created via `POST /users/register` with `role: "admin"`

---

## Running Locally After These Changes

```bash
# Terminal 1 — Ollama (if not running as a service)
ollama serve

# Terminal 2 — Backend
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
uvicorn app.main:app --reload

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Open `http://localhost:3000`.

---

## Notes on the Admin Account

The public `POST /users/register` endpoint accepts `role: "admin"`.  
For production, consider removing that capability from the public endpoint and only creating admin accounts directly in the database or through a protected internal route. The current implementation was preserved to match the existing product design.
