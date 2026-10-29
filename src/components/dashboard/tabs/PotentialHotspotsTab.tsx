/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { ForestStatus } from '../../../lib/types';
import { StressFlag } from '../../../lib/ruleEngine';
import { ExplainAlertModal } from '../../ExplainAlertModal';
import { 
  Flame, 
  MapPin, 
  Sparkles
} from 'lucide-react';

interface HotspotItem {
  id: string;
  sector: string;
  name: string;
  coords: string;
  elevation: string;
  severity: 'Critical' | 'Moderate' | 'Watch' | 'False Alarm';
  status: ForestStatus;
  primaryIndicator: string;
  indicators: {
    label: string;
    value: string;
    isTriggered: boolean;
  }[];
  divergenceNote: string;
  fieldAction: string;
  triggeredFlags: StressFlag[];
}

export const PotentialHotspotsTab: React.FC = () => {
  const { currentDay, status, dataset, dayIndex } = useForest();
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);
  const [activeExplainItem, setActiveExplainItem] = useState<HotspotItem | null>(null);

  // Compute 14d rainfall
  const recentDays = dataset.slice(Math.max(0, dayIndex - 13), dayIndex + 1);
  const rain14dMm = recentDays.reduce((acc, d) => acc + d.rainfallMm, 0);

  // Compute VPD
  const temp = currentDay?.tempC ?? 32.4;
  const rh = currentDay?.humidityPct ?? 38;
  const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  const vpdKpa = es * (1 - rh / 100);

  const currentNdvi = currentDay?.ndvi ?? 0.72;
  const baselineNdvi = currentDay?.seasonalBaseline.ndvi ?? 0.75;
  const ndviAnomaly = currentNdvi - baselineNdvi;

  // Synthesize realistic hotspots based on active status and day observations
  const hotspots: HotspotItem[] = [
    {
      id: 'hs-1',
      sector: 'Sector B-4',
      name: 'Southern Conifer Crest & Shallow Loam',
      coords: '11°39\'42" N, 76°37\'48" E',
      elevation: '1,120m MSL',
      severity: status === 'FIELD CHECK RECOMMENDED' ? 'Critical' : status === 'WATCH' ? 'Moderate' : 'Watch',
      status: status,
      primaryIndicator: 'Rapid NDMI drop (-0.14) without rain over 12 consecutive days',
      indicators: [
        { label: 'NDMI Canopy Moisture', value: `${(currentDay?.ndmi ?? 0.38).toFixed(2)} (Deficit: -0.14)`, isTriggered: true },
        { label: 'Root-Zone Capacitance', value: `${currentDay?.calibratedSoilPct ?? 24}% (Bone Dry)`, isTriggered: true },
        { label: 'Vapour Pressure Deficit', value: `${vpdKpa.toFixed(2)} kPa (>2.2 threshold)`, isTriggered: true },
        { label: 'Satellite Cloud Mask', value: 'Clear (0% interference)', isTriggered: false },
      ],
      divergenceNote: 'Both ground sensor and satellite indicate coupled severe desiccation. No divergence detected.',
      fieldAction: 'Dispatch beat guard to inspect needle browning, resin leakage, and test soil moisture with manual auger at 30cm depth.',
      triggeredFlags: [
        { name: 'Local Soil Moisture Depletion', triggered: true, reason: 'Root-zone capacitance below 25%', timeWindow: '7d' },
        { name: 'Atmospheric Evaporative Draw', triggered: true, reason: 'High VPD exceeding threshold', timeWindow: '3d' },
        { name: 'Sentinel-2 Canopy Deficit', triggered: true, reason: 'NDMI rapid seasonal drop', timeWindow: '14d' },
      ],
    },
    {
      id: 'hs-2',
      sector: 'Sector C-2',
      name: 'Upper Rim Escarpment (High Solar Exposure)',
      coords: '11°40\'05" N, 76°38\'12" E',
      elevation: '1,280m MSL',
      severity: 'Moderate',
      status: 'WATCH',
      primaryIndicator: 'Persistent thermal elevation (>34.2°C) with elevated VPD',
      indicators: [
        { label: 'Ambient Temperature', value: '34.8°C (+4.2°C anomaly)', isTriggered: true },
        { label: 'VPD Atmospheric Pull', value: '2.62 kPa (High transpiration)', isTriggered: true },
        { label: 'NDVI Canopy Vigor', value: '0.62 (Mild drop from 0.70)', isTriggered: false },
        { label: 'Rainfall Deficit', value: '16 days rainless', isTriggered: true },
      ],
      divergenceNote: 'Canopy still retains green chlorophyll but leaf moisture is actively dropping.',
      fieldAction: 'Visual binocular survey from Watchtower 3 for crown thinning or dry fuel accumulation.',
      triggeredFlags: [
        { name: 'Atmospheric Evaporative Draw', triggered: true, reason: 'Temperature baseline delta > 4.0°C', timeWindow: '7d' },
      ],
    },
    {
      id: 'hs-3',
      sector: 'Sector A-3',
      name: 'Node #1 LoRa Perimeter (Alluvial Edge)',
      coords: '11°39\'30" N, 76°37\'20" E',
      elevation: '980m MSL',
      severity: 'Watch',
      status: 'NORMAL MONITORING',
      primaryIndicator: 'Sensor vs Satellite divergence: dry shallow soil while canopy remains hydrated',
      indicators: [
        { label: 'Topsoil Sensor Capacitance', value: '19% (Shallow dry crust)', isTriggered: true },
        { label: 'Sentinel-2 NDMI', value: '0.44 (Deep root water access)', isTriggered: false },
        { label: 'NDVI Greenness', value: '0.74 (Vigorous canopy)', isTriggered: false },
        { label: 'LoRa Node RSSI', value: '-78 dBm (Online)', isTriggered: false },
      ],
      divergenceNote: 'Benign topsoil drying. Deep mature taproots are reaching the perennial sub-surface water table.',
      fieldAction: 'Routine telemetry logging. No physical intervention required.',
      triggeredFlags: [
        { name: 'Local Soil Moisture Depletion', triggered: true, reason: 'Topsoil crust dry, subsoil taproots active', timeWindow: '3d' },
      ],
    },
    {
      id: 'hs-4',
      sector: 'Sector D-1',
      name: 'North-West Gully (Cloud Shadow Fringe)',
      coords: '11°40\'22" N, 76°36\'55" E',
      elevation: '920m MSL',
      severity: 'False Alarm',
      status: 'DATA INCOMPLETE',
      primaryIndicator: 'Cloud shadow edge artifact triggered sudden drop in reflectance',
      indicators: [
        { label: 'Satellite Cloud Cover', value: '34% in tile quadrant', isTriggered: true },
        { label: 'NDVI Sudden Drop', value: '-0.22 (Unrealistic 5-day delta)', isTriggered: true },
        { label: 'Ground Sensor Check', value: 'Normal baseline 32% soil', isTriggered: false },
        { label: 'Shadow Filter Algorithm', value: 'Flagged as topographic artifact', isTriggered: true },
      ],
      divergenceNote: 'Rule engine filtered out alert due to Sentinel-2 cloud/shadow QA mask.',
      fieldAction: 'Automated filter applied. Await next clear-sky Sentinel-2 overpass.',
      triggeredFlags: [
        { name: 'Satellite Data Quality Warning', triggered: true, reason: 'High cloud/shadow contamination in tile', timeWindow: '5d' },
      ],
    },
  ];

  const handleOpenExplain = (item: HotspotItem) => {
    setActiveExplainItem(item);
    setIsExplainModalOpen(true);
  };

  const getSeverityBadge = (sev: HotspotItem['severity']) => {
    switch (sev) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E5533D]/20 text-[#E5533D] border border-[#E5533D]/40">CRITICAL HOTSPOT</span>;
      case 'Moderate':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5B841]/20 text-[#F5B841] border border-[#F5B841]/40">MODERATE STRESS</span>;
      case 'Watch':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40">WATCH SITE</span>;
      case 'False Alarm':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-[#8A9A92] border border-white/20">FILTERED ARTIFACT</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#F5B841] flex items-center gap-1.5 mb-1">
            <Flame size={13} />
            <span>Automated Spatial Anomaly Detection</span>
          </span>
          <h3 className="text-xl font-heading font-bold text-white">
            Potential Hotspots & Specific Biophysical Indicators
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92]">
          <span className="text-white font-bold">{hotspots.length} Monitored Sectors</span>
          <span className="text-white/20">•</span>
          <span>Rule Engine v2.4 (Sentinel-2 + Capacitive Telemetry)</span>
        </div>
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotspots.map((hs) => (
          <div
            key={hs.id}
            className={`glass-card p-6 border transition-all duration-300 relative flex flex-col justify-between ${
              hs.severity === 'Critical'
                ? 'border-[#E5533D]/40 hover:border-[#E5533D]/70 bg-[#E5533D]/[0.02]'
                : hs.severity === 'Moderate'
                ? 'border-[#F5B841]/40 hover:border-[#F5B841]/70 bg-[#F5B841]/[0.02]'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <MapPin size={13} className="text-[#2ECC71]" />
                  <span className="font-bold text-white">{hs.sector}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[#8A9A92]">{hs.coords}</span>
                </div>
                {getSeverityBadge(hs.severity)}
              </div>

              <h4 className="text-lg font-heading font-bold text-white mb-2">
                {hs.name}
              </h4>

              {/* Primary Trigger Callout */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 mb-4">
                <span className="text-[10px] uppercase font-mono text-[#8A9A92] block mb-0.5">Primary Indicator:</span>
                <p className="text-xs font-mono text-white font-medium leading-relaxed">
                  {hs.primaryIndicator}
                </p>
              </div>

              {/* Indicator Metrics Matrix */}
              <div className="space-y-2 mb-4">
                <span className="text-[10px] uppercase font-mono text-[#8A9A92] block">Telemetry Parameters:</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {hs.indicators.map((ind, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded border ${
                        ind.isTriggered 
                          ? 'bg-white/[0.04] border-[#F5B841]/30 text-white' 
                          : 'bg-white/[0.01] border-white/5 text-[#8A9A92]'
                      }`}
                    >
                      <span className="text-[10px] text-[#8A9A92] block truncate">{ind.label}</span>
                      <span className={`font-semibold ${ind.isTriggered ? 'text-[#F5B841]' : 'text-white'}`}>
                        {ind.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divergence note */}
              <div className="text-xs font-mono text-[#8A9A92] mb-4">
                <span className="text-white font-medium">Sensor Coupling:</span> {hs.divergenceNote}
              </div>
            </div>

            {/* Bottom Actions: Suggested field check + AI Explain */}
            <div className="pt-3 border-t border-white/5 space-y-3">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono text-[#B6F36A]">
                <strong className="text-white block text-[10px] uppercase mb-0.5">Suggested Field Verification:</strong>
                {hs.fieldAction}
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-[#8A9A92]">Elevation: {hs.elevation}</span>
                <button
                  type="button"
                  onClick={() => handleOpenExplain(hs)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ECC71]/15 hover:bg-[#2ECC71]/25 text-[#B6F36A] border border-[#2ECC71]/40 text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
                >
                  <Sparkles size={13} />
                  <span>Explain with Gemini</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Explanatory Modal using Gemini API */}
      {activeExplainItem && (
        <ExplainAlertModal
          isOpen={isExplainModalOpen}
          onClose={() => setIsExplainModalOpen(false)}
          status={activeExplainItem.status}
          triggeredFlags={activeExplainItem.triggeredFlags}
          indicators={{
            soilPct: currentDay?.calibratedSoilPct ?? 24,
            soilRaw: currentDay?.soilRaw ?? 2650,
            tempC: currentDay?.tempC ?? 32.4,
            humidityPct: currentDay?.humidityPct ?? 38,
            rain14dMm: rain14dMm,
            ndviAnomaly: ndviAnomaly,
          }}
        />
      )}
    </div>
  );
};
