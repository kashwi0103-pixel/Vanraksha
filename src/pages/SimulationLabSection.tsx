/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForest } from '../lib/ForestContext';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ExplainAlertModal } from '../components/ExplainAlertModal';
import { SimulationScenario } from '../lib/simulator';
import { 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  CloudSun, 
  Droplet, 
  Thermometer, 
  Wind, 
  Sparkles, 
  Activity, 
  Cpu, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  Layers,
  Zap,
  FastForward
} from 'lucide-react';

export const SimulationLabSection: React.FC = () => {
  const {
    scenario,
    setScenario,
    dataset,
    dayIndex,
    setDayIndex,
    currentDay,
    evaluation,
    status,
    settings,
  } = useForest();

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);

  // Manual sandbox slider overrides (null means follow simulator timeline)
  const [overrideSoil, setOverrideSoil] = useState<number | null>(null);
  const [overrideRain, setOverrideRain] = useState<number | null>(null);
  const [overrideTemp, setOverrideTemp] = useState<number | null>(null);
  const [overrideHum, setOverrideHum] = useState<number | null>(null);
  const [overrideNdviAnomaly, setOverrideNdviAnomaly] = useState<number | null>(null);
  const [overrideCloud, setOverrideCloud] = useState<number | null>(null);

  // Active values (either override or from day timeline)
  const activeSoil = overrideSoil ?? (currentDay?.calibratedSoilPct ?? 35);
  const activeRain14d = overrideRain ?? (typeof evaluation.flags.weatherFlag.metricValue === 'number' ? evaluation.flags.weatherFlag.metricValue : 4.2);
  const activeTemp = overrideTemp ?? (currentDay?.tempC ?? 26);
  const activeHum = overrideHum ?? (currentDay?.humidityPct ?? 55);
  const activeCloud = overrideCloud ?? (currentDay?.cloudPct ?? 15);
  const activeNdvi = currentDay?.ndvi ?? 0.65;
  const activeNdviAnomaly = overrideNdviAnomaly ?? (currentDay?.ndvi && currentDay?.seasonalBaseline ? Number((currentDay.ndvi - currentDay.seasonalBaseline.ndvi).toFixed(3)) : 0);

  // Time-lapse auto-player loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(80, 500 / playbackSpeed);
    const timer = setInterval(() => {
      setDayIndex(dayIndex >= dataset.length - 1 ? 0 : dayIndex + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, dataset.length, setDayIndex, dayIndex]);

  // Satellite animation ticker
  const [satelliteX, setSatelliteX] = useState<number>(0);
  useEffect(() => {
    const satInterval = setInterval(() => {
      setSatelliteX((prev) => (prev >= 100 ? 0 : prev + 0.35));
    }, 50);
    return () => clearInterval(satInterval);
  }, []);

  // Compute canopy color based on NDVI anomaly & soil moisture
  const canopyFill = useMemo(() => {
    // Healthy: #2ECC71, Stressed: #F5B841, Desiccated: #C46835
    if (activeNdviAnomaly < -0.15 || activeSoil < 18) {
      return '#B86128'; // Desiccated orange-brown
    }
    if (activeNdviAnomaly < -0.06 || activeSoil < 25) {
      return '#D4A034'; // Yellow-amber stressed
    }
    if (activeNdviAnomaly > 0.05 && activeSoil > 35) {
      return '#10B981'; // Vibrant lush emerald
    }
    return '#2ECC71'; // Nominal forest green
  }, [activeNdviAnomaly, activeSoil]);

  // Compute soil cross-section color
  const soilFill = useMemo(() => {
    if (activeSoil < 20) return '#3D2817'; // Parched dry cracked earth
    if (activeSoil < 30) return '#2E2218'; // Moderate moisture
    return '#19241C'; // Moist rich forest humus
  }, [activeSoil]);

  const scenarios: SimulationScenario[] = [
    'Normal season',
    'Dry spell',
    'Heatwave',
    'Sensor dropout',
    'Cloudy satellite gap',
    'Monsoon recovery',
  ];

  const handleResetOverrides = () => {
    setOverrideSoil(null);
    setOverrideRain(null);
    setOverrideTemp(null);
    setOverrideHum(null);
    setOverrideNdviAnomaly(null);
    setOverrideCloud(null);
  };

  return (
    <section id="simulation-lab" className="py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
                Stress Sandbox & Biome Canvas
              </span>
              <SimulatedDataBadge variant="pill" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Simulation Lab
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8A9A92]">
            Deterministic Perturbation Modeling · Real-Time Rule Engine Trace
          </p>
        </div>

        {/* 3-Column Interactive Sandbox Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================= */}
          {/* COLUMN 1: CONTROL PANEL & SLIDERS (4 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 glass-card p-5 border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sliders size={16} className="text-[#2ECC71]" />
                  <span>Environmental Controls</span>
                </div>
                <button
                  onClick={handleResetOverrides}
                  className="text-xs font-mono text-[#8A9A92] hover:text-white flex items-center gap-1 transition-colors"
                  title="Reset sliders to timeline values"
                >
                  <RotateCcw size={12} /> Sync Timeline
                </button>
              </div>

              {/* Scenario Preset Selector */}
              <div className="mb-5">
                <label className="text-[11px] font-mono text-[#8A9A92] uppercase block mb-2">
                  Scenario Presets:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {scenarios.map((sc) => {
                    const isCur = scenario === sc && overrideSoil === null;
                    return (
                      <button
                        key={sc}
                        onClick={() => {
                          handleResetOverrides();
                          setScenario(sc);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-mono transition-all truncate border ${
                          isCur
                            ? 'bg-[#2ECC71]/20 text-[#B6F36A] border-[#2ECC71]/50 font-medium shadow-sm'
                            : 'bg-white/[0.02] text-[#8A9A92] border-white/5 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {sc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Perturbation Sliders */}
              <div className="space-y-4">
                {/* 1. Soil Moisture Slider */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Droplet size={13} className="text-[#2ECC71]" /> Soil Moisture
                    </span>
                    <span className="font-mono text-[#B6F36A] font-semibold">
                      {activeSoil}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="65"
                    step="1"
                    value={activeSoil}
                    onChange={(e) => setOverrideSoil(Number(e.target.value))}
                    className="w-full accent-[#2ECC71] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    aria-label="Soil Moisture percentage"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A9A92] mt-1">
                    <span>Critical (&lt;18%)</span>
                    <span>Wilting Point: 20%</span>
                    <span>Field Capacity (45%)</span>
                  </div>
                </div>

                {/* 2. 14-Day Rainfall */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <CloudSun size={13} className="text-[#3498DB]" /> 14-Day Rain Sum
                    </span>
                    <span className="font-mono text-[#3498DB] font-semibold">
                      {activeRain14d} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={activeRain14d}
                    onChange={(e) => setOverrideRain(Number(e.target.value))}
                    className="w-full accent-[#3498DB] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    aria-label="14-day rainfall sum in mm"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A9A92] mt-1">
                    <span>Drought: 0mm</span>
                    <span>Threshold: {settings.rainfallMaxCumulativeDryMm}mm</span>
                    <span>Monsoon: 80mm+</span>
                  </div>
                </div>

                {/* 3. Ambient Temperature */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Thermometer size={13} className="text-[#E5533D]" /> Air Temperature
                    </span>
                    <span className="font-mono text-[#E5533D] font-semibold">
                      {activeTemp}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="45"
                    step="0.5"
                    value={activeTemp}
                    onChange={(e) => setOverrideTemp(Number(e.target.value))}
                    className="w-full accent-[#E5533D] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    aria-label="Air Temperature in Celsius"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A9A92] mt-1">
                    <span>Baseline: 25°C</span>
                    <span>Heat Stress: 33°C+</span>
                    <span>Extreme: 42°C</span>
                  </div>
                </div>

                {/* 4. Relative Humidity */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Wind size={13} className="text-[#9B59B6]" /> Air Humidity
                    </span>
                    <span className="font-mono text-[#9B59B6] font-semibold">
                      {activeHum}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="95"
                    step="1"
                    value={activeHum}
                    onChange={(e) => setOverrideHum(Number(e.target.value))}
                    className="w-full accent-[#9B59B6] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    aria-label="Relative Humidity percentage"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A9A92] mt-1">
                    <span>Arid (&lt;25%)</span>
                    <span>VPD Zone: 40%</span>
                    <span>Humid: 85%</span>
                  </div>
                </div>

                {/* 5. NDVI Anomaly */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Sparkles size={13} className="text-[#F5B841]" /> NDVI Anomaly (vs baseline)
                    </span>
                    <span className={`font-mono font-semibold ${activeNdviAnomaly < -0.08 ? 'text-[#E5533D]' : 'text-[#B6F36A]'}`}>
                      {activeNdviAnomaly > 0 ? `+${activeNdviAnomaly}` : activeNdviAnomaly}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.30"
                    max="0.20"
                    step="0.01"
                    value={activeNdviAnomaly}
                    onChange={(e) => setOverrideNdviAnomaly(Number(e.target.value))}
                    className="w-full accent-[#F5B841] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    aria-label="NDVI Anomaly"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A9A92] mt-1">
                    <span>Drop: -0.25</span>
                    <span>Flag: -{settings.satelliteDropDeltaThreshold}</span>
                    <span>Vigorous: +0.15</span>
                  </div>
                </div>

                {/* 6. Cloud Cover % */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Layers size={13} className="text-[#8A9A92]" /> Satellite Cloud Mask
                    </span>
                    <span className="font-mono text-[#8A9A92] font-semibold">
                      {activeCloud}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={activeCloud}
                    onChange={(e) => setOverrideCloud(Number(e.target.value))}
                    className="w-full accent-[#8A9A92] cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    aria-label="Cloud Cover Percentage"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A9A92] mt-1">
                    <span>Clear (0%)</span>
                    <span>Mask Threshold: 40%</span>
                    <span>Overcast: 100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time-lapse Playback Strip */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#8A9A92]">Time-lapse (Day {dayIndex} / 90)</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        playbackSpeed === spd
                          ? 'bg-[#2ECC71] text-[#06120C] font-bold'
                          : 'text-[#8A9A92] hover:text-white bg-white/5'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrubber */}
              <input
                type="range"
                min="0"
                max={dataset.length - 1}
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className="w-full accent-[#2ECC71] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                aria-label="Day timeline scrubber"
              />

              {/* Play / Pause Toggle Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  isPlaying
                    ? 'bg-[#F5B841]/20 text-[#F5B841] border border-[#F5B841]/40'
                    : 'bg-[#2ECC71]/15 text-[#B6F36A] hover:bg-[#2ECC71]/25 border border-[#2ECC71]/30 shadow-[0_0_12px_rgba(46,204,113,0.15)]'
                }`}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause Time-Lapse' : 'Play 30 Days Time-Lapse'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: ANIMATED BIOME CROSS-SECTION (5 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 glass-card p-4 sm:p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-2 z-10">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92]">
                <Activity size={14} className="text-[#2ECC71]" />
                <span>Micro-Site Visual Biome Cross-Section</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#B6F36A] border border-white/10">
                Pilot Plot 4A
              </span>
            </div>

            {/* SVG Biome Canvas */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-[#061810] via-[#092217] to-[#121B15] border border-white/10 shadow-inner">
              <svg 
                viewBox="0 0 400 300" 
                className="w-full h-full select-none"
                aria-label="Animated forest and soil cross-section with ESP32 probe"
              >
                <defs>
                  {/* Sun ray gradient */}
                  <linearGradient id="sunbeam" x1="0%" y1="0%" x2="40%" y2="100%">
                    <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FFF7D6" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Satellite beam */}
                  <linearGradient id="satbeam" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#B6F36A" stopOpacity="0.0" />
                  </linearGradient>

                  {/* LoRa RF pulse wave */}
                  <radialGradient id="loraPulse" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#B6F36A" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2ECC71" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* 1. SKY & ATMOSPHERE */}
                {/* Sun rays when clouds < 60% */}
                {activeCloud < 60 && (
                  <polygon
                    points="320,-10 390,-10 260,160 170,160"
                    fill="url(#sunbeam)"
                    opacity={(100 - activeCloud) / 100}
                  />
                )}

                {/* Heat shimmer wave lines if temp > 30°C */}
                {activeTemp > 30 && (
                  <g opacity={Math.min(0.8, (activeTemp - 30) / 15)}>
                    <path
                      d="M 50,110 Q 70,105 90,110 T 130,110 T 170,110 T 210,110"
                      fill="none"
                      stroke="#F5B841"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                    <path
                      d="M 180,95 Q 200,90 220,95 T 260,95 T 300,95 T 340,95"
                      fill="none"
                      stroke="#E5533D"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                  </g>
                )}

                {/* Rainfall drops when rain > 0 */}
                {activeRain14d > 5 && (
                  <g opacity={Math.min(0.9, activeRain14d / 40)}>
                    {[30, 75, 120, 165, 210, 255, 300, 345].map((rx, idx) => (
                      <line
                        key={idx}
                        x1={rx}
                        y1={20 + (idx % 3) * 15}
                        x2={rx - 8}
                        y2={55 + (idx % 3) * 15}
                        stroke="#3498DB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="5 5"
                        className="animate-pulse"
                      />
                    ))}
                  </g>
                )}

                {/* Drifting Clouds */}
                <g opacity={Math.max(0.15, activeCloud / 100)}>
                  <ellipse cx="90" cy="35" rx="50" ry="18" fill="#FFFFFF" fillOpacity="0.15" />
                  <ellipse cx="120" cy="30" rx="35" ry="16" fill="#FFFFFF" fillOpacity="0.2" />
                  <ellipse cx="280" cy="40" rx="60" ry="20" fill="#FFFFFF" fillOpacity="0.18" />
                </g>

                {/* SATELLITE (Sentinel-2 Orbit) */}
                <g transform={`translate(${satelliteX * 4 - 30}, 16)`}>
                  {/* Sweeping Scanner Light Beam */}
                  <polygon points="15,10 5,10 -30,140 60,140" fill="url(#satbeam)" />
                  {/* Satellite body */}
                  <rect x="5" y="6" width="14" height="8" rx="2" fill="#E5EFE9" />
                  {/* Solar panels */}
                  <rect x="-10" y="8" width="12" height="4" fill="#3498DB" />
                  <rect x="22" y="8" width="12" height="4" fill="#3498DB" />
                  <circle cx="12" cy="10" r="1.5" fill="#2ECC71" className="animate-ping" />
                </g>

                {/* 2. CANOPY LAYER (Pine & Broadleaf Trees) */}
                {/* Back forest row (silhouette) */}
                <path
                  d="M 0,160 L 25,125 L 45,160 L 70,115 L 95,160 L 130,120 L 165,160 L 200,110 L 235,160 L 280,115 L 325,160 L 360,125 L 400,160 L 400,170 L 0,170 Z"
                  fill="#0B261A"
                  opacity="0.7"
                />

                {/* Foreground Trees with Dynamic Canopy Foliage Color */}
                {/* Tree 1 (Left Pine) */}
                <rect x="55" y="145" width="8" height="25" fill="#2E1C0C" />
                <polygon points="59,75 35,115 45,115 25,145 93,145 73,115 83,115" fill={canopyFill} />

                {/* Tree 2 (Broadleaf Central) */}
                <rect x="185" y="140" width="12" height="30" fill="#3D2614" />
                <circle cx="191" cy="115" r="32" fill={canopyFill} />
                <circle cx="170" cy="120" r="22" fill={canopyFill} />
                <circle cx="212" cy="120" r="22" fill={canopyFill} />
                {/* Branch veins */}
                <path d="M 191,140 L 180,125 M 191,135 L 202,122" stroke="#2E1C0C" strokeWidth="2" />

                {/* Tree 3 (Right Pine) */}
                <rect x="315" y="145" width="8" height="25" fill="#2E1C0C" />
                <polygon points="319,85 295,120 305,120 288,145 350,145 333,120 343,120" fill={canopyFill} />

                {/* Forest Floor Ground Line */}
                <rect x="0" y="165" width="400" height="6" fill="#1C3827" />

                {/* 3. SOIL STRATA CROSS-SECTION */}
                <rect x="0" y="171" width="400" height="129" fill={soilFill} />

                {/* Soil strata gradient bands */}
                <line x1="0" y1="210" x2="400" y2="210" stroke="#000000" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="6 4" />
                <line x1="0" y1="250" x2="400" y2="250" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="8 6" />

                {/* Tree Root System penetrating down to 45cm */}
                <g stroke="#5C3E21" strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
                  <path d="M 191,170 Q 185,190 175,215 T 160,245" />
                  <path d="M 191,170 Q 195,195 205,225 T 220,250" />
                  <path d="M 180,195 Q 165,210 150,225" />
                  <path d="M 200,205 Q 215,220 230,235" />
                  <path d="M 59,170 Q 55,190 48,220" />
                  <path d="M 319,170 Q 325,195 335,225" />
                </g>

                {/* Soil Dryness Fracture Cracks (Appear when moisture < 24%) */}
                {activeSoil < 24 && (
                  <g stroke="#1F130B" strokeWidth="1.5" fill="none" opacity={(24 - activeSoil) / 20}>
                    <path d="M 120,171 L 124,185 L 118,200 L 126,218" />
                    <path d="M 260,171 L 255,188 L 262,205 L 258,225" />
                    <path d="M 370,171 L 366,190 L 372,210" />
                    <path d="M 30,171 L 34,188 L 28,206" />
                  </g>
                )}

                {/* 4. IN-SITU ESP32 HARDWARE NODE */}
                {/* Surface enclosure housing */}
                <g transform="translate(105, 148)">
                  {/* Node stake & waterproof box */}
                  <rect x="0" y="0" width="16" height="18" rx="2" fill="#2C3E50" stroke="#B6F36A" strokeWidth="1" />
                  {/* Status LED */}
                  <circle 
                    cx="8" 
                    cy="6" 
                    r="2" 
                    fill={currentDay?.sensorStatus === 'ERROR' ? '#E5533D' : currentDay?.sensorStatus === 'STALE' ? '#F5B841' : '#2ECC71'} 
                    className="animate-ping" 
                  />
                  {/* Whip Antenna */}
                  <line x1="13" y1="0" x2="13" y2="-16" stroke="#E5EFE9" strokeWidth="1.5" />
                  {/* Radiating RF LoRa packets from antenna */}
                  <circle cx="13" cy="-16" r="10" fill="none" stroke="#2ECC71" strokeWidth="1" opacity="0.6" className="animate-ping" />
                  <circle cx="13" cy="-16" r="18" fill="none" stroke="#B6F36A" strokeWidth="0.8" opacity="0.4" />

                  {/* Wire harness into soil */}
                  <line x1="8" y1="18" x2="8" y2="23" stroke="#F5B841" strokeWidth="1.5" />
                </g>

                {/* Sub-surface Capacitive Probe (Root Zone 45cm) */}
                <g transform="translate(111, 171)">
                  {/* Cable to probe */}
                  <path d="M 2,0 L 2,45" stroke="#F5B841" strokeWidth="1.5" strokeDasharray="3 2" />
                  {/* Capacitive PCB probe body */}
                  <polygon points="0,45 4,45 3,75 2,82 1,75" fill="#1A3A2A" stroke="#2ECC71" strokeWidth="1" />
                  {/* Sensing electric field ripples */}
                  <ellipse cx="2" cy="65" rx="14" ry="7" fill="none" stroke="#2ECC71" strokeWidth="0.75" strokeDasharray="2 2" className="animate-pulse" />
                  {/* Label marker */}
                  <text x="14" y="68" fill="#B6F36A" fontSize="7" fontFamily="JetBrains Mono">
                    Capacitive 45cm
                  </text>
                </g>

                {/* Depth measurement markers */}
                <g fill="#8A9A92" fontSize="6" fontFamily="JetBrains Mono" textAnchor="end">
                  <text x="395" y="178">0cm (Surface)</text>
                  <text x="395" y="215">-15cm (A-Horizon)</text>
                  <text x="395" y="250">-45cm (Root Zone)</text>
                </g>
              </svg>
            </div>

            {/* Bottom Telemetry Mini-Strip */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.08] text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[#8A9A92] block">Node Link</span>
                <span className="text-[#B6F36A] font-semibold flex items-center gap-1">
                  <Radio size={11} /> LoRa 868 MHz
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[#8A9A92] block">Probe Depth</span>
                <span className="text-white font-semibold">45 cm (Capacitive)</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[#8A9A92] block">Canopy Status</span>
                <span className="text-[#B6F36A] font-semibold">
                  {activeSoil < 22 ? 'Water Deficit' : 'Turgid'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3: LIVE STATUS & RULE ENGINE TRACE (3 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 glass-card p-5 border border-white/10 flex flex-col justify-between space-y-5">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <Cpu size={14} className="text-[#2ECC71]" />
                  <span>Rule Engine Trace</span>
                </div>
                <StatusBadge status={status} size="sm" pulsing={false} />
              </div>

              {/* Forest Health Index Gauge Card */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 mb-4 text-center">
                <div className="text-[11px] font-mono text-[#8A9A92] uppercase mb-1">
                  Forest Health Index (FHI)
                </div>
                <div className="text-3xl font-heading font-bold text-white mb-1">
                  {evaluation.forestHealthIndex.score}
                  <span className="text-xs font-mono text-[#8A9A92] font-normal">/100</span>
                </div>
                <div className="text-[10px] font-mono text-[#8A9A92] italic">
                  * Preliminary, not validated
                </div>

                {/* Linear Meter Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      evaluation.forestHealthIndex.score > 70
                        ? 'bg-[#2ECC71]'
                        : evaluation.forestHealthIndex.score > 40
                        ? 'bg-[#F5B841]'
                        : 'bg-[#E5533D]'
                    }`}
                    style={{ width: `${evaluation.forestHealthIndex.score}%` }}
                  />
                </div>
              </div>

              {/* Real-Time Rule Execution Trace Log */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-mono uppercase text-[#8A9A92] flex items-center justify-between">
                  <span>Logic Verification:</span>
                  <span className="text-[#2ECC71]">
                    {[evaluation.flags.localDryFlag, evaluation.flags.weatherFlag, evaluation.flags.satelliteFlag].filter(f => f.triggered).length} Triggered
                  </span>
                </div>

                {/* 1. Sensor Validity Trace */}
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#8A9A92] font-mono">1. Electrical Envelope</span>
                    {evaluation.sensorValidity.isValid ? (
                      <span className="text-[10px] font-mono text-[#2ECC71] flex items-center gap-1">
                        <CheckCircle2 size={11} /> OK ({currentDay?.soilRaw ?? 2200} ADC)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#E5533D] flex items-center gap-1">
                        <AlertOctagon size={11} /> INCOMPLETE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#8A9A92]/80 font-sans">
                    {evaluation.sensorValidity.reason}
                  </div>
                </div>

                {/* 2. Local Dryness Flag Trace */}
                <div className={`p-2.5 rounded-lg border text-xs transition-all ${
                  evaluation.flags.localDryFlag.triggered
                    ? 'bg-[#E5533D]/10 border-[#E5533D]/30'
                    : 'bg-white/[0.02] border-white/5'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[#8A9A92]">2. In-Situ Soil Flag</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      evaluation.flags.localDryFlag.triggered ? 'bg-[#E5533D]/20 text-[#E5533D]' : 'bg-white/5 text-[#8A9A92]'
                    }`}>
                      {evaluation.flags.localDryFlag.triggered ? 'TRIGGERED' : 'CLEAR'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8A9A92] font-sans">
                    {evaluation.flags.localDryFlag.reason}
                  </div>
                </div>

                {/* 3. Weather Deficit Flag Trace */}
                <div className={`p-2.5 rounded-lg border text-xs transition-all ${
                  evaluation.flags.weatherFlag.triggered
                    ? 'bg-[#E5533D]/10 border-[#E5533D]/30'
                    : 'bg-white/[0.02] border-white/5'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[#8A9A92]">3. Weather Deficit Flag</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      evaluation.flags.weatherFlag.triggered ? 'bg-[#E5533D]/20 text-[#E5533D]' : 'bg-white/5 text-[#8A9A92]'
                    }`}>
                      {evaluation.flags.weatherFlag.triggered ? 'TRIGGERED' : 'CLEAR'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8A9A92] font-sans">
                    {evaluation.flags.weatherFlag.reason}
                  </div>
                </div>

                {/* 4. Satellite Decline Flag Trace */}
                <div className={`p-2.5 rounded-lg border text-xs transition-all ${
                  evaluation.flags.satelliteFlag.triggered
                    ? 'bg-[#E5533D]/10 border-[#E5533D]/30'
                    : 'bg-white/[0.02] border-white/5'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[#8A9A92]">4. Satellite NDRE/NDVI Flag</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      evaluation.flags.satelliteFlag.triggered ? 'bg-[#E5533D]/20 text-[#E5533D]' : 'bg-white/5 text-[#8A9A92]'
                    }`}>
                      {evaluation.flags.satelliteFlag.triggered ? 'TRIGGERED' : 'CLEAR'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8A9A92] font-sans">
                    {evaluation.flags.satelliteFlag.reason}
                  </div>
                </div>
              </div>
            </div>

            {/* Explain This Alert Button (Gemini API Integration) */}
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsExplainModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2ECC71]/15 hover:bg-[#2ECC71]/25 border border-[#2ECC71]/40 text-[#B6F36A] font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(46,204,113,0.15)] group"
              >
                <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                <span>Explain this alert (Gemini AI)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Alert Explanation Modal */}
      <ExplainAlertModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        status={status}
        triggeredFlags={[evaluation.flags.localDryFlag, evaluation.flags.weatherFlag, evaluation.flags.satelliteFlag].filter(f => f.triggered)}
        indicators={{
          soilPct: activeSoil,
          soilRaw: currentDay?.soilRaw ?? 2200,
          tempC: activeTemp,
          humidityPct: activeHum,
          rain14dMm: activeRain14d,
          ndviAnomaly: activeNdviAnomaly,
        }}
      />
    </section>
  );
};
