/**
 * Core type definitions for ForestGuard AI
 * A low-cost forest-stress monitoring and early-warning demonstrator
 */

export type ForestStatus = 
  | 'NORMAL MONITORING' 
  | 'WATCH' 
  | 'FIELD CHECK RECOMMENDED' 
  | 'DATA INCOMPLETE';

export interface StatusMetadata {
  label: ForestStatus;
  code: 'normal' | 'watch' | 'field_check' | 'incomplete';
  description: string;
  colorHex: string;
  glowColor: string;
  borderColor: string;
  bgGlass: string;
  textColor: string;
  ariaDescription: string;
}

export interface NavSection {
  id: string;
  label: string;
  shortDescription: string;
}

export interface SystemStatusSummary {
  overallStatus: ForestStatus;
  activeSensors: number;
  totalSensors: number;
  lastSimulatedSync: string;
  simulationMode: 'standard' | 'accelerated' | 'drought_stress';
  demoBadgeText: string;
}
