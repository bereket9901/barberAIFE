import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, Play, Download, Eye, Cpu, Activity, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface JobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  frames_processed: number;
  total_frames: number;
  output_video?: string;
  output_tracks?: string;
  stats?: {
    frames_processed: number;
    video_fps: number;
    processing_fps: number;
    duration_seconds: number;
    processing_time_seconds: number;
    total_unique_tracks: number;
    max_simultaneous_people: number;
    average_people_per_frame: number;
  };
  stability?: {
    total_tracks: number;
    average_duration_seconds: number;
    average_frames_seen: number;
    total_id_switches: number;
    stability_score: number;
    stability_rating: string;
  };
  error?: string;
}

export default function AITestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check AI service health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${API_URL}/cv/health`);
        setAiServiceStatus(response.data.data.status === 'online' ? 'online' : 'offline');
      } catch (error) {
        setAiServiceStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/cv/video-test/${jobId}`);
        setJobStatus(response.data.data);

        // Stop polling if completed or failed
        if (response.data.data.status === 'completed' || response.data.data.status === 'failed') {
          return;
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, [jobId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setJobId(null);
      setJobStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await axios.post(`${API_URL}/cv/video-test`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setJobId(response.data.data.job_id);
      setJobStatus(response.data.data);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Make sure the AI service is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadVideo = () => {
    if (jobId) {
      window.open(`${API_URL}/cv/video-test/${jobId}/video`, '_blank');
    }
  };

  const handleDownloadTracks = async () => {
    if (jobId) {
      try {
        const response = await axios.get(`${API_URL}/cv/video-test/${jobId}/tracks`);
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${jobId}_tracks.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading tracks:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 YOLOv8 Test Lab</h1>
        <p className="text-muted-foreground">
          Computer vision prototype - Person detection and tracking with YOLOv8 + ByteTrack
        </p>
      </div>

      {/* AI Service Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5" />
              <div>
                <p className="font-semibold">AI Service Status</p>
                <p className="text-sm text-muted-foreground">Python YOLOv8 + ByteTrack Service</p>
              </div>
            </div>
            <Badge variant={aiServiceStatus === 'online' ? 'default' : 'destructive'}>
              {aiServiceStatus === 'checking' ? 'Checking...' : aiServiceStatus === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Test Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : 'Click to select video file'}
              </p>
              <p className="text-xs text-muted-foreground">
                MP4, AVI, MOV (Max 500MB)
              </p>
            </label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || aiServiceStatus !== 'online'}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run YOLOv8 Tracking
              </>
            )}
          </Button>

          {aiServiceStatus !== 'online' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                ⚠️ AI Service is offline. Please start the Python AI service:
              </p>
              <code className="text-xs block mt-2 p-2 bg-background rounded">
                cd services/ai-service<br />
                python -m venv .venv<br />
                source .venv/bin/activate  # or .venv\Scripts\activate on Windows<br />
                pip install -r requirements.txt<br />
                uvicorn app.main:app --reload --port 8001
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Status */}
      {jobStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {jobStatus.status === 'processing' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {jobStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {jobStatus.status === 'failed' && <XCircle className="h-5 w-5 text-destructive" />}
                <span className="font-medium capitalize">{jobStatus.status}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Job ID: {jobStatus.job_id.slice(0, 8)}...
              </span>
            </div>

            {jobStatus.status === 'processing' && (
              <>
                <Progress value={jobStatus.progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Frames: {jobStatus.frames_processed.toLocaleString()} / {jobStatus.total_frames.toLocaleString()}</span>
                  <span>{jobStatus.progress.toFixed(1)}%</span>
                </div>
              </>
            )}

            {jobStatus.status === 'failed' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{jobStatus.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {jobStatus?.status === 'completed' && jobStatus.stats && (
        <>
          {/* Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detection Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Unique Tracks</p>
                  <p className="text-2xl font-bold">{jobStatus.stats.total_unique_tracks}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Max People</p>
                  <p className="text-2xl font-bold">{jobStatus.stats.max_simultaneous_people}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Avg People</p>
                  <p className="text-2xl font-bold">{jobStatus.stats.average_people_per_frame.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Processing FPS</p>
                  <p className="text-2xl font-bold">{jobStatus.stats.processing_fps.toFixed(1)}</p>
                </div>
              </div>

              {jobStatus.stability && (
                <div className="mt-4 p-4 bg-border/50 rounded-lg">
                  <p className="font-medium mb-2">Track Stability</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">ID Switches</p>
                      <p className="font-semibold">{jobStatus.stability.total_id_switches}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stability Score</p>
                      <p className="font-semibold">{jobStatus.stability.stability_score.toFixed(1)}/100</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-semibold">{jobStatus.stability.stability_rating}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Duration</p>
                      <p className="font-semibold">{jobStatus.stability.average_duration_seconds.toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Player */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Processed Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video
                controls
                className="w-full rounded-lg"
                src={`${API_URL}/cv/video-test/${jobId}/video`}
              >
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>

          {/* Download Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleDownloadVideo} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Processed Video
            </Button>
            <Button onClick={handleDownloadTracks} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Track JSON
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
