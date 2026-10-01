from typing import List, Dict, Any
import json
from pathlib import Path


class TrackingService:
    """Track Analysis Service"""
    
    def save_tracks(self, tracks: List[Dict[str, Any]], output_path: str):
        """
        Save track data to JSON file
        
        Args:
            tracks: List of track data
            output_path: Path to save JSON file
        """
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump({"tracks": tracks}, f, indent=2)
        
        print(f"Track data saved to: {output_path}")
    
    def analyze_track_stability(self, tracks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze overall track stability
        
        Args:
            tracks: List of track data
            
        Returns:
            Stability analysis
        """
        if not tracks:
            return {
                "total_tracks": 0,
                "average_duration": 0,
                "average_frames_seen": 0,
                "total_id_switches": 0,
                "stability_score": 0
            }
        
        total_tracks = len(tracks)
        avg_duration = sum(t["duration"] for t in tracks) / total_tracks
        avg_frames = sum(t["frames_seen"] for t in tracks) / total_tracks
        total_switches = sum(t.get("id_switches", 0) for t in tracks)
        
        # Calculate stability score (0-100)
        # Based on: frames visible vs frames missing, ID switches
        stability_scores = []
        
        for track in tracks:
            visible = track["frames_seen"]
            missing = track.get("frames_missing", 0)
            switches = track.get("id_switches", 0)
            
            if visible + missing > 0:
                visibility_ratio = visible / (visible + missing)
            else:
                visibility_ratio = 0
            
            # Penalize for ID switches
            switch_penalty = min(switches * 0.1, 0.5)
            
            score = (visibility_ratio - switch_penalty) * 100
            stability_scores.append(max(0, score))
        
        avg_stability = sum(stability_scores) / len(stability_scores) if stability_scores else 0
        
        return {
            "total_tracks": total_tracks,
            "average_duration_seconds": round(avg_duration, 2),
            "average_frames_seen": round(avg_frames, 2),
            "total_id_switches": total_switches,
            "stability_score": round(avg_stability, 2),
            "stability_rating": self._get_stability_rating(avg_stability)
        }
    
    def _get_stability_rating(self, score: float) -> str:
        """Get human-readable stability rating"""
        if score >= 80:
            return "Excellent"
        elif score >= 60:
            return "Good"
        elif score >= 40:
            return "Fair"
        else:
            return "Poor"


# Singleton instance
tracking_service = TrackingService()
