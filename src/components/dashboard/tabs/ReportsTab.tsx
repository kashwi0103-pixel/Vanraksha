/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useForest } from '../../../lib/ForestContext';
import { StatusBadge } from '../../StatusBadge';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Database 
} from 'lucide-react';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

interface LiveAlert {
  id: number;
  observation_id: number;
  alert_level: string;
  reason: string | null;
  generated_at: string;
}
export const ReportsTab: React.FC = () => {
  const { currentDay, status, evaluation, dataset, dayIndex, dataSourceInfo } = useForest();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
const [alertsLoading, setAlertsLoading] = useState(true);
const [alertsError, setAlertsError] = useState<string | null>(null);

useEffect(() => {
  const controller = new AbortController();

  async function fetchLiveAlerts() {
    try {
      setAlertsLoading(true);
      setAlertsError(null);

      const response = await fetch(
        `${API_BASE}/alerts?limit=115&offset=0`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`Alerts API returned ${response.status}`);
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Unexpected alerts API response format');
      }

      setLiveAlerts(data as LiveAlert[]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;

      setAlertsError(
        error instanceof Error ? error.message : 'Unable to load live alerts'
      );
    } finally {
      if (!controller.signal.aborted) {
        setAlertsLoading(false);
      }
    }
  }

  void fetchLiveAlerts();

  return () => controller.abort();
}, []);

  const reportId = `FG-REP-2026-10-${String(dayIndex).padStart(3, '0')}`;
  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // Compute 14d rainfall and dry days
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

  // Compute VPD
  const temp = currentDay?.tempC ?? 29.4;
  const rh = currentDay?.humidityPct ?? 42;
  const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  const vpdKpa = es * (1 - rh / 100);

  // Trigger browser print dialog for Save as PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Trigger CSV Download
  const handleDownloadCsv = () => {
    setIsExporting(true);
    try {
      const headers = ['date', 'day_index', 'ndvi', 'ndmi', 'soil_pct', 'temp_c', 'humidity_pct', 'rain_mm', 'status'];
      const rows = dataset.map(d => [
        d.dateString,
        d.dayIndex,
        d.ndvi !== null ? d.ndvi.toFixed(2) : '',
        d.ndmi !== null ? d.ndmi.toFixed(2) : '',
        d.calibratedSoilPct,
        d.tempC.toFixed(1),
        d.humidityPct,
        d.rainfallMm.toFixed(1),
        d.sensorStatus,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ForestGuard_Telemetry_Report_${reportId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger JSON Analysis Download
  const handleDownloadJson = () => {
    setIsExporting(true);
    try {
      const payload = {
        meta: {
          report_id: reportId,
          generated_at: generatedAt,
          region: 'Jim Corbett National Park (Dhikala Core Zone, Uttarakhand)',
          coordinates: '29°32\'55" N, 78°56\'48" E',
          data_mode: dataSourceInfo.mode,
          data_source: dataSourceInfo.sourceName,
        },
        evaluation: {
          status: status,
          forest_health_index: evaluation.forestHealthIndex,
          flags: evaluation.flags,
        },
        current_observation: {
          date: currentDay?.dateString,
          ndvi: currentDay?.ndvi,
          ndmi: currentDay?.ndmi,
          soil_pct: currentDay?.calibratedSoilPct,
          temp_c: currentDay?.tempC,
          rain_14d_mm: rain14dMm,
          vpd_kpa: vpdKpa,
        },
        summary: 'Official automated biophysical condition summary compiled from Sentinel-2 MSI and in-situ capacitive LoRa mesh.',
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ForestGuard_Analysis_${reportId}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Monthly Screening Alerts */}
<div className="glass-card p-6 border border-white/10">
  <div className="flex items-center gap-2 mb-2">
    <Database size={16} className="text-[#2ECC71]" />
    <h3 className="text-lg font-heading font-bold text-white">
      Live Monthly Screening Alerts
    </h3>
  </div>

  <p className="text-xs text-[#8A9A92] mb-4">
    Monthly statewide vegetation screening records retrieved from the live API.
    These are screening indicators, not confirmed forest damage or fire detections.
  </p>

  {alertsLoading ? (
    <p className="text-sm text-[#8A9A92]">Loading alerts…</p>
  ) : alertsError ? (
    <p className="text-sm text-[#E5533D]">
      Could not load alerts: {alertsError}
    </p>
  ) : (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Green', color: '#2ECC71' },
          { label: 'Yellow', color: '#F5B841' },
          { label: 'Orange', color: '#FB923C' },
          { label: 'Red', color: '#E5533D' },
          { label: 'Insufficient satellite data', color: '#94A3B8' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 bg-white/[0.03] border border-white/10"
          >
            <div
              className="text-2xl font-bold"
              style={{ color: item.color }}
            >
              {liveAlerts.filter(
                (alert) => alert.alert_level === item.label
              ).length}
            </div>
            <div className="text-[10px] text-[#8A9A92] mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 text-[#8A9A92]">
              <th className="p-3">Alert level</th>
              <th className="p-3">Observation ID</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Generated at</th>
            </tr>
          </thead>
          <tbody>
            {liveAlerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-b border-white/5 text-[#BAC7C0]"
              >
                <td className="p-3 font-semibold">
                  {alert.alert_level}
                </td>
                <td className="p-3">{alert.observation_id}</td>
                <td className="p-3">
                  {alert.reason || 'No reason provided'}
                </td>
                <td className="p-3">
                  {alert.generated_at
                    ? new Date(alert.generated_at).toLocaleString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#8A9A92] mt-3">
        Records returned: {liveAlerts.length}
      </p>
    </>
  )}
</div>
      {/* Action Bar (Hidden during print) */}
      <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71] flex items-center gap-1.5 mb-1">
            <FileText size={13} />
            <span>Biophysical Analysis Executive Summary</span>
          </span>
          <h3 className="text-xl font-heading font-bold text-white">
            Downloadable Analysis Summary & Field Verification Dossier
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2ECC71] hover:bg-[#27ae60] text-[#06120C] font-mono font-bold text-xs transition-all shadow-lg shadow-[#2ECC71]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white border border-white/15 text-xs font-mono font-medium transition-all"
          >
            <Download size={14} className="text-[#38BDF8]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white border border-white/15 text-xs font-mono font-medium transition-all"
          >
            <Database size={14} className="text-[#B6F36A]" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Official Printable Executive Summary Sheet */}
      <div className="glass-card p-8 sm:p-12 border border-white/15 bg-[#08170F] text-white print:border-none print:p-0 print:bg-white print:text-black print:shadow-none shadow-2xl relative overflow-hidden">
        {/* Document Header */}
        <div className="border-b border-white/15 pb-6 mb-6 print:border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-[#2ECC71] print:text-emerald-700 font-bold">
                  Vanraksha (वनरक्षा) // Forest Department, Uttarakhand
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white print:text-black">
                Forest Condition & Biophysical Stress Assessment
              </h1>
              <span className="text-xs font-mono text-[#8A9A92] print:text-gray-600 block mt-1">
                Sentinel-2 MSI Level-2A & Low-Power LoRaWAN In-Situ Catchment Analysis
              </span>
            </div>

            {/* Document Reference ID Box */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 print:border-gray-300 print:bg-gray-50 text-right font-mono text-xs">
              <span className="text-[10px] uppercase text-[#8A9A92] print:text-gray-500 block">Report Reference:</span>
              <span className="font-bold text-white print:text-black text-sm">{reportId}</span>
              <span className="text-[10px] text-[#8A9A92] print:text-gray-500 block mt-0.5">{generatedAt}</span>
            </div>
          </div>
        </div>

        {/* Region & Observation Metadata Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 print:border-gray-200 print:bg-gray-50 mb-6 text-xs font-mono">
          <div>
            <span className="text-[#8A9A92] print:text-gray-500 block text-[10px] uppercase">Study Division</span>
            <span className="font-bold text-white print:text-black">Jim Corbett National Park</span>
            <span className="text-[#8A9A92] print:text-gray-600 block">Dhikala Core Zone (820 ha), Uttarakhand</span>
          </div>
          <div>
            <span className="text-[#8A9A92] print:text-gray-500 block text-[10px] uppercase">Coordinates</span>
            <span className="font-bold text-white print:text-black">29°32&apos;55&quot; N, 78°56&apos;48&quot; E</span>
            <span className="text-[#8A9A92] print:text-gray-600 block">UTM Zone 44N (WGS84)</span>
          </div>
          <div>
            <span className="text-[#8A9A92] print:text-gray-500 block text-[10px] uppercase">Telemetry Mode</span>
            <span className="font-bold text-[#2ECC71] print:text-emerald-700 uppercase">{dataSourceInfo.mode} Source</span>
            <span className="text-[#8A9A92] print:text-gray-600 block">{dataSourceInfo.sourceName}</span>
          </div>
          <div>
            <span className="text-[#8A9A92] print:text-gray-500 block text-[10px] uppercase">Overall Evaluation</span>
            <div className="mt-0.5">
              <StatusBadge status={status} size="sm" />
            </div>
          </div>
        </div>

        {/* Section 1: Executive Findings */}
        <div className="space-y-4 mb-6">
          <h2 className="text-sm font-mono uppercase tracking-wider text-white print:text-black border-b border-white/10 print:border-gray-200 pb-1.5 font-bold flex items-center gap-2">
            <span className="text-[#2ECC71] print:text-emerald-700">01.</span> Executive Biophysical Summary
          </h2>
          <p className="text-xs sm:text-sm font-mono text-[#BAC7C0] print:text-gray-700 leading-relaxed">
            Catchment-wide synthesis over the 90-day seasonal timeline indicates an active 
            Forest Health Index of <strong className="text-white print:text-black">{evaluation.forestHealthIndex.score}/100 ({evaluation.forestHealthIndex.label})</strong>. 
            Sentinel-2 spectral reflectances exhibit an average NDVI of <strong className="text-white print:text-black">{(currentDay?.ndvi ?? 0.72).toFixed(2)}</strong>, with 
            canopy moisture index (NDMI) measuring <strong className="text-white print:text-black">{(currentDay?.ndmi ?? 0.38).toFixed(2)}</strong>. 
            Ground root-depth capacitive probe reports <strong className="text-white print:text-black">{currentDay?.calibratedSoilPct ?? 28}% volumetric water content</strong>.
          </p>
        </div>

        {/* Section 2: Telemetry Metrics Table */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-mono uppercase tracking-wider text-white print:text-black border-b border-white/10 print:border-gray-200 pb-1.5 font-bold flex items-center gap-2">
            <span className="text-[#2ECC71] print:text-emerald-700">02.</span> Verified Indicator Metrics
          </h2>
          
          <table className="w-full text-left text-xs font-mono border border-white/10 print:border-gray-300">
            <thead>
              <tr className="bg-white/[0.04] print:bg-gray-100 border-b border-white/10 print:border-gray-300 text-[#8A9A92] print:text-gray-600">
                <th className="p-2.5">Indicator Parameter</th>
                <th className="p-2.5">Observed Value</th>
                <th className="p-2.5">Seasonal Baseline</th>
                <th className="p-2.5">Condition Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 print:divide-gray-200">
              <tr>
                <td className="p-2.5 text-white print:text-black font-semibold">NDVI (Chlorophyll Vigor)</td>
                <td className="p-2.5 text-[#2ECC71] print:text-emerald-700 font-bold tabular-nums">{(currentDay?.ndvi ?? 0.72).toFixed(2)}</td>
                <td className="p-2.5 text-[#8A9A92] print:text-gray-600 tabular-nums">{currentDay?.seasonalBaseline.ndvi.toFixed(2) ?? '0.75'}</td>
                <td className="p-2.5 text-white print:text-gray-700">Healthy Deciduous Canopy</td>
              </tr>
              <tr>
                <td className="p-2.5 text-white print:text-black font-semibold">NDMI (Canopy Moisture)</td>
                <td className="p-2.5 text-[#38BDF8] print:text-blue-700 font-bold tabular-nums">{(currentDay?.ndmi ?? 0.38).toFixed(2)}</td>
                <td className="p-2.5 text-[#8A9A92] print:text-gray-600 tabular-nums">{currentDay?.seasonalBaseline.ndmi.toFixed(2) ?? '0.40'}</td>
                <td className="p-2.5 text-white print:text-gray-700">Mild Seasonal Water Deficit</td>
              </tr>
              <tr>
                <td className="p-2.5 text-white print:text-black font-semibold">Capacitive Soil Moisture</td>
                <td className="p-2.5 text-[#B6F36A] print:text-lime-700 font-bold tabular-nums">{currentDay?.calibratedSoilPct ?? 28}% (ADC {currentDay?.soilRaw ?? 2450})</td>
                <td className="p-2.5 text-[#8A9A92] print:text-gray-600 tabular-nums">&gt;30% Threshold</td>
                <td className="p-2.5 text-white print:text-gray-700">Root-zone drying on exposed crest</td>
              </tr>
              <tr>
                <td className="p-2.5 text-white print:text-black font-semibold">Cumulative Precipitation (14d)</td>
                <td className="p-2.5 text-white print:text-black font-bold tabular-nums">{rain14dMm.toFixed(1)} mm</td>
                <td className="p-2.5 text-[#8A9A92] print:text-gray-600 tabular-nums">Normal &gt;15mm</td>
                <td className="p-2.5 text-white print:text-gray-700">{consecutiveDryDays} consecutive rainless days</td>
              </tr>
              <tr>
                <td className="p-2.5 text-white print:text-black font-semibold">VPD Atmospheric Pull</td>
                <td className="p-2.5 text-[#F5B841] print:text-amber-700 font-bold tabular-nums">{vpdKpa.toFixed(2)} kPa</td>
                <td className="p-2.5 text-[#8A9A92] print:text-gray-600 tabular-nums">&lt;1.8 kPa</td>
                <td className="p-2.5 text-white print:text-gray-700">Elevated transpiration stress</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Recommended Field Verification Actions */}
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-white print:text-black border-b border-white/10 print:border-gray-200 pb-1.5 font-bold flex items-center gap-2">
            <span className="text-[#2ECC71] print:text-emerald-700">03.</span> Prescribed Field Protocols
          </h2>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 print:border-gray-200 print:bg-gray-50 text-xs font-mono space-y-2 text-[#BAC7C0] print:text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#2ECC71] print:text-emerald-700 shrink-0 mt-0.5" />
              <span>Priority ground inspection for Sector B-4 crest (shallow loam section) for canopy needle drop and resin accumulation.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#2ECC71] print:text-emerald-700 shrink-0 mt-0.5" />
              <span>Verify LoRa node battery voltage and clean sensor soil probe contact during weekly perimeter rounds.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#2ECC71] print:text-emerald-700 shrink-0 mt-0.5" />
              <span>Cross-reference next clear-sky Sentinel-2 overpass to confirm cloud shadow absence.</span>
            </div>
          </div>
        </div>

        {/* Officer Sign-off Block */}
        <div className="pt-6 border-t border-white/15 print:border-gray-300 grid grid-cols-2 gap-8 text-xs font-mono">
          <div>
            <span className="text-[#8A9A92] print:text-gray-500 block text-[10px] uppercase">Field Verification Officer:</span>
            <div className="h-10 border-b border-dashed border-white/20 print:border-gray-400 mt-2"></div>
            <span className="text-[#8A9A92] print:text-gray-600 block mt-1">Range Forest Officer (RFO), Corbett Tiger Reserve, Uttarakhand</span>
          </div>

          <div>
            <span className="text-[#8A9A92] print:text-gray-500 block text-[10px] uppercase">Remote Sensing Analyst:</span>
            <div className="h-10 border-b border-dashed border-white/20 print:border-gray-400 mt-2"></div>
            <span className="text-[#8A9A92] print:text-gray-600 block mt-1">Vanraksha (वनरक्षा) Remote Sensing Wing</span>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-8 pt-4 border-t border-white/10 print:border-gray-200 text-[10px] font-mono text-[#8A9A92] print:text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Vanraksha Forest Intelligence Platform. Ground physical verification recommended prior to forestry intervention.</span>
          <span>Doc ID: {reportId}</span>
        </div>
      </div>
    </div>
  );
};
