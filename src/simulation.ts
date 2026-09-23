import { v4 as uuidv4 } from 'uuid';
import { useStore } from './store';
import type { DetectedService, ServiceType } from './types';

const barbers = [
  { id: 'b1', name: 'Dawit' },
  { id: 'b2', name: 'Abel' },
  { id: 'b3', name: 'Yonas' },
  { id: 'b4', name: 'Samuel' },
];

const customerNames = [
  'Customer #1045', 'Customer #1046', 'Customer #1047',
  'Customer #1048', 'Customer #1049', 'Customer #1050',
];

let customerCounter = 1045;

export function runDemoSimulation() {
  const store = useStore.getState();
  store.setDemoRunning(true);

  // Find an available chair (chair with no active session)
  const activeChairs = store.sessions
    .filter((s) => s.status === 'active')
    .map((s) => s.chairId);
  
  // Prefer chair 2 for demo (as shown in spec example)
  const preferredOrder = ['2', '4', '1', '3'];
  const availableChair = preferredOrder.find((c) => !activeChairs.includes(c));
  
  if (availableChair) {
    simulateOnChair(availableChair);
  } else {
    // All chairs occupied - use chair 2 anyway
    simulateOnChair('2');
  }
}

function simulateOnChair(chairId: string) {
  const store = useStore.getState();
  const barber = barbers[parseInt(chairId) - 1];
  const customerName = customerNames[customerCounter - 1045] || `Customer #${customerCounter}`;
  const customerId = String(customerCounter);
  customerCounter++;

  // Step 1: Customer enters
  setTimeout(() => {
    const s = useStore.getState();
    s.addActivity({
      timestamp: new Date().toISOString(),
      chairId,
      message: `${customerName} entered the shop`,
      confidence: 99,
      type: 'customer_enter',
    });
  }, 500);

  // Step 2: Assigned to chair
  setTimeout(() => {
    const s = useStore.getState();
    s.addActivity({
      timestamp: new Date().toISOString(),
      chairId,
      message: `Assigned to Chair ${chairId}`,
      confidence: 98,
      type: 'customer_enter',
    });
    s.startSession(chairId, customerName, customerId, barber.id, barber.name);
  }, 1500);

  // Step 3+: Services detected
  let delay = 2500;
  const servicesToDetect = [
    { type: 'haircut' as ServiceType, name: 'Haircut', price: 300, confidence: 96 },
    { type: 'beard_trim' as ServiceType, name: 'Beard Trim', price: 150, confidence: 91 },
    { type: 'hair_wash' as ServiceType, name: 'Hair Wash', price: 100, confidence: 88 },
  ];

  servicesToDetect.forEach((svc, index) => {
    // Service start detected
    setTimeout(() => {
      const s = useStore.getState();
      s.addActivity({
        timestamp: new Date().toISOString(),
        chairId,
        message: `${svc.name} started`,
        confidence: svc.confidence,
        type: 'service_start',
      });
    }, delay);
    delay += 1500;

    // Tool detected
    setTimeout(() => {
      const s = useStore.getState();
      const tools = ['Hair clippers detected', 'Scissors detected', 'Water spray detected'];
      s.addActivity({
        timestamp: new Date().toISOString(),
        chairId,
        message: tools[index] || 'Tool detected',
        confidence: svc.confidence - 2,
        type: 'service_detect',
      });
    }, delay);
    delay += 2000;

    // Service completed
    setTimeout(() => {
      const s = useStore.getState();
      s.addActivity({
        timestamp: new Date().toISOString(),
        chairId,
        message: `${svc.name} completed`,
        confidence: svc.confidence + 1,
        type: 'service_complete',
      });

      const detectedService: DetectedService = {
        id: uuidv4(),
        type: svc.type,
        confidence: svc.confidence,
        status: svc.confidence >= 80 ? 'confirmed' : 'detected',
        detectedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        price: svc.price,
      };
      s.addDetectedService(chairId, detectedService);
    }, delay);
    delay += 1500;
  });

  // Bill generated
  setTimeout(() => {
    const s = useStore.getState();
    s.addActivity({
      timestamp: new Date().toISOString(),
      chairId,
      message: 'Bill generated — 550 ETB',
      confidence: 97,
      type: 'bill_generated',
    });
    s.completeSession(chairId);
    s.selectChair(chairId);
    s.setShowBilling(true);
  }, delay);

  // Mark demo running until payment
  setTimeout(() => {
    // Demo continues until user completes payment
  }, delay + 1000);
}

// Mock Vision Detector - architecture ready for real models
export class MockVisionDetector {
  async detect(_frame: unknown): Promise<Array<{
    type: ServiceType;
    confidence: number;
    chairId: string;
    timestamp: string;
  }>> {
    // Simulate detection delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Return mock detections
    return [];
  }
}

// Architecture interfaces for future integration
export interface VisionDetectorInterface {
  detect(frame: unknown): Promise<Array<{
    type: ServiceType;
    confidence: number;
    chairId: string;
    timestamp: string;
  }>>;
}

// Future: Ollama/Qwen Vision adapter
export class OllamaVisionAdapter implements VisionDetectorInterface {
  private endpoint: string;
  private model: string;

  constructor(endpoint = 'http://localhost:11434', model = 'llava') {
    this.endpoint = endpoint;
    this.model = model;
  }

  async detect(frame: unknown): Promise<Array<{
    type: ServiceType;
    confidence: number;
    chairId: string;
    timestamp: string;
  }>> {
    // TODO: Implement actual API call to Ollama
    // const response = await fetch(`${this.endpoint}/api/generate`, {
    //   method: 'POST',
    //   body: JSON.stringify({ model: this.model, images: [frame] })
    // });
    return [];
  }
}

// Future: YOLO adapter
export class YOLODetector implements VisionDetectorInterface {
  async detect(frame: unknown): Promise<Array<{
    type: ServiceType;
    confidence: number;
    chairId: string;
    timestamp: string;
  }>> {
    // TODO: Implement YOLO inference
    return [];
  }
}

// Future: Gemini Vision adapter
export class GeminiVisionAdapter implements VisionDetectorInterface {
  async detect(frame: unknown): Promise<Array<{
    type: ServiceType;
    confidence: number;
    chairId: string;
    timestamp: string;
  }>> {
    // TODO: Implement Gemini Vision API call
    return [];
  }
}
