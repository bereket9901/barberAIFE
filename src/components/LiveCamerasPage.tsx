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
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{cameras.filter(c => c.status === 'online').length}/{cameras.length}</p>
              <p className="text-xs text-muted-foreground">Cameras Online</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl gradient-info flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">Active</p>
              <p className="text-xs text-muted-foreground">AI Detection</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl gradient-warning flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSessions.length}</p>
              <p className="text-xs text-muted-foreground">Active Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {cameras.map((camera) => {
          const session = sessions.find((s) => s.chairId === camera.chairId && s.status === 'active');
          const isExpanded = selectedCamera === camera.id;

          return (
            <Card
              key={camera.id}
              className={cn(
                "overflow-hidden transition-all shadow-card hover:shadow-elevated",
                isExpanded && "md:col-span-2 ring-2 ring-primary"
              )}
            >
              {/* Camera Feed */}
              <div className={cn("relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden", isExpanded ? "h-72" : "h-48")}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {session ? (
                    <div className="relative">
                      <div className="h-20 w-20 mx-auto rounded-full bg-card/80 flex items-center justify-center mb-2 shadow-soft">
                        <Users className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="absolute -top-2 -left-6 w-32 h-28 border-2 border-primary/40 rounded-lg animate-pulse" />
                      <div className="absolute -top-1 -left-5 text-[8px] bg-primary/80 text-white px-1.5 py-0.5 rounded font-medium">
                        Person 96%
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="h-16 w-16 mx-auto rounded-full bg-card/50 flex items-center justify-center mb-2">
                        <Camera className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <p className="text-xs text-muted-foreground/60">No activity detected</p>
                    </div>
                  )}
                </div>

                {/* Scan line */}
                {session && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-full h-0.5 bg-primary/30 animate-scan" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-destructive rounded-md">
                    <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-white">AI LIVE</span>
                  </div>
                  <Badge variant={camera.status === 'online' ? 'secondary' : 'destructive'} className="text-[10px] gap-1">
                    {camera.status === 'online' ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                    {camera.status === 'online' ? 'Connected' : 'Offline'}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <Button size="icon" variant="secondary" className="h-8 w-8 shadow-soft" onClick={() => setSelectedCamera(isExpanded ? null : camera.id)}>
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-card/90 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{camera.name} — Chair {camera.chairId}</p>
                      {session && (
                        <p className="text-[11px] text-muted-foreground">{session.customerName} • {session.barberName}</p>
                      )}
                    </div>
                    {session && (
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <Clock className="h-3 w-3" />
                        {elapsedTimes[camera.chairId] || '00:00'}
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
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Service</p>
                      <p className="text-sm font-medium mt-0.5">
                        {session.detectedServices.length > 0
                          ? session.detectedServices[session.detectedServices.length - 1].type.replace('_', ' ')
                          : 'Waiting...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Confidence</p>
                      <p className="text-sm font-medium text-primary mt-0.5">
                        {session.detectedServices.length > 0
                          ? `${session.detectedServices[session.detectedServices.length - 1].confidence}%`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Detected</p>
                      <p className="text-sm font-medium mt-0.5">{session.detectedServices.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Bill</p>
                      <p className="text-sm font-bold text-primary mt-0.5">{session.totalBill} ETB</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Architecture Info */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-1">Camera Architecture</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This prototype uses simulated camera feeds. The architecture supports:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['RTSP Cameras', 'IP Cameras', 'WebRTC', 'USB Cameras'].map((type) => (
              <div key={type} className="p-3 rounded-lg bg-accent/50 text-center">
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
