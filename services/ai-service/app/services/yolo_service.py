from ultralytics import YOLO
from typing import List, Dict, Any, Optional
import numpy as np
from app.config import settings


class YOLOService:
    """YOLOv8 Detection Service"""
    
    def __init__(self):
        self.model: Optional[YOLO] = None
        self._load_model()
    
    def _load_model(self):
        """Load YOLOv8 model"""
        print(f"Loading YOLO model: {settings.YOLO_MODEL}")
        self.model = YOLO(settings.YOLO_MODEL)
        print(f"Model loaded successfully on device: {settings.AI_DEVICE}")
    
    def detect_and_track(
        self,
        frame: np.ndarray,
        confidence: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Detect and track objects in a frame
        
        Args:
            frame: Input frame (BGR format)
            confidence: Detection confidence threshold
            
        Returns:
            List of detections with tracking IDs
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        conf = confidence or settings.YOLO_CONFIDENCE
        
        # Run detection with tracking
        results = self.model.track(
            source=frame,
            conf=conf,
            tracker=settings.YOLO_TRACKER,
            verbose=False,
            device=settings.AI_DEVICE if settings.AI_DEVICE != "auto" else None
        )
        
        detections = []
        
        if results and len(results) > 0:
            result = results[0]
            
            if result.boxes is not None and hasattr(result.boxes, 'id'):
                boxes = result.boxes.xyxy.cpu().numpy()
                confidences = result.boxes.conf.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy().astype(int)
                track_ids = result.boxes.id.cpu().numpy().astype(int)
                
                for i in range(len(boxes)):
                    # Only track persons (class 0 in COCO)
                    if classes[i] == 0:
                        detections.append({
                            "track_id": int(track_ids[i]),
                            "bbox": boxes[i].tolist(),
                            "confidence": float(confidences[i]),
                            "class": "person",
                            "class_id": int(classes[i])
                        })
        
        return detections
    
    def get_device_info(self) -> Dict[str, Any]:
        """Get device information"""
        import torch
        
        device_info = {
            "device": settings.AI_DEVICE,
            "cuda_available": torch.cuda.is_available(),
        }
        
        if torch.cuda.is_available():
            device_info["gpu_name"] = torch.cuda.get_device_name(0)
            device_info["gpu_memory_total"] = f"{torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB"
            device_info["gpu_memory_allocated"] = f"{torch.cuda.memory_allocated(0) / 1e9:.2f} GB"
        
        return device_info


# Singleton instance
yolo_service = YOLOService()
