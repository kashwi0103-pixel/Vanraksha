/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { 
  LineChart, 
  Orbit, 
  Cloud, 
  Calendar, 
  Eye, 
  Layers, 
  Droplets, 
  Thermometer, 
  Table as TableIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const HistoricalTrendsTab: React.FC = () => {
  const { dataset } = useForest();
  const [rangeDays, setRangeDays] = useState<30 | 60 | 90>(90);
  const [showRain, setShowRain] = useState<boolean>(true);
  const [showTemp, setShowTemp] = useState<boolean>(false);
  const [hoveredPass, setHoveredPass] = useState<{
    date: string;
    dayIndex: number;
    ndvi: number | null;
    ndmi: number | null;
    cloudPct: number | null;
    rainMm: number;
    tempC: number;
    x: number;
    yNdvi: number;
  } | null>(null);

  // Filter dataset by selected range
  const filteredDataset = dataset.slice(Math.max(0, dataset.length - rangeDays));
  const passes = filteredDataset.filter(d => d.isSatellitePass);

  // SVG Chart geometry
  const svgWidth = 840;
  const svgHeight = 260;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Scales:
  // NDVI/NDMI range: 0.0 to 1.0
  const yMin = 0.0;
  const yMax = 1.0;

  const getX = (index: number) => {
    return padLeft + (index / (passes.length - 1 || 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return padTop + plotHeight - ratio * plotHeight;
  };

  // NDVI line segments with un-interpolated gaps
  const ndviSegments: string[] = [];
  let curNdviSeg: string[] = [];
  passes.forEach((p, idx) => {
    if (p.ndvi !== null) {
      curNdviSeg.push(`${getX(idx)},${getY(p.ndvi)}`);
    } else {
      if (curNdviSeg.length > 1) ndviSegments.push(`M ${curNdviSeg.join(' L ')}`);
      curNdviSeg = [];
    }
  });
  if (curNdviSeg.length > 1) ndviSegments.push(`M ${curNdviSeg.join(' L ')}`);

  // NDMI line segments with un-interpolated gaps
  const ndmiSegments: string[] = [];
  let curNdmiSeg: string[] = [];
  passes.forEach((p, idx) => {
    if (p.ndmi !== null) {
      curNdmiSeg.push(`${getX(idx)},${getY(p.ndmi)}`);
    } else {
      if (curNdmiSeg.length > 1) ndmiSegments.push(`M ${curNdmiSeg.join(' L ')}`);
      curNdmiSeg = [];
    }
  });
  if (curNdmiSeg.length > 1) ndmiSegments.push(`M ${curNdmiSeg.join(' L ')}`);

  return (
    <div className="space-y-6">
      {/* Top Banner & Range Controls */}
      <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71] flex items-center gap-1.5 mb-1">
            <LineChart size={13} />
            <span>Sentinel-2 MSI Multi-Temporal Series</span>
          </span>
          <h3 className="text-xl font-heading font-bold text-white">
            Historical NDVI & NDMI Trajectory
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Range Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setRangeDays(30)}
              className={`px-3 py-1 rounded-lg transition-all ${
                rangeDays === 30 ? 'bg-white/15 text-white font-bold' : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(60)}
              className={`px-3 py-1 rounded-lg transition-all ${
                rangeDays === 60 ? 'bg-white/15 text-white font-bold' : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              60 Days
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(90)}
              className={`px-3 py-1 rounded-lg transition-all ${
                rangeDays === 90 ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-bold border border-[#2ECC71]/40' : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              Full Series
            </button>
          </div>

          {/* Overlays */}
          <button
            type="button"
            onClick={() => setShowRain(!showRain)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              showRain ? 'bg-[#38BDF8]/15 border-[#38BDF8]/30 text-[#38BDF8]' : 'bg-white/[0.02] border-white/5 text-[#8A9A92]'
            }`}
          >
            <Droplets size={13} />
            <span>Rainfall Bars</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTemp(!showTemp)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              showTemp ? 'bg-[#F5B841]/15 border-[#F5B841]/30 text-[#F5B841]' : 'bg-white/[0.02] border-white/5 text-[#8A9A92]'
            }`}
          >
            <Thermometer size={13} />
            <span>Temp (°C)</span>
          </button>
        </div>
      </div>

      {/* Main Longitudinal Chart */}
      <div className="glass-card p-6 border border-white/10 relative overflow-hidden">
        {/* Chart Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/5 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#2ECC71] font-bold">
              <span className="w-3 h-0.5 bg-[#2ECC71]"></span>
              <span>NDVI (Canopy Vigor)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
              <span className="w-3 h-0.5 bg-[#38BDF8]"></span>
              <span>NDMI (Canopy Moisture)</span>
            </span>
            {showRain && (
              <span className="flex items-center gap-1.5 text-[#60A5FA]">
                <span className="w-2.5 h-2.5 bg-[#38BDF8]/30 border border-[#38BDF8]/60"></span>
                <span>Precipitation (mm)</span>
              </span>
            )}
          </div>

          <span className="text-[#8A9A92]">
            Note: Cloudy / missing passes are preserved as gaps (never interpolated)
          </span>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="relative w-full aspect-[21/8] bg-[#05110A] rounded-xl border border-white/10 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Horizontal Gridlines */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((v) => {
              const y = getY(v);
              return (
                <g key={v}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    fill="#8A9A92"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {v.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Rainfall Bars background */}
            {showRain && passes.map((p, idx) => {
              const x = getX(idx);
              const barHeight = Math.min(plotHeight * 0.45, (p.rainfallMm / 25) * plotHeight * 0.45);
              const y = padTop + plotHeight - barHeight;
              return (
                <rect
                  key={`rain-${idx}`}
                  x={x - 6}
                  y={y}
                  width="12"
                  height={barHeight}
                  fill="rgba(56, 189, 248, 0.22)"
                  stroke="rgba(56, 189, 248, 0.4)"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* NDMI Paths */}
            {ndmiSegments.map((seg, i) => (
              <path
                key={`ndmi-${i}`}
                d={seg}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* NDVI Paths */}
            {ndviSegments.map((seg, i) => (
              <path
                key={`ndvi-${i}`}
                d={seg}
                fill="none"
                stroke="#2ECC71"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Pass Acquisition Nodes & Cloud Gaps */}
            {passes.map((p, idx) => {
              const x = getX(idx);
              const yNdvi = p.ndvi !== null ? getY(p.ndvi) : null;
              const yNdmi = p.ndmi !== null ? getY(p.ndmi) : null;
              const isCloudy = p.ndvi === null;

              return (
                <g key={idx} className="cursor-pointer">
                  {/* Vertical hover hit zone */}
                  <rect
                    x={x - 14}
                    y={padTop}
                    width="28"
                    height={plotHeight}
                    fill="transparent"
                    onMouseEnter={() =>
                      setHoveredPass({
                        date: p.dateString,
                        dayIndex: p.dayIndex,
                        ndvi: p.ndvi,
                        ndmi: p.ndmi,
                        cloudPct: p.cloudPct,
                        rainMm: p.rainfallMm,
                        tempC: p.tempC,
                        x,
                        yNdvi: yNdvi ?? padTop + plotHeight / 2,
                      })
                    }
                  />

                  {/* Cloudy gap marker */}
                  {isCloudy && (
                    <g transform={`translate(${x}, ${padTop + plotHeight - 12})`}>
                      <circle cx="0" cy="0" r="4" fill="none" stroke="#F5B841" strokeWidth="1.5" />
                      <line x1="-3" y1="0" x2="3" y2="0" stroke="#F5B841" strokeWidth="1" />
                    </g>
                  )}

                  {/* NDVI Circle Point */}
                  {yNdvi !== null && (
                    <circle
                      cx={x}
                      cy={yNdvi}
                      r="4"
                      fill="#06120C"
                      stroke="#2ECC71"
                      strokeWidth="2"
                    />
                  )}

                  {/* NDMI Circle Point */}
                  {yNdmi !== null && (
                    <circle
                      cx={x}
                      cy={yNdmi}
                      r="3"
                      fill="#06120C"
                      stroke="#38BDF8"
                      strokeWidth="1.8"
                    />
                  )}

                  {/* X-axis date labels */}
                  <text
                    x={x}
                    y={svgHeight - 10}
                    fill="#8A9A92"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.dateString.slice(5)}
                  </text>
                </g>
              );
            })}

            {/* Hover Guide Cursor */}
            {hoveredPass && (
              <line
                x1={hoveredPass.x}
                y1={padTop}
                x2={hoveredPass.x}
                y2={padTop + plotHeight}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="2 2"
              />
            )}
          </svg>

          {/* Hover Tooltip Popup */}
          {hoveredPass && (
            <div 
              className="absolute p-3 rounded-lg bg-black/90 backdrop-blur-md border border-white/20 text-xs font-mono pointer-events-none shadow-2xl z-20"
              style={{
                left: Math.min(hoveredPass.x + 10, svgWidth - 220),
                top: Math.max(10, hoveredPass.yNdvi - 80),
              }}
            >
              <div className="text-white font-bold pb-1 mb-1 border-b border-white/10 flex items-center justify-between gap-3">
                <span>Pass: {hoveredPass.date}</span>
                <span className="text-[10px] text-[#8A9A92]">Day {hoveredPass.dayIndex}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-[#2ECC71]">NDVI Vigor:</span>
                  <span className="font-bold text-white">
                    {hoveredPass.ndvi !== null ? hoveredPass.ndvi.toFixed(2) : 'Cloud Obscured'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#38BDF8]">NDMI Moisture:</span>
                  <span className="font-bold text-white">
                    {hoveredPass.ndmi !== null ? hoveredPass.ndmi.toFixed(2) : 'Gap'}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-[#8A9A92]">
                  <span>Rain:</span>
                  <span>{hoveredPass.rainMm.toFixed(1)} mm</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Passes Table */}
      <div className="glass-card p-5 border border-white/10">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
          <span className="text-xs font-mono uppercase text-white flex items-center gap-1.5 font-bold">
            <TableIcon size={14} className="text-[#2ECC71]" />
            <span>Copernicus Sentinel-2 Acquisition Log ({passes.length} Passes Recorded)</span>
          </span>
          <span className="text-xs font-mono text-[#8A9A92]">5-Day Repeat Interval</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-[#8A9A92]">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">NDVI</th>
                <th className="py-2 px-3">NDMI</th>
                <th className="py-2 px-3">Cloud %</th>
                <th className="py-2 px-3">Daily Rain</th>
                <th className="py-2 px-3">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {passes.slice().reverse().map((p, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-white font-medium">{p.dateString}</td>
                  <td className="py-2 px-3 text-[#2ECC71] tabular-nums font-bold">
                    {p.ndvi !== null ? p.ndvi.toFixed(2) : '— (Cloud)'}
                  </td>
                  <td className="py-2 px-3 text-[#38BDF8] tabular-nums font-bold">
                    {p.ndmi !== null ? p.ndmi.toFixed(2) : '—'}
                  </td>
                  <td className="py-2 px-3 text-[#8A9A92] tabular-nums">
                    {p.cloudPct ?? 0}%
                  </td>
                  <td className="py-2 px-3 text-white tabular-nums">
                    {p.rainfallMm.toFixed(1)} mm
                  </td>
                  <td className="py-2 px-3">
                    {p.ndvi !== null ? (
                      <span className="text-[#2ECC71] flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Valid Pass</span>
                      </span>
                    ) : (
                      <span className="text-[#F5B841] flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>Cloud Masked</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
