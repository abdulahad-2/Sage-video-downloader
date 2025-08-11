# Multi-stage build: build Next.js frontend, then run FastAPI backend

# 1) Build frontend static export
FROM node:20-bullseye AS frontend
WORKDIR /app/frontend

# Only copy the files needed for dependency install first (better cache)
COPY frontend/package*.json ./
RUN npm ci

# Copy rest of the frontend source and build + export to static HTML in out/
COPY frontend ./
RUN npm run build

# 2) Backend runtime
FROM python:3.11-slim AS backend
WORKDIR /app

# Install minimal system deps (curl optional)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install backend deps
COPY backend/requirements.txt backend/requirements.txt
RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel \
    && python -m pip install --no-cache-dir -r backend/requirements.txt

# Copy only necessary backend source to keep image lean
COPY backend ./backend
COPY README.md ./README.md

# Copy static export from frontend to be served by FastAPI at /
COPY --from=frontend /app/frontend/out ./frontend/out

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]


