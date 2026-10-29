import React, { useState } from 'react';
import { useForest } from '../../lib/ForestContext';
import { ForestStatus } from '../../lib/types';
import { StatusBadge } from '../StatusBadge';
import { Map, Radio, Info, Layers, Eye, ShieldAlert } from 'lucide-react';

interface WatershedZone {
  id: string;
  name: string;
  areaHa: number;
  dominantCanopy: string;
  elevationM: string;
  hasHardwareNode: boolean;
  relativeStatus: ForestStatus;
  polygonPoints: string;
  centerText: { x: number; y: number };
  description: string;
}

export const ZoneMapCard: React.FC = () => {
  const { status, evaluation } = useForest();
  const [selectedZone, setSelectedZone] = useState<WatershedZone | null>(null);

  // Define 4 catchment zones. Zone A is where Sensor Node 1 is physically deployed.
  // Zone statuses follow the overall evaluation, with slight micro-topographic variations.
  const zones: WatershedZone[] = [
    {
      id: 'zone-a',
      name: 'Zone A: Conifer Ridge',
      areaHa: 140,
      dominantCanopy: 'Pinus ponderosa & Abies concolor (Conifers)',
      elevationM: '1,840m – 2,120m',
      hasHardwareNode: true,
      relativeStatus: status, // Directly measured by Sensor Node 1
      polygonPoints: '110,60 260,40 310,140 220,230 90,170',
      centerText: { x: 190, y: 135 },
      description: 'High-exposure southern crest with shallow decomposed granite. Continuous root-depth capacitance sampling via Sensor Node 1.',
    },
    {
      id: 'zone-b',
      name: 'Zone B: Deciduous North Slope',
      areaHa: 210,
      dominantCanopy: 'Quercus kelloggii (Black Oak) & Alder',
      elevationM: '1,620m – 1,850m',
      hasHardwareNode: false,
      relativeStatus: status === 'FIELD CHECK RECOMMENDED' ? 'WATCH' : 'NORMAL MONITORING',
      polygonPoints: '260,40 440,30 480,150 310,140',
      centerText: { x: 370, y: 95 },
      description: 'Shaded northern aspect with deeper organic topsoil. Inferred primarily via Sentinel-2 NDWI passes; no in-situ node deployed.',
    },
    {
      id: 'zone-c',
      name: 'Zone C: Riparian Creek Gully',
      areaHa: 120,
      dominantCanopy: 'Salix spp. (Willows) & Populus trichocarpa',
      elevationM: '1,450m – 1,650m',
      hasHardwareNode: false,
      relativeStatus: 'NORMAL MONITORING', // Protected watercourse
      polygonPoints: '90,170 220,230 310,140 370,250 250,320 80,260',
      centerText: { x: 210, y: 250 },
      description: 'Perennial alluvial corridor with permanent water table. Maintains high vegetative moisture even during atmospheric dry spells.',
    },
    {
      id: 'zone-d',
      name: 'Zone D: Upper Plateau Rim',
      areaHa: 280,
      dominantCanopy: 'Juniperus occidentalis & Mixed Scrub',
      elevationM: '2,150m – 2,340m',
      hasHardwareNode: false,
      relativeStatus: status === 'NORMAL MONITORING' ? 'NORMAL MONITORING' : 'DATA INCOMPLETE',
      polygonPoints: '310,140 480,150 470,300 370,250',
      centerText: { x: 410, y: 215 },
      description: 'High alpine exposed plateau with intermittent cloud obscuration. Sparse canopy reflectance subject to shadow correction gaps.',
    },
  ];

  const getStatusColor = (st: ForestStatus) => {
    switch (st) {
      case 'NORMAL MONITORING': return '#2ECC71';
      case 'WATCH': return '#F5B841';
      case 'FIELD CHECK RECOMMENDED': return '#E5533D';
      case 'DATA INCOMPLETE':
      default: return '#8A9A92';
    }
  };

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
              <Map size={14} className="text-[#2ECC71]" aria-hidden="true" />
              <span>Hydrological Catchment Partitioning</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Catchment Micro-Zone Map
            </h3>
          </div>

          <div className="text-xs font-mono text-[#8A9A92]">
            Total Area: <strong className="text-white">750 ha</strong>
          </div>
        </div>

        {/* Mandatory Student Bound Disclaimer Callout */}
        <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-2.5 text-xs text-[#E5EFE9]">
          <Info size={16} className="text-[#B6F36A] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed font-sans">
            <strong className="text-white font-medium">Critical Spatial Constraint:</strong>{" "}
            <span className="text-[#B6F36A] font-semibold underline decoration-[#B6F36A]/40">
              One node represents one micro-site, not the whole forest.
            </span>{" "}
            Sub-zone interpolation is strictly non-predictive; unmonitored zones indicate satellite proxies or data gaps.
          </p>
        </div>

        {/* Stylized Catchment SVG Polygon Map */}
        <div className="relative w-full aspect-[16/10] max-h-[300px] rounded-2xl bg-[#040E08] border border-white/10 overflow-hidden flex items-center justify-center p-2 mb-4">
          <svg
            viewBox="0 0 540 340"
            className="w-full h-full select-none overflow-visible"
          >
            <defs>
              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.08)" />
              </pattern>
            </defs>

            {/* Background topographic dots */}
            <rect width="540" height="340" fill="url(#gridPattern)" />

            {/* Topographic Elevation Contour Lines */}
            <ellipse cx="270" cy="170" rx="240" ry="140" fill="none" stroke="rgba(46,204,113,0.06)" strokeWidth="1" strokeDasharray="3 3" />
            <ellipse cx="270" cy="170" rx="180" ry="105" fill="none" stroke="rgba(46,204,113,0.06)" strokeWidth="1" strokeDasharray="3 3" />
            <ellipse cx="270" cy="170" rx="120" ry="70" fill="none" stroke="rgba(46,204,113,0.06)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Zones Polygons */}
            {zones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const col = getStatusColor(zone.relativeStatus);

              return (
                <g key={zone.id} className="cursor-pointer group/zone">
                  <polygon
                    points={zone.polygonPoints}
                    fill={col}
                    fillOpacity={isSelected ? 0.45 : 0.22}
                    stroke={col}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeDasharray={zone.hasHardwareNode ? 'none' : '4 3'}
                    className="transition-all duration-300 group-hover/zone:fill-opacity-40"
                    onClick={() => setSelectedZone(zone)}
                  />

                  {/* Zone Label */}
                  <text
                    x={zone.centerText.x}
                    y={zone.centerText.y}
                    fill="#FFFFFF"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {zone.name.split(':')[0]}
                  </text>
                  <text
                    x={zone.centerText.x}
                    y={zone.centerText.y + 13}
                    fill={col}
                    fontSize="8.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none uppercase"
                  >
                    {zone.relativeStatus.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Pulsing "Sensor Node 1" Icon on Zone A (Coordinates: 175, 120) */}
            <g transform="translate(175, 100)" className="pointer-events-none">
              {/* Outer pulsing broadcast ring */}
              <circle cx="0" cy="0" r="14" stroke="#2ECC71" strokeWidth="1" fill="none" opacity="0.6">
                <animate attributeName="r" values="6;26" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
              </circle>

              {/* Node Beacon Core */}
              <circle cx="0" cy="0" r="4.5" fill="#B6F36A" />
              <circle cx="0" cy="0" r="7" stroke="#06120C" strokeWidth="1.5" />

              {/* Label banner */}
              <g transform="translate(10, -8)">
                <rect x="0" y="0" width="86" height="16" rx="4" fill="#06120C" stroke="#2ECC71" strokeWidth="1" />
                <text x="5" y="11" fill="#B6F36A" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  ● NODE 1 ACTIVE
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Zone Details Breakdown Drawer / Box */}
      {selectedZone ? (
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#2ECC71]/40 mb-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-heading font-bold text-white text-sm">
              {selectedZone.name}
            </span>
            <StatusBadge status={selectedZone.relativeStatus} size="sm" pulsing={false} />
          </div>
          <p className="text-xs text-[#8A9A92] leading-relaxed mb-2 font-sans">
            {selectedZone.description}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#8A9A92]">
            <div>Canopy: <span className="text-white">{selectedZone.dominantCanopy}</span></div>
            <div>Elevation: <span className="text-white">{selectedZone.elevationM}</span></div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono text-[#8A9A92] text-center mb-2">
          Click any catchment zone above for micro-site vegetative details.
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#8A9A92]">
        <span>GIS Vector: Custom Watershed Catchment Boundary</span>
        <span className="text-[#B6F36A]">Node 1 Coverage: 140 ha</span>
      </div>
    </div>
  );
};
