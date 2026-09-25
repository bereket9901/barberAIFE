import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LiveCamerasPage from './components/LiveCamerasPage';
import ServicesPage from './components/ServicesPage';
import TransactionsPage from './components/TransactionsPage';
import AITestPage from './components/AITestPage';
import { useStore } from './store';
import { cn } from './lib/utils';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Users, Camera } from 'lucide-react';

function CustomersPage() {
  const { sessions } = useStore();
  const activeSessions = sessions.filter((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <h3 className="text-base font-semibold">Active Sessions ({activeSessions.length})</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSessions.map((session) => (
            <Card key={session.id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Active</Badge>
                </div>
                <h4 className="font-semibold text-sm">{session.customerName}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Chair {session.chairId} • {session.barberName}
                </p>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{session.detectedServices.length} services</span>
                  <span className="text-sm font-bold text-primary">{session.totalBill} ETB</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Sessions */}
      <div>
        <h3 className="text-base font-semibold mb-4">Completed ({completedSessions.length})</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {completedSessions.map((session) => (
            <Card key={session.id} className="opacity-60 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary">Paid</Badge>
                </div>
                <h4 className="font-semibold text-sm">{session.customerName}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Chair {session.chairId} • {session.barberName}
                </p>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{session.detectedServices.length} services</span>
                  <span className="text-sm font-bold text-muted-foreground">{session.totalBill} ETB</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { systemStatus, cameras } = useStore();

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4">System Status</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'AI Vision System', status: 'Online', detail: 'MockVisionDetector' },
              { label: 'Cameras', status: `${systemStatus.camerasConnected}/${systemStatus.cameras} Connected`, detail: 'Protocol: Simulated' },
              { label: 'AI Detection', status: 'Running', detail: 'Threshold: 80%' },
              { label: 'Payment System', status: 'Ready', detail: 'Currency: ETB' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg bg-accent/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">Status: {item.status}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Model Configuration */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-1">AI Model Configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure which vision model to use for service detection.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { name: 'MockVisionDetector', status: 'Active', desc: 'Simulated detections for prototype' },
              { name: 'YOLO v8', status: 'Available', desc: 'Object detection model' },
              { name: 'Ollama/Qwen Vision', status: 'Available', desc: 'Local vision-language model' },
              { name: 'Gemini Vision', status: 'Available', desc: 'Google Cloud Vision API' },
            ].map((model) => (
              <div key={model.name} className={cn("p-4 rounded-lg border", model.status === 'Active' ? "border-primary/30 bg-primary/5" : "border-border")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{model.name}</span>
                  <Badge variant={model.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">
                    {model.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{model.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Camera Configuration */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4">Camera Configuration</h3>
          <div className="space-y-2">
            {cameras.map((camera) => (
              <div key={camera.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{camera.name}</p>
                    <p className="text-xs text-muted-foreground">Chair {camera.chairId} • {camera.streamUrl || 'Simulated'}</p>
                  </div>
                </div>
                <Badge variant={camera.status === 'online' ? 'secondary' : 'destructive'} className={cn("text-[10px]", camera.status === 'online' && "bg-success/10 text-success border-success/20")}>
                  {camera.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'cameras': return <LiveCamerasPage />;
      case 'customers': return <CustomersPage />;
      case 'transactions': return <TransactionsPage />;
      case 'services': return <ServicesPage />;
      case 'settings': return <SettingsPage />;
      case 'ai-test': return <AITestPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
