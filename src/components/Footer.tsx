import React from 'react';
import { Logo } from './Logo';
import { NAV_SECTIONS } from '../data/navigation';
import { ALLOWED_STATUSES } from '../lib/status';
import { StatusBadge } from './StatusBadge';
import { SimulatedDataBadge } from './SimulatedDataBadge';
import { ShieldAlert, Cpu, Orbit, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#040C08] border-t border-white/10 mt-24 text-[#8A9A92]">
      {/* Upper Status Legend & Decision Support Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert size={16} className="text-[#F5B841]" aria-hidden="true" />
                <h3 className="font-heading font-semibold text-white text-sm">
                  Forest Decision Support Protocol
                </h3>
              </div>
              <p className="text-xs text-[#8A9A92] max-w-3xl leading-relaxed">
                Vanraksha (वनरक्षा) is an advanced multi-sensor forest early-warning stress intelligence platform engineered for forest divisions. 
                It provides timely decision-support for field teams, <strong className="text-white font-medium">with ground confirmation always recommended</strong> prior to operational intervention.
              </p>
            </div>
          </div>

          {/* Canonical Statuses Legend */}
          <div className="pt-5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/70 block mb-3">
              Official Decision Support Status Taxonomy:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ALLOWED_STATUSES.map((status) => (
                <div key={status} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <StatusBadge status={status} size="sm" showDescription={true} pulsing={false} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-column footer links & architecture */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand & Mission column */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Logo size={36} showText={true} />
            <p className="text-xs text-[#8A9A92] leading-relaxed max-w-sm mt-2">
              Combining open multi-spectral satellite reflectance (Copernicus Sentinel-2) with in-situ environmental mesh hardware (ESP32-S3 + LoRa 868MHz) for early forest-stress triage across Uttarakhand forest divisions.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#8A9A92]/80 mt-2">
              <span className="inline-flex items-center gap-1.5">
                <Orbit size={13} className="text-[#2ECC71]" /> Sentinel-2 L2A
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Cpu size={13} className="text-[#B6F36A]" /> ESP32 Sub-GHz Mesh
              </span>
            </div>
          </div>

          {/* Section links column */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-4">
              Platform Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {NAV_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => onNavigate(sec.id)}
                  className="text-left text-[#8A9A92] hover:text-[#B6F36A] transition-colors py-1 focus-visible:outline-none focus-visible:underline"
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Academic / Data Integrity column */}
          <div className="md:col-span-3 flex flex-col gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-2">
              Provenance & Data Integrity
            </h4>
            <p className="text-xs text-[#8A9A92] leading-relaxed">
              Derived from Sentinel-2 MSI and in-situ catchment telemetry. Gaps in satellite pass coverage or sensor packets are explicitly retained as <span className="text-[#8A9A92] font-mono">DATA INCOMPLETE</span> rather than interpolated.
            </p>
            <div className="mt-2 p-2.5 rounded-lg bg-[#2ECC71]/5 border border-[#2ECC71]/20 text-[11px] text-[#2ECC71] flex items-center gap-2">
              <Sparkles size={13} className="shrink-0" />
              <span>Uttarakhand Forest Telemetry System</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & accessibility note */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A9A92]/70 font-mono">
          <div>
            © 2026 Vanraksha (वनरक्षा) Project · Forest Intelligence Platform
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Decision-Support System</span>
            <span>·</span>
            <span>Strict Zero-Hallucination Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
