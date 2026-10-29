import React, { useState } from 'react';
import { useForest } from '../../lib/ForestContext';
import { Orbit, Cloud, Eye, Info } from 'lucide-react';

export const SatelliteTrendCard: React.FC = () => {
  const { dataset, currentDay } = useForest();
  const [metric, setMetric] = useState<'NDVI' | 'NDMI'>('NDVI');
  const [hoveredPass, setHoveredPass] = useState<{
    dayIndex: number;
    date: string;
    value: number | null;
    baseline: number;
    cloudPct: number | null;
    x: number;
    y: number;
  } | null>(null);

  // Extract satellite passes (every 5 days)
  const passes = dataset.filter(d => d.isSatellitePass);

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Y-axis scales:
  // NDVI typically 0.2 to 0.9; NDMI typically 0.0 to 0.6
  const yMin = metric === 'NDVI' ? 0.3 : 0.0;
  const yMax = metric === 'NDVI' ? 0.9 : 0.6;

  const getX = (index: number) => {
    return padLeft + (index / (passes.length - 1 || 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return padTop + plotHeight - ratio * plotHeight;
  };

  // Generate baseline smooth path
  const baselinePoints = passes.map((p, idx) => {
    const val = metric === 'NDVI' ? p.seasonalBaseline.ndvi : p.seasonalBaseline.ndmi;
    return `${getX(idx)},${getY(val)}`;
  });
  const baselinePath = `M ${baselinePoints.join(' L ')}`;

  // Area band (+/- 0.05 around baseline)
  const bandUpper = passes.map((p, idx) => {
    const val = (metric === 'NDVI' ? p.seasonalBaseline.ndvi : p.seasonalBaseline.ndmi) + 0.04;
    return `${getX(idx)},${getY(val)}`;
  });
  const bandLower = passes.slice().reverse().map((p, idx) => {
    const revIdx = passes.length - 1 - idx;
    const val = (metric === 'NDVI' ? p.seasonalBaseline.ndvi : p.seasonalBaseline.ndmi) - 0.04;
    return `${getX(revIdx)},${getY(val)}`;
  });
  const bandAreaPath = `M ${bandUpper.join(' L ')} L ${bandLower.join(' L ')} Z`;

  // Observed line segments with gaps for null / cloudy passes (never interpolated!)
  const segments: string[] = [];
  let currentSegment: string[] = [];

  passes.forEach((p, idx) => {
    const val = metric === 'NDVI' ? p.ndvi : p.ndmi;
    if (val !== null) {
      currentSegment.push(`${getX(idx)},${getY(val)}`);
    } else {
      if (currentSegment.length > 1) {
        segments.push(`M ${currentSegment.join(' L ')}`);
      }
      currentSegment = [];
    }
  });
  if (currentSegment.length > 1) {
    segments.push(`M ${currentSegment.join(' L ')}`);
  }

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      {/* Card Header & Metric Switcher */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
              <Orbit size={14} className="text-[#2ECC71]" aria-hidden="true" />
              <span>Copernicus Sentinel-2 MSI (10m–20m)</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Canopy Moisture & Vegetation Trend
            </h3>
          </div>

          {/* Toggle Button Group */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMetric('NDVI')}
              className={`px-3 py-1 rounded-lg transition-all ${
                metric === 'NDVI'
                  ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-medium border border-[#2ECC71]/40'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              NDVI (Canopy Vigor)
            </button>
            <button
              type="button"
              onClick={() => setMetric('NDMI')}
              className={`px-3 py-1 rounded-lg transition-all ${
                metric === 'NDMI'
                  ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-medium border border-[#2ECC71]/40'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              NDMI (Water Index)
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#8A9A92] mb-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#2ECC71] inline-block" />
            <strong className="text-white font-normal">Observed Clear Passes</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#F5B841] inline-block" />
            <span>Seasonal Baseline Band</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#8A9A92] inline-block" />
            <span>Cloud-Masked Gaps (No Imputation)</span>
          </span>
        </div>
      </div>

      {/* SVG Time Series Chart */}
      <div className="relative w-full overflow-hidden my-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Horizontal grid lines */}
          {[yMin, (yMin + yMax) / 2, yMax].map((tickVal, i) => {
            const y = getY(tickVal);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="2 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  fill="#8A9A92"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tickVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Seasonal Baseline Area Envelope Band */}
          <path d={bandAreaPath} fill="rgba(245, 184, 65, 0.08)" />

          {/* Seasonal Baseline Center Line (Dashed) */}
          <path
            d={baselinePath}
            fill="none"
            stroke="#F5B841"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.7"
          />

          {/* Observed Pass Segments (Gaps explicitly visible) */}
          {segments.map((dStr, idx) => (
            <path
              key={idx}
              d={dStr}
              fill="none"
              stroke="#2ECC71"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(46,204,113,0.3)]"
            />
          ))}

          {/* Observation Points & Hollow Cloud Glyphs */}
          {passes.map((p, idx) => {
            const x = getX(idx);
            const val = metric === 'NDVI' ? p.ndvi : p.ndmi;
            const baselineVal = metric === 'NDVI' ? p.seasonalBaseline.ndvi : p.seasonalBaseline.ndmi;

            if (val === null) {
              // Cloud-masked gap point (Hollow Gray Circle on baseline)
              const y = getY(baselineVal);
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPass({
                    dayIndex: p.dayIndex,
                    date: p.dateString,
                    value: null,
                    baseline: baselineVal,
                    cloudPct: p.cloudPct,
                    x,
                    y,
                  })}
                  onMouseLeave={() => setHoveredPass(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#06120C"
                    stroke="#8A9A92"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={x - 2.5}
                    y1={y - 2.5}
                    x2={x + 2.5}
                    y2={y + 2.5}
                    stroke="#8A9A92"
                    strokeWidth="1"
                  />
                </g>
              );
            }

            // Valid clear observation point
            const y = getY(val);
            return (
              <g
                key={idx}
                className="cursor-pointer group/point"
                onMouseEnter={() => setHoveredPass({
                  dayIndex: p.dayIndex,
                  date: p.dateString,
                  value: val,
                  baseline: baselineVal,
                  cloudPct: p.cloudPct,
                  x,
                  y,
                })}
                onMouseLeave={() => setHoveredPass(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="4.5"
                  fill="#06120C"
                  stroke="#2ECC71"
                  strokeWidth="2"
                  className="transition-all group-hover/point:scale-125"
                />
              </g>
            );
          })}

          {/* X-axis date labels */}
          {passes.filter((_, i) => i % 4 === 0).map((p, i) => {
            const originalIndex = passes.findIndex(x => x.dayIndex === p.dayIndex);
            const x = getX(originalIndex);
            return (
              <text
                key={i}
                x={x}
                y={svgHeight - 10}
                fill="#8A9A92"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {p.dateString.slice(5)}
              </text>
            );
          })}
        </svg>

        {/* Tooltip on Hover */}
        {hoveredPass && (
          <div
            className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-[#06120C]/95 border border-white/20 shadow-xl text-[11px] font-mono text-white backdrop-blur-md transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPass.x / svgWidth) * 100}%`,
              top: `${(hoveredPass.y / svgHeight) * 100 - 4}%`,
            }}
          >
            <div className="font-semibold text-white mb-0.5">
              Pass: {hoveredPass.date} (Day {hoveredPass.dayIndex})
            </div>
            {hoveredPass.value !== null ? (
              <div className="text-[#2ECC71]">
                {metric}: {hoveredPass.value.toFixed(3)}
                <span className="text-[#8A9A92] block text-[10px]">
                  Seasonal Baseline: {hoveredPass.baseline.toFixed(3)}
                </span>
              </div>
            ) : (
              <div className="text-[#8A9A92]">
                <span className="text-[#F5B841] block">Cloud Masked (Gap)</span>
                Cloud Cover: {hoveredPass.cloudPct}% &gt; 35% threshold
              </div>
            )}
          </div>
        )}
      </div>

      {/* Provenance footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#8A9A92]">
        <span>Pass Frequency: 5-Day Orbit</span>
        <span className="text-[#2ECC71]">Strict Zero-Imputation</span>
      </div>
    </div>
  );
};
