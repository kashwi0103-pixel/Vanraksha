import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { HeroForestCanvas } from '../components/HeroForestCanvas';
import { CountUpStrip } from '../components/CountUpStrip';
import { ForestStatus } from '../lib/types';
import { useForest } from '../lib/ForestContext';
import { ArrowRight, Activity, Play, ShieldAlert, Sparkles, Orbit, Radio } from 'lucide-react';

interface HomeSectionProps {
  onNavigate: (sectionId: string) => void;
  systemStatus: ForestStatus;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate, systemStatus }) => {
  const [weatherMode, setWeatherMode] = useState<'sun' | 'rain'>('sun');
  const { scenario, evaluation, dayIndex, currentDay } = useForest();

  return (
    <section id="home" className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-8 lg:py-14 scroll-mt-24">
      {/* Top Demonstrator Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <SimulatedDataBadge variant="pill" />
          <span className="text-[11px] font-mono text-[#8A9A92] uppercase tracking-wider hidden sm:inline">
            Pilot Area: Blackwood Creek · Day {dayIndex} ({currentDay?.dateString})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase text-[#8A9A92] hidden md:inline">
            Decision Protocol:
          </span>
          <StatusBadge status={systemStatus} size="sm" pulsing={true} />
        </div>
      </div>

      {/* Hero Headline & Subtitle Block */}
      <div className="text-center max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold text-white tracking-tight leading-[1.1] mb-5">
          Hear the forest <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ECC71] via-[#B6F36A] to-[#2ECC71]">
            before it shows.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#8A9A92] max-w-3xl mx-auto leading-relaxed font-sans mb-8">
          Satellite + weather + one ground sensor &rarr; transparent early stress signals for field teams.
        </p>

        {/* Primary Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2ECC71] text-[#06120C] font-semibold text-sm hover:bg-[#B6F36A] transition-all duration-200 shadow-[0_0_30px_rgba(46,204,113,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F36A]"
          >
            <Activity size={18} aria-hidden="true" />
            <span>Open Live Dashboard</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('simulation-lab')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/15 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
          >
            <Play size={16} className="text-[#B6F36A]" aria-hidden="true" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Animated Forest Scene Canvas */}
      <div className="w-full mb-8 relative">
        <HeroForestCanvas
          weatherMode={weatherMode}
          onToggleWeather={() => setWeatherMode(prev => (prev === 'sun' ? 'rain' : 'sun'))}
        />

        {/* Overlay Floating Status Pill in Scene */}
        <div className="absolute bottom-5 left-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#06120C]/85 backdrop-blur-md border border-white/10 text-xs font-mono text-[#8A9A92]">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
          <span>LoRa Telemetry Active · Satellite Pass Sweeping</span>
        </div>
      </div>

      {/* Animated Count-Up Specifications Strip */}
      <div className="mb-8">
        <CountUpStrip />
      </div>

      {/* Strict Student Prototype Boundary Footnote */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8A9A92]">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-[#F5B841] shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-white font-medium">Demonstrator Boundary:</strong> ForestGuard AI is an academic student demonstrator for early-warning decision support. Never treated as a safety-critical fire predictor.
          </span>
        </div>
        <span className="font-mono text-[#B6F36A] text-[11px] shrink-0">
          Status: {systemStatus}
        </span>
      </div>
    </section>
  );
};
