Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing PyTorch Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Uninstalling existing PyTorch packages..." -ForegroundColor Yellow
pip uninstall torch torchvision torchaudio -y
Write-Host ""

Write-Host "Step 2: Installing PyTorch 2.5.1 (CPU version)..." -ForegroundColor Yellow
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cpu
Write-Host ""

Write-Host "Step 3: Verifying installation..." -ForegroundColor Yellow
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start the AI service:" -ForegroundColor Cyan
Write-Host "  uvicorn app.main:app --reload --port 8001" -ForegroundColor White
Write-Host ""
