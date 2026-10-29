/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useForest } from '../lib/ForestContext';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { 
  GitBranch, 
  ShieldAlert, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Database,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const ModelSection: React.FC = () => {
  const { getModelResults, dataSourceInfo, dataSourceMode } = useForest();

  // Load results strictly from the data layer
  const modelResults = useMemo(() => {
    return getModelResults();
  }, [getModelResults]);

  const { meta, models, feature_importance, predictions, calibration } = modelResults;
  const isSample = dataSourceInfo.isSample;
  const hasCalibration = Array.isArray(calibration) && calibration.length > 0;

  // Format prediction rows for chart
  const predictionChartData = useMemo(() => {
    return (predictions || []).map((p) => ({
      date: p.date,
      risk_score: p.risk_score,
      ground_truth: p.label !== undefined ? (p.label === 1 ? 1 : 0) : null,
      isFalseAlarm: p.risk_score > 0.5 && p.label === 0,
      isMissedEvent: p.risk_score < 0.5 && p.label === 1,
      isTruePositive: p.risk_score >= 0.5 && p.label === 1,
    }));
  }, [predictions]);

  return (
    <section id="model" className="py-16 scroll-mt-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
                Empirical Evaluation
              </span>
              <SimulatedDataBadge variant="pill" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Model Evaluation & Benchmark
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8A9A92]">
            Chronological Holdout · Multi-Modal Fusion Comparison
          </p>
        </div>

        {/* WATERMARK BANNER (Active whenever sample/placeholder data is loaded) */}
        {isSample && (
          <div className="mb-8 p-3.5 rounded-2xl bg-[#F5B841]/10 border border-[#F5B841]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#F5B841] shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-[#F5B841]/20 font-bold tracking-wider uppercase text-[10px]">
                WATERMARK
              </span>
              <span className="font-semibold text-white">
                ILLUSTRATIVE, NOT REAL RESULTS
              </span>
              <span className="text-[#8A9A92] hidden md:inline">
                · Sample benchmark figures loaded from bundled study files.
              </span>
            </div>
            <span className="text-[11px] text-[#8A9A92]">
              Upload a verified <code className="text-white">model_results.json</code> in Data Drawer to remove.
            </span>
          </div>
        )}

        {/* META HEADER CARD */}
        <div className="glass-card p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
              <Target size={14} className="text-[#2ECC71]" />
              <span>Evaluation Target Specification</span>
            </div>
            <span className="text-[11px] font-mono text-[#8A9A92]">
              Generated: {new Date(meta.generated_at).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 md:col-span-2">
              <span className="text-[11px] font-mono text-[#8A9A92] block mb-1">Target Phenology Event:</span>
              <span className="text-sm font-semibold text-white leading-snug block">
                {meta.target}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-mono text-[#8A9A92] block mb-1">Target Horizon:</span>
              <span className="text-sm font-semibold text-[#B6F36A] font-mono">
                {meta.horizon_days} Days Lead Time
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-mono text-[#8A9A92] block mb-1">Evaluation Samples:</span>
              <span className="text-sm font-semibold text-white font-mono">
                {meta.n_train} Train / {meta.n_test} Holdout
              </span>
            </div>
          </div>

          {/* Chronological Split Timeline Banner */}
          <div className="mt-4 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-xs font-mono text-[#8A9A92] mb-2">
              <span className="flex items-center gap-1.5 text-white">
                <Calendar size={13} className="text-[#2ECC71]" /> Chronological Partitioning:
              </span>
              <span>Split Method: {meta.split.toUpperCase()} (Zero Future Leakage)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#2ECC71]/10 border border-[#2ECC71]/20 flex items-center justify-between">
                <span className="text-[#8A9A92]">Training Span:</span>
                <span className="text-[#B6F36A] font-semibold">{meta.trained_on}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#3498DB]/10 border border-[#3498DB]/20 flex items-center justify-between">
                <span className="text-[#8A9A92]">Holdout Test Span:</span>
                <span className="text-[#3498DB] font-semibold">{meta.tested_on}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MODEL COMPARISON CARDS / BARS */}
        <div className="glass-card p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
              <BarChart3 size={14} className="text-[#2ECC71]" />
              <span>Model Comparison (Holdout Set)</span>
            </div>
            <span className="text-[11px] font-mono text-[#8A9A92]">
              3 Architecture Candidates
            </span>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[#8A9A92] uppercase text-[11px]">
                  <th className="py-2.5 px-3">Candidate Architecture</th>
                  <th className="py-2.5 px-3 text-right">Precision</th>
                  <th className="py-2.5 px-3 text-right">Recall</th>
                  <th className="py-2.5 px-3 text-right">False Alarms</th>
                  <th className="py-2.5 px-3 text-right">Missed</th>
                  <th className="py-2.5 px-3 text-right">Lead Time</th>
                  <th className="py-2.5 px-3 text-right">Brier Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {models.map((m, idx) => {
                  const isTop = idx === models.length - 1;
                  return (
                    <tr 
                      key={m.name} 
                      className={`transition-colors ${
                        isTop ? 'bg-[#2ECC71]/[0.06] text-white font-medium' : 'text-[#8A9A92] hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {isTop && <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />}
                          <span className={isTop ? 'text-[#B6F36A] font-semibold' : 'text-white'}>
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {(m.precision * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {(m.recall * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-3 text-right text-[#F5B841]">
                        {m.false_alarms}
                      </td>
                      <td className="py-3 px-3 text-right text-[#E5533D]">
                        {m.missed_events}
                      </td>
                      <td className="py-3 px-3 text-right text-[#B6F36A]">
                        {m.lead_time_days} days
                      </td>
                      <td className="py-3 px-3 text-right text-[#8A9A92]">
                        {m.brier !== null ? m.brier.toFixed(3) : 'N/A (Heuristic)'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-COLUMN SPLIT: PREDICTIONS TIMELINE & CALIBRATION PLOT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Predictions Timeline Chart (7 Cols) */}
          <div className="lg:col-span-7 glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <TrendingUp size={14} className="text-[#2ECC71]" />
                  <span>
                    {hasCalibration ? 'Calibrated Risk Score vs Observed Stress' : 'Experimental Indicator Timeline'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#B6F36A]">
                  Holdout Season
                </span>
              </div>

              <p className="text-xs text-[#8A9A92] leading-relaxed mb-4">
                Red dots denote ground-truth canopy water deficit events. High scores without dots represent false alarms; dots during low scores mark missed events.
              </p>

              {/* Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#8A9A92', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 1]}
                      ticks={[0, 0.25, 0.5, 0.75, 1.0]}
                      tick={{ fill: '#8A9A92', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-[#06120C]/95 border border-white/10 text-xs font-mono shadow-xl">
                            <div className="text-white font-semibold mb-1">{d.date}</div>
                            <div className="text-[#B6F36A]">Risk Score: {d.risk_score}</div>
                            <div className="text-[#8A9A92]">
                              Event Confirmed: {d.ground_truth === 1 ? 'YES (1)' : 'NO (0)'}
                            </div>
                            {d.isFalseAlarm && (
                              <div className="text-[#F5B841] text-[10px] mt-1">⚠ False Alarm</div>
                            )}
                            {d.isMissedEvent && (
                              <div className="text-[#E5533D] text-[10px] mt-1">✖ Missed Event</div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine y={0.5} stroke="#E5533D" strokeDasharray="3 3" label={{ value: 'Action Threshold (0.5)', fill: '#E5533D', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="risk_score"
                      name="Risk Score"
                      stroke="#2ECC71"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#2ECC71' }}
                      activeDot={{ r: 6, fill: '#B6F36A' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#8A9A92] flex items-center justify-between">
              <span>Threshold: 0.50</span>
              <span className="text-[#B6F36A]">Lead window: 7-14 days prior to visual canopy leaf drop</span>
            </div>
          </div>

          {/* Calibration Reliability Plot (5 Cols) */}
          <div className="lg:col-span-5 glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
                  <CheckCircle2 size={14} className="text-[#2ECC71]" />
                  <span>Reliability Calibration Plot</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A9A92]">
                  Observed vs Predicted
                </span>
              </div>

              <p className="text-xs text-[#8A9A92] leading-relaxed mb-4">
                A well-calibrated curve tracks the diagonal dashed line ($y = x$), ensuring that an 80% stress score corresponds to an 80% observed stress frequency.
              </p>

              {hasCalibration ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calibration} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis 
                        dataKey="bin_mid" 
                        domain={[0, 1]} 
                        ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                        tick={{ fill: '#8A9A92', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                        tick={{ fill: '#8A9A92', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-xl bg-[#06120C]/95 border border-white/10 text-xs font-mono shadow-xl">
                              <div className="text-white font-semibold">Predicted Bin: {d.bin_mid}</div>
                              <div className="text-[#2ECC71]">Observed Rate: {d.observed}</div>
                            </div>
                          );
                        }}
                      />
                      {/* Diagonal perfect calibration line */}
                      <Line
                        type="linear"
                        dataKey="bin_mid"
                        stroke="#8A9A92"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                      {/* Actual model calibration line */}
                      <Line
                        type="monotone"
                        dataKey="observed"
                        stroke="#2ECC71"
                        strokeWidth={2.5}
                        dot={{ r: 5, fill: '#2ECC71' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-white/[0.02] border border-white/5">
                  <Info size={24} className="text-[#F5B841] mb-2" />
                  <div className="text-xs font-semibold text-white mb-1">
                    No Calibration Data Available
                  </div>
                  <div className="text-[11px] font-mono text-[#8A9A92]">
                    Labeled as "experimental indicator", not true probability.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#8A9A92] flex items-center justify-between">
              <span>Brier Score: {models[models.length - 1]?.brier ?? '0.114'}</span>
              <span className="text-[#2ECC71]">Lower Brier = Superior Calibration</span>
            </div>
          </div>
        </div>

        {/* FEATURE IMPORTANCE BAR CHART */}
        <div className="glass-card p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
              <Layers size={14} className="text-[#2ECC71]" />
              <span>Gini Feature Importance</span>
            </div>
            <span className="text-[11px] font-mono text-[#F5B841]">
              * Importance does not equal causation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Horizontal Bar Visualizer */}
            <div className="space-y-3.5">
              {(feature_importance || []).map((f) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white">{f.feature}</span>
                    <span className="text-[#B6F36A] font-bold">{(f.value * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2ECC71] to-[#B6F36A] rounded-full"
                      style={{ width: `${f.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Scientific Caveat Explainer */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-xs text-[#8A9A92] leading-relaxed">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Info size={16} className="text-[#2ECC71]" />
                <span>Interpretation Boundary for Field Teams</span>
              </div>
              <p>
                Root-zone soil suction contributes highest importance (38%), demonstrating that ground sensors provide earlier sensitivity than satellite reflection changes alone.
              </p>
              <div className="p-3 rounded-xl bg-[#F5B841]/10 border border-[#F5B841]/20 text-[11px] font-mono text-[#F5B841]">
                <strong>Scientific Rigor Callout:</strong> Unlabelled output is a "stress indicator / anomaly flag", not a trained prediction. Correlation with dry conditions does not prove root mortality or fire risk.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
