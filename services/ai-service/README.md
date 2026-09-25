# BarberAI Computer Vision Service

YOLOv8 + ByteTrack person detection and tracking service for the BarberAI application.

## 🎯 Purpose

This service provides computer vision capabilities for detecting and tracking people in video feeds. It's designed to eventually power the barber shop monitoring system, tracking customers from entry to service completion.

**Current Phase**: Testing YOLOv8 feasibility for person detection and tracking.

## 🏗️ Architecture

```
Python FastAPI Service
├── YOLOv8 (Ultralytics) - Object detection
├── ByteTrack - Multi-object tracking
├── OpenCV - Video processing
└── FastAPI - REST API
```

## 📋 Requirements

- Python 3.11+
- 8GB+ RAM (16GB recommended)
- Optional: NVIDIA GPU with CUDA for faster processing

## 🚀 Installation

### 1. Create Virtual Environment

```bash
cd services/ai-service
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` to customize settings:

```env
YOLO_MODEL=yolov8n.pt          # YOLO model (yolov8n.pt, yolov8s.pt, etc.)
YOLO_CONFIDENCE=0.35           # Detection confidence threshold
AI_DEVICE=auto                 # Device: auto, cpu, cuda
AI_OUTPUT_DIR=./output         # Output directory
PORT=8001                      # Service port
```

## 🎬 Running the Service

### Start the API Server

```bash
uvicorn app.main:app --reload --port 8001
```

The service will be available at:
- API: http://localhost:8001
- Docs: http://localhost:8001/docs

### Test with Video File

```bash
python scripts/test_video.py --video ./data/test-video.mp4
```

This will:
1. Process the video with YOLOv8 + ByteTrack
2. Generate output video with bounding boxes
3. Save track data to JSON
4. Display processing statistics

## 📊 API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "model": "yolov8n.pt",
  "device": "auto",
  "cuda_available": true,
  "gpu_name": "NVIDIA GeForce RTX 3060"
}
```

### Process Video

```http
POST /api/detect/video
Content-Type: multipart/form-data

video: <file>
```

Response:
```json
{
  "job_id": "abc123",
  "status": "processing",
  "progress": 0.0
}
```

### Get Job Status

```http
GET /api/detect/jobs/{job_id}
```

Response:
```json
{
  "job_id": "abc123",
  "status": "completed",
  "progress": 100.0,
  "frames_processed": 15432,
  "total_frames": 15432,
  "output_video": "/outputs/abc123.mp4",
  "output_tracks": "/outputs/abc123_tracks.json",
  "stats": {
    "frames_processed": 15432,
    "video_fps": 30.0,
    "processing_fps": 18.4,
    "duration_seconds": 514.4,
    "processing_time_seconds": 837.2,
    "total_unique_tracks": 17,
    "max_simultaneous_people": 6,
    "average_people_per_frame": 3.2
  },
  "stability": {
    "total_tracks": 17,
    "average_duration_seconds": 45.2,
    "average_frames_seen": 1356,
    "total_id_switches": 3,
    "stability_score": 85.5,
    "stability_rating": "Excellent"
  }
}
```

### Download Processed Video

```http
GET /api/detect/jobs/{job_id}/video
```

Returns: MP4 video file with bounding boxes and tracking IDs

### Download Track Data

```http
GET /api/detect/jobs/{job_id}/tracks
```

Returns: JSON file with detailed track information

## 📈 Output Format

### Track Data (tracks.json)

```json
{
  "tracks": [
    {
      "track_id": 1,
      "first_seen": 0.4,
      "last_seen": 38.2,
      "duration": 37.8,
      "frames_seen": 1134,
      "frames_missing": 12,
      "id_switches": 0,
      "longest_continuous_detection": 1134
    }
  ]
}
```

### Video Output

The processed video includes:
- Bounding boxes around detected persons
- Tracking ID labels (Person #1, Person #2, etc.)
- Confidence scores
- Frame counter
- Color-coded tracks (different colors for different IDs)

## 🧪 Testing

### Download Test Video

For initial testing, download the YouTube video:

```bash
# Install yt-dlp
pip install yt-dlp

# Download video
yt-dlp -f "best[height<=720]" -o "data/test-video.mp4" "https://www.youtube.com/watch?v=MFUd0B2Y-WU"
```

Or manually download and place in `data/test-video.mp4`

### Run Test Script

```bash
python scripts/test_video.py --video ./data/test-video.mp4
```

### Expected Results

After processing, you should see:
- Number of unique people tracked
- Tracking stability metrics
- Processing FPS
- Output video with visualizations

## 🐳 Docker

### Build Image

```bash
docker build -t barberai-ai-service .
```

### Run Container

```bash
docker run -p 8001:8001 -v ./output:/app/output barberai-ai-service
```

### Docker Compose

Add to your main `docker-compose.yml`:

```yaml
services:
  ai-service:
    build: ./services/ai-service
    ports:
      - "8001:8001"
    volumes:
      - ./services/ai-service/output:/app/output
    environment:
      - YOLO_MODEL=yolov8n.pt
      - AI_DEVICE=auto
```

## 🔧 Configuration Options

### YOLO Models

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| yolov8n.pt | 6 MB | Fastest | Good | Testing/Prototyping |
| yolov8s.pt | 22 MB | Fast | Better | Production (CPU) |
| yolov8m.pt | 52 MB | Medium | High | Production (GPU) |
| yolov8l.pt | 87 MB | Slow | Very High | High accuracy needed |

### Device Configuration

- `auto`: Automatically select best device (CUDA if available, else CPU)
- `cpu`: Force CPU processing
- `cuda`: Force CUDA GPU processing

### Confidence Threshold

- Lower (0.25): More detections, more false positives
- Higher (0.50): Fewer detections, fewer false positives
- Recommended: 0.35 for barber shop environment

## 📊 Performance Metrics

### What We're Measuring

1. **Detection Accuracy**: Can YOLOv8 detect all visible people?
2. **Tracking Stability**: Do tracking IDs remain consistent?
3. **Processing Speed**: What FPS can we achieve?
4. **Hardware Requirements**: Can it run on 16GB RAM?
5. **Occlusion Handling**: What happens when people overlap?

### Success Criteria

- ✅ Detect >90% of visible people
- ✅ Maintain tracking IDs with <5% switches
- ✅ Process at >15 FPS on CPU (or >30 FPS on GPU)
- ✅ Run on 16GB RAM without issues
- ✅ Handle 3-5 second occlusions gracefully

## 🚧 Current Limitations

- Only detects "person" class (no barber/customer distinction)
- No chair zone detection yet
- No service recognition
- No facial recognition
- In-memory job storage (not persistent)

## 🔮 Future Enhancements

### Phase 2: Chair Zone Detection
- Define polygon zones for each chair
- Track when people enter/leave zones
- Associate tracks with chairs

### Phase 3: Service Recognition
- Detect barber tools (clippers, scissors)
- Classify service types
- Track service duration

### Phase 4: Customer Identification
- Facial recognition (optional)
- Customer check-in/check-out
- Service history tracking

## 📝 Development Notes

### Project Structure

```
services/ai-service/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── api/
│   │   ├── health.py        # Health endpoint
│   │   └── detection.py     # Detection endpoints
│   ├── services/
│   │   ├── yolo_service.py      # YOLO detection
│   │   ├── video_service.py     # Video processing
│   │   └── tracking_service.py  # Track analysis
│   └── schemas/
│       └── detection.py     # Pydantic models
├── scripts/
│   └── test_video.py        # Test script
├── requirements.txt
├── Dockerfile
└── README.md
```

### Key Dependencies

- **ultralytics**: YOLOv8 implementation
- **opencv-python**: Video processing
- **fastapi**: REST API framework
- **pydantic**: Data validation

## 🐛 Troubleshooting

### CUDA Out of Memory

```env
AI_DEVICE=cpu
```

Or use a smaller model:

```env
YOLO_MODEL=yolov8n.pt
```

### Slow Processing

- Use GPU if available
- Reduce video resolution
- Use smaller YOLO model
- Increase confidence threshold

### Tracking ID Switches

- Increase confidence threshold
- Ensure good lighting in video
- Check for occlusions
- Try different tracker settings

## 📚 Resources

- [Ultralytics YOLOv8 Documentation](https://docs.ultralytics.com/)
- [ByteTrack Paper](https://arxiv.org/abs/2110.06864)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 📄 License

Part of the BarberAI project.
