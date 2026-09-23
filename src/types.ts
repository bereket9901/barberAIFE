// Camera architecture - ready for real camera integration
export interface Camera {
  id: string;
  name: string;
  chairId: string;
  streamUrl?: string;
  status: 'online' | 'offline';
}

// AI Detection architecture - abstraction for vision models
export interface Detection {
  type: ServiceType;
  confidence: number;
  chairId: string;
  timestamp: string;
}

export type ServiceType =
  | 'haircut'
  | 'beard_trim'
  | 'hair_wash'
  | 'shaving'
  | 'hair_coloring'
  | 'facial';

export interface DetectedService {
  id: string;
  type: ServiceType;
  confidence: number;
  status: 'detected' | 'confirmed' | 'charged' | 'rejected';
  detectedAt: string;
  completedAt?: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  duration: number; // minutes
  enabled: boolean;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export interface CustomerSession {
  id: string;
  chairId: string;
  customerName: string;
  customerId: string;
  barberId: string;
  barberName: string;
  startTime: string;
  status: 'active' | 'completed' | 'paid';
  detectedServices: DetectedService[];
  totalBill: number;
}

export interface Transaction {
  id: string;
  sessionId: string;
  customerId: string;
  customerName: string;
  barberName: string;
  services: string[];
  amount: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  status: 'paid' | 'pending' | 'failed';
  transactionId: string;
}

export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'bank_transfer' | 'cash' | 'card';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  chairId: string;
  message: string;
  confidence: number;
  type: 'service_start' | 'service_detect' | 'service_complete' | 'customer_enter' | 'customer_leave' | 'payment' | 'bill_generated';
}

// Vision Detector interface - abstraction for AI models
export interface VisionDetector {
  detect(frame: unknown): Promise<Detection[]>;
}

export interface SystemStatus {
  aiVision: 'online' | 'offline';
  cameras: number;
  camerasConnected: number;
  detection: 'running' | 'stopped';
  payment: 'ready' | 'error';
}
