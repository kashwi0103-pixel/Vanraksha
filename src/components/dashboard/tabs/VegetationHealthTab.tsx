/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { 
  Sprout, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  BarChart3, 
  Layers
} from 'lucide-react';

interface RasterCell {
  x: number;
  y: number;
  col: string;
  row: number;
  ndvi: number;
  category: 'Dense Canopy' | 'Moderate Canopy' | 'Stressed Canopy' | 'Degraded';
}

export const VegetationHealthTab: React.FC = () => {
  const { currentDay, setActiveDashboardTab } = useForest();
  const [hoveredCell, setHoveredCell] = useState<RasterCell | null>(null);

  // Generate an 8x6 raster grid of NDVI pixels representing the study catchment
  const currentNdvi = currentDay?.ndvi ?? 0.72;
  const baselineNdvi = currentDay?.seasonalBaseline.ndvi ?? 0.75;
  const ndviAnomaly = currentNdvi - baselineNdvi;

  // Synthesize realistic spatial variation across the 48 cells
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rows = [1, 2, 3, 4, 5, 6];

  const gridCells: RasterCell[] = [];
  rows.forEach(r => {
    cols.forEach((c, cIdx) => {
      // Natural spatial distribution
      let offset = 0;
      if (r <= 2 && cIdx >= 4) offset = -0.18; // ridge / rock outcrop
      else if (r >= 3 && r <= 5 && cIdx >= 1 && cIdx <= 4) offset = +0.09; // moist valley
      else if (r === 6 && cIdx >= 5) offset = -0.12; // dry boundary

      const jitter = (((r * 7 + cIdx * 13) % 11) - 5) * 0.015;
      const cellNdvi = Math.max(0.25, Math.min(0.92, currentNdvi + offset + jitter));

      let cat: RasterCell['category'] = 'Moderate Canopy';
      if (cellNdvi >= 0.70) cat = 'Dense Canopy';
      else if (cellNdvi >= 0.50) cat = 'Moderate Canopy';
      else if (cellNdvi >= 0.35) cat = 'Stressed Canopy';
      else cat = 'Degraded';

      gridCells.push({
        x: cIdx,
        y: r,
        col: c,
        row: r,
        ndvi: Number(cellNdvi.toFixed(2)),
        category: cat,
      });
    });
  });

  // Calculate summary statistics
  const ndviValues = gridCells.map(c => c.ndvi);
  const meanNdvi = Number((ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length).toFixed(2));
  const minNdvi = Math.min(...ndviValues).toFixed(2);
  const maxNdvi = Math.max(...ndviValues).toFixed(2);

  const denseCount = gridCells.filter(c => c.category === 'Dense Canopy').length;
  const modCount = gridCells.filter(c => c.category === 'Moderate Canopy').length;
  const stressCount = gridCells.filter(c => c.category === 'Stressed Canopy').length;
  const degradedCount = gridCells.filter(c => c.category === 'Degraded').length;

  const densePct = Math.round((denseCount / gridCells.length) * 100);
  const modPct = Math.round((modCount / gridCells.length) * 100);
  const stressPct = Math.round((stressCount / gridCells.length) * 100);
  const degradedPct = Math.round((degradedCount / gridCells.length) * 100);

  const getCellColor = (val: number) => {
    if (val >= 0.75) return '#1B4D2E'; // Very dense green
    if (val >= 0.65) return '#2ECC71'; // Healthy green
    if (val >= 0.50) return '#82C953'; // Moderate lime
    if (val >= 0.40) return '#F5B841'; // Amber stress
    return '#E5533D'; // High stress / barren
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71] flex items-center gap-1.5 mb-1">
            <Sprout size={13} />
            <span>Normalized Difference Vegetation Index (NDVI)</span>
          </span>
          <h3 className="text-xl font-heading font-bold text-white">
            Vegetation Health Distribution & Summary Statistics
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="text-[#8A9A92] hidden sm:inline">Formula: (NIR - Red) / (NIR + Red)</span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => setActiveDashboardTab('nainital-change')}
            className="px-3 py-1.5 rounded-lg bg-[#2ECC71]/15 hover:bg-[#2ECC71]/25 text-[#B6F36A] border border-[#2ECC71]/30 transition-all font-semibold flex items-center gap-1.5"
          >
            <Layers size={13} />
            <span>Nainital 2023 vs 2025 Analysis</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Mean Catchment NDVI</span>
          <div className="text-3xl font-mono font-bold text-[#2ECC71] tabular-nums">
            {meanNdvi}
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            Target Baseline: {baselineNdvi.toFixed(2)}
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">NDVI Spatial Range</span>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {minNdvi} – {maxNdvi}
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            Min (Crest) to Max (Valley)
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">NDVI Seasonal Anomaly</span>
          <div className={`text-2xl font-mono font-bold tabular-nums flex items-center gap-1.5 ${
            ndviAnomaly < -0.05 ? 'text-[#E5533D]' : ndviAnomaly > 0.02 ? 'text-[#2ECC71]' : 'text-[#F5B841]'
          }`}>
            {ndviAnomaly < -0.05 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            <span>{ndviAnomaly >= 0 ? `+${ndviAnomaly.toFixed(2)}` : ndviAnomaly.toFixed(2)}</span>
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            vs 5-Year Climatology
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Stressed Canopy Area</span>
          <div className="text-2xl font-mono font-bold text-[#F5B841] tabular-nums">
            {stressPct + degradedPct}%
          </div>
          <span className="text-xs font-mono text-[#8A9A92] block mt-1">
            {Math.round(650 * ((stressPct + degradedPct) / 100))} ha flagged
          </span>
        </div>
      </div>

      {/* Main Grid & Canopy Breakdown Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial NDVI Raster Grid */}
        <div className="lg:col-span-8 glass-card p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <span className="text-xs font-mono uppercase text-[#8A9A92] flex items-center gap-1.5">
                <Layers size={13} className="text-[#2ECC71]" />
                <span>Spatial NDVI Heatmap Grid (Hover cell to inspect)</span>
              </span>
              {hoveredCell && (
                <span className="text-xs font-mono text-[#B6F36A] font-bold">
                  Sector {hoveredCell.col}{hoveredCell.row}: NDVI {hoveredCell.ndvi} ({hoveredCell.category})
                </span>
              )}
            </div>

            {/* Raster Map Matrix */}
            <div className="p-3 bg-[#05110A] rounded-xl border border-white/10">
              <div className="grid grid-cols-8 gap-2">
                {gridCells.map((c, i) => {
                  const bg = getCellColor(c.ndvi);
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
                        {c.ndvi.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Grid Axis Coordinate Labels */}
              <div className="mt-2 flex justify-between text-[10px] font-mono text-[#8A9A92] px-1">
                <span>Sector A1 (NW Ridge)</span>
                <span>Sector D4 (Riparian Center)</span>
                <span>Sector H6 (SE Boundary)</span>
              </div>
            </div>

            {/* Color Scale Legend */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8A9A92]">
              <span className="text-white font-medium">NDVI Palette Scale:</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#1B4D2E]"></span> &gt;0.75 (Dense)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#2ECC71]"></span> 0.65-0.75 (Healthy)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#82C953]"></span> 0.50-0.65 (Moderate)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#F5B841]"></span> 0.40-0.50 (Stressed)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#E5533D]"></span> &lt;0.40 (Degraded)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canopy Health Distribution Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 border border-white/10">
            <h4 className="text-sm font-mono uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-[#2ECC71]" />
              <span>Canopy Health Summary</span>
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1B4D2E]"></span>
                    <span>Dense Canopy (&gt;0.70)</span>
                  </span>
                  <span className="text-[#2ECC71] font-bold">{densePct}% ({Math.round(650 * (densePct/100))} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#1B4D2E] rounded-full" style={{ width: `${densePct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#82C953]"></span>
                    <span>Moderate Canopy (0.50–0.70)</span>
                  </span>
                  <span className="text-[#B6F36A] font-bold">{modPct}% ({Math.round(650 * (modPct/100))} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#82C953] rounded-full" style={{ width: `${modPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F5B841]"></span>
                    <span>Stressed Canopy (0.35–0.50)</span>
                  </span>
                  <span className="text-[#F5B841] font-bold">{stressPct}% ({Math.round(650 * (stressPct/100))} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#F5B841] rounded-full" style={{ width: `${stressPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5533D]"></span>
                    <span>Degraded / Clear (&lt;0.35)</span>
                  </span>
                  <span className="text-[#E5533D] font-bold">{degradedPct}% ({Math.round(650 * (degradedPct/100))} ha)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#E5533D] rounded-full" style={{ width: `${degradedPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 border border-white/10 space-y-2 text-xs font-mono text-[#8A9A92]">
            <span className="text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
              <Info size={13} className="text-[#38BDF8]" />
              <span>Biophysical Interpretation</span>
            </span>
            <p className="leading-relaxed">
              NDVI monitors chlorophyll absorption. Healthy deciduous and bamboo stands maintain values &gt;0.65. Sustained dips below 0.50 indicate leaf senescence or drought defoliation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
