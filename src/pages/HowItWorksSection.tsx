import React, { useState } from 'react';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { PipelineDrawer, PipelineStep } from '../components/PipelineDrawer';
import { 
  Radio, 
  FileSpreadsheet, 
  CheckCircle2, 
  Orbit, 
  Layers, 
  Cpu, 
  LayoutDashboard,
  ArrowRight,
  Database,
  Sparkles,
  Info
} from 'lucide-react';

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'esp32-sensors',
    number: 1,
    title: 'ESP32 In-Situ Sensors',
    shortDesc: 'Solar-powered dual-depth capacitive probe & BME280',
    tag: 'Hardware Layer',
    iconName: 'Radio',
    whatItDoes: 'Collects soil moisture capacitance at root depth (15cm and 45cm), ambient temperature, and relative humidity. Microcontroller wakes every 15 minutes via RTC timer, performs 10-sample ADC oversampling, and powers down to 10µA deep sleep.',
    exampleOutput: `{
  "node_id": "FG_PILOT_04A",
  "battery_v": 3.86,
  "adc_raw_15cm": 2180,
  "adc_raw_45cm": 1890,
  "ambient_temp_c": 24.6,
  "ambient_humidity_pct": 53,
  "uptime_sec": 4.12
}`,
    outputFormat: 'json',
    caveat: 'Soil salinity and temperature fluctuations cause dielectric drift in low-cost capacitive probes. Temperature compensation coefficients and soil-specific gravimetric calibration must be applied.',
  },
  {
    id: 'readings-csv',
    number: 2,
    title: 'Raw Readings (CSV)',
    shortDesc: 'Deterministic Sub-GHz telemetry packet logging',
    tag: 'Telemetry Transport',
    iconName: 'FileSpreadsheet',
    whatItDoes: 'Transmits uncompressed payload over LoRa 868MHz (SF7, BW 125kHz) to local watershed gateway. Gateway appends CRC verification, calculates RSSI link budget, and logs timestamped records directly to a sequential CSV ledger.',
    exampleOutput: `timestamp,node_id,soil_raw,temp_c,humidity_pct,v_bat,rssi_dbm,status
2026-10-28T11:00:00Z,FG_PILOT_04A,2180,24.6,53,3.86,-92,OK
2026-10-28T11:15:00Z,FG_PILOT_04A,2185,24.8,51,3.86,-93,OK
2026-10-28T11:30:00Z,FG_PILOT_04A,2190,25.1,49,3.85,-91,OK`,
    outputFormat: 'csv',
    caveat: 'Sub-GHz radio links can suffer packet loss through wet pine needles during heavy rainfall. Gateway does not invent dropped packets; dropouts remain empty rows in the log.',
  },
  {
    id: 'cleaning-validation',
    number: 3,
    title: 'Cleaning & Electrical Range Checking',
    shortDesc: 'Hardware rail sanity & gap tagging',
    tag: 'Data Quality Gate',
    iconName: 'CheckCircle2',
    whatItDoes: 'Validates electrical bounds (900 <= ADC <= 3400). If ADC reads rail voltage (4095) from disconnected wiring or packet latency exceeds 6 hours, immediately flags sensorStatus as ERROR or STALE. Suppresses all confident downstream alert status.',
    exampleOutput: `{
  "timestamp": "2026-10-28T11:30:00Z",
  "is_valid": true,
  "adc_sanitized": 2190,
  "calibrated_soil_pct": 46.8,
  "sensor_health": "OK",
  "data_gap_flag": false
}`,
    outputFormat: 'json',
    caveat: 'Strict Zero-Imputation Rule: Missing packets or electrical rail faults are strictly tagged as DATA INCOMPLETE. The system never applies smoothing or artificial interpolation over missing values.',
  },
  {
    id: 'sentinel2-alignment',
    number: 4,
    title: 'Sentinel-2 + Weather Alignment',
    shortDesc: 'Temporal sync with Copernicus 5-day passes',
    tag: 'Remote Sensing Fusion',
    iconName: 'Orbit',
    whatItDoes: 'Matches ground telemetry timestamps against Copernicus Sentinel-2 Level-2A bottom-of-atmosphere passes (B8 NIR, B4 Red, B8A narrow NIR, B11 SWIR). Clouds (>35%) trigger automatic cloud masking and preserve null observation gaps.',
    exampleOutput: `{
  "pass_id": "S2A_MSIL2A_20261028_T10SEG",
  "pass_timestamp": "2026-10-28T10:48:21Z",
  "cloud_cover_pct": 14.2,
  "ndvi_10m": 0.672,
  "ndmi_20m": 0.318,
  "prior_7d_rainfall_mm": 2.2,
  "clear_pass_verified": true
}`,
    outputFormat: 'json',
    caveat: 'Cloud cover during monsoon or high mountain fog occludes optical reflectance. The pipeline rejects passes with cloud cover >35% and marks the satellite dimension as held rather than fabricated.',
  },
  {
    id: 'feature-table',
    number: 5,
    title: 'Feature Table Synthesis',
    shortDesc: 'Derived biophysical stress vectors',
    tag: 'Feature Engineering',
    iconName: 'Layers',
    whatItDoes: 'Combines ground soil matric tension with atmospheric Vapor Pressure Deficit (VPD) and canopy water index (NDWI). Computes deviation vectors against the 90-day seasonal baseline to isolate true anomalies from expected seasonal drying.',
    exampleOutput: `{
  "soil_matric_tension_kpa": 44.5,
  "vpd_kpa": 1.85,
  "temp_delta_vs_baseline_c": +1.2,
  "ndvi_delta_vs_baseline": -0.04,
  "consecutive_dry_days": 8,
  "soil_moisture_trend_7d": "descending"
}`,
    outputFormat: 'json',
    caveat: 'Soil matric suction is non-linear; in rocky loam, roots experience water stress at higher volumetric percentages than in sandy soils. Soil retention curve lookup is necessary.',
  },
  {
    id: 'rule-baseline-ml',
    number: 6,
    title: 'Rule-Based Baseline & ML Sandbox',
    shortDesc: 'Deterministic threshold classification & prototype tree',
    tag: 'Inference Engine',
    iconName: 'Cpu',
    whatItDoes: 'Executes the deterministic decision boundary: 0 flags = NORMAL MONITORING, 1 flag = WATCH, 2+ flags with valid data = FIELD CHECK RECOMMENDED. Computes the transparent Forest Health Index (0-100) with weighted subscores.',
    exampleOutput: `{
  "evaluation_date": "2026-10-28",
  "flags_triggered": ["Local Soil Moisture Stress"],
  "independent_flag_count": 1,
  "evaluated_status": "WATCH",
  "forest_health_index": 72,
  "fhi_label": "Preliminary, not validated"
}`,
    outputFormat: 'json',
    caveat: 'Academic design pattern, not an operational wildfire predictor. Thresholds are calibrated for student demonstration and must be validated through multi-year local field trials before operational reliance.',
  },
  {
    id: 'dashboard-delivery',
    number: 7,
    title: 'Decision Support Dashboard',
    shortDesc: 'Early warning triage & ground inspection briefing',
    tag: 'Field Operations',
    iconName: 'LayoutDashboard',
    whatItDoes: 'Presents verified status badges, time-series telemetry charts, and zone maps directly to watershed field teams. Provides actionable inspection prompts with observation dates and data sources clearly cited.',
    exampleOutput: `STATUS: FIELD CHECK RECOMMENDED
TARGET ZONE: Pilot Plot 4A (Conifer Ridge)
PRIMARY ANOMALY: Consecutive 15-day root moisture deficit (<22%) correlated with 0.18 NDWI drop.
RECOMMENDED ACTION: Dispatch ground scout with portable time-domain reflectometer to verify rooting depth.`,
    outputFormat: 'text',
    caveat: 'Ground verification is always required. The demonstrator facilitates prioritized scouting routes but never replaces physical tree health surveys.',
  },
];

export const HowItWorksSection: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<PipelineStep | null>(null);

  const getStepIcon = (name: string) => {
    switch (name) {
      case 'Radio': return <Radio size={18} />;
      case 'FileSpreadsheet': return <FileSpreadsheet size={18} />;
      case 'CheckCircle2': return <CheckCircle2 size={18} />;
      case 'Orbit': return <Orbit size={18} />;
      case 'Layers': return <Layers size={18} />;
      case 'Cpu': return <Cpu size={18} />;
      case 'LayoutDashboard': return <LayoutDashboard size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <section id="how-it-works" className="py-20 scroll-mt-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
                End-to-End Processing Flow
              </span>
              <SimulatedDataBadge variant="pill" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
              How the Demonstrator Works
            </h2>
          </div>
          <div className="text-xs font-mono text-[#8A9A92] flex items-center gap-2">
            <Database size={13} className="text-[#2ECC71]" />
            <span>Telemetry Pipeline · Click any node for inspection</span>
          </div>
        </div>

        {/* Interactive Animated Pipeline Flow Diagram */}
        <div className="relative mb-16">
          {/* Instructions Kicker */}
          <div className="flex items-center justify-between text-xs font-mono text-[#8A9A92] mb-6 px-1">
            <span className="flex items-center gap-1.5 text-white">
              <Sparkles size={13} className="text-[#B6F36A]" />
              Interactive Data Pipeline (7 Stages)
            </span>
            <span className="text-[#8A9A92] hidden sm:inline">
              Click any node to view payload schemas & caveats
            </span>
          </div>

          {/* Pipeline Nodes Strip / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 relative">
            {PIPELINE_STEPS.map((step, index) => {
              const isSelected = selectedStep?.id === step.id;
              const isLast = index === PIPELINE_STEPS.length - 1;

              return (
                <div key={step.id} className="relative group">
                  {/* Node Glass Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedStep(step)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex flex-col justify-between h-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] border ${
                      isSelected
                        ? 'bg-[#2ECC71]/15 border-[#2ECC71] shadow-[0_0_24px_rgba(46,204,113,0.3)]'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-[#2ECC71]/40'
                    }`}
                  >
                    {/* Top Step Number & Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-mono font-bold text-[#B6F36A] flex items-center justify-center">
                        {step.number}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#8A9A92] tracking-wider truncate">
                        {step.tag}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="mb-4">
                      <div className="text-[#2ECC71] mb-2 group-hover:scale-110 transition-transform duration-200">
                        {getStepIcon(step.iconName)}
                      </div>
                      <h3 className="font-heading font-semibold text-white text-sm leading-snug mb-1">
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-[#8A9A92] leading-tight line-clamp-2">
                        {step.shortDesc}
                      </p>
                    </div>

                    {/* Click prompt footer */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#2ECC71]">
                      <span>Inspect</span>
                      <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Flow Connector Arrow with Animated Pulsing Data Packet (Desktop) */}
                  {!isLast && (
                    <div 
                      className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
                      aria-hidden="true"
                    >
                      <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                        <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                        <circle cx="10" cy="10" r="2.5" fill="#B6F36A">
                          <animate
                            attributeName="cx"
                            values="0;22"
                            dur="2s"
                            begin={`${index * 0.3}s`}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.2;1;0.2"
                            dur="2s"
                            begin={`${index * 0.3}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Informational Architecture Summary Card */}
        <div className="glass-card p-6 sm:p-8 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20 shrink-0">
                <Orbit size={20} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-white text-sm mb-1">
                  1. Dual-Modal Fusion
                </h4>
                <p className="text-xs text-[#8A9A92] leading-relaxed">
                  Bridges coarse 10m satellite passes with root-zone moisture telemetry. Where satellites only see crown reflectance, local probes confirm water matric suction at 45cm soil depth.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#F5B841]/10 text-[#F5B841] border border-[#F5B841]/20 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-white text-sm mb-1">
                  2. Auditable Decision Rules
                </h4>
                <p className="text-xs text-[#8A9A92] leading-relaxed">
                  Transparent thresholds instead of opaque deep learning. Ground foresters can verify every triggered flag: consecutive dry days, temperature delta, and Sentinel-2 vegetation index decline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#B6F36A]/10 text-[#B6F36A] border border-[#B6F36A]/20 shrink-0">
                <Info size={20} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-white text-sm mb-1">
                  3. Non-Predictive Ethics
                </h4>
                <p className="text-xs text-[#8A9A92] leading-relaxed">
                  Explicitly bound to early stress triage. The system never generates unvalidated wildfire or mortality forecasts, preserving strict decision-support integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer for Node Details (What it does, Example output, One caveat) */}
      <PipelineDrawer
        step={selectedStep}
        onClose={() => setSelectedStep(null)}
      />
    </section>
  );
};
