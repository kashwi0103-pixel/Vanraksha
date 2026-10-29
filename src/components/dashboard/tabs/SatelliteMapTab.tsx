/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { ForestStatus } from '../../../lib/types';
import { StatusBadge } from '../../StatusBadge';
import { 
  Layers, 
  Map as MapIcon, 
  Radio, 
  Eye, 
  Compass, 
  Maximize2, 
  Crosshair, 
  ShieldCheck,
  Info,
  Camera,
  Sun,
  Activity
} from 'lucide-react';

type ImageryBand = 'rgb' | 'nir' | 'thermal' | 'elevation';

interface CatchmentZone {
  id: string;
  name: string;
  areaHa: number;
  dominantCanopy: string;
  elevationM: string;
  hasHardwareNode: boolean;
  relativeStatus: ForestStatus;
  polygonPoints: string;
  centerText: { x: number; y: number };
  description: string;
}

export const SatelliteMapTab: React.FC = () => {
  const { status, evaluation } = useForest();
  const [selectedBand, setSelectedBand] = useState<ImageryBand>('nir');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showSensor, setShowSensor] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<CatchmentZone | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const zones: CatchmentZone[] = [
    {
      id: 'zone-a',
      name: 'Zone A: Conifer & Mixed Deciduous Crest',
      areaHa: 140,
      dominantCanopy: 'Tectona grandis (Teak), Terminalia & Bamboo',
      elevationM: '1,020m – 1,180m',
      hasHardwareNode: true,
      relativeStatus: status,
      polygonPoints: '110,60 260,40 310,140 220,230 90,170',
      centerText: { x: 190, y: 135 },
      description: 'High-exposure southern crest with shallow loam. Continuous root-depth capacitance sampling via Sensor Node 1.',
    },
    {
      id: 'zone-b',
      name: 'Zone B: Moist Valley Catchment',
      areaHa: 210,
      dominantCanopy: 'Dalbergia latifolia (Rosewood) & Dense Canopy',
      elevationM: '890m – 1,020m',
      hasHardwareNode: false,
      relativeStatus: status === 'FIELD CHECK RECOMMENDED' ? 'WATCH' : 'NORMAL MONITORING',
      polygonPoints: '260,40 450,30 490,150 310,140',
      centerText: { x: 380, y: 95 },
      description: 'Shaded northern aspect with deeper organic leaf litter. Monitored via Sentinel-2 MSI multispectral passes.',
    },
    {
      id: 'zone-c',
      name: 'Zone C: Moyar River Riparian Gully',
      areaHa: 120,
      dominantCanopy: 'Perennial Alluvial Bamboo & Riparian Thicket',
      elevationM: '810m – 890m',
      hasHardwareNode: false,
      relativeStatus: 'NORMAL MONITORING',
      polygonPoints: '90,170 220,230 310,140 370,250 250,320 80,260',
      centerText: { x: 210, y: 250 },
      description: 'Perennial alluvial corridor with stable groundwater recharge. High vegetative resilience during seasonal dry spells.',
    },
    {
      id: 'zone-d',
      name: 'Zone D: Upper Plateau & Grassland Scrub',
      areaHa: 180,
      dominantCanopy: 'Cymbopogon Grasslands & Open Dry Scrub',
      elevationM: '1,180m – 1,320m',
      hasHardwareNode: false,
      relativeStatus: status === 'NORMAL MONITORING' ? 'NORMAL MONITORING' : 'DATA INCOMPLETE',
      polygonPoints: '310,140 490,150 480,300 370,250',
      centerText: { x: 420, y: 215 },
      description: 'Exposed rocky plateau with high evaporative demand. Sparse canopy reflectance subject to topographic shadow correction.',
    },
  ];

  const getStatusColor = (st: ForestStatus) => {
    switch (st) {
      case 'NORMAL MONITORING': return '#2ECC71';
      case 'WATCH': return '#F5B841';
      case 'FIELD CHECK RECOMMENDED': return '#E5533D';
      case 'DATA INCOMPLETE':
      default: return '#8A9A92';
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Control Ribbon */}
      <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71] flex items-center gap-1.5 mb-1">
            <Camera size={13} />
            <span>Copernicus Sentinel-2 MSI Multi-Band Composite</span>
          </span>
          <h3 className="text-xl font-heading font-bold text-white">
            Study Area Satellite Imagery & Catchment Grid
          </h3>
        </div>

        {/* Imagery Band Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setSelectedBand('nir')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedBand === 'nir'
                  ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-semibold border border-[#2ECC71]/40'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              False-Color NIR (B8-4-3)
            </button>
            <button
              type="button"
              onClick={() => setSelectedBand('rgb')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedBand === 'rgb'
                  ? 'bg-white/15 text-white font-semibold border border-white/20'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              Natural RGB (B4-3-2)
            </button>
            <button
              type="button"
              onClick={() => setSelectedBand('thermal')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedBand === 'thermal'
                  ? 'bg-[#F5B841]/20 text-[#F5B841] font-semibold border border-[#F5B841]/40'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
            >
              Thermal / Desiccation
            </button>
          </div>

          {/* Layer toggles */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              showGrid
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/[0.02] border-white/5 text-[#8A9A92]'
            }`}
          >
            <Crosshair size={13} className={showGrid ? 'text-[#2ECC71]' : ''} />
            <span>Grid Overlay</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSensor(!showSensor)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
              showSensor
                ? 'bg-[#2ECC71]/15 border-[#2ECC71]/30 text-[#B6F36A]'
                : 'bg-white/[0.02] border-white/5 text-[#8A9A92]'
            }`}
          >
            <Radio size={13} />
            <span>Node Pin</span>
          </button>
        </div>
      </div>

      {/* Main Satellite Canvas Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
          {/* HUD Top Left: Coordinates */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 text-xs font-mono text-[#8A9A92]">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-[#2ECC71]" />
              <span className="text-white font-medium">BTR-CZ-B // UTM Zone 43N (WGS84)</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Resol: 10m/px GSD</span>
              <span className="text-white/20">•</span>
              <span>Sun Azimuth: 142.6°</span>
            </div>
          </div>

          {/* Interactive SVG Study Area Map */}
          <div className="relative w-full aspect-[16/10] bg-[#05110A] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
            {/* Satellite Background Simulation Layer based on selected band */}
            <svg 
              className="w-full h-full"
              viewBox="0 0 560 360"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* NIR Gradient */}
                <radialGradient id="nirBioGradient" cx="40%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="#1B4D2E" />
                  <stop offset="40%" stopColor="#11331F" />
                  <stop offset="80%" stopColor="#0B2315" />
                  <stop offset="100%" stopColor="#05120B" />
                </radialGradient>

                {/* RGB Gradient */}
                <radialGradient id="rgbBioGradient" cx="45%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#2A4028" />
                  <stop offset="50%" stopColor="#1B2B1B" />
                  <stop offset="100%" stopColor="#08140B" />
                </radialGradient>

                {/* Thermal Gradient */}
                <radialGradient id="thermalBioGradient" cx="45%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#5E2C1A" />
                  <stop offset="40%" stopColor="#3C2114" />
                  <stop offset="80%" stopColor="#1D1A15" />
                  <stop offset="100%" stopColor="#0A100C" />
                </radialGradient>

                {/* Grid Pattern */}
                <pattern id="utmGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Base Raster Surface */}
              <rect 
                width="560" 
                height="360" 
                fill={
                  selectedBand === 'nir' ? 'url(#nirBioGradient)' :
                  selectedBand === 'rgb' ? 'url(#rgbBioGradient)' :
                  'url(#thermalBioGradient)'
                } 
              />

              {/* Grid Overlay */}
              {showGrid && (
                <rect width="560" height="360" fill="url(#utmGrid)" />
              )}

              {/* Elevation Contours */}
              <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 3" fill="none">
                <ellipse cx="260" cy="180" rx="220" ry="130" />
                <ellipse cx="260" cy="180" rx="160" ry="90" />
                <ellipse cx="230" cy="160" rx="90" ry="50" />
              </g>

              {/* Catchment Micro-Zones */}
              {zones.map((z) => {
                const isSelected = selectedZone?.id === z.id;
                const strokeColor = getStatusColor(z.relativeStatus);

                return (
                  <g 
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    className="cursor-pointer transition-all duration-200 group"
                  >
                    <polygon
                      points={z.polygonPoints}
                      fill={strokeColor}
                      fillOpacity={isSelected ? 0.35 : 0.15}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      className="transition-all duration-200 hover:fill-opacity-30"
                    />
                    <text
                      x={z.centerText.x}
                      y={z.centerText.y}
                      fill="white"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none select-none font-bold"
                    >
                      {z.name.split(':')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Sensor Node #1 Marker */}
              {showSensor && (
                <g className="animate-pulse">
                  <circle cx="210" cy="150" r="14" fill="#2ECC71" fillOpacity="0.2" />
                  <circle cx="210" cy="150" r="7" fill="#2ECC71" />
                  <circle cx="210" cy="150" r="3" fill="#ffffff" />
                  <text 
                    x="210" 
                    y="175" 
                    fill="#B6F36A" 
                    fontSize="9" 
                    fontFamily="monospace" 
                    textAnchor="middle"
                    className="font-bold select-none"
                  >
                    NODE #1 (868 MHz)
                  </text>
                </g>
              )}

              {/* Scale Bar */}
              <g transform="translate(20, 335)">
                <line x1="0" y1="0" x2="60" y2="0" stroke="white" strokeWidth="2" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="white" strokeWidth="2" />
                <line x1="60" y1="-3" x2="60" y2="3" stroke="white" strokeWidth="2" />
                <text x="30" y="-5" fill="white" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  500 m
                </text>
              </g>

              {/* North Arrow */}
              <g transform="translate(530, 35)">
                <circle cx="0" cy="0" r="14" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <path d="M 0 -10 L 4 6 L 0 3 L -4 6 Z" fill="#E5533D" />
                <text x="0" y="-12" fill="#E5533D" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  N
                </text>
              </g>
            </svg>

            {/* Floating Inspector Tooltip if zone is selected */}
            {selectedZone && (
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-10">
                <div>
                  <span className="font-bold text-white block">{selectedZone.name}</span>
                  <span className="text-[#8A9A92] font-mono text-[11px]">{selectedZone.areaHa} ha • {selectedZone.dominantCanopy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedZone.relativeStatus} size="sm" />
                  <button 
                    type="button" 
                    onClick={() => setSelectedZone(null)}
                    className="text-[#8A9A92] hover:text-white px-2 py-1 rounded bg-white/10 font-mono text-[10px]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8A9A92]">
            <span>Click any catchment zone polygon to inspect localized biophysical properties.</span>
            <span className="text-[#2ECC71]">L2A Surface Reflectance Corrected</span>
          </div>
        </div>

        {/* Right Stage: Catchment Zone Diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 border border-white/10">
            <h4 className="text-sm font-mono uppercase tracking-wider text-white mb-3 flex items-center gap-2">
              <Layers size={14} className="text-[#2ECC71]" />
              <span>Catchment Sub-Units</span>
            </h4>

            <div className="space-y-2.5">
              {zones.map(z => {
                const isSelected = selectedZone?.id === z.id;
                return (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-white/[0.08] border-[#2ECC71]/50 text-white' 
                        : 'bg-white/[0.02] border-white/5 text-[#8A9A92] hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-semibold text-white text-sm">
                        {z.name.split(':')[0]}
                      </span>
                      <StatusBadge status={z.relativeStatus} size="sm" />
                    </div>
                    <div className="text-xs font-mono text-[#8A9A92] flex items-center justify-between">
                      <span>{z.areaHa} ha</span>
                      <span>{z.elevationM}</span>
                    </div>
                    {z.hasHardwareNode && (
                      <div className="mt-2 text-[10px] font-mono text-[#2ECC71] flex items-center gap-1">
                        <Radio size={11} />
                        <span>In-situ Node #1 Active</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-5 border border-white/10 space-y-3 text-xs font-mono text-[#8A9A92]">
            <span className="text-[11px] font-bold uppercase text-white flex items-center gap-1.5">
              <Info size={13} className="text-[#38BDF8]" />
              <span>Spectral Band Configuration</span>
            </span>
            <p className="leading-relaxed">
              NIR Band 8 (842 nm) reflects healthy leaf cellular structure. SWIR Band 11 (1610 nm) absorbs moisture. The ratio directly indexes forest canopy desiccation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
