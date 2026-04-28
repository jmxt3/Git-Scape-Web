# Git Scape AI

**Understand any GitHub repository in seconds.**

![React](https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?style=for-the-badge&logo=FastAPI&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4.svg?style=for-the-badge&logo=Google-Cloud&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2.svg?style=for-the-badge&logo=Google-Gemini&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white)

---

## 🚀 Overview

Git Scape AI is an open-source platform that instantly generates AI-ready text digests of GitHub codebases, visualizes repository structures with interactive diagrams, and enables contextual AI-powered chat to help you understand, debug, and refactor code. It supports both public and private repositories.

- **AI Code Summaries:** Get concise, AI-generated summaries of any GitHub repo.
- **Interactive Visualizations:** Explore your codebase structure with beautiful, interactive diagrams.
- **AI Chat with Code:** Ask questions about your codebase and get instant, context-aware answers.
- **Privacy First:** All API keys are stored securely in your browser.
- **Real-Time Streaming:** WebSocket-powered digest generation with live progress updates.

---

## 🏗️ Architecture

This is a monorepo containing two independently deployable workspaces:

```
GitScape/
├── web/      # React 19 + TypeScript frontend (Vite, Tailwind CSS, D3)
└── api/      # FastAPI backend (Python, Docker, Google Cloud Run)
```

### How they fit together

```
┌──────────────────────────────────────┐
│              Browser                 │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │   web/  (React 19 + Vite)       │ │
│  │                                 │ │
│  │  • Digest viewer (Markdown)     │ │
│  │  • Interactive D3 diagram       │ │
│  │  • AI Chat (Gemini SDK)         │ │
│  │  • URL → GitHub repo resolver   │ │
│  └──────────┬──────────────────────┘ │
│             │ HTTP / WebSocket        │
└─────────────┼────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   api/  (FastAPI on Cloud Run)      │
│                                     │
│  GET  /converter  → digest (HTTP)   │
│  WS   /ws/converter → streaming     │
│                                     │
│  • Clones & analyzes git repos      │
│  • Rate limiting (SlowAPI)          │
│  • Dockerized, PORT-agnostic        │
└─────────────────────────────────────┘
```

### `web/` — Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite 6 |
| Styling | Tailwind CSS 4 |
| Diagrams | D3.js 7 |
| AI Chat | `@google/genai` (Gemini) |
| Deployment | Docker + Nginx → Cloud Run |

Key components: `App.tsx` (orchestrator), `RepoChat` (AI chat), `Diagram` (interactive D3 tree), `DigestOutput` (Markdown render), `RepoInput` (URL → repo resolver).

### `api/` — Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Runtime | Python 3.12 (managed via `uv`) |
| Rate Limiting | SlowAPI |
| Deployment | Docker → Google Cloud Run |

Key modules: `main.py` (entrypoint + middleware), `app/api.py` (router + CORS), `app/converter.py` (clone & digest logic), `app/config.py` (settings).

---

## 🏁 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (for `web/`)
- [Python 3.12+](https://python.org/) + [`uv`](https://github.com/astral-sh/uv) (for `api/`)
- [Docker](https://www.docker.com/) (optional, for containerized runs)

### Run the Frontend

```bash
cd web
npm install
npm run dev
# → http://localhost:5173
```

Set up your Gemini API key in `web/.env.local`:
```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

### Run the Backend

```bash
cd api
uv venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
uv sync
cp .env.example .env
uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs
```

---

## 🐳 Docker

Both services ship with a `Dockerfile`. Run them independently:

```bash
# Frontend
cd web && docker build -t git_scape_web . && docker run -p 8080:8080 git_scape_web

# Backend
cd api && docker build -t git_scape_api . && docker run -p 8080:8080 git_scape_api
```

For full deployment instructions on **Google Cloud Run**, see the README inside each workspace:
- [`web/README.md`](web/README.md)
- [`api/README.md`](api/README.md)

---

## 🧑‍💻 Contributing

We welcome contributions of all kinds!

1. **Fork** the repository and create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Work inside the relevant workspace (`web/` or `api/`).
3. **Test locally** before opening a PR.
4. **Open a Pull Request** with a clear description of the change.

### Code Style

- **Frontend**: TypeScript + React, Tailwind CSS, ESLint conventions.
- **Backend**: PEP8, [black](https://black.readthedocs.io/) formatting, type hints on all public functions.

---

## 📚 Resources

- [Git Scape AI Website](https://gitscape.ai/)
- [Gemini API Key Docs](https://ai.google.dev/gemini-api/docs/api-key)
- [GitHub PAT Docs](https://github.com/settings/tokens/new?scopes=repo&description=GitRepoDigestAI)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

Created by [João Machete](https://github.com/jmxt3) and contributors.

If you like this project, please ⭐️ the repo and share your feedback!
