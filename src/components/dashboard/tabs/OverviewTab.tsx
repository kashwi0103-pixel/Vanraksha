/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { StatusBadge } from '../../StatusBadge';
import { SimulatedDataBadge } from '../../SimulatedDataBadge';
import { LiveSensorCard } from '../LiveSensorCard';
import { 
  MapPin, 
  Clock, 
  Satellite, 
  Radio, 
  Activity
} from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const { currentDay, status, evaluation, dayIndex, dataset } = useForest();
  const fhi = evaluation.forestHealthIndex;

  // Selected study region state
  const [selectedRegion] = useState({
    name: 'Bandipur Tiger Reserve (Core Zone B)',
    state: 'Karnataka / Western Ghats',
    coords: '11°39\'50" N, 76°37\'55" E',
    elevation: '1,020m MSL',
    areaHa: 650,
    lastPassDate: currentDay?.dateString ?? '2026-10-28',
    passTime: '10:42:18 UTC',
    sensorNodeId: 'NODE-KA-091',
    nodeUplink: '12 min ago (868 MHz LoRaWAN)',
  });

  // Calculate 14-day rainfall accumulation and consecutive dry days
  const recentDays = dataset.slice(Math.max(0, dayIndex - 13), dayIndex + 1);
  const rain14dMm = recentDays.reduce((acc, d) => acc + d.rainfallMm, 0);

  let consecutiveDryDays = 0;
  for (let i = dayIndex; i >= 0; i--) {
    if (dataset[i] && dataset[i].rainfallMm < 1.0) {
      consecutiveDryDays++;
    } else {
      break;
    }
  }

  // Calculate Vapour Pressure Deficit (VPD) in kPa
  const temp = currentDay?.tempC ?? 29.4;
  const rh = currentDay?.humidityPct ?? 42;
  const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  const vpdKpa = es * (1 - rh / 100);

  return (
    <div className="space-y-6">
      {/* Top Banner: Selected Region & Latest Available Observation */}
      <div className="glass-card p-6 border border-white/10 relative overflow-hidden">
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ 
            backgroundColor: status === 'NORMAL MONITORING' ? '#2ECC71' : 
                             status === 'WATCH' ? '#F5B841' : 
                             status === 'FIELD CHECK RECOMMENDED' ? '#E5533D' : '#8A9A92' 
          }}
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Region Metadata */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#2ECC71] flex items-center gap-1.5">
                <MapPin size={13} />
                <span>Selected Study Region</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs font-mono text-[#8A9A92]">{selectedRegion.state}</span>
              <SimulatedDataBadge variant="pill" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                {selectedRegion.name}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-[#8A9A92]">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] uppercase text-[#6B7C74] block">Coordinates</span>
                <span className="text-white font-medium">{selectedRegion.coords}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] uppercase text-[#6B7C74] block">Survey Catchment</span>
                <span className="text-white font-medium">{selectedRegion.areaHa} Hectares</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] uppercase text-[#6B7C74] block">Elevation & Biome</span>
                <span className="text-white font-medium">{selectedRegion.elevation}</span>
              </div>
            </div>
          </div>

          {/* Latest Observation Status Card */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-mono text-[#8A9A92] uppercase flex items-center gap-1.5">
                <Clock size={13} className="text-[#2ECC71]" />
                <span>Latest Observation</span>
              </span>
              <StatusBadge status={status} size="sm" pulsing={true} />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#8A9A92] flex items-center gap-1.5">
                  <Satellite size={13} className="text-[#38BDF8]" />
                  <span>Sentinel-2 Acquisition:</span>
                </span>
                <span className="text-white font-medium">
                  {selectedRegion.lastPassDate} {selectedRegion.passTime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8A9A92] flex items-center gap-1.5">
                  <Radio size={13} className="text-[#B6F36A]" />
                  <span>Ground Sensor LoRa:</span>
                </span>
                <span className="text-[#2ECC71] font-medium">
                  {selectedRegion.sensorNodeId} ({selectedRegion.nodeUplink})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8A9A92] flex items-center gap-1.5">
                  <Activity size={13} className="text-[#F5B841]" />
                  <span>Forest Health Index:</span>
                </span>
                <span className="text-white font-bold text-sm">
                  {fhi.score}/100 ({fhi.label})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Current NDVI</span>
          <div className="text-2xl font-mono font-bold text-[#2ECC71] tabular-nums">
            {currentDay?.ndvi !== null && currentDay?.ndvi !== undefined ? currentDay.ndvi.toFixed(2) : '0.72'}
          </div>
          <span className="text-[11px] font-mono text-[#8A9A92] block mt-0.5">
            Baseline: {currentDay?.seasonalBaseline.ndvi.toFixed(2) ?? '0.75'}
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Current NDMI</span>
          <div className="text-2xl font-mono font-bold text-[#38BDF8] tabular-nums">
            {currentDay?.ndmi !== null && currentDay?.ndmi !== undefined ? currentDay.ndmi.toFixed(2) : '0.38'}
          </div>
          <span className="text-[11px] font-mono text-[#8A9A92] block mt-0.5">
            Water index (NIR-SWIR)
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Root Soil Moisture</span>
          <div className="text-2xl font-mono font-bold text-[#B6F36A] tabular-nums">
            {currentDay?.calibratedSoilPct !== undefined ? `${currentDay.calibratedSoilPct}%` : '28%'}
          </div>
          <span className="text-[11px] font-mono text-[#8A9A92] block mt-0.5">
            Raw: {currentDay?.soilRaw ?? 2450} ADC
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">Ambient Temp</span>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {currentDay?.tempC !== undefined ? `${currentDay.tempC.toFixed(1)}°C` : '29.4°C'}
          </div>
          <span className="text-[11px] font-mono text-[#8A9A92] block mt-0.5">
            RH: {currentDay?.humidityPct ?? 42}%
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">14-Day Rain</span>
          <div className="text-2xl font-mono font-bold text-[#38BDF8] tabular-nums">
            {rain14dMm.toFixed(1)} mm
          </div>
          <span className="text-[11px] font-mono text-[#8A9A92] block mt-0.5">
            {consecutiveDryDays} dry days
          </span>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#8A9A92] block mb-1">VPD Pressure</span>
          <div className="text-2xl font-mono font-bold text-[#F5B841] tabular-nums">
            {vpdKpa.toFixed(2)} kPa
          </div>
          <span className="text-[11px] font-mono text-[#8A9A92] block mt-0.5">
            Atmospheric draw
          </span>
        </div>
      </div>

      {/* Real-time Hardware Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <LiveSensorCard />
        </div>
      </div>
    </div>
  );
};
