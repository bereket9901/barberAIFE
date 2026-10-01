# 🎬 Large Video Upload Guide

## Issue: Large Video Upload Timeout

When uploading videos larger than ~50MB, you may encounter timeout errors. This is expected behavior due to network and processing limitations.

## What Was Fixed

The timeout limits have been increased:
- **Frontend**: 5 minutes (300,000ms)
- **Backend**: 5 minutes (300,000ms)
- **Max file size**: 500MB

## Recommended Video Sizes

### ✅ Works Well (Fast Upload)
- **< 50MB**: Instant upload, no issues
- **50-100MB**: 1-2 minutes upload time
- **100-200MB**: 2-5 minutes upload time

### ⚠️ May Timeout (Slow Connection)
- **200-500MB**: 5-15 minutes upload time
- **> 500MB**: Not recommended, will likely timeout

## Solutions for Large Videos

### Option 1: Compress the Video (Recommended)

Use FFmpeg to reduce file size while maintaining quality:

```bash
# Install FFmpeg (if not installed)
# Windows: Download from https://ffmpeg.org/download.html
# Mac: brew install ffmpeg
# Linux: sudo apt install ffmpeg

# Compress video (reduces size by 50-70%)
ffmpeg -i input.mp4 -vcodec h264 -crf 28 -acodec aac output.mp4

# Reduce resolution (720p is usually sufficient)
ffmpeg -i input.mp4 -vf scale=1280:720 -vcodec h264 -crf 28 output.mp4

# Reduce frame rate (30fps → 15fps)
ffmpeg -i input.mp4 -r 15 -vcodec h264 -crf 28 output.mp4
```

### Option 2: Split Long Videos

For very long videos (27+ minutes), split into shorter segments:

```bash
# Split into 5-minute segments
ffmpeg -i long_video.mp4 -c copy -map 0 -segment_time 300 -f segment output_%03d.mp4

# This creates: output_000.mp4, output_001.mp4, etc.
```

Then upload each segment separately.

### Option 3: Use Local Test Script

For very large videos, bypass the web interface and use the Python test script:

```bash
cd services/ai-service
source .venv/Scripts/activate  # Windows
# or: source .venv/bin/activate  # Mac/Linux

python scripts/test_video.py --video path/to/large_video.mp4
```

This processes the video directly without HTTP upload limitations.

## Expected Processing Times

### Small Videos (< 50MB, < 5 minutes)
- **Upload**: 10-30 seconds
- **Processing**: 1-3 minutes
- **Total**: 2-4 minutes

### Medium Videos (50-200MB, 5-20 minutes)
- **Upload**: 1-5 minutes
- **Processing**: 5-15 minutes
- **Total**: 6-20 minutes

### Large Videos (200-500MB, 20-60 minutes)
- **Upload**: 5-15 minutes
- **Processing**: 15-60 minutes
- **Total**: 20-75 minutes

## Performance Factors

### Upload Speed
- **Local network**: Fast (10-50 MB/s)
- **Wi-Fi**: Medium (5-20 MB/s)
- **Internet**: Slow (1-5 MB/s)

### Processing Speed
- **GPU (CUDA)**: 20-30 FPS
- **CPU (modern)**: 10-15 FPS
- **CPU (older)**: 5-10 FPS

### Example Calculation
For a 27-minute video at 30 FPS:
- Total frames: 27 × 60 × 30 = 48,600 frames
- CPU processing (15 FPS): 48,600 / 15 = 3,240 seconds = 54 minutes
- GPU processing (25 FPS): 48,600 / 25 = 1,944 seconds = 32 minutes

## Troubleshooting

### "Upload timed out"
**Cause**: File too large or slow connection  
**Solution**: 
- Compress the video
- Use local test script
- Try a smaller video

### "File is too large"
**Cause**: File exceeds 500MB limit  
**Solution**: 
- Compress the video
- Split into segments

### "AI service is not available"
**Cause**: Python AI service not running  
**Solution**: 
```bash
cd services/ai-service
uvicorn app.main:app --reload --port 8001
```

### Processing is very slow
**Cause**: Using CPU instead of GPU  
**Solution**: 
- Install CUDA-enabled PyTorch
- Update `.env`: `AI_DEVICE=cuda`
- Or accept slower processing

## Best Practices

### For Testing
1. Start with small videos (< 50MB)
2. Verify everything works
3. Gradually increase size
4. Monitor processing time

### For Production
1. Compress all videos before upload
2. Use 720p resolution (sufficient for person detection)
3. Use 15-30 FPS (30 FPS is usually overkill)
4. Consider GPU acceleration for large videos

### For Development
1. Use local test script for large files
2. Test with various video sizes
3. Monitor memory usage
4. Check processing FPS

## Alternative: Direct File Processing

For very large videos or batch processing, use the Python script directly:

```bash
cd services/ai-service

# Activate virtual environment
.venv/Scripts/activate  # Windows
# or: source .venv/bin/activate  # Mac/Linux

# Process video directly
python scripts/test_video.py --video path/to/video.mp4

# Results will be in:
# - output/video_tracked.mp4 (processed video)
# - output/video_tracks.json (tracking data)
# - output/video_summary.json (statistics)
```

## Memory Considerations

### RAM Usage
- **Small videos**: 2-4 GB
- **Medium videos**: 4-8 GB
- **Large videos**: 8-16 GB

### Recommendations
- **Minimum**: 8 GB RAM
- **Recommended**: 16 GB RAM
- **For large videos**: 32 GB RAM

## GPU Acceleration

If you have an NVIDIA GPU, you can significantly speed up processing:

### Install CUDA PyTorch
```bash
pip uninstall torch torchvision torchaudio -y
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Configure AI Service
Edit `services/ai-service/.env`:
```env
AI_DEVICE=cuda
```

### Expected Speedup
- **CPU**: 10-15 FPS
- **GPU**: 25-40 FPS
- **Speedup**: 2-3x faster

## Summary

| Video Size | Upload Time | Processing Time | Recommendation |
|------------|-------------|-----------------|----------------|
| < 50MB | < 30s | 1-3 min | ✅ Use web interface |
| 50-200MB | 1-5 min | 5-15 min | ✅ Use web interface |
| 200-500MB | 5-15 min | 15-60 min | ⚠️ Compress first |
| > 500MB | 15+ min | 60+ min | ❌ Use local script |

## Need Help?

If you're still having issues:
1. Check the troubleshooting guide: `services/ai-service/TROUBLESHOOTING.md`
2. Review the quick start: `CV_QUICKSTART.md`
3. Check system requirements: `COMPUTER_VISION_PROTOTYPE.md`

---

**TL;DR**: For your 110MB video, it should work now with the increased timeout. If it still fails, compress it with FFmpeg or use the local test script.
