import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Code, ShieldAlert, Sparkles, Layers } from 'lucide-react';

export interface PipelineStep {
  id: string;
  number: number;
  title: string;
  shortDesc: string;
  tag: string;
  iconName: string;
  whatItDoes: string;
  exampleOutput: string;
  outputFormat: 'json' | 'csv' | 'text';
  caveat: string;
}

interface PipelineDrawerProps {
  step: PipelineStep | null;
  onClose: () => void;
}

export const PipelineDrawer: React.FC<PipelineDrawerProps> = ({ step, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (step) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [step, onClose]);

  if (!step) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-[#06140D] border-l border-white/15 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#2ECC71]/15 text-[#B6F36A] border border-[#2ECC71]/30 flex items-center justify-center font-mono font-bold text-sm">
                0{step.number}
              </span>
              <div>
                <span className="text-[10px] font-mono text-[#8A9A92] uppercase tracking-wider block">
                  Pipeline Stage {step.number} of 7
                </span>
                <h3 id="drawer-title" className="font-heading font-bold text-xl text-white">
                  {step.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A9A92] hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
              aria-label="Close pipeline details drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section 1: What It Does */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2ECC71] mb-2">
              <Sparkles size={14} />
              <span>What It Does</span>
            </div>
            <p className="text-sm text-[#E5EFE9] leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
              {step.whatItDoes}
            </p>
          </div>

          {/* Section 2: Example Output */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-2 text-xs font-mono uppercase tracking-wider text-[#B6F36A] mb-2">
              <span className="flex items-center gap-1.5">
                <Code size={14} />
                <span>Example Output Payload</span>
              </span>
              <span className="text-[10px] text-[#8A9A92] lowercase">
                format: {step.outputFormat}
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-[#030906] border border-white/10 text-xs font-mono text-[#B6F36A] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {step.exampleOutput}
            </pre>
          </div>

          {/* Section 3: One Caveat */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F5B841] mb-2">
              <AlertCircle size={14} />
              <span>One Real-World Caveat</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5B841]/10 border border-[#F5B841]/25 text-xs text-[#E5EFE9] leading-relaxed">
              <strong className="text-[#F5B841] block mb-1 font-semibold">Physical Boundary Constraint:</strong>
              {step.caveat}
            </div>
          </div>
        </div>

        {/* Bottom Drawer Disclaimer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#8A9A92]">
          <span>Demonstrator Architecture Spec</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
