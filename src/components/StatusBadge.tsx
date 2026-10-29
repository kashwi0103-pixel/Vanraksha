import React from 'react';
import { ForestStatus } from '../lib/types';
import { getStatusMetadata } from '../lib/status';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ForestStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
  pulsing?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDescription = false,
  className = '',
  pulsing = true,
}) => {
  const meta = getStatusMetadata(status);

  // Status-specific icon for non-color dependent accessibility
  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    switch (meta.label) {
      case 'NORMAL MONITORING':
        return <CheckCircle2 size={iconSize} className="shrink-0" aria-hidden="true" />;
      case 'WATCH':
        return <AlertTriangle size={iconSize} className="shrink-0" aria-hidden="true" />;
      case 'FIELD CHECK RECOMMENDED':
        return <AlertOctagon size={iconSize} className="shrink-0" aria-hidden="true" />;
      case 'DATA INCOMPLETE':
      default:
        return <HelpCircle size={iconSize} className="shrink-0" aria-hidden="true" />;
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-medium',
  }[size];

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span
        role="status"
        aria-label={meta.ariaDescription}
        className={`inline-flex items-center rounded-full font-mono font-medium tracking-wide uppercase transition-all duration-300 backdrop-blur-md border ${meta.bgGlass} ${meta.borderColor} ${meta.textColor} ${sizeClasses}`}
        style={{
          boxShadow: pulsing ? `0 0 16px -2px ${meta.glowColor}` : 'none',
        }}
      >
        {/* Pulsing state beacon */}
        <span className="relative flex items-center justify-center shrink-0" aria-hidden="true">
          {pulsing && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60`}
              style={{ backgroundColor: meta.colorHex }}
            />
          )}
          <span
            className={`relative inline-flex rounded-full ${dotSizeClasses}`}
            style={{ backgroundColor: meta.colorHex }}
          />
        </span>

        {/* Accessibility Icon */}
        {renderIcon()}

        {/* Strict Status Label */}
        <span className="whitespace-nowrap">{meta.label}</span>
      </span>

      {showDescription && (
        <span className="text-[11px] text-[#8A9A92] leading-tight pl-1 font-sans">
          {meta.description}
        </span>
      )}
    </div>
  );
};
