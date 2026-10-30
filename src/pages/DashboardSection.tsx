/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { SettingsDrawer } from '../components/dashboard/SettingsDrawer';
import { OverviewTab } from '../components/dashboard/tabs/OverviewTab';
import { SatelliteMapTab } from '../components/dashboard/tabs/SatelliteMapTab';
import { VegetationHealthTab } from '../components/dashboard/tabs/VegetationHealthTab';
import { MoistureMonitoringTab } from '../components/dashboard/tabs/MoistureMonitoringTab';
import { HistoricalTrendsTab } from '../components/dashboard/tabs/HistoricalTrendsTab';
import { PotentialHotspotsTab } from '../components/dashboard/tabs/PotentialHotspotsTab';
import { ReportsTab } from '../components/dashboard/tabs/ReportsTab';
import { NainitalChangeAnalysisTab } from '../components/dashboard/tabs/NainitalChangeAnalysisTab';
import { useForest } from '../lib/ForestContext';
import { 
  Sliders, 
  Calendar, 
  ShieldAlert, 
  Activity, 
  Map as MapIcon, 
  Sprout, 
  Droplets, 
  LineChart, 
  Flame, 
  FileText,
  Layers
} from 'lucide-react';

export type DashboardTabId = 
  | 'overview' 
  | 'satellite-map' 
  | 'nainital-change'
  | 'vegetation-health' 
  | 'moisture-monitoring' 
  | 'historical-trends' 
  | 'potential-hotspots' 
  | 'reports';

interface TabDefinition {
  id: DashboardTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

export const DashboardSection: React.FC = () => {
  const { dayIndex, currentDay, scenario, activeDashboardTab, setActiveDashboardTab } = useForest();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const activeTab = (activeDashboardTab as DashboardTabId) || 'overview';
  const setActiveTab = (tab: DashboardTabId) => setActiveDashboardTab(tab);

  const tabs: TabDefinition[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      description: 'Selected region aur latest available observation',
    },
    {
      id: 'satellite-map',
      label: 'Satellite map',
      icon: MapIcon,
      description: 'Study area ki imagery',
    },
    {
      id: 'nainital-change',
      label: 'Nainital Satellite Change',
      icon: Layers,
      description: 'Historical 2023 vs 2025 satellite comparison & change candidates',
    },
    {
      id: 'vegetation-health',
      label: 'Vegetation health',
      icon: Sprout,
      description: 'NDVI map aur summary statistics',
    },
    {
      id: 'moisture-monitoring',
      label: 'Moisture monitoring',
      icon: Droplets,
      description: 'NDMI map aur summary statistics',
    },
    {
      id: 'historical-trends',
      label: 'Historical trends',
      icon: LineChart,
      description: 'Available dates ke NDVI/NDMI graphs',
    },
    {
      id: 'potential-hotspots',
      label: 'Potential hotspots',
      icon: Flame,
      description: 'Flagged locations aur unke indicators',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Downloadable analysis summary',
    },
  ];

  return (
    <section id="dashboard" className="py-16 sm:py-20 scroll-mt-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Top Header (Hidden when printing executive report) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-5 border-b border-white/[0.08] print:hidden">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
                Scientific Forest Observability
              </span>
              <SimulatedDataBadge variant="pill" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Catchment Telemetry & Stress
            </h2>
          </div>

          {/* Action Tools & Settings Drawer Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-[#8A9A92] flex items-center gap-2">
              <Calendar size={13} className="text-[#2ECC71]" />
              <span>Timeline: Day {dayIndex} ({currentDay?.dateString})</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white border border-white/15 text-xs font-mono font-medium transition-all hover:border-[#2ECC71]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
              aria-label="Open Rule Threshold Settings Drawer"
            >
              <Sliders size={14} className="text-[#B6F36A]" />
              <span>Threshold Settings</span>
            </button>
          </div>
        </div>

        {/* 7-Section Sub-Navigation Bar (Hidden when printing) */}
        <div className="mb-8 border-b border-white/10 overflow-x-auto scrollbar-none print:hidden">
          <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-2" aria-label="Dashboard Sections">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-bold border border-white/15 shadow-sm'
                      : 'text-[#8A9A92] hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    size={15} 
                    className={`transition-colors ${
                      isActive 
                        ? 'text-[#2ECC71]' 
                        : 'text-[#8A9A92] group-hover:text-white'
                    }`} 
                  />
                  <span>{tab.label}</span>

                  {/* Active bottom accent bar */}
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#2ECC71] rounded-full shadow-[0_0_8px_#2ECC71]" 
                      aria-hidden="true" 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Stage */}
        <div className="transition-all duration-300">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'satellite-map' && <SatelliteMapTab />}
          {activeTab === 'nainital-change' && <NainitalChangeAnalysisTab />}
          {activeTab === 'vegetation-health' && <VegetationHealthTab />}
          {activeTab === 'moisture-monitoring' && <MoistureMonitoringTab />}
          {activeTab === 'historical-trends' && <HistoricalTrendsTab />}
          {activeTab === 'potential-hotspots' && <PotentialHotspotsTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>

        {/* Catchment Triage Decision Disclaimer Strip (Hidden when printing) */}
        <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8A9A92] print:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-[#F5B841] shrink-0" />
            <span>
              <strong className="text-white font-medium">Demonstrator Boundary:</strong> Copernicus Sentinel-2 MSI L2A & Sub-GHz LoRa Mesh. Ground confirmation is always required prior to forestry intervention.
            </span>
          </div>
          <span className="font-mono text-[#B6F36A] text-[11px] shrink-0">
            Active Scenario: {scenario}
          </span>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </section>
  );
};
