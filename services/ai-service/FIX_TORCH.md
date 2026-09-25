# 🔧 Fix PyTorch Installation Error

## Problem

You're getting this error:
```
ModuleNotFoundError: No module named 'torch._C'
```

This means PyTorch is not properly installed or the installation is corrupted.

## Solution

### Option 1: Run the Fix Script (Easiest)

**For Windows PowerShell:**
```powershell
cd services/ai-service
.\fix_torch.ps1
```

**For Windows Command Prompt:**
```cmd
cd services/ai-service
fix_torch.bat
```

### Option 2: Manual Fix

Run these commands in your terminal (make sure you're in the `services/ai-service` directory with the virtual environment activated):

```bash
# Step 1: Uninstall broken PyTorch
pip uninstall torch torchvision torchaudio -y

# Step 2: Install PyTorch 2.5.1 (CPU version)
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cpu

# Step 3: Verify installation
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"
```

### Option 3: Complete Reinstall

If the above doesn't work, do a complete reinstall:

```bash
# Deactivate virtual environment
deactivate

# Delete the virtual environment
# Windows:
rmdir /s .venv

# Create new virtual environment
python -m venv .venv

# Activate it
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.venv\Scripts\activate.bat

# Install all dependencies
pip install -r requirements.txt

# Verify PyTorch
python -c "import torch; print(f'PyTorch version: {torch.__version__}')"
```

## Why This Happens

The `torch._C` module is a C extension that gets compiled during PyTorch installation. This error occurs when:

1. **Incomplete installation** - PyTorch didn't finish installing properly
2. **Version mismatch** - Different versions of torch, torchvision, and torchaudio
3. **Corrupted cache** - pip cache has corrupted files
4. **Python version incompatibility** - PyTorch version doesn't match your Python version

## Verification

After fixing, you should see:
```
PyTorch version: 2.5.1
CUDA available: False  (or True if you have a GPU)
```

Then start the AI service:
```bash
uvicorn app.main:app --reload --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
Loading YOLO model: yolov8n.pt
Model loaded successfully on device: auto
```

## If You Have a GPU

If you have an NVIDIA GPU and want to use it for faster processing:

```bash
# Uninstall CPU version
pip uninstall torch torchvision torchaudio -y

# Install CUDA version (for CUDA 11.8)
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu118

# Or for CUDA 12.1
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu121
```

Then update your `.env` file:
```env
AI_DEVICE=cuda
```

## Troubleshooting

### Still getting errors?

1. **Check Python version:**
   ```bash
   python --version
   ```
   Should be 3.11+

2. **Clear pip cache:**
   ```bash
   pip cache purge
   ```

3. **Install with verbose output:**
   ```bash
   pip install torch==2.5.1 -v
   ```

4. **Check for conflicting packages:**
   ```bash
   pip list | grep torch
   ```
   Should only show torch, torchvision, and torchaudio

## Next Steps

Once PyTorch is working:

1. Start the AI service:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:8001/health
   ```

3. Open the test page:
   ```
   http://localhost:5173/ai-test
   ```

## Need More Help?

See the full troubleshooting guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
