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
import {
  servicesAPI,
  sessionsAPI,
  transactionsAPI,
  camerasAPI,
  activityAPI,
  aiAPI
} from './lib/api';

interface AppState {
  // System
  systemStatus: SystemStatus;
  loading: boolean;
  error: string | null;

  // Cameras
  cameras: Camera[];
  fetchCameras: () => Promise<void>;

  // Services
  services: Service[];
  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Sessions
  sessions: CustomerSession[];
  selectedChairId: string | null;
  selectChair: (chairId: string | null) => void;
  fetchSessions: () => Promise<void>;
  startSession: (chairId: string, customerName: string, customerId: string, barberId: string, barberName: string) => Promise<void>;
  addDetectedService: (chairId: string, service: DetectedService) => Promise<void>;
  updateServiceStatus: (chairId: string, serviceId: string, status: DetectedService['status']) => Promise<void>;
  completeSession: (chairId: string) => Promise<void>;
  markSessionPaid: (chairId: string) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | null>;

  // Activity
  activityLog: ActivityEvent[];
  fetchActivity: () => Promise<void>;
  addActivity: (event: Omit<ActivityEvent, 'id'>) => Promise<void>;

  // Demo mode
  demoRunning: boolean;
  setDemoRunning: (running: boolean) => void;
  runDemo: (chairId: string) => Promise<void>;

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

export const useStore = create<AppState>((set, get) => ({
  // System
  systemStatus: {
    aiVision: 'online',
    cameras: 4,
    camerasConnected: 4,
    detection: 'running',
    payment: 'ready',
  },
  loading: false,
  error: null,

  // Cameras
  cameras: [],
  fetchCameras: async () => {
    try {
      set({ loading: true, error: null });
      const response = await camerasAPI.getAll();
      set({ cameras: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch cameras:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Services
  services: [],
  fetchServices: async () => {
    try {
      set({ loading: true, error: null });
      const response = await servicesAPI.getAll();
      set({ services: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch services:', error);
      set({ error: error.message, loading: false });
    }
  },
  addService: async (service) => {
    try {
      set({ loading: true, error: null });
      const response = await servicesAPI.create(service);
      await get().fetchServices();
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to add service:', error);
      set({ error: error.message, loading: false });
    }
  },
  updateService: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      await servicesAPI.update(id, updates);
      await get().fetchServices();
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to update service:', error);
      set({ error: error.message, loading: false });
    }
  },
  deleteService: async (id) => {
    try {
      set({ loading: true, error: null });
      await servicesAPI.delete(id);
      await get().fetchServices();
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to delete service:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Sessions
  sessions: [],
  selectedChairId: null,
  selectChair: (chairId) => set({ selectedChairId: chairId }),
  fetchSessions: async () => {
    try {
      set({ loading: true, error: null });
      const response = await sessionsAPI.getAll();
      // Transform backend data to match frontend types
      const sessions = response.data.map((s: any) => ({
        id: s.id,
        chairId: s.chair_id,
        customerName: s.customer_name,
        customerId: s.customer_id,
        barberId: s.barber_id,
        barberName: s.barber_name,
        startTime: s.start_time,
        status: s.status,
        detectedServices: s.detectedServices.map((ds: any) => ({
          id: ds.id,
          type: ds.type,
          confidence: ds.confidence,
          status: ds.status,
          detectedAt: ds.detected_at,
          completedAt: ds.completed_at,
          price: ds.price,
        })),
        totalBill: s.total_bill,
      }));
      set({ sessions, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      set({ error: error.message, loading: false });
    }
  },
  startSession: async (chairId, customerName, customerId, barberId, barberName) => {
    try {
      set({ loading: true, error: null });
      await sessionsAPI.create({ chairId, customerName, customerId, barberId, barberName });
      await get().fetchSessions();
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to start session:', error);
      set({ error: error.message, loading: false });
    }
  },
  addDetectedService: async (chairId, service) => {
    try {
      set({ loading: true, error: null });
      const session = get().sessions.find(s => s.chairId === chairId && s.status === 'active');
      if (!session) throw new Error('No active session found');
      
      await sessionsAPI.addDetectedService(session.id, {
        type: service.type,
        confidence: service.confidence,
        price: service.price,
      });
      await get().fetchSessions();
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to add detected service:', error);
      set({ error: error.message, loading: false });
    }
  },
  updateServiceStatus: async (chairId, serviceId, status) => {
    try {
      set({ loading: true, error: null });
      await sessionsAPI.updateDetectedServiceStatus(serviceId, status);
      await get().fetchSessions();
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to update service status:', error);
      set({ error: error.message, loading: false });
    }
  },
  completeSession: async (chairId) => {
    try {
      set({ loading: true, error: null });
      const session = get().sessions.find(s => s.chairId === chairId && s.status === 'active');
      if (!session) throw new Error('No active session found');
      
      await sessionsAPI.complete(session.id);
      await get().fetchSessions();
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to complete session:', error);
      set({ error: error.message, loading: false });
    }
  },
  markSessionPaid: async (chairId) => {
    // This is handled by createTransaction
    await get().fetchSessions();
  },

  // Transactions
  transactions: [],
  fetchTransactions: async () => {
    try {
      set({ loading: true, error: null });
      const response = await transactionsAPI.getAll();
      // Transform backend data to match frontend types
      const transactions = response.data.map((t: any) => ({
        id: t.id,
        sessionId: t.session_id,
        customerId: t.customer_id,
        customerName: t.customer_name,
        barberName: t.barber_name,
        services: t.services,
        amount: t.amount,
        paymentMethod: t.payment_method,
        timestamp: t.timestamp,
        status: t.status,
        transactionId: t.transaction_id,
      }));
      set({ transactions, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      set({ error: error.message, loading: false });
    }
  },
  addTransaction: async (transaction) => {
    try {
      set({ loading: true, error: null });
      const response = await transactionsAPI.create({
        sessionId: transaction.sessionId,
        paymentMethod: transaction.paymentMethod,
      });
      await get().fetchTransactions();
      await get().fetchSessions();
      set({ loading: false });
      // Transform response to match frontend Transaction type
      const tx = response.data;
      return {
        id: tx.id,
        sessionId: tx.session_id,
        customerId: tx.customer_id,
        customerName: tx.customer_name,
        barberName: tx.barber_name,
        services: tx.services,
        amount: tx.amount,
        paymentMethod: tx.payment_method,
        timestamp: tx.timestamp,
        status: tx.status,
        transactionId: tx.transaction_id,
      };
    } catch (error: any) {
      console.error('Failed to add transaction:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Activity
  activityLog: [],
  fetchActivity: async () => {
    try {
      set({ loading: true, error: null });
      const response = await activityAPI.getAll({ limit: '50' });
      const activityLog = response.data.map((a: any) => ({
        id: a.id,
        timestamp: a.timestamp,
        chairId: a.chair_id,
        message: a.message,
        confidence: a.confidence,
        type: a.type,
      }));
      set({ activityLog, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch activity:', error);
      set({ error: error.message, loading: false });
    }
  },
  addActivity: async (event) => {
    try {
      await activityAPI.add(event);
      await get().fetchActivity();
    } catch (error: any) {
      console.error('Failed to add activity:', error);
    }
  },

  // Demo
  demoRunning: false,
  setDemoRunning: (running) => set({ demoRunning: running }),
  runDemo: async (chairId) => {
    try {
      set({ loading: true, error: null, demoRunning: true });
      await aiAPI.runDemo(chairId);
      await Promise.all([
        get().fetchSessions(),
        get().fetchActivity(),
      ]);
      set({ loading: false, demoRunning: false });
    } catch (error: any) {
      console.error('Failed to run demo:', error);
      set({ error: error.message, loading: false, demoRunning: false });
    }
  },

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
