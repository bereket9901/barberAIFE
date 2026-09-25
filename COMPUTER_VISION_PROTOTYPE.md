# BarberAI Computer Vision Prototype

This document describes the computer vision prototype implementation for BarberAI.

## 🎯 Overview

This prototype implements YOLOv8 + ByteTrack for person detection and tracking in video feeds. It's designed to eventually power the barber shop monitoring system.

**Current Phase**: Testing YOLOv8 feasibility for person detection and tracking.

## 🏗️ Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP
Backend (Node.js/Express)
    ↓ HTTP
Python AI Service (FastAPI)
    ↓
YOLOv8 + ByteTrack + OpenCV
    ↓
Video Processing
```

## 📁 Project Structure

```
barberai/
├── services/
│   └── ai-service/              # Python AI Service
│       ├── app/
│       │   ├── main.py          # FastAPI application
│       │   ├── config.py        # Configuration
│       │   ├── api/
│       │   │   ├── health.py    # Health endpoint
│       │   │   └── detection.py # Detection endpoints
│       │   ├── services/
│       │   │   ├── yolo_service.py      # YOLO detection
│       │   │   ├── video_service.py     # Video processing
│       │   │   └── tracking_service.py  # Track analysis
│       │   └── schemas/
│       │       └── detection.py # Pydantic models
│       ├── scripts/
│       │   └── test_video.py    # Test script
│       ├── requirements.txt
│       ├── Dockerfile
│       └── README.md
│
├── backend/                     # Node.js Backend
│   └── src/
│       ├── controllers/
│       │   └── cvController.js  # CV integration
│       └── routes/
│           └── cv.js            # CV routes
│
└── src/                         # Frontend
    └── components/
        └── AITestPage.tsx       # AI test page
```

## 🚀 Quick Start

### 1. Start PostgreSQL Database

```bash
# Make sure PostgreSQL is running
npm run db:check
```

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend will be available at: http://localhost:3001

### 3. Start Python AI Service

```bash
cd services/ai-service

# Create virtual environment (first time only)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app.main:app --reload --port 8001
```

AI service will be available at: http://localhost:8001

### 4. Start Frontend

```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

### 5. Open AI Test Page

Navigate to: http://localhost:5173/ai-test

## 🧪 Testing the Prototype

### Option 1: Using the Web Interface

1. Open http://localhost:5173/ai-test
2. Upload a video file (MP4, AVI, MOV)
3. Click "Run YOLOv8 Tracking"
4. Watch the processing progress
5. View results with bounding boxes and tracking IDs
6. Download processed video and track data

### Option 2: Using the Test Script

```bash
cd services/ai-service

# Download test video (optional)
yt-dlp -f "best[height<=720]" -o "data/test-video.mp4" "https://www.youtube.com/watch?v=MFUd0B2Y-WU"

# Run test
python scripts/test_video.py --video ./data/test-video.mp4
```

Output files:
- `output/test-video_tracked.mp4` - Video with bounding boxes
- `output/test-video_tracks.json` - Track data
- `output/test-video_summary.json` - Processing summary

## 📊 What We're Testing

### Detection Capabilities
- Can YOLOv8 detect all visible people?
- How does it handle different lighting conditions?
- What's the detection accuracy?

### Tracking Stability
- Do tracking IDs remain consistent?
- How many ID switches occur?
- Can it handle occlusions?

### Performance
- What FPS can we achieve?
- Can it run on 16GB RAM?
- CPU vs GPU performance?

### Business Applicability
- Can we track customers from entry to exit?
- Can we associate people with chairs?
- Is the tracking stable enough for billing?

## 📈 Expected Results

After processing a video, you'll see:

### Statistics
- **Unique Tracks**: Number of different people detected
- **Max Simultaneous People**: Maximum people in frame at once
- **Average People per Frame**: Average occupancy
- **Processing FPS**: Frames processed per second

### Track Stability
- **ID Switches**: Number of times tracking ID changed
- **Stability Score**: 0-100 score (higher is better)
- **Rating**: Excellent/Good/Fair/Poor
- **Average Duration**: How long tracks last

### Visual Output
- Bounding boxes around detected persons
- Tracking ID labels (Person #1, Person #2, etc.)
- Confidence scores
- Color-coded tracks

## 🔧 Configuration

### AI Service (.env)

```env
YOLO_MODEL=yolov8n.pt          # Model size (n=small, s=medium, m=large)
YOLO_CONFIDENCE=0.35           # Detection threshold
AI_DEVICE=auto                 # auto, cpu, cuda
AI_OUTPUT_DIR=./output         # Output directory
PORT=8001                      # Service port
```

### Backend (.env)

```env
AI_SERVICE_URL=http://localhost:8001
```

## 🐛 Troubleshooting

### AI Service Offline

**Problem**: Frontend shows "AI Service is offline"

**Solution**:
```bash
cd services/ai-service
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8001
```

### CUDA Out of Memory

**Problem**: GPU runs out of memory

**Solution**:
```env
AI_DEVICE=cpu
# or use smaller model
YOLO_MODEL=yolov8n.pt
```

### Slow Processing

**Problem**: Processing is very slow

**Solutions**:
1. Use GPU if available: `AI_DEVICE=cuda`
2. Use smaller model: `YOLO_MODEL=yolov8n.pt`
3. Reduce video resolution
4. Increase confidence threshold: `YOLO_CONFIDENCE=0.50`

### Tracking ID Switches

**Problem**: Too many ID switches

**Solutions**:
1. Increase confidence threshold
2. Ensure good lighting in video
3. Check for occlusions
4. Try different tracker settings

## 📚 API Endpoints

### AI Service (Python)

```
GET  /health                      # Health check
POST /api/detect/video            # Upload video for processing
GET  /api/detect/jobs/{jobId}     # Get job status
GET  /api/detect/jobs/{jobId}/video  # Download processed video
GET  /api/detect/jobs/{jobId}/tracks # Download track data
```

### Backend (Node.js)

```
GET  /api/cv/health               # Check AI service health
POST /api/cv/video-test           # Upload video (proxies to AI service)
GET  /api/cv/video-test/{jobId}   # Get job status
GET  /api/cv/video-test/{jobId}/video  # Download processed video
GET  /api/cv/video-test/{jobId}/tracks # Download track data
```

## 🎯 Success Criteria

- ✅ Detect >90% of visible people
- ✅ Maintain tracking IDs with <5% switches
- ✅ Process at >15 FPS on CPU (or >30 FPS on GPU)
- ✅ Run on 16GB RAM without issues
- ✅ Handle 3-5 second occlusions gracefully

## 🔮 Next Steps

After evaluating YOLOv8 results:

### Phase 2: Chair Zone Detection
- Define polygon zones for each chair
- Track when people enter/leave zones
- Associate tracks with chairs

### Phase 3: Service Recognition
- Detect barber tools (clippers, scissors)
- Classify service types
- Track service duration

### Phase 4: Integration
- Connect to barber shop workflow
- Automatic billing
- Customer identification

## 📖 Additional Resources

- [AI Service README](services/ai-service/README.md)
- [Ultralytics YOLOv8 Docs](https://docs.ultralytics.com/)
- [ByteTrack Paper](https://arxiv.org/abs/2110.06864)

## 📝 Notes

- This is a **prototype** for testing YOLOv8 feasibility
- Not yet integrated with barber shop business logic
- No facial recognition or customer identification yet
- Focus is on person detection and tracking stability
- Results will determine if we proceed to Phase 2

---

**Built for BarberAI - AI-Powered Barber Shop Management**
