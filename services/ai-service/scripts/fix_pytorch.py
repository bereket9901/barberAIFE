# Fix PyTorch Compatibility Issue Script
# Run this if you encounter PyTorch 2.6+ model loading errors

import subprocess
import sys

def fix_pytorch_compatibility():
    """Fix PyTorch 2.6+ compatibility with YOLOv8"""
    
    print("=" * 60)
    print("Fixing PyTorch Compatibility Issue")
    print("=" * 60)
    print()
    
    # Check current PyTorch version
    try:
        import torch
        print(f"Current PyTorch version: {torch.__version__}")
        
        # Parse version
        version_parts = torch.__version__.split('.')
        major = int(version_parts[0])
        minor = int(version_parts[1].split('+')[0])  # Handle versions like "2.6.0+cpu"
        
        if major > 2 or (major == 2 and minor >= 6):
            print("⚠️  PyTorch 2.6+ detected. This version has breaking changes.")
            print()
            print("Installing PyTorch 2.5.1 (compatible version)...")
            print()
            
            # Uninstall current PyTorch
            subprocess.check_call([sys.executable, "-m", "pip", "uninstall", "-y", "torch", "torchvision", "torchaudio"])
            
            # Install compatible version
            subprocess.check_call([sys.executable, "-m", "pip", "install", "torch==2.5.1", "torchvision==0.20.1", "torchaudio==2.5.1"])
            
            print()
            print("✅ PyTorch downgraded successfully!")
            print()
            print("You can now start the AI service:")
            print("  uvicorn app.main:app --reload --port 8001")
        else:
            print("✅ PyTorch version is compatible. No changes needed.")
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("Manual fix:")
        print("  pip uninstall torch torchvision torchaudio")
        print("  pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1")
    
    print()
    print("=" * 60)

if __name__ == "__main__":
    fix_pytorch_compatibility()
