/**
 * ForestGuard AI - 90-Day Telemetry & Environmental Simulator
 * Pilot Area: Blackwood Creek Watershed (Pilot Plot 4A)
 * 
 * Strict Data Integrity Rules:
 * - Cloudy satellite passes become null gaps (never interpolated or imputed).
 * - Calibrated soil moisture uses physical ADC endpoints (~1200 wet, ~3000 air-dry).
 * - Real simulated sensor statuses: OK, ERROR, STALE.
 */

export type SimulationScenario = 
  | 'Normal season' 
  | 'Dry spell' 
  | 'Heatwave' 
  | 'Sensor dropout' 
  | 'Cloudy satellite gap' 
  | 'Monsoon recovery';

export type SensorHardwareStatus = 'OK' | 'ERROR' | 'STALE';

export interface SoilCalibrationEndpoints {
  adcAirDry: number;  // ~2850 ADC (0% moisture in dry gravelly loam)
  adcWaterWet: number; // ~1350 ADC (100% field saturation)
}

export const DEFAULT_CALIBRATION: SoilCalibrationEndpoints = {
  adcAirDry: 2850,
  adcWaterWet: 1350,
};

export interface SeasonalBaseline {
  soilPct: number;
  tempC: number;
  humidityPct: number;
  rainfallMm: number;
  ndvi: number;
  ndmi: number;
}

export interface DayObservation {
  dayIndex: number;
  dateString: string; // ISO format: YYYY-MM-DD
  timestamp: number;
  // In-situ ground sensors
  soilRaw: number; // ADC raw (1200 - 3000)
  calibratedSoilPct: number; // 0 - 100%
  tempC: number;
  humidityPct: number;
  rainfallMm: number;
  sensorStatus: SensorHardwareStatus;
  // Remote Sensing (Sentinel-2 MSI passes every 5 days)
  isSatellitePass: boolean;
  cloudPct: number | null;
  ndvi: number | null; // null if cloudy (>35% clouds) or not a pass day
  ndmi: number | null; // Normalized Difference Moisture Index: null if cloudy
  // Seasonal reference baselines
  seasonalBaseline: SeasonalBaseline;
  notes: string;
}

export interface LiveTickReading {
  timestamp: string; // ISO string
  soil_raw: number;
  calibrated_soil_pct: number;
  temp_c: number;
  humidity_pct: number;
  status: SensorHardwareStatus;
  formattedCsv: string; // "timestamp,soil_raw,temp_c,humidity_pct,status"
}

export interface ScenarioProfile {
  id: SimulationScenario;
  name: string;
  description: string;
  expectedStatus: 'NORMAL MONITORING' | 'WATCH' | 'FIELD CHECK RECOMMENDED' | 'DATA INCOMPLETE';
}

export const SCENARIO_PROFILES: Record<SimulationScenario, ScenarioProfile> = {
  'Normal season': {
    id: 'Normal season',
    name: 'Normal Season Baseline',
    description: 'Equilibrium microclimate with periodic precipitation and stable canopy reflectance.',
    expectedStatus: 'NORMAL MONITORING',
  },
  'Dry spell': {
    id: 'Dry spell',
    name: 'Extended Dry Spell',
    description: 'Sustained absence of rain with soil moisture dropping below 22% across 14+ consecutive days.',
    expectedStatus: 'FIELD CHECK RECOMMENDED',
  },
  'Heatwave': {
    id: 'Heatwave',
    name: 'Midsummer Heatwave',
    description: 'Ambient temperatures 5-7°C above seasonal baseline with vapor deficit; triggers localized Watch.',
    expectedStatus: 'WATCH',
  },
  'Sensor dropout': {
    id: 'Sensor dropout',
    name: 'Hardware Sensor Dropout',
    description: 'LoRa node reports ADC rail fault and packet timeout (STALE/ERROR); suppresses confident status.',
    expectedStatus: 'DATA INCOMPLETE',
  },
  'Cloudy satellite gap': {
    id: 'Cloudy satellite gap',
    name: 'Persistent Cloud Cover Gap',
    description: '3 consecutive cloudy Sentinel-2 passes produce null observation gaps; remote sensing held incomplete.',
    expectedStatus: 'DATA INCOMPLETE',
  },
  'Monsoon recovery': {
    id: 'Monsoon recovery',
    name: 'Rain Event & Recovery',
    description: 'Prior dry stress alleviated by heavy rainfall; rapid soil replenishment returning to equilibrium.',
    expectedStatus: 'NORMAL MONITORING',
  },
};

/**
 * Converts raw ADC reading into calibrated volumetric soil moisture percentage
 */
export function rawAdcToCalibratedPct(
  rawAdc: number,
  calibration: SoilCalibrationEndpoints = DEFAULT_CALIBRATION
): number {
  if (rawAdc <= 0 || isNaN(rawAdc)) return 0;
  const { adcAirDry, adcWaterWet } = calibration;
  const span = adcAirDry - adcWaterWet;
  if (span <= 0) return 0;

  // Higher ADC = drier soil; lower ADC = wetter soil
  const ratio = (adcAirDry - rawAdc) / span;
  const clamped = Math.max(0, Math.min(1, ratio));
  return Math.round(clamped * 1000) / 10; // 1 decimal place (e.g. 24.5%)
}

/**
 * Converts calibrated soil percentage back into raw ADC
 */
export function calibratedPctToRawAdc(
  pct: number,
  calibration: SoilCalibrationEndpoints = DEFAULT_CALIBRATION
): number {
  const { adcAirDry, adcWaterWet } = calibration;
  const span = adcAirDry - adcWaterWet;
  const fraction = Math.max(0, Math.min(100, pct)) / 100;
  return Math.round(adcAirDry - fraction * span);
}

/**
 * Deterministic pseudo-random number generator for reproducible simulated telemetry
 */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates the full 90-day dataset for the chosen scenario
 */
export function generate90DayDataset(
  scenario: SimulationScenario = 'Normal season',
  startDate: Date = new Date('2026-08-01T00:00:00Z'),
  calibration: SoilCalibrationEndpoints = DEFAULT_CALIBRATION
): DayObservation[] {
  const rng = seededRandom(101 + scenario.length * 17);
  const data: DayObservation[] = [];

  for (let day = 0; day < 90; day++) {
    const curDate = new Date(startDate.getTime() + day * 86400000);
    const dateString = curDate.toISOString().split('T')[0];
    const timestamp = curDate.getTime();

    // Baseline cyclical curve (late summer drying into autumn)
    const seasonalProgress = day / 90;
    const baseTemp = 24 + Math.sin(seasonalProgress * Math.PI) * 4;
    const baseHumidity = 58 - Math.sin(seasonalProgress * Math.PI) * 10;
    const baseSoil = 36 - seasonalProgress * 8;
    const baseRainfall = day % 12 === 0 ? 12 : day % 7 === 0 ? 4 : 0;
    const baseNdvi = 0.72 - seasonalProgress * 0.08;
    const baseNdmi = 0.38 - seasonalProgress * 0.09;

    const seasonalBaseline: SeasonalBaseline = {
      soilPct: Math.round(baseSoil * 10) / 10,
      tempC: Math.round(baseTemp * 10) / 10,
      humidityPct: Math.round(baseHumidity),
      rainfallMm: baseRainfall,
      ndvi: Math.round(baseNdvi * 100) / 100,
      ndmi: Math.round(baseNdmi * 100) / 100,
    };

    let soilPct = baseSoil + (rng() * 4 - 2);
    let tempC = baseTemp + (rng() * 3 - 1.5);
    let humidityPct = baseHumidity + (rng() * 8 - 4);
    let rainfallMm = (rng() < 0.15) ? Math.round(rng() * 14 * 10) / 10 : 0;
    let sensorStatus: SensorHardwareStatus = 'OK';
    let notes = 'Normal cyclical seasonal conditions.';

    // Sentinel-2 passes every 5 days
    const isSatellitePass = (day % 5 === 0);
    let cloudPct: number | null = isSatellitePass ? Math.round(rng() * 25) : null;
    let ndvi: number | null = isSatellitePass ? baseNdvi + (rng() * 0.04 - 0.02) : null;
    let ndmi: number | null = isSatellitePass ? baseNdmi + (rng() * 0.04 - 0.02) : null;

    // Apply Scenario Perturbations
    switch (scenario) {
      case 'Normal season':
        // Mild variation around seasonal baseline
        break;

      case 'Dry spell':
        // Zero rainfall from day 40 onwards; soil drops to 14%; NDVI and NDMI drop significantly
        if (day >= 35) {
          rainfallMm = 0;
          const dryFactor = Math.min(1, (day - 35) / 30);
          soilPct = Math.max(12, baseSoil - dryFactor * 22);
          humidityPct = Math.max(22, baseHumidity - dryFactor * 26);
          tempC = baseTemp + dryFactor * 4;
          if (isSatellitePass) {
            ndvi = Math.max(0.42, (ndvi ?? baseNdvi) - dryFactor * 0.22);
            ndmi = Math.max(0.08, (ndmi ?? baseNdmi) - dryFactor * 0.24);
          }
          notes = day > 50 
            ? 'Prolonged soil drought (>15 consecutive dry days); red-edge moisture depletion.' 
            : 'Early dry sequence onset; ground moisture descending.';
        }
        break;

      case 'Heatwave':
        // Acute thermal spike between day 60 and 78
        if (day >= 58 && day <= 76) {
          tempC = baseTemp + 6.8 + (rng() * 2);
          humidityPct = Math.max(18, baseHumidity - 24);
          soilPct = Math.max(19, soilPct - 8);
          rainfallMm = 0;
          notes = 'Thermal air mass anomaly; vapor pressure deficit elevated.';
        }
        break;

      case 'Sensor dropout':
        // Sensor drops out between day 70 and 85
        if (day >= 70 && day <= 86) {
          sensorStatus = day % 3 === 0 ? 'ERROR' : 'STALE';
          // Out of bounds ADC reading simulating circuit failure
          soilPct = 0;
          notes = 'ESP32 LoRa node payload timeout / ADC rail open circuit.';
        }
        break;

      case 'Cloudy satellite gap':
        // Persistent cloud cover on passes from day 45 to 75
        if (day >= 45 && day <= 75 && isSatellitePass) {
          cloudPct = 85 + Math.round(rng() * 14);
          // Strict Rule: Never interpolate cloudy passes; set strictly to null
          ndvi = null;
          ndmi = null;
          notes = 'Sentinel-2 optical pass occluded by cumulus deck (>80% cloud cover). Data gap preserved.';
        }
        break;

      case 'Monsoon recovery':
        // Dry until day 50, then consecutive heavy storm events
        if (day < 50) {
          soilPct = Math.max(16, baseSoil - 14);
          rainfallMm = 0;
        } else if (day >= 50 && day <= 58) {
          rainfallMm = 38 + Math.round(rng() * 25);
          soilPct = Math.min(88, baseSoil + 35);
          humidityPct = 88;
          notes = 'Heavy rainfall event replenishing root zone matric reserves.';
        } else {
          soilPct = Math.min(65, baseSoil + 15);
          humidityPct = 72;
          if (isSatellitePass && ndvi !== null) {
            ndvi = Math.min(0.82, ndvi + 0.12);
            ndmi = Math.min(0.48, (ndmi ?? baseNdmi) + 0.14);
          }
          notes = 'Canopy recovery and soil moisture recharge post-precipitation.';
        }
        break;
    }

    // Cloud gating for all passes: if clouds > 35%, nullify reflectance per Copernicus quality protocol
    if (isSatellitePass && cloudPct !== null && cloudPct > 35) {
      ndvi = null;
      ndmi = null;
    }

    // Derive raw ADC from soil %
    let soilRaw: number;
    if (sensorStatus === 'ERROR') {
      soilRaw = 4095; // Full rail error
    } else if (sensorStatus === 'STALE') {
      soilRaw = 3450; // Out of calibration range
    } else {
      soilRaw = calibratedPctToRawAdc(soilPct, calibration);
    }

    data.push({
      dayIndex: day,
      dateString,
      timestamp,
      soilRaw,
      calibratedSoilPct: Math.round(soilPct * 10) / 10,
      tempC: Math.round(tempC * 10) / 10,
      humidityPct: Math.round(humidityPct),
      rainfallMm: Math.round(rainfallMm * 10) / 10,
      sensorStatus,
      isSatellitePass,
      cloudPct,
      ndvi: ndvi !== null ? Math.round(ndvi * 1000) / 1000 : null,
      ndmi: ndmi !== null ? Math.round(ndmi * 1000) / 1000 : null,
      seasonalBaseline,
      notes,
    });
  }

  return data;
}

/**
 * Generates a live tick reading (5-minute telemetry interval representation)
 */
export function tick(
  lastReading?: LiveTickReading,
  scenario: SimulationScenario = 'Normal season',
  calibration: SoilCalibrationEndpoints = DEFAULT_CALIBRATION
): LiveTickReading {
  const now = new Date();
  const timestamp = now.toISOString();

  let soilRaw = lastReading ? lastReading.soil_raw : 2100;
  let tempC = lastReading ? lastReading.temp_c : 24.2;
  let humidityPct = lastReading ? lastReading.humidity_pct : 54;
  let status: SensorHardwareStatus = 'OK';

  // Apply slight random walk or scenario bias
  const jitter = (Math.random() - 0.5);

  if (scenario === 'Dry spell') {
    soilRaw = Math.min(DEFAULT_CALIBRATION.adcAirDry - 50, soilRaw + 4 + jitter * 2);
    tempC = Math.min(36, tempC + 0.1 + jitter * 0.2);
    humidityPct = Math.max(20, humidityPct - 0.2);
  } else if (scenario === 'Heatwave') {
    tempC = Math.min(38.5, 31 + Math.random() * 3);
    humidityPct = Math.max(22, 35 - Math.random() * 5);
    soilRaw = Math.min(2650, soilRaw + 2);
  } else if (scenario === 'Sensor dropout') {
    status = Math.random() > 0.4 ? 'STALE' : 'ERROR';
    soilRaw = status === 'ERROR' ? 4095 : 3400;
  } else if (scenario === 'Monsoon recovery') {
    soilRaw = Math.max(DEFAULT_CALIBRATION.adcWaterWet + 50, soilRaw - 8 + jitter * 2);
    tempC = 21.0 + jitter * 0.5;
    humidityPct = Math.min(92, humidityPct + 0.4);
  } else {
    // Normal season
    soilRaw = Math.max(1600, Math.min(2400, soilRaw + Math.round(jitter * 6)));
    tempC = Math.round((tempC + jitter * 0.2) * 10) / 10;
    humidityPct = Math.round(Math.max(40, Math.min(75, humidityPct + jitter)));
  }

  const calibratedSoil = rawAdcToCalibratedPct(soilRaw, calibration);

  const formattedCsv = `${timestamp},${soilRaw},${tempC.toFixed(1)},${humidityPct},${status}`;

  return {
    timestamp,
    soil_raw: soilRaw,
    calibrated_soil_pct: calibratedSoil,
    temp_c: Math.round(tempC * 10) / 10,
    humidity_pct: Math.round(humidityPct),
    status,
    formattedCsv,
  };
}
