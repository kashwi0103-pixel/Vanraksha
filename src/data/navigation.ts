import { NavSection } from '../lib/types';

/**
 * 7 Dedicated Dashboard Sections from the User's Image Specification:
 * - Overview: Selected region aur latest available observation
 * - Satellite map: Study area ki imagery
 * - Vegetation health: NDVI map aur summary statistics
 * - Moisture monitoring: NDMI map aur summary statistics
 * - Historical trends: Available dates ke NDVI/NDMI graphs
 * - Potential hotspots: Flagged locations aur unke indicators
 * - Reports: Downloadable analysis summary
 */
export interface DashboardNavItem {
  id: string; // matches DashboardTabId
  label: string;
  hindiDescription: string;
  badge?: string;
}

export const DASHBOARD_NAV_SECTIONS: DashboardNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    hindiDescription: 'Selected region aur latest available observation',
  },
  {
    id: 'satellite-map',
    label: 'Satellite map',
    hindiDescription: 'Study area ki imagery',
  },
  {
    id: 'vegetation-health',
    label: 'Vegetation health',
    hindiDescription: 'NDVI map aur summary statistics',
  },
  {
    id: 'moisture-monitoring',
    label: 'Moisture monitoring',
    hindiDescription: 'NDMI map aur summary statistics',
  },
  {
    id: 'historical-trends',
    label: 'Historical trends',
    hindiDescription: 'Historical satellite comparison (2023 vs 2025) aur NDVI/NDMI graphs',
    badge: '2023 vs 2025',
  },
  {
    id: 'potential-hotspots',
    label: 'Potential hotspots',
    hindiDescription: 'Flagged locations aur unke indicators',
  },
  {
    id: 'reports',
    label: 'Reports',
    hindiDescription: 'Downloadable analysis summary',
  },
];

export const OTHER_PAGES: NavSection[] = [
  {
    id: 'home',
    label: 'Home',
    shortDescription: 'Overview & demonstrator introduction',
  },
  {
    id: 'simulation-lab',
    label: 'Simulation Lab',
    shortDescription: 'Interactive stress scenario parameter modeling',
  },
  {
    id: 'model',
    label: 'Model Evaluation',
    shortDescription: 'Baseline rules vs trained ML holdout comparison',
  },
  {
    id: 'hardware',
    label: 'Hardware',
    shortDescription: 'Interactive ESP32 wiring & pinout architecture',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    shortDescription: '12-week deployment milestones & checklist',
  },
  {
    id: 'about',
    label: 'About & Benchmarks',
    shortDescription: 'NASA FIRMS, FSI benchmarks & limitations',
  },
];

// Preserved for backwards compatibility
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortDescription: '7-Section Scientific Observability Center',
  },
  ...OTHER_PAGES,
];
