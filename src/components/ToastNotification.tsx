import React, { useState, useEffect, useRef } from 'react';
import { useForest } from '../lib/ForestContext';
import { ForestStatus } from '../lib/types';
import { getStatusMetadata } from '../lib/status';
import { Bell, X, AlertTriangle, AlertOctagon, CheckCircle2, HelpCircle } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { status, evaluation } = useForest();
  const [visible, setVisible] = useState(false);
  const [toastStatus, setToastStatus] = useState<ForestStatus>(status);
  const prevStatusRef = useRef<ForestStatus>(status);

  useEffect(() => {
    // Only fire toast when status actually shifts
    if (prevStatusRef.current !== status) {
      setToastStatus(status);
      setVisible(true);
      prevStatusRef.current = status;

      const timer = setTimeout(() => {
        setVisible(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible) return null;

  const meta = getStatusMetadata(toastStatus);

  const renderIcon = () => {
    switch (meta.label) {
      case 'NORMAL MONITORING': return <CheckCircle2 size={16} className="text-[#2ECC71]" />;
      case 'WATCH': return <AlertTriangle size={16} className="text-[#F5B841]" />;
      case 'FIELD CHECK RECOMMENDED': return <AlertOctagon size={16} className="text-[#E5533D]" />;
      case 'DATA INCOMPLETE':
      default: return <HelpCircle size={16} className="text-[#8A9A92]" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-24 right-4 sm:right-8 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div 
        className={`p-4 rounded-2xl backdrop-blur-2xl border shadow-[0_12px_40px_rgba(0,0,0,0.6)] ${meta.bgGlass} ${meta.borderColor} flex items-start gap-3 relative`}
      >
        <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
          {renderIcon()}
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#8A9A92]">
            <Bell size={11} />
            <span>Triage Status Updated</span>
          </div>
          <div className={`font-heading font-bold text-sm ${meta.textColor}`}>
            {meta.label}
          </div>
          <p className="text-xs text-[#E5EFE9]/90 mt-0.5 leading-snug font-sans">
            {evaluation.statusReason}
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-[#8A9A92] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
