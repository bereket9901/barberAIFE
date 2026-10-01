#!/usr/bin/env python3
"""
Test script for YOLOv8 + ByteTrack video processing

Usage:
    python scripts/test_video.py --video ./data/test-video.mp4
"""

import argparse
import sys
from pathlib import Path
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.video_service import video_service
from app.services.tracking_service import tracking_service
from app.config import settings


def main():
    parser = argparse.ArgumentParser(description="Test YOLOv8 + ByteTrack on video")
    parser.add_argument("--video", type=str, required=True, help="Path to input video")
    parser.add_argument("--output", type=str, default=None, help="Path to output video")
    parser.add_argument("--confidence", type=float, default=None, help="Detection confidence threshold")
    
    args = parser.parse_args()
    
    # Validate input
    video_path = Path(args.video)
    if not video_path.exists():
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)
    
    # Set output paths
    output_dir = Path(settings.AI_OUTPUT_DIR)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if args.output:
        output_video = Path(args.output)
    else:
        output_video = output_dir / f"{video_path.stem}_tracked.mp4"
    
    output_tracks = output_dir / f"{video_path.stem}_tracks.json"
    
    print("=" * 60)
    print("YOLOv8 + ByteTrack Video Processing Test")
    print("=" * 60)
    print(f"Input Video: {video_path}")
    print(f"Output Video: {output_video}")
    print(f"Output Tracks: {output_tracks}")
    print(f"Model: {settings.YOLO_MODEL}")
    print(f"Device: {settings.AI_DEVICE}")
    print("=" * 60)
    print()
    
    try:
        # Process video
        print("Processing video...")
        print()
        
        def progress_callback(job_id, progress, frames_processed, total_frames):
            bar_length = 40
            filled = int(bar_length * progress / 100)
            bar = "█" * filled + "░" * (bar_length - filled)
            print(f"\rProgress: [{bar}] {progress:.1f}% | Frames: {frames_processed}/{total_frames}", end="")
        
        stats = video_service.process_video(
            video_path=str(video_path),
            output_path=str(output_video),
            job_id="test",
            progress_callback=progress_callback
        )
        
        print("\n")
        print("✓ Processing complete!")
        print()
        
        # Save track data
        tracking_service.save_tracks(stats["tracks"], str(output_tracks))
        
        # Analyze stability
        stability = tracking_service.analyze_track_stability(stats["tracks"])
        
        # Print results
        print("=" * 60)
        print("RESULTS")
        print("=" * 60)
        print()
        print("Video Statistics:")
        print(f"  Frames Processed: {stats['frames_processed']:,}")
        print(f"  Video FPS: {stats['video_fps']:.2f}")
        print(f"  Processing FPS: {stats['processing_fps']:.2f}")
        print(f"  Duration: {stats['duration_seconds']:.2f}s")
        print(f"  Processing Time: {stats['processing_time_seconds']:.2f}s")
        print()
        print("Detection Statistics:")
        print(f"  Unique Tracks: {stats['total_unique_tracks']}")
        print(f"  Max Simultaneous People: {stats['max_simultaneous_people']}")
        print(f"  Average People per Frame: {stats['average_people_per_frame']:.2f}")
        print()
        print("Track Stability:")
        print(f"  Total ID Switches: {stability['total_id_switches']}")
        print(f"  Stability Score: {stability['stability_score']:.2f}/100")
        print(f"  Rating: {stability['stability_rating']}")
        print()
        print("Output Files:")
        print(f"  Video: {output_video}")
        print(f"  Tracks: {output_tracks}")
        print()
        print("=" * 60)
        
        # Save summary
        summary = {
            "video": str(video_path),
            "output_video": str(output_video),
            "output_tracks": str(output_tracks),
            "stats": stats,
            "stability": stability
        }
        
        summary_path = output_dir / f"{video_path.stem}_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"Summary saved to: {summary_path}")
        
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
