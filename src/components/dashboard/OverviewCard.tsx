import React from 'react';
import { useForest } from '../../lib/ForestContext';
import { StatusBadge } from '../StatusBadge';
import { SimulatedDataBadge } from '../SimulatedDataBadge';
import { ShieldCheck, Clock, MapPin, Gauge } from 'lucide-react';

export const OverviewCard: React.FC = () => {
  const { evaluation, status, currentDay, dataset, dayIndex } = useForest();
  const fhi = evaluation.forestHealthIndex;

  // Calculate overall data completeness % across dataset
  const totalDays = dataset.length;
  const validDays = dataset.filter(d => d.sensorStatus === 'OK').length;
  const completenessPct = Math.round((validDays / (totalDays || 1)) * 100);

  // SVG Gauge calculation for FHI (semi-circle arc)
  // Angle: -90deg (0 score) to +90deg (100 score) -> total 180 degrees
  const angle = -90 + (fhi.score / 100) * 180;
  
  // Needle coordinates on r=70 circle centered at (100, 95)
  const rad = (angle * Math.PI) / 180;
  const needleLength = 60;
  const needleX = 100 + needleLength * Math.cos(rad);
  const needleY = 95 + needleLength * Math.sin(rad);

  // Completeness ring parameters
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (completenessPct / 100) * ringCircumference;

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      {/* Ambient background glow */}
      <div 
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: status === 'NORMAL MONITORING' ? '#2ECC71' : status === 'WATCH' ? '#F5B841' : status === 'FIELD CHECK RECOMMENDED' ? '#E5533D' : '#8A9A92' }}
        aria-hidden="true"
      />

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#8A9A92] uppercase tracking-wider">
            <MapPin size={13} className="text-[#2ECC71]" aria-hidden="true" />
            <span className="text-white font-medium">Pilot Plot 4A</span>
          </div>
          <SimulatedDataBadge variant="pill" />
        </div>

        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight leading-snug mb-1">
          Blackwood Creek Watershed
        </h3>

        <div className="flex items-center gap-3 text-xs text-[#8A9A92] font-mono mb-4">
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            <span>Obs: {currentDay?.dateString ?? '2026-10-28'} (Day {dayIndex}/89)</span>
          </span>
        </div>

        {/* Status Badge & Completeness Ring row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-[#8A9A92]">Active Triage Status:</span>
            <StatusBadge status={status} size="md" pulsing={true} />
          </div>

          {/* Circular Completeness Ring */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke="#2ECC71"
                  strokeWidth="5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute font-mono font-bold text-[11px] text-white">
                {completenessPct}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-white">Data Completeness</span>
              <span className="text-[10px] font-mono text-[#8A9A92]">Telemetry Mesh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Forest Health Index Gauge */}
      <div className="pt-2 border-t border-white/[0.06] flex flex-col items-center text-center">
        <div className="w-full flex items-center justify-between text-xs font-mono text-[#8A9A92] mb-1">
          <span className="flex items-center gap-1 text-white">
            <Gauge size={13} className="text-[#B6F36A]" aria-hidden="true" />
            <span>Forest Health Index (FHI)</span>
          </span>
          <span className="font-bold text-lg text-white font-mono-numbers">
            {fhi.score} <span className="text-xs font-normal text-[#8A9A92]">/ 100</span>
          </span>
        </div>

        {/* Semi-Circle SVG Gauge */}
        <div className="relative w-48 h-24 my-2">
          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gaugeArcGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#E5533D" />
                <stop offset="35%" stopColor="#F5B841" />
                <stop offset="70%" stopColor="#2ECC71" />
                <stop offset="100%" stopColor="#B6F36A" />
              </linearGradient>
            </defs>

            {/* Gauge Background Track */}
            <path
              d="M 25 95 A 75 75 0 0 1 175 95"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Colored Active Arc */}
            <path
              d="M 25 95 A 75 75 0 0 1 175 95"
              fill="none"
              stroke="url(#gaugeArcGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="235"
              strokeDashoffset={235 - (fhi.score / 100) * 235}
              className="transition-all duration-700 ease-out"
            />

            {/* Pivot Point */}
            <circle cx="100" cy="95" r="7" fill="#0A2618" stroke="#2ECC71" strokeWidth="2.5" />

            {/* Easing Needle */}
            <line
              x1="100"
              y1="95"
              x2={needleX}
              y2={needleY}
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
            />
          </svg>
        </div>

        {/* Mandatory FHI Label & Subscores */}
        <div className="text-[10px] font-mono text-[#F5B841] italic mb-3">
          Label: "{fhi.label}"
        </div>

        <div className="grid grid-cols-3 gap-2 w-full text-[10px] font-mono">
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
            <span className="text-[#8A9A92] block">Soil</span>
            <span className="text-white font-semibold">{fhi.breakdown.soilSubScore}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
            <span className="text-[#8A9A92] block">Weather</span>
            <span className="text-white font-semibold">{fhi.breakdown.weatherSubScore}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
            <span className="text-[#8A9A92] block">Satellite</span>
            <span className="text-white font-semibold">{fhi.breakdown.satelliteSubScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
