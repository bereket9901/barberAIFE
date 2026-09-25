# 🔧 PyTorch 2.6+ Compatibility Fix

## Problem

You encountered this error:
```
_pickle.UnpicklingError: Weights only load failed.
WeightsUnpickler error: Unsupported global: GLOBAL ultralytics.nn.tasks.DetectionModel
```

## Cause

PyTorch 2.6+ introduced a breaking change where `torch.load()` now defaults to `weights_only=True` for security reasons. This prevents loading YOLOv8 model files that contain custom classes like `DetectionModel`.

## Solution

### Quick Fix (Recommended)

Run the automated fix script:

```bash
cd services/ai-service
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python scripts/fix_pytorch.py
```

This will:
1. Detect your PyTorch version
2. Downgrade to PyTorch 2.5.1 (compatible version)
3. Verify the fix

### Manual Fix

If the script doesn't work, do it manually:

```bash
cd services/ai-service
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Uninstall current PyTorch
pip uninstall torch torchvision torchaudio -y

# Install compatible version
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1
```

### Code Fix (Already Applied)

The `yolo_service.py` file has been updated with this fix:

```python
# Handle PyTorch 2.6+ compatibility
try:
    from ultralytics.nn.tasks import DetectionModel
    torch.serialization.add_safe_globals([DetectionModel])
except Exception as e:
    print(f"Warning: Could not add safe globals: {e}")
```

This allows the model to load even with PyTorch 2.6+, but downgrading is still recommended for stability.

## Verification

After applying the fix, restart the AI service:

```bash
uvicorn app.main:app --reload --port 8001
```

You should see:
```
Loading YOLO model: yolov8n.pt
Model loaded successfully on device: auto
INFO:     Uvicorn running on http://127.0.0.1:8001
```

## Why This Happened

### PyTorch 2.6 Changes

PyTorch 2.6 (released late 2025) changed the default behavior of `torch.load()`:

**Before (PyTorch < 2.6):**
```python
torch.load('model.pt')  # weights_only=False (default)
```

**After (PyTorch >= 2.6):**
```python
torch.load('model.pt')  # weights_only=True (default, more secure)
```

This security improvement prevents arbitrary code execution from malicious model files, but breaks compatibility with models that use custom classes.

### Ultralytics Response

The Ultralytics team is working on a fix, but as of early 2026:
- YOLOv8 models still use custom classes
- The library hasn't been updated for PyTorch 2.6+ yet
- Downgrading PyTorch is the recommended workaround

## Prevention

The `requirements.txt` has been updated to pin PyTorch version:

```txt
torch>=2.0.0,<2.6.0
```

This ensures future installations will use a compatible version.

## Alternative Solutions

### Option 1: Wait for Ultralytics Update

Monitor the Ultralytics repository for PyTorch 2.6+ support:
- https://github.com/ultralytics/ultralytics

### Option 2: Use Older Python Environment

Create a separate environment with PyTorch 2.5:

```bash
python -m venv .venv-pytorch25
source .venv-pytorch25/bin/activate  # Windows: .venv-pytorch25\Scripts\activate
pip install -r requirements.txt
```

### Option 3: Patch Ultralytics (Advanced)

Modify the Ultralytics source code to use `weights_only=False`:

```python
# In ultralytics/nn/tasks.py, line ~634
return torch.load(file, map_location="cpu", weights_only=False), file
```

⚠️ **Warning**: This reduces security and is not recommended for production.

## Performance Impact

PyTorch 2.5.1 vs 2.6+:
- **Performance**: Nearly identical
- **Features**: 2.6 has some new features, but not needed for YOLOv8
- **Stability**: 2.5.1 is more stable for YOLOv8
- **Compatibility**: 2.5.1 works with all YOLOv8 features

**Recommendation**: Use PyTorch 2.5.1 for YOLOv8 projects.

## Related Issues

- [PyTorch 2.6 Release Notes](https://github.com/pytorch/pytorch/releases)
- [Ultralytics Issue #12345](https://github.com/ultralytics/ultralytics/issues) (example)
- [PyTorch Serialization Docs](https://pytorch.org/docs/stable/notes/serialization.html)

## Need More Help?

See the full troubleshooting guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**Status**: ✅ Fixed - Run `python scripts/fix_pytorch.py` to apply the fix.
