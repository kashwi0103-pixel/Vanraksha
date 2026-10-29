import React, { useState, useEffect, useRef } from 'react';
import { useForest } from '../../lib/ForestContext';
import { Radio, AlertTriangle, Terminal, Pause, Play, Trash2, Copy, Check } from 'lucide-react';

export const LiveSensorCard: React.FC = () => {
  const { liveTick, isLiveTickActive, toggleLiveTick } = useForest();
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Append new CSV tick to scrolling serial log
  useEffect(() => {
    if (liveTick?.formattedCsv) {
      setTerminalLogs(prev => {
        const next = [...prev, liveTick.formattedCsv];
        // Keep last 40 lines
        return next.slice(-40);
      });
    }
  }, [liveTick]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(terminalLogs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClearLogs = () => {
    setTerminalLogs([]);
  };

  const isStale = liveTick.status === 'STALE' || liveTick.status === 'ERROR';

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider">
            <Radio 
              size={14} 
              className={isLiveTickActive ? 'text-[#2ECC71] animate-pulse' : 'text-[#8A9A92]'} 
              aria-hidden="true" 
            />
            <span className="text-white font-medium">In-Situ Telemetry Node 1</span>
          </div>

          <span 
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-medium border ${
              liveTick.status === 'OK'
                ? 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30'
                : 'bg-[#E5533D]/10 text-[#E5533D] border-[#E5533D]/30 animate-pulse'
            }`}
          >
            {liveTick.status === 'OK' ? 'Link: OK' : `Fault: ${liveTick.status}`}
          </span>
        </div>

        {/* Stale / Error Warning Callout */}
        {isStale && (
          <div className="mb-4 p-3 rounded-xl bg-[#E5533D]/15 border border-[#E5533D]/30 flex items-start gap-2.5 text-xs text-[#E5EFE9]">
            <AlertTriangle size={16} className="text-[#E5533D] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold text-[#E5533D] block">
                {liveTick.status === 'STALE' ? 'Stale Telemetry Warning' : 'Hardware Rail Fault Detected'}
              </span>
              <span className="text-[11px] text-[#8A9A92]">
                {liveTick.status === 'STALE'
                  ? 'Sensor packet timeout (>6 hrs without transmission). Downstream status held as DATA INCOMPLETE.'
                  : `Raw ADC (${liveTick.soil_raw}) out of physical calibration envelope [900, 3400].`}
              </span>
            </div>
          </div>
        )}

        {/* Live Gauges & Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {/* Soil Moisture Gauge */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#8A9A92] uppercase block mb-1">
              Soil Moisture
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono-numbers text-white">
                {liveTick.calibrated_soil_pct}%
              </span>
            </div>
            {/* Progress mini bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  liveTick.calibrated_soil_pct < 22 ? 'bg-[#E5533D]' : 'bg-[#2ECC71]'
                }`}
                style={{ width: `${Math.min(100, liveTick.calibrated_soil_pct)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#8A9A92]">
              ADC: <strong className="text-white">{liveTick.soil_raw}</strong>
            </span>
          </div>

          {/* Temperature */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#8A9A92] uppercase block mb-1">
              Air Temperature
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono-numbers text-white">
                {liveTick.temp_c}°C
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8A9A92]">
              BME280 Ambient
            </span>
          </div>

          {/* Relative Humidity */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#8A9A92] uppercase block mb-1">
              Humidity
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono-numbers text-white">
                {liveTick.humidity_pct}%
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8A9A92]">
              Canopy Microclimate
            </span>
          </div>
        </div>
      </div>

      {/* Mock Serial Terminal with Scrolling CSV output */}
      <div className="border-t border-white/[0.08] pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8A9A92]">
            <Terminal size={12} className="text-[#B6F36A]" aria-hidden="true" />
            <span>Serial Telemetry (CSV)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLiveTick}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white flex items-center gap-1 font-mono transition-colors"
              title={isLiveTickActive ? 'Pause serial stream' : 'Resume serial stream'}
            >
              {isLiveTickActive ? <Pause size={10} /> : <Play size={10} />}
              <span>{isLiveTickActive ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLogs}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white flex items-center gap-1 font-mono transition-colors"
              title="Copy CSV to clipboard"
            >
              {copied ? <Check size={10} className="text-[#2ECC71]" /> : <Copy size={10} />}
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white font-mono transition-colors"
              title="Clear terminal log"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </div>

        {/* Terminal screen container */}
        <div 
          tabIndex={0}
          role="region"
          aria-label="Serial CSV Terminal Output"
          className="h-28 rounded-xl bg-[#030906] border border-white/10 p-2.5 overflow-y-auto font-mono text-[10px] text-[#B6F36A] space-y-1 shadow-inner select-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ECC71]"
        >
          <div className="text-[#8A9A92]/70 sticky top-0 bg-[#030906]/90 pb-1 border-b border-white/5">
            # timestamp,soil_raw,temp_c,humidity_pct,status
          </div>
          {terminalLogs.length === 0 ? (
            <div className="text-[#8A9A92] italic pt-2">Waiting for next 5-min telemetry frame...</div>
          ) : (
            terminalLogs.map((line, i) => (
              <div key={i} className="leading-tight opacity-90 hover:opacity-100">
                {line}
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
