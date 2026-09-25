from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import Dict, Any
import uuid
import asyncio
from pathlib import Path
import shutil
from app.schemas.detection import JobResponse, JobStatus
from app.services.video_service import video_service
from app.services.tracking_service import tracking_service
from app.config import settings

router = APIRouter()

# In-memory job storage
jobs: Dict[str, Dict[str, Any]] = {}


def update_job_progress(job_id: str, progress: float, frames_processed: int, total_frames: int):
    """Update job progress"""
    if job_id in jobs:
        jobs[job_id]["progress"] = progress
        jobs[job_id]["frames_processed"] = frames_processed
        jobs[job_id]["total_frames"] = total_frames


async def process_video_job(job_id: str, video_path: str):
    """Process video in background"""
    try:
        jobs[job_id]["status"] = JobStatus.PROCESSING
        
        output_video = str(Path(settings.AI_OUTPUT_DIR) / f"{job_id}.mp4")
        output_tracks = str(Path(settings.AI_OUTPUT_DIR) / f"{job_id}_tracks.json")
        
        # Process video
        stats = video_service.process_video(
            video_path=video_path,
            output_path=output_video,
            job_id=job_id,
            progress_callback=update_job_progress
        )
        
        # Save track data
        tracking_service.save_tracks(stats["tracks"], output_tracks)
        
        # Analyze stability
        stability = tracking_service.analyze_track_stability(stats["tracks"])
        
        # Update job with results
        jobs[job_id].update({
            "status": JobStatus.COMPLETED,
            "progress": 100.0,
            "output_video": output_video,
            "output_tracks": output_tracks,
            "stats": stats,
            "stability": stability
        })
        
        # Clean up input video
        Path(video_path).unlink(missing_ok=True)
        
    except Exception as e:
        jobs[job_id]["status"] = JobStatus.FAILED
        jobs[job_id]["error"] = str(e)
        print(f"Error processing job {job_id}: {e}")


@router.post("/detect/video", response_model=JobResponse)
async def detect_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...)
):
    """
    Upload video for YOLOv8 + ByteTrack processing
    
    Returns job ID for tracking progress
    """
    # Validate file type
    if not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded video
    input_dir = Path(settings.AI_OUTPUT_DIR) / "inputs"
    input_dir.mkdir(parents=True, exist_ok=True)
    
    video_path = str(input_dir / f"{job_id}_{video.filename}")
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    
    # Create job entry
    jobs[job_id] = {
        "job_id": job_id,
        "status": JobStatus.QUEUED,
        "progress": 0.0,
        "frames_processed": 0,
        "total_frames": 0,
        "output_video": None,
        "output_tracks": None,
        "stats": None,
        "tracks": None,
        "stability": None,
        "error": None
    }
    
    # Start background processing
    background_tasks.add_task(process_video_job, job_id, video_path)
    
    return JobResponse(**jobs[job_id])


@router.get("/detect/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    """Get job status and results"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResponse(**jobs[job_id])


@router.get("/detect/jobs/{job_id}/video")
async def get_job_video(job_id: str):
    """Download processed video"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    if job["status"] != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    if not job["output_video"] or not Path(job["output_video"]).exists():
        raise HTTPException(status_code=404, detail="Output video not found")
    
    return FileResponse(
        job["output_video"],
        media_type="video/mp4",
        filename=f"{job_id}_tracked.mp4"
    )


@router.get("/detect/jobs/{job_id}/tracks")
async def get_job_tracks(job_id: str):
    """Download track data JSON"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    if job["status"] != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    if not job["output_tracks"] or not Path(job["output_tracks"]).exists():
        raise HTTPException(status_code=404, detail="Track data not found")
    
    return FileResponse(
        job["output_tracks"],
        media_type="application/json",
        filename=f"{job_id}_tracks.json"
    )
