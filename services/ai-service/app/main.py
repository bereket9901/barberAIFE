from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, detection
from app.config import settings
from pathlib import Path

# Create output directory
Path(settings.AI_OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="BarberAI Computer Vision Service",
    description="YOLOv8 + ByteTrack person detection and tracking",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(detection.router, prefix="/api", tags=["Detection"])


@app.on_event("startup")
async def startup_event():
    """Startup event"""
    print("=" * 60)
    print("BarberAI Computer Vision Service")
    print("=" * 60)
    print(f"Model: {settings.YOLO_MODEL}")
    print(f"Device: {settings.AI_DEVICE}")
    print(f"Output Directory: {settings.AI_OUTPUT_DIR}")
    print("=" * 60)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "BarberAI Computer Vision",
        "version": "0.1.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
