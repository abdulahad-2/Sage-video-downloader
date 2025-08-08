# Multi-Platform Video Downloader

This project provides a web-based video downloader for YouTube, Instagram, Facebook, and TikTok.

## Project Structure

- `frontend/`: Next.js application (React, TailwindCSS)
- `backend/`: FastAPI application (Python, yt-dlp)

## Local Development

### Backend

**Prerequisites:** Python 3.8+

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be accessible at `http://127.0.0.1:8000`.

### Frontend

**Prerequisites:** Node.js 18+

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:3000`.

## Deployment

### Backend (Render)

1. Sign up or log in to [Render](https://render.com/).
2. Click "New Web Service" and connect your GitHub repository.
3. Configure the service:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3
4. Ensure the `PORT` environment variable is set by Render automatically.
5. Click "Create Web Service". Render will automatically deploy your backend.
6. Note down the public URL provided by Render; you'll need it for the frontend.

### Frontend (Vercel)

1. Sign up or log in to [Vercel](https://vercel.com/).
2. Click "New Project" and import your GitHub repository.
3. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
4. Add an environment variable:
   - **Name:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** The public URL of your deployed Render backend (e.g., `https://your-backend-app.onrender.com`)
5. Click "Deploy". Vercel will build and deploy your Next.js application.
