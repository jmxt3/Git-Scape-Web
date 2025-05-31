# Git Scape AI

![Git Scape AI Banner](https://gitscape.ai/og-image.png)

**Understand any GitHub repository in seconds.**

---

## 🚀 Overview

Git Scape AI is an open-source tool that instantly generates AI-ready text digests of GitHub codebases, visualizes repository structures with interactive diagrams, and enables contextual AI-powered chat to help you understand, debug, and refactor code. It supports both public and private repositories.

- **AI Code Summaries:** Get concise, AI-generated summaries of any GitHub repo.
- **Interactive Visualizations:** Explore your codebase structure with beautiful, interactive diagrams.
- **AI Chat with Code:** Ask questions about your codebase and get instant, context-aware answers.
- **Privacy First:** All API keys are stored securely in your browser.
- **Backend API:** Integrate with the official [Git Scape API](https://github.com/jmxt3/Git-Scape-API) for advanced repository analysis and automation.

---

## 🏁 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/git-scape-ai.git
cd git-scape-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up API Keys
- **Gemini API Key:**
  - Get your [Gemini API Key](https://ai.google.dev/gemini-api/docs/api-key).
  - Create a `.env.local` file in the project root:
    ```env
    GEMINI_API_KEY=your-gemini-api-key-here
    ```
- **GitHub Personal Access Token (PAT):**
  - [Generate a GitHub PAT](https://github.com/settings/tokens/new?scopes=repo&description=GitRepoDigestAI) (for private repos).
  - You can add it via the app UI (no need to store in `.env`).

### 4. Run the App
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧑‍💻 Contributing

We welcome contributions of all kinds! Here’s how to get started:

1. **Fork the repository** and create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** (see [Project Structure](#project-structure)).
3. **Test locally** (`npm run dev`).
4. **Commit and push** your changes.
5. **Open a Pull Request** with a clear description.

### Code Style
- Uses [TypeScript](https://www.typescriptlang.org/) and [React 19](https://react.dev/).
- Styling via [Tailwind CSS](https://tailwindcss.com/).
- Linting and formatting: please follow the existing code conventions.

---

## 🗂️ Project Structure

```
├── App.tsx                # Main app logic
├── components/            # All React components
├── services/              # API and utility services
├── types.ts               # TypeScript types
├── constants.ts           # App-wide constants
├── index.html             # HTML entry point
├── vite.config.ts         # Vite config
├── ...
```

- **components/**: UI and feature components (modals, diagrams, chat, etc.)
- **services/**: API integrations (GitHub, Gemini)
- **types.ts**: Shared TypeScript types/interfaces
- **constants.ts**: Centralized constants (API endpoints, keys, etc.)

---

## 🛡️ Security & Privacy
- **API keys** are never sent to any server except the official Gemini or GitHub APIs.
- **No tracking**: All analytics are opt-in and anonymized.
- **Open Source**: Review the code, suggest improvements, or fork for your own use!

---

## 🖥️ Backend API

Looking to automate repository analysis, generate digests, or build your own integrations? Check out the official [Git Scape API](https://github.com/jmxt3/Git-Scape-API) — a robust, open-source FastAPI backend that powers Git Scape AI. It supports:

- RESTful endpoints for digest generation
- Real-time progress via WebSockets
- Easy deployment (Docker & Google Cloud Run ready)
- Designed for scalability and security

> **Get started:** [Git Scape API on GitHub](https://github.com/jmxt3/Git-Scape-API)

---

## 📚 Resources
- [Gemini API Key Docs](https://ai.google.dev/gemini-api/docs/api-key)
- [GitHub PAT Docs](https://github.com/settings/tokens/new?scopes=repo&description=GitRepoDigestAI)
- [Git Scape AI Website](https://gitscape.ai/)
- [Git Scape API (Backend)](https://github.com/jmxt3/Git-Scape-API)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

Created by [João Machete](https://github.com/jmxt3) and contributors.

If you like this project, please ⭐️ the repo and share your feedback!
