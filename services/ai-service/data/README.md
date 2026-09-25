# Data Directory

Place test videos here for processing.

## Download Test Video

```bash
# Install yt-dlp
pip install yt-dlp

# Download video
yt-dlp -f "best[height<=720]" -o "test-video.mp4" "https://www.youtube.com/watch?v=MFUd0B2Y-WU"
```

Or manually download and place `test-video.mp4` in this directory.
