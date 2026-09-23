import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Camera, Wifi, WifiOff, Maximize2, Users, Clock, Eye } from 'lucide-react';

export default function LiveCamerasPage() {
  const { cameras, sessions } = useStore();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({});

  const activeSessions = sessions.filter((s) => s.status === 'active');

  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, string> = {};
      activeSessions.forEach((session) => {
        const start = new Date(session.startTime).getTime();
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        times[session.chairId] = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      });
      setElapsedTimes(times);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSessions.length]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Live Camera Feeds</h2>
        <p className="text-muted-foreground">Real-time AI-powered monitoring of all barber chairs</p>
      </div>

      {/* Camera Status Bar */}
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Cameras Online:</span>
            <span className="text-primary font-bold">{cameras.filter(c => c.status === 'online').length}/{cameras.length}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-500" />
            <span className="text-sm font-medium">AI Detection:</span>
            <span className="text-cyan-500 font-bold">Active</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Active Sessions:</span>
            <span className="text-purple-500 font-bold">{activeSessions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Camera Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {cameras.map((camera) => {
          const session = sessions.find((s) => s.chairId === camera.chairId && s.status === 'active');
          const isExpanded = selectedCamera === camera.id;

          return (
            <Card
              key={camera.id}
              className={cn(
                "overflow-hidden transition-all",
                isExpanded && "md:col-span-2 ring-2 ring-primary"
              )}
            >
              {/* Camera Feed */}
              <div className={cn("relative bg-muted overflow-hidden", isExpanded ? "h-80" : "h-56")}>
                {/* Simulated camera view */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {session ? (
                    <div className="relative">
                      {/* Person silhouette */}
                      <div className="w-24 h-24 mx-auto rounded-full bg-background flex items-center justify-center mb-3">
                        <Users className="h-12 w-12 text-muted-foreground" />
                      </div>
                      {/* Detection boxes overlay */}
                      <div className="absolute -top-2 -left-8 w-40 h-32 border-2 border-primary/50 rounded-lg animate-pulse" />
                      <div className="absolute -top-1 -left-7 text-[9px] bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded">
                        Person 96%
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-background/50 flex items-center justify-center mb-3">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No activity detected</p>
                    </div>
                  )}
                </div>

                {/* Scan line animation */}
                {session && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-full h-0.5 bg-primary/40 animate-scan" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
                  </div>
                )}

                {/* Camera overlay info */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive rounded-md">
                    <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white">AI LIVE</span>
                  </div>
                  <Badge variant={camera.status === 'online' ? 'default' : 'destructive'} className="text-[10px]">
                    {camera.status === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                    {camera.status === 'online' ? 'Connected' : 'Offline'}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setSelectedCamera(isExpanded ? null : camera.id)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{camera.name} — Chair {camera.chairId}</p>
                      {session && (
                        <p className="text-xs text-muted-foreground">{session.customerName} • {session.barberName}</p>
                      )}
                    </div>
                    {session && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">{elapsedTimes[camera.chairId] || '00:00'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              {session && (
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Service</p>
                      <p className="text-sm font-medium">
                        {session.detectedServices.length > 0
                          ? session.detectedServices[session.detectedServices.length - 1].type.replace('_', ' ')
                          : 'Waiting...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Confidence</p>
                      <p className="text-sm font-medium text-primary">
                        {session.detectedServices.length > 0
                          ? `${session.detectedServices[session.detectedServices.length - 1].confidence}%`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Services Detected</p>
                      <p className="text-sm font-medium">{session.detectedServices.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Bill</p>
                      <p className="text-sm font-bold text-primary">{session.totalBill} ETB</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Architecture Info */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Camera Architecture</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This prototype uses simulated camera feeds. The architecture supports:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['RTSP Cameras', 'IP Cameras', 'WebRTC', 'USB Cameras'].map((type) => (
              <div key={type} className="p-3 rounded-lg bg-muted text-center">
                <Camera className="h-5 w-5 mx-auto mb-1 text-primary" />
                <span className="text-xs font-medium">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
