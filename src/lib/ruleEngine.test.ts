import test from 'node:test';
import assert from 'node:assert/strict';
import { generate90DayDataset, rawAdcToCalibratedPct, calibratedPctToRawAdc, tick } from './simulator';
import { 
  evaluateCatchmentRules, 
  evaluateSensorValidity, 
  evaluateLocalDryFlag, 
  evaluateWeatherFlag, 
  evaluateSatelliteFlag,
  calculateForestHealthIndex,
  DEFAULT_RULE_SETTINGS,
  RuleSettings
} from './ruleEngine';

test('Sensor Validity: detects valid nominal ADC readings and suppresses status on faults', () => {
  const dataset = generate90DayDataset('Normal season');
  const nominalDay = dataset[10];
  const validResult = evaluateSensorValidity(nominalDay);
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.sensorStatus, 'OK');

  // Hardware ERROR state
  const errorDay = { ...nominalDay, sensorStatus: 'ERROR' as const };
  const errResult = evaluateSensorValidity(errorDay);
  assert.equal(errResult.isValid, false);

  // Stale reading (>6h)
  const staleDay = { ...nominalDay, sensorStatus: 'STALE' as const };
  const staleResult = evaluateSensorValidity(staleDay);
  assert.equal(staleResult.isValid, false);

  // Out of range ADC
  const outOfRangeDay = { ...nominalDay, soilRaw: 3950 };
  const outResult = evaluateSensorValidity(outOfRangeDay);
  assert.equal(outResult.isValid, false);
});

test('Scenario Test: "Normal season" results in NORMAL MONITORING (0 flags)', () => {
  const dataset = generate90DayDataset('Normal season');
  // Evaluate over 60 days
  const history = dataset.slice(0, 60);
  const result = evaluateCatchmentRules(history);

  assert.equal(result.sensorValidity.isValid, true);
  assert.equal(result.status, 'NORMAL MONITORING');
  assert.equal(result.triggeredFlagCount, 0);
  assert.equal(result.flags.localDryFlag.triggered, false);
  assert.equal(result.flags.weatherFlag.triggered, false);
  assert.ok(result.forestHealthIndex.score >= 60, 'FHI should remain healthy');
  assert.equal(result.forestHealthIndex.label, 'Preliminary, not validated');
});

test('Scenario Test: "Heatwave" triggers Weather Flag and resolves to WATCH (1 flag)', () => {
  const dataset = generate90DayDataset('Heatwave');
  // Evaluate during the heatwave window around day 70
  const history = dataset.slice(0, 72);
  const result = evaluateCatchmentRules(history);

  assert.equal(result.sensorValidity.isValid, true);
  assert.equal(result.flags.weatherFlag.triggered, true, 'Weather flag should trigger on elevated temperature anomaly');
  assert.equal(result.status, 'WATCH', '1 flag should yield WATCH');
  assert.ok(result.statusReason.includes('Atmospheric Vapor & Temperature Stress'));
});

test('Scenario Test: "Dry spell" triggers Soil and Satellite flags -> FIELD CHECK RECOMMENDED (2+ flags)', () => {
  const dataset = generate90DayDataset('Dry spell');
  // Evaluate after 30 days of drought (e.g. day 75)
  const history = dataset.slice(0, 75);
  const result = evaluateCatchmentRules(history);

  assert.equal(result.flags.localDryFlag.triggered, true, 'Soil dry flag should trigger on prolonged low moisture');
  assert.ok(result.triggeredFlagCount >= 2, 'Should trigger at least 2 independent flags (soil + satellite/weather)');
  assert.equal(result.status, 'FIELD CHECK RECOMMENDED', '2+ independent flags must resolve to FIELD CHECK RECOMMENDED');
  assert.ok(result.forestHealthIndex.score < 50, 'FHI should drop under severe multi-source stress');
});

test('Scenario Test: "Sensor dropout" forces status to DATA INCOMPLETE', () => {
  const dataset = generate90DayDataset('Sensor dropout');
  // During dropout window (day 78)
  const history = dataset.slice(0, 78);
  const result = evaluateCatchmentRules(history);

  assert.equal(result.sensorValidity.isValid, false);
  assert.equal(result.status, 'DATA INCOMPLETE');
  assert.ok(result.statusReason.includes('Confident status suppressed'));
});

test('Scenario Test: "Cloudy satellite gap" preserves null pass gaps and does not trigger false alarms', () => {
  const dataset = generate90DayDataset('Cloudy satellite gap');
  // Check passes between day 45 and 75
  const cloudyPasses = dataset.filter(d => d.dayIndex >= 45 && d.dayIndex <= 75 && d.isSatellitePass);
  assert.ok(cloudyPasses.length >= 3, 'Should have multiple satellite passes');
  for (const pass of cloudyPasses) {
    assert.equal(pass.ndvi, null, 'Cloudy pass NDVI must be null, never interpolated');
    assert.equal(pass.ndmi, null, 'Cloudy pass NDMI must be null, never interpolated');
  }

  // Evaluate history containing cloud gaps
  const history = dataset.slice(45, 75);
  const satFlag = evaluateSatelliteFlag(history);
  assert.equal(satFlag.triggered, false);
  assert.ok(satFlag.reason.includes('Insufficient clear Sentinel-2 passes'), 'Should explain data gap per protocol');
});

test('Scenario Test: "Monsoon recovery" clears drought flags and re-establishes NORMAL MONITORING', () => {
  const dataset = generate90DayDataset('Monsoon recovery');
  // Day 70 is well after the storm events on day 50-58
  const history = dataset.slice(0, 70);
  const result = evaluateCatchmentRules(history);

  assert.equal(result.sensorValidity.isValid, true);
  assert.equal(result.flags.localDryFlag.triggered, false, 'Soil moisture replenished by rain');
  assert.equal(result.status, 'NORMAL MONITORING');
  assert.ok(result.forestHealthIndex.score >= 70, 'FHI should rebound post-storm');
});

test('Alert Cooldown: suppresses repeated alert spam within cooldown window', () => {
  const dataset = generate90DayDataset('Dry spell');
  const history = dataset.slice(0, 70);

  // No previous alert
  const resultNoCooldown = evaluateCatchmentRules(history, DEFAULT_RULE_SETTINGS, null);
  assert.equal(resultNoCooldown.cooldownActive, false);

  // Alert occurred 2 days ago (current day index is 69, alert at 67; cooldown is 5 days)
  const resultCooldownActive = evaluateCatchmentRules(history, DEFAULT_RULE_SETTINGS, 67);
  assert.equal(resultCooldownActive.cooldownActive, true);
  assert.equal(resultCooldownActive.daysSinceLastAlert, 2);

  // Alert occurred 14 days ago (current day index is 69, alert at 55; past cooldown)
  const resultCooldownExpired = evaluateCatchmentRules(history, DEFAULT_RULE_SETTINGS, 55);
  assert.equal(resultCooldownExpired.cooldownActive, false);
  assert.equal(resultCooldownExpired.daysSinceLastAlert, 14);
});

test('Custom Settings: thresholds are editable and retain disclaimer', () => {
  const customSettings: RuleSettings = {
    ...DEFAULT_RULE_SETTINGS,
    soilMoistureThresholdPct: 30.0, // Stricter threshold
    soilConsecutiveCount: 1,
  };

  assert.equal(customSettings.settingsDisclaimer, 'design pattern, not validated universal thresholds');

  const dataset = generate90DayDataset('Normal season');
  const history = dataset.slice(0, 20);
  const result = evaluateCatchmentRules(history, customSettings);
  assert.equal(result.settingsUsed.soilMoistureThresholdPct, 30.0);
});

test('Simulator tick() exports live reading and formatted CSV string', () => {
  const reading = tick(undefined, 'Normal season');
  assert.ok(reading.timestamp.length > 0);
  assert.ok(reading.soil_raw >= 1000 && reading.soil_raw <= 3400);
  assert.ok(reading.temp_c > 0 && reading.temp_c < 50);
  assert.ok(reading.humidity_pct >= 0 && reading.humidity_pct <= 100);
  assert.equal(reading.status, 'OK');

  // Verify CSV format: timestamp,soil_raw,temp_c,humidity_pct,status
  const parts = reading.formattedCsv.split(',');
  assert.equal(parts.length, 5);
  assert.equal(parts[0], reading.timestamp);
  assert.equal(parts[1], String(reading.soil_raw));
  assert.equal(parts[4], reading.status);
});
