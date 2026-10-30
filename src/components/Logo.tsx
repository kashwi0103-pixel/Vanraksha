import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 36,
  showText = false 
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Leaf + Satellite-Orbit SVG Icon */}
      <div 
        className="relative flex items-center justify-center shrink-0" 
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(46,204,113,0.35)]"
        >
          {/* Orbital path tilted 35deg */}
          <ellipse
            cx="24"
            cy="24"
            rx="21"
            ry="9"
            transform="rotate(-30 24 24)"
            stroke="rgba(182, 243, 106, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Central Stylized Leaf */}
          <path
            d="M24 8C16 11 11 20 13 29C15 38 24 40 24 40C24 40 33 38 35 29C37 20 32 11 24 8Z"
            fill="url(#leafGradient)"
            stroke="#2ECC71"
            strokeWidth="1.5"
          />

          {/* Leaf Central Vein */}
          <path
            d="M24 14V36"
            stroke="#06120C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Leaf Side Veins */}
          <path
            d="M24 20L19 23M24 26L18 29M24 20L29 23M24 26L30 29"
            stroke="#06120C"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Satellite Orbiting Node on the ring */}
          <g transform="rotate(-30 24 24)">
            {/* Satellite Body & Solar Panels */}
            <circle cx="43" cy="24" r="3.5" fill="#B6F36A" />
            <circle cx="43" cy="24" r="5.5" stroke="#B6F36A" strokeWidth="0.8" opacity="0.6" />
            {/* Small solar wings */}
            <rect x="41" y="17.5" width="4" height="2" rx="0.5" fill="#E5EFE9" />
            <rect x="41" y="28.5" width="4" height="2" rx="0.5" fill="#E5EFE9" />
          </g>

          {/* Linear gradient definition for leaf */}
          <defs>
            <linearGradient id="leafGradient" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2ECC71" />
              <stop offset="0.6" stopColor="#1E824C" />
              <stop offset="1" stopColor="#104E2D" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              Vanraksha
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#2ECC71]/15 text-[#B6F36A] border border-[#2ECC71]/30">
              वनरक्षा
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#8A9A92] mt-0.5 leading-none">
            Forest Intelligence System
          </span>
        </div>
      )}
    </div>
  );
};
