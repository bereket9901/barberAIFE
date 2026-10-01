from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class JobStatus(str, Enum):
    """Job status enumeration"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Detection(BaseModel):
    """Single detection result"""
    track_id: int
    bbox: List[float]
    confidence: float
    class_name: str = Field(..., alias="class")
    class_id: int


class TrackData(BaseModel):
    """Track data for a single person"""
    track_id: int
    first_seen: float
    last_seen: float
    duration: float
    frames_seen: int
    frames_missing: int = 0
    id_switches: int = 0
    longest_continuous_detection: int = 0


class ProcessingStats(BaseModel):
    """Video processing statistics"""
    frames_processed: int
    video_fps: float
    processing_fps: float
    duration_seconds: float
    processing_time_seconds: float
    total_unique_tracks: int
    max_simultaneous_people: int
    average_people_per_frame: float


class JobResponse(BaseModel):
    """Job response model"""
    job_id: str
    status: JobStatus
    progress: float = 0.0
    frames_processed: int = 0
    total_frames: int = 0
    output_video: Optional[str] = None
    output_tracks: Optional[str] = None
    stats: Optional[ProcessingStats] = None
    tracks: Optional[List[TrackData]] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model: str
    device: str
    cuda_available: bool
    gpu_name: Optional[str] = None


class StabilityAnalysis(BaseModel):
    """Track stability analysis"""
    total_tracks: int
    average_duration_seconds: float
    average_frames_seen: float
    total_id_switches: int
    stability_score: float
    stability_rating: str
