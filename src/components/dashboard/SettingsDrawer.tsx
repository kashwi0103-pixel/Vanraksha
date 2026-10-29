import React, { useEffect } from 'react';
import { useForest } from '../../lib/ForestContext';
import { X, Sliders, Info, RotateCcw, Check, Sparkles } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useForest();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#06140D] border-l border-white/15 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2ECC71]/15 text-[#B6F36A] border border-[#2ECC71]/30">
                <Sliders size={18} />
              </div>
              <div>
                <h3 id="settings-drawer-title" className="font-heading font-bold text-lg text-white">
                  Rule Engine Thresholds
                </h3>
                <span className="text-[10px] font-mono text-[#8A9A92] uppercase">
                  Decision Support Configuration
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A9A92] hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
              aria-label="Close thresholds settings drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mandatory Label Box */}
          <div className="mb-6 p-3.5 rounded-xl bg-[#F5B841]/10 border border-[#F5B841]/25 text-xs text-[#E5EFE9]">
            <div className="flex items-center gap-2 text-[#F5B841] font-semibold mb-1">
              <Info size={14} className="shrink-0" />
              <span>Academic Notice</span>
            </div>
            <p className="leading-relaxed font-sans text-[#8A9A92]">
              Configured thresholds are a <strong className="text-white font-medium">{settings.settingsDisclaimer}</strong>. They must be empirically tuned against local soil core samples and canopy moisture regimes.
            </p>
          </div>

          {/* Threshold Sliders Form */}
          <div className="space-y-4 font-sans text-xs">
            {/* Slider 1: Soil Moisture Threshold */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-white">1. Soil Moisture Stress Cutoff</span>
                <span className="font-mono text-[#2ECC71] font-bold text-sm">
                  {settings.soilMoistureThresholdPct}%
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="32"
                step="1"
                value={settings.soilMoistureThresholdPct}
                onChange={(e) => updateSettings({ soilMoistureThresholdPct: Number(e.target.value) })}
                className="w-full accent-[#2ECC71] cursor-pointer"
              />
              <span className="text-[10px] text-[#8A9A92] block mt-1">
                Calibrated volumetric moisture threshold triggering Local Dry Flag.
              </span>
            </div>

            {/* Slider 2: Consecutive Readings Count */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-white">2. Consecutive Readings Required</span>
                <span className="font-mono text-[#2ECC71] font-bold text-sm">
                  {settings.soilConsecutiveCount} days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={settings.soilConsecutiveCount}
                onChange={(e) => updateSettings({ soilConsecutiveCount: Number(e.target.value) })}
                className="w-full accent-[#2ECC71] cursor-pointer"
              />
              <span className="text-[10px] text-[#8A9A92] block mt-1">
                Filters transient soil fluctuations by requiring sustained deficit.
              </span>
            </div>

            {/* Slider 3: Temperature Delta Above Baseline */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-white">3. Temp Delta Above Seasonal Baseline</span>
                <span className="font-mono text-[#F5B841] font-bold text-sm">
                  +{settings.tempBaselineDeltaThresholdC}°C
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="7.0"
                step="0.5"
                value={settings.tempBaselineDeltaThresholdC}
                onChange={(e) => updateSettings({ tempBaselineDeltaThresholdC: Number(e.target.value) })}
                className="w-full accent-[#F5B841] cursor-pointer"
              />
              <span className="text-[10px] text-[#8A9A92] block mt-1">
                Thermal anomaly required to trigger Weather Stress Flag.
              </span>
            </div>

            {/* Slider 4: Cumulative Rainfall Dry Limit */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-white">4. Max Cumulative Rainfall (Dry Spell)</span>
                <span className="font-mono text-[#2ECC71] font-bold text-sm">
                  {settings.rainfallMaxCumulativeDryMm} mm
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={settings.rainfallMaxCumulativeDryMm}
                onChange={(e) => updateSettings({ rainfallMaxCumulativeDryMm: Number(e.target.value) })}
                className="w-full accent-[#2ECC71] cursor-pointer"
              />
              <span className="text-[10px] text-[#8A9A92] block mt-1">
                7-day rolling rainfall total considered insufficient for root recharge.
              </span>
            </div>

            {/* Slider 5: Alert Cooldown */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-white">5. Alert Cooldown Period</span>
                <span className="font-mono text-[#8A9A92] font-bold text-sm">
                  {settings.alertCooldownDays} days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={settings.alertCooldownDays}
                onChange={(e) => updateSettings({ alertCooldownDays: Number(e.target.value) })}
                className="w-full accent-[#8A9A92] cursor-pointer"
              />
              <span className="text-[10px] text-[#8A9A92] block mt-1">
                Suppresses repetitive alert re-triggering during ongoing events.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetSettings}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#8A9A92] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2ECC71] text-[#06120C] font-semibold text-xs hover:bg-[#B6F36A] transition-colors flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Apply Thresholds</span>
          </button>
        </div>
      </div>
    </div>
  );
};
