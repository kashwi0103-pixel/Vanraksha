/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { 
  Droplets, 
  Layers, 
  Info, 
  CloudRain
} from 'lucide-react';

interface MoistureCell {
  col: string;
  row: number;
  ndmi: number;
  category: 'High Hydration' | 'Moderate Moisture' | 'Mild Stress' | 'Severe Desiccation';
}

export const MoistureMonitoringTab: React.FC = () => {
  const { currentDay, dataset, dayIndex, setActiveDashboardTab } = useForest();
  const [hoveredCell, setHoveredCell] = useState<MoistureCell | null>(null);

  const currentNdmi = currentDay?.ndmi ?? 0.38;
  const soilMoisturePct = currentDay?.calibratedSoilPct ?? 28;

  // Calculate 14-day rainfall and consecutive dry days
  const recentDays = dataset.slice(Math.max(0, dayIndex - 13), dayIndex + 1);
  const rain14d = recentDays.reduce((acc, d) => acc + d.rainfallMm, 0);

  let dryDays = 0;
  for (let i = dayIndex; i >= 0; i--) {
    if (dataset[i] && dataset[i].rainfallMm < 1.0) {
      dryDays++;
    } else {
      break;
    }
  }

  // Synthesize 8x6 NDMI spatial raster
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rows = [1, 2, 3, 4, 5, 6];

  const gridCells: MoistureCell[] = [];
  rows.forEach(r => {
    cols.forEach((c, cIdx) => {
      let offset = 0;
      if (r <= 2 && cIdx >= 4) offset = -0.16; // crest / fast runoff
      else if (r >= 3 && r <= 5 && cIdx >= 1 && cIdx <= 4) offset = +0.11; // alluvial moisture
      else if (r === 6 && cIdx >= 5) offset = -0.10; // exposed boundary

      const jitter = (((r * 11 + cIdx * 7) % 9) - 4) * 0.015;
      const cellNdmi = Math.max(-0.05, Math.min(0.65, currentNdmi + offset + jitter));

      let cat: MoistureCell['category'] = 'Moderate Moisture';
      if (cellNdmi >= 0.40) cat = 'High Hydration';
      else if (cellNdmi >= 0.25) cat = 'Moderate Moisture';
      else if (cellNdmi >= 0.10) cat = 'Mild Stress';
      else cat = 'Severe Desiccation';

      gridCells.push({
        col: c,
        row: r,
        ndmi: Number(cellNdmi.toFixed(2)),
        category: cat,
      });
    });
  });

  const ndmiValues = gridCells.map(c => c.ndmi);
  const meanNdmi = Number((ndmiValues.reduce((a, b) => a + b, 0) / ndmiValues.length).toFixed(2));
  const minNdmi = Math.min(...ndmiValues).toFixed(2);
  const maxNdmi = Math.max(...ndmiValues).toFixed(2);

  const highCount = gridCells.filter(c => c.category === 'High Hydration').length;
  const modCount = gridCells.filter(c => c.category === 'Moderate Moisture').length;
  const mildCount = gridCells.filter(c => c.category === 'Mild Stress').length;
  const severeCount = gridCells.filter(c => c.category === 'Severe Desiccation').length;

  const highPct = Math.round((highCount / gridCells.length) * 100);
  const modPct = Math.round((modCount / gridCells.length) * 100);
  const mildPct = Math.round((mildCount / gridCells.length) * 100);
  const severePct = Math.round((severeCount / gridCells.length) * 100);

  // Moisture palette: Deep blue/cyan (high) to Amber/Red (desiccated)
  const getCellColor = (val: number) => {
    if (val >= 0.45) return '#0284C7'; // Deep ocean blue
    if (val >= 0.35) return '#38BDF8'; // Sky cyan
    if (val >= 0.20) return '#67E8F9'; // Pale cyan
    if (val >= 0.08) return '#F5B841'; // Amber moisture deficit
    return '#E5533D'; // Critical desiccation
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5 mb-1">
            <Droplets size={13} />
            <span>Normalized Difference Moisture Index (NDMI)</span>
          </span>
          <h3 className="text-xl font-heading font-bold text-white">
            Canopy Water Content & Soil Moisture Correlation
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="text-[#8A9A92] hidden sm:inline">Formula: (NIR - SWIR) / (NIR + SWIR)</span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => setActiveDashboardTab('nainital-change')}
            className="px-3 py-1.5 rounded-lg bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/30 transition-all font-semibold flex items-center gap-1.5"
          >
            <Layers size={13} />
            <span>Nainital 2023 vs 2025 Analysis</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Mean Catchment NDMI</span>
          <div className="text-3xl font-mono font-bold text-[#38BDF8] tabular-nums">
            {meanNdmi}
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            Range: {minNdmi} to {maxNdmi}
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Soil vs Canopy Correlation</span>
          <div className="text-2xl font-mono font-bold text-[#B6F36A] tabular-nums">
            87% Sync
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            Capacitance: {soilMoisturePct}% vs NDMI: {meanNdmi}
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Consecutive Dry Days</span>
          <div className="text-2xl font-mono font-bold text-white tabular-nums flex items-center gap-1.5">
            <CloudRain size={20} className="text-[#38BDF8]" />
            <span>{dryDays} Days</span>
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            14-Day Rain: {rain14d.toFixed(1)} mm
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Critical Desiccation Area</span>
          <div className="text-2xl font-mono font-bold text-[#E5533D] tabular-nums">
            {severePct}% ({Math.round(650 * (severePct / 100))} ha)
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            NDMI &lt; 0.10 water stress
          </span>
        </div>
      </div>

      {/* Main Moisture Matrix Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial NDMI Raster Grid */}
        <div className="lg:col-span-8 glass-card p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <span className="text-xs font-mono uppercase text-[#8A9A92] flex items-center gap-1.5">
                <Layers size={13} className="text-[#38BDF8]" />
                <span>Spatial Canopy Moisture Matrix (Hover cell to inspect)</span>
              </span>
              {hoveredCell && (
                <span className="text-xs font-mono text-[#38BDF8] font-bold">
                  Sector {hoveredCell.col}{hoveredCell.row}: NDMI {hoveredCell.ndmi} ({hoveredCell.category})
                </span>
              )}
            </div>

            {/* Raster Map Matrix */}
            <div className="p-3 bg-[#05110A] rounded-xl border border-white/10">
              <div className="grid grid-cols-8 gap-2">
                {gridCells.map((c, i) => {
                  const bg = getCellColor(c.ndmi);
                  const isHovered = hoveredCell?.col === c.col && hoveredCell?.row === c.row;
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredCell(c)}
                      className={`aspect-square rounded-md transition-all cursor-pointer flex flex-col items-center justify-center p-1 relative border ${
                        isHovered 
                          ? 'border-white scale-110 shadow-lg z-10 ring-2 ring-white/50' 
                          : 'border-black/30 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: bg }}
                    >
                      <span className="text-[9px] font-mono text-white/70 select-none font-bold">
                        {c.col}{c.row}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-white tabular-nums drop-shadow">
                        {c.ndmi.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Grid Axis Labels */}
              <div className="mt-2 flex justify-between text-[10px] font-mono text-[#8A9A92] px-1">
                <span>Sector A1 (North Ridge)</span>
                <span>Sector D4 (River Alluvium)</span>
                <span>Sector H6 (South Plateau)</span>
              </div>
            </div>

            {/* Color Scale Legend */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8A9A92]">
              <span className="text-white font-medium">NDMI Moisture Palette:</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#0284C7]"></span> &gt;0.45 (High Hydration)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#38BDF8]"></span> 0.35-0.45 (Moderate)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#67E8F9]"></span> 0.20-0.35 (Mild Deficit)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#F5B841]"></span> 0.08-0.20 (Moderate Deficit)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#E5533D]"></span> &lt;0.08 (Severe)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Moisture Stress Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 border border-white/10">
            <h4 className="text-sm font-mono uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Droplets size={14} className="text-[#38BDF8]" />
              <span>Moisture Stress Categories</span>
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
                    <span>High Hydration (&gt;0.40)</span>
                  </span>
                  <span className="text-[#38BDF8] font-bold">{highPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#0284C7] rounded-full" style={{ width: `${highPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
                    <span>Moderate Moisture (0.25–0.40)</span>
                  </span>
                  <span className="text-[#67E8F9] font-bold">{modPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: `${modPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F5B841]"></span>
                    <span>Mild Water Stress (0.10–0.25)</span>
                  </span>
                  <span className="text-[#F5B841] font-bold">{mildPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#F5B841] rounded-full" style={{ width: `${mildPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5533D]"></span>
                    <span>Severe Desiccation (&lt;0.10)</span>
                  </span>
                  <span className="text-[#E5533D] font-bold">{severePct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#E5533D] rounded-full" style={{ width: `${severePct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 border border-white/10 space-y-2 text-xs font-mono text-[#8A9A92]">
            <span className="text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
              <Info size={13} className="text-[#2ECC71]" />
              <span>Ground vs Satellite Synergy</span>
            </span>
            <p className="leading-relaxed">
              When ground soil capacitance drops below 20% while canopy NDMI drops below 0.20 simultaneously, the dual-sensor trigger marks severe physiological drought risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
