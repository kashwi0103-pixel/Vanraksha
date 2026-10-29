/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw,
  Compass
} from 'lucide-react';
import { ForestStatus } from '../lib/types';
import { StressFlag } from '../lib/ruleEngine';

interface ExplainAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ForestStatus;
  triggeredFlags: StressFlag[];
  indicators: {
    soilPct: number;
    soilRaw: number;
    tempC: number;
    humidityPct: number;
    rain14dMm: number;
    ndviAnomaly: number | null;
  };
}

export const ExplainAlertModal: React.FC<ExplainAlertModalProps> = ({
  isOpen,
  onClose,
  status,
  triggeredFlags,
  indicators,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [explanation, setExplanation] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  // Fetch explanation when modal opens
  useEffect(() => {
    if (!isOpen) {
      setExplanation('');
      setDisplayedText('');
      setLoading(false);
      setIsTyping(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setDisplayedText('');

    const fetchExplanation = async () => {
      try {
        const res = await fetch('/api/explain-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            indicators,
            triggeredFlags,
            status,
          }),
        });

        if (!res.ok) throw new Error('Network error');
        const data = await res.json();

        if (isMounted) {
          setExplanation(data.explanation || 'No explanation returned.');
          setIsFallback(data.isFallback ?? false);
          setLoading(false);
          setIsTyping(true);
        }
      } catch {
        if (isMounted) {
          const fallback = `Sensor telemetry currently registers ${triggeredFlags.length} active flag(s) under status ${status}. Soil moisture and vapor pressure deficit have moved away from typical seasonal averages for Plot 4A. Because local topography and root depth vary widely, these automated indicators carry uncertainty and require human observation.\n\nSuggested field check: Perform an on-site soil auger moisture check at 45cm and inspect tree canopy foliage turgor.`;
          setExplanation(fallback);
          setIsFallback(true);
          setLoading(false);
          setIsTyping(true);
        }
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, status, triggeredFlags, indicators]);

  // Typing animation effect
  useEffect(() => {
    if (!isTyping || !explanation) return;

    let charIndex = 0;
    const speed = 12; // ms per character
    const interval = setInterval(() => {
      charIndex += 2;
      if (charIndex >= explanation.length) {
        setDisplayedText(explanation);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(explanation.slice(0, charIndex));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isTyping, explanation]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explain-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#06120C] border border-white/10 shadow-2xl p-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#2ECC71]/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="explain-modal-title" className="font-heading font-bold text-white text-lg">
                  AI Alert Explanation
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-[#B6F36A] border border-white/10">
                  {isFallback ? 'Deterministic Rule Brief' : 'Gemini 3.8 Flash'}
                </span>
              </div>
              <p className="text-xs text-[#8A9A92] font-mono">
                Field Team Decision Support · Ground Verification Advisory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8A9A92] hover:text-white hover:bg-white/[0.04] transition-colors"
            aria-label="Close explanation dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current State Indicator Summary Chips */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-[11px] font-mono relative z-10">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[#8A9A92] block">Current Status</span>
            <span className="font-semibold text-white">{status}</span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[#8A9A92] block">Soil Moisture</span>
            <span className="font-semibold text-[#B6F36A]">{indicators.soilPct}%</span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[#8A9A92] block">Active Flags</span>
            <span className="font-semibold text-white">{triggeredFlags.length} Triggered</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 min-h-[140px]">
          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-3 py-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-10 bg-white/5 rounded-xl mt-4 border border-white/5" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Explanation Text */}
              <div className="text-xs sm:text-sm text-[#E5EFE9] leading-relaxed whitespace-pre-line font-sans p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-1.5 h-3.5 bg-[#2ECC71] ml-1 animate-pulse align-middle" />
                )}
              </div>

              {/* Strict Scope Compliance Badge */}
              <div className="p-3 rounded-xl bg-[#2ECC71]/[0.05] border border-[#2ECC71]/20 flex items-start gap-2.5 text-xs text-[#8A9A92]">
                <ShieldCheck size={16} className="text-[#2ECC71] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong className="text-white font-medium">Decision Support Policy:</strong> All model statements reflect sensor correlation, not automated fire prediction. Site inspection by human forestry personnel is required.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#8A9A92] relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <Compass size={13} className="text-[#B6F36A]" />
            <span>Pilot Plot 4A · Nilgiri Pilot</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors text-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
