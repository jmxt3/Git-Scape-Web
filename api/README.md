# Git Scape AI — API

**The FastAPI backend for [Git Scape AI](https://gitscape.ai/).**

![Python](https://img.shields.io/badge/Python-3776AB.svg?style=for-the-badge&logo=Python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?style=for-the-badge&logo=FastAPI&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4.svg?style=for-the-badge&logo=Google-Cloud&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white)

> Part of the [GitScape monorepo](../README.md). See also: [`web/`](../web/README.md).

---

## 🚀 Overview

The `api/` workspace is the backend service that powers Git Scape AI. It clones any public or private GitHub repository, analyzes its structure, and streams a structured Markdown digest back to the client. It exposes both a standard HTTP endpoint and a WebSocket endpoint for real-time progress updates.

### Key Features

- **REST endpoint** — Blocking HTTP digest generation (`GET /converter`).
- **WebSocket endpoint** — Real-time streaming with live progress (`WS /ws/converter`).
- **Rate limiting** — Per-IP throttling via SlowAPI to protect the service.
- **Request timing** — `X-Process-Time-Sec` header on every response for observability.
- **Cloud Run ready** — Listens on the `PORT` env variable, defaults to `8080`.

---

## 🏗️ Architecture

```
api/
├── main.py               # FastAPI entrypoint: middleware, rate limiter, router mounting
├── app/
│   ├── api.py            # App factory (CORS, lifespan), all HTTP & WebSocket routes
│   ├── converter.py      # Core logic: clone → analyze → build digest
│   └── config.py         # Pydantic Settings (env-based configuration)
├── pyproject.toml        # Project metadata & dependencies
├── requirements.txt      # Pinned pip requirements
├── Dockerfile            # Production container (Python + uvicorn)
└── .env.example          # Environment variable template
```

### Request Flow

```
Client
  │
  ├─ GET /converter?repo=...
  │      └─ api.py → converter.py → Markdown digest (JSON response)
  │
  └─ WS /ws/converter?repo=...
         └─ api.py → converter.py → streaming progress + final digest
```

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Language | Python 3.12 |
| Package Manager | [`uv`](https://github.com/astral-sh/uv) |
| ASGI Server | Uvicorn |
| Rate Limiting | SlowAPI |
| Deployment | Docker → Google Cloud Run |

---

## 🏁 Quick Start

### Prerequisites

- Python 3.12+
- [`uv`](https://github.com/astral-sh/uv) — fast Python package manager

**Install `uv`:**
```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# or via pip
pip install uv
```

### 1. Create Environment & Install Dependencies

```bash
cd api
uv venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
uv sync
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env as needed
```

`.env.example` template:
```env
ENVIRONMENT=development
APP_NAME="GitScape API"
APP_DESCRIPTION="The official API for GitScape, a tool for generating digests from any git repositories."
APP_VERSION="0.1.0"
```

### 3. Run the API

```bash
# Development (with hot reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# or
fastapi dev

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Explore the Docs

| Interface | URL |
|---|---|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## 📡 API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check — returns service name & status |
| `GET` | `/converter` | Clone a repo and return a Markdown digest (blocking) |
| `WS` | `/ws/converter` | Real-time streaming digest with live progress events |

All endpoints accept repository parameters as query strings. See `/docs` for full schema.

---

## 🐳 Docker

```bash
# Build
docker build -t git_scape_api .

# Run locally
docker run -d -p 8080:8080 --name git_scape_api_local git_scape_api
# → http://localhost:8080/docs

# Cleanup
docker stop git_scape_api_local && docker rm git_scape_api_local && docker rmi git_scape_api
```

### Deploy to Google Cloud Run

```bash
# 1. Enable required APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# 2. Build & push via Cloud Build
gcloud builds submit \
  --tag REGION-docker.pkg.dev/PROJECT_ID/REPO/git_scape_api:latest .

# 3. Deploy
gcloud run deploy git-scape-api \
  --image REGION-docker.pkg.dev/PROJECT_ID/REPO/git_scape_api:latest \
  --platform managed \
  --region REGION \
  --allow-unauthenticated \
  --project PROJECT_ID
```

> **Cloud Run note:** The container reads the `PORT` env variable injected by Cloud Run and defaults to `8080` if absent. Keep your service stateless — any persistent state should live in Cloud SQL, Firestore, or Cloud Storage.

---

## 🧑‍💻 Contributing

1. Fork the repo and create a feature branch.
2. Make your changes inside `api/`.
3. Ensure code is formatted (`black`) and type-checked.
4. Open a Pull Request with a clear description.
5. For bugs or feature requests, open a [GitHub Issue](https://github.com/jmxt3/Git-Scape-API/issues).

**Code style:** PEP8, `black` formatting, type hints + docstrings on all public functions. Keep API routing (`api.py`) and business logic (`converter.py`) separate.

---

## 📚 Resources

- [Git Scape AI Website](https://gitscape.ai/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [uv Docs](https://docs.astral.sh/uv/)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Git Scape Web (Frontend)](../web/README.md)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

Created by [João Machete](https://github.com/jmxt3) and contributors.

If you like this project, please ⭐️ the repo and share your feedback!
