# 🚀 Quick Start: Computer Vision Prototype

This guide will help you get the YOLOv8 + ByteTrack prototype running in 5 minutes.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Python 3.11+ installed
- ✅ PostgreSQL running
- ✅ 8GB+ RAM (16GB recommended)
- ✅ Optional: NVIDIA GPU with CUDA

## Step 1: Start the Database

```bash
# Check if database is running
cd backend
npm run db:check
```

If not running, start PostgreSQL service.

## Step 2: Start the Backend

```bash
cd backend
npm install  # First time only
npm run dev
```

✅ Backend running at: http://localhost:3001

## Step 3: Start the AI Service

```bash
cd services/ai-service

# Create virtual environment (first time only)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --reload --port 8001
```

✅ AI service running at: http://localhost:8001

## Step 4: Start the Frontend

```bash
# In a new terminal
npm run dev
```

✅ Frontend running at: http://localhost:5173

## Step 5: Test the Prototype

1. Open http://localhost:5173/ai-test
2. You should see "AI Test Lab" page
3. Check that "AI Service Status" shows "Online" (green badge)
4. Upload a video file (MP4, AVI, MOV)
5. Click "Run YOLOv8 Tracking"
6. Watch the progress bar
7. View results with bounding boxes and tracking IDs

## 📹 Download Test Video (Optional)

```bash
cd services/ai-service

# Install yt-dlp
pip install yt-dlp

# Download test video
yt-dlp -f "best[height<=720]" -o "data/test-video.mp4" "https://www.youtube.com/watch?v=MFUd0B2Y-WU"
```

Or use any video file with people in it.

## 🧪 Alternative: Command Line Test

```bash
cd services/ai-service
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Run test script
python scripts/test_video.py --video ./data/test-video.mp4
```

Output files will be in `output/` directory:
- `*_tracked.mp4` - Video with bounding boxes
- `*_tracks.json` - Track data
- `*_summary.json` - Processing summary

## ✅ Verification Checklist

- [ ] Backend is running on port 3001
- [ ] AI service is running on port 8001
- [ ] Frontend is running on port 5173
- [ ] AI Test page shows "Online" status
- [ ] Can upload a video
- [ ] Processing starts and shows progress
- [ ] Results display with statistics
- [ ] Can view processed video with bounding boxes
- [ ] Can download track data

## 🐛 Common Issues

### "AI Service is offline"

**Solution**: Make sure the Python AI service is running:
```bash
cd services/ai-service
source .venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

### "Failed to upload video"

**Solution**: Check that both backend and AI service are running.

### Slow processing

**Solution**: 
- Use GPU: Set `AI_DEVICE=cuda` in `.env`
- Use smaller model: Set `YOLO_MODEL=yolov8n.pt`
- Reduce video resolution

### Out of memory

**Solution**:
- Use CPU: Set `AI_DEVICE=cpu` in `.env`
- Close other applications
- Use smaller video file

## 📊 Understanding Results

After processing, you'll see:

**Detection Statistics:**
- Unique Tracks: How many different people were detected
- Max People: Maximum people in frame at once
- Avg People: Average number of people per frame
- Processing FPS: How fast the video was processed

**Track Stability:**
- ID Switches: How many times tracking IDs changed (lower is better)
- Stability Score: 0-100 score (higher is better)
- Rating: Excellent/Good/Fair/Poor

**Visual Output:**
- Bounding boxes around people
- Tracking ID labels (Person #1, #2, etc.)
- Confidence scores
- Color-coded tracks

## 🎯 What's Next?

After testing:

1. **Analyze Results**: Is YOLOv8 good enough for barber shop use?
2. **Check Stability**: Are tracking IDs stable?
3. **Test Performance**: Can it run in real-time?
4. **Evaluate Hardware**: Does it work on your machine?

If results are good, we'll proceed to Phase 2: Chair zone detection.

## 📚 Documentation

- [Full Prototype Guide](COMPUTER_VISION_PROTOTYPE.md)
- [AI Service README](services/ai-service/README.md)
- [Backend README](backend/README.md)

## 🆘 Need Help?

Check the troubleshooting sections in:
- [COMPUTER_VISION_PROTOTYPE.md](COMPUTER_VISION_PROTOTYPE.md#-troubleshooting)
- [services/ai-service/README.md](services/ai-service/README.md#-troubleshooting)

---

**Ready to test computer vision? Let's go! 🚀**
