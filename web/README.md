# Git Scape AI — Web

**The React frontend for [Git Scape AI](https://gitscape.ai/).**

![React](https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4.svg?style=for-the-badge&logo=Tailwind-CSS&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=Vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white)

> Part of the [GitScape monorepo](../README.md). See also: [`api/`](../api/README.md).

---

## 🚀 Overview

![GitScape](https://ik.imagekit.io/lmewht1ww/Git%20Scape%20AI/Screenshot_12.png?updatedAt=1748956392835)

The `web/` workspace is the browser-based interface for Git Scape AI. It lets you analyze any public or private GitHub repository, visualize its structure as an interactive diagram, read a Markdown digest, and chat with an AI assistant that has full context of the codebase.

### Key Features

- **AI Code Summaries** — Concise, AI-generated digests of any GitHub repo via the backend API.
- **Interactive Diagram** — D3-powered tree visualization of the repository file structure.
- **AI Chat with Code** — Contextual Q&A powered by the Gemini API directly in the browser.
- **URL Converter** — Transforms a GitHub URL into API-compatible repo parameters.
- **Privacy First** — Your Gemini API key and GitHub PAT are stored only in the browser (never sent to our servers).

---

## 🏗️ Architecture

```
web/
├── App.tsx                 # Root orchestrator — state, routing, data flow
├── index.tsx               # React entry point
├── index.html              # HTML shell (Vite)
├── types.ts                # Shared TypeScript interfaces
├── constants.ts            # API base URLs, config values
├── components/
│   ├── Header.tsx          # Top navigation bar
│   ├── RepoInput.tsx       # GitHub URL input & repo resolver
│   ├── DigestOutput.tsx    # Markdown digest renderer
│   ├── Diagram.tsx         # D3 interactive file-tree diagram
│   ├── DiagramFullscreenModal.tsx
│   ├── OutputTabs.tsx      # Tabs: Digest / Diagram / Chat
│   ├── RepoChat.tsx        # AI chat panel (Gemini)
│   ├── UrlConverter.tsx    # GitHub URL → path converter utility
│   ├── GeminiApiKeyModal.tsx
│   ├── GithubTokenModal.tsx
│   ├── LoadingSpinner.tsx
│   └── diagramUtils.ts     # D3 tree layout helpers
├── services/               # External integrations
│   └── ...                 # GitHub & Gemini API calls
├── public/                 # Static assets
├── vite.config.ts
├── tailwind.config.js
└── Dockerfile              # Nginx-based production container
```

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.7 |
| Bundler | Vite 6 |
| Styling | Tailwind CSS 4 |
| Diagrams | D3.js 7 |
| AI | `@google/genai` (Gemini) |
| Deployment | Docker + Nginx → Google Cloud Run |

---

## 🏁 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the `web/` directory:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

- Get your [Gemini API Key](https://ai.google.dev/gemini-api/docs/api-key).
- Your **GitHub Personal Access Token** (PAT) for private repos can be entered directly in the app UI — no `.env` needed.

### 3. Run the Dev Server

```bash
npm run dev
# → http://localhost:5173
```

### Other Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server (HMR) |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview the production build |

---

## 🐳 Docker

The `web/` container serves the Vite production build via **Nginx** on port `8080`.

```bash
# Build
docker build -t git_scape_web .

# Run locally
docker run -d -p 8080:8080 --name git_scape_web_local git_scape_web
# → http://localhost:8080
```

### Deploy to Google Cloud Run

```bash
# Build & push via Cloud Build
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/REPO/git_scape_web:latest .

# Deploy
gcloud run deploy git-scape-web \
  --image REGION-docker.pkg.dev/PROJECT_ID/REPO/git_scape_web:latest \
  --platform managed \
  --region REGION \
  --allow-unauthenticated \
  --project PROJECT_ID
```

---

## 🛡️ Security & Privacy

- **API keys** are never proxied through any GitScape server — they go directly from your browser to the Gemini or GitHub APIs.
- **No tracking**: Analytical data is opt-in and anonymized.
- **Open Source**: Audit the code, fork it, or self-host it.

---

## 🧑‍💻 Contributing

1. Fork the repo and create a feature branch.
2. Make your changes inside `web/`.
3. Test with `npm run dev`.
4. Commit, push, and open a Pull Request.

**Code style:** TypeScript + React conventions, Tailwind CSS, follow existing patterns.

---

## 📚 Resources

- [Git Scape AI Website](https://gitscape.ai/)
- [Gemini API Key Docs](https://ai.google.dev/gemini-api/docs/api-key)
- [GitHub PAT Docs](https://github.com/settings/tokens/new?scopes=repo&description=GitRepoDigestAI)
- [Git Scape API (Backend)](../api/README.md)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

Created by [João Machete](https://github.com/jmxt3) and contributors.

If you like this project, please ⭐️ the repo and share your feedback!
