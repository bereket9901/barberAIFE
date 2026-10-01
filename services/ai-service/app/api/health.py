from fastapi import APIRouter
from app.schemas.detection import HealthResponse
from app.services.yolo_service import yolo_service
from app.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    device_info = yolo_service.get_device_info()
    
    return HealthResponse(
        status="ok",
        model=settings.YOLO_MODEL,
        device=settings.AI_DEVICE,
        cuda_available=device_info["cuda_available"],
        gpu_name=device_info.get("gpu_name")
    )
