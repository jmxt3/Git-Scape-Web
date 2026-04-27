# GitScape API

![Python](https://img.shields.io/badge/Python-3776AB.svg?style=for-the-badge&logo=Python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?style=for-the-badge&logo=FastAPI&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4.svg?style=for-the-badge&logo=Google-Cloud&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624.svg?style=for-the-badge&logo=Linux&logoColor=black)

---

## Project Overview

GitScape API is the official backend for [GitScape](https://gitscape.ai/), a platform for generating structured digests and summaries from any git repository. This API powers the [GitScape Web](https://github.com/jmxt3/Git-Scape-Web) frontend and is designed for extensibility, performance, and ease of deployment (notably on Google Cloud Run).

- **Main repo:** https://github.com/jmxt3/Git-Scape-Web
- **Live site:** https://gitscape.ai/

## Architecture & Project Structure

- `main.py` – FastAPI entrypoint, defines API and WebSocket endpoints.
- `converter.py` – Core logic for cloning, analyzing, and digesting git repositories.
- `app/` – Application package:
  - `api.py` – FastAPI app factory and CORS setup.
  - `config.py` – Environment and settings management.
- `requirements.txt` / `pyproject.toml` – Python dependencies.
- `Dockerfile` – Containerization for deployment.
- `.env.example` – Example environment configuration.

## API Overview

- `GET /` – Health check and welcome message.
- `GET /converter` – Clone a git repo and return a Markdown digest (blocking HTTP).
- `WS /ws/converter` – WebSocket endpoint for real-time progress and digest streaming.

See the [OpenAPI docs](http://localhost:8000/docs) when running locally for full details.

## Getting Started (Development Setup)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/jmxt3/Git-Scape-API.git
   cd Git-Scape-API
   ```
2. **Install [uv](https://github.com/astral-sh/uv) (Python package manager):**
   - On macOS and Linux:
     ```bash
     curl -LsSf https://astral.sh/uv/install.sh | sh
     ```
   - Or with pip (if you already have Python):
     ```bash
     pip install uv
     # or
     pipx install uv
     ```
   - See [uv installation docs](https://docs.astral.sh/uv/getting-started/installation/) for more options.

3. **(Optional) Install Python with uv:**
   - If you don't have Python 3.10+ installed, you can let uv manage it:
     ```bash
     uv python install 3.10
     # or for the latest version:
     uv python install
     ```
   - uv will automatically use your system Python if available, or install as needed.

4. **Create a virtual environment and install dependencies:**
   ```bash
   uv venv
   source .venv/bin/activate
   uv sync
   ```

5. **Copy environment config:**
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```
6. **Run the API locally:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   # or
   fastapi dev
   ```
7. **Access docs:**
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Testing

*Tests are not yet included. PRs for test coverage are welcome!*

## Code Style & Conventions

- Follow [PEP8](https://www.python.org/dev/peps/pep-0008/) and use [black](https://black.readthedocs.io/) for formatting.
- Use type hints and docstrings for all public functions.
- Keep API endpoints and business logic separated (see `main.py` vs `converter.py`).

## How to Contribute

1. Fork this repo and create a feature branch.
2. Make your changes with clear commit messages.
3. Ensure your code is formatted and type-checked.
4. Open a pull request with a clear description.
5. For bugs or feature requests, open a [GitHub Issue](https://github.com/jmxt3/Git-Scape-API/issues).

## Community & Support

- Main web repo: https://github.com/jmxt3/Git-Scape-Web
- Website: https://gitscape.ai/
- Issues: https://github.com/jmxt3/Git-Scape-API/issues

---

## Quick Commands

<!-- dev -->
fastapi dev
or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

<!-- production -->
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

## Docker Commands
docker ps
docker build -t git_scape_api .
docker images
docker run -d -p 8080:8080 --name git_scape_container git_scape_api

docker stop git_scape_container
docker rm git_scape_container
docker rmi git_scape_api

## Features

- RESTful API with CRUD operations
- Interactive API documentation with Swagger UI
- Health check endpoint for monitoring
- Docker containerization for Cloud Run deployment
- Environment variable configuration

## Deployment Notes for Google Cloud Run:

These are general steps you would follow to deploy this application to Google Cloud Run. You'll need `gcloud` CLI installed and configured.

1.  **Enable APIs:**
    * Ensure the Cloud Run API and Artifact Registry API (or Container Registry API) are enabled for your Google Cloud project.
    ```bash
    gcloud services enable run.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
    ```

2.  **Authenticate gcloud:**
    * If you haven't already, authenticate the `gcloud` CLI:
    ```bash
    gcloud auth login
    gcloud auth configure-docker
    ```
    (You might need to specify a region for Docker, e.g., `gcloud auth configure-docker us-central1-docker.pkg.dev`)

3.  **Set Project ID:**
    * Set your current project (replace `YOUR_PROJECT_ID`):
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```

4.  **Build the Docker Image:**
    * Navigate to the directory containing `main.py`, `Dockerfile`, and `requirements.txt`.
    * Build the image using Cloud Build (recommended) or locally with Docker.
        * **Using Cloud Build (builds in the cloud and pushes to Artifact Registry):**
            Replace `YOUR_REGION`, `YOUR_PROJECT_ID`, and `YOUR_IMAGE_NAME`.
            ```bash
            gcloud builds submit --tag YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/REPOSITORY_NAME/YOUR_IMAGE_NAME:latest .
            ```
            (If you don't have an Artifact Registry repository, you'll need to create one first: `gcloud artifacts repositories create REPOSITORY_NAME --repository-format=docker --location=YOUR_REGION`)

        * **Building locally with Docker (then push):**
            ```bash
            docker build -t YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/REPOSITORY_NAME/YOUR_IMAGE_NAME:latest .
            docker push YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/REPOSITORY_NAME/YOUR_IMAGE_NAME:latest
            ```

5.  **Deploy to Cloud Run:**
    * Deploy the container image to Cloud Run. Replace placeholders.
    ```bash
    gcloud run deploy YOUR_SERVICE_NAME \
        --image YOUR_REGION-docker.pkg.dev/YOUR_PROJECT_ID/REPOSITORY_NAME/YOUR_IMAGE_NAME:latest \
        --platform managed \
        --region YOUR_DEPLOY_REGION \
        --allow-unauthenticated \
        --project YOUR_PROJECT_ID
    ```
    * `YOUR_SERVICE_NAME`: A name for your Cloud Run service (e.g., `my-fastapi-app`).
    * `YOUR_DEPLOY_REGION`: The region where you want to deploy (e.g., `us-central1`).
    * `--allow-unauthenticated`: Makes the service publicly accessible. Remove this if you want to manage access via IAM.

6.  **Access Your Service:**
    * After deployment, Cloud Run will provide a URL for your service. You can access your FastAPI app at that URL.

**Important Considerations for Cloud Run:**
* **PORT Environment Variable:** Cloud Run sets a `PORT` environment variable that your application must listen on. The `Dockerfile`'s `CMD` handles this by using `${PORT:-8080}`, which means it will use the `PORT` variable if set, or default to `8080` otherwise.
* **Statelessness:** Cloud Run services should be stateless. Any persistent state should be stored in external services like Cloud SQL, Firestore, or Cloud Storage.
* **Concurrency:** Configure concurrency settings based on your application's needs.
* **Logging & Monitoring:** Cloud Run integrates with Cloud Logging and Cloud Monitoring. Standard output (`print` statements, logging libraries) will be captured.

## 📚 Resources
- [Gemini API Key Docs](https://ai.google.dev/gemini-api/docs/api-key)
- [GitHub PAT Docs](https://github.com/settings/tokens/new?scopes=repo&description=GitRepoDigestAI)
- [Git Scape AI Website](https://gitscape.ai/)
- [Git Scape WEB (Frontend)](https://github.com/jmxt3/Git-Scape-Web)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

Created by [João Machete](https://github.com/jmxt3) and contributors.

If you like this project, please ⭐️ the repo and share your feedback!
