/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Split, 
  Columns, 
  RotateCcw, 
  AlertTriangle, 
  Info, 
  Layers, 
  Sprout, 
  Droplets, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { CHANGE_CANDIDATES, PotentialChangeCandidate } from '../../data/candidateData';
import { useForest } from '../../lib/ForestContext';
import { ExplainCandidatePanel } from './ExplainCandidatePanel';

type ComparisonMode = 'ndvi' | 'ndmi';
type ViewLayout = 'slider' | 'side-by-side';

export const HistoricalSatelliteComparison: React.FC = () => {
  const { setActiveDashboardTab } = useForest();

  const [mode, setMode] = useState<ComparisonMode>('ndmi');
  const [layout, setLayout] = useState<ViewLayout>('slider');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<PotentialChangeCandidate | null>(null);

  // Track image load errors gracefully
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Paths to primary historical assets with relative fallbacks
  const assetMap = {
    ndvi: {
      title: 'NDVI (Normalized Difference Vegetation Index)',
      subtitle: 'Vegetation Greenness Comparison',
      indicatorExplanation: 'NDVI: Indicates vegetation greenness. Quantifies the contrast between near-infrared reflectance and red light absorption to evaluate photosynthetic canopy density.',
      indicatorColor: '#2ECC71',
      before: {
        label: 'October–November 2023',
        year: '2023',
        src: '/assets/historical/NDVI_2023.png',
        fallback: '/NDVI_2023.png',
        alt: 'Nainital NDVI Satellite Observation — October–November 2023',
      },
      after: {
        label: 'October–November 2025',
        year: '2025',
        src: '/assets/historical/NDVI_2025.png',
        fallback: '/NDVI_2025.png',
        alt: 'Nainital NDVI Satellite Observation — October–November 2025',
      },
    },
    ndmi: {
      title: 'NDMI (Normalized Difference Moisture Index)',
      subtitle: 'Canopy Water Content & Drought Stress Comparison',
      indicatorExplanation: 'NDMI: Indicates a moisture-related vegetation signal. Uses near-infrared and shortwave-infrared bands to monitor canopy liquid water content and hydration stress.',
      indicatorColor: '#38BDF8',
      before: {
        label: 'October–November 2023',
        year: '2023',
        src: '/assets/historical/NDMI_2023.png',
        fallback: '/NDMI_2023.png',
        alt: 'Nainital NDMI Satellite Observation — October–November 2023',
      },
      after: {
        label: 'October–November 2025',
        year: '2025',
        src: '/assets/historical/NDMI_2025.png',
        fallback: '/NDMI_2025.png',
        alt: 'Nainital NDMI Satellite Observation — October–November 2025',
      },
    },
  };

  const changeCandidatesAsset = {
    title: 'Potential Change Candidates',
    src: '/assets/historical/ForestGuardAI_Change_Candidates.png',
    fallback: '/assets/aistudio/ForestGuardAI_Change_Candidates_9dfc25af.png',
    alt: 'ForestGuardAI Screening — Potential Change Candidates',
  };

  const currentAssets = assetMap[mode];

  // Helper for coordinate calculation from clientX
  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(Math.round(percentage * 10) / 10);
  }, []);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  // Touch interaction handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  // Global mousemove & mouseup listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateSliderFromClientX(e.clientX);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches[0]) {
        updateSliderFromClientX(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, updateSliderFromClientX]);

  // Keyboard navigation for slider
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos(prev => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos(prev => Math.min(100, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPos(100);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setSliderPos(50);
    }
  };

  const handleImageError = (key: string, fallbackSrc?: string) => {
    if (!fallbackSrc) {
      setImageErrors(prev => ({ ...prev, [key]: true }));
      return;
    }
    setImageErrors(prev => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  };

  return (
    <div className="space-y-8" id="historical-satellite-comparison">
      {/* Feature Header Card */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl relative overflow-hidden bg-gradient-to-br from-[#07170E]/90 to-[#0A1F13]/90">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2ECC71]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#2ECC71] bg-[#2ECC71]/10 px-2.5 py-1 rounded-md border border-[#2ECC71]/20">
                Interactive Comparison
              </span>
              <span className="text-xs font-mono text-[#8A9A92] flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/10">
                <MapPin size={12} className="text-[#B6F36A]" />
                <span>Nainital Catchment, Uttarakhand</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              Historical Satellite Comparison
            </h2>
            <p className="text-sm text-[#A0B0A7] mt-1.5 max-w-2xl font-normal leading-relaxed">
              Interactive before-and-after satellite observation analysis between <strong className="text-white font-bold">October–November 2023</strong> and <strong className="text-white font-bold">October–November 2025</strong>. Drag the slider to reveal localized canopy moisture and greenness variations.
            </p>
          </div>

          {/* Controls: Mode Switcher & View Layout */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Indicator Mode Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/15" role="tablist" aria-label="Comparison Indicator Mode">
              <button
                type="button"
                onClick={() => setMode('ndvi')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'ndvi'
                    ? 'bg-[#2ECC71] text-black shadow-lg shadow-[#2ECC71]/20 font-bold'
                    : 'text-[#8A9A92] hover:text-white hover:bg-white/5'
                }`}
                role="tab"
                aria-selected={mode === 'ndvi'}
              >
                <Sprout size={14} className={mode === 'ndvi' ? 'text-black' : 'text-[#2ECC71]'} />
                <span>NDVI Comparison</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('ndmi')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'ndmi'
                    ? 'bg-[#38BDF8] text-black shadow-lg shadow-[#38BDF8]/20 font-bold'
                    : 'text-[#8A9A92] hover:text-white hover:bg-white/5'
                }`}
                role="tab"
                aria-selected={mode === 'ndmi'}
              >
                <Droplets size={14} className={mode === 'ndmi' ? 'text-black' : 'text-[#38BDF8]'} />
                <span>NDMI Comparison</span>
              </button>
            </div>

            {/* Layout Toggle: Split Slider vs Side-by-Side */}
            <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/15" role="group" aria-label="Layout view">
              <button
                type="button"
                onClick={() => setLayout('slider')}
                title="Interactive Split Slider"
                className={`p-2 rounded-lg text-xs transition-all ${
                  layout === 'slider'
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-[#8A9A92] hover:text-white hover:bg-white/5'
                }`}
              >
                <Split size={15} />
              </button>
              <button
                type="button"
                onClick={() => setLayout('side-by-side')}
                title="Side-by-Side Comparison"
                className={`p-2 rounded-lg text-xs transition-all ${
                  layout === 'side-by-side'
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-[#8A9A92] hover:text-white hover:bg-white/5'
                }`}
              >
                <Columns size={15} />
              </button>
            </div>

            {/* Reset Slider Button */}
            {layout === 'slider' && (
              <button
                type="button"
                onClick={() => setSliderPos(50)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-[#8A9A92] hover:text-white border border-white/10 text-xs font-mono font-bold transition-all"
                title="Reset slider position to center (50%)"
              >
                <RotateCcw size={13} />
                <span>Reset 50%</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Indicator Explanation Banner */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 sm:mt-0" 
              style={{ backgroundColor: currentAssets.indicatorColor }} 
            />
            <p className="text-[#C0D0C8] font-medium leading-relaxed">
              <strong className="text-white font-bold">{currentAssets.indicatorExplanation.split('.')[0]}.</strong>{' '}
              {currentAssets.indicatorExplanation.split('.').slice(1).join('.')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
            <span className="text-[#8A9A92]">Observation Periods:</span>
            <span className="text-[#B6F36A] font-bold">Oct–Nov 2023</span>
            <span className="text-white/30">vs</span>
            <span className="text-[#38BDF8] font-bold">Oct–Nov 2025</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Comparison Display */}
      <div className="glass-card p-4 sm:p-6 border border-white/10 rounded-2xl space-y-4">
        {/* Top Legend & Instructions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2 text-[#8A9A92]">
            <Info size={14} className="text-[#B6F36A]" />
            <span>
              {layout === 'slider' 
                ? 'Drag the vertical divider left or right, or use keyboard arrow keys.' 
                : 'Displaying side-by-side synchronized spatial frames.'}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono font-bold">
            <div className="flex items-center gap-1.5 text-[#B6F36A]">
              <span className="w-2 h-2 rounded-full bg-[#B6F36A]" />
              <span>Left: Oct–Nov 2023 (Before)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#38BDF8]">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
              <span>Right: Oct–Nov 2025 (After)</span>
            </div>
          </div>
        </div>

        {/* Comparison Render Area */}
        {layout === 'slider' ? (
          /* Interactive Split Slider View */
          <div
            ref={containerRef}
            tabIndex={0}
            role="slider"
            aria-label="Satellite comparison slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sliderPos}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative w-full h-[380px] sm:h-[520px] md:h-[620px] rounded-xl overflow-hidden bg-[#030906] border border-white/15 select-none cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
          >
            {/* Background Layer: 2025 (After) */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <img
                src={imageErrors[`${mode}-after`] ? currentAssets.after.fallback : currentAssets.after.src}
                alt={currentAssets.after.alt}
                onError={() => handleImageError(`${mode}-after`)}
                className="w-full h-full object-contain pointer-events-none select-none"
              />
              {imageErrors[`${mode}-after`] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4 text-center">
                  <div className="max-w-xs p-4 rounded-xl bg-black/80 border border-white/20 text-xs">
                    <AlertTriangle size={20} className="mx-auto text-[#F5B841] mb-2" />
                    <p className="text-white font-bold">{currentAssets.after.label}</p>
                    <p className="text-[#8A9A92] mt-1">Image loaded via secondary fallback buffer.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Foreground Layer: 2023 (Before) clipped by sliderPos */}
            <div
              className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none select-none transition-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                WebkitClipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              }}
            >
              <img
                src={imageErrors[`${mode}-before`] ? currentAssets.before.fallback : currentAssets.before.src}
                alt={currentAssets.before.alt}
                onError={() => handleImageError(`${mode}-before`)}
                className="w-full h-full object-contain pointer-events-none select-none"
              />
              {imageErrors[`${mode}-before`] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4 text-center">
                  <div className="max-w-xs p-4 rounded-xl bg-black/80 border border-white/20 text-xs">
                    <AlertTriangle size={20} className="mx-auto text-[#F5B841] mb-2" />
                    <p className="text-white font-bold">{currentAssets.before.label}</p>
                    <p className="text-[#8A9A92] mt-1">Image loaded via secondary fallback buffer.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Year / Period Badges */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-[#2ECC71]/40 text-xs font-mono font-bold text-white shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                <span>2023 · Oct–Nov</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-[#38BDF8]/40 text-xs font-mono font-bold text-white shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                <span>2025 · Oct–Nov</span>
              </div>
            </div>

            {/* Vertical Divider Line */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Divider Glow & Line */}
              <div className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" />

              {/* Slider Handle Grip */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-black shadow-2xl flex items-center justify-center border-2 border-[#0A1F13] cursor-ew-resize hover:scale-110 active:scale-95 transition-transform pointer-events-auto">
                <div className="flex items-center -space-x-1">
                  <ChevronLeft size={16} strokeWidth={3} className="text-black" />
                  <ChevronRight size={16} strokeWidth={3} className="text-black" />
                </div>
              </div>

              {/* Slider Percentage Tag */}
              <div className="absolute bottom-4 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-md pointer-events-none">
                {Math.round(sliderPos)}% Split
              </div>
            </div>
          </div>
        ) : (
          /* Side-by-Side Fallback & Comparative Inspection View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 2023 Panel */}
            <div className="rounded-xl overflow-hidden bg-[#030906] border border-white/15 p-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-[#B6F36A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B6F36A]" />
                  <span>October–November 2023 (Before)</span>
                </span>
                <span className="text-[10px] font-mono text-[#8A9A92]">Baseline Epoch</span>
              </div>
              <div className="relative w-full h-[320px] sm:h-[420px] flex items-center justify-center">
                <img
                  src={imageErrors[`${mode}-before`] ? currentAssets.before.fallback : currentAssets.before.src}
                  alt={currentAssets.before.alt}
                  onError={() => handleImageError(`${mode}-before`)}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* 2025 Panel */}
            <div className="rounded-xl overflow-hidden bg-[#030906] border border-white/15 p-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-[#38BDF8] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                  <span>October–November 2025 (After)</span>
                </span>
                <span className="text-[10px] font-mono text-[#8A9A92]">Evaluation Epoch</span>
              </div>
              <div className="relative w-full h-[320px] sm:h-[420px] flex items-center justify-center">
                <img
                  src={imageErrors[`${mode}-after`] ? currentAssets.after.fallback : currentAssets.after.src}
                  alt={currentAssets.after.alt}
                  onError={() => handleImageError(`${mode}-after`)}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Reset & Position Jump Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-[#8A9A92]">
          <div className="flex items-center gap-2">
            <span>Quick Jump:</span>
            <button
              type="button"
              onClick={() => setSliderPos(20)}
              className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/10 text-white font-bold"
            >
              20% (More 2025)
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(50)}
              className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/10 text-[#2ECC71] font-bold"
            >
              50% (Centered)
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(80)}
              className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/10 text-white font-bold"
            >
              80% (More 2023)
            </button>
          </div>

          <div className="flex items-center gap-2 text-white/50">
            <span>Study Area: Nainital Forest Division</span>
            <span>·</span>
            <span>Sentinel-2 Multispectral</span>
          </div>
        </div>
      </div>

      {/* SECTION 5: Potential Change Candidates Context */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5533D] bg-[#E5533D]/10 px-2 py-0.5 rounded border border-[#E5533D]/20">
                Change Detection Workflow
              </span>
              <span className="text-xs font-mono text-[#8A9A92]">Multi-Sensor Screening</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
              Potential Change Candidates
            </h3>
            <p className="text-xs sm:text-sm text-[#A0B0A7] mt-1 max-w-3xl leading-relaxed">
              The automated screening workflow flags locations where satellite indicators cross configured preliminary change thresholds (NDVI change &lt; -0.05, NDMI change &lt; -0.05, and tree-class probability change &lt; -0.05) between observation epochs (October–November 2023 vs 2025) for prioritised investigation.
            </p>
          </div>

          {/* Quick Navigation to Hotspots */}
          <button
            type="button"
            onClick={() => setActiveDashboardTab('potential-hotspots')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2ECC71] hover:bg-[#2ECC71]/90 text-black text-xs font-mono font-bold transition-all shrink-0 shadow-lg shadow-[#2ECC71]/20"
          >
            <span>View All Candidates in Hotspots</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Change Candidates Raster Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 rounded-xl overflow-hidden bg-[#030906] border border-white/15 p-3 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono">
              <span className="text-white font-bold flex items-center gap-2">
                <Layers size={14} className="text-[#E5533D]" />
                <span>ForestGuardAI Screening Mask</span>
              </span>
              <span className="text-[#E5533D] font-bold">Change Probability (0.0 – 1.0)</span>
            </div>

            <div className="relative w-full h-[280px] sm:h-[380px] flex items-center justify-center">
              <img
                src={imageErrors['change-candidates'] ? changeCandidatesAsset.fallback : changeCandidatesAsset.src}
                alt={changeCandidatesAsset.alt}
                onError={() => handleImageError('change-candidates')}
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] font-mono text-[#8A9A92] mt-2 text-center">
              Dark red clusters indicate candidate zones meeting multi-index anomaly thresholds between 2023 and 2025 passes.
            </p>
          </div>

          {/* Interactive Candidate Quick Selector */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Flagged Candidates ({CHANGE_CANDIDATES.length})
              </span>
              <span className="text-[10px] font-mono text-[#F5B841]">Preliminary — Requires Verification</span>
            </div>

            <p className="text-xs text-[#8A9A92]">
              Select a candidate below to review why environmental signals triggered an alert:
            </p>

            <div className="space-y-2.5">
              {CHANGE_CANDIDATES.map((cand: PotentialChangeCandidate) => {
                const isSelected = selectedCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2ECC71]/10 border-[#2ECC71]/40'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{cand.id}</span>
                        <span className="text-[10px] font-mono text-[#8A9A92]">· {cand.sectorId}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E5533D]/20 text-[#E5533D] border border-[#E5533D]/30">
                        {cand.scorecard.ndvi.isBreached && cand.scorecard.ndmi.isBreached ? 'Multi-Signal' : 'Threshold Breach'}
                      </span>
                    </div>

                    <p className="text-xs text-[#C0D0C8] mt-1 font-medium">{cand.name}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                      <span className="text-[#8A9A92]">
                        NDVI: <strong className="text-white">{cand.scorecard.ndvi.measuredChangeText}</strong>
                      </span>
                      <span className="text-[#8A9A92]">
                        NDMI: <strong className="text-white">{cand.scorecard.ndmi.measuredChangeText}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(cand);
                        }}
                        className="text-[#2ECC71] hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <span>Explain</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Explain Selected Candidate Modal / Inline Accordion */}
        {selectedCandidate && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Search size={15} className="text-[#2ECC71]" />
                <span>Explain Why This Area Was Flagged: {selectedCandidate.id}</span>
              </h4>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="text-xs font-mono text-[#8A9A92] hover:text-white"
              >
                Close Explanation
              </button>
            </div>
            <ExplainCandidatePanel
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
            />
          </div>
        )}
      </div>

      {/* SECTION 6: Scientific Integrity & Methodology Card */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-black/40 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-[#F5B841] shrink-0" />
          <h4 className="text-base font-heading font-bold text-white">
            Scientific Integrity & Interpretive Scope
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <p className="font-bold text-white">Static Visualizations</p>
            <p className="text-[#8A9A92] leading-relaxed">
              Supplied comparison composites serve as static visual references for October–November 2023 and 2025. They do not represent interactive GIS layers.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <p className="font-bold text-white">No Pixel Color Derivations</p>
            <p className="text-[#8A9A92] leading-relaxed">
              Numerical vegetation changes are not calculated from PNG RGB colors. All scientific metric thresholds are derived from radiometric surface reflectance products.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <p className="font-bold text-white">Not Deforestation Proof</p>
            <p className="text-[#8A9A92] leading-relaxed">
              Observed differences do not prove deforestation. Variations may stem from seasonal phenology, deciduous leaf-off, precipitation deficits, or atmospheric differences.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <p className="font-bold text-white">Verification Protocol</p>
            <p className="text-[#8A9A92] leading-relaxed">
              Flagged change candidates carry the status &ldquo;Preliminary — Requires Verification&rdquo; and mandate multi-sensor re-observation and ground-truth validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
