export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface ProductRisk {
  id: string;
  name: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  reason: string;
  location: string;
}

export interface WorldEvent {
  id: string;
  title: string;
  summary: string;
  region: string;
  impact: string;
}

export enum TranscriptSpeaker {
  User = 'User',
  AI = 'AI',
}

export interface TranscriptEntry {
  speaker: TranscriptSpeaker;
  text: string;
  id: number;
}

export enum ConnectionState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    LISTENING = 'LISTENING',
    SPEAKING = 'SPEAKING',
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  MAP = 'MAP',
}

export enum StockLevel {
  Healthy = 'Healthy',
  Low = 'Low',
  Critical = 'Critical',
}

export interface WarehouseStock {
  productId: string;
  productName: string;
  level: StockLevel;
  quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  stock: WarehouseStock[];
}
