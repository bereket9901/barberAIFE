import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { runDemoSimulation } from '../simulation';
import {
  Users, Armchair, Scissors, Banknote, Play,
  CreditCard, Activity, Clock, ChevronRight, AlertTriangle,
  Check, X, Eye, Zap
} from 'lucide-react';

export default function Dashboard() {
  const {
    sessions, transactions, services, systemStatus, darkMode,
    selectedChairId, selectChair, showBilling, setShowBilling,
    showPayment, setShowPayment, updateServiceStatus,
    addActivity, demoRunning, setDemoRunning,
    activityLog, paymentSuccess, setPaymentSuccess,
    lastTransaction, setLastTransaction, addTransaction,
    markSessionPaid,
  } = useStore();

  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const availableChairs = 4 - activeSessions.length;
  const totalServicesToday = transactions.length * 2 + 27;
  const revenueToday = transactions.reduce((sum, t) => sum + t.amount, 0) +
    activeSessions.reduce((sum, s) => sum + s.totalBill, 0);

  // Update elapsed times
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

  const handleStartDemo = () => {
    setDemoRunning(true);
    runDemoSimulation();
  };

  const handleConfirmBill = () => {
    setShowBilling(false);
    setShowPayment(true);
  };

  const handlePayment = (method: string) => {
    if (!selectedChairId) return;
    const session = sessions.find((s) => s.chairId === selectedChairId);
    if (!session) return;

    const txId = `TX-${session.customerId}`;
    const tx = {
      sessionId: session.id,
      customerId: session.customerId,
      customerName: session.customerName,
      barberName: session.barberName,
      services: session.detectedServices
        .filter((ds) => ds.status !== 'rejected')
        .map((ds) => services.find((s) => s.type === ds.type)?.name || ds.type),
      amount: session.totalBill,
      paymentMethod: method as 'telebirr' | 'cbe_birr' | 'bank_transfer' | 'cash' | 'card',
      timestamp: new Date().toISOString(),
      status: 'paid' as const,
      transactionId: txId,
    };

    addTransaction(tx as any);
    markSessionPaid(selectedChairId);
    setLastTransaction({ ...tx, id: 'temp' } as any);
    setPaymentSuccess(true);
    setDemoRunning(false);

    addActivity({
      timestamp: new Date().toISOString(),
      chairId: selectedChairId,
      message: `Payment successful — ${session.totalBill} ETB via ${method}`,
      confidence: 100,
      type: 'payment',
    });
  };

  const handleNewCustomer = () => {
    setShowPayment(false);
    setPaymentSuccess(false);
    setLastTransaction(null);
    selectChair(null);
    setSelectedPaymentMethod('');
  };

  const selectedSession = sessions.find((s) => s.chairId === selectedChairId);

  const getServiceName = (type: string) => {
    return services.find((s) => s.type === type)?.name || type;
  };

  const paymentMethods = [
    { id: 'telebirr', name: 'Telebirr', color: 'from-green-500 to-green-600' },
    { id: 'cbe_birr', name: 'CBE Birr', color: 'from-blue-500 to-blue-600' },
    { id: 'bank_transfer', name: 'Bank Transfer', color: 'from-purple-500 to-purple-600' },
    { id: 'cash', name: 'Cash', color: 'from-amber-500 to-amber-600' },
    { id: 'card', name: 'Card', color: 'from-rose-500 to-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Shop Overview</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time AI-powered service detection & billing
          </p>
        </div>
        <button
          onClick={handleStartDemo}
          disabled={demoRunning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            demoRunning
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105'
          }`}
        >
          <Play className="w-4 h-4" />
          {demoRunning ? 'Demo Running...' : 'Start AI Demo'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Customers" value={activeSessions.length} color="emerald" darkMode={darkMode} />
        <StatCard icon={Armchair} label="Available Chairs" value={availableChairs} color="blue" darkMode={darkMode} />
        <StatCard icon={Scissors} label="Services Today" value={totalServicesToday} color="purple" darkMode={darkMode} />
        <StatCard icon={Banknote} label="Revenue Today" value={`${revenueToday.toLocaleString()} ETB`} color="amber" darkMode={darkMode} />
      </div>

      {/* System Status Bar */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <StatusIndicator label="AI Vision System" status={systemStatus.aiVision} darkMode={darkMode} />
        <StatusIndicator label={`${systemStatus.camerasConnected}/${systemStatus.cameras} Cameras`} status={systemStatus.camerasConnected === systemStatus.cameras ? 'online' : 'offline'} darkMode={darkMode} />
        <StatusIndicator label="AI Detection" status={systemStatus.detection === 'running' ? 'online' : 'offline'} darkMode={darkMode} />
        <StatusIndicator label="Payment System" status={systemStatus.payment === 'ready' ? 'online' : 'offline'} darkMode={darkMode} />
      </div>

      {/* Main Grid: Cameras + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Camera Grid */}
        <div className="xl:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Live Camera Feeds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['1', '2', '3', '4'].map((chairId) => {
              const session = sessions.find((s) => s.chairId === chairId && s.status === 'active');
              return (
                <ChairCard
                  key={chairId}
                  chairId={chairId}
                  session={session}
                  elapsed={elapsedTimes[chairId] || '00:00'}
                  darkMode={darkMode}
                  isSelected={selectedChairId === chairId}
                  onSelect={() => {
                    if (session) {
                      selectChair(chairId);
                      setShowBilling(true);
                    }
                  }}
                  getServiceName={getServiceName}
                />
              );
            })}
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-500" />
            AI Activity Timeline
          </h3>
          <div className={`rounded-xl p-4 h-[500px] overflow-y-auto ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            {activityLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Eye className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1">Start AI Demo to see live events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLog.map((event) => (
                  <ActivityItem key={event.id} event={event} darkMode={darkMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Panel Modal */}
      {showBilling && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedSession.customerName}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Chair {selectedSession.chairId} • Barber: {selectedSession.barberName}
                </p>
              </div>
              <button onClick={() => setShowBilling(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Detected Services</h4>
              {selectedSession.detectedServices.map((ds) => (
                <div key={ds.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    {ds.status === 'rejected' ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : ds.status === 'confirmed' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{getServiceName(ds.type)}</p>
                      <p className="text-xs text-gray-500">
                        AI: {ds.confidence}% • {ds.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{ds.price} ETB</span>
                    {ds.status === 'detected' && ds.confidence < 80 && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateServiceStatus(selectedSession.chairId, ds.id, 'confirmed')}
                          className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateServiceStatus(selectedSession.chairId, ds.id, 'rejected')}
                          className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 space-y-2`}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>{selectedSession.totalBill} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Discount</span>
                <span>0 ETB</span>
              </div>
              <div className={`flex justify-between text-lg font-bold pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span>TOTAL</span>
                <span className="text-emerald-500">{selectedSession.totalBill} ETB</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmBill}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Confirm & Pay
              </button>
              <button
                onClick={() => setShowBilling(false)}
                className={`px-4 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedSession && !paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">{selectedSession.customerName}</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount Due</p>
              <p className="text-4xl font-bold text-emerald-500 mt-2">{selectedSession.totalBill} ETB</p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Select Payment Method</p>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    handlePayment(method.id);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                    selectedPaymentMethod === method.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : darkMode
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{method.name}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              ))}
            </div>

            <button
              onClick={() => { setShowPayment(false); setSelectedPaymentMethod(''); }}
              className={`w-full py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && lastTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-8 text-center ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>
            <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Successful</h3>
            <p className="text-3xl font-bold text-emerald-500 mb-2">{lastTransaction.amount} ETB</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Transaction #{lastTransaction.transactionId}
            </p>

            <div className="mt-8 space-y-3">
              <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                Print Receipt
              </button>
              <button className={`w-full py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                Send Receipt
              </button>
              <button
                onClick={handleNewCustomer}
                className={`w-full py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                New Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, darkMode }: {
  icon: any; label: string; value: number | string; color: string; darkMode: boolean;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  };
  const iconColors: Record<string, string> = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border ${darkMode ? '' : 'bg-white'}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// Status Indicator
function StatusIndicator({ label, status, darkMode }: { label: string; status: string; darkMode: boolean }) {
  const isOnline = status === 'online';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className={`text-[10px] ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
}

// Chair Card Component
function ChairCard({ chairId, session, elapsed, darkMode, isSelected, onSelect, getServiceName }: {
  chairId: string;
  session: any;
  elapsed: string;
  darkMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  getServiceName: (type: string) => string;
}) {
  const currentService = session?.detectedServices.filter((ds: any) => ds.status !== 'rejected').pop();

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer hover:scale-[1.02] ${
        isSelected
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
          : darkMode
            ? 'border-gray-800 hover:border-gray-700'
            : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Camera Preview Simulation */}
      <div className={`relative h-40 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
        {/* Simulated camera feed */}
        <div className="absolute inset-0 flex items-center justify-center">
          {session ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400">AI Monitoring Active</p>
            </div>
          ) : (
            <div className="text-center">
              <Armchair className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Chair Empty</p>
            </div>
          )}
        </div>

        {/* Scan line animation */}
        {session && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-0.5 bg-emerald-500/30 animate-scan" />
          </div>
        )}

        {/* AI LIVE indicator */}
        {session && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-red-600 rounded-md">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white">AI LIVE</span>
          </div>
        )}

        {/* Chair number */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}`}>
          Chair {chairId}
        </div>
      </div>

      {/* Info Panel */}
      <div className={`p-3 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {session ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{session.customerName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Barber: {session.barberName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {elapsed}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {currentService ? getServiceName(currentService.type) : 'Waiting...'}
              </span>
              <span className="text-emerald-500 font-semibold">
                {currentService ? `${currentService.confidence}%` : '—'}
              </span>
            </div>
            <div className={`flex items-center justify-between pt-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <span className="text-xs text-gray-500">Current Bill</span>
              <span className="text-sm font-bold text-emerald-500">{session.totalBill} ETB</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Item
function ActivityItem({ event, darkMode }: { event: any; darkMode: boolean }) {
  const typeColors: Record<string, string> = {
    customer_enter: 'text-blue-400',
    service_start: 'text-emerald-400',
    service_detect: 'text-cyan-400',
    service_complete: 'text-purple-400',
    bill_generated: 'text-amber-400',
    payment: 'text-emerald-500',
    customer_leave: 'text-gray-400',
  };

  const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className={`flex items-start gap-3 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
      <span className={`text-[10px] font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap mt-0.5`}>
        {time}
      </span>
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${typeColors[event.type]?.replace('text-', 'bg-') || 'bg-gray-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Chair {event.chairId}</span>
          {' — '}
          <span className={typeColors[event.type]}>{event.message}</span>
        </p>
        <p className="text-[10px] text-gray-500">{event.confidence}% confidence</p>
      </div>
    </div>
  );
}
