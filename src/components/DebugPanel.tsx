import React, { useState } from 'react';
import { useForest } from '../lib/ForestContext';
import { SimulationScenario, SCENARIO_PROFILES } from '../lib/simulator';
import { StatusBadge } from './StatusBadge';
import { SimulatedDataBadge } from './SimulatedDataBadge';
import { 
  Terminal, 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  Sliders, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Layers,
  Database,
  Info
} from 'lucide-react';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'flags' | 'settings' | 'testmatrix'>('live');

  const {
    scenario,
    setScenario,
    dayIndex,
    setDayIndex,
    currentDay,
    evaluation,
    status,
    liveTick,
    isLiveTickActive,
    toggleLiveTick,
    triggerManualTick,
    settings,
    updateSettings,
    resetSettings,
  } = useForest();

  const scenarios: SimulationScenario[] = [
    'Normal season',
    'Dry spell',
    'Heatwave',
    'Sensor dropout',
    'Cloudy satellite gap',
    'Monsoon recovery',
  ];

  return (
    <aside 
      aria-label="Logic Layer & Simulator Debug Console"
      className="fixed bottom-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] max-w-full p-2 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto bg-[#040C08]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[#2ECC71]" aria-hidden="true" />
            <span className="font-heading font-semibold text-white text-xs">
              Simulator & Rule Engine Debugger
            </span>
            <SimulatedDataBadge variant="pill" />
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge status={status} size="sm" pulsing={true} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-[#8A9A92] hover:text-white rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ECC71]"
              aria-label={isOpen ? 'Minimize debug panel' : 'Expand debug panel'}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-xs font-mono">
            {/* Scenario Quick Selector */}
            <div>
              <div className="flex items-center justify-between text-[#8A9A92] mb-1.5 text-[11px]">
                <span className="uppercase tracking-wider">Active Scenario Profile:</span>
                <span className="text-white font-medium">{scenario}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {scenarios.map((sc) => {
                  const isActive = scenario === sc;
                  return (
                    <button
                      key={sc}
                      onClick={() => setScenario(sc)}
                      className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-sans font-medium transition-all duration-150 border ${
                        isActive
                          ? 'bg-[#2ECC71]/20 text-[#B6F36A] border-[#2ECC71]/50 shadow-sm'
                          : 'bg-white/[0.02] text-[#8A9A92] border-white/5 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className="truncate">{sc}</div>
                      <div className="text-[9px] font-mono text-[#8A9A92] opacity-80 truncate">
                        {SCENARIO_PROFILES[sc].expectedStatus.split(' ')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Tabs: Live / Flags / Settings / Test Matrix */}
            <div className="flex items-center gap-1 border-b border-white/10 pb-2 pt-1 font-sans">
              <button
                onClick={() => setActiveTab('live')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  activeTab === 'live'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Live & Telemetry
              </button>
              <button
                onClick={() => setActiveTab('flags')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors flex items-center gap-1.5 ${
                  activeTab === 'flags'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                <span>3 Stress Flags</span>
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-mono">
                  {evaluation.triggeredFlagCount}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Thresholds
              </button>
              <button
                onClick={() => setActiveTab('testmatrix')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  activeTab === 'testmatrix'
                    ? 'bg-white/10 text-[#B6F36A] font-semibold'
                    : 'text-[#8A9A92] hover:text-white'
                }`}
              >
                Scenario Matrix
              </button>
            </div>

            {/* TAB 1: Live Telemetry & Timeline Scrubber */}
            {activeTab === 'live' && (
              <div className="space-y-3 font-mono">
                {/* 90-Day Scrubber */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-[#8A9A92]">90-Day Timeline Scrubber:</span>
                    <span className="text-white font-medium">Day {dayIndex} / 89 ({currentDay?.dateString})</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="89"
                    value={dayIndex}
                    onChange={(e) => setDayIndex(Number(e.target.value))}
                    className="w-full accent-[#2ECC71] cursor-pointer"
                    aria-label="90-Day Timeline Scrubber"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9A92] mt-1">
                    <span>Day 0 (Aug 01)</span>
                    <span>Day 45 (Sep 15)</span>
                    <span>Day 89 (Oct 28)</span>
                  </div>
                </div>

                {/* Live 5-minute tick reading output */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#8A9A92] flex items-center gap-1.5">
                      <Radio size={12} className={isLiveTickActive ? 'text-[#2ECC71] animate-pulse' : 'text-[#8A9A92]'} />
                      <span>Exported tick() Telemetry Stream:</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={toggleLiveTick}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white flex items-center gap-1"
                      >
                        {isLiveTickActive ? <Pause size={10} /> : <Play size={10} />}
                        <span>{isLiveTickActive ? 'Pause' : 'Play'}</span>
                      </button>
                      <button
                        onClick={triggerManualTick}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white"
                        title="Trigger manual tick"
                      >
                        <RefreshCw size={10} />
                      </button>
                    </div>
                  </div>
                  {/* CSV Line Display */}
                  <div className="p-2 rounded bg-black/60 border border-white/5 text-[10px] text-[#B6F36A] break-all select-all font-mono">
                    {liveTick.formattedCsv}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 text-[10px]">
                    <div>
                      <span className="text-[#8A9A92] block">Raw ADC:</span>
                      <span className="text-white">{liveTick.soil_raw}</span>
                    </div>
                    <div>
                      <span className="text-[#8A9A92] block">Cal Soil:</span>
                      <span className="text-white">{liveTick.calibrated_soil_pct}%</span>
                    </div>
                    <div>
                      <span className="text-[#8A9A92] block">Temp:</span>
                      <span className="text-white">{liveTick.temp_c}°C</span>
                    </div>
                    <div>
                      <span className="text-[#8A9A92] block">Status:</span>
                      <span className={liveTick.status === 'OK' ? 'text-[#2ECC71]' : 'text-[#E5533D]'}>
                        {liveTick.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Forest Health Index Preview */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#8A9A92]">Forest Health Index (FHI):</span>
                    <span className="text-sm font-bold text-[#B6F36A]">{evaluation.forestHealthIndex.score} / 100</span>
                  </div>
                  <div className="text-[10px] text-[#8A9A92] italic mb-2">
                    Label: "{evaluation.forestHealthIndex.label}"
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="p-1.5 rounded bg-white/[0.02] border border-white/5">
                      <span className="text-[#8A9A92] block">Soil Subscore:</span>
                      <span className="text-white font-semibold">{evaluation.forestHealthIndex.breakdown.soilSubScore}</span>
                      <span className="text-[#8A9A92] text-[9px] block">W: {evaluation.forestHealthIndex.weightsUsed.soil}</span>
                    </div>
                    <div className="p-1.5 rounded bg-white/[0.02] border border-white/5">
                      <span className="text-[#8A9A92] block">Weather:</span>
                      <span className="text-white font-semibold">{evaluation.forestHealthIndex.breakdown.weatherSubScore}</span>
                      <span className="text-[#8A9A92] text-[9px] block">W: {evaluation.forestHealthIndex.weightsUsed.weather}</span>
                    </div>
                    <div className="p-1.5 rounded bg-white/[0.02] border border-white/5">
                      <span className="text-[#8A9A92] block">Canopy Sat:</span>
                      <span className="text-white font-semibold">{evaluation.forestHealthIndex.breakdown.satelliteSubScore}</span>
                      <span className="text-[#8A9A92] text-[9px] block">W: {evaluation.forestHealthIndex.weightsUsed.satellite}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Stress Flags & Sensor Validity */}
            {activeTab === 'flags' && (
              <div className="space-y-3">
                {/* Sensor Validity */}
                <div className={`p-3 rounded-xl border ${evaluation.sensorValidity.isValid ? 'bg-[#2ECC71]/5 border-[#2ECC71]/20' : 'bg-[#E5533D]/10 border-[#E5533D]/30'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-white">Sensor Hardware Validity:</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${evaluation.sensorValidity.isValid ? 'bg-[#2ECC71]/20 text-[#2ECC71]' : 'bg-[#E5533D]/20 text-[#E5533D]'}`}>
                      {evaluation.sensorValidity.sensorStatus} (ADC: {evaluation.sensorValidity.rawAdc})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A9A92] leading-tight font-sans">
                    {evaluation.sensorValidity.reason}
                  </p>
                </div>

                {/* Flag 1: Local Dry */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-white">1. Local Soil Moisture Flag</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${evaluation.flags.localDryFlag.triggered ? 'bg-[#E5533D]/20 text-[#E5533D]' : 'bg-white/10 text-[#8A9A92]'}`}>
                      {evaluation.flags.localDryFlag.triggered ? 'TRIGGERED' : 'CLEAR'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A9A92] leading-tight font-sans mb-1">
                    {evaluation.flags.localDryFlag.reason}
                  </p>
                  <div className="text-[10px] text-[#8A9A92]/70 font-mono">
                    Window: {evaluation.flags.localDryFlag.timeWindow}
                  </div>
                </div>

                {/* Flag 2: Weather */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-white">2. Weather Anomaly Flag</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${evaluation.flags.weatherFlag.triggered ? 'bg-[#F5B841]/20 text-[#F5B841]' : 'bg-white/10 text-[#8A9A92]'}`}>
                      {evaluation.flags.weatherFlag.triggered ? 'TRIGGERED' : 'CLEAR'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A9A92] leading-tight font-sans mb-1">
                    {evaluation.flags.weatherFlag.reason}
                  </p>
                  <div className="text-[10px] text-[#8A9A92]/70 font-mono">
                    Window: {evaluation.flags.weatherFlag.timeWindow}
                  </div>
                </div>

                {/* Flag 3: Satellite */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-white">3. Canopy Reflectance Flag</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${evaluation.flags.satelliteFlag.triggered ? 'bg-[#E5533D]/20 text-[#E5533D]' : 'bg-white/10 text-[#8A9A92]'}`}>
                      {evaluation.flags.satelliteFlag.triggered ? 'TRIGGERED' : 'CLEAR'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A9A92] leading-tight font-sans mb-1">
                    {evaluation.flags.satelliteFlag.reason}
                  </p>
                  <div className="text-[10px] text-[#8A9A92]/70 font-mono">
                    Window: {evaluation.flags.satelliteFlag.timeWindow}
                  </div>
                </div>

                {/* Combined Status Logic Summary */}
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-[#8A9A92]">
                  <span className="text-white font-medium block mb-1">Rule Engine Combinator Rule:</span>
                  <span>0 flags → NORMAL MONITORING | 1 flag → WATCH | 2+ flags → FIELD CHECK RECOMMENDED | Sensor invalid → DATA INCOMPLETE.</span>
                </div>
              </div>
            )}

            {/* TAB 3: Editable Thresholds */}
            {activeTab === 'settings' && (
              <div className="space-y-3 font-sans">
                <div className="p-2.5 rounded-lg bg-[#F5B841]/10 border border-[#F5B841]/20 text-[11px] text-[#F5B841] flex items-center gap-2">
                  <Info size={14} className="shrink-0" />
                  <span>Notice: {settings.settingsDisclaimer}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[#8A9A92] block mb-1">
                      Soil Moisture Threshold: {settings.soilMoistureThresholdPct}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="35"
                      step="1"
                      value={settings.soilMoistureThresholdPct}
                      onChange={(e) => updateSettings({ soilMoistureThresholdPct: Number(e.target.value) })}
                      className="w-full accent-[#2ECC71]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A9A92] block mb-1">
                      Consecutive Soil Readings: {settings.soilConsecutiveCount} days
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      value={settings.soilConsecutiveCount}
                      onChange={(e) => updateSettings({ soilConsecutiveCount: Number(e.target.value) })}
                      className="w-full accent-[#2ECC71]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A9A92] block mb-1">
                      Temp Delta Above Baseline: +{settings.tempBaselineDeltaThresholdC}°C
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="0.5"
                      value={settings.tempBaselineDeltaThresholdC}
                      onChange={(e) => updateSettings({ tempBaselineDeltaThresholdC: Number(e.target.value) })}
                      className="w-full accent-[#F5B841]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A9A92] block mb-1">
                      Max Cumulative Rain (Dry Window): {settings.rainfallMaxCumulativeDryMm} mm
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={settings.rainfallMaxCumulativeDryMm}
                      onChange={(e) => updateSettings({ rainfallMaxCumulativeDryMm: Number(e.target.value) })}
                      className="w-full accent-[#2ECC71]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8A9A92] block mb-1">
                      Alert Cooldown: {settings.alertCooldownDays} days
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      step="1"
                      value={settings.alertCooldownDays}
                      onChange={(e) => updateSettings({ alertCooldownDays: Number(e.target.value) })}
                      className="w-full accent-[#8A9A92]"
                    />
                  </div>
                </div>

                <button
                  onClick={resetSettings}
                  className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10 transition-colors"
                >
                  Reset Defaults
                </button>
              </div>
            )}

            {/* TAB 4: Scenario Test Matrix */}
            {activeTab === 'testmatrix' && (
              <div className="space-y-2.5 font-sans">
                <div className="text-[11px] text-[#8A9A92] leading-relaxed">
                  Verified unit tests for all 6 environmental scenarios:
                </div>
                {scenarios.map((sc) => {
                  const prof = SCENARIO_PROFILES[sc];
                  const isCurrent = scenario === sc;
                  return (
                    <div
                      key={sc}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'bg-[#2ECC71]/10 border-[#2ECC71]/40'
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#2ECC71]" />
                          {prof.name}
                        </span>
                        <StatusBadge status={prof.expectedStatus} size="sm" pulsing={false} />
                      </div>
                      <p className="text-[11px] text-[#8A9A92] leading-tight mb-2">
                        {prof.description}
                      </p>
                      <button
                        onClick={() => setScenario(sc)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-[#B6F36A] border border-white/10"
                      >
                        {isCurrent ? '● Active in Simulator' : 'Load Scenario'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
