import React, { useEffect, useState } from 'react';
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
  const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

interface MonthlyObservation {
  id: number;
  region_id: number;
  observation_month: string;
  ndvi: number | null;
  ndmi: number | null;
  rainfall_mm: number | null;
  temperature_c: number | null;
}

const [monthlyData, setMonthlyData] = useState<MonthlyObservation[]>([]);
const [monthlyLoading, setMonthlyLoading] = useState(true);
const [monthlyError, setMonthlyError] = useState('');

useEffect(() => {
  let cancelled = false;

  async function loadMonthlyData() {
    try {
      if (!API_BASE) {
        throw new Error('API URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/observations?region_id=1&limit=115&offset=0`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const records: MonthlyObservation[] = await response.json();

      if (!Array.isArray(records)) {
        throw new Error('Unexpected API response format.');
      }

      if (!cancelled) {
        setMonthlyData(
          records
            .filter(record => record.observation_month)
            .sort((a, b) =>
              a.observation_month.localeCompare(b.observation_month)
            )
        );
      }
    } catch (error) {
      if (!cancelled) {
        setMonthlyError(
          error instanceof Error
            ? error.message
            : 'Unable to load monthly observations.'
        );
      }
    } finally {
      if (!cancelled) setMonthlyLoading(false);
    }
  }

  loadMonthlyData();

  return () => {
    cancelled = true;
  };
}, []);
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
      
{/* Actual backend monthly observations */}
<div className="glass-card p-6 border border-white/10 space-y-4">
  <div>
    <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
      Verified Backend Data
    </span>
    <h3 className="text-xl font-heading font-bold text-white mt-1">
      Historical Monthly Vegetation Trends
    </h3>
    <p className="text-xs text-[#8A9A92] mt-1">
      Uttarakhand · Actual monthly records · No daily interpolation
    </p>
  </div>

  {monthlyLoading ? (
    <p className="text-sm text-[#8A9A92]">
      Loading monthly observations…
    </p>
  ) : monthlyError ? (
    <p className="text-sm text-[#E5533D]">
      Monthly data unavailable: {monthlyError}
    </p>
  ) : monthlyData.length === 0 ? (
    <p className="text-sm text-[#F5B841]">
      No monthly observations available.
    </p>
  ) : (
    <>
      {(() => {
        const chartData = monthlyData.filter(
          d => d.ndvi != null || d.ndmi != null
        );

        const width = 840;
        const height = 240;
        const left = 48;
        const right = 20;
        const top = 20;
        const bottom = 36;
        const plotWidth = width - left - right;
        const plotHeight = height - top - bottom;

        const x = (i: number) =>
          left + (i / Math.max(1, chartData.length - 1)) * plotWidth;

        const y = (v: number) =>
          top + plotHeight - Math.max(0, Math.min(1, v)) * plotHeight;

        const makePath = (key: 'ndvi' | 'ndmi') => {
          const segments: string[] = [];
          let current: string[] = [];

          chartData.forEach((record, i) => {
            const value = record[key];

            if (value == null || !Number.isFinite(value)) {
              if (current.length > 1) {
                segments.push(`M ${current.join(' L ')}`);
              }
              current = [];
              return;
            }

            current.push(`${x(i)},${y(value)}`);
          });

          if (current.length > 1) {
            segments.push(`M ${current.join(' L ')}`);
          }

          return segments;
        };

        const ndviPath = makePath('ndvi');
        const ndmiPath = makePath('ndmi');

        return (
          <>
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <span className="text-[#2ECC71]">━ NDVI</span>
              <span className="text-[#38BDF8]">━ NDMI</span>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#05110A]">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                role="img"
                aria-label="Monthly NDVI and NDMI trends from backend observations"
              >
                {[0, 0.25, 0.5, 0.75, 1].map(value => (
                  <g key={value}>
                    <line
                      x1={left}
                      y1={y(value)}
                      x2={width - right}
                      y2={y(value)}
                      stroke="rgba(255,255,255,0.10)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={left - 8}
                      y={y(value) + 4}
                      fill="#8A9A92"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {value.toFixed(2)}
                    </text>
                  </g>
                ))}

                {ndmiPath.map((path, i) => (
                  <path
                    key={`ndmi-${i}`}
                    d={path}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                ))}

                {ndviPath.map((path, i) => (
                  <path
                    key={`ndvi-${i}`}
                    d={path}
                    fill="none"
                    stroke="#2ECC71"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                ))}

                {chartData.map((record, i) => (
                  <g key={record.id}>
                    {record.ndvi != null && (
                      <circle
                        cx={x(i)}
                        cy={y(record.ndvi)}
                        r="3"
                        fill="#2ECC71"
                      >
                        <title>
                          {record.observation_month}: NDVI {record.ndvi}
                        </title>
                      </circle>
                    )}
                    {record.ndmi != null && (
                      <circle
                        cx={x(i)}
                        cy={y(record.ndmi)}
                        r="3"
                        fill="#38BDF8"
                      >
                        <title>
                          {record.observation_month}: NDMI {record.ndmi}
                        </title>
                      </circle>
                    )}
                  </g>
                ))}

                {[0, Math.floor((chartData.length - 1) / 2),
                  chartData.length - 1]
                  .filter((value, i, arr) => arr.indexOf(value) === i)
                  .map(i => (
                    <text
                      key={i}
                      x={x(i)}
                      y={height - 10}
                      fill="#8A9A92"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {chartData[i].observation_month.slice(0, 7)}
                    </text>
                  ))}
              </svg>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-[#8A9A92]">
                    <th className="py-2 px-3">Month</th>
                    <th className="py-2 px-3">NDVI</th>
                    <th className="py-2 px-3">NDMI</th>
                    <th className="py-2 px-3">Rainfall</th>
                    <th className="py-2 px-3">Temperature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {monthlyData.slice(-12).reverse().map(record => (
                    <tr key={record.id}>
                      <td className="py-2 px-3 text-white">
                        {record.observation_month.slice(0, 7)}
                      </td>
                      <td className="py-2 px-3 text-[#2ECC71]">
                        {record.ndvi == null ? '—' : record.ndvi.toFixed(3)}
                      </td>
                      <td className="py-2 px-3 text-[#38BDF8]">
                        {record.ndmi == null ? '—' : record.ndmi.toFixed(3)}
                      </td>
                      <td className="py-2 px-3 text-white">
                        {record.rainfall_mm == null
                          ? '—'
                          : `${record.rainfall_mm.toFixed(1)} mm`}
                      </td>
                      <td className="py-2 px-3 text-white">
                        {record.temperature_c == null
                          ? '—'
                          : `${record.temperature_c.toFixed(1)}°C`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-[#8A9A92]">
              Monthly backend records are shown separately from simulated
              daily telemetry. Missing values are left blank and are not
              interpolated. These screening indicators do not confirm
              forest damage or fire.
            </p>
          </>
        );
      })()}
    </>
  )}
</div>

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
