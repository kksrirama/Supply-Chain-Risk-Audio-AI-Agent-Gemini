import { ProductRisk, WorldEvent, RiskLevel, Warehouse, StockLevel } from './types';

export const PRODUCT_RISKS: ProductRisk[] = [
  {
    id: 'prod-001',
    name: 'Semiconductors',
    riskScore: 85,
    riskLevel: RiskLevel.High,
    reason: 'Geopolitical tensions and trade restrictions impacting key manufacturing regions.',
    location: 'East Asia',
  },
  {
    id: 'prod-002',
    name: 'Lithium-Ion Batteries',
    riskScore: 78,
    riskLevel: RiskLevel.High,
    reason: 'Concentrated raw material sourcing and increasing demand from EV market.',
    location: 'South America, Australia',
  },
  {
    id: 'prod-003',
    name: 'Wheat & Grains',
    riskScore: 65,
    riskLevel: RiskLevel.Medium,
    reason: 'Climate change affecting crop yields and regional conflicts disrupting exports.',
    location: 'Eastern Europe',
  },
  {
    id: 'prod-004',
    name: 'Medical PPE',
    riskScore: 55,
    riskLevel: RiskLevel.Medium,
    reason: 'Sudden demand spikes due to health crises, reliance on specific manufacturing hubs.',
    location: 'Southeast Asia',
  },
  {
    id: 'prod-005',
    name: 'Lumber',
    riskScore: 40,
    riskLevel: RiskLevel.Low,
    reason: 'Wildfires and logistical bottlenecks causing temporary price volatility.',
    location: 'North America',
  },
];

export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: 'evt-001',
    title: 'Trade Summit Concludes with New Tariffs',
    summary: 'A recent global trade summit has resulted in the announcement of new tariffs on electronic components, affecting major export markets.',
    region: 'Global',
    impact: 'High impact on electronics and semiconductor supply chains.'
  },
  {
    id: 'evt-002',
    title: 'Drought Conditions Worsen in Key Agricultural Zone',
    summary: 'Extended drought is threatening crop yields in a region responsible for 30% of global grain exports, raising concerns about food security.',
    region: 'Eastern Europe',
    impact: 'Medium impact on food commodities and logistics.'
  },
  {
    id: 'evt-003',
    title: 'Breakthrough in Battery Technology Announced',
    summary: 'A university research lab has announced a new battery chemistry that could reduce reliance on cobalt, a critical and controversial raw material.',
    region: 'North America',
    impact: 'Potential long-term positive impact on EV and battery supply chains.'
  },
  {
    id: 'evt-004',
    title: 'Shipping Lane Congestion at Major Port',
    summary: 'A major maritime shipping port is experiencing unprecedented congestion, leading to significant delays for container ships and rising freight costs.',
    region: 'Southeast Asia',
    impact: 'High impact on all goods transported by sea freight.'
  }
];

export const WAREHOUSE_DATA: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'Taipei Distribution Center',
    location: { lat: 25.0330, lng: 121.5654 },
    stock: [
      { productId: 'prod-001', productName: 'Semiconductors', level: StockLevel.Critical, quantity: 5000 },
      { productId: 'prod-004', productName: 'Medical PPE', level: StockLevel.Healthy, quantity: 100000 },
    ]
  },
  {
    id: 'wh-002',
    name: 'Rotterdam Mega Terminal',
    location: { lat: 51.9244, lng: 4.4777 },
    stock: [
      { productId: 'prod-003', productName: 'Wheat & Grains', level: StockLevel.Low, quantity: 25000 },
      { productId: 'prod-005', productName: 'Lumber', level: StockLevel.Healthy, quantity: 80000 },
    ]
  },
  {
    id: 'wh-003',
    name: 'Nevada Gigafactory',
    location: { lat: 39.5501, lng: -119.4526 },
    stock: [
      { productId: 'prod-002', productName: 'Lithium-Ion Batteries', level: StockLevel.Low, quantity: 15000 },
      { productId: 'prod-001', productName: 'Semiconductors', level: StockLevel.Healthy, quantity: 500000 },
    ]
  },
   {
    id: 'wh-004',
    name: 'Singapore Logistics Hub',
    location: { lat: 1.3521, lng: 103.8198 },
    stock: [
      { productId: 'prod-001', productName: 'Semiconductors', level: StockLevel.Low, quantity: 20000 },
      { productId: 'prod-004', productName: 'Medical PPE', level: StockLevel.Critical, quantity: 10000 },
    ]
  }
];
