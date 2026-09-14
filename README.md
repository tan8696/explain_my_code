# Explain My Code (v2.0)

A universal AI-powered code tutor that transforms complex source code into plain-English stories. Built with **Next.js 16**, **FastAPI**, **Google Gemini 2.5 Flash**, and a **Free-Tier Protection Guard**.

---

## Features

- 🌐 **Universal Language Support**: Understand Python, JavaScript, TypeScript, C++, Rust, Go, Java, SQL, HTML, and more.
- 📖 **Plain-English Explanations**: Jargon-free breakdowns designed for beginners and visual learners.
- 📑 **Line-by-Line Breakdown**: Explains the purpose and mechanics of every single line of code.
- 🔀 **Narrative Logic Flow**: Step-by-step story of how data transforms through execution.
- ⚠️ **Bug & Security Scanner**: Detects runtime crashes, division by zero, mutable default arguments, and style warnings with clear fixes.
- 💡 **Core Programming Concepts**: Defines programming concepts (Recursion, Filtering, Data Structures) in plain English.
- 🛡️ **Free-Tier Protection Guard**:
  - Daily credit quota manager (default: 50 requests/day, configurable via `AI_DAILY_CREDIT_LIMIT`).
  - 15 RPM sliding-window rate limiter matching Gemini Free Tier policies.
  - Automatic zero-cost offline heuristic fallback when limits are reached or offline.
- 🔒 **Zero-Retention Code Privacy**: Source code is processed ephemerally in memory and never stored or used to train public models.

---

## Architecture

```
[Browser / Next.js 16 Client]
       │
       │ HTTP / JSON (CORS)
       ▼
[FastAPI Backend (port 8000)]
       │
       ├──► [AICreditManager] ──► Checks daily quota & 15 RPM rate limits
       │         │
       │         ├── (Limit Reached / Quota Exhausted)
       │         │         ▼
       │         │   [Zero-Cost Heuristic Fallback Engine]
       │         │
       │         └── (Within Quota)
       │                   ▼
       │             [Google Gemini 2.5 Flash API]
       │
       ▼
[Structured Response (summary, lineByLine, logic, bugs, concepts, output, credits)]
```

---

## Getting Started

### 1. Backend Setup (`apps/api`)

```bash
cd apps/api
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt  # or: pip install fastapi uvicorn google-genai python-dotenv pydantic

# Create .env from example:
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY from https://aistudio.google.com/

# Start server on port 8000:
uvicorn main:app --port 8000 --reload
```

Run unit tests:
```bash
python -m unittest discover tests
```

### 2. Frontend Setup (`apps/web`)

```bash
cd apps/web
npm install

# Create .env.local from example:
cp .env.example .env.local

# Start dev server on port 3000:
npm run dev

# Build for production:
npm run build
```

---

## Production Deployment

### Deploy Frontend (Vercel / Cloudflare / Netlify)
1. Set Root Directory to `apps/web`.
2. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed FastAPI backend (e.g. `https://api.explainmycode.dev`).
   - `NEXT_PUBLIC_SITE_URL`: Canonical site URL (e.g. `https://explainmycode.dev`).
3. Deploy! Next.js will automatically generate static routes (`/`, `/privacy`, `/terms`, `/_not-found`, `/robots.txt`, `/sitemap.xml`).

### Deploy Backend (Cloud Run / Render / Railway / Fly.io)
1. Build container from `apps/api` or run directly with:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
2. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `AI_DAILY_CREDIT_LIMIT`: Daily free request ceiling (e.g. `50` or `100`).

---

## Legal & Compliance

- [Privacy Policy](/privacy): Explains ephemeral processing and zero code storage.
- [Terms of Service](/terms): Educational use disclaimers and fair use policies.

---

## License

MIT License · Open source for developers and educators.
