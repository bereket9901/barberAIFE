# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## Issue 1: PyTorch 2.6+ Model Loading Error

### Error Message
```
_pickle.UnpicklingError: Weights only load failed. This file can still be loaded...
WeightsUnpickler error: Unsupported global: GLOBAL ultralytics.nn.tasks.DetectionModel
```

### Cause
PyTorch 2.6+ changed the default behavior of `torch.load()` to use `weights_only=True` for security reasons. This breaks compatibility with YOLOv8 model files that contain custom classes.

### Solutions

#### Solution 1: Run the Fix Script (Recommended)
```bash
cd services/ai-service
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
python scripts/fix_pytorch.py
```

This will automatically downgrade PyTorch to version 2.5.1, which is compatible with YOLOv8.

#### Solution 2: Manual Downgrade
```bash
cd services/ai-service
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Uninstall current PyTorch
pip uninstall torch torchvision torchaudio

# Install compatible version
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1
```

#### Solution 3: Update Ultralytics (If Available)
```bash
pip install --upgrade ultralytics
```

Note: As of early 2026, Ultralytics may not have released a fix for PyTorch 2.6+ yet.

#### Solution 4: Use the Code Fix (Already Applied)
The `yolo_service.py` file has been updated to add safe globals:
```python
from ultralytics.nn.tasks import DetectionModel
torch.serialization.add_safe_globals([DetectionModel])
```

This should already be in place. If you still get the error, use Solution 1 or 2.

### Verification
After fixing, restart the AI service:
```bash
uvicorn app.main:app --reload --port 8001
```

You should see:
```
Loading YOLO model: yolov8n.pt
Model loaded successfully on device: auto
```

---

## Issue 2: CUDA Out of Memory

### Error Message
```
CUDA out of memory. Tried to allocate X.XX GiB
```

### Solutions

#### Solution 1: Use CPU Instead
Edit `.env`:
```env
AI_DEVICE=cpu
```

#### Solution 2: Use Smaller Model
Edit `.env`:
```env
YOLO_MODEL=yolov8n.pt  # Smallest model
```

#### Solution 3: Reduce Video Resolution
Process videos at lower resolution before uploading.

#### Solution 4: Close Other Applications
Free up GPU memory by closing other GPU-intensive applications.

---

## Issue 3: Slow Processing

### Symptoms
- Processing takes very long
- Low FPS (frames per second)

### Solutions

#### Solution 1: Use GPU
Edit `.env`:
```env
AI_DEVICE=cuda
```

#### Solution 2: Use Smaller Model
```env
YOLO_MODEL=yolov8n.pt  # Fastest
```

#### Solution 3: Increase Confidence Threshold
```env
YOLO_CONFIDENCE=0.50  # Fewer detections, faster processing
```

#### Solution 4: Reduce Video Quality
- Lower resolution
- Lower frame rate
- Shorter duration

---

## Issue 4: AI Service Offline

### Error Message
Frontend shows "AI Service is offline"

### Solutions

#### Solution 1: Check if Service is Running
```bash
# Check if port 8001 is in use
# Windows:
netstat -ano | findstr :8001

# Linux/Mac:
lsof -i :8001
```

#### Solution 2: Start the Service
```bash
cd services/ai-service
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8001
```

#### Solution 3: Check Logs
Look for error messages in the terminal where you started the service.

#### Solution 4: Restart Service
```bash
# Stop the service (Ctrl+C)
# Then start again
uvicorn app.main:app --reload --port 8001
```

---

## Issue 5: Tracking ID Switches

### Symptoms
- Same person gets different tracking IDs
- Low stability score

### Solutions

#### Solution 1: Increase Confidence Threshold
```env
YOLO_CONFIDENCE=0.50
```

#### Solution 2: Improve Video Quality
- Better lighting
- Higher resolution
- Stable camera

#### Solution 3: Reduce Occlusions
- Position camera to minimize overlapping people
- Avoid crowded scenes

#### Solution 4: Use Larger Model
```env
YOLO_MODEL=yolov8s.pt  # Better accuracy
```

---

## Issue 6: No Detections

### Symptoms
- Video processes but no people detected
- 0 unique tracks

### Solutions

#### Solution 1: Lower Confidence Threshold
```env
YOLO_CONFIDENCE=0.25
```

#### Solution 2: Check Video Content
- Make sure video contains people
- Check lighting conditions
- Verify video format is supported

#### Solution 3: Test with Different Video
Try a different video file to isolate the issue.

---

## Issue 7: Backend Connection Error

### Error Message
```
Error: connect ECONNREFUSED 127.0.0.1:8001
```

### Solutions

#### Solution 1: Start AI Service
```bash
cd services/ai-service
source .venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

#### Solution 2: Check Backend Configuration
Edit `backend/.env`:
```env
AI_SERVICE_URL=http://localhost:8001
```

#### Solution 3: Restart Backend
```bash
cd backend
npm run dev
```

---

## Issue 8: Database Connection Error

### Error Message
```
error: password authentication failed for user "postgres"
```

### Solutions

#### Solution 1: Check .env File
Edit `backend/.env`:
```env
DB_PASSWORD=your_actual_password
```

#### Solution 2: Reset PostgreSQL Password
```bash
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
\q
```

Then update `backend/.env` with the new password.

#### Solution 3: Check PostgreSQL is Running
```bash
# Windows: Check Services
# Linux/Mac:
sudo systemctl status postgresql
```

---

## Issue 9: Frontend Build Error

### Error Message
```
Type error: Cannot find module '@/components/ui/card'
```

### Solutions

#### Solution 1: Check Import Paths
Make sure imports use relative paths:
```typescript
import { Card } from './ui/card';  // ✅ Correct
// NOT: import { Card } from '@/components/ui/card';  // ❌ Wrong
```

#### Solution 2: Reinstall Dependencies
```bash
npm install
```

#### Solution 3: Clear Cache
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

## Issue 10: Video Upload Fails

### Error Message
```
Failed to upload video
```

### Solutions

#### Solution 1: Check File Size
Maximum file size is 500MB. Compress video if needed.

#### Solution 2: Check File Format
Supported formats: MP4, AVI, MOV, MKV

#### Solution 3: Check Both Services
Make sure both backend and AI service are running.

#### Solution 4: Check Logs
Look for error messages in backend and AI service terminals.

---

## Getting Help

If you're still experiencing issues:

1. **Check the logs** - Look for error messages in all terminals
2. **Verify all services are running** - Backend, AI service, Frontend
3. **Check configuration** - Review `.env` files
4. **Test individually** - Test each component separately
5. **Check documentation** - Review README files for each component

### Useful Commands

```bash
# Check backend health
curl http://localhost:3001/health

# Check AI service health
curl http://localhost:8001/health

# Check database
cd backend
npm run db:check

# View logs
# Check the terminal where each service is running
```

---

## Prevention Tips

1. **Use compatible versions** - Follow the requirements.txt exactly
2. **Test incrementally** - Test each component before integrating
3. **Monitor resources** - Watch CPU, RAM, and GPU usage
4. **Keep backups** - Backup your `.env` files and configurations
5. **Document changes** - Keep track of what you've changed

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| PyTorch error | `python scripts/fix_pytorch.py` |
| CUDA OOM | Set `AI_DEVICE=cpu` |
| Slow processing | Use `YOLO_MODEL=yolov8n.pt` |
| Service offline | Start with `uvicorn app.main:app --reload --port 8001` |
| DB error | Check `backend/.env` password |
| Upload fails | Check both services are running |

---

**Still stuck? Check the main documentation:**
- [COMPUTER_VISION_PROTOTYPE.md](../COMPUTER_VISION_PROTOTYPE.md)
- [CV_QUICKSTART.md](../CV_QUICKSTART.md)
- [services/ai-service/README.md](README.md)
