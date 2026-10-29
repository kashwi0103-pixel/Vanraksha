/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { 
  Cpu, 
  Radio, 
  Sun, 
  AlertTriangle, 
  ShieldAlert, 
  Terminal, 
  Layers, 
  Wrench,
  HelpCircle,
  Zap,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface PinMapping {
  espPin: string;
  sensorPin: string;
  sensorName: string;
  type: string;
  voltage: string;
  description: string;
}

export const HardwareSection: React.FC = () => {
  // Wire highlight state
  const [hoveredWire, setHoveredWire] = useState<string | null>(null);

  // Pinout connection specifications
  const pinMappings: PinMapping[] = [
    {
      espPin: '3V3',
      sensorPin: 'VCC (Pin 1)',
      sensorName: 'Capacitive Soil & DHT22',
      type: 'Power Rail',
      voltage: '3.3V DC',
      description: 'Regulated low-noise 3.3V supply. Shared bus for both telemetry sensors.',
    },
    {
      espPin: 'GND',
      sensorPin: 'GND (Pin 2 / Pin 4)',
      sensorName: 'Capacitive Soil & DHT22',
      type: 'Common Ground',
      voltage: '0V Ref',
      description: 'Unified ground plane to prevent ground loop offsets on analog readings.',
    },
    {
      espPin: 'GPIO34',
      sensorPin: 'AOUT (Analog Out)',
      sensorName: 'Capacitive Soil v1.2',
      type: 'Analog Input (ADC1_CH6)',
      voltage: '0 – 3.0V',
      description: 'Input-only low-noise ADC channel. Reads 1350 (saturated wet) to 2850 (air-dry).',
    },
    {
      espPin: 'GPIO4',
      sensorPin: 'DATA (Pin 2)',
      sensorName: 'DHT22 / AM2302',
      type: 'Single-Bus Digital',
      voltage: '3.3V Logic',
      description: 'Bidirectional digital pulse stream with 10kΩ pull-up resistor to 3.3V rail.',
    },
  ];

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
              Hardware Architecture & Wiring
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8A9A92]">
            In-Situ Catchment Node · Low-Power ESP32-WROOM Architecture
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
                Always verify sensor module supply rails. <strong>Never feed &gt;3.3 V into ESP32 ADC or GPIO pins.</strong> Capacitive sensor modules must be powered strictly from the 3.3V rail to prevent ADC saturation and permanent silicon breakdown.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#E5533D]/20 text-white font-mono text-[10px] uppercase font-bold shrink-0">
            3.3V Rail Limit
          </span>
        </div>

        {/* 2-COLUMN LAYOUT: INTERACTIVE WIRING DIAGRAM & PIN SPECIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* ========================================================= */}
          {/* COLUMN 1: INTERACTIVE SVG WIRING DIAGRAM (7 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 glass-card p-6 border border-white/10 flex flex-col justify-between">
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
                      Dual-Core Xtensa LX6
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
                <code>timestamp,soil_raw,temp_c,humidity_pct,status</code><br />
                <code>2026-10-28T12:00:00Z,2180,27.8,54.2,OK</code>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: HARDWARE SPECIFICATIONS & PINOUT TABLE (5 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <Wrench size={14} className="text-[#2ECC71]" />
                  <span>Pin Interconnect Specifications</span>
                </div>
                <span className="text-[10px] font-mono text-[#2ECC71]">
                  Direct Wiring
                </span>
              </div>

              {/* Pin Mappings Table */}
              <div className="space-y-2.5 mb-6">
                {pinMappings.map((pin) => (
                  <div
                    key={pin.espPin}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-xs">
                          {pin.espPin}
                        </span>
                        <span className="text-white/40">&rarr;</span>
                        <span className="text-xs font-mono text-[#B6F36A] font-semibold">
                          {pin.sensorPin}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8A9A92]">
                        {pin.voltage}
                      </span>
                    </div>

                    <div className="text-xs text-white font-medium mb-0.5">
                      {pin.sensorName} <span className="text-[11px] text-[#8A9A92]">({pin.type})</span>
                    </div>

                    <p className="text-[11px] font-sans text-[#8A9A92] leading-snug">
                      {pin.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Node Architecture Features */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold block">
                  Edge Node Operating Parameters
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-[10px] text-[#8A9A92] block">Telemetry Duty:</span>
                    <span className="text-white font-bold">15 min Deep Sleep</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-[10px] text-[#8A9A92] block">Ingress Rating:</span>
                    <span className="text-white font-bold">IP65 Weatherproof</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-[10px] text-[#8A9A92] block">ADC Calibration:</span>
                    <span className="text-[#2ECC71] font-bold">1350–2850 ADC</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-[10px] text-[#8A9A92] block">Mesh Uplink:</span>
                    <span className="text-[#3498DB] font-bold">868 MHz LoRa / WiFi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#8A9A92]">
              Corrosion-resistant capacitive probe avoids DC electrolysis wear inherent in legacy resistive prongs.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
