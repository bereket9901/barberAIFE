import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LiveCamerasPage from './components/LiveCamerasPage';
import ServicesPage from './components/ServicesPage';
import TransactionsPage from './components/TransactionsPage';
import { useStore } from './store';
import { cn } from './lib/utils';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Users, Settings } from 'lucide-react';

function CustomersPage() {
  const { sessions, darkMode } = useStore();
  const activeSessions = sessions.filter((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'paid');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <p className="text-muted-foreground">Active and recent customer sessions</p>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          Active Sessions ({activeSessions.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <Badge>Active</Badge>
                </div>
                <h4 className="font-semibold">{session.customerName}</h4>
                <p className="text-sm text-muted-foreground">
                  Chair {session.chairId} • Barber: {session.barberName}
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
        <h3 className="text-lg font-semibold mb-4">Completed ({completedSessions.length})</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {completedSessions.map((session) => (
            <Card key={session.id} className="opacity-70">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary">Paid</Badge>
                </div>
                <h4 className="font-semibold">{session.customerName}</h4>
                <p className="text-sm text-muted-foreground">
                  Chair {session.chairId} • Barber: {session.barberName}
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
  const { systemStatus, darkMode, cameras } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">System configuration and AI model settings</p>
      </div>

      {/* System Status */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                <span className="font-medium">AI Vision System</span>
              </div>
              <p className="text-sm text-muted-foreground">Status: Online</p>
              <p className="text-sm text-muted-foreground">Model: MockVisionDetector</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                <span className="font-medium">Cameras</span>
              </div>
              <p className="text-sm text-muted-foreground">{systemStatus.camerasConnected}/{systemStatus.cameras} Connected</p>
              <p className="text-sm text-muted-foreground">Protocol: Simulated</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                <span className="font-medium">AI Detection</span>
              </div>
              <p className="text-sm text-muted-foreground">Status: Running</p>
              <p className="text-sm text-muted-foreground">Confidence threshold: 80%</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                <span className="font-medium">Payment System</span>
              </div>
              <p className="text-sm text-muted-foreground">Status: Ready</p>
              <p className="text-sm text-muted-foreground">Currency: ETB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Configuration */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">AI Model Configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure which vision model to use for service detection. Currently using mock detector for prototype.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { name: 'MockVisionDetector', status: 'Active', desc: 'Simulated detections for prototype' },
              { name: 'YOLO v8', status: 'Available', desc: 'Object detection model' },
              { name: 'Ollama/Qwen Vision', status: 'Available', desc: 'Local vision-language model' },
              { name: 'Gemini Vision', status: 'Available', desc: 'Google Cloud Vision API' },
            ].map((model) => (
              <div key={model.name} className={cn("p-4 rounded-lg border", model.status === 'Active' ? "border-primary bg-primary/5" : "border-border")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{model.name}</span>
                  <Badge variant={model.status === 'Active' ? 'default' : 'secondary'}>
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
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Camera Configuration</h3>
          <div className="space-y-3">
            {cameras.map((camera) => (
              <div key={camera.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="font-medium text-sm">{camera.name}</p>
                  <p className="text-xs text-muted-foreground">Chair {camera.chairId} • {camera.streamUrl || 'Simulated'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", camera.status === 'online' ? "bg-primary" : "bg-destructive")} />
                  <span className="text-xs text-muted-foreground">{camera.status}</span>
                </div>
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
  const { darkMode } = useStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cameras':
        return <LiveCamerasPage />;
      case 'customers':
        return <CustomersPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'services':
        return <ServicesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={cn(darkMode && "dark")}>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </div>
  );
}
