/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { 
  Cpu, 
  Radio, 
  Sun, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  DollarSign, 
  Terminal, 
  Layers, 
  Wrench,
  HelpCircle,
  Zap
} from 'lucide-react';

interface BomItem {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  category: 'core' | 'optional';
  description: string;
  included: boolean;
}

export const HardwareSection: React.FC = () => {
  // Wire highlight state
  const [hoveredWire, setHoveredWire] = useState<string | null>(null);

  // Optional parts BOM toggles
  const [optionalParts, setOptionalParts] = useState<Record<string, boolean>>({
    microsd: false,
    bme280: false,
    solar: false,
    raingauge: false,
    secondNode: false,
  });

  const toggleOptional = (id: string) => {
    setOptionalParts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Base Core BOM Items in INR
  const coreBom = [
    { name: 'ESP32 Development Board (38-pin)', min: 250, max: 500, note: 'Dual-core Xtensa LX6, 3.3V logic, deep-sleep capable' },
    { name: 'Capacitive Soil Moisture Sensor v1.2', min: 100, max: 250, note: 'Corrosion-resistant analog output, 3.3V compliant' },
    { name: 'DHT22 / AM2302 Temp & Humidity Sensor', min: 150, max: 350, note: 'Single-bus digital output with pull-up resistor' },
    { name: 'Jumper Wires & Mini Breadboard / Perfboard', min: 100, max: 200, note: 'Silicone-insulated AWG24 test jumpers' },
    { name: '5V USB Power / Li-Po Battery Cable', min: 100, max: 250, note: 'Micro-USB power harness or 3.7V JST adapter' },
    { name: 'Weatherproof IP65 Prototype Enclosure', min: 150, max: 400, note: 'ABS junction box with cable glands' },
  ];

  // Optional Upgrade Chips in INR
  const optionalBom = [
    { id: 'microsd', name: 'MicroSD SPI Datalogger Module', min: 200, max: 450, note: 'Offline backup logging for disconnected canopy sites' },
    { id: 'bme280', name: 'BME280 Precision I2C Barometer', min: 280, max: 550, note: 'Vapor pressure deficit & barometric altitude estimation' },
    { id: 'solar', name: '2W Solar Panel + TP4056 Harvester', min: 450, max: 850, note: 'Autonomous daylight battery float charging' },
    { id: 'raingauge', name: 'Tipping-Bucket Pulse Rain Gauge', min: 650, max: 1200, note: 'Ground-truth micro-precipitation recording (0.2mm/tip)' },
    { id: 'secondNode', name: '2nd Catchment Node (ESP32-LoRa)', min: 700, max: 1400, note: 'Paired node for spatial gradient cross-checking' },
  ];

  // Calculate dynamic totals
  const coreTotalMin = coreBom.reduce((sum, item) => sum + item.min, 0); // 850
  const coreTotalMax = coreBom.reduce((sum, item) => sum + item.max, 0); // 2050

  const { totalMin, totalMax } = useMemo(() => {
    let min = coreTotalMin;
    let max = coreTotalMax;
    optionalBom.forEach((opt) => {
      if (optionalParts[opt.id]) {
        min += opt.min;
        max += opt.max;
      }
    });
    return { totalMin: min, totalMax: max };
  }, [optionalParts, coreTotalMin, coreTotalMax]);

  return (
    <section id="hardware" className="py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
                Physical Layer Prototype
              </span>
              <SimulatedDataBadge variant="pill" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Hardware Architecture & BOM
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8A9A92]">
            Low-Cost Student Node · Sub-₹1,700 Core Build
          </p>
        </div>

        {/* CRITICAL SAFETY CALLOUT BANNER */}
        <div className="mb-8 p-4 rounded-2xl bg-[#E5533D]/10 border border-[#E5533D]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#E5533D]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E5533D]/20 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider block font-mono">
                CRITICAL ELECTRICAL SAFETY REQUIREMENT:
              </span>
              <span className="text-white/90">
                Always verify sensor module supply rails. <strong>Never feed &gt;3.3 V into ESP32 ADC or GPIO pins.</strong> Capacitive sensor modules must be powered from the 3.3V rail or stepped down with a resistive divider to avoid permanent silicon damage.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#E5533D]/20 text-white font-mono text-[10px] uppercase font-bold shrink-0">
            3.3V Limit
          </span>
        </div>

        {/* 2-COLUMN LAYOUT: INTERACTIVE WIRING DIAGRAM & BOM TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* ========================================================= */}
          {/* COLUMN 1: INTERACTIVE SVG WIRING DIAGRAM (6 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <Cpu size={14} className="text-[#2ECC71]" />
                  <span>Interactive Node Schematic</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A9A92]">
                  Hover any wire for pin mapping
                </span>
              </div>

              {/* Wire Hover Tooltip Note */}
              <div className="h-10 mb-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono">
                {hoveredWire ? (
                  <span className="text-[#B6F36A] flex items-center gap-2">
                    <Zap size={13} className="text-[#2ECC71]" />
                    <span>{hoveredWire}</span>
                  </span>
                ) : (
                  <span className="text-[#8A9A92] italic flex items-center gap-2">
                    <HelpCircle size={13} />
                    <span>Hover over any trace or pin to view connection notes.</span>
                  </span>
                )}
              </div>

              {/* SVG Schematic Canvas */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#040C07] border border-white/10 shadow-inner p-2 flex items-center justify-center">
                <svg
                  viewBox="0 0 500 380"
                  className="w-full h-full select-none"
                  aria-label="Schematic diagram connecting ESP32 to capacitive soil sensor and DHT22"
                >
                  <defs>
                    <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Breadboard Base Grid */}
                  <rect x="10" y="10" width="480" height="360" rx="10" fill="#07170E" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  
                  {/* COMPONENT 1: ESP32 MODULE (Left) */}
                  <g transform="translate(40, 60)">
                    <rect x="0" y="0" width="130" height="250" rx="8" fill="#15261C" stroke="#2ECC71" strokeWidth="1.5" />
                    {/* Metal RF Shield */}
                    <rect x="15" y="20" width="100" height="90" rx="4" fill="#22362A" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <text x="65" y="70" fill="#E5EFE9" fontSize="11" fontFamily="Space Grotesk" fontWeight="bold" textAnchor="middle">
                      ESP32-WROOM
                    </text>
                    <text x="65" y="86" fill="#8A9A92" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                      Dual-Core Wi-Fi/BLE
                    </text>

                    {/* Antenna Trace */}
                    <path d="M 45,15 L 45,5 L 55,5 L 55,15 L 65,15 L 65,5 L 75,5 L 75,15 L 85,15" stroke="#F5B841" strokeWidth="1.5" fill="none" />

                    {/* Key Pin Headers Left */}
                    <circle cx="10" cy="140" r="4" fill="#E5533D" />
                    <text x="20" y="143" fill="#E5EFE9" fontSize="9" fontFamily="JetBrains Mono">3V3</text>

                    <circle cx="10" cy="170" r="4" fill="#000000" stroke="#8A9A92" strokeWidth="1" />
                    <text x="20" y="173" fill="#E5EFE9" fontSize="9" fontFamily="JetBrains Mono">GND</text>

                    <circle cx="10" cy="200" r="4" fill="#2ECC71" />
                    <text x="20" y="203" fill="#E5EFE9" fontSize="9" fontFamily="JetBrains Mono">GPIO34 (ADC1)</text>

                    <circle cx="10" cy="230" r="4" fill="#3498DB" />
                    <text x="20" y="233" fill="#E5EFE9" fontSize="9" fontFamily="JetBrains Mono">GPIO4 (DHT)</text>
                  </g>

                  {/* COMPONENT 2: CAPACITIVE SOIL SENSOR (Top Right) */}
                  <g transform="translate(300, 45)">
                    <rect x="0" y="0" width="160" height="110" rx="6" fill="#132319" stroke="#B6F36A" strokeWidth="1" />
                    <text x="80" y="24" fill="#B6F36A" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold" textAnchor="middle">
                      Capacitive Soil v1.2
                    </text>
                    <text x="80" y="38" fill="#8A9A92" fontSize="7.5" fontFamily="JetBrains Mono" textAnchor="middle">
                      Analog Out (ADC 1350-2850)
                    </text>

                    {/* Header Pins */}
                    <circle cx="20" cy="65" r="4" fill="#E5533D" />
                    <text x="32" y="68" fill="#E5EFE9" fontSize="8" fontFamily="JetBrains Mono">VCC (3.3V)</text>

                    <circle cx="20" cy="85" r="4" fill="#000000" stroke="#8A9A92" strokeWidth="1" />
                    <text x="32" y="88" fill="#E5EFE9" fontSize="8" fontFamily="JetBrains Mono">GND</text>

                    <circle cx="20" cy="105" r="4" fill="#2ECC71" />
                    <text x="32" y="107" fill="#E5EFE9" fontSize="8" fontFamily="JetBrains Mono">AOUT</text>

                    {/* Probe prongs illustration */}
                    <rect x="135" y="45" width="12" height="55" rx="3" fill="#09140D" stroke="#2ECC71" strokeWidth="0.75" />
                  </g>

                  {/* COMPONENT 3: DHT22 SENSOR (Bottom Right) */}
                  <g transform="translate(300, 195)">
                    <rect x="0" y="0" width="160" height="120" rx="6" fill="#132319" stroke="#3498DB" strokeWidth="1" />
                    {/* Grille */}
                    <rect x="95" y="20" width="50" height="80" rx="4" fill="#1D2F24" />
                    {[30, 45, 60, 75, 90].map((gy) => (
                      <line key={gy} x1="102" y1={gy} x2="138" y2={gy} stroke="#8A9A92" strokeWidth="1.5" />
                    ))}

                    <text x="50" y="24" fill="#3498DB" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">
                      DHT22
                    </text>
                    <text x="50" y="38" fill="#8A9A92" fontSize="7.5" fontFamily="JetBrains Mono">
                      AM2302 Dig.
                    </text>

                    {/* Pins */}
                    <circle cx="20" cy="60" r="4" fill="#E5533D" />
                    <text x="32" y="63" fill="#E5EFE9" fontSize="8" fontFamily="JetBrains Mono">1. VCC (3.3V)</text>

                    <circle cx="20" cy="80" r="4" fill="#3498DB" />
                    <text x="32" y="83" fill="#E5EFE9" fontSize="8" fontFamily="JetBrains Mono">2. DATA</text>

                    <circle cx="20" cy="100" r="4" fill="#000000" stroke="#8A9A92" strokeWidth="1" />
                    <text x="32" y="103" fill="#E5EFE9" fontSize="8" fontFamily="JetBrains Mono">4. GND</text>
                  </g>

                  {/* CONNECTING WIRES (With Hover Interactions) */}

                  {/* WIRE 1: 3.3V Red Power Rail to Soil Sensor */}
                  <path
                    d="M 50,200 L 220,200 L 220,110 L 320,110"
                    fill="none"
                    stroke={hoveredWire?.includes('3.3V') ? '#FF5555' : '#E5533D'}
                    strokeWidth={hoveredWire?.includes('3.3V') ? 4 : 2}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredWire('3.3V Rail (VCC -> 3V3): Clean regulated 3.3V supply. Never connect 5V to ESP32 ADC inputs!')}
                    onMouseLeave={() => setHoveredWire(null)}
                  />

                  {/* WIRE 2: 3.3V Branch to DHT22 */}
                  <path
                    d="M 220,200 L 220,255 L 320,255"
                    fill="none"
                    stroke={hoveredWire?.includes('3.3V') ? '#FF5555' : '#E5533D'}
                    strokeWidth={hoveredWire?.includes('3.3V') ? 4 : 2}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredWire('3.3V Rail (VCC -> 3V3): Clean regulated 3.3V supply. Never connect 5V to ESP32 ADC inputs!')}
                    onMouseLeave={() => setHoveredWire(null)}
                  />

                  {/* WIRE 3: Ground (GND) Rail Black */}
                  <path
                    d="M 50,230 L 240,230 L 240,130 L 320,130"
                    fill="none"
                    stroke={hoveredWire?.includes('GND') ? '#FFFFFF' : '#4A5B52'}
                    strokeWidth={hoveredWire?.includes('GND') ? 4 : 2}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredWire('GND Rail: Common ground reference shared across ESP32, soil probe, and DHT22.')}
                    onMouseLeave={() => setHoveredWire(null)}
                  />
                  <path
                    d="M 240,230 L 240,295 L 320,295"
                    fill="none"
                    stroke={hoveredWire?.includes('GND') ? '#FFFFFF' : '#4A5B52'}
                    strokeWidth={hoveredWire?.includes('GND') ? 4 : 2}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredWire('GND Rail: Common ground reference shared across ESP32, soil probe, and DHT22.')}
                    onMouseLeave={() => setHoveredWire(null)}
                  />

                  {/* WIRE 4: Soil Analog Out -> GPIO34 (Green) */}
                  <path
                    d="M 320,150 L 260,150 L 260,260 L 50,260"
                    fill="none"
                    stroke={hoveredWire?.includes('GPIO34') ? '#B6F36A' : '#2ECC71'}
                    strokeWidth={hoveredWire?.includes('GPIO34') ? 4 : 2.5}
                    className="cursor-pointer transition-all"
                    filter={hoveredWire?.includes('GPIO34') ? 'url(#glowGreen)' : undefined}
                    onMouseEnter={() => setHoveredWire('Soil Output -> GPIO34 (ADC1_CH6): Input-only pin. Reads raw ADC 1350-2850 via low-noise SAR ADC.')}
                    onMouseLeave={() => setHoveredWire(null)}
                  />

                  {/* WIRE 5: DHT22 DATA -> GPIO4 (Blue) */}
                  <path
                    d="M 320,275 L 270,275 L 270,290 L 50,290"
                    fill="none"
                    stroke={hoveredWire?.includes('GPIO4') ? '#5DADE2' : '#3498DB'}
                    strokeWidth={hoveredWire?.includes('GPIO4') ? 4 : 2.5}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredWire('DHT22 DATA -> GPIO4: Digital bidirectional single-wire bus with 10kΩ pull-up to 3.3V.')}
                    onMouseLeave={() => setHoveredWire(null)}
                  />
                </svg>
              </div>
            </div>

            {/* Serial Terminal Preview Callout */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8A9A92] uppercase mb-1.5">
                <Terminal size={12} className="text-[#2ECC71]" />
                <span>Example Serial CSV Output (115200 Baud):</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#040C07] border border-white/5 font-mono text-[11px] text-[#B6F36A] overflow-x-auto">
                <code>2026-10-28T12:00:00Z,2180,27.8,54.2,OK</code>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: BOM TABLE & OPTIONAL UPGRADE CHIPS (6 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <Wrench size={14} className="text-[#2ECC71]" />
                  <span>Bill of Materials (BOM in INR)</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A9A92]">
                  Indicative, not live quotes
                </span>
              </div>

              {/* Total Animated Counter Box */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#8A9A92] uppercase block">
                    Estimated Node Unit Build:
                  </span>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-white">
                    ₹{totalMin.toLocaleString()} – ₹{totalMax.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-[#8A9A92]">
                  <span className="text-[#B6F36A] font-semibold block">Target: &lt; ₹1,700</span>
                  <span>Core: ₹700–₹1,700</span>
                </div>
              </div>

              {/* Core BOM Table */}
              <div className="space-y-2 mb-5">
                <div className="text-[11px] font-mono text-[#8A9A92] uppercase font-semibold">
                  Core Mandatory Components:
                </div>
                {coreBom.map((item) => (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-[10px] text-[#8A9A92] font-sans">{item.note}</div>
                    </div>
                    <div className="text-right font-mono font-semibold text-[#B6F36A] shrink-0 pl-3">
                      ₹{item.min} – ₹{item.max}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Upgrades Checkable List */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#8A9A92] uppercase font-semibold flex items-center justify-between">
                  <span>Optional Upgrade Add-Ons:</span>
                  <span className="text-[10px] text-[#8A9A92]">Click checkbox to simulate</span>
                </div>

                {optionalBom.map((opt) => {
                  const isChecked = optionalParts[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOptional(opt.id)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-[#2ECC71]/15 border-[#2ECC71]/40 text-white'
                          : 'bg-white/[0.01] border-white/5 text-[#8A9A92] hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[#2ECC71] border-[#2ECC71] text-[#06120C]' : 'border-white/20'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className={`text-xs font-medium ${isChecked ? 'text-white' : 'text-[#8A9A92]'}`}>
                            {opt.name}
                          </div>
                          <div className="text-[10px] text-[#8A9A92] font-sans">{opt.note}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs font-semibold text-[#B6F36A] shrink-0 pl-3">
                        +₹{opt.min}–₹{opt.max}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#8A9A92]">
              Components readily available via Indian domestic electronics vendors (Robu.in, ElectronicsComp, Robocraze).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
