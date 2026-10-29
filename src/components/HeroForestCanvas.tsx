import React, { useState, useEffect, useRef } from 'react';
import { Sun, CloudRain } from 'lucide-react';

interface HeroForestCanvasProps {
  weatherMode: 'sun' | 'rain';
  onToggleWeather: () => void;
}

export const HeroForestCanvas: React.FC<HeroForestCanvasProps> = ({
  weatherMode,
  onToggleWeather,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle mouse parallax damping
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxBackX = mousePos.x * 12;
  const parallaxBackY = mousePos.y * 6;
  const parallaxMidX = mousePos.x * 24;
  const parallaxMidY = mousePos.y * 10;
  const parallaxForeX = mousePos.x * 38;
  const parallaxForeY = mousePos.y * 14;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] sm:h-[600px] lg:h-[660px] overflow-hidden rounded-3xl border border-white/10 bg-[#040E08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none"
      aria-label="Interactive animated forest canopy visualization"
    >
      {/* Sky Background Gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          weatherMode === 'sun'
            ? 'bg-gradient-to-b from-[#061B12] via-[#09281A] to-[#040E08]'
            : 'bg-gradient-to-b from-[#08151D] via-[#0D1D1C] to-[#040E08]'
        }`}
      />

      {/* Sunbeam or Rain Overcast Atmosphere */}
      {weatherMode === 'sun' ? (
        <div
          className="absolute -top-10 left-1/4 w-[400px] h-[400px] bg-[#B6F36A]/15 rounded-full blur-[90px] pointer-events-none transition-opacity duration-1000 animate-pulse"
          style={{ animationDuration: '6s' }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] pointer-events-none transition-opacity duration-1000" />
      )}

      {/* Weather Mode Toggle Control (Floating Top-Right) */}
      <div className="absolute top-4 right-4 z-30">
        <button
          type="button"
          onClick={onToggleWeather}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#06120C]/80 hover:bg-[#06120C] text-xs font-mono font-medium backdrop-blur-md border border-white/15 text-[#E5EFE9] transition-all hover:border-[#2ECC71]/40 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
          aria-label={`Toggle environmental weather mode. Currently: ${weatherMode} mode.`}
        >
          {weatherMode === 'sun' ? (
            <>
              <Sun size={14} className="text-[#F5B841] animate-spin" style={{ animationDuration: '24s' }} />
              <span>Sunlit Canopy</span>
            </>
          ) : (
            <>
              <CloudRain size={14} className="text-[#2ECC71] animate-bounce" />
              <span>Monsoon Rain</span>
            </>
          )}
        </button>
      </div>

      {/* Primary SVG Scene */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          {/* Gradients for layered trees */}
          <linearGradient id="backRidgeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B271A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#040F09" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="midTreesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123B27" />
            <stop offset="60%" stopColor="#0A2417" />
            <stop offset="100%" stopColor="#040D08" />
          </linearGradient>

          <linearGradient id="foreTreesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C5338" />
            <stop offset="50%" stopColor="#103622" />
            <stop offset="100%" stopColor="#020805" />
          </linearGradient>

          {/* Satellite beam radial gradient */}
          <radialGradient id="satelliteBeamGrad" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#B6F36A" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#2ECC71" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2ECC71" stopOpacity="0" />
          </radialGradient>

          {/* Drifting mist gradient */}
          <linearGradient id="mistGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2ECC71" stopOpacity="0" />
            <stop offset="30%" stopColor="#B6F36A" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#E5EFE9" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#2ECC71" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* LAYER 1: Distant Mountain Ridges (Subtle parallax) */}
        <g style={{ transform: `translate(${parallaxBackX}px, ${parallaxBackY}px)` }}>
          <path
            d="M-50,380 Q120,280 340,330 T750,290 T1050,340 L1050,600 L-50,600 Z"
            fill="url(#backRidgeGrad)"
          />
          <path
            d="M-50,410 Q200,320 480,380 T880,340 T1050,390 L1050,600 L-50,600 Z"
            fill="#061910"
            opacity="0.75"
          />
        </g>

        {/* SATELLITE: Crosses the sky every ~8s and sweeps an active light cone */}
        <g className="satellite-track">
          {/* Animated satellite group with 8s linear infinite flight path */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="-100, 60"
              to="1100, 140"
              dur="8s"
              repeatCount="indefinite"
            />

            {/* Light Cone Sweeping Canopy */}
            <polygon
              points="0,0 -80,360 80,360"
              fill="url(#satelliteBeamGrad)"
              className="animate-pulse"
              style={{ animationDuration: '2s' }}
            />

            {/* Sweep Ground Target Reticle */}
            <ellipse
              cx="0"
              cy="360"
              rx="75"
              ry="18"
              stroke="#B6F36A"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.4"
            />

            {/* Satellite Body */}
            <circle cx="0" cy="0" r="4.5" fill="#B6F36A" />
            <circle cx="0" cy="0" r="7" stroke="#B6F36A" strokeWidth="0.8" opacity="0.6" />
            {/* Solar Wings */}
            <rect x="-14" y="-3" width="8" height="6" rx="1" fill="#E5EFE9" opacity="0.9" />
            <rect x="6" y="-3" width="8" height="6" rx="1" fill="#E5EFE9" opacity="0.9" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#06120C" strokeWidth="1" />
          </g>
        </g>

        {/* LAYER 2: Mid-distance Pine & Teak Silhouettes */}
        <g style={{ transform: `translate(${parallaxMidX}px, ${parallaxMidY}px)` }}>
          {/* Repeated procedural pine silhouettes */}
          <path
            d="
              M40,480 L60,350 L75,370 L90,320 L100,340 L115,280 L130,340 L140,320 L155,370 L170,350 L190,480 Z
              M220,500 L240,360 L255,385 L270,335 L280,355 L295,295 L310,355 L320,335 L335,385 L350,360 L370,500 Z
              M410,510 L430,370 L445,395 L460,345 L470,365 L485,305 L500,365 L510,345 L525,395 L540,370 L560,510 Z
              M620,490 L640,350 L655,375 L670,325 L680,345 L695,285 L710,345 L720,325 L735,375 L750,350 L770,490 Z
              M810,510 L830,365 L845,390 L860,340 L870,360 L885,300 L900,360 L910,340 L925,390 L940,365 L960,510 Z
            "
            fill="url(#midTreesGrad)"
          />
        </g>

        {/* DRIFTING MIST BANDS (Layer between mid and foreground) */}
        <g className="animate-pulse" style={{ animationDuration: '7s' }}>
          <rect x="-100" y="380" width="1200" height="70" fill="url(#mistGrad)">
            <animate
              attributeName="x"
              from="-300"
              to="200"
              dur="16s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="-200" y="430" width="1400" height="80" fill="url(#mistGrad)" opacity="0.6">
            <animate
              attributeName="x"
              from="100"
              to="-400"
              dur="22s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* LAYER 3: Foreground High-Detail Pines, Teak Crowns & In-Situ Sensor Node */}
        <g style={{ transform: `translate(${parallaxForeX}px, ${parallaxForeY}px)` }}>
          {/* Left heavy coniferous stand */}
          <path
            d="
              M-30,600 L-10,420 L15,445 L35,380 L50,405 L70,320 L90,405 L105,380 L125,445 L150,420 L170,600 Z
              M140,600 L160,400 L185,425 L205,360 L220,385 L240,290 L260,385 L275,360 L295,425 L320,400 L340,600 Z
            "
            fill="url(#foreTreesGrad)"
          />

          {/* Right canopy crowns (Broadleaf Teak / Oak shapes) */}
          <path
            d="
              M680,600 Q660,460 720,410 Q780,360 840,400 Q900,350 960,390 Q1020,440 1020,600 Z
              M520,600 L540,430 L565,455 L585,390 L600,415 L620,330 L640,415 L655,390 L675,455 L700,430 L720,600 Z
            "
            fill="url(#foreTreesGrad)"
          />

          {/* In-Situ Sensor Node (Ground Station Mast on tree trunk) */}
          <g transform="translate(330, 440)">
            {/* Mast Pole */}
            <rect x="0" y="0" width="3" height="90" fill="#8A9A92" opacity="0.7" />
            {/* Solar Mini Panel */}
            <polygon points="-8,-6 10,-9 12,-3 -6,0" fill="#2ECC71" stroke="#B6F36A" strokeWidth="0.8" />
            {/* Enclosure Box */}
            <rect x="-5" y="10" width="13" height="18" rx="2" fill="#0A2618" stroke="#2ECC71" strokeWidth="1" />
            {/* Blinking LoRa telemetry beacon */}
            <circle cx="1.5" cy="19" r="2" fill="#B6F36A">
              <animate
                attributeName="opacity"
                values="1;0.2;1"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Ground Soil Probe cable */}
            <path d="M1.5,28 Q10,60 4,95" stroke="#F5B841" strokeWidth="1" fill="none" opacity="0.8" />
            {/* Wave broadcast rings */}
            <circle cx="1.5" cy="19" r="8" stroke="#2ECC71" strokeWidth="0.6" fill="none" opacity="0.5">
              <animate attributeName="r" values="3;16" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>

        {/* FLOATING FIREFLIES / PARTICLES (Sun mode & Dusk ambient) */}
        {weatherMode === 'sun' && (
          <g className="fireflies">
            {[
              { cx: 180, cy: 390, dur: '3.2s', delay: '0s' },
              { cx: 280, cy: 450, dur: '4.1s', delay: '1s' },
              { cx: 420, cy: 370, dur: '2.8s', delay: '0.4s' },
              { cx: 560, cy: 430, dur: '3.6s', delay: '1.2s' },
              { cx: 720, cy: 460, dur: '4.4s', delay: '0.8s' },
              { cx: 850, cy: 410, dur: '3.0s', delay: '1.6s' },
            ].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="2.2" fill="#B6F36A" opacity="0.8">
                <animate
                  attributeName="cy"
                  values={`${p.cy};${p.cy - 20};${p.cy}`}
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.2;0.9;0.2"
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        )}

        {/* RAIN MODE: Falling Raindrops & Droplet Ripples */}
        {weatherMode === 'rain' && (
          <g className="rain-layer opacity-75">
            {[
              { x: 120, y: 100 }, { x: 220, y: 80 }, { x: 340, y: 140 }, { x: 460, y: 90 },
              { x: 580, y: 120 }, { x: 700, y: 70 }, { x: 820, y: 110 }, { x: 940, y: 130 },
              { x: 180, y: 220 }, { x: 280, y: 260 }, { x: 390, y: 240 }, { x: 510, y: 280 },
              { x: 630, y: 250 }, { x: 760, y: 230 }, { x: 880, y: 270 },
            ].map((r, i) => (
              <g key={i}>
                <line
                  x1={r.x}
                  y1={r.y}
                  x2={r.x - 6}
                  y2={r.y + 24}
                  stroke="#2ECC71"
                  strokeWidth="1.2"
                  opacity="0.6"
                >
                  <animate
                    attributeName="y1"
                    values={`${r.y};${r.y + 400}`}
                    dur="0.8s"
                    begin={`${(i % 5) * 0.15}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y2"
                    values={`${r.y + 24};${r.y + 424}`}
                    dur="0.8s"
                    begin={`${(i % 5) * 0.15}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};
