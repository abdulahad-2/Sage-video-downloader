from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from pydantic import BaseModel
import os
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
import time
import base64
import shutil
import subprocess
import json
from urllib.parse import urlparse

app = FastAPI()

# CORS configuration
origins = [
    "*"  # Allow all origins for now, restrict in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoURL(BaseModel):
    url: str

"""Filesystem layout
- BASE_DIR is the project root (mounted as /app in Docker)
- downloads are saved under /app/downloads
- templates and static live at /app/templates and /app/static
"""
BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / "downloads"
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Deletion TTL (seconds) for downloaded files
CLEANUP_TTL_SECONDS = int(os.getenv("DOWNLOAD_TTL_SECONDS", "900"))

# Static and templates for the simple UI
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR)) if TEMPLATES_DIR.exists() else None

# Back-compat: single cookies blob (optional)
COOKIES_B64 = os.getenv("COOKIES_B64", "").strip()
if COOKIES_B64:
    try:
        cookies_path = BASE_DIR / "cookies.txt"
        if not cookies_path.exists():
            decoded = base64.b64decode(COOKIES_B64).decode("utf-8", errors="ignore")
            cookies_path.write_text(decoded, encoding="utf-8")
    except Exception:
        pass

# Platform-specific cookies via env (preferred in Render)
COOKIES_ENV_MAP = {
    # "youtube": ("COOKIES_YOUTUBE_B64", BASE_DIR / "cookies_youtube.txt"),
    "instagram": ("COOKIES_INSTAGRAM_B64", BASE_DIR / "cookies_instagram.txt"),
    "facebook": ("COOKIES_FACEBOOK_B64", BASE_DIR / "cookies_facebook.txt"),
    "tiktok": ("COOKIES_TIKTOK_B64", BASE_DIR / "cookies_tiktok.txt"),
}
for _, (env_name, file_path) in COOKIES_ENV_MAP.items():
    b64 = os.getenv(env_name, "").strip()
    if not b64:
        continue
    try:
        decoded = base64.b64decode(b64).decode("utf-8", errors="ignore")
        file_path.write_text(decoded, encoding="utf-8")
    except Exception:
        # best-effort only
        pass

# Serve downloaded files at /files
app.mount("/files", StaticFiles(directory=str(DOWNLOAD_DIR)), name="files")


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/simple")
async def simple_page(request: Request):
    if not templates:
        return JSONResponse({"message": "templates/ not present"})
    return templates.TemplateResponse("index.html", {"request": request})


def _delete_file_after(path_str: str) -> None:
    try:
        p = Path(path_str)
        if p.exists():
            p.unlink()
    except Exception:
        # best-effort only
        pass


def _delayed_delete(path_str: str, delay_seconds: int = 1800) -> None:
    try:
        time.sleep(max(0, delay_seconds))
        _delete_file_after(path_str)
    except Exception:
        pass


def _detect_platform(url: str) -> str | None:
    host = urlparse(url).hostname or ""
    host = host.lower()
    # if any(k in host for k in ["youtube.com", "youtu.be"]):
    #     return "youtube"
    if "instagram.com" in host:
        return "instagram"
    if any(k in host for k in ["facebook.com", "fb.watch"]):
        return "facebook"
    if "tiktok.com" in host:
        return "tiktok"
    return None


def _cookie_path_for(platform: str) -> Path | None:
    mapping = {
        # "youtube": BASE_DIR / "cookies_youtube.txt",
        "instagram": BASE_DIR / "cookies_instagram.txt",
        "facebook": BASE_DIR / "cookies_facebook.txt",
        "tiktok": BASE_DIR / "cookies_tiktok.txt",
    }
    path = mapping.get(platform)
    return path if path and path.exists() else None


def _update_yt_dlp() -> None:
    try:
        subprocess.run(
            ["python", "-m", "pip", "install", "--upgrade", "yt-dlp"],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        pass


# Update yt-dlp in the background during startup
try:
    _update_yt_dlp()
except Exception:
    pass


@app.post("/download", response_class=JSONResponse)
async def download_video(video_url: VideoURL, background_tasks: BackgroundTasks):
    url = video_url.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    platform = _detect_platform(url)
    # choose platform-specific cookies; fall back to legacy cookies.txt if present
    cookie_file = _cookie_path_for(platform) if platform else None
    legacy_cookie = BASE_DIR / "cookies.txt"
    if not cookie_file and legacy_cookie.exists():
        cookie_file = legacy_cookie

    user_agent = (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )

    # Limit filename length to avoid Windows MAX_PATH and excessive titles
    default_limit = 100 if os.name == "nt" else 180
    title_limit = int(os.getenv("OUTPUT_TITLE_LIMIT", str(default_limit)))
    # Use byte-length limiter (.%dB) so multibyte chars are accounted for
    outtmpl = str(DOWNLOAD_DIR / f"%(title).{title_limit}B.%(ext)s")
    cmd: list[str] = [
        "yt-dlp",
        url,
        "--no-playlist",
        "--restrict-filenames",
        "--windows-filenames",
        "--newline",
        "--print-json",
        "-o",
        outtmpl,
        "--add-header",
        f"User-Agent: {user_agent}",
        "--add-header",
        "Accept-Language: en-US,en;q=0.9",
        "--sleep-requests",
        "1",
        "--retries",
        "3",
        "--ignore-config",
    ]
    if cookie_file:
        cmd.extend(["--cookies", str(cookie_file)])
    proxy_url = os.getenv("PROXY_URL")
    if proxy_url:
        cmd.extend(["--proxy", proxy_url])

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False,
        )

        stdout, stderr, code = proc.stdout.strip(), proc.stderr.strip(), proc.returncode

        # Error mapping
        combined = "\n".join([stderr, stdout])
        if code != 0:
            lower = combined.lower()
            if "http error 429" in lower or "too many requests" in lower or "rate limit" in lower:
                raise HTTPException(status_code=429, detail="Rate limited by platform. Try again later or use a new IP.")
            if "login required" in lower or "this video is private" in lower or "sign in" in lower:
                raise HTTPException(status_code=403, detail="Login required. Please update cookies.")
            # otherwise return actual error
            raise HTTPException(status_code=500, detail=combined or "Download failed")

        # Try to locate the last JSON object line for filename info
        parsed_info = None
        for line in stdout.splitlines()[::-1]:
            line = line.strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    parsed_info = json.loads(line)
                    break
                except Exception:
                    continue

        filename = None
        if parsed_info:
            # yt-dlp may put filename under requested_downloads[0]['_filename'] or 'filename'
            try:
                rd = parsed_info.get("requested_downloads") or []
                if rd:
                    filename = rd[0].get("_filename") or rd[0].get("filepath")
            except Exception:
                pass
            if not filename:
                filename = parsed_info.get("filename") or parsed_info.get("_filename")

        final_path = Path(filename) if filename else None
        if not final_path or not final_path.exists():
            # best-effort guess from title/ext
            if parsed_info:
                title = parsed_info.get("title") or "video"
                ext = parsed_info.get("ext") or "mp4"
                guess = DOWNLOAD_DIR / f"{title}.{ext}"
                final_path = guess if guess.exists() else None

        # Schedule auto-deletion regardless of which link is clicked
        if final_path and final_path.exists():
            background_tasks.add_task(_delayed_delete, str(final_path), CLEANUP_TTL_SECONDS)

        response_payload = {
            "download_url": f"/files/{final_path.name}" if final_path and final_path.exists() else None,
            "force_download_url": f"/files-download/{final_path.name}" if final_path and final_path.exists() else None,
            "stdout": stdout,
            "stderr": stderr,
            "platform": platform,
        }
        return JSONResponse(response_payload)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files-download/{filename}")
async def files_download(filename: str, background_tasks: BackgroundTasks):
    # Force a browser download with Content-Disposition
    safe_path = (DOWNLOAD_DIR / filename).resolve()
    if not str(safe_path).startswith(str(DOWNLOAD_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Invalid filename")
    if not safe_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    # Schedule deletion with a delay to support download managers / retries
    background_tasks.add_task(_delayed_delete, str(safe_path), 900)
    return FileResponse(
        path=str(safe_path),
        media_type="application/octet-stream",
        filename=filename,
        headers={"Cache-Control": "no-store"},
        background=background_tasks,
    )

# Serve the built Next.js static site from frontend/out at the root path (if present)
FRONTEND_BUILD_DIR = BASE_DIR / "frontend" / "out"
if FRONTEND_BUILD_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_BUILD_DIR), html=True), name="frontend")