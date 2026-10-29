import { ForestStatus, StatusMetadata } from './types';

export const ALLOWED_STATUSES: readonly ForestStatus[] = [
  'NORMAL MONITORING',
  'WATCH',
  'FIELD CHECK RECOMMENDED',
  'DATA INCOMPLETE',
] as const;

export const STATUS_CONFIG: Record<ForestStatus, StatusMetadata> = {
  'NORMAL MONITORING': {
    label: 'NORMAL MONITORING',
    code: 'normal',
    description: 'Baseline vegetative moisture and canopy vitals within seasonal equilibrium',
    colorHex: '#2ECC71',
    glowColor: 'rgba(46, 204, 113, 0.45)',
    borderColor: 'border-[#2ECC71]/40',
    bgGlass: 'bg-[#2ECC71]/10',
    textColor: 'text-[#2ECC71]',
    ariaDescription: 'Status Normal Monitoring: All indicators within expected seasonal parameters',
  },
  'WATCH': {
    label: 'WATCH',
    code: 'watch',
    description: 'Vapor pressure deficit or soil matric stress elevated; increased sensor sampling active',
    colorHex: '#F5B841',
    glowColor: 'rgba(245, 184, 65, 0.45)',
    borderColor: 'border-[#F5B841]/40',
    bgGlass: 'bg-[#F5B841]/10',
    textColor: 'text-[#F5B841]',
    ariaDescription: 'Status Watch: Elevated stress signals detected; sampling frequency increased',
  },
  'FIELD CHECK RECOMMENDED': {
    label: 'FIELD CHECK RECOMMENDED',
    code: 'field_check',
    description: 'Multi-spectral canopy moisture drop confirmed across clustered nodes; ground verification advised',
    colorHex: '#E5533D',
    glowColor: 'rgba(229, 83, 61, 0.45)',
    borderColor: 'border-[#E5533D]/40',
    bgGlass: 'bg-[#E5533D]/10',
    textColor: 'text-[#E5533D]',
    ariaDescription: 'Status Field Check Recommended: Persistent localized stress markers warrant physical ground survey',
  },
  'DATA INCOMPLETE': {
    label: 'DATA INCOMPLETE',
    code: 'incomplete',
    description: 'Node packet latency or cloud cover gap in satellite pass; estimates withheld per strict protocol',
    colorHex: '#8A9A92',
    glowColor: 'rgba(138, 154, 146, 0.35)',
    borderColor: 'border-[#8A9A92]/40',
    bgGlass: 'bg-[#8A9A92]/10',
    textColor: 'text-[#8A9A92]',
    ariaDescription: 'Status Data Incomplete: Telemetry missing or obscured; interpolation intentionally withheld',
  },
};

/**
 * Validates whether an arbitrary string matches the strict approved statuses
 */
export function isValidStatus(val: unknown): val is ForestStatus {
  return typeof val === 'string' && ALLOWED_STATUSES.includes(val as ForestStatus);
}

/**
 * Safely resolves status metadata, falling back to DATA INCOMPLETE if invalid
 */
export function getStatusMetadata(status: ForestStatus | string): StatusMetadata {
  if (isValidStatus(status)) {
    return STATUS_CONFIG[status];
  }
  return STATUS_CONFIG['DATA INCOMPLETE'];
}

/**
 * Returns color hex for charts and SVG visualizers
 */
export function getStatusColor(status: ForestStatus): string {
  return STATUS_CONFIG[status]?.colorHex ?? '#8A9A92';
}
