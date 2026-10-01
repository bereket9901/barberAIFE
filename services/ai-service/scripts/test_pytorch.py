#!/usr/bin/env python3
"""
Test PyTorch installation
"""

import sys

def test_pytorch():
    """Test if PyTorch is properly installed"""
    print("=" * 60)
    print("Testing PyTorch Installation")
    print("=" * 60)
    print()
    
    # Test 1: Import torch
    print("Test 1: Importing torch...")
    try:
        import torch
        print(f"✅ PyTorch imported successfully")
        print(f"   Version: {torch.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import torch: {e}")
        return False
    print()
    
    # Test 2: Import torch._C
    print("Test 2: Importing torch._C...")
    try:
        import torch._C
        print(f"✅ torch._C imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import torch._C: {e}")
        print("   This indicates a corrupted PyTorch installation")
        return False
    print()
    
    # Test 3: Import torchvision
    print("Test 3: Importing torchvision...")
    try:
        import torchvision
        print(f"✅ torchvision imported successfully")
        print(f"   Version: {torchvision.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import torchvision: {e}")
        return False
    print()
    
    # Test 4: Import torchaudio
    print("Test 4: Importing torchaudio...")
    try:
        import torchaudio
        print(f"✅ torchaudio imported successfully")
        print(f"   Version: {torchaudio.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import torchaudio: {e}")
        return False
    print()
    
    # Test 5: Check CUDA
    print("Test 5: Checking CUDA availability...")
    try:
        cuda_available = torch.cuda.is_available()
        print(f"✅ CUDA check completed")
        print(f"   CUDA available: {cuda_available}")
        if cuda_available:
            print(f"   CUDA version: {torch.version.cuda}")
            print(f"   GPU: {torch.cuda.get_device_name(0)}")
    except Exception as e:
        print(f"⚠️  CUDA check failed: {e}")
    print()
    
    # Test 6: Create a tensor
    print("Test 6: Creating a tensor...")
    try:
        x = torch.tensor([1.0, 2.0, 3.0])
        print(f"✅ Tensor created successfully")
        print(f"   Tensor: {x}")
    except Exception as e:
        print(f"❌ Failed to create tensor: {e}")
        return False
    print()
    
    # Test 7: Import ultralytics
    print("Test 7: Importing ultralytics...")
    try:
        from ultralytics import YOLO
        print(f"✅ ultralytics imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import ultralytics: {e}")
        return False
    print()
    
    print("=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)
    print()
    print("PyTorch is properly installed and ready to use.")
    print()
    print("You can now start the AI service:")
    print("  uvicorn app.main:app --reload --port 8001")
    print()
    
    return True


if __name__ == "__main__":
    success = test_pytorch()
    sys.exit(0 if success else 1)
