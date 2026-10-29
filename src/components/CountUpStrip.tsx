import React, { useState, useEffect } from 'react';
import { Cpu, Satellite, Calendar, DollarSign } from 'lucide-react';

export const CountUpStrip: React.FC = () => {
  const [nodeCount, setNodeCount] = useState(0);
  const [minCost, setMinCost] = useState(400);
  const [maxCost, setMaxCost] = useState(1200);

  useEffect(() => {
    // Smooth initial count-up animation
    const timer = setTimeout(() => {
      setNodeCount(1);
      setMinCost(700);
      setMaxCost(1700);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="region"
      aria-label="Demonstrator Core Specifications Strip"
      className="w-full glass-card border border-white/10 p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl"
    >
      {/* Subtle interior glow */}
      <div 
        className="absolute -right-12 -top-12 w-48 h-48 bg-[#2ECC71]/10 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true" 
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
        {/* Metric 1: 1 sensor node */}
        <div className="flex flex-col pt-3 sm:pt-0 sm:px-4 first:px-0">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
            <Cpu size={14} className="text-[#2ECC71]" aria-hidden="true" />
            <span>Telemetry Density</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-white font-mono-numbers">
              {nodeCount}
            </span>
            <span className="text-xs font-sans text-[#E5EFE9]">sensor node</span>
          </div>
          <span className="text-[11px] text-[#8A9A92] mt-0.5">ESP32-S3 Sub-GHz LoRa</span>
        </div>

        {/* Metric 2: Sentinel-2 */}
        <div className="flex flex-col pt-3 sm:pt-0 sm:px-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
            <Satellite size={14} className="text-[#B6F36A]" aria-hidden="true" />
            <span>Remote Sensing</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Sentinel-2
            </span>
          </div>
          <span className="text-[11px] text-[#8A9A92] mt-0.5">MSI 10m–20m Surface Reflectance</span>
        </div>

        {/* Metric 3: 7-14 day target window */}
        <div className="flex flex-col pt-3 sm:pt-0 sm:px-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
            <Calendar size={14} className="text-[#F5B841]" aria-hidden="true" />
            <span>Early Warning</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-white font-mono-numbers">
              7–14 day
            </span>
            <span className="text-xs font-sans text-[#E5EFE9]">target window</span>
          </div>
          <span className="text-[11px] text-[#8A9A92] mt-0.5">Pre-visual root stress lead time</span>
        </div>

        {/* Metric 4: ₹700-1,700 core build */}
        <div className="flex flex-col pt-3 sm:pt-0 sm:px-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
            <DollarSign size={14} className="text-[#2ECC71]" aria-hidden="true" />
            <span>Accessible Cost</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-[#B6F36A] font-mono-numbers">
              ₹{minCost}–{maxCost}
            </span>
            <span className="text-xs font-sans text-[#E5EFE9]">core build</span>
          </div>
          <span className="text-[11px] text-[#8A9A92] mt-0.5">(~$8.50 – $20 USD / node BOM)</span>
        </div>
      </div>
    </div>
  );
};
