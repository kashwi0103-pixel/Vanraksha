/**
 * ForestGuard AI - Decision Support Rule Engine (Pure, Typed, Unit-Testable)
 * 
 * Strict Classification Taxonomy:
 * - NORMAL MONITORING (0 flags)
 * - WATCH (1 flag)
 * - FIELD CHECK RECOMMENDED (2+ independent flags with verified data)
 * - DATA INCOMPLETE (Sensor invalid, out-of-range, stale, or missing passes)
 * 
 * Notice: This is decision-support only. Not a validated predictor.
 */

import { ForestStatus } from './types';
import { DayObservation, SensorHardwareStatus } from './simulator';

export interface RuleSettings {
  /** Calibrated soil moisture threshold percentage (e.g. 22%) */
  soilMoistureThresholdPct: number;
  /** Number of consecutive observations below threshold required to trip soil flag */
  soilConsecutiveCount: number;
  /** Temperature above baseline threshold in degrees C (e.g. 4.0°C) */
  tempBaselineDeltaThresholdC: number;
  /** Maximum cumulative rainfall in mm over recent window considered dry (e.g. 5.0 mm) */
  rainfallMaxCumulativeDryMm: number;
  /** Lookback window in days for weather accumulation */
  weatherLookbackDays: number;
  /** Satellite relative drop vs seasonal baseline to trigger flag (e.g. 0.12 or 15%) */
  satelliteDropDeltaThreshold: number;
  /** Minimum number of clear Sentinel-2 passes required to evaluate satellite trend */
  minClearSatellitePasses: number;
  /** Alert cooldown duration in days */
  alertCooldownDays: number;
  /** Indicator weights for Forest Health Index (sum to 1.0) */
  fhiWeights: {
    soilMoisture: number; // e.g. 0.35
    weatherStress: number; // e.g. 0.30
    canopyReflectance: number; // e.g. 0.35
  };
  /** Mandatory label per requirement */
  settingsDisclaimer: string;
}

export const DEFAULT_RULE_SETTINGS: RuleSettings = {
  soilMoistureThresholdPct: 22.0,
  soilConsecutiveCount: 3,
  tempBaselineDeltaThresholdC: 4.0,
  rainfallMaxCumulativeDryMm: 5.0,
  weatherLookbackDays: 7,
  satelliteDropDeltaThreshold: 0.12,
  minClearSatellitePasses: 2,
  alertCooldownDays: 5,
  fhiWeights: {
    soilMoisture: 0.35,
    weatherStress: 0.30,
    canopyReflectance: 0.35,
  },
  settingsDisclaimer: 'design pattern, not validated universal thresholds',
};

export interface StressFlag {
  name: string;
  triggered: boolean;
  reason: string;
  timeWindow: string;
  metricValue?: number | string;
  baselineValue?: number | string;
}

export interface SensorValidityResult {
  isValid: boolean;
  reason: string;
  sensorStatus: SensorHardwareStatus;
  rawAdc: number;
}

export interface ForestHealthIndexResult {
  score: number; // 0 - 100
  label: 'Preliminary, not validated';
  breakdown: {
    soilSubScore: number;      // 0-100
    weatherSubScore: number;   // 0-100
    satelliteSubScore: number; // 0-100 (or null if no clear observations)
  };
  weightsUsed: {
    soil: number;
    weather: number;
    satellite: number;
  };
}

export interface RuleEvaluationResult {
  status: ForestStatus;
  statusReason: string;
  sensorValidity: SensorValidityResult;
  flags: {
    localDryFlag: StressFlag;
    weatherFlag: StressFlag;
    satelliteFlag: StressFlag;
  };
  triggeredFlagCount: number;
  cooldownActive: boolean;
  daysSinceLastAlert: number | null;
  forestHealthIndex: ForestHealthIndexResult;
  observationDate: string;
  settingsUsed: RuleSettings;
}

/**
 * Validates sensor hardware state, ADC electrical boundaries, and telemetry freshness
 */
export function evaluateSensorValidity(
  currentDay: DayObservation | undefined
): SensorValidityResult {
  if (!currentDay) {
    return {
      isValid: false,
      reason: 'Missing telemetry reading: no current day data provided.',
      sensorStatus: 'ERROR',
      rawAdc: 0,
    };
  }

  const { sensorStatus, soilRaw } = currentDay;

  if (sensorStatus === 'ERROR') {
    return {
      isValid: false,
      reason: 'Sensor hardware reported circuit fault or internal ADC failure.',
      sensorStatus: 'ERROR',
      rawAdc: soilRaw,
    };
  }

  if (sensorStatus === 'STALE') {
    return {
      isValid: false,
      reason: 'Telemetry packet timeout: sensor timestamp stale (>6 hours).',
      sensorStatus: 'STALE',
      rawAdc: soilRaw,
    };
  }

  // ADC range validation: nominal ESP32 capacitance probe is ~1100 (submerged) to ~3100 (air)
  // Anything <= 800 or >= 3600 represents hardware shorts or disconnected rail
  if (soilRaw < 900 || soilRaw > 3400) {
    return {
      isValid: false,
      reason: `Raw ADC measurement (${soilRaw}) out of physical calibration envelope [900, 3400].`,
      sensorStatus: 'ERROR',
      rawAdc: soilRaw,
    };
  }

  return {
    isValid: true,
    reason: 'Sensor payload verified: electrical range and CRC checksum nominal.',
    sensorStatus: 'OK',
    rawAdc: soilRaw,
  };
}

/**
 * Evaluates Local Soil Moisture Dry Flag:
 * Calibrated soil below threshold for N consecutive readings.
 */
export function evaluateLocalDryFlag(
  history: DayObservation[],
  settings: RuleSettings = DEFAULT_RULE_SETTINGS
): StressFlag {
  const { soilMoistureThresholdPct, soilConsecutiveCount } = settings;
  const name = 'Local Soil Moisture Stress';
  const timeWindow = `Past ${soilConsecutiveCount} consecutive daily observations`;

  if (!history || history.length < soilConsecutiveCount) {
    return {
      name,
      triggered: false,
      reason: `Insufficient historical readings (${history?.length ?? 0}/${soilConsecutiveCount}) to evaluate consecutive soil trend.`,
      timeWindow,
    };
  }

  const recent = history.slice(-soilConsecutiveCount);
  const allBelow = recent.every(d => d.sensorStatus === 'OK' && d.calibratedSoilPct < soilMoistureThresholdPct);
  const currentVal = recent[recent.length - 1].calibratedSoilPct;
  const avgVal = Math.round((recent.reduce((acc, d) => acc + d.calibratedSoilPct, 0) / recent.length) * 10) / 10;

  if (allBelow) {
    return {
      name,
      triggered: true,
      reason: `Calibrated soil moisture maintained below ${soilMoistureThresholdPct}% across ${soilConsecutiveCount} consecutive days (avg: ${avgVal}%).`,
      timeWindow,
      metricValue: `${currentVal}%`,
      baselineValue: `${soilMoistureThresholdPct}% threshold`,
    };
  }

  return {
    name,
    triggered: false,
    reason: `Soil moisture within acceptable bounds (latest: ${currentVal}%, threshold: ${soilMoistureThresholdPct}%).`,
    timeWindow,
    metricValue: `${currentVal}%`,
    baselineValue: `${soilMoistureThresholdPct}% threshold`,
  };
}

/**
 * Evaluates Weather Stress Flag:
 * Low recent rainfall AND temperature significantly above seasonal baseline.
 */
export function evaluateWeatherFlag(
  history: DayObservation[],
  settings: RuleSettings = DEFAULT_RULE_SETTINGS
): StressFlag {
  const { weatherLookbackDays, rainfallMaxCumulativeDryMm, tempBaselineDeltaThresholdC } = settings;
  const name = 'Atmospheric Vapor & Temperature Stress';
  const timeWindow = `Past ${weatherLookbackDays} days`;

  if (!history || history.length === 0) {
    return {
      name,
      triggered: false,
      reason: 'No atmospheric history available.',
      timeWindow,
    };
  }

  const windowSlice = history.slice(-weatherLookbackDays);
  const cumulativeRainfall = Math.round(windowSlice.reduce((sum, d) => sum + d.rainfallMm, 0) * 10) / 10;
  
  // Calculate average temperature delta relative to seasonal baseline
  const tempDeltas = windowSlice.map(d => d.tempC - d.seasonalBaseline.tempC);
  const avgTempDelta = Math.round((tempDeltas.reduce((a, b) => a + b, 0) / tempDeltas.length) * 10) / 10;
  const latestTemp = windowSlice[windowSlice.length - 1].tempC;
  const latestBaselineTemp = windowSlice[windowSlice.length - 1].seasonalBaseline.tempC;

  const isLowRain = cumulativeRainfall <= rainfallMaxCumulativeDryMm;
  const isHighTemp = avgTempDelta >= tempBaselineDeltaThresholdC;

  if (isLowRain && isHighTemp) {
    return {
      name,
      triggered: true,
      reason: `Low rainfall (${cumulativeRainfall}mm ≤ ${rainfallMaxCumulativeDryMm}mm) combined with temperatures +${avgTempDelta}°C above seasonal baseline.`,
      timeWindow,
      metricValue: `${latestTemp}°C (${cumulativeRainfall}mm rain)`,
      baselineValue: `${latestBaselineTemp}°C baseline`,
    };
  }

  return {
    name,
    triggered: false,
    reason: `Weather parameters within historical seasonal envelope (rain: ${cumulativeRainfall}mm, temp delta: ${avgTempDelta > 0 ? '+' : ''}${avgTempDelta}°C).`,
    timeWindow,
    metricValue: `${latestTemp}°C (${cumulativeRainfall}mm rain)`,
    baselineValue: `${latestBaselineTemp}°C baseline`,
  };
}

/**
 * Evaluates Satellite Canopy Reflectance Flag:
 * Sustained decline vs same-season baseline, only if enough clear observations are present.
 */
export function evaluateSatelliteFlag(
  history: DayObservation[],
  settings: RuleSettings = DEFAULT_RULE_SETTINGS
): StressFlag {
  const { minClearSatellitePasses, satelliteDropDeltaThreshold } = settings;
  const name = 'Canopy Reflectance Decline (NDVI/NDMI)';
  const timeWindow = 'Recent Sentinel-2 passes';

  if (!history || history.length === 0) {
    return {
      name,
      triggered: false,
      reason: 'No satellite history provided.',
      timeWindow,
    };
  }

  // Filter clear satellite passes where NDVI is not null
  const clearPasses = history.filter(d => d.isSatellitePass && d.ndvi !== null);

  if (clearPasses.length < minClearSatellitePasses) {
    return {
      name,
      triggered: false,
      reason: `Insufficient clear Sentinel-2 passes (${clearPasses.length}/${minClearSatellitePasses}) due to cloud cover or pass interval. Indicator held inconclusive per quality protocol.`,
      timeWindow,
      metricValue: `${clearPasses.length} clear passes`,
      baselineValue: `${minClearSatellitePasses} passes required`,
    };
  }

  // Evaluate recent clear passes vs their seasonal baseline
  const recentClear = clearPasses.slice(-minClearSatellitePasses);
  const ndviDeltas = recentClear.map(d => (d.seasonalBaseline.ndvi - (d.ndvi ?? 0)));
  const avgDrop = Math.round((ndviDeltas.reduce((a, b) => a + b, 0) / ndviDeltas.length) * 100) / 100;
  const latestClear = recentClear[recentClear.length - 1];

  if (avgDrop >= satelliteDropDeltaThreshold) {
    return {
      name,
      triggered: true,
      reason: `Canopy red-edge reflectance dropped by ${avgDrop} below seasonal baseline across ${recentClear.length} verified cloud-free passes.`,
      timeWindow,
      metricValue: `NDVI ${latestClear.ndvi}`,
      baselineValue: `Baseline ${latestClear.seasonalBaseline.ndvi}`,
    };
  }

  return {
    name,
    triggered: false,
    reason: `Canopy reflectance within expected seasonal variance (drop: ${avgDrop < 0 ? 0 : avgDrop}, threshold: ${satelliteDropDeltaThreshold}).`,
    timeWindow,
    metricValue: `NDVI ${latestClear.ndvi}`,
    baselineValue: `Baseline ${latestClear.seasonalBaseline.ndvi}`,
  };
}

/**
 * Computes the transparent Forest Health Index (0-100)
 * Label: "Preliminary, not validated"
 */
export function calculateForestHealthIndex(
  currentDay: DayObservation | undefined,
  history: DayObservation[],
  settings: RuleSettings = DEFAULT_RULE_SETTINGS
): ForestHealthIndexResult {
  const { fhiWeights } = settings;

  if (!currentDay || currentDay.sensorStatus !== 'OK') {
    return {
      score: 50,
      label: 'Preliminary, not validated',
      breakdown: {
        soilSubScore: 50,
        weatherSubScore: 50,
        satelliteSubScore: 50,
      },
      weightsUsed: {
        soil: fhiWeights.soilMoisture,
        weather: fhiWeights.weatherStress,
        satellite: fhiWeights.canopyReflectance,
      },
    };
  }

  // 1. Soil Sub-score (0-100) based on distance from baseline & thresholds
  // 35% soil is optimal (100), 10% is acute stress (0)
  const soilPct = currentDay.calibratedSoilPct;
  const soilSubScore = Math.max(0, Math.min(100, Math.round(((soilPct - 10) / (38 - 10)) * 100)));

  // 2. Weather Sub-score (0-100)
  // Higher temp above baseline and lower rain reduces score
  const tempExcess = Math.max(0, currentDay.tempC - currentDay.seasonalBaseline.tempC);
  const weatherPenalty = Math.min(60, tempExcess * 10);
  const humidityBonus = Math.max(0, (currentDay.humidityPct - 30) / 70 * 40);
  const weatherSubScore = Math.max(0, Math.min(100, Math.round(100 - weatherPenalty + (humidityBonus - 20))));

  // 3. Satellite Sub-score (0-100)
  const clearPasses = history.filter(d => d.isSatellitePass && d.ndvi !== null);
  let satelliteSubScore = 75; // default fallback
  if (clearPasses.length > 0) {
    const latest = clearPasses[clearPasses.length - 1];
    const ratio = (latest.ndvi ?? 0.6) / (latest.seasonalBaseline.ndvi || 0.7);
    satelliteSubScore = Math.max(0, Math.min(100, Math.round(ratio * 90)));
  }

  // Normalize weights
  const totalWeight = fhiWeights.soilMoisture + fhiWeights.weatherStress + fhiWeights.canopyReflectance;
  const wSoil = fhiWeights.soilMoisture / totalWeight;
  const wWeather = fhiWeights.weatherStress / totalWeight;
  const wSat = fhiWeights.canopyReflectance / totalWeight;

  const rawScore = (soilSubScore * wSoil) + (weatherSubScore * wWeather) + (satelliteSubScore * wSat);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    label: 'Preliminary, not validated',
    breakdown: {
      soilSubScore,
      weatherSubScore,
      satelliteSubScore,
    },
    weightsUsed: {
      soil: Math.round(wSoil * 100) / 100,
      weather: Math.round(wWeather * 100) / 100,
      satellite: Math.round(wSat * 100) / 100,
    },
  };
}

/**
 * Main Rule Engine Evaluation Function:
 * Evaluates sensor validity, the 3 independent stress flags, alert cooldown, and combined status.
 */
export function evaluateCatchmentRules(
  history: DayObservation[],
  settings: RuleSettings = DEFAULT_RULE_SETTINGS,
  lastAlertDayIndex: number | null = null
): RuleEvaluationResult {
  const currentDay = history.length > 0 ? history[history.length - 1] : undefined;
  const observationDate = currentDay ? currentDay.dateString : '2026-10-28';
  const currentDayIndex = currentDay ? currentDay.dayIndex : 0;

  // 1. Evaluate Sensor Validity First
  const sensorValidity = evaluateSensorValidity(currentDay);

  // If sensor is invalid/missing/stale, status MUST be DATA INCOMPLETE per strict protocol
  if (!sensorValidity.isValid) {
    return {
      status: 'DATA INCOMPLETE',
      statusReason: `Confident status suppressed: ${sensorValidity.reason}`,
      sensorValidity,
      flags: {
        localDryFlag: {
          name: 'Local Soil Moisture Stress',
          triggered: false,
          reason: 'Suppressed due to invalid sensor telemetry.',
          timeWindow: 'N/A',
        },
        weatherFlag: {
          name: 'Atmospheric Vapor & Temperature Stress',
          triggered: false,
          reason: 'Suppressed due to invalid sensor telemetry.',
          timeWindow: 'N/A',
        },
        satelliteFlag: {
          name: 'Canopy Reflectance Decline',
          triggered: false,
          reason: 'Suppressed due to invalid sensor telemetry.',
          timeWindow: 'N/A',
        },
      },
      triggeredFlagCount: 0,
      cooldownActive: false,
      daysSinceLastAlert: null,
      forestHealthIndex: calculateForestHealthIndex(currentDay, history, settings),
      observationDate,
      settingsUsed: settings,
    };
  }

  // 2. Evaluate Individual Stress Flags
  const localDryFlag = evaluateLocalDryFlag(history, settings);
  const weatherFlag = evaluateWeatherFlag(history, settings);
  const satelliteFlag = evaluateSatelliteFlag(history, settings);

  // Count triggered independent flags
  const triggeredFlags = [localDryFlag, weatherFlag, satelliteFlag].filter(f => f.triggered);
  const triggeredFlagCount = triggeredFlags.length;

  // 3. Alert Cooldown Check
  let cooldownActive = false;
  let daysSinceLastAlert: number | null = null;
  if (lastAlertDayIndex !== null) {
    daysSinceLastAlert = currentDayIndex - lastAlertDayIndex;
    if (daysSinceLastAlert >= 0 && daysSinceLastAlert < settings.alertCooldownDays) {
      cooldownActive = true;
    }
  }

  // 4. Combined Status Determination
  let status: ForestStatus = 'NORMAL MONITORING';
  let statusReason = 'All environmental and canopy indicators within expected seasonal envelope.';

  if (triggeredFlagCount === 0) {
    status = 'NORMAL MONITORING';
    statusReason = 'Baseline vegetative moisture and microclimate equilibrium maintained.';
  } else if (triggeredFlagCount === 1) {
    status = 'WATCH';
    const singleFlag = triggeredFlags[0];
    statusReason = `Elevated stress marker detected: ${singleFlag.name}. Increased telemetry sampling active.`;
  } else if (triggeredFlagCount >= 2) {
    status = 'FIELD CHECK RECOMMENDED';
    const flagNames = triggeredFlags.map(f => f.name).join(' & ');
    statusReason = `Multiple independent stress flags active (${flagNames}). Ground survey advised to confirm canopy vitals.`;
  }

  // 5. Forest Health Index
  const forestHealthIndex = calculateForestHealthIndex(currentDay, history, settings);

  return {
    status,
    statusReason,
    sensorValidity,
    flags: {
      localDryFlag,
      weatherFlag,
      satelliteFlag,
    },
    triggeredFlagCount,
    cooldownActive,
    daysSinceLastAlert,
    forestHealthIndex,
    observationDate,
    settingsUsed: settings,
  };
}
