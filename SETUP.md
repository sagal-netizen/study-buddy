# Local setup (Mistral version)

The AI tutor now uses **Mistral** (not Ollama). You do not need to install Ollama.
(`DEPLOYMENT.md` still describes the old Ollama setup; follow this file instead.)

## 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in the values below
uvicorn app.main:app --port 8000
```
Check it works: open http://127.0.0.1:8000/docs

Values to set in `backend/.env`:
- `MISTRAL_API_KEY` - create one at https://console.mistral.ai
- `DATABASE_URL` - your local Postgres, e.g. `postgresql://user:password@localhost:5432/studybuddy_ai`
- `SECRET_KEY` - run `python -c "import secrets; print(secrets.token_hex(32))"`
- `ADMIN_REGISTRATION_CODE` - any private code you choose

Never commit `.env` (it is git-ignored).

## 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000. It talks to the backend at http://127.0.0.1:8000.

## 3. Re-upload study materials
Mistral embeddings differ from the old Ollama ones, so the old `chroma_data` is
not used. Upload your study materials again so the tutor can search them.
