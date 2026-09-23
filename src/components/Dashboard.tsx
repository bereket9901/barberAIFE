import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { runDemoSimulation } from '../simulation';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import {
  Users, Armchair, Scissors, Banknote, Play,
  CreditCard, Activity, Clock, ChevronRight, AlertTriangle,
  Check, X, Eye, Zap
} from 'lucide-react';

export default function Dashboard() {
  const {
    sessions, transactions, services, systemStatus,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live Shop Overview</h2>
          <p className="text-muted-foreground">Real-time AI-powered service detection & billing</p>
        </div>
        <Button onClick={handleStartDemo} disabled={demoRunning} size="lg" className="gap-2">
          <Play className="h-4 w-4" />
          {demoRunning ? 'Demo Running...' : 'Start AI Demo'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Chairs</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableChairs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Today</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServicesToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueToday.toLocaleString()} ETB</div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
          <StatusIndicator label="AI Vision System" status={systemStatus.aiVision} />
          <StatusIndicator label={`${systemStatus.camerasConnected}/${systemStatus.cameras} Cameras`} status={systemStatus.camerasConnected === systemStatus.cameras ? 'online' : 'offline'} />
          <StatusIndicator label="AI Detection" status={systemStatus.detection === 'running' ? 'online' : 'offline'} />
          <StatusIndicator label="Payment System" status={systemStatus.payment === 'ready' ? 'online' : 'offline'} />
        </CardContent>
      </Card>

      {/* Main Grid: Cameras + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Camera Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Camera Feeds
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {['1', '2', '3', '4'].map((chairId) => {
              const session = sessions.find((s) => s.chairId === chairId && s.status === 'active');
              return (
                <ChairCard
                  key={chairId}
                  chairId={chairId}
                  session={session}
                  elapsed={elapsedTimes[chairId] || '00:00'}
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI Activity Timeline
          </h3>
          <Card className="h-[500px] overflow-hidden flex flex-col">
            <CardContent className="flex-1 overflow-y-auto pt-6">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Eye className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs mt-1">Start AI Demo to see live events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLog.map((event) => (
                    <ActivityItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Billing Dialog */}
      <Dialog open={showBilling} onOpenChange={setShowBilling}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSession?.customerName}</DialogTitle>
            <DialogDescription>
              Chair {selectedSession?.chairId} • Barber: {selectedSession?.barberName}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Detected Services</h4>
                {selectedSession.detectedServices.map((ds) => (
                  <div key={ds.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {ds.status === 'rejected' ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : ds.status === 'confirmed' ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{getServiceName(ds.type)}</p>
                        <p className="text-xs text-muted-foreground">
                          AI: {ds.confidence}% • {ds.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{ds.price} ETB</span>
                      {ds.status === 'detected' && ds.confidence < 80 && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateServiceStatus(selectedSession.chairId, ds.id, 'confirmed')}
                            className="h-7 w-7"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateServiceStatus(selectedSession.chairId, ds.id, 'rejected')}
                            className="h-7 w-7"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{selectedSession.totalBill} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>0 ETB</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>TOTAL</span>
                  <span className="text-primary">{selectedSession.totalBill} ETB</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConfirmBill} className="flex-1">
                  Confirm & Pay
                </Button>
                <Button variant="outline" onClick={() => setShowBilling(false)}>
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment && !paymentSuccess} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{selectedSession?.customerName}</DialogTitle>
            <DialogDescription className="text-center">Amount Due</DialogDescription>
          </DialogHeader>

          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-primary">{selectedSession?.totalBill} ETB</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Payment Method</p>
            {paymentMethods.map((method) => (
              <Button
                key={method.id}
                variant="outline"
                className="w-full justify-between h-auto py-4"
                onClick={() => {
                  setSelectedPaymentMethod(method.id);
                  handlePayment(method.id);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{method.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={() => { setShowPayment(false); setSelectedPaymentMethod(''); }}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Payment Success Dialog */}
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Successful</h3>
            <p className="text-3xl font-bold text-primary mb-2">{lastTransaction?.amount} ETB</p>
            <p className="text-sm text-muted-foreground">
              Transaction #{lastTransaction?.transactionId}
            </p>

            <div className="mt-8 space-y-3">
              <Button className="w-full">Print Receipt</Button>
              <Button variant="outline" className="w-full">Send Receipt</Button>
              <Button variant="outline" className="w-full" onClick={handleNewCustomer}>
                New Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Status Indicator Component
function StatusIndicator({ label, status }: { label: string; status: string }) {
  const isOnline = status === 'online';
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2.5 w-2.5 rounded-full", isOnline ? "bg-primary animate-pulse" : "bg-destructive")} />
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className={cn("text-[10px]", isOnline ? "text-primary" : "text-destructive")}>
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
}

// Chair Card Component
function ChairCard({ chairId, session, elapsed, isSelected, onSelect, getServiceName }: {
  chairId: string;
  session: any;
  elapsed: string;
  isSelected: boolean;
  onSelect: () => void;
  getServiceName: (type: string) => string;
}) {
  const currentService = session?.detectedServices.filter((ds: any) => ds.status !== 'rejected').pop();

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      {/* Camera Preview */}
      <div className="relative h-40 bg-muted overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {session ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-background flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">AI Monitoring Active</p>
            </div>
          ) : (
            <div className="text-center">
              <Armchair className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Chair Empty</p>
            </div>
          )}
        </div>

        {/* Scan line animation */}
        {session && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-0.5 bg-primary/30 animate-scan" />
          </div>
        )}

        {/* AI LIVE indicator */}
        {session && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-destructive rounded-md">
            <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white">AI LIVE</span>
          </div>
        )}

        {/* Chair number */}
        <Badge variant="secondary" className="absolute top-2 right-2">
          Chair {chairId}
        </Badge>
      </div>

      {/* Info Panel */}
      <CardContent className="p-4">
        {session ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{session.customerName}</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Barber: {session.barberName}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {elapsed}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentService ? getServiceName(currentService.type) : 'Waiting...'}</span>
              <span className="text-primary font-semibold">
                {currentService ? `${currentService.confidence}%` : '—'}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Bill</span>
              <span className="text-sm font-bold text-primary">{session.totalBill} ETB</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Activity Item Component
function ActivityItem({ event }: { event: any }) {
  const typeColors: Record<string, string> = {
    customer_enter: 'text-blue-500',
    service_start: 'text-primary',
    service_detect: 'text-cyan-500',
    service_complete: 'text-purple-500',
    bill_generated: 'text-amber-500',
    payment: 'text-primary',
    customer_leave: 'text-muted-foreground',
  };

  const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap mt-0.5">
        {time}
      </span>
      <div className={cn("h-1.5 w-1.5 rounded-full mt-1.5", typeColors[event.type]?.replace('text-', 'bg-') || 'bg-muted-foreground')} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          <span className="text-foreground">Chair {event.chairId}</span>
          {' — '}
          <span className={typeColors[event.type]}>{event.message}</span>
        </p>
        <p className="text-[10px] text-muted-foreground">{event.confidence}% confidence</p>
      </div>
    </div>
  );
}
