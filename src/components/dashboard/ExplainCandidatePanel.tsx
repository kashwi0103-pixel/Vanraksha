/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  PotentialChangeCandidate, 
  ScorecardStatus 
} from '../../data/candidateData';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Calendar, 
  MapPin, 
  Compass, 
  ArrowRight, 
  Info, 
  X,
  Sparkles,
  Search,
  Activity,
  Layers,
  CloudRain,
  Eye
} from 'lucide-react';

interface ExplainCandidatePanelProps {
  candidate: PotentialChangeCandidate;
  onClose?: () => void;
  isCompact?: boolean;
}

export const ExplainCandidatePanel: React.FC<ExplainCandidatePanelProps> = ({
  candidate,
  onClose,
  isCompact = false,
}) => {
  const { 
    id, 
    sectorId, 
    name, 
    coords, 
    elevation, 
    forestType,
    evidenceStatus, 
    periodT1, 
    periodT2, 
    scorecard, 
    whyFlaggedSummary, 
    overallInterpretation, 
    recommendedNextStep 
  } = candidate;

  // Status Badge Helper for Scorecard
  const renderStatusBadge = (status: ScorecardStatus) => {
    switch (status) {
      case 'Decreased':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E5533D]/20 text-[#E5533D] border border-[#E5533D]/40">
            <AlertTriangle size={12} className="shrink-0" />
            <span>Decreased</span>
          </span>
        );
      case 'No threshold breach':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/40">
            <CheckCircle2 size={12} className="shrink-0" />
            <span>No threshold breach</span>
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40">
            <Activity size={12} className="shrink-0" />
            <span>Available</span>
          </span>
        );
      case 'Unavailable':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-white/10 text-[#8A9A92] border border-white/20">
            <HelpCircle size={12} className="shrink-0" />
            <span>Unavailable</span>
          </span>
        );
    }
  };

  return (
    <div 
      className="glass-card-elevated p-5 sm:p-6 border border-[#2ECC71]/30 rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-300"
      aria-labelledby={`explain-panel-title-${id}`}
    >
      {/* Background Accent Gradient */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#2ECC71]/10 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10 mb-5 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md bg-[#2ECC71]/15 text-[#B6F36A] border border-[#2ECC71]/35 font-mono font-bold text-xs">
              {id}
            </span>
            <span className="text-xs font-mono text-[#8A9A92]">
              {sectorId}
            </span>
            <span className="text-white/20">•</span>
            {/* EVIDENCE STATUS BADGE - Strictly Required */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F5B841]/20 text-[#F5B841] border border-[#F5B841]/40 shadow-sm">
              <ShieldAlert size={13} className="shrink-0" />
              <span>{evidenceStatus}</span>
            </span>
          </div>

          <h3 
            id={`explain-panel-title-${id}`}
            className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight"
          >
            Explain Why This Area Was Flagged
          </h3>
          <p className="text-xs font-mono text-[#8A9A92] mt-1">
            {name} · {forestType}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8A9A92] hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-colors self-start"
            aria-label="Close explain panel"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* SPATIAL & TEMPORAL METADATA STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono relative z-10">
        <div className="flex items-center gap-2 text-[#8A9A92]">
          <MapPin size={14} className="text-[#2ECC71] shrink-0" />
          <span>Coordinates: <strong className="text-white">{coords}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[#8A9A92]">
          <Compass size={14} className="text-[#B6F36A] shrink-0" />
          <span>Elevation: <strong className="text-white">{elevation}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[#8A9A92] sm:col-span-2 lg:col-span-1">
          <Calendar size={14} className="text-[#38BDF8] shrink-0" />
          <span>Observation Comparison: <strong className="text-white">{periodT1.date}</strong> vs <strong className="text-white">{periodT2.date}</strong></span>
        </div>
      </div>

      {/* SECTION 5: EXPLAINABILITY SCORECARD */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
            <Layers size={14} className="text-[#2ECC71]" />
            <span>Explainability Scorecard</span>
          </h4>
          <span className="text-[11px] font-mono text-[#8A9A92]">
            Measured Change vs. Configured Thresholds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* NDVI Card */}
          <div className="p-3.5 rounded-xl bg-[#030906]/80 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-white">
                {scorecard.ndvi.title}
              </span>
              {renderStatusBadge(scorecard.ndvi.status)}
            </div>
            <div className="space-y-1 text-xs font-mono mb-2">
              <div className="flex justify-between text-[#8A9A92]">
                <span>Measured Change:</span>
                <span className={`font-bold ${scorecard.ndvi.isBreached ? 'text-[#E5533D]' : 'text-white'}`}>
                  {scorecard.ndvi.measuredChangeText}
                </span>
              </div>
              <div className="flex justify-between text-[#8A9A92] text-[11px]">
                <span>Screening Threshold:</span>
                <span className="text-[#B6F36A] font-semibold">{scorecard.ndvi.configuredThresholdText}</span>
              </div>
            </div>
            <p className="text-[11px] font-sans text-[#8A9A92] leading-relaxed pt-2 border-t border-white/5">
              {scorecard.ndvi.explanation}
            </p>
          </div>

          {/* NDMI Card */}
          <div className="p-3.5 rounded-xl bg-[#030906]/80 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-white">
                {scorecard.ndmi.title}
              </span>
              {renderStatusBadge(scorecard.ndmi.status)}
            </div>
            <div className="space-y-1 text-xs font-mono mb-2">
              <div className="flex justify-between text-[#8A9A92]">
                <span>Measured Change:</span>
                <span className={`font-bold ${scorecard.ndmi.isBreached ? 'text-[#E5533D]' : 'text-white'}`}>
                  {scorecard.ndmi.measuredChangeText}
                </span>
              </div>
              <div className="flex justify-between text-[#8A9A92] text-[11px]">
                <span>Screening Threshold:</span>
                <span className="text-[#B6F36A] font-semibold">{scorecard.ndmi.configuredThresholdText}</span>
              </div>
            </div>
            <p className="text-[11px] font-sans text-[#8A9A92] leading-relaxed pt-2 border-t border-white/5">
              {scorecard.ndmi.explanation}
            </p>
          </div>

          {/* Tree-Cover Probability Card */}
          <div className="p-3.5 rounded-xl bg-[#030906]/80 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-white">
                {scorecard.treeCover.title}
              </span>
              {renderStatusBadge(scorecard.treeCover.status)}
            </div>
            <div className="space-y-1 text-xs font-mono mb-2">
              <div className="flex justify-between text-[#8A9A92]">
                <span>Measured Change:</span>
                <span className="text-[#8A9A92] font-semibold italic">
                  {scorecard.treeCover.measuredChangeText}
                </span>
              </div>
              <div className="flex justify-between text-[#8A9A92] text-[11px]">
                <span>Screening Threshold:</span>
                <span className="text-[#8A9A92] font-semibold">{scorecard.treeCover.configuredThresholdText}</span>
              </div>
            </div>
            <p className="text-[11px] font-sans text-[#8A9A92] leading-relaxed pt-2 border-t border-white/5">
              {scorecard.treeCover.explanation}
            </p>
          </div>

          {/* Weather Context Card */}
          <div className="p-3.5 rounded-xl bg-[#030906]/80 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-white">
                {scorecard.weather.title}
              </span>
              {renderStatusBadge(scorecard.weather.status)}
            </div>
            <div className="space-y-1 text-xs font-mono mb-2">
              <div className="flex justify-between text-[#8A9A92]">
                <span>Weather Variance:</span>
                <span className="text-white font-semibold">
                  {scorecard.weather.measuredChangeText}
                </span>
              </div>
              <div className="flex justify-between text-[#8A9A92] text-[11px]">
                <span>Screening Threshold:</span>
                <span className="text-[#B6F36A] font-semibold">{scorecard.weather.configuredThresholdText}</span>
              </div>
            </div>
            <p className="text-[11px] font-sans text-[#8A9A92] leading-relaxed pt-2 border-t border-white/5">
              {scorecard.weather.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: WHY FLAGGED SUMMARY */}
      <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#F5B841] font-bold mb-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span>Why Flagged (Screening Threshold Triggers):</span>
        </div>
        <ul className="space-y-2 text-xs font-mono text-[#E5EFE9]">
          {whyFlaggedSummary.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5B841] mt-1.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SECTION 3 & 6: CONCISE OVERALL INTERPRETATION & DEFORESTATION CAVEAT */}
      <div className="mb-6 p-4 rounded-xl bg-[#0B2315]/60 border border-[#2ECC71]/30 relative z-10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#2ECC71] font-bold">
          <Activity size={14} className="shrink-0" />
          <span>Biophysical Interpretation & Evidence Boundary:</span>
        </div>
        <p className="text-xs sm:text-sm font-sans text-[#E5EFE9] leading-relaxed">
          {overallInterpretation}
        </p>
        <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-[#8A9A92] flex items-start gap-2">
          <Info size={13} className="text-[#38BDF8] shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">Scientific Disclaimer:</strong> Multi-spectral drops do not prove deforestation. Seasonal leaf-fall, micro-topographic moisture variations, cloud fringes, and sensor calibration shifts can influence candidate screening.
          </span>
        </div>
      </div>

      {/* SECTION 2 & 6: RECOMMENDED NEXT STEP */}
      <div className="p-4 rounded-xl bg-[#F5B841]/[0.08] border border-[#F5B841]/30 relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#F5B841] font-bold mb-1.5">
          <ArrowRight size={14} className="shrink-0" />
          <span>Recommended Next Step:</span>
        </div>
        <p className="text-xs sm:text-sm font-sans text-white font-medium leading-relaxed mb-3">
          {recommendedNextStep}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#8A9A92]">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
            Protocol: Sentinel-2 Follow-up Pass
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
            Ground-Truth: Hand Auger at 45cm Depth
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
            Crown Survey: Needle Turgor & Resin Check
          </span>
        </div>
      </div>
    </div>
  );
};
