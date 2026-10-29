/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulatedDataBadge } from '../components/SimulatedDataBadge';
import { 
  GraduationCap, 
  BookOpen, 
  AlertCircle, 
  ShieldAlert, 
  ExternalLink, 
  Globe2, 
  Satellite, 
  Flame, 
  MapPin, 
  Scale,
  Award
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  // Established Continental & Global Benchmarks
  const benchmarks = [
    {
      name: 'FSI Forest Fire Alert System (FAST 3.0)',
      agency: 'Forest Survey of India (MoEFCC)',
      sensor: 'SNPP-VIIRS & Aqua/Terra MODIS (375m & 1km thermal)',
      description: 'National operational thermal anomaly detection sending real-time SMS alerts to forest beat officers across India.',
      comparativeContext: 'ForestGuard focuses on pre-thermal physiological water stress (7-14 days earlier) using ground capacitance rather than active thermal combustion detection.',
    },
    {
      name: 'India State of Forest Report (ISFR)',
      agency: 'Forest Survey of India',
      sensor: 'Resourcesat-2 LISS-III (23.5m spatial)',
      description: 'Biennial nationwide assessment of forest canopy density classes (Very Dense, Moderately Dense, Open Forest).',
      comparativeContext: 'ISFR maps macro-decadal canopy structural shifts; ForestGuard provides micro-temporal 5-day moisture deficit signals at individual pilot plots.',
    },
    {
      name: 'ISRO / NRSC Bhuvan Forest Services',
      agency: 'National Remote Sensing Centre (ISRO)',
      sensor: 'Oceansat, Cartosat, Resourcesat-2 & INSAT-3D',
      description: 'Comprehensive geospatial disaster support, near-real-time fire risk zonation, and burnt area mapping.',
      comparativeContext: 'Integrates satellite telemetry with open web GIS; serves as the gold standard for regional geospatial baseline calibration.',
    },
    {
      name: 'NASA FIRMS',
      agency: 'NASA Earth Science Data and Information System (ESDIS)',
      sensor: 'MODIS & VIIRS active thermal radiance',
      description: 'Global standard for active thermal hotspot identification with 3-hour satellite overpass latency.',
      comparativeContext: 'Detects active combustion events globally; ForestGuard serves as a student experiment in hyper-local pre-ignition ground moisture monitoring.',
    },
    {
      name: 'Global Forest Watch (GFW)',
      agency: 'World Resources Institute & Univ. of Maryland',
      sensor: 'Landsat & Sentinel-2 GLAD alerts',
      description: 'Global canopy loss detection tracking land-use change, deforestation frontiers, and weekly tree cover loss.',
      comparativeContext: 'Focuses on permanent canopy clearing and logging; ForestGuard investigates reversible seasonal drought and evapotranspiration anomalies.',
    },
    {
      name: 'EFFIS / GWIS',
      agency: 'Copernicus Emergency Management Service (EU)',
      sensor: 'Integrated ECMWF numerical weather & satellite models',
      description: 'Calculates the Fire Weather Index (FWI) system incorporating Canadian Forest Service drought code algorithms.',
      comparativeContext: 'Continental-scale weather-driven fire potential modeling; ForestGuard demonstrates in-situ root-depth capacitive sensor ground-truthing.',
    },
    {
      name: 'ESA Climate Smart Forestry',
      agency: 'European Space Agency (Copernicus Programme)',
      sensor: 'Sentinel-2 MSI (Red-Edge B5, B6, B7, B8A & SWIR B11, B12)',
      description: 'Scientific research into canopy chlorophyll absorption, leaf water content (NDMI/EWT), and drought resilience.',
      comparativeContext: 'Provides the theoretical foundation for ForestGuard’s satellite index ingestion and seasonal baseline envelope calculations.',
    },
  ];

  return (
    <section id="about" className="py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71]">
                Context & Academic Ethics
              </span>
              <SimulatedDataBadge variant="pill" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              About ForestGuard AI & Comparative Benchmarks
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8A9A92]">
            Decision-Support Only · Rigorous Scope Boundaries
          </p>
        </div>

        {/* ACADEMIC SCOPE & RIGID ETHICS BOUNDARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Capstone Motivation Card */}
          <div className="glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[#2ECC71]">
                <GraduationCap size={22} />
                <h3 className="font-heading font-semibold text-white text-base">
                  Undergraduate Capstone Demonstrator
                </h3>
              </div>
              <p className="text-xs text-[#8A9A92] leading-relaxed mb-4">
                ForestGuard AI is an undergraduate student engineering project investigating whether <strong>public Sentinel-2 satellite passes</strong> paired with <strong>low-cost &lt;₹1,700 in-situ capacitive sensor hardware</strong> can provide actionable early water stress indicators for community forest stewards.
              </p>
              <p className="text-xs text-[#8A9A92] leading-relaxed">
                Rather than replacing enterprise forestry infrastructure, this demonstrator serves as a transparent educational prototype showcasing multi-sensor data alignment, strict gap handling, and auditable rule evaluation.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#B6F36A] flex items-center justify-between">
              <span>Student Prototype Status</span>
              <span>Apache-2.0 Open Source</span>
            </div>
          </div>

          {/* Rigid Safety & Ethics Rules */}
          <div className="glass-card p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[#E5533D]">
                <ShieldAlert size={22} />
                <h3 className="font-heading font-semibold text-white text-base">
                  Non-Predictive Decision-Support Ethics
                </h3>
              </div>
              <p className="text-xs text-[#8A9A92] leading-relaxed mb-4">
                Early warning prototypes must strictly avoid sensationalism, false panic, or unscientific certainty. ForestGuard operates under five immutable design principles:
              </p>

              <div className="space-y-2 text-xs text-[#8A9A92]">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <strong className="text-white">1. Strict 4-Status Vocabulary:</strong> Only <span className="font-mono text-[#2ECC71]">NORMAL MONITORING</span>, <span className="font-mono text-[#F5B841]">WATCH</span>, <span className="font-mono text-[#E5533D]">FIELD CHECK RECOMMENDED</span>, and <span className="font-mono text-[#8A9A92]">DATA INCOMPLETE</span> are permitted.
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <strong className="text-white">2. No Unverified Mortality Claims:</strong> Never state that a forest is dying, or that wildfire will ignite.
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <strong className="text-white">3. Zero Data Imputation:</strong> Missing telemetry or cloudy passes stay as explicit gaps, never fabricated.
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#E5533D]">
              Physical ground-truth inspection by certified forestry personnel is always mandatory.
            </div>
          </div>
        </div>

        {/* COMPARATIVE BENCHMARK CARDS */}
        <div className="mb-12">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase">
              <Globe2 size={16} className="text-[#2ECC71]" />
              <span>Comparative Benchmark Framework</span>
            </div>
            <span className="text-[11px] font-mono text-[#8A9A92]">
              Systems to Compare Against · Respected Scientific Standards
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benchmarks.map((b) => (
              <div
                key={b.name}
                className="glass-card p-5 border border-white/10 flex flex-col justify-between hover:border-[#2ECC71]/30 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-[#8A9A92] uppercase">
                      {b.agency}
                    </span>
                    <Satellite size={14} className="text-[#2ECC71]" />
                  </div>

                  <h4 className="font-heading font-semibold text-white text-sm mb-1.5 group-hover:text-[#B6F36A] transition-colors">
                    {b.name}
                  </h4>

                  <div className="text-[10px] font-mono text-[#B6F36A] mb-3 p-1 rounded bg-white/[0.02] border border-white/5 truncate">
                    Sensor: {b.sensor}
                  </div>

                  <p className="text-xs text-[#8A9A92] leading-relaxed mb-3">
                    {b.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] text-[11px] text-[#8A9A92]/90 italic font-sans">
                  <strong>Demonstrator Contrast:</strong> {b.comparativeContext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACADEMIC BIBLIOGRAPHY & REFERENCES */}
        <div className="glass-card p-6 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase mb-4 pb-2 border-b border-white/[0.08]">
            <BookOpen size={14} className="text-[#2ECC71]" />
            <span>Academic References & Scientific Foundations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-[#8A9A92]">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white block font-semibold mb-1">
                Copernicus Sentinel-2 User Handbook (ESA, 2021)
              </span>
              <span>B8 NIR (842nm) and B4 Red (665nm) reflectance ratios for normalized difference vegetation calculations.</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white block font-semibold mb-1">
                Gao, B.C. (1996) - NDMI Water Index
              </span>
              <span>Normalized Difference Water Index (NDWI/NDMI) utilizing shortwave infrared (SWIR) absorption for liquid water estimation in plant canopies.</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white block font-semibold mb-1">
                Capacitive Soil Matric Potential Measurement (IEEE Sensors, 2023)
              </span>
              <span>Frequency-domain reflectometry in root-zone agricultural loam, accounting for dielectric permittivity variations.</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-white block font-semibold mb-1">
                Canadian Forest Fire Weather Index (FWI) System (van Wagner, 1987)
              </span>
              <span>Standardized accounting for cumulative precipitation deficit, drought code, and fine fuel moisture dynamics.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
