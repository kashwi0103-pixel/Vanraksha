/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  RotateCcw,
  Download,
  Sparkles,
  Layers
} from 'lucide-react';
import { useForest } from '../lib/ForestContext';
import { 
  parseSensorCSV, 
  parseSatelliteCSV, 
  parseWeatherCSV, 
  parseModelResultsJSON,
  FileSource,
  SensorReading,
  SatelliteObservation,
  WeatherObservation,
  ModelResults,
  ValidationResult
} from '../lib/dataSource';

export const DataDrawer: React.FC = () => {
  const { 
    isDataDrawerOpen, 
    setIsDataDrawerOpen, 
    dataSourceMode, 
    dataSourceInfo,
    switchToSimulated, 
    switchToReal,
    fileSource 
  } = useForest();

  const [activeTab, setActiveTab] = useState<'sensor' | 'satellite' | 'weather' | 'model'>('sensor');
  
  // Staging state before applying
  const [stagedSensors, setStagedSensors] = useState<SensorReading[] | null>(null);
  const [stagedSatellites, setStagedSatellites] = useState<SatelliteObservation[] | null>(null);
  const [stagedWeather, setStagedWeather] = useState<WeatherObservation[] | null>(null);
  const [stagedModel, setStagedModel] = useState<ModelResults | null>(null);
  const [stagedFilename, setStagedFilename] = useState<string>('custom_telemetry.csv');

  // Validation results per tab
  const [sensorValidation, setSensorValidation] = useState<ValidationResult<SensorReading[]> | null>(null);
  const [satValidation, setSatValidation] = useState<ValidationResult<SatelliteObservation[]> | null>(null);
  const [weatherValidation, setWeatherValidation] = useState<ValidationResult<WeatherObservation[]> | null>(null);
  const [modelValidation, setModelValidation] = useState<ValidationResult<ModelResults> | null>(null);

  if (!isDataDrawerOpen) return null;

  // File Readers
  const handleFileUpload = (type: 'sensor' | 'satellite' | 'weather' | 'model', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      if (type === 'sensor') {
        const res = parseSensorCSV(content);
        setSensorValidation(res);
        if (res.success && res.data) {
          setStagedSensors(res.data);
          setStagedFilename(file.name);
        }
      } else if (type === 'satellite') {
        const res = parseSatelliteCSV(content);
        setSatValidation(res);
        if (res.success && res.data) {
          setStagedSatellites(res.data);
        }
      } else if (type === 'weather') {
        const res = parseWeatherCSV(content);
        setWeatherValidation(res);
        if (res.success && res.data) {
          setStagedWeather(res.data);
        }
      } else if (type === 'model') {
        const res = parseModelResultsJSON(content);
        setModelValidation(res);
        if (res.success && res.data) {
          setStagedModel(res.data);
        }
      }
    };
    reader.readAsText(file);
  };

  // Load realistic sample files
  const handleLoadSampleRealData = () => {
    const sampleSensorCSV = `timestamp,soil_raw,temp_c,humidity_pct,status
2026-08-01T10:00:00Z,2350,28.4,54,OK
2026-08-02T10:00:00Z,2390,29.1,51,OK
2026-08-03T10:00:00Z,2450,30.2,48,OK
2026-08-04T10:00:00Z,2510,31.5,45,OK
2026-08-05T10:00:00Z,2580,32.0,42,OK
2026-08-06T10:00:00Z,2640,32.8,39,OK
2026-08-07T10:00:00Z,2720,33.4,36,OK`;

    const sampleSatCSV = `date,ndvi,ndmi,cloud_pct
2026-08-01,0.68,0.45,12
2026-08-06,0.59,0.38,8
2026-08-11,null,null,85
2026-08-16,0.49,0.29,15
2026-08-21,0.44,0.24,5`;

    const sRes = parseSensorCSV(sampleSensorCSV);
    const satRes = parseSatelliteCSV(sampleSatCSV);

    setSensorValidation(sRes);
    setSatValidation(satRes);

    if (sRes.data) setStagedSensors(sRes.data);
    if (satRes.data) setStagedSatellites(satRes.data);
    setStagedFilename('nilgiri_pilot_node1.csv');
  };

  // Download template CSV helpers
  const downloadTemplate = (type: 'sensor' | 'satellite' | 'weather') => {
    let content = '';
    let name = '';
    if (type === 'sensor') {
      content = 'timestamp,soil_raw,temp_c,humidity_pct,status\n2026-09-01T12:00:00Z,2200,27.5,58,OK\n2026-09-02T12:00:00Z,2240,28.0,55,OK\n';
      name = 'forestguard_sensor_template.csv';
    } else if (type === 'satellite') {
      content = 'date,ndvi,ndmi,cloud_pct\n2026-09-01,0.64,0.41,10\n2026-09-06,0.62,0.39,15\n2026-09-11,null,null,90\n';
      name = 'forestguard_satellite_template.csv';
    } else {
      content = 'date,rain_mm,temp_c,humidity_pct\n2026-09-01,0,28.2,52\n2026-09-02,4.5,26.1,64\n';
      name = 'forestguard_weather_template.csv';
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Apply Changes
  const handleApplyRealData = () => {
    const newSource = new FileSource(
      stagedSensors || fileSource.getSensorReadings(),
      stagedSatellites || fileSource.getSatelliteSeries(),
      stagedWeather || fileSource.getWeatherSeries(),
      stagedModel || null,
      stagedFilename
    );
    switchToReal(newSource);
    setIsDataDrawerOpen(false);
  };

  const handleResetToSimulated = () => {
    switchToSimulated();
    setStagedSensors(null);
    setStagedSatellites(null);
    setStagedWeather(null);
    setStagedModel(null);
    setSensorValidation(null);
    setSatValidation(null);
    setWeatherValidation(null);
    setModelValidation(null);
    setIsDataDrawerOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-drawer-title"
    >
      <div 
        className="w-full max-w-2xl bg-[#06120C] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-y-auto"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#06120C]/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20">
              <Database size={20} />
            </div>
            <div>
              <h2 id="data-drawer-title" className="text-xl font-heading font-bold text-white">
                Data Adapter Configuration
              </h2>
              <p className="text-xs font-mono text-[#8A9A92]">
                Switch between Simulator & Physical Telemetry Files
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDataDrawerOpen(false)}
            className="p-2 rounded-xl text-[#8A9A92] hover:text-white hover:bg-white/[0.04] transition-colors"
            aria-label="Close Data Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Mode Selector Toggle */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">Active Data Source</span>
              <span className="text-[11px] font-mono text-[#B6F36A] uppercase">
                {dataSourceMode === 'real' ? 'Real Physical Data' : 'Deterministic Simulator'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResetToSimulated}
                className={`py-3 px-4 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                  dataSourceMode === 'simulated'
                    ? 'bg-[#2ECC71]/15 text-[#B6F36A] border-[#2ECC71]/50 shadow-[0_0_15px_rgba(46,204,113,0.15)] font-semibold'
                    : 'bg-white/[0.02] text-[#8A9A92] border-white/10 hover:text-white'
                }`}
              >
                <Database size={16} />
                <span>Simulated Mode</span>
                <span className="text-[10px] text-[#8A9A92] font-normal">90-day pilot model</span>
              </button>

              <button
                type="button"
                onClick={() => switchToReal()}
                className={`py-3 px-4 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                  dataSourceMode === 'real'
                    ? 'bg-[#2ECC71]/15 text-[#B6F36A] border-[#2ECC71]/50 shadow-[0_0_15px_rgba(46,204,113,0.15)] font-semibold'
                    : 'bg-white/[0.02] text-[#8A9A92] border-white/10 hover:text-white'
                }`}
              >
                <Upload size={16} />
                <span>Real Data Mode</span>
                <span className="text-[10px] text-[#8A9A92] font-normal">Custom CSV / JSON</span>
              </button>
            </div>

            {dataSourceMode === 'real' && (
              <div className="mt-3 p-2.5 rounded-lg bg-[#2ECC71]/10 border border-[#2ECC71]/20 text-[11px] font-mono text-[#B6F36A] flex items-center justify-between">
                <span>Active File: {dataSourceInfo.sourceName}</span>
                <span>{dataSourceInfo.dateRange}</span>
              </div>
            )}
          </div>

          {/* Quick Prefill helper */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#2ECC71]/10 to-transparent border border-[#2ECC71]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#B6F36A]" />
                <span>Need test data right now?</span>
              </div>
              <p className="text-[11px] text-[#8A9A92]">
                Load pre-verified Nilgiri Pilot CSV records with real cloud gaps.
              </p>
            </div>
            <button
              onClick={handleLoadSampleRealData}
              className="px-3 py-1.5 rounded-lg bg-[#2ECC71] text-[#06120C] text-xs font-semibold hover:bg-[#B6F36A] transition-colors whitespace-nowrap shadow-sm"
            >
              Load Sample Files
            </button>
          </div>

          {/* File Upload Tabs */}
          <div className="space-y-4">
            <div className="flex border-b border-white/10 overflow-x-auto text-xs font-medium">
              <button
                onClick={() => setActiveTab('sensor')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'sensor'
                    ? 'border-[#2ECC71] text-[#B6F36A] font-semibold'
                    : 'border-transparent text-[#8A9A92] hover:text-white'
                }`}
              >
                1. Sensor CSV
              </button>
              <button
                onClick={() => setActiveTab('satellite')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'satellite'
                    ? 'border-[#2ECC71] text-[#B6F36A] font-semibold'
                    : 'border-transparent text-[#8A9A92] hover:text-white'
                }`}
              >
                2. Satellite CSV
              </button>
              <button
                onClick={() => setActiveTab('weather')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'weather'
                    ? 'border-[#2ECC71] text-[#B6F36A] font-semibold'
                    : 'border-transparent text-[#8A9A92] hover:text-white'
                }`}
              >
                3. Weather CSV
              </button>
              <button
                onClick={() => setActiveTab('model')}
                className={`py-2 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'model'
                    ? 'border-[#2ECC71] text-[#B6F36A] font-semibold'
                    : 'border-transparent text-[#8A9A92] hover:text-white'
                }`}
              >
                4. Model JSON
              </button>
            </div>

            {/* TAB 1: SENSOR CSV */}
            {activeTab === 'sensor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#8A9A92]">
                  <span>Format: <code className="text-white font-mono">timestamp,soil_raw,temp_c,humidity_pct,status</code></span>
                  <button 
                    onClick={() => downloadTemplate('sensor')}
                    className="text-[#2ECC71] hover:underline flex items-center gap-1"
                  >
                    <Download size={12} /> Template
                  </button>
                </div>

                <label className="border-2 border-dashed border-white/10 hover:border-[#2ECC71]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01]">
                  <Upload size={28} className="text-[#2ECC71] mb-2" />
                  <span className="text-xs font-semibold text-white mb-1">
                    Upload Sensor Readings CSV
                  </span>
                  <span className="text-[11px] text-[#8A9A92]">
                    Drag & drop or click to browse (.csv)
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload('sensor', e.target.files[0]);
                    }}
                  />
                </label>

                {sensorValidation && (
                  <ValidationSummary 
                    title="Sensor Readings Validation"
                    result={sensorValidation} 
                  />
                )}
              </div>
            )}

            {/* TAB 2: SATELLITE CSV */}
            {activeTab === 'satellite' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#8A9A92]">
                  <span>Format: <code className="text-white font-mono">date,ndvi,ndmi,cloud_pct</code></span>
                  <button 
                    onClick={() => downloadTemplate('satellite')}
                    className="text-[#2ECC71] hover:underline flex items-center gap-1"
                  >
                    <Download size={12} /> Template
                  </button>
                </div>

                <label className="border-2 border-dashed border-white/10 hover:border-[#2ECC71]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01]">
                  <Upload size={28} className="text-[#2ECC71] mb-2" />
                  <span className="text-xs font-semibold text-white mb-1">
                    Upload Sentinel-2 Satellite Series CSV
                  </span>
                  <span className="text-[11px] text-[#8A9A92]">
                    Null values stay gaps, never interpolated
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload('satellite', e.target.files[0]);
                    }}
                  />
                </label>

                {satValidation && (
                  <ValidationSummary 
                    title="Satellite Observation Validation"
                    result={satValidation} 
                  />
                )}
              </div>
            )}

            {/* TAB 3: WEATHER CSV */}
            {activeTab === 'weather' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#8A9A92]">
                  <span>Format: <code className="text-white font-mono">date,rain_mm,temp_c,humidity_pct</code></span>
                  <button 
                    onClick={() => downloadTemplate('weather')}
                    className="text-[#2ECC71] hover:underline flex items-center gap-1"
                  >
                    <Download size={12} /> Template
                  </button>
                </div>

                <label className="border-2 border-dashed border-white/10 hover:border-[#2ECC71]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01]">
                  <Upload size={28} className="text-[#2ECC71] mb-2" />
                  <span className="text-xs font-semibold text-white mb-1">
                    Upload Weather Station Series CSV
                  </span>
                  <span className="text-[11px] text-[#8A9A92]">
                    Rainfall, ambient temperature and humidity records
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload('weather', e.target.files[0]);
                    }}
                  />
                </label>

                {weatherValidation && (
                  <ValidationSummary 
                    title="Weather Series Validation"
                    result={weatherValidation} 
                  />
                )}
              </div>
            )}

            {/* TAB 4: MODEL JSON */}
            {activeTab === 'model' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#8A9A92]">
                  <span>Format: <code className="text-white font-mono">model_results.json (meta, models, predictions)</code></span>
                </div>

                <label className="border-2 border-dashed border-white/10 hover:border-[#2ECC71]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01]">
                  <Upload size={28} className="text-[#2ECC71] mb-2" />
                  <span className="text-xs font-semibold text-white mb-1">
                    Upload Custom Model Evaluation JSON
                  </span>
                  <span className="text-[11px] text-[#8A9A92]">
                    Replaces illustrative benchmark on the Model page
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload('model', e.target.files[0]);
                    }}
                  />
                </label>

                {modelValidation && (
                  <ValidationSummary 
                    title="Model Results JSON Validation"
                    result={modelValidation} 
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-[#06120C]/95 sticky bottom-0 z-20 flex items-center justify-between gap-4">
          <button
            onClick={handleResetToSimulated}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-[#8A9A92] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} /> Reset to Simulator
          </button>

          <button
            onClick={handleApplyRealData}
            disabled={!stagedSensors && !stagedSatellites && !stagedModel}
            className="px-6 py-2.5 rounded-xl bg-[#2ECC71] text-[#06120C] font-semibold text-xs hover:bg-[#B6F36A] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-[0_0_15px_rgba(46,204,113,0.3)] flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>Apply Real Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Summary & preview helper component
interface ValidationSummaryProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: ValidationResult<any>;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ title, result }) => {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white">{title}</span>
        {result.success ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2ECC71]">
            <CheckCircle2 size={12} /> Valid ({result.totalRows ?? 0} rows)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#E5533D]">
            <AlertOctagon size={12} /> Errors found
          </span>
        )}
      </div>

      {result.errors.length > 0 && (
        <div className="p-2.5 rounded-lg bg-[#E5533D]/10 border border-[#E5533D]/20 text-[11px] font-mono text-[#E5533D] space-y-1">
          {result.errors.slice(0, 5).map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="p-2.5 rounded-lg bg-[#F5B841]/10 border border-[#F5B841]/20 text-[11px] font-mono text-[#F5B841] space-y-1">
          {result.warnings.slice(0, 3).map((w, i) => (
            <div key={i}>⚠ {w}</div>
          ))}
        </div>
      )}

      {result.preview && result.preview.length > 0 && (
        <div className="overflow-x-auto">
          <div className="text-[10px] font-mono text-[#8A9A92] uppercase mb-1">
            Data Preview (First 5 Rows):
          </div>
          <table className="w-full text-left font-mono text-[10px] text-[#8A9A92] border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white">
                {Object.keys(result.preview[0]).map((col) => (
                  <th key={col} className="py-1 px-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.preview.map((row, idx) => (
                <tr key={idx} className="border-b border-white/[0.04]">
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="py-1 px-2">
                      {val === null ? <span className="text-[#8A9A92] italic">null (gap)</span> : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
