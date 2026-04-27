# Dockerfile
# This file describes how to build the Docker image for your FastAPI application.

FROM python:3.10-slim

# Install system dependencies and clean up
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl ca-certificates gcc python3-dev git && \
    rm -rf /var/lib/apt/lists/*

# Install uv
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock /app/

# Install Python dependencies
RUN uv sync --frozen --no-install-project

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 8080

# (Optional) Use a non-root user for security
# RUN useradd -m appuser && chown -R appuser /app
# USER appuser

# Use ENTRYPOINT for flexibility
ENTRYPOINT ["sh", "-c", "uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]

# Optional health check
HEALTHCHECK CMD curl --fail http://localhost:8080/ || exit 1
