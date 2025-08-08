from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp

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

@app.post("/download")
async def download_video(video_url: VideoURL):
    url = video_url.url
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'noplaylist': True,
        'extract_flat': True,
        'dump_single_json': True,
        'restrictfilenames': True,
        'quiet': True,
        # 'no_warnings': True,
        # 'ignoreerrors': True,
        # 'simulate': True, # Only simulate, do not download
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            # For YouTube, the direct URL might be within 'formats'
            # For other sites, 'url' might be the direct link or we need to look deeper
            
            # Prioritize direct_url if available, otherwise look for 'url' in formats
            download_link = None
            if 'url' in info:
                download_link = info['url']
            elif 'formats' in info:
                for format_entry in info['formats']:
                    if 'url' in format_entry and format_entry.get('ext') == 'mp4':
                        download_link = format_entry['url']
                        break
            
            if not download_link:
                raise HTTPException(status_code=400, detail="Could not find direct download link.")

            return {"download_url": download_link}
    except yt_dlp.utils.DownloadError as e:
        if "unsupported URL" in str(e):
            raise HTTPException(status_code=400, detail="Unsupported video platform or invalid URL.")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
