import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Camera, Wifi, WifiOff, Maximize2, Users, Clock, Eye } from 'lucide-react';

export default function LiveCamerasPage() {
  const { cameras, sessions, darkMode } = useStore();
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
        <h2 className="text-2xl font-bold">Live Camera Feeds</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Real-time AI-powered monitoring of all barber chairs
        </p>
      </div>

      {/* Camera Status Bar */}
      <div className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">Cameras Online:</span>
          <span className="text-emerald-500 font-bold">{cameras.filter(c => c.status === 'online').length}/{cameras.length}</span>
        </div>
        <div className="w-px h-6 bg-gray-700" />
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-500" />
          <span className="text-sm font-medium">AI Detection:</span>
          <span className="text-cyan-500 font-bold">Active</span>
        </div>
        <div className="w-px h-6 bg-gray-700" />
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium">Active Sessions:</span>
          <span className="text-purple-500 font-bold">{activeSessions.length}</span>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameras.map((camera) => {
          const session = sessions.find((s) => s.chairId === camera.chairId && s.status === 'active');
          const isExpanded = selectedCamera === camera.id;

          return (
            <div
              key={camera.id}
              className={`rounded-xl overflow-hidden border-2 transition-all ${
                isExpanded
                  ? 'md:col-span-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : darkMode
                    ? 'border-gray-800 hover:border-gray-700'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Camera Feed */}
              <div className={`relative ${isExpanded ? 'h-80' : 'h-56'} ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
                {/* Simulated camera view */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {session ? (
                    <div className="relative">
                      {/* Person silhouette */}
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-b from-gray-600 to-gray-700 flex items-center justify-center mb-3">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                      {/* Detection boxes overlay */}
                      <div className="absolute -top-2 -left-8 w-40 h-32 border-2 border-emerald-500/50 rounded-lg animate-pulse" />
                      <div className="absolute -top-1 -left-7 text-[9px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded">
                        Person 96%
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gray-700/50 flex items-center justify-center mb-3">
                        <Camera className="w-10 h-10 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-500">No activity detected</p>
                    </div>
                  )}
                </div>

                {/* Scan line animation */}
                {session && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-full h-0.5 bg-emerald-500/40 animate-scan" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
                  </div>
                )}

                {/* Camera overlay info */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-600 rounded-md">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white">AI LIVE</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                    camera.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {camera.status === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {camera.status === 'online' ? 'Connected' : 'Offline'}
                  </div>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setSelectedCamera(isExpanded ? null : camera.id)}
                    className={`p-2 rounded-lg ${darkMode ? 'bg-gray-900/80 hover:bg-gray-900' : 'bg-white/80 hover:bg-white'}`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom info bar */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 ${darkMode ? 'bg-gradient-to-t from-gray-900/90' : 'bg-gradient-to-t from-white/90'} to-transparent`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{camera.name} — Chair {camera.chairId}</p>
                      {session && (
                        <p className="text-xs text-gray-400">{session.customerName} • {session.barberName}</p>
                      )}
                    </div>
                    {session && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono">{elapsedTimes[camera.chairId] || '00:00'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              {session && (
                <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Current Service</p>
                      <p className="text-sm font-medium">
                        {session.detectedServices.length > 0
                          ? session.detectedServices[session.detectedServices.length - 1].type.replace('_', ' ')
                          : 'Waiting...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI Confidence</p>
                      <p className="text-sm font-medium text-emerald-500">
                        {session.detectedServices.length > 0
                          ? `${session.detectedServices[session.detectedServices.length - 1].confidence}%`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Services Detected</p>
                      <p className="text-sm font-medium">{session.detectedServices.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Current Bill</p>
                      <p className="text-sm font-bold text-emerald-500">{session.totalBill} ETB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Architecture Info */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-3">Camera Architecture</h3>
        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          This prototype uses simulated camera feeds. The architecture supports:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['RTSP Cameras', 'IP Cameras', 'WebRTC', 'USB Cameras'].map((type) => (
            <div key={type} className={`p-3 rounded-lg text-center text-sm ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <Camera className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
              <span className="text-xs font-medium">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
