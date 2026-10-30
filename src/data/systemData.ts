import { SystemStatusSummary } from '../lib/types';

export const INITIAL_SYSTEM_SUMMARY: SystemStatusSummary = {
  overallStatus: 'NORMAL MONITORING',
  activeSensors: 14,
  totalSensors: 16,
  lastSimulatedSync: '2026-10-28 11:00 UTC',
  simulationMode: 'standard',
  demoBadgeText: '',
};

export const DEMO_PROVENANCE = {
  dataSource: 'Sentinel-2 L2A Multispectral MSI & In-Situ LoRaWAN Mesh (ESP32-S3)',
  observationDate: '2026-10-28 (10-Day Composited Cycle)',
  coverageArea: 'Jim Corbett National Park & Ramganga Catchment (4,200 ha), Uttarakhand',
  disclaimer: 'Vanraksha forest moisture & early-warning decision-support system. Ground verification recommended prior to operational intervention.',
};
