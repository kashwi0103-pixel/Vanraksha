import { SystemStatusSummary } from '../lib/types';

export const INITIAL_SYSTEM_SUMMARY: SystemStatusSummary = {
  overallStatus: 'NORMAL MONITORING',
  activeSensors: 14,
  totalSensors: 16,
  lastSimulatedSync: '2026-10-28 11:00 UTC',
  simulationMode: 'standard',
  demoBadgeText: 'SIMULATED DEMO DATA',
};

export const DEMO_PROVENANCE = {
  dataSource: 'Sentinel-2 L2A (Synthetic Surface Reflectance) & Virtual LoRa Mesh (ESP32-S3)',
  observationDate: '2026-10-28 (10-Day Composited Cycle)',
  coverageArea: 'Blackwood Creek Watershed (4,200 ha)',
  disclaimer: 'Student demonstrator prototype for academic decision-support only. Not a safety-critical fire or mortality prediction tool.',
};
