import React from 'react';
import { useForest } from '../../lib/ForestContext';
import { CloudRain, Thermometer, Database } from 'lucide-react';

export const WeatherContextCard: React.FC = () => {
  const { dataset, currentDay, scenario, dataSourceMode, dataSourceInfo } = useForest();

  // Downsample to weekly or 15-day intervals for clean bar/line chart
  // Pick every 3rd day to display 30 distinct points across the 90 days
  const chartDays = dataset.filter((_, i) => i % 3 === 0);

  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Temperature scale: 15°C to 42°C
  const tempMin = 15;
  const tempMax = 42;
  const getTempY = (c: number) => {
    const ratio = (c - tempMin) / (tempMax - tempMin);
    return padTop + plotHeight - ratio * plotHeight;
  };

  // Rainfall scale: 0mm to 60mm
  const rainMax = 50;
  const getRainY = (mm: number) => {
    const ratio = Math.min(1, mm / rainMax);
    return padTop + plotHeight - ratio * plotHeight;
  };

  const getX = (idx: number) => {
    return padLeft + (idx / (chartDays.length - 1 || 1)) * plotWidth;
  };

  // Paths for actual temperature and baseline temperature
  const tempPoints = chartDays.map((d, i) => `${getX(i)},${getTempY(d.tempC)}`);
  const tempPath = `M ${tempPoints.join(' L ')}`;

  const baselineTempPoints = chartDays.map((d, i) => `${getX(i)},${getTempY(d.seasonalBaseline.tempC)}`);
  const baselineTempPath = `M ${baselineTempPoints.join(' L ')}`;

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
              <CloudRain size={14} className="text-[#2ECC71]" aria-hidden="true" />
              <span>Microclimate History (90 Days)</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Precipitation & Thermal Anomaly
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#8A9A92]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#2ECC71]/60 inline-block rounded-xs" />
              <span>Rainfall (mm)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#E5533D] inline-block" />
              <span className="text-white">Temp (°C)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#F5B841] inline-block" />
              <span>Baseline Temp</span>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Dual-Axis Chart */}
      <div className="relative w-full my-2">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
          {/* Horizontal Temperature Reference Grid */}
          {[20, 30, 40].map((t, i) => {
            const y = getTempY(t);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="2 3"
                />
                {/* Left Y-axis: Temp (°C) */}
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  fill="#E5533D"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {t}°C
                </text>
              </g>
            );
          })}

          {/* Right Y-axis: Rainfall (mm) */}
          {[0, 25, 50].map((r, i) => {
            const y = getRainY(r);
            return (
              <text
                key={i}
                x={svgWidth - padRight + 8}
                y={y + 3}
                fill="#2ECC71"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="start"
              >
                {r}mm
              </text>
            );
          })}

          {/* Rainfall Bars (Blue-green transparent vertical rects) */}
          {chartDays.map((d, i) => {
            if (d.rainfallMm <= 0) return null;
            const x = getX(i);
            const barY = getRainY(d.rainfallMm);
            const barHeight = padTop + plotHeight - barY;
            return (
              <rect
                key={i}
                x={x - 4}
                y={barY}
                width={8}
                height={barHeight}
                fill="#2ECC71"
                opacity="0.45"
                rx="2"
              />
            );
          })}

          {/* Seasonal Baseline Temperature (Dashed Amber line) */}
          <path
            d={baselineTempPath}
            fill="none"
            stroke="#F5B841"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.8"
          />

          {/* Actual Temperature (Solid Orange-red line) */}
          <path
            d={tempPath}
            fill="none"
            stroke="#E5533D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* X-axis date labels */}
          {chartDays.filter((_, i) => i % 6 === 0).map((d, i) => {
            const originalIndex = chartDays.findIndex(x => x.dayIndex === d.dayIndex);
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
                {d.dateString.slice(5)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Provenance footer & Scientific Caveat */}
      <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-[11px] font-mono">
        <div className="flex flex-wrap items-center justify-between text-[#8A9A92] gap-2">
          <span>
            Data Source:{' '}
            <strong className="text-white">
              {dataSourceMode === 'simulated'
                ? `Simulated Microclimate Model (${scenario}) · Demo Scenario`
                : `Uploaded Station Records (${dataSourceInfo.sourceName})`}
            </strong>
          </span>
          <span>Observation Cycle: 2026-08-01 &rarr; {currentDay?.dateString}</span>
        </div>
        <p className="text-[10px] font-sans text-[#8A9A92]/80 leading-tight">
          * Weather parameters provide environmental context only and do not establish causation of vegetation index shifts.
        </p>
      </div>
    </div>
  );
};
