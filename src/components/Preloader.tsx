/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Orbit, Radio, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('आरंभ हो रहा है · Booting Vanraksha Engine...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    const steps = [
      { at: 15, text: 'Calibrating Sentinel-2 MSI Multi-Spectral Reflectance...' },
      { at: 38, text: 'Synchronizing Uttarakhand Division LoRa Telemetry (Corbett & Nainital)...' },
      { at: 65, text: 'Computing Root-Zone Capacitance & Multi-Temporal NDRE Indices...' },
      { at: 88, text: 'Aligning Early-Warning Stress Classification Boundaries...' },
      { at: 100, text: 'Vanraksha (वनरक्षा) Intelligence Engine Online' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + Math.floor(Math.random() * 8) + 4, 100);
        
        for (const step of steps) {
          if (next >= step.at) {
            setStatusText(step.text);
          }
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              setIsMounted(false);
              onComplete?.();
            }, 600);
          }, 400);
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsMounted(false);
      onComplete?.();
    }, 300);
  };

  if (!isMounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Vanraksha Forest Intelligence System"
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040E08] text-white transition-opacity duration-600 cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting effects */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#2ECC71]/15 blur-[120px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#B6F36A]/10 blur-[80px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Animated Radar/Satellite Ring Container */}
        <div className="relative mb-6">
          {/* Subtle rotating radar beacon ring */}
          <div className="absolute -inset-4 rounded-full border border-[#2ECC71]/20 animate-spin [animation-duration:8s]" />
          <div className="absolute -inset-8 rounded-full border border-dashed border-[#B6F36A]/20 animate-spin [animation-duration:16s] [animation-direction:reverse]" />
          
          {/* Central Logo */}
          <div className="relative p-3.5 rounded-2xl bg-[#06180E] border border-[#2ECC71]/40 shadow-[0_0_40px_rgba(46,204,113,0.35)]">
            <Logo size={62} showText={false} />
          </div>
        </div>

        {/* NAMASTE IN HINDI ABOVE VANRAKSHA */}
        <div className="mb-3 flex flex-col items-center animate-pulse [animation-duration:3s]">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-[#2ECC71]/15 via-[#B6F36A]/20 to-[#2ECC71]/15 border border-[#2ECC71]/40 backdrop-blur-md shadow-[0_0_25px_rgba(46,204,113,0.25)]">
            <span className="text-xl leading-none select-none" role="img" aria-label="Folded Hands Namaste">🙏</span>
            <span className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-wide">
              नमस्ते
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8A9A92] mt-1.5 tracking-widest uppercase">
            स्वागतम् · Welcome
          </span>
        </div>

        {/* Brand Name & Devanagari Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight text-white">
            Vanraksha
          </h1>
          <span className="text-sm font-mono px-2.5 py-0.5 rounded-md bg-[#2ECC71]/20 text-[#B6F36A] border border-[#2ECC71]/40 font-semibold shadow-sm">
            वनरक्षा
          </span>
        </div>

        <p className="text-xs font-mono uppercase tracking-widest text-[#8A9A92] mb-8">
          Forest Intelligence & Early Warning · Uttarakhand
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-white/[0.06] p-1 rounded-full border border-white/10 mb-4 overflow-hidden relative backdrop-blur-md">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#2ECC71] via-[#B6F36A] to-[#2ECC71] transition-all duration-75 relative shadow-[0_0_15px_rgba(46,204,113,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Diagnostics & Loading Step Readout */}
        <div className="flex items-center justify-between w-full text-xs font-mono text-[#8A9A92] mb-3">
          <span className="flex items-center gap-1.5 text-white/90 truncate max-w-[80%] text-left">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-ping" />
            <span className="truncate">{statusText}</span>
          </span>
          <span className="text-[#B6F36A] font-bold tabular-nums">
            {progress}%
          </span>
        </div>

        {/* Footnote pill */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8A9A92]/70 mt-4">
          <span className="flex items-center gap-1">
            <Orbit size={11} className="text-[#2ECC71]" /> Sentinel-2 MSI
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Radio size={11} className="text-[#B6F36A]" /> Corbett LoRa Mesh
          </span>
          <span>·</span>
          <span className="text-[#8A9A92] hover:text-white underline transition-colors">
            Click anywhere to enter
          </span>
        </div>
      </div>
    </div>
  );
};
