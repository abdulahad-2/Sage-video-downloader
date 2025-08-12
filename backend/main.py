from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import yt_dlp
import os
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
import uuid
import time
import base64
import shutil

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

# Ensure download directory exists and mount it for static serving
BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / "downloads"
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# If cookies are provided via env, write them once to cookies.txt
COOKIES_B64 = os.getenv("COOKIES_B64", "").strip()
if COOKIES_B64:
    try:
        cookies_path = BASE_DIR / "cookies.txt"
        if not cookies_path.exists():
            decoded = base64.b64decode(COOKIES_B64).decode("utf-8", errors="ignore")
            cookies_path.write_text(decoded, encoding="utf-8")
    except Exception:
        # best-effort only; proceed without cookies
        pass

# Serve downloaded files at /files
app.mount("/files", StaticFiles(directory=str(DOWNLOAD_DIR)), name="files")


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


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


@app.post("/download", response_class=JSONResponse)
async def download_video(video_url: VideoURL, background_tasks: BackgroundTasks):
    url = video_url.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    # Optional cookies support (e.g., age-gated/region-limited)
    cookies_path = BASE_DIR / "cookies.txt"
    use_cookies = cookies_path.exists()

    # Base options shared for info extraction and for downloading
    base_opts = {
        "noplaylist": True,
        "restrictfilenames": True,
        "quiet": True,
        "outtmpl": str(DOWNLOAD_DIR / "%(title).200B.%(ext)s"),
        # Set a modern user agent and headers to improve compatibility
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        },
        # Do not read user/global yt-dlp config files that may set merging formats
        "ignoreconfig": True,
    }

    if use_cookies:
        base_opts["cookiefile"] = str(cookies_path)

    try:
        # Extract formats and pick a single progressive format (no download)
        # Add resiliency and optional proxy
        proxy_url = os.getenv("PROXY_URL")
        base_opts.update({
            "retries": 3,
            "socket_timeout": 20,
        })
        if proxy_url:
            base_opts["proxy"] = proxy_url

        with yt_dlp.YoutubeDL(base_opts) as ydl_info:
            info = ydl_info.extract_info(url, download=False)
            # If it's a playlist despite noplaylist, pick the first entry
            if info.get("_type") == "playlist" and info.get("entries"):
                info = info["entries"][0]

            formats = info.get("formats") or []
            ffmpeg_available = shutil.which("ffmpeg") is not None
            chosen = None
            if not ffmpeg_available:
                # Without ffmpeg, require a progressive container
                progressive: list[dict] = []
                for f in formats:
                    if f.get("acodec") == "none" or f.get("vcodec") == "none":
                        continue
                    protocol = f.get("protocol") or ""
                    if protocol.startswith("m3u8") or protocol == "http_dash_segments":
                        continue
                    progressive.append(f)

                if not progressive:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "No direct file format available. Please try a different link."
                        ),
                    )

                def quality_key(f: dict):
                    height = f.get("height") or 0
                    ext = f.get("ext") or ""
                    tbr = f.get("tbr") or 0
                    mp4_pref = 1 if ext == "mp4" else 0
                    capped_height = min(height, 720)
                    return (mp4_pref, capped_height, tbr)

                progressive.sort(key=quality_key, reverse=True)
                chosen = progressive[0]

            # Download exactly the chosen progressive format to our downloads folder
            ydl_opts = dict(base_opts)
            # Light rate-limiting to reduce 429s
            ydl_opts["sleep_interval_requests"] = 1.0
            if shutil.which("ffmpeg") is not None:
                # Allow best video+audio and merge to mp4 when ffmpeg is available
                ydl_opts["format"] = "bv*+ba/b"
                ydl_opts["merge_output_format"] = "mp4"
            else:
                ydl_opts["format"] = str(chosen.get("format_id"))
            # Use a randomized, non-identifying filename to avoid leaking video identity
            random_name_template = f"{uuid.uuid4().hex}.%(ext)s"
            ydl_opts["outtmpl"] = str(DOWNLOAD_DIR / random_name_template)

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            final_path = Path(filename)
            if not final_path.exists():
                # Try with resolved ext
                ext = info.get("ext") or chosen.get("ext") or "mp4"
                alt = DOWNLOAD_DIR / f"{info.get('title','video')}.{ext}"
                if alt.exists():
                    final_path = alt

            if not final_path.exists():
                raise HTTPException(status_code=500, detail="Download finished but file not found.")

            return {
                # Keep response minimal to avoid storing/echoing video identity server-side
                "download_url": f"/files/{final_path.name}",
                "force_download_url": f"/files-download/{final_path.name}",
            }
    except yt_dlp.utils.DownloadError as e:
        message = str(e)
        if "Unsupported URL" in message or "unsupported URL" in message:
            raise HTTPException(status_code=400, detail="Unsupported platform or invalid URL.")
        # Do not echo potentially identifying error details back to the client
        raise HTTPException(status_code=500, detail="Failed to process the link. Please try another.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

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

# Serve the built Next.js static site from frontend/out at the root path
# This should be defined after API routes so API endpoints keep precedence
FRONTEND_BUILD_DIR = BASE_DIR / "frontend" / "out"
if FRONTEND_BUILD_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_BUILD_DIR), html=True), name="frontend")