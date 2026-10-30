/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, 
  Split, 
  Columns, 
  Calendar, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Maximize2, 
  X, 
  Sliders, 
  CheckCircle2, 
  FileText,
  Compass,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';

type ComparisonTab = 'ndvi' | 'ndmi';
type ViewMode = 'side-by-side' | 'slider' | 'single-year';
type SelectedYear = '2023' | '2025';
type AdditionalOption = 'none' | 'ndvi-overview' | 'ndmi-overview' | 'change-candidates';

export const NainitalChangeAnalysisTab: React.FC = () => {
  // 1. Two tabs: NDVI Comparison and NDMI Comparison
  const [activeTab, setActiveTab] = useState<ComparisonTab>('ndvi');

  // View modes: side-by-side (default), interactive comparison slider, single year focus
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [selectedYear, setSelectedYear] = useState<SelectedYear>('2025');

  // Interactive slider position (0 to 100%)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // 5. Separate layer for "Potential Change Candidates"
  const [showChangeCandidatesLayer, setShowChangeCandidatesLayer] = useState<boolean>(false);
  const [candidateOpacity, setCandidateOpacity] = useState<number>(85);

  // 6. Additional visualization options (Overview images)
  const [additionalVisualization, setAdditionalVisualization] = useState<AdditionalOption>('none');

  // Lightbox modal for full-detail inspection
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  // Image source definitions
  const images = {
    ndvi: {
      year2023: '/NDVI_2023.png',
      year2025: '/NDVI_2025.png',
      overview: '/Nainital_NDVI.png',
      label2023: 'October–November 2023',
      label2025: 'October–November 2025',
      name: 'NDVI (Normalized Difference Vegetation Index)',
      explanation: 'NDVI represents vegetation greenness.',
      subExplanation: 'Calculated as (NIR - Red) / (NIR + Red) from Sentinel-2 MSI surface reflectance. Highlights photosynthetic vigor and canopy greenness across the Nainital catchment.',
      colorScale: 'Red (Low/Barren) → Yellow (Moderate) → Green (High Canopy Greenness)',
    },
    ndmi: {
      year2023: '/NDMI_2023.png',
      year2025: '/NDMI_2025.png',
      overview: '/Nainital_NDMI.png',
      label2023: 'October–November 2023',
      label2025: 'October–November 2025',
      name: 'NDMI (Normalized Difference Moisture Index)',
      explanation: 'NDMI represents a moisture-related vegetation signal.',
      subExplanation: 'Calculated as (NIR - SWIR) / (NIR + SWIR) from Sentinel-2 MSI surface reflectance. Reflects liquid water content within cellular leaf structures and canopy water stress.',
      colorScale: 'Brown/Ochre (Low Moisture) → White/Tan (Moderate) → Deep Teal/Cyan (High Moisture)',
    },
    candidates: {
      src: '/ForestGuardAI_Change_Candidates.png',
      title: 'ForestGuardAI — Potential Change Candidates',
      label: 'Potential Change Candidates',
      explanation: 'Change candidates are locations flagged for further investigation, not confirmed deforestation.',
      subExplanation: 'Pixel screening highlights spatial areas displaying divergence between baseline and monitoring epochs. Requires ground survey and field inspection before any operational attribution.',
    },
  };

  const currentConfig = activeTab === 'ndvi' ? images.ndvi : images.ndmi;

  // Handle slider mouse / touch drag
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  // Keyboard navigation for slider
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SECTION TITLE & HEADER */}
      <div className="glass-card p-5 sm:p-6 border border-white/10 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#2ECC71]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#2ECC71]/15 text-[#B6F36A] border border-[#2ECC71]/30">
                Nainital Forest Division
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.04] text-[#8A9A92] border border-white/10">
                Static Satellite Raster Analysis
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              Nainital Satellite Change Analysis
            </h3>
            <p className="text-xs sm:text-sm text-[#8A9A92] mt-1 max-w-3xl leading-relaxed">
              Multi-temporal satellite imagery comparison of the Nainital forest division between <strong>October–November 2023</strong> and <strong>October–November 2025</strong>. Review static spectral indices and flagged change screening candidates.
            </p>
          </div>

          {/* Quick Year Indicator Pills */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-[#8A9A92] flex items-center gap-2">
              <Calendar size={13} className="text-[#38BDF8]" />
              <span>Baseline: <strong className="text-white">2023</strong></span>
            </div>
            <span className="text-white/20">vs</span>
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-[#8A9A92] flex items-center gap-2">
              <Calendar size={13} className="text-[#2ECC71]" />
              <span>Monitoring: <strong className="text-white">2025</strong></span>
            </div>
          </div>
        </div>

        {/* 11. REQUIRED MANDATORY DISCLAIMER BOX */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#F5B841]/[0.08] border border-[#F5B841]/30 flex items-start gap-3 text-xs text-[#F5B841] relative z-10">
          <ShieldAlert size={17} className="shrink-0 mt-0.5 text-[#F5B841]" />
          <div className="leading-relaxed">
            <span className="font-semibold block text-white mb-0.5 font-mono uppercase text-[11px] tracking-wide">
              Official Analytical Disclaimer
            </span>
            <p className="text-white/90">
              "Satellite-derived changes are preliminary screening indicators. Seasonal effects, cloud contamination and other factors may influence the observed signals. Independent verification is required."
            </p>
          </div>
        </div>
      </div>

      {/* 7. MANDATORY SHORT EXPLANATIONS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Explanation 1: NDVI */}
        <div className="glass-card p-4 border border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
            <h4 className="text-sm font-heading font-bold text-white">NDVI Index</h4>
          </div>
          <p className="text-xs text-[#B6F36A] font-semibold mb-1">
            {images.ndvi.explanation}
          </p>
          <p className="text-[11px] text-[#8A9A92] leading-relaxed">
            {images.ndvi.subExplanation}
          </p>
        </div>

        {/* Explanation 2: NDMI */}
        <div className="glass-card p-4 border border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <h4 className="text-sm font-heading font-bold text-white">NDMI Index</h4>
          </div>
          <p className="text-xs text-[#38BDF8] font-semibold mb-1">
            {images.ndmi.explanation}
          </p>
          <p className="text-[11px] text-[#8A9A92] leading-relaxed">
            {images.ndmi.subExplanation}
          </p>
        </div>

        {/* Explanation 3: Change candidates */}
        <div className="glass-card p-4 border border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5533D]" />
            <h4 className="text-sm font-heading font-bold text-white">Change Candidates</h4>
          </div>
          <p className="text-xs text-[#E5533D] font-semibold mb-1">
            {images.candidates.explanation}
          </p>
          <p className="text-[11px] text-[#8A9A92] leading-relaxed">
            {images.candidates.subExplanation}
          </p>
        </div>
      </div>

      {/* 2. HISTORICAL COMPARISON TABS & TOOLBAR */}
      <div className="glass-card p-4 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* 2. Historical comparison interface with two tabs */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ndvi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'ndvi'
                ? 'bg-[#2ECC71]/25 text-[#B6F36A] border border-[#2ECC71]/40 shadow-sm'
                : 'text-[#8A9A92] hover:text-white'
            }`}
            aria-selected={activeTab === 'ndvi'}
          >
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
            <span>NDVI Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ndmi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'ndmi'
                ? 'bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                : 'text-[#8A9A92] hover:text-white'
            }`}
            aria-selected={activeTab === 'ndmi'}
          >
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span>NDMI Comparison</span>
          </button>
        </div>

        {/* View Mode Controls: Side-by-side, Interactive Slider, Year Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-white/15 text-white font-semibold border border-white/20'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
              title="Side-by-side 2023 vs 2025 view"
            >
              <Columns size={13} />
              <span className="hidden sm:inline">Side-by-Side</span>
              <span className="sm:hidden">Split</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'slider'
                  ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-semibold border border-[#2ECC71]/40'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
              title="Comparison swipe slider"
            >
              <Split size={13} />
              <span>Slider</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('single-year')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'single-year'
                  ? 'bg-white/15 text-white font-semibold border border-white/20'
                  : 'text-[#8A9A92] hover:text-white'
              }`}
              title="Year selector view"
            >
              <Calendar size={13} />
              <span>Year View</span>
            </button>
          </div>

          {/* 4. Year Selector (Visible in single-year mode or as quick toggle) */}
          {viewMode === 'single-year' && (
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedYear('2023')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedYear === '2023'
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-semibold border border-[#38BDF8]/40'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Oct–Nov 2023
              </button>
              <button
                type="button"
                onClick={() => setSelectedYear('2025')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedYear === '2025'
                    ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-semibold border border-[#2ECC71]/40'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Oct–Nov 2025
              </button>
            </div>
          )}

          {/* 5. Separate layer toggle for Potential Change Candidates */}
          <button
            type="button"
            onClick={() => setShowChangeCandidatesLayer(!showChangeCandidatesLayer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              showChangeCandidatesLayer
                ? 'bg-[#E5533D]/20 border-[#E5533D]/40 text-[#E5533D] font-semibold shadow-sm'
                : 'bg-white/[0.03] border-white/10 text-[#8A9A92] hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Toggle Potential Change Candidates Overlay"
          >
            {showChangeCandidatesLayer ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>Change Candidates Layer</span>
          </button>
        </div>
      </div>

      {/* CHANGE CANDIDATES LAYER CONTROLLER (When layer active) */}
      {showChangeCandidatesLayer && (
        <div className="p-3.5 rounded-xl bg-[#E5533D]/[0.06] border border-[#E5533D]/30 flex flex-wrap items-center justify-between gap-4 text-xs font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5533D] animate-ping" />
            <span className="font-bold text-white">Potential Change Candidates Layer Active:</span>
            <span className="text-[#8A9A92] hidden sm:inline">ForestGuardAI_Change_Candidates.png screening overlay</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[#8A9A92] flex items-center gap-1.5">
              <span>Layer Opacity:</span>
              <span className="font-bold text-white tabular-nums">{candidateOpacity}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={candidateOpacity}
              onChange={(e) => setCandidateOpacity(Number(e.target.value))}
              className="w-28 sm:w-36 accent-[#E5533D] cursor-pointer"
              aria-label="Change candidate layer opacity"
            />
            <button
              type="button"
              onClick={() => {
                setLightboxImage({
                  src: images.candidates.src,
                  title: images.candidates.title,
                  subtitle: 'Full Resolution Potential Change Candidates Layer',
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono transition-colors flex items-center gap-1"
            >
              <Maximize2 size={11} />
              <span>Inspect Mask</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 & 4. PRIMARY HISTORICAL COMPARISON STAGE */}
      <div className="glass-card p-4 sm:p-6 border border-white/10 relative">
        {/* STAGE HEADER INFO */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{currentConfig.name}</span>
            <span className="text-white/20">•</span>
            <span className="text-[#8A9A92]">{currentConfig.colorScale}</span>
          </div>

          <div className="flex items-center gap-2 text-[#8A9A92]">
            <span>Static Satellite Asset (No fabricated GIS coordinates)</span>
          </div>
        </div>

        {/* 3. MODE A: SIDE-BY-SIDE DISPLAY (2023 on Left, 2025 on Right) */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: October–November 2023 Image */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    October–November 2023
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8A9A92] px-2 py-0.5 rounded bg-white/[0.04]">
                  Baseline Reference Epoch
                </span>
              </div>

              {/* Image Frame with Aspect Ratio */}
              <div className="relative rounded-xl overflow-hidden bg-[#040D07] border border-white/10 aspect-[4/3] flex items-center justify-center group shadow-lg">
                <img
                  src={currentConfig.year2023}
                  alt={`${currentConfig.name} - October–November 2023`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                />

                {/* Top Corner Pill Label */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-[#38BDF8]">
                  2023 · Baseline Pass
                </div>

                {/* Inspect Button */}
                <button
                  type="button"
                  onClick={() => {
                    setLightboxImage({
                      src: currentConfig.year2023,
                      title: `${currentConfig.name} — October–November 2023`,
                      subtitle: 'Baseline Static Satellite Composite (Nainital)',
                    });
                  }}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/80 hover:bg-black text-[#8A9A92] hover:text-white border border-white/15 transition-all opacity-80 group-hover:opacity-100"
                  title="Expand to Fullscreen Preview"
                  aria-label="Inspect 2023 Image"
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              <div className="px-1 text-[11px] font-mono text-[#8A9A92] flex items-center justify-between">
                <span>Pass: Oct–Nov 2023 Composite</span>
                <span>Copernicus Sentinel-2 MSI</span>
              </div>
            </div>

            {/* RIGHT: October–November 2025 Image */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    October–November 2025
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8A9A92] px-2 py-0.5 rounded bg-white/[0.04]">
                  Monitoring Epoch
                </span>
              </div>

              {/* Image Frame with Aspect Ratio */}
              <div className="relative rounded-xl overflow-hidden bg-[#040D07] border border-white/10 aspect-[4/3] flex items-center justify-center group shadow-lg">
                <img
                  src={currentConfig.year2025}
                  alt={`${currentConfig.name} - October–November 2025`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                />

                {/* 5. Potential Change Candidates Overlay on 2025 image */}
                {showChangeCandidatesLayer && (
                  <div 
                    className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                    style={{ opacity: candidateOpacity / 100 }}
                  >
                    <img
                      src={images.candidates.src}
                      alt="Potential Change Candidates Overlay"
                      className="w-full h-full object-contain mix-blend-screen"
                    />
                  </div>
                )}

                {/* Top Corner Pill Label */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-[#B6F36A] flex items-center gap-1.5">
                  <span>2025 · Monitoring Pass</span>
                  {showChangeCandidatesLayer && (
                    <span className="px-1.5 py-0.2 rounded bg-[#E5533D]/30 text-[#E5533D] text-[9px] border border-[#E5533D]/50">
                      + Candidates Layer
                    </span>
                  )}
                </div>

                {/* Inspect Button */}
                <button
                  type="button"
                  onClick={() => {
                    setLightboxImage({
                      src: currentConfig.year2025,
                      title: `${currentConfig.name} — October–November 2025`,
                      subtitle: 'Monitoring Static Satellite Composite (Nainital)',
                    });
                  }}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/80 hover:bg-black text-[#8A9A92] hover:text-white border border-white/15 transition-all opacity-80 group-hover:opacity-100"
                  title="Expand to Fullscreen Preview"
                  aria-label="Inspect 2025 Image"
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              <div className="px-1 text-[11px] font-mono text-[#8A9A92] flex items-center justify-between">
                <span>Pass: Oct–Nov 2025 Composite</span>
                <span>Copernicus Sentinel-2 MSI</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. MODE B: INTERACTIVE COMPARISON SLIDER */}
        {viewMode === 'slider' && (
          <div className="space-y-4">
            {/* Scrubber instructions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs font-mono text-[#8A9A92]">
              <span className="flex items-center gap-2">
                <ArrowRightLeft size={13} className="text-[#2ECC71]" />
                <span>Drag the vertical divider handle or use Left/Right arrow keys to wipe between 2023 and 2025:</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[#38BDF8] font-bold">Left: 2023 ({Math.round(sliderPosition)}%)</span>
                <span className="text-white/20">|</span>
                <span className="text-[#B6F36A] font-bold">Right: 2025 ({Math.round(100 - sliderPosition)}%)</span>
              </div>
            </div>

            {/* Slider Container */}
            <div
              ref={sliderContainerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              className="relative rounded-2xl overflow-hidden bg-[#040D07] border border-white/15 aspect-[16/10] sm:aspect-[16/9] w-full max-h-[640px] cursor-ew-resize select-none focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
              aria-label="Historical Satellite Comparison Slider"
            >
              {/* Background Layer: 2025 Image (Right Side) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={currentConfig.year2025}
                  alt={`${currentConfig.name} - October–November 2025`}
                  className="w-full h-full object-contain pointer-events-none"
                  loading="lazy"
                />

                {/* Potential Change Candidates Layer on 2025 image if active */}
                {showChangeCandidatesLayer && (
                  <div 
                    className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                    style={{ opacity: candidateOpacity / 100 }}
                  >
                    <img
                      src={images.candidates.src}
                      alt="Potential Change Candidates Overlay"
                      className="w-full h-full object-contain mix-blend-screen"
                    />
                  </div>
                )}

                {/* Right Badge: 2025 */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-[#2ECC71]/40 text-xs font-mono font-bold text-[#B6F36A] shadow-lg pointer-events-none">
                  October–November 2025
                </div>
              </div>

              {/* Foreground Layer (Clipped): 2023 Image (Left Side) */}
              <div 
                className="absolute inset-0 overflow-hidden flex items-center justify-center"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={currentConfig.year2023}
                  alt={`${currentConfig.name} - October–November 2023`}
                  className="w-full h-full object-contain pointer-events-none"
                  loading="lazy"
                />

                {/* Left Badge: 2023 */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-[#38BDF8]/40 text-xs font-mono font-bold text-[#38BDF8] shadow-lg pointer-events-none">
                  October–November 2023
                </div>
              </div>

              {/* Vertical Slider Bar Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Center Draggable Circular Handle */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black shadow-xl flex items-center justify-center border-2 border-[#06120C] font-bold text-xs pointer-events-none">
                  <ArrowRightLeft size={14} className="text-[#06120C]" />
                </div>
              </div>

              {/* Bottom Expand Button */}
              <button
                type="button"
                onClick={() => {
                  setLightboxImage({
                    src: sliderPosition < 50 ? currentConfig.year2025 : currentConfig.year2023,
                    title: `${currentConfig.name} — Full Overview`,
                    subtitle: `Nainital Division (${sliderPosition < 50 ? '2025' : '2023'})`,
                  });
                }}
                className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/80 hover:bg-black text-[#8A9A92] hover:text-white border border-white/15 transition-all z-20"
                title="Expand Current View"
                aria-label="Inspect Full Image"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            {/* Slider Range bar fallback for mobile/touch */}
            <div className="flex items-center gap-3 px-2">
              <span className="text-[11px] font-mono text-[#38BDF8]">2023</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="w-full accent-[#2ECC71] cursor-pointer"
                aria-label="Comparison slider position"
              />
              <span className="text-[11px] font-mono text-[#B6F36A]">2025</span>
            </div>
          </div>
        )}

        {/* 4. MODE C: SINGLE YEAR FOCUS / YEAR SELECTOR */}
        {viewMode === 'single-year' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedYear === '2025' ? 'bg-[#2ECC71]' : 'bg-[#38BDF8]'}`} />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  October–November {selectedYear} · {selectedYear === '2025' ? 'Monitoring Epoch' : 'Baseline Reference'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedYear(selectedYear === '2023' ? '2025' : '2023')}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft size={12} />
                  <span>Switch to {selectedYear === '2023' ? '2025' : '2023'}</span>
                </button>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-[#040D07] border border-white/10 aspect-[16/10] sm:aspect-[16/9] max-h-[640px] flex items-center justify-center group shadow-lg">
              <img
                src={selectedYear === '2025' ? currentConfig.year2025 : currentConfig.year2023}
                alt={`${currentConfig.name} - ${selectedYear}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />

              {/* Potential Change Candidates Layer on 2025 */}
              {selectedYear === '2025' && showChangeCandidatesLayer && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                  style={{ opacity: candidateOpacity / 100 }}
                >
                  <img
                    src={images.candidates.src}
                    alt="Potential Change Candidates Overlay"
                    className="w-full h-full object-contain mix-blend-screen"
                  />
                </div>
              )}

              {/* Corner Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white">
                October–November {selectedYear} ({selectedYear === '2025' ? 'Monitoring Pass' : 'Baseline Pass'})
              </div>

              {/* Expand Button */}
              <button
                type="button"
                onClick={() => {
                  setLightboxImage({
                    src: selectedYear === '2025' ? currentConfig.year2025 : currentConfig.year2023,
                    title: `${currentConfig.name} — October–November ${selectedYear}`,
                    subtitle: `Nainital Forest Division (${selectedYear})`,
                  });
                }}
                className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/80 hover:bg-black text-[#8A9A92] hover:text-white border border-white/15 transition-all"
                title="Expand to Fullscreen Preview"
                aria-label="Inspect Image"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. ADDITIONAL VISUALIZATION OPTIONS (OVERVIEW IMAGES & CHANGE CANDIDATES) */}
      <div className="glass-card p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h4 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-[#2ECC71]" />
              <span>Additional Visualization Options</span>
            </h4>
            <p className="text-xs text-[#8A9A92] mt-0.5">
              Access full overview satellite products and the standalone potential change candidates layer.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-[#8A9A92]">Select View:</span>
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAdditionalVisualization(additionalVisualization === 'ndvi-overview' ? 'none' : 'ndvi-overview')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  additionalVisualization === 'ndvi-overview'
                    ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-semibold border border-[#2ECC71]/40'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Nainital NDVI Overview
              </button>
              <button
                type="button"
                onClick={() => setAdditionalVisualization(additionalVisualization === 'ndmi-overview' ? 'none' : 'ndmi-overview')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  additionalVisualization === 'ndmi-overview'
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-semibold border border-[#38BDF8]/40'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Nainital NDMI Overview
              </button>
              <button
                type="button"
                onClick={() => setAdditionalVisualization(additionalVisualization === 'change-candidates' ? 'none' : 'change-candidates')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  additionalVisualization === 'change-candidates'
                    ? 'bg-[#E5533D]/20 text-[#E5533D] font-semibold border border-[#E5533D]/40'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Change Candidates Mask
              </button>
            </div>
          </div>
        </div>

        {/* Selected Additional Visualization Panel */}
        {additionalVisualization !== 'none' && (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-2">
                {additionalVisualization === 'ndvi-overview' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
                    <span>Nainital — NDVI Overview (Static Asset: Nainital_NDVI.png)</span>
                  </>
                )}
                {additionalVisualization === 'ndmi-overview' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                    <span>Nainital — NDMI Overview (Static Asset: Nainital_NDMI.png)</span>
                  </>
                )}
                {additionalVisualization === 'change-candidates' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5533D]" />
                    <span>ForestGuardAI — Potential Change Candidates (Static Asset: ForestGuardAI_Change_Candidates.png)</span>
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={() => setAdditionalVisualization('none')}
                className="text-[#8A9A92] hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px]"
              >
                Close Preview
              </button>
            </div>

            {/* Static Image Display Container */}
            <div className="relative rounded-xl overflow-hidden bg-[#040D07] border border-white/10 aspect-[16/10] sm:aspect-[16/9] max-h-[580px] flex items-center justify-center group shadow-xl">
              <img
                src={
                  additionalVisualization === 'ndvi-overview'
                    ? images.ndvi.overview
                    : additionalVisualization === 'ndmi-overview'
                    ? images.ndmi.overview
                    : images.candidates.src
                }
                alt="Additional Static Visualization"
                className="w-full h-full object-contain"
                loading="lazy"
              />

              <button
                type="button"
                onClick={() => {
                  const src = 
                    additionalVisualization === 'ndvi-overview'
                      ? images.ndvi.overview
                      : additionalVisualization === 'ndmi-overview'
                      ? images.ndmi.overview
                      : images.candidates.src;
                  const title = 
                    additionalVisualization === 'ndvi-overview'
                      ? 'Nainital — NDVI Overview'
                      : additionalVisualization === 'ndmi-overview'
                      ? 'Nainital — NDMI Overview'
                      : 'ForestGuardAI — Potential Change Candidates';
                  setLightboxImage({ src, title, subtitle: 'High-Resolution Static Visualization Asset' });
                }}
                className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/80 hover:bg-black text-[#8A9A92] hover:text-white border border-white/15 transition-all"
                title="Expand Full Resolution"
                aria-label="Inspect Full Image"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            <p className="text-[11px] font-mono text-[#8A9A92]">
              {additionalVisualization === 'ndvi-overview' && 'Overview composite representing canopy greenness across the entire division.'}
              {additionalVisualization === 'ndmi-overview' && 'Overview composite representing vegetation liquid moisture signal.'}
              {additionalVisualization === 'change-candidates' && 'Locations flagged for further investigation. Not confirmed deforestation.'}
            </p>
          </div>
        )}

        {/* Static Gallery Thumbnails for quick access */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Nainital NDVI */}
          <div 
            onClick={() => setAdditionalVisualization('ndvi-overview')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              additionalVisualization === 'ndvi-overview'
                ? 'bg-[#2ECC71]/10 border-[#2ECC71]/40'
                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div className="aspect-[16/10] rounded-lg overflow-hidden bg-black/40 mb-2 border border-white/5 relative">
              <img
                src={images.ndvi.overview}
                alt="Nainital NDVI Thumbnail"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-[#B6F36A]">
                NDVI Overview
              </span>
            </div>
            <h5 className="text-xs font-mono font-bold text-white truncate">Nainital_NDVI.png</h5>
            <span className="text-[11px] text-[#8A9A92] block mt-0.5">Vegetation greenness index</span>
          </div>

          {/* Card 2: Nainital NDMI */}
          <div 
            onClick={() => setAdditionalVisualization('ndmi-overview')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              additionalVisualization === 'ndmi-overview'
                ? 'bg-[#38BDF8]/10 border-[#38BDF8]/40'
                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div className="aspect-[16/10] rounded-lg overflow-hidden bg-black/40 mb-2 border border-white/5 relative">
              <img
                src={images.ndmi.overview}
                alt="Nainital NDMI Thumbnail"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-[#38BDF8]">
                NDMI Overview
              </span>
            </div>
            <h5 className="text-xs font-mono font-bold text-white truncate">Nainital_NDMI.png</h5>
            <span className="text-[11px] text-[#8A9A92] block mt-0.5">Moisture-related vegetation signal</span>
          </div>

          {/* Card 3: Potential Change Candidates */}
          <div 
            onClick={() => setAdditionalVisualization('change-candidates')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              additionalVisualization === 'change-candidates'
                ? 'bg-[#E5533D]/10 border-[#E5533D]/40'
                : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div className="aspect-[16/10] rounded-lg overflow-hidden bg-black/40 mb-2 border border-white/5 relative">
              <img
                src={images.candidates.src}
                alt="Change Candidates Thumbnail"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-[#E5533D]">
                Change Screening
              </span>
            </div>
            <h5 className="text-xs font-mono font-bold text-white truncate">ForestGuardAI_Change_Candidates.png</h5>
            <span className="text-[11px] text-[#8A9A92] block mt-0.5">Locations flagged for investigation</span>
          </div>
        </div>
      </div>

      {/* 9 & 10. SCIENTIFIC PROTOCOL & STRICT BOUNDARIES */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8A9A92]">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-[#38BDF8] shrink-0" />
          <span>
            <strong className="text-white font-medium">Protocol Compliance:</strong> All imagery layers are rendered as static satellite visualization assets. No coordinates, forest loss percentages, or model claims are fabricated.
          </span>
        </div>
        <span className="font-mono text-[#8A9A92] text-[11px] shrink-0">
          Source: Sentinel-2 MSI L2A / Nainital AOI
        </span>
      </div>

      {/* FULL-RESOLUTION LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-5xl flex items-center justify-between pb-3 text-white border-b border-white/10 mb-3">
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold">{lightboxImage.title}</h3>
              <p className="text-xs text-[#8A9A92] font-mono">{lightboxImage.subtitle}</p>
            </div>
            <button
              onClick={() => setLightboxImage(null)}
              className="p-2 rounded-xl text-[#8A9A92] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>
          </div>

          <div className="w-full max-w-5xl max-h-[82vh] overflow-auto flex items-center justify-center bg-[#040D07] rounded-xl border border-white/15 p-2">
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="max-w-full max-h-[78vh] object-contain"
            />
          </div>

          <div className="w-full max-w-5xl mt-3 flex items-center justify-between text-xs font-mono text-[#8A9A92]">
            <span>Static analytical visualization asset</span>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="px-4 py-1.5 rounded-lg bg-white/15 hover:bg-white/20 text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
