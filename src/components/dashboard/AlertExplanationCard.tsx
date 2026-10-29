import React, { useState } from 'react';
import { useForest } from '../../lib/ForestContext';
import { StatusBadge } from '../StatusBadge';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Clock, Info, Sparkles } from 'lucide-react';
import { ExplainAlertModal } from '../ExplainAlertModal';

export const AlertExplanationCard: React.FC = () => {
  const { evaluation, status, currentDay } = useForest();
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const { flags, cooldownActive, daysSinceLastAlert, settingsUsed } = evaluation;

  const flagList = [
    flags.localDryFlag,
    flags.weatherFlag,
    flags.satelliteFlag,
  ];

  // Determine suggested next step based on evaluated status
  const getNextStepAdvice = () => {
    switch (status) {
      case 'FIELD CHECK RECOMMENDED':
        return {
          title: 'Verify sensor and conduct a field check',
          detail: 'Two or more independent environmental signals correlate with persistent stress. Dispatch a field forester with a hand-held core auger to check root-zone moisture at 15cm and 45cm depths in Pilot Plot 4A.',
          actionType: 'field',
        };
      case 'WATCH':
        return {
          title: 'Increase telemetry sampling rate to 5-minute intervals',
          detail: 'One stress indicator is elevated above baseline. Monitor subsequent satellite pass and verify whether neighboring micro-nodes confirm the trend.',
          actionType: 'monitor',
        };
      case 'DATA INCOMPLETE':
        return {
          title: 'Inspect physical LoRa node hardware & battery rail',
          detail: 'Telemetry packets are absent, stale, or out of calibration envelope. Confident status cannot be established until sensor link is physically verified.',
          actionType: 'hardware',
        };
      case 'NORMAL MONITORING':
      default:
        return {
          title: 'Maintain nominal 15-minute telemetry polling',
          detail: 'All biophysical variables remain in seasonal equilibrium. No field intervention or sampling rate changes warranted.',
          actionType: 'nominal',
        };
    }
  };

  const advice = getNextStepAdvice();

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider">
            <ShieldAlert size={14} className="text-[#F5B841]" aria-hidden="true" />
            <span>Multi-Signal Decision Triage</span>
          </div>

          <StatusBadge status={status} size="sm" pulsing={false} />
        </div>

        <h3 className="font-heading font-bold text-lg text-white mb-2">
          Stress Flag Analysis & Reasoning
        </h3>

        <p className="text-xs text-[#8A9A92] leading-relaxed mb-4 font-sans">
          Evaluates 3 independent telemetry vectors to prevent single-sensor false alarms. Strict protocol requires 2+ independent signals with verified data before escalating to field action.
        </p>

        {/* Cooldown active alert banner */}
        {cooldownActive && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#F5B841]/10 border border-[#F5B841]/25 flex items-center justify-between text-xs font-mono text-[#F5B841]">
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>Alert Cooldown Active ({daysSinceLastAlert}d / {settingsUsed.alertCooldownDays}d)</span>
            </span>
            <span className="text-[10px] text-[#8A9A92]">Suppresses repeat notification spam</span>
          </div>
        )}

        {/* 3 Flags Breakdown List */}
        <div className="space-y-2.5 mb-5">
          {flagList.map((flag, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition-all ${
                flag.triggered
                  ? 'bg-[#E5533D]/10 border-[#E5533D]/30'
                  : 'bg-white/[0.02] border-white/5 text-[#8A9A92]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {flag.triggered ? (
                    <AlertTriangle size={14} className="text-[#E5533D] shrink-0" />
                  ) : (
                    <CheckCircle2 size={14} className="text-[#2ECC71] shrink-0" />
                  )}
                  <span className={`font-medium ${flag.triggered ? 'text-white' : 'text-[#8A9A92]'}`}>
                    {flag.name}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    flag.triggered
                      ? 'bg-[#E5533D]/20 text-[#E5533D] font-semibold'
                      : 'bg-white/5 text-[#8A9A92]'
                  }`}
                >
                  {flag.triggered ? 'TRIGGERED' : 'CLEAR'}
                </span>
              </div>

              <p className="text-[11px] text-[#8A9A92] leading-relaxed pl-5 font-sans">
                {flag.reason}
              </p>
              <div className="text-[10px] text-[#8A9A92]/60 font-mono pl-5 mt-1">
                Window: {flag.timeWindow}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Next Step Box */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#B6F36A] mb-1">
          <ArrowRight size={13} />
          <span>Recommended Decision-Support Action:</span>
        </div>
        <div className="text-sm font-semibold text-white mb-1">
          {advice.title}
        </div>
        <p className="text-xs text-[#8A9A92] leading-relaxed mb-2 font-sans">
          {advice.detail}
        </p>
        <div className="text-[10px] text-[#8A9A92]/70 font-mono italic mb-3">
          * Human decision-support only. Automatic intervention or emergency dispatch is never executed.
        </div>

        {/* Explain this alert button */}
        <button
          type="button"
          onClick={() => setIsExplainModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-[#2ECC71]/15 hover:bg-[#2ECC71]/25 border border-[#2ECC71]/35 text-[#B6F36A] font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(46,204,113,0.15)] group"
        >
          <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
          <span>Explain this alert (Gemini AI)</span>
        </button>
      </div>

      {/* Gemini AI Alert Explanation Modal */}
      <ExplainAlertModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        status={status}
        triggeredFlags={flagList.filter((f) => f.triggered)}
        indicators={{
          soilPct: currentDay?.calibratedSoilPct ?? 28,
          soilRaw: currentDay?.soilRaw ?? 2200,
          tempC: currentDay?.tempC ?? 29,
          humidityPct: currentDay?.humidityPct ?? 48,
          rain14dMm: typeof flags.weatherFlag.metricValue === 'number' ? flags.weatherFlag.metricValue : 4.2,
          ndviAnomaly: currentDay?.ndvi !== null && currentDay?.ndvi !== undefined 
            ? Number((currentDay.ndvi - currentDay.seasonalBaseline.ndvi).toFixed(3)) 
            : null,
        }}
      />
    </div>
  );
};
