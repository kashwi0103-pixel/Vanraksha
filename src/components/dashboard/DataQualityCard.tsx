import React, { useState } from 'react';
import { useForest } from '../../lib/ForestContext';
import { Database, AlertOctagon, CloudOff, Wrench, CheckCircle } from 'lucide-react';

export const DataQualityCard: React.FC = () => {
  const { dataset, setDayIndex, dayIndex } = useForest();
  const [hoveredDay, setHoveredDay] = useState<{
    dayIndex: number;
    date: string;
    status: string;
    cloudPct: number | null;
    isSat: boolean;
  } | null>(null);

  // Statistics calculation across 90 days
  const totalDays = dataset.length;
  const staleOrErrorDays = dataset.filter(d => d.sensorStatus !== 'OK').length;
  const cloudyPasses = dataset.filter(d => d.isSatellitePass && (d.ndvi === null || (d.cloudPct && d.cloudPct > 35))).length;
  const nominalDays = totalDays - staleOrErrorDays;

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider">
            <Database size={14} className="text-[#2ECC71]" aria-hidden="true" />
            <span>Data Provenance & Integrity Gate</span>
          </div>

          <span className="text-[10px] font-mono text-[#B6F36A] px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/10">
            90-Day Audit
          </span>
        </div>

        <h3 className="font-heading font-bold text-lg text-white mb-2">
          Quality & Completeness Heatmap
        </h3>

        <p className="text-xs text-[#8A9A92] leading-relaxed mb-4 font-sans">
          Strict zero-imputation policy: cloud-occluded satellite passes and sensor packet dropouts are retained as physical gaps.
        </p>

        {/* Quality KPI Counters */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] text-[#8A9A92] mb-1">
              <CheckCircle size={12} className="text-[#2ECC71]" />
              <span>Nominal Days</span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {nominalDays} <span className="text-xs font-normal text-[#8A9A92]">/ 90</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] text-[#8A9A92] mb-1">
              <AlertOctagon size={12} className="text-[#E5533D]" />
              <span>Stale / Fault</span>
            </div>
            <div className={`text-lg font-bold font-mono ${staleOrErrorDays > 0 ? 'text-[#E5533D]' : 'text-white'}`}>
              {staleOrErrorDays}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] text-[#8A9A92] mb-1">
              <CloudOff size={12} className="text-[#F5B841]" />
              <span>Cloudy Gaps</span>
            </div>
            <div className="text-lg font-bold font-mono text-[#F5B841]">
              {cloudyPasses}
            </div>
          </div>
        </div>

        {/* Completeness Heatmap Timeline Strip (90 Days) */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8A9A92] mb-1.5">
            <span>90-Day Timeline Matrix (Click day to scrub):</span>
            <span>{hoveredDay ? `${hoveredDay.date} · ${hoveredDay.status}` : `Scrubbed: Day ${dayIndex}`}</span>
          </div>

          {/* Grid of 90 mini blocks */}
          <div className="grid grid-cols-15 sm:grid-cols-30 gap-1 p-2 rounded-xl bg-black/40 border border-white/5">
            {dataset.map((d) => {
              const isSelected = d.dayIndex === dayIndex;
              const isFault = d.sensorStatus !== 'OK';
              const isCloudyPass = d.isSatellitePass && (d.ndvi === null || (d.cloudPct && d.cloudPct > 35));

              let blockColor = 'bg-[#2ECC71]/60 hover:bg-[#2ECC71]';
              if (isFault) {
                blockColor = 'bg-[#E5533D] animate-pulse';
              } else if (isCloudyPass) {
                blockColor = 'bg-[#F5B841]/80 hover:bg-[#F5B841]';
              }

              return (
                <button
                  key={d.dayIndex}
                  type="button"
                  onClick={() => setDayIndex(d.dayIndex)}
                  onMouseEnter={() => setHoveredDay({
                    dayIndex: d.dayIndex,
                    date: d.dateString,
                    status: d.sensorStatus,
                    cloudPct: d.cloudPct,
                    isSat: d.isSatellitePass,
                  })}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`h-4 rounded-xs transition-all ${blockColor} ${
                    isSelected ? 'ring-2 ring-white scale-125 z-10' : ''
                  }`}
                  aria-label={`Scrub to Day ${d.dayIndex} (${d.dateString})`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#8A9A92] mt-1.5 px-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#2ECC71]/70 inline-block" /> Complete
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#F5B841] inline-block" /> Cloud Pass Gap
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#E5533D] inline-block" /> Stale / Out of Bounds
            </span>
          </div>
        </div>
      </div>

      {/* Sensor Calibration Endpoints */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-[#8A9A92]">
          <Wrench size={13} className="text-[#2ECC71]" />
          <span>ADC Calibration:</span>
        </div>
        <div className="flex items-center gap-3 text-white text-[11px]">
          <span>Sat Wet: <strong className="text-[#2ECC71]">1350 ADC</strong></span>
          <span>·</span>
          <span>Air Dry: <strong className="text-[#F5B841]">2850 ADC</strong></span>
        </div>
      </div>
    </div>
  );
};
