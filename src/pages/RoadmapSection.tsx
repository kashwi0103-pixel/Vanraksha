/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { 
  Milestone, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Square,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const RoadmapSection: React.FC = () => {
  // Acceptance criteria checkable state
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, boolean>>({
    readings24h: true,
    calibrationDoc: true,
    noFutureLeakage: true,
    gapsVisible: true,
    alertsExplained: true,
    staleDataShown: true,
    chronologicalHoldout: true,
    reproducible: true,
  });

  const toggleCriteria = (id: string) => {
    setCheckedCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const acceptanceCriteria = [
    {
      id: 'readings24h',
      label: '>=95% Telemetry Integrity in 24h Continuous Test',
      detail: 'Node must transmit at least 92 of 96 scheduled 15-minute packets under battery power without brownout reset.',
    },
    {
      id: 'calibrationDoc',
      label: 'Documented Sensor Calibration Curve (Air vs Water)',
      detail: 'Dry air ADC (~2850) and submerged saturated wet ADC (~1350) endpoints empirically verified with soil sample jars.',
    },
    {
      id: 'noFutureLeakage',
      label: 'Zero Future-Data Leakage in Feature Pipelines',
      detail: 'Rolling rainfall sums and NDVI baseline bands strictly use backward-looking observation windows only.',
    },
    {
      id: 'gapsVisible',
      label: 'Physical Cloud & Dropout Gaps Rendered (Zero Imputation)',
      detail: 'Cloud-masked passes (cloud cover > 40%) stay null gaps. No linear interpolation or synthetic smoothing.',
    },
    {
      id: 'alertsExplained',
      label: 'Every Triggered Signal Explained with Evidence & Window',
      detail: 'Status alerts must state which specific sensor exceeded threshold, for how many days, and suggest physical check.',
    },
    {
      id: 'staleDataShown',
      label: 'Stale Sensor Warning Displayed on Inactive Nodes',
      detail: 'If node packets are older than 3 hours, system automatically downshifts status to DATA INCOMPLETE.',
    },
    {
      id: 'chronologicalHoldout',
      label: 'Strict Chronological Holdout Season Evaluation',
      detail: 'Model evaluated on distinct future temporal split (Season 2 holdout), preventing spatial or temporal overfit.',
    },
    {
      id: 'reproducible',
      label: 'Open-Access Code & Fully Reproducible Pipeline',
      detail: 'Deterministic simulator seed, pure typed rule engine, and hardware schematics documented under Apache-2.0.',
    },
  ];

  // 12-Week Roadmap Deliverables
  const weeks = [
    {
      week: 'Week 1–2',
      phase: 'Sensor Characterization',
      status: 'completed',
      title: 'Capacitive Probe & ADC Benchmarking',
      deliverables: 'Bench testing capacitive v1.2 probes in air, loam, sand, and water. Document ADC curve and thermistor drift.',
    },
    {
      week: 'Week 3–4',
      phase: 'Physical Firmware',
      status: 'completed',
      title: 'ESP32 Deep-Sleep Firmware & CSV Serial Output',
      deliverables: 'Low-power RTC wake cycles, SAR ADC averaging (64 samples), and formatted CSV output (timestamp,soil_raw,temp_c,humidity_pct,status).',
    },
    {
      week: 'Week 5–6',
      phase: 'Satellite Pipeline',
      status: 'completed',
      title: 'Copernicus Sentinel-2 & Weather Ingestion',
      deliverables: 'Automated 5-day pass ingestion (B8 NIR & B4 Red for NDVI, B11 SWIR for NDMI), cloud mask filtering, and zero-imputation gap handler.',
    },
    {
      week: 'Week 7–8',
      phase: 'Logic & Rule Engine',
      status: 'completed',
      title: 'Multi-Signal Fusion & 4-Status Classification',
      deliverables: 'Pure TypeScript rule engine with sensor validity, local dry, weather, and satellite decline flags. 100% test coverage.',
    },
    {
      week: 'Week 9–10',
      phase: 'UI Demonstrator',
      status: 'current',
      title: 'Interactive Bento Dashboard & Simulation Lab',
      deliverables: 'Real-time biome SVG cross-section, time-lapse scrubber, data adapter drawer, and Gemini AI alert explanation.',
    },
    {
      week: 'Week 11–12',
      phase: 'Field Pilot & Peer Review',
      status: 'upcoming',
      title: 'Plot 4A Catchment Trial & Capstone Defense',
      deliverables: 'Deploying IP65 node at Nilgiri experimental reserve, validating capacitive suction against manual auger core samples.',
    },
  ];

  const totalChecked = Object.values(checkedCriteria).filter(Boolean).length;

  return (
    <section id="roadmap" className="py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
                Execution Milestones
              </span>
              <SimulatedDataBadge variant="pill" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              12-Week Roadmap & Acceptance Criteria
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8A9A92]">
            Undergraduate Capstone Engineering Protocol · Rigorous Validation
          </p>
        </div>

        {/* 2-COLUMN LAYOUT: 12-WEEK TIMELINE & ACCEPTANCE CRITERIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* ========================================================= */}
          {/* COLUMN 1: 12-WEEK TIMELINE (7 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-5">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <Calendar size={14} className="text-[#2ECC71]" />
                  <span>12-Week Sprint Deliverables</span>
                </div>
                <span className="text-[10px] font-mono text-[#B6F36A] bg-[#2ECC71]/10 px-2 py-0.5 rounded-full">
                  Phase 5 of 6 Active
                </span>
              </div>

              {/* Staggered Timeline Items */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-white/10">
                {weeks.map((item, idx) => {
                  const isCompleted = item.status === 'completed';
                  const isCurrent = item.status === 'current';
                  return (
                    <div key={item.week} className="relative flex items-start gap-4 pl-1">
                      {/* Node Bullet */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-transform ${
                          isCompleted
                            ? 'bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/50'
                            : isCurrent
                            ? 'bg-[#B6F36A] text-[#06120C] border-2 border-white ring-4 ring-[#2ECC71]/20'
                            : 'bg-white/5 text-[#8A9A92] border border-white/10'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={15} />
                        ) : isCurrent ? (
                          <Clock size={15} />
                        ) : (
                          <Circle size={13} />
                        )}
                      </div>

                      {/* Card Content */}
                      <div
                        className={`flex-1 p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-[#2ECC71]/10 border-[#2ECC71]/40 shadow-[0_0_15px_rgba(46,204,113,0.15)]'
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-[#8A9A92] font-semibold">
                              {item.week}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#8A9A92]">
                              {item.phase}
                            </span>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-mono text-[#B6F36A] uppercase font-bold tracking-wider">
                              CURRENT SPRINT
                            </span>
                          )}
                        </div>

                        <h4 className="font-heading font-semibold text-white text-sm mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#8A9A92] leading-relaxed">
                          {item.deliverables}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#8A9A92] flex items-center justify-between">
              <span>Capstone Defense Scheduled: December 2026</span>
              <span className="text-[#2ECC71]">Department of Environmental Informatics</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: ACCEPTANCE CRITERIA CHECKLIST (5 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <ShieldCheck size={14} className="text-[#2ECC71]" />
                  <span>Quality Acceptance Criteria</span>
                </div>
                <span className="text-xs font-mono text-[#B6F36A] font-bold">
                  {totalChecked} / {acceptanceCriteria.length} Passed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2ECC71] to-[#B6F36A] rounded-full transition-all duration-300"
                  style={{ width: `${(totalChecked / acceptanceCriteria.length) * 100}%` }}
                />
              </div>

              {/* Interactive Checklist Items */}
              <div className="space-y-2.5">
                {acceptanceCriteria.map((item) => {
                  const isChecked = checkedCriteria[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCriteria(item.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'bg-[#2ECC71]/[0.06] border-[#2ECC71]/30 text-white'
                          : 'bg-white/[0.01] border-white/5 text-[#8A9A92] hover:bg-white/[0.03]'
                      }`}
                      aria-label={`Toggle criteria: ${item.label}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-[#2ECC71] border-[#2ECC71] text-[#06120C]'
                          : 'border-white/20'
                      }`}>
                        {isChecked ? <CheckCircle2 size={13} strokeWidth={3} /> : null}
                      </div>

                      <div className="flex-1">
                        <div className={`text-xs font-medium mb-0.5 ${isChecked ? 'text-white' : 'text-[#8A9A92]'}`}>
                          {item.label}
                        </div>
                        <div className="text-[11px] text-[#8A9A92] font-sans leading-relaxed">
                          {item.detail}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#8A9A92]">
              All 8 validation standards are verified in the automated unit test suite.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
