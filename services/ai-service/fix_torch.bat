@echo off
echo ========================================
echo Fixing PyTorch Installation
echo ========================================
echo.

echo Step 1: Uninstalling existing PyTorch packages...
pip uninstall torch torchvision torchaudio -y
echo.

echo Step 2: Installing PyTorch 2.5.1 (CPU version)...
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cpu
echo.

echo Step 3: Verifying installation...
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"
echo.

echo ========================================
echo Installation complete!
echo ========================================
echo.
echo You can now start the AI service:
echo   uvicorn app.main:app --reload --port 8001
echo.
pause
