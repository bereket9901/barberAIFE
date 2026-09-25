from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """AI Service Configuration"""
    
    # YOLO Configuration
    YOLO_MODEL: str = "yolov8n.pt"
    YOLO_CONFIDENCE: float = 0.35
    YOLO_TRACKER: str = "bytetrack.yaml"
    
    # Device Configuration
    AI_DEVICE: str = "auto"  # auto, cpu, cuda
    
    # Output Configuration
    AI_OUTPUT_DIR: str = "./output"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
