/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generate90DayDataset, SimulationScenario } from './simulator';
import sampleModelResults from '../../data/model_results.sample.json';

export interface SensorReading {
  timestamp: string;
  soil_raw: number;
  temp_c: number;
  humidity_pct: number;
  status: 'OK' | 'ERROR' | 'STALE';
}

export interface SatelliteObservation {
  date: string;
  ndvi: number | null;
  ndmi: number | null;
  cloud_pct: number;
}

export interface WeatherObservation {
  date: string;
  rain_mm: number;
  temp_c: number;
  humidity_pct: number;
}

export interface ModelComparisonItem {
  name: string;
  precision: number;
  recall: number;
  false_alarms: number;
  missed_events: number;
  lead_time_days: number;
  brier: number | null;
}

export interface FeatureImportanceItem {
  feature: string;
  value: number;
}

export interface ModelPredictionItem {
  date: string;
  risk_score: number;
  label?: number; // Ground truth label 0 or 1
}

export interface CalibrationBinItem {
  bin_mid: number;
  observed: number;
}

export interface ModelResults {
  meta: {
    target: string;
    horizon_days: number;
    trained_on: string;
    tested_on: string;
    split: string;
    n_train: number;
    n_test: number;
    generated_at: string;
  };
  models: ModelComparisonItem[];
  feature_importance: FeatureImportanceItem[];
  predictions: ModelPredictionItem[];
  calibration?: CalibrationBinItem[];
  notes?: string;
}

export interface DataSourceInfo {
  mode: 'simulated' | 'real';
  sourceName: string;
  dateRange: string;
  isSample: boolean;
}

export interface DataSource {
  getInfo(): DataSourceInfo;
  getSensorReadings(): SensorReading[];
  getSatelliteSeries(): SatelliteObservation[];
  getWeatherSeries(): WeatherObservation[];
  getModelResults(): ModelResults;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  preview?: Record<string, string | number | null>[];
  totalRows?: number;
}

// -------------------------------------------------------------
// SIMULATED SOURCE IMPLEMENTATION
// -------------------------------------------------------------
export class SimulatedSource implements DataSource {
  private scenario: SimulationScenario;

  constructor(scenario: SimulationScenario = 'Normal season') {
    this.scenario = scenario;
  }

  setScenario(scenario: SimulationScenario) {
    this.scenario = scenario;
  }

  getInfo(): DataSourceInfo {
    return {
      mode: 'simulated',
      sourceName: `Simulator (${this.scenario})`,
      dateRange: 'Past 90 days',
      isSample: true,
    };
  }

  getSensorReadings(): SensorReading[] {
    const dataset = generate90DayDataset(this.scenario);
    return dataset.map((d) => ({
      timestamp: `${d.dateString}T12:00:00Z`,
      soil_raw: d.soilRaw,
      temp_c: d.tempC,
      humidity_pct: d.humidityPct,
      status: d.sensorStatus,
    }));
  }

  getSatelliteSeries(): SatelliteObservation[] {
    const dataset = generate90DayDataset(this.scenario);
    // Sentinel-2 passes occur every 5 days
    return dataset.map((d) => ({
      date: d.dateString,
      ndvi: d.isSatellitePass ? d.ndvi : null,
      ndmi: d.isSatellitePass ? d.ndmi : null,
      cloud_pct: d.cloudPct ?? 0,
    }));
  }

  getWeatherSeries(): WeatherObservation[] {
    const dataset = generate90DayDataset(this.scenario);
    return dataset.map((d) => ({
      date: d.dateString,
      rain_mm: d.rainfallMm,
      temp_c: d.tempC,
      humidity_pct: d.humidityPct,
    }));
  }

  getModelResults(): ModelResults {
    return sampleModelResults as unknown as ModelResults;
  }
}

// -------------------------------------------------------------
// FILE / REAL DATA SOURCE IMPLEMENTATION
// -------------------------------------------------------------
export class FileSource implements DataSource {
  private sensorReadings: SensorReading[] = [];
  private satelliteSeries: SatelliteObservation[] = [];
  private weatherSeries: WeatherObservation[] = [];
  private modelResults: ModelResults | null = null;
  private filename: string = 'User Upload';
  private dateRangeStr: string = 'Unknown range';

  constructor(
    sensorReadings: SensorReading[] = [],
    satelliteSeries: SatelliteObservation[] = [],
    weatherSeries: WeatherObservation[] = [],
    modelResults: ModelResults | null = null,
    filename: string = 'User Upload'
  ) {
    this.sensorReadings = sensorReadings;
    this.satelliteSeries = satelliteSeries;
    this.weatherSeries = weatherSeries;
    this.modelResults = modelResults;
    this.filename = filename;
    this.computeDateRange();
  }

  private computeDateRange() {
    const dates: string[] = [];
    if (this.sensorReadings.length > 0) {
      dates.push(this.sensorReadings[0].timestamp.slice(0, 10));
      dates.push(this.sensorReadings[this.sensorReadings.length - 1].timestamp.slice(0, 10));
    } else if (this.satelliteSeries.length > 0) {
      dates.push(this.satelliteSeries[0].date);
      dates.push(this.satelliteSeries[this.satelliteSeries.length - 1].date);
    }
    if (dates.length >= 2) {
      this.dateRangeStr = `${dates[0]} to ${dates[dates.length - 1]}`;
    }
  }

  setSensorData(readings: SensorReading[], filename: string) {
    this.sensorReadings = readings;
    this.filename = filename;
    this.computeDateRange();
  }

  setSatelliteData(satellite: SatelliteObservation[]) {
    this.satelliteSeries = satellite;
    this.computeDateRange();
  }

  setWeatherData(weather: WeatherObservation[]) {
    this.weatherSeries = weather;
  }

  setModelData(results: ModelResults) {
    this.modelResults = results;
  }

  getInfo(): DataSourceInfo {
    return {
      mode: 'real',
      sourceName: this.filename,
      dateRange: this.dateRangeStr,
      isSample: this.modelResults === null,
    };
  }

  getSensorReadings(): SensorReading[] {
    return this.sensorReadings;
  }

  getSatelliteSeries(): SatelliteObservation[] {
    return this.satelliteSeries;
  }

  getWeatherSeries(): WeatherObservation[] {
    return this.weatherSeries;
  }

  getModelResults(): ModelResults {
    if (this.modelResults) {
      return this.modelResults;
    }
    return sampleModelResults as unknown as ModelResults;
  }
}

// -------------------------------------------------------------
// CSV / JSON PARSERS & VALIDATION HELPERS
// -------------------------------------------------------------

/**
 * Validates and parses sensor CSV
 * Expected columns: timestamp,soil_raw,temp_c,humidity_pct,status
 */
export function parseSensorCSV(csvText: string): ValidationResult<SensorReading[]> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return { success: false, errors: ['CSV file is empty or missing data rows.'], warnings };
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredCols = ['timestamp', 'soil_raw', 'temp_c', 'humidity_pct', 'status'];
  
  for (const col of requiredCols) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: "${col}". Found: ${header.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  const tsIdx = header.indexOf('timestamp');
  const soilIdx = header.indexOf('soil_raw');
  const tempIdx = header.indexOf('temp_c');
  const humIdx = header.indexOf('humidity_pct');
  const statusIdx = header.indexOf('status');

  const readings: SensorReading[] = [];
  const preview: Record<string, string | number | null>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(s => s.trim());
    if (row.length < requiredCols.length) continue;

    const ts = row[tsIdx];
    const soil = Number(row[soilIdx]);
    const temp = Number(row[tempIdx]);
    const hum = Number(row[humIdx]);
    const rawStatus = row[statusIdx].toUpperCase();

    if (isNaN(Date.parse(ts))) {
      errors.push(`Row ${i + 1}: Invalid ISO-8601 timestamp "${ts}"`);
    }

    if (isNaN(soil) || soil < 500 || soil > 4095) {
      warnings.push(`Row ${i + 1}: Soil ADC reading ${soil} is outside typical range [500, 4095]`);
    }

    if (isNaN(temp) || temp < -20 || temp > 65) {
      warnings.push(`Row ${i + 1}: Temperature ${temp}°C is outside plausible bounds [-20, 65]`);
    }

    if (isNaN(hum) || hum < 0 || hum > 100) {
      warnings.push(`Row ${i + 1}: Humidity ${hum}% is outside range [0, 100]`);
    }

    const validStatus = ['OK', 'ERROR', 'STALE'].includes(rawStatus) ? (rawStatus as 'OK' | 'ERROR' | 'STALE') : 'ERROR';
    if (!['OK', 'ERROR', 'STALE'].includes(rawStatus)) {
      warnings.push(`Row ${i + 1}: Unknown status "${row[statusIdx]}", defaulted to ERROR`);
    }

    const reading: SensorReading = {
      timestamp: ts,
      soil_raw: isNaN(soil) ? 2200 : soil,
      temp_c: isNaN(temp) ? 25 : temp,
      humidity_pct: isNaN(hum) ? 60 : hum,
      status: validStatus,
    };

    readings.push(reading);
    if (preview.length < 5) {
      preview.push({
        timestamp: reading.timestamp,
        soil_raw: reading.soil_raw,
        temp_c: reading.temp_c,
        humidity_pct: reading.humidity_pct,
        status: reading.status,
      });
    }

    if (errors.length > 10) break; // Don't overwhelm UI
  }

  // Check if dates are sorted chronologically
  for (let j = 1; j < readings.length; j++) {
    if (new Date(readings[j].timestamp) < new Date(readings[j - 1].timestamp)) {
      warnings.push('Timestamps are not in strictly ascending chronological order.');
      break;
    }
  }

  return {
    success: errors.length === 0,
    data: readings,
    errors,
    warnings,
    preview,
    totalRows: readings.length,
  };
}

/**
 * Validates and parses satellite series CSV
 * Expected columns: date,ndvi,ndmi,cloud_pct
 */
export function parseSatelliteCSV(csvText: string): ValidationResult<SatelliteObservation[]> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return { success: false, errors: ['Satellite CSV is empty or missing data rows.'], warnings };
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredCols = ['date', 'ndvi', 'ndmi', 'cloud_pct'];

  for (const col of requiredCols) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: "${col}". Found: ${header.join(', ')}`);
    }
  }

  if (errors.length > 0) return { success: false, errors, warnings };

  const dateIdx = header.indexOf('date');
  const ndviIdx = header.indexOf('ndvi');
  const ndmiIdx = header.indexOf('ndmi');
  const cloudIdx = header.indexOf('cloud_pct');

  const obs: SatelliteObservation[] = [];
  const preview: Record<string, string | number | null>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(s => s.trim());
    if (row.length < requiredCols.length) continue;

    const date = row[dateIdx];
    const rawNdvi = row[ndviIdx];
    const rawNdmi = row[ndmiIdx];
    const rawCloud = row[cloudIdx];

    const ndvi = rawNdvi === '' || rawNdvi.toLowerCase() === 'null' ? null : Number(rawNdvi);
    const ndmi = rawNdmi === '' || rawNdmi.toLowerCase() === 'null' ? null : Number(rawNdmi);
    const cloud = Number(rawCloud);

    if (ndvi !== null && (isNaN(ndvi) || ndvi < -1 || ndvi > 1)) {
      warnings.push(`Row ${i + 1}: NDVI value ${rawNdvi} is outside valid range [-1, 1]`);
    }
    if (ndmi !== null && (isNaN(ndmi) || ndmi < -1 || ndmi > 1)) {
      warnings.push(`Row ${i + 1}: NDMI value ${rawNdmi} is outside valid range [-1, 1]`);
    }

    const item: SatelliteObservation = {
      date,
      ndvi: ndvi !== null && !isNaN(ndvi) ? ndvi : null,
      ndmi: ndmi !== null && !isNaN(ndmi) ? ndmi : null,
      cloud_pct: isNaN(cloud) ? 0 : Math.max(0, Math.min(100, cloud)),
    };

    obs.push(item);
    if (preview.length < 5) {
      preview.push({
        date: item.date,
        ndvi: item.ndvi,
        ndmi: item.ndmi,
        cloud_pct: item.cloud_pct,
      });
    }
  }

  return {
    success: errors.length === 0,
    data: obs,
    errors,
    warnings,
    preview,
    totalRows: obs.length,
  };
}

/**
 * Validates and parses weather CSV
 * Expected columns: date,rain_mm,temp_c,humidity_pct
 */
export function parseWeatherCSV(csvText: string): ValidationResult<WeatherObservation[]> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return { success: false, errors: ['Weather CSV is empty or missing data rows.'], warnings };
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredCols = ['date', 'rain_mm', 'temp_c', 'humidity_pct'];

  for (const col of requiredCols) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: "${col}". Found: ${header.join(', ')}`);
    }
  }

  if (errors.length > 0) return { success: false, errors, warnings };

  const dateIdx = header.indexOf('date');
  const rainIdx = header.indexOf('rain_mm');
  const tempIdx = header.indexOf('temp_c');
  const humIdx = header.indexOf('humidity_pct');

  const weather: WeatherObservation[] = [];
  const preview: Record<string, string | number | null>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(s => s.trim());
    if (row.length < requiredCols.length) continue;

    const date = row[dateIdx];
    const rain = Number(row[rainIdx]);
    const temp = Number(row[tempIdx]);
    const hum = Number(row[humIdx]);

    const item: WeatherObservation = {
      date,
      rain_mm: isNaN(rain) ? 0 : Math.max(0, rain),
      temp_c: isNaN(temp) ? 25 : temp,
      humidity_pct: isNaN(hum) ? 50 : Math.max(0, Math.min(100, hum)),
    };

    weather.push(item);
    if (preview.length < 5) {
      preview.push({
        date: item.date,
        rain_mm: item.rain_mm,
        temp_c: item.temp_c,
        humidity_pct: item.humidity_pct,
      });
    }
  }

  return {
    success: errors.length === 0,
    data: weather,
    errors,
    warnings,
    preview,
    totalRows: weather.length,
  };
}

/**
 * Validates and parses model results JSON
 */
export function parseModelResultsJSON(jsonText: string): ValidationResult<ModelResults> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, errors: ['Invalid JSON object.'], warnings };
    }

    if (!parsed.meta || typeof parsed.meta !== 'object') {
      errors.push('Missing "meta" section in model results JSON.');
    } else {
      if (!parsed.meta.target) errors.push('Missing "meta.target" string.');
      if (typeof parsed.meta.horizon_days !== 'number') errors.push('Missing "meta.horizon_days" number.');
      if (!parsed.meta.trained_on) errors.push('Missing "meta.trained_on" date range.');
      if (!parsed.meta.tested_on) errors.push('Missing "meta.tested_on" date range.');
    }

    if (!Array.isArray(parsed.models) || parsed.models.length === 0) {
      errors.push('Missing or empty "models" array in JSON.');
    }

    if (!Array.isArray(parsed.feature_importance)) {
      warnings.push('Missing "feature_importance" array.');
    }

    if (!Array.isArray(parsed.predictions)) {
      warnings.push('Missing "predictions" time-series array.');
    }

    if (errors.length > 0) {
      return { success: false, errors, warnings };
    }

    const preview = (parsed.models || []).slice(0, 3).map((m: ModelComparisonItem) => ({
      name: m.name,
      precision: m.precision,
      recall: m.recall,
      false_alarms: m.false_alarms,
      missed_events: m.missed_events,
    }));

    return {
      success: true,
      data: parsed as ModelResults,
      errors: [],
      warnings,
      preview,
      totalRows: (parsed.models || []).length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      errors: [`JSON syntax error: ${message}`],
      warnings: [],
    };
  }
}
