import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LiveCamerasPage from './components/LiveCamerasPage';
import ServicesPage from './components/ServicesPage';
import TransactionsPage from './components/TransactionsPage';
import { useStore } from './store';
import { Users, Settings } from 'lucide-react';

function CustomersPage() {
  const { sessions, darkMode } = useStore();
  const activeSessions = sessions.filter((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'paid');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customers</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Active and recent customer sessions
        </p>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Active Sessions ({activeSessions.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSessions.map((session) => (
            <div key={session.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
              </div>
              <h4 className="font-semibold">{session.customerName}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Chair {session.chairId} • Barber: {session.barberName}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">{session.detectedServices.length} services</span>
                <span className="text-sm font-bold text-emerald-500">{session.totalBill} ETB</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Sessions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Completed ({completedSessions.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedSessions.map((session) => (
            <div key={session.id} className={`p-4 rounded-xl border opacity-70 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-400">Paid</span>
              </div>
              <h4 className="font-semibold">{session.customerName}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Chair {session.chairId} • Barber: {session.barberName}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">{session.detectedServices.length} services</span>
                <span className="text-sm font-bold text-gray-400">{session.totalBill} ETB</span>
              </div>
            </div>
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
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          System configuration and AI model settings
        </p>
      </div>

      {/* System Status */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-medium">AI Vision System</span>
            </div>
            <p className="text-sm text-gray-400">Status: Online</p>
            <p className="text-sm text-gray-400">Model: MockVisionDetector</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-medium">Cameras</span>
            </div>
            <p className="text-sm text-gray-400">{systemStatus.camerasConnected}/{systemStatus.cameras} Connected</p>
            <p className="text-sm text-gray-400">Protocol: Simulated</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-medium">AI Detection</span>
            </div>
            <p className="text-sm text-gray-400">Status: Running</p>
            <p className="text-sm text-gray-400">Confidence threshold: 80%</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-medium">Payment System</span>
            </div>
            <p className="text-sm text-gray-400">Status: Ready</p>
            <p className="text-sm text-gray-400">Currency: ETB</p>
          </div>
        </div>
      </div>

      {/* AI Model Configuration */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">AI Model Configuration</h3>
        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure which vision model to use for service detection. Currently using mock detector for prototype.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'MockVisionDetector', status: 'Active', desc: 'Simulated detections for prototype' },
            { name: 'YOLO v8', status: 'Available', desc: 'Object detection model' },
            { name: 'Ollama/Qwen Vision', status: 'Available', desc: 'Local vision-language model' },
            { name: 'Gemini Vision', status: 'Available', desc: 'Google Cloud Vision API' },
          ].map((model) => (
            <div key={model.name} className={`p-4 rounded-lg border ${
              model.status === 'Active'
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{model.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  model.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  {model.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{model.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Camera Configuration */}
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">Camera Configuration</h3>
        <div className="space-y-3">
          {cameras.map((camera) => (
            <div key={camera.id} className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div>
                <p className="font-medium text-sm">{camera.name}</p>
                <p className="text-xs text-gray-500">Chair {camera.chairId} • {camera.streamUrl || 'Simulated'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-400">{camera.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
