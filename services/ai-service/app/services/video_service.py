import cv2
import numpy as np
from typing import Dict, Any, List
from pathlib import Path
import time
from app.services.yolo_service import yolo_service
from app.config import settings


class VideoService:
    """Video Processing Service"""
    
    def __init__(self):
        self.yolo_service = yolo_service
    
    def process_video(
        self,
        video_path: str,
        output_path: str,
        job_id: str,
        progress_callback=None
    ) -> Dict[str, Any]:
        """
        Process video file with YOLOv8 + ByteTrack
        
        Args:
            video_path: Path to input video
            output_path: Path to save output video
            job_id: Job identifier
            progress_callback: Optional callback for progress updates
            
        Returns:
            Processing statistics
        """
        # Open video
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Statistics
        start_time = time.time()
        frames_processed = 0
        track_data = {}  # track_id -> {first_seen, last_seen, frames_seen, ...}
        max_simultaneous = 0
        total_people_count = 0
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Detect and track
                detections = self.yolo_service.detect_and_track(frame)
                
                # Update statistics
                frames_processed += 1
                current_time = frames_processed / fps
                
                num_people = len(detections)
                total_people_count += num_people
                max_simultaneous = max(max_simultaneous, num_people)
                
                # Update track data
                for det in detections:
                    track_id = det["track_id"]
                    
                    if track_id not in track_data:
                        track_data[track_id] = {
                            "track_id": track_id,
                            "first_seen": current_time,
                            "last_seen": current_time,
                            "frames_seen": 0,
                            "detection_history": []
                        }
                    
                    track_data[track_id]["last_seen"] = current_time
                    track_data[track_id]["frames_seen"] += 1
                    track_data[track_id]["detection_history"].append({
                        "frame": frames_processed,
                        "bbox": det["bbox"],
                        "confidence": det["confidence"]
                    })
                
                # Draw detections on frame
                frame_with_boxes = self._draw_detections(frame, detections, frames_processed)
                
                # Write frame
                out.write(frame_with_boxes)
                
                # Progress callback
                if progress_callback and frames_processed % 10 == 0:
                    progress = (frames_processed / total_frames) * 100
                    progress_callback(job_id, progress, frames_processed, total_frames)
        
        finally:
            cap.release()
            out.release()
        
        # Calculate final statistics
        processing_time = time.time() - start_time
        processing_fps = frames_processed / processing_time if processing_time > 0 else 0
        avg_people = total_people_count / frames_processed if frames_processed > 0 else 0
        
        # Calculate track stability metrics
        tracks_list = []
        for track_id, data in track_data.items():
            history = data["detection_history"]
            
            # Calculate ID switches and continuous detection
            frames_visible = data["frames_seen"]
            frames_missing = 0
            id_switches = 0
            longest_continuous = 0
            current_streak = 0
            
            # Analyze detection history for gaps
            prev_frame = 0
            for det in history:
                frame_num = det["frame"]
                gap = frame_num - prev_frame - 1 if prev_frame > 0 else 0
                
                if gap > 0:
                    frames_missing += gap
                    longest_continuous = max(longest_continuous, current_streak)
                    current_streak = 0
                
                current_streak += 1
                prev_frame = frame_num
            
            longest_continuous = max(longest_continuous, current_streak)
            
            tracks_list.append({
                "track_id": track_id,
                "first_seen": round(data["first_seen"], 2),
                "last_seen": round(data["last_seen"], 2),
                "duration": round(data["last_seen"] - data["first_seen"], 2),
                "frames_seen": frames_visible,
                "frames_missing": frames_missing,
                "id_switches": id_switches,
                "longest_continuous_detection": longest_continuous
            })
        
        # Sort tracks by first seen
        tracks_list.sort(key=lambda x: x["first_seen"])
        
        return {
            "frames_processed": frames_processed,
            "video_fps": fps,
            "processing_fps": round(processing_fps, 2),
            "duration_seconds": round(total_frames / fps, 2),
            "processing_time_seconds": round(processing_time, 2),
            "total_unique_tracks": len(tracks_list),
            "max_simultaneous_people": max_simultaneous,
            "average_people_per_frame": round(avg_people, 2),
            "tracks": tracks_list
        }
    
    def _draw_detections(
        self,
        frame: np.ndarray,
        detections: List[Dict[str, Any]],
        frame_num: int
    ) -> np.ndarray:
        """Draw bounding boxes and labels on frame"""
        
        # Color palette for different track IDs
        colors = [
            (0, 255, 0),    # Green
            (255, 0, 0),    # Blue
            (0, 0, 255),    # Red
            (255, 255, 0),  # Cyan
            (255, 0, 255),  # Magenta
            (0, 255, 255),  # Yellow
            (128, 255, 0),  # Lime
            (255, 128, 0),  # Orange
        ]
        
        for det in detections:
            track_id = det["track_id"]
            bbox = det["bbox"]
            confidence = det["confidence"]
            
            # Select color based on track ID
            color = colors[track_id % len(colors)]
            
            # Draw bounding box
            x1, y1, x2, y2 = map(int, bbox)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # Prepare label
            label = f"Person #{track_id}"
            conf_text = f"{confidence:.2f}"
            
            # Calculate label size
            (label_width, label_height), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
            )
            
            # Draw label background
            cv2.rectangle(
                frame,
                (x1, y1 - label_height - 10),
                (x1 + label_width + 10, y1),
                color,
                -1
            )
            
            # Draw label text
            cv2.putText(
                frame,
                label,
                (x1 + 5, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )
            
            # Draw confidence below box
            cv2.putText(
                frame,
                conf_text,
                (x1, y2 + 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2
            )
        
        # Draw frame counter
        cv2.putText(
            frame,
            f"Frame: {frame_num}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )
        
        return frame


# Singleton instance
video_service = VideoService()
