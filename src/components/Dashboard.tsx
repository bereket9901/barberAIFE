import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { runDemoSimulation } from '../simulation';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Separator } from './ui/separator';
import {
  Users, Armchair, Scissors, Banknote, Play,
  CreditCard, Activity, Clock, ChevronRight, AlertTriangle,
  Check, X, Eye, Zap, TrendingUp, TrendingDown
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
  const getServiceName = (type: string) => services.find((s) => s.type === type)?.name || type;

  const paymentMethods = [
    { id: 'telebirr', name: 'Telebirr', color: 'gradient-success', icon: '📱' },
    { id: 'cbe_birr', name: 'CBE Birr', color: 'gradient-info', icon: '🏦' },
    { id: 'bank_transfer', name: 'Bank Transfer', color: 'gradient-primary', icon: '💳' },
    { id: 'cash', name: 'Cash', color: 'gradient-warning', icon: '💵' },
    { id: 'card', name: 'Card', color: 'gradient-pink', icon: '💳' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Abel 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening at your shop today.</p>
        </div>
        <Button onClick={handleStartDemo} disabled={demoRunning} className="gap-2 shadow-soft">
          <Play className="h-4 w-4" />
          {demoRunning ? 'Demo Running...' : 'Start AI Demo'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{activeSessions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Customers</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl gradient-success flex items-center justify-center">
                <Armchair className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">of 4 total</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{availableChairs}</p>
            <p className="text-xs text-muted-foreground mt-1">Available Chairs</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl gradient-warning flex items-center justify-center">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalServicesToday}</p>
            <p className="text-xs text-muted-foreground mt-1">Services Today</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl gradient-info flex items-center justify-center">
                <Banknote className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +23%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{revenueToday.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Revenue (ETB)</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Camera Feeds */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Live Camera Feeds</h3>
            <Badge variant="secondary" className="gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              AI Active
            </Badge>
          </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">AI Activity</h3>
            <button className="text-xs text-primary font-medium hover:underline">View all</button>
          </div>
          <Card className="h-[460px] overflow-hidden flex flex-col shadow-card">
            <CardContent className="flex-1 overflow-y-auto p-4">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium">No activity yet</p>
                  <p className="text-xs mt-1">Start AI Demo to see live events</p>
                </div>
              ) : (
                <div className="space-y-1">
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
            <DialogTitle className="flex items-center gap-2">
              {selectedSession?.customerName}
              <Badge variant="secondary">Chair {selectedSession?.chairId}</Badge>
            </DialogTitle>
            <DialogDescription>
              Barber: {selectedSession?.barberName}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detected Services</p>
                {selectedSession.detectedServices.map((ds) => (
                  <div key={ds.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        ds.status === 'rejected' ? "bg-destructive/10" :
                        ds.status === 'confirmed' ? "bg-success/10" : "bg-warning/10"
                      )}>
                        {ds.status === 'rejected' ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : ds.status === 'confirmed' ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{getServiceName(ds.type)}</p>
                        <p className="text-xs text-muted-foreground">AI: {ds.confidence}% • {ds.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{ds.price} ETB</span>
                      {ds.status === 'detected' && ds.confidence < 80 && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateServiceStatus(selectedSession.chairId, ds.id, 'confirmed')}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateServiceStatus(selectedSession.chairId, ds.id, 'rejected')}>
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
                  <span className="font-medium">{selectedSession.totalBill} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>0 ETB</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold pt-1">
                  <span>Total</span>
                  <span className="text-primary">{selectedSession.totalBill} ETB</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleConfirmBill} className="flex-1 shadow-soft">Confirm & Pay</Button>
                <Button variant="outline" onClick={() => setShowBilling(false)}>Edit</Button>
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
            <DialogDescription className="text-center">Select payment method</DialogDescription>
          </DialogHeader>

          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-foreground">{selectedSession?.totalBill}</p>
            <p className="text-sm text-muted-foreground">ETB</p>
          </div>

          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedPaymentMethod(method.id);
                  handlePayment(method.id);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
              >
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-lg", method.color)}>
                  {method.icon}
                </div>
                <span className="font-medium text-sm flex-1">{method.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={() => { setShowPayment(false); setSelectedPaymentMethod(''); }}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Payment Success Dialog */}
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto h-16 w-16 rounded-2xl gradient-success flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-1">Payment Successful</h3>
            <p className="text-3xl font-bold text-primary mb-1">{lastTransaction?.amount} ETB</p>
            <p className="text-sm text-muted-foreground">Transaction #{lastTransaction?.transactionId}</p>

            <div className="mt-8 space-y-2">
              <Button className="w-full shadow-soft">Print Receipt</Button>
              <Button variant="outline" className="w-full">Send Receipt</Button>
              <Button variant="ghost" className="w-full" onClick={handleNewCustomer}>New Customer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
        "cursor-pointer transition-all hover:shadow-elevated overflow-hidden",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      {/* Camera Preview */}
      <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {session ? (
            <div className="text-center">
              <div className="h-14 w-14 mx-auto rounded-full bg-card/80 flex items-center justify-center mb-2 shadow-soft">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">AI Monitoring</p>
            </div>
          ) : (
            <div className="text-center">
              <Armchair className="h-10 w-10 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground/60">Empty</p>
            </div>
          )}
        </div>

        {/* Scan line */}
        {session && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-full h-0.5 bg-primary/30 animate-scan" />
          </div>
        )}

        {/* Status badges */}
        {session && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-destructive rounded-md">
              <div className="h-1 w-1 bg-white rounded-full animate-pulse" />
              <span className="text-[8px] font-bold text-white">LIVE</span>
            </div>
          </div>
        )}

        <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
          Chair {chairId}
        </Badge>
      </div>

      {/* Info */}
      <CardContent className="p-3">
        {session ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{session.customerName}</span>
              <Badge variant="secondary" className="text-[10px] bg-success/10 text-success border-success/20">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{session.barberName}</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                {elapsed}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentService ? getServiceName(currentService.type) : 'Waiting...'}
              </span>
              <span className="text-xs font-bold text-primary">{session.totalBill} ETB</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-1">
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Activity Item Component
function ActivityItem({ event }: { event: any }) {
  const typeColors: Record<string, string> = {
    customer_enter: 'bg-info',
    service_start: 'bg-primary',
    service_detect: 'bg-purple',
    service_complete: 'bg-success',
    bill_generated: 'bg-warning',
    payment: 'bg-success',
    customer_leave: 'bg-muted-foreground',
  };

  const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
      <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap mt-0.5">{time}</span>
      <div className={cn("h-2 w-2 rounded-full mt-1 flex-shrink-0", typeColors[event.type] || 'bg-muted-foreground')} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-foreground">
          Chair {event.chairId} — {event.message}
        </p>
        <p className="text-[10px] text-muted-foreground">{event.confidence}% confidence</p>
      </div>
    </div>
  );
}
