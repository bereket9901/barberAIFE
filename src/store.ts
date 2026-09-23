import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Camera,
  Service,
  CustomerSession,
  Transaction,
  ActivityEvent,
  DetectedService,
  SystemStatus,
} from './types';

interface AppState {
  // System
  systemStatus: SystemStatus;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Cameras
  cameras: Camera[];

  // Services
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Sessions
  sessions: CustomerSession[];
  selectedChairId: string | null;
  selectChair: (chairId: string | null) => void;
  startSession: (chairId: string, customerName: string, customerId: string, barberId: string, barberName: string) => void;
  addDetectedService: (chairId: string, service: DetectedService) => void;
  updateServiceStatus: (chairId: string, serviceId: string, status: DetectedService['status']) => void;
  completeSession: (chairId: string) => void;
  markSessionPaid: (chairId: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;

  // Activity
  activityLog: ActivityEvent[];
  addActivity: (event: Omit<ActivityEvent, 'id'>) => void;

  // Demo mode
  demoRunning: boolean;
  setDemoRunning: (running: boolean) => void;

  // Payment
  showPayment: boolean;
  setShowPayment: (show: boolean) => void;
  paymentSuccess: boolean;
  setPaymentSuccess: (success: boolean) => void;
  lastTransaction: Transaction | null;
  setLastTransaction: (tx: Transaction | null) => void;

  // Billing
  showBilling: boolean;
  setShowBilling: (show: boolean) => void;
}

const defaultServices: Service[] = [
  { id: '1', name: 'Haircut', type: 'haircut', price: 300, duration: 30, enabled: true },
  { id: '2', name: 'Beard Trim', type: 'beard_trim', price: 150, duration: 15, enabled: true },
  { id: '3', name: 'Hair Wash', type: 'hair_wash', price: 100, duration: 10, enabled: true },
  { id: '4', name: 'Hair Coloring', type: 'hair_coloring', price: 500, duration: 60, enabled: true },
  { id: '5', name: 'Shaving', type: 'shaving', price: 150, duration: 20, enabled: true },
  { id: '6', name: 'Facial', type: 'facial', price: 300, duration: 25, enabled: true },
];

const defaultCameras: Camera[] = [
  { id: 'cam-1', name: 'Camera 1', chairId: '1', status: 'online' },
  { id: 'cam-2', name: 'Camera 2', chairId: '2', status: 'online' },
  { id: 'cam-3', name: 'Camera 3', chairId: '3', status: 'online' },
  { id: 'cam-4', name: 'Camera 4', chairId: '4', status: 'online' },
];

const initialTransactions: Transaction[] = [
  {
    id: '1', sessionId: 's1', customerId: '1038', customerName: 'Customer #1038',
    barberName: 'Dawit', services: ['Haircut', 'Hair Wash'], amount: 400,
    paymentMethod: 'telebirr', timestamp: '2026-01-15T09:30:00', status: 'paid', transactionId: 'TX-1038'
  },
  {
    id: '2', sessionId: 's2', customerId: '1039', customerName: 'Customer #1039',
    barberName: 'Abel', services: ['Beard Trim', 'Shaving'], amount: 300,
    paymentMethod: 'cbe_birr', timestamp: '2026-01-15T10:15:00', status: 'paid', transactionId: 'TX-1039'
  },
  {
    id: '3', sessionId: 's3', customerId: '1040', customerName: 'Customer #1040',
    barberName: 'Yonas', services: ['Haircut'], amount: 300,
    paymentMethod: 'cash', timestamp: '2026-01-15T10:45:00', status: 'paid', transactionId: 'TX-1040'
  },
];

const initialSessions: CustomerSession[] = [
  {
    id: 'sess-1', chairId: '1', customerName: 'Customer #1041', customerId: '1041',
    barberId: 'b1', barberName: 'Dawit', startTime: '2026-01-15T11:00:00',
    status: 'active',
    detectedServices: [
      { id: 'ds1', type: 'haircut', confidence: 94, status: 'confirmed', detectedAt: '2026-01-15T11:02:00', price: 300 },
    ],
    totalBill: 300,
  },
  {
    id: 'sess-3', chairId: '3', customerName: 'Customer #1043', customerId: '1043',
    barberId: 'b3', barberName: 'Yonas', startTime: '2026-01-15T11:20:00',
    status: 'active',
    detectedServices: [
      { id: 'ds5', type: 'shaving', confidence: 92, status: 'confirmed', detectedAt: '2026-01-15T11:22:00', price: 150 },
    ],
    totalBill: 150,
  },
];

export const useStore = create<AppState>((set, get) => ({
  // System
  systemStatus: {
    aiVision: 'online',
    cameras: 4,
    camerasConnected: 4,
    detection: 'running',
    payment: 'ready',
  },
  darkMode: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  // Cameras
  cameras: defaultCameras,

  // Services
  services: defaultServices,
  addService: (service) => set((s) => ({
    services: [...s.services, { ...service, id: uuidv4() }]
  })),
  updateService: (id, updates) => set((s) => ({
    services: s.services.map((svc) => svc.id === id ? { ...svc, ...updates } : svc)
  })),
  deleteService: (id) => set((s) => ({
    services: s.services.filter((svc) => svc.id !== id)
  })),

  // Sessions
  sessions: initialSessions,
  selectedChairId: null,
  selectChair: (chairId) => set({ selectedChairId: chairId }),
  startSession: (chairId, customerName, customerId, barberId, barberName) => set((s) => ({
    sessions: [...s.sessions, {
      id: uuidv4(), chairId, customerName, customerId, barberId, barberName,
      startTime: new Date().toISOString(), status: 'active',
      detectedServices: [], totalBill: 0,
    }]
  })),
  addDetectedService: (chairId, service) => set((s) => ({
    sessions: s.sessions.map((sess) => {
      if (sess.chairId === chairId && sess.status === 'active') {
        const newServices = [...sess.detectedServices, service];
        const totalBill = newServices
          .filter((ds) => ds.status !== 'rejected')
          .reduce((sum, ds) => sum + ds.price, 0);
        return { ...sess, detectedServices: newServices, totalBill };
      }
      return sess;
    })
  })),
  updateServiceStatus: (chairId, serviceId, status) => set((s) => ({
    sessions: s.sessions.map((sess) => {
      if (sess.chairId === chairId) {
        const newServices = sess.detectedServices.map((ds) =>
          ds.id === serviceId ? { ...ds, status } : ds
        );
        const totalBill = newServices
          .filter((ds) => ds.status !== 'rejected')
          .reduce((sum, ds) => sum + ds.price, 0);
        return { ...sess, detectedServices: newServices, totalBill };
      }
      return sess;
    })
  })),
  completeSession: (chairId) => set((s) => ({
    sessions: s.sessions.map((sess) =>
      sess.chairId === chairId ? { ...sess, status: 'completed' as const } : sess
    )
  })),
  markSessionPaid: (chairId) => set((s) => ({
    sessions: s.sessions.map((sess) =>
      sess.chairId === chairId ? { ...sess, status: 'paid' as const } : sess
    )
  })),

  // Transactions
  transactions: initialTransactions,
  addTransaction: (transaction) => set((s) => ({
    transactions: [{ ...transaction, id: uuidv4() }, ...s.transactions]
  })),

  // Activity
  activityLog: [],
  addActivity: (event) => set((s) => ({
    activityLog: [{ ...event, id: uuidv4() }, ...s.activityLog].slice(0, 50)
  })),

  // Demo
  demoRunning: false,
  setDemoRunning: (running) => set({ demoRunning: running }),

  // Payment
  showPayment: false,
  setShowPayment: (show) => set({ showPayment: show }),
  paymentSuccess: false,
  setPaymentSuccess: (success) => set({ paymentSuccess: success }),
  lastTransaction: null,
  setLastTransaction: (tx) => set({ lastTransaction: tx }),

  // Billing
  showBilling: false,
  setShowBilling: (show) => set({ showBilling: show }),
}));
