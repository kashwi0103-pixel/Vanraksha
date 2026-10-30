/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileCheck } from 'lucide-react';
import { useForest } from '../lib/ForestContext';

interface SimulatedDataBadgeProps {
  className?: string;
  variant?: 'subtle' | 'pill' | 'header';
}

export const SimulatedDataBadge: React.FC<SimulatedDataBadgeProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { dataSourceMode, dataSourceInfo } = useForest();

  const isReal = dataSourceMode === 'real';

  // Per user request, do not display simulated data source badge
  if (!isReal) {
    return null;
  }

  const label = `REAL DATA: uploaded ${dataSourceInfo.sourceName}${dataSourceInfo.dateRange ? `, ${dataSourceInfo.dateRange}` : ''}`;

  if (variant === 'subtle') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase transition-colors text-[#B6F36A] ${className}`}
        aria-label={`Dataset Notice: ${label}`}
      >
        <FileCheck size={11} className="text-[#B6F36A]" aria-hidden="true" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      role="note"
      aria-label={`Dataset Notice: ${label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase backdrop-blur-sm select-none transition-all bg-[#2ECC71]/15 border border-[#2ECC71]/40 text-[#B6F36A] shadow-[0_0_10px_rgba(46,204,113,0.15)] ${className}`}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" 
        aria-hidden="true" 
      />
      <span className="text-white">{label}</span>
    </div>
  );
};
