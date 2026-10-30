/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { ForestStatus } from '../../../lib/types';
import { StressFlag } from '../../../lib/ruleEngine';
import { ExplainAlertModal } from '../../ExplainAlertModal';
import { ExplainCandidatePanel } from '../ExplainCandidatePanel';
import { 
  POTENTIAL_CHANGE_CANDIDATES, 
  PotentialChangeCandidate 
} from '../../../data/candidateData';
import { 
  Flame, 
  MapPin, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  HelpCircle,
  Layers,
  Activity
} from 'lucide-react';

interface HotspotItem {
  id: string;
  candidateId: string;
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
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>('CC-2026-DH04');

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

  // Synthesize realistic hotspots based on active status and day observations in Uttarakhand
  const hotspots: HotspotItem[] = [
    {
      id: 'hs-1',
      candidateId: 'CC-2026-DH04',
      sector: 'Sector Dhikala-4',
      name: 'Chir Pine Crest & Shallow Loam, Corbett Reserve',
      coords: '29°32\'42" N, 78°56\'38" E',
      elevation: '920m MSL',
      severity: status === 'FIELD CHECK RECOMMENDED' ? 'Critical' : status === 'WATCH' ? 'Moderate' : 'Watch',
      status: status,
      primaryIndicator: 'Rapid NDMI drop (-0.14) without rain over 12 consecutive days',
      indicators: [
        { label: 'NDMI Canopy Moisture', value: `${(currentDay?.ndmi ?? 0.38).toFixed(2)} (Deficit: -0.14)`, isTriggered: true },
        { label: 'Root-Zone Capacitance', value: `${currentDay?.calibratedSoilPct ?? 24}% (Dry Pine Loam)`, isTriggered: true },
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
      candidateId: 'CC-2026-BJ02',
      sector: 'Sector Bijrani-2',
      name: 'Upper Kanda Ridge Escarpment, Uttarakhand',
      coords: '29°33\'15" N, 78°57\'12" E',
      elevation: '1,180m MSL',
      severity: 'Moderate',
      status: 'WATCH',
      primaryIndicator: 'Persistent thermal elevation (>34.2°C) with elevated VPD',
      indicators: [
        { label: 'NDVI Vegetation Greenness', value: '0.62 (Δ -0.08, breaches -0.05)', isTriggered: true },
        { label: 'NDMI Canopy Moisture', value: '0.20 (Δ -0.12, breaches -0.05)', isTriggered: true },
        { label: 'Ambient Temperature', value: '34.8°C (+4.2°C anomaly)', isTriggered: true },
        { label: 'Rainfall Deficit', value: '16 days rainless (2.5mm)', isTriggered: true },
      ],
      divergenceNote: 'Canopy still retains green chlorophyll but leaf moisture is actively dropping.',
      fieldAction: 'Visual binocular survey from Watchtower 3 for crown thinning or dry fuel accumulation.',
      triggeredFlags: [
        { name: 'Atmospheric Evaporative Draw', triggered: true, reason: 'Temperature baseline delta > 4.0°C', timeWindow: '7d' },
      ],
    },
    {
      id: 'hs-3',
      candidateId: 'CC-2026-SN03',
      sector: 'Sector Sona-3',
      name: 'Ramganga Riverine LoRa Cluster, Corbett',
      coords: '29°31\'50" N, 78°55\'40" E',
      elevation: '780m MSL',
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
      candidateId: 'CC-2026-DG01',
      sector: 'Sector Dhangarhi-1',
      name: 'Corbett Sal & Mixed Deciduous Foothills',
      coords: '29°34\'10" N, 78°58\'20" E',
      elevation: '850m MSL',
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
          <span className="text-white font-bold">{hotspots.length} Monitored Candidates</span>
          <span className="text-white/20">•</span>
          <span>Rule Engine v2.4 (Sentinel-2 + In-Situ Mesh)</span>
        </div>
      </div>

      {/* Explanatory Feature Callout */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#2ECC71]/15 via-white/[0.03] to-transparent border border-[#2ECC71]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B6F36A] uppercase mb-1">
            <ShieldAlert size={14} className="text-[#2ECC71]" />
            <span>Explainable Monitoring Engine</span>
          </div>
          <p className="text-xs font-sans text-[#E5EFE9]">
            Click <strong className="text-white font-bold">&quot;Explain This Alert&quot;</strong> on any candidate to inspect why the area was flagged, measured NDVI/NDMI deltas, and evidence status.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-[#8A9A92]">
          <span>Select Candidate:</span>
          {hotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setExpandedCandidateId(expandedCandidateId === h.candidateId ? null : h.candidateId)}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                expandedCandidateId === h.candidateId
                  ? 'bg-[#2ECC71]/20 text-[#B6F36A] border-[#2ECC71]/50'
                  : 'bg-white/5 text-[#8A9A92] border-white/10 hover:text-white'
              }`}
            >
              {h.candidateId}
            </button>
          ))}
        </div>
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotspots.map((hs) => {
          const matchedCandidate = POTENTIAL_CHANGE_CANDIDATES.find(c => c.id === hs.candidateId);
          const isExpanded = expandedCandidateId === hs.candidateId;

          return (
            <div
              key={hs.id}
              className={`glass-card p-6 border transition-all duration-300 relative flex flex-col justify-between ${
                isExpanded
                  ? 'md:col-span-2 border-[#2ECC71]/50 bg-[#0B2315]/20 ring-1 ring-[#2ECC71]/30 shadow-[0_0_24px_rgba(46,204,113,0.15)]'
                  : hs.severity === 'Critical'
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
                    <span className="font-bold text-[#B6F36A] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                      {hs.candidateId}
                    </span>
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

              {/* Bottom Actions: Explain This Alert + Suggested field check */}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono text-[#B6F36A]">
                  <strong className="text-white block text-[10px] uppercase mb-0.5">Suggested Field Verification:</strong>
                  {hs.fieldAction}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#8A9A92]">Elevation: {hs.elevation}</span>
                  
                  <div className="flex items-center gap-2">
                    {/* PRIMARY FEATURE BUTTON: Explain This Alert / Explain Why This Area Was Flagged */}
                    <button
                      type="button"
                      onClick={() => setExpandedCandidateId(isExpanded ? null : hs.candidateId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] ${
                        isExpanded
                          ? 'bg-[#2ECC71] text-[#06120C] shadow-[0_0_15px_rgba(46,204,113,0.4)]'
                          : 'bg-[#2ECC71]/20 hover:bg-[#2ECC71]/30 text-[#B6F36A] border border-[#2ECC71]/40'
                      }`}
                    >
                      <ShieldAlert size={13} className={isExpanded ? 'text-[#06120C]' : 'text-[#2ECC71]'} />
                      <span>{isExpanded ? 'Hide Explanation' : 'Explain This Alert'}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {/* Secondary LLM button */}
                    <button
                      type="button"
                      onClick={() => handleOpenExplain(hs)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8A9A92] hover:text-white border border-white/10 text-xs font-mono font-medium transition-all"
                      title="AI Chat Brief"
                    >
                      <Sparkles size={12} />
                      <span className="hidden sm:inline">AI Brief</span>
                    </button>
                  </div>
                </div>

                {/* EXPANDED "EXPLAIN WHY THIS AREA WAS FLAGGED" PANEL */}
                {isExpanded && matchedCandidate && (
                  <div className="mt-4 pt-4 border-t border-[#2ECC71]/20 animate-in fade-in zoom-in-95 duration-200">
                    <ExplainCandidatePanel 
                      candidate={matchedCandidate} 
                      onClose={() => setExpandedCandidateId(null)} 
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
