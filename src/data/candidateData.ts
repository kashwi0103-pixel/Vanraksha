/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ObservationPeriodData {
  periodLabel: string;
  date: string;
  ndvi: number | null;
  ndmi: number | null;
  treeCoverProbability: number | null; // null if unavailable
  rainfallMm: number | null;
  temperatureC: number | null;
}

export type ScorecardStatus = 'Decreased' | 'No threshold breach' | 'Unavailable' | 'Available';

export interface CandidateIndicatorScorecard {
  indicatorKey: 'ndvi' | 'ndmi' | 'treeCover' | 'weather';
  title: string;
  status: ScorecardStatus;
  measuredChangeText: string;
  configuredThresholdText: string;
  isBreached: boolean;
  explanation: string;
}

export interface PotentialChangeCandidate {
  id: string; // e.g. "CC-2026-DH04"
  sectorId: string; // e.g. "Sector Dhikala-4"
  name: string;
  coords: string;
  elevation: string;
  forestType: string;
  evidenceStatus: 'Preliminary — Requires Verification';
  periodT1: ObservationPeriodData; // Prior observation period
  periodT2: ObservationPeriodData; // Current observation period
  scorecard: {
    ndvi: CandidateIndicatorScorecard;
    ndmi: CandidateIndicatorScorecard;
    treeCover: CandidateIndicatorScorecard;
    weather: CandidateIndicatorScorecard;
  };
  whyFlaggedSummary: string[];
  overallInterpretation: string;
  recommendedNextStep: string;
  mapCoordinates: { x: number; y: number }; // Relative coordinates for satellite canvas
}

/**
 * Original Candidate-Generation Screening Thresholds (Satellite Analysis Pipeline)
 * The satellite change-detection pipeline flags potential change candidates when:
 * - NDVI change < -0.05
 * - NDMI change < -0.05
 * - Tree-class probability change < -0.05
 */
export const CANDIDATE_SCREENING_THRESHOLDS = {
  ndviChangeThreshold: -0.05, // Delta < -0.05 flags vegetation-greenness drop
  ndmiChangeThreshold: -0.05, // Delta < -0.05 flags canopy-moisture drop
  treeCoverChangeThreshold: -0.05, // Delta < -0.05 flags tree-cover class probability drop (when model active)
};

/**
 * Catchment Decision-Support Rule-Engine Thresholds (Local In-Situ Sensor Triage)
 * Distinct from candidate screening: used for catchment-level alert escalation and sensor gating
 */
export const CATCHMENT_RULE_THRESHOLDS = {
  satelliteDropDeltaThreshold: 0.12, // Relative drop >= 0.12 vs seasonal baseline
  soilMoistureThresholdPct: 22.0, // Calibrated soil moisture < 22%
  tempBaselineDeltaThresholdC: 4.0, // Delta >= +4.0°C above seasonal baseline
  rainfallMaxCumulativeDryMm: 5.0, // Cumulative rain <= 5.0 mm in dry window
  weatherLookbackDays: 7,
};

/**
 * Configured preliminary screening thresholds for potential change candidate evaluation
 * Aligned with original satellite candidate-generation pipeline:
 * NDVI drop > 0.05 (delta < -0.05), NDMI drop > 0.05 (delta < -0.05), Tree-cover drop > 0.05 (delta < -0.05)
 */
export const SCREENING_THRESHOLDS = {
  ndviDrop: 0.05, // Delta <= -0.05 triggers vegetation greenness flag
  ndmiDrop: 0.05, // Delta <= -0.05 triggers canopy moisture flag
  treeCoverDrop: 0.05, // Delta <= -0.05 triggers tree-cover probability drop flag
  tempDeltaAlert: 4.0, // Delta >= +4.0°C above seasonal baseline (environmental context)
  rainfallDeficitMm: 15.0, // Cumulative deficit > 15 mm between windows (environmental context)
};

/**
 * Builds candidate indicator scorecard and data-driven explanations
 */
export function buildCandidateScorecard(
  t1: ObservationPeriodData,
  t2: ObservationPeriodData,
  thresholds = SCREENING_THRESHOLDS
): {
  scorecard: PotentialChangeCandidate['scorecard'];
  whyFlagged: string[];
  overallInterpretation: string;
  recommendedNextStep: string;
} {
  const whyFlagged: string[] = [];
  let breachedCount = 0;

  // 1. NDVI Indicator
  let ndviStatus: ScorecardStatus = 'Unavailable';
  let ndviChangeText = 'Data unavailable';
  let ndviExplanation = 'NDVI observation is unavailable for one or both periods due to cloud contamination or missing satellite overpass.';
  let ndviBreached = false;

  if (t1.ndvi !== null && t2.ndvi !== null) {
    const delta = Number((t2.ndvi - t1.ndvi).toFixed(3));
    ndviChangeText = `${t1.ndvi.toFixed(2)} → ${t2.ndvi.toFixed(2)} (Δ ${delta >= 0 ? '+' : ''}${delta.toFixed(2)})`;
    if (delta <= -thresholds.ndviDrop) {
      ndviStatus = 'Decreased';
      ndviBreached = true;
      breachedCount++;
      ndviExplanation = `The observed vegetation-greenness signal decreased from ${t1.ndvi.toFixed(2)} to ${t2.ndvi.toFixed(2)} (measured change: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}, crossing the configured candidate-generation screening threshold of -${thresholds.ndviDrop.toFixed(2)}). This reflects a reduction in near-infrared canopy chlorophyll reflectance.`;
      whyFlagged.push(`Vegetation-greenness (NDVI) dropped by ${Math.abs(delta).toFixed(2)}, crossing the -${thresholds.ndviDrop.toFixed(2)} candidate-generation screening threshold.`);
    } else {
      ndviStatus = 'No threshold breach';
      ndviExplanation = `Measured NDVI changed from ${t1.ndvi.toFixed(2)} to ${t2.ndvi.toFixed(2)} (change: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}), remaining within the nominal seasonal screening envelope without breaching the -${thresholds.ndviDrop.toFixed(2)} threshold.`;
    }
  }

  // 2. NDMI Indicator
  let ndmiStatus: ScorecardStatus = 'Unavailable';
  let ndmiChangeText = 'Data unavailable';
  let ndmiExplanation = 'NDMI observation is unavailable for one or both periods.';
  let ndmiBreached = false;

  if (t1.ndmi !== null && t2.ndmi !== null) {
    const delta = Number((t2.ndmi - t1.ndmi).toFixed(3));
    ndmiChangeText = `${t1.ndmi.toFixed(2)} → ${t2.ndmi.toFixed(2)} (Δ ${delta >= 0 ? '+' : ''}${delta.toFixed(2)})`;
    if (delta <= -thresholds.ndmiDrop) {
      ndmiStatus = 'Decreased';
      ndmiBreached = true;
      breachedCount++;
      ndmiExplanation = `The moisture-related vegetation signal decreased from ${t1.ndmi.toFixed(2)} to ${t2.ndmi.toFixed(2)} (measured change: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}, crossing the configured candidate-generation screening threshold of -${thresholds.ndmiDrop.toFixed(2)}). This indicates significant leaf and canopy water content depletion in the SWIR spectral band.`;
      whyFlagged.push(`Moisture-related vegetation signal (NDMI) dropped by ${Math.abs(delta).toFixed(2)}, crossing the -${thresholds.ndmiDrop.toFixed(2)} candidate-generation screening threshold.`);
    } else {
      ndmiStatus = 'No threshold breach';
      ndmiExplanation = `Measured NDMI shifted from ${t1.ndmi.toFixed(2)} to ${t2.ndmi.toFixed(2)} (change: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}), showing no breach of the -${thresholds.ndmiDrop.toFixed(2)} canopy moisture screening threshold.`;
    }
  }

  // 3. Tree-Cover Probability Indicator
  let treeCoverStatus: ScorecardStatus = 'Unavailable';
  let treeCoverChangeText = 'Data unavailable';
  let treeCoverExplanation = 'Candidate-level tree-cover probability is unavailable (Data unavailable). No multi-temporal tree-cover classification model was executed on this candidate; study-area averages are excluded to preserve localized precision. Pipeline screening threshold is Δ < -0.05.';
  let treeCoverBreached = false;

  if (t1.treeCoverProbability !== null && t2.treeCoverProbability !== null) {
    const delta = Number((t2.treeCoverProbability - t1.treeCoverProbability).toFixed(3));
    treeCoverChangeText = `${(t1.treeCoverProbability * 100).toFixed(0)}% → ${(t2.treeCoverProbability * 100).toFixed(0)}% (Δ ${(delta * 100).toFixed(0)}%)`;
    if (delta <= -thresholds.treeCoverDrop) {
      treeCoverStatus = 'Decreased';
      treeCoverBreached = true;
      breachedCount++;
      treeCoverExplanation = `The model indicates a lower probability of the area belonging to the tree-cover class (measured change: ${(delta * 100).toFixed(0)}%, exceeding the -${(thresholds.treeCoverDrop * 100).toFixed(0)}% threshold).`;
      whyFlagged.push(`Tree-cover probability decreased by ${(Math.abs(delta) * 100).toFixed(0)}%, surpassing the -${(thresholds.treeCoverDrop * 100).toFixed(0)}% classification threshold.`);
    } else {
      treeCoverStatus = 'No threshold breach';
      treeCoverExplanation = `Tree-cover probability changed by ${(delta * 100).toFixed(0)}%, which does not exceed the -${(thresholds.treeCoverDrop * 100).toFixed(0)}% threshold.`;
    }
  }

  // 4. Weather Context Indicator
  let weatherStatus: ScorecardStatus = 'Unavailable';
  let weatherChangeText = 'Data unavailable';
  let weatherExplanation = 'Weather observations unavailable for this sector.';
  let weatherBreached = false;

  if (t1.rainfallMm !== null && t2.rainfallMm !== null && t1.temperatureC !== null && t2.temperatureC !== null) {
    weatherStatus = 'Available';
    const rainDiff = Number((t2.rainfallMm - t1.rainfallMm).toFixed(1));
    const tempDiff = Number((t2.temperatureC - t1.temperatureC).toFixed(1));
    weatherChangeText = `Rain: ${t1.rainfallMm}mm → ${t2.rainfallMm}mm (${rainDiff >= 0 ? '+' : ''}${rainDiff}mm) · Temp: ${t1.temperatureC}°C → ${t2.temperatureC}°C (${tempDiff >= 0 ? '+' : ''}${tempDiff}°C)`;
    
    if (tempDiff >= thresholds.tempDeltaAlert || rainDiff <= -thresholds.rainfallDeficitMm) {
      weatherBreached = true;
      weatherExplanation = `During the observation periods, precipitation dropped by ${Math.abs(rainDiff)} mm (from ${t1.rainfallMm} mm to ${t2.rainfallMm} mm) while ambient temperatures increased by ${tempDiff >= 0 ? '+' : ''}${tempDiff}°C (from ${t1.temperatureC}°C to ${t2.temperatureC}°C), reflecting heightened evaporative demand. Note: Weather observations provide environmental context only and do not establish that weather caused the observed vegetation changes.`;
      whyFlagged.push(`Atmospheric drying context: Rainfall deficit of ${Math.abs(rainDiff)} mm with a +${tempDiff}°C temperature surge.`);
    } else {
      weatherExplanation = `Precipitation shifted from ${t1.rainfallMm} mm to ${t2.rainfallMm} mm (${rainDiff >= 0 ? '+' : ''}${rainDiff} mm) and temperature shifted from ${t1.temperatureC}°C to ${t2.temperatureC}°C (${tempDiff >= 0 ? '+' : ''}${tempDiff}°C), maintaining contextual meteorological equilibrium. Note: Weather observations provide environmental context only and do not infer causation.`;
    }
  }

  // Multi-indicator synthesis
  if (breachedCount >= 2) {
    whyFlagged.unshift(`Multiple independent signals (${breachedCount} threshold breaches) support prioritizing this location for investigation.`);
  } else if (breachedCount === 1) {
    whyFlagged.unshift('Single indicator crossed the candidate-generation screening threshold; warrants continuous monitoring and verification.');
  } else if (whyFlagged.length === 0) {
    whyFlagged.push('No screening thresholds breached; baseline monitoring active.');
  }

  // Overall Interpretation (Clearly distinguishing measured changes from interpretations & non-deforestation disclaimer)
  let interpretationText = '';
  if (breachedCount >= 2) {
    interpretationText = 'Measured multi-spectral reflectance and meteorological trends indicate significant localized canopy desiccation with changes exceeding the -0.05 candidate-generation threshold. Crucially, these signals do not prove deforestation. Seasonal phenological transitions, soil moisture heterogeneity across mountain slopes, micro-site exposure, and cloud or shadow edge artifacts can influence the spectral response. Ground-level physical verification is required before operational dispatch.';
  } else if (breachedCount === 1) {
    interpretationText = 'The candidate exhibits a localized spectral divergence in a single indicator crossing the -0.05 threshold. This does not confirm forest degradation or tree loss. Normal seasonal leaf shedding (phenology) in deciduous Chir Pine or Sal stands, localized topographic shadowing, or transient weather patterns frequently produce comparable single-band variations.';
  } else {
    interpretationText = 'Candidate displays nominal biophysical measurements within baseline tolerance limits (changes within ±0.05). Observations reflect standard seasonal dynamics without persistent stress signatures.';
  }

  // Recommended next step
  const nextStepText = 'Suggest checking recent satellite observations and conducting field verification where appropriate. Recommended field check: Inspect tree crown leaf/needle turgor, survey understory fuel moisture, and test root-zone soil moisture with a manual core auger at 15cm and 45cm depths.';

  return {
    scorecard: {
      ndvi: {
        indicatorKey: 'ndvi',
        title: 'NDVI (Vegetation Greenness)',
        status: ndviStatus,
        measuredChangeText: ndviChangeText,
        configuredThresholdText: `Threshold: Δ < -0.05 (Preliminary Pipeline)`,
        isBreached: ndviBreached,
        explanation: ndviExplanation,
      },
      ndmi: {
        indicatorKey: 'ndmi',
        title: 'NDMI (Canopy Moisture)',
        status: ndmiStatus,
        measuredChangeText: ndmiChangeText,
        configuredThresholdText: `Threshold: Δ < -0.05 (Preliminary Pipeline)`,
        isBreached: ndmiBreached,
        explanation: ndmiExplanation,
      },
      treeCover: {
        indicatorKey: 'treeCover',
        title: 'Tree-Cover Probability',
        status: treeCoverStatus,
        measuredChangeText: treeCoverChangeText,
        configuredThresholdText: `Threshold: Δ < -0.05 (Model inactive / Data unavailable)`,
        isBreached: treeCoverBreached,
        explanation: treeCoverExplanation,
      },
      weather: {
        indicatorKey: 'weather',
        title: 'Weather Context (Rain & Temp)',
        status: weatherStatus,
        measuredChangeText: weatherChangeText,
        configuredThresholdText: `Contextual meteorological baseline`,
        isBreached: weatherBreached,
        explanation: weatherExplanation,
      },
    },
    whyFlagged,
    overallInterpretation: interpretationText,
    recommendedNextStep: nextStepText,
  };
}

/**
 * 4 Real Potential Change Candidates in the Uttarakhand Pilot Area
 */
export const POTENTIAL_CHANGE_CANDIDATES: PotentialChangeCandidate[] = [
  (() => {
    const t1: ObservationPeriodData = {
      periodLabel: 'Prior Pass (T1)',
      date: '2026-04-15',
      ndvi: 0.58,
      ndmi: 0.36,
      treeCoverProbability: null, // Data unavailable as per instructions
      rainfallMm: 28.5,
      temperatureC: 29.8,
    };
    const t2: ObservationPeriodData = {
      periodLabel: 'Current Pass (T2)',
      date: '2026-05-15',
      ndvi: 0.44,
      ndmi: 0.22,
      treeCoverProbability: null, // Data unavailable as per instructions
      rainfallMm: 4.2,
      temperatureC: 35.2,
    };
    const { scorecard, whyFlagged, overallInterpretation, recommendedNextStep } =
      buildCandidateScorecard(t1, t2);

    return {
      id: 'CC-2026-DH04',
      sectorId: 'Sector Dhikala-4',
      name: 'Chir Pine Crest & Shallow Loam, Corbett Reserve',
      coords: '29°32\'42" N, 78°56\'38" E',
      elevation: '920m MSL',
      forestType: 'Pinus roxburghii (Chir Pine) with shallow gravel loam',
      evidenceStatus: 'Preliminary — Requires Verification',
      periodT1: t1,
      periodT2: t2,
      scorecard,
      whyFlaggedSummary: whyFlagged,
      overallInterpretation,
      recommendedNextStep,
      mapCoordinates: { x: 195, y: 125 },
    };
  })(),

  (() => {
    const t1: ObservationPeriodData = {
      periodLabel: 'Prior Pass (T1)',
      date: '2026-04-15',
      ndvi: 0.70,
      ndmi: 0.32,
      treeCoverProbability: null, // Data unavailable as per instructions
      rainfallMm: 18.0,
      temperatureC: 30.6,
    };
    const t2: ObservationPeriodData = {
      periodLabel: 'Current Pass (T2)',
      date: '2026-05-15',
      ndvi: 0.62, // drop -0.08 (breaches -0.05 candidate-generation screening threshold)
      ndmi: 0.20, // drop -0.12 (breaches -0.05 candidate-generation screening threshold)
      treeCoverProbability: null,
      rainfallMm: 2.5,
      temperatureC: 34.8,
    };
    const { scorecard, whyFlagged, overallInterpretation, recommendedNextStep } =
      buildCandidateScorecard(t1, t2);

    return {
      id: 'CC-2026-BJ02',
      sectorId: 'Sector Bijrani-2',
      name: 'Upper Kanda Ridge Escarpment, Uttarakhand',
      coords: '29°33\'15" N, 78°57\'12" E',
      elevation: '1,180m MSL',
      forestType: 'Quercus leucotrichophora (Banj Oak) & Mixed Deciduous',
      evidenceStatus: 'Preliminary — Requires Verification',
      periodT1: t1,
      periodT2: t2,
      scorecard,
      whyFlaggedSummary: whyFlagged,
      overallInterpretation,
      recommendedNextStep,
      mapCoordinates: { x: 380, y: 85 },
    };
  })(),

  (() => {
    const t1: ObservationPeriodData = {
      periodLabel: 'Prior Pass (T1)',
      date: '2026-04-15',
      ndvi: 0.76,
      ndmi: 0.46,
      treeCoverProbability: null,
      rainfallMm: 32.0,
      temperatureC: 28.2,
    };
    const t2: ObservationPeriodData = {
      periodLabel: 'Current Pass (T2)',
      date: '2026-05-15',
      ndvi: 0.74, // drop -0.02 (no breach)
      ndmi: 0.44, // drop -0.02 (no breach)
      treeCoverProbability: null,
      rainfallMm: 12.0,
      temperatureC: 31.0,
    };
    const { scorecard, whyFlagged, overallInterpretation, recommendedNextStep } =
      buildCandidateScorecard(t1, t2);

    return {
      id: 'CC-2026-SN03',
      sectorId: 'Sector Sona-3',
      name: 'Ramganga Riverine LoRa Cluster, Corbett',
      coords: '29°31\'50" N, 78°55\'40" E',
      elevation: '780m MSL',
      forestType: 'Dalbergia sissoo (Shisham) & Riparian Alluvial Thicket',
      evidenceStatus: 'Preliminary — Requires Verification',
      periodT1: t1,
      periodT2: t2,
      scorecard,
      whyFlaggedSummary: whyFlagged,
      overallInterpretation,
      recommendedNextStep,
      mapCoordinates: { x: 210, y: 245 },
    };
  })(),

  (() => {
    const t1: ObservationPeriodData = {
      periodLabel: 'Prior Pass (T1)',
      date: '2026-04-15',
      ndvi: 0.68,
      ndmi: 0.34,
      treeCoverProbability: null,
      rainfallMm: 42.0,
      temperatureC: 26.5,
    };
    const t2: ObservationPeriodData = {
      periodLabel: 'Current Pass (T2)',
      date: '2026-05-15',
      ndvi: null, // Cloud contamination
      ndmi: null, // Cloud contamination
      treeCoverProbability: null,
      rainfallMm: 38.0,
      temperatureC: 27.2,
    };
    const { scorecard, whyFlagged, overallInterpretation, recommendedNextStep } =
      buildCandidateScorecard(t1, t2);

    return {
      id: 'CC-2026-DG01',
      sectorId: 'Sector Dhangarhi-1',
      name: 'Corbett Sal & Mixed Deciduous Foothills',
      coords: '29°34\'10" N, 78°58\'20" E',
      elevation: '850m MSL',
      forestType: 'Shorea robusta (Sal Forest) & Valley Mixed Canopy',
      evidenceStatus: 'Preliminary — Requires Verification',
      periodT1: t1,
      periodT2: t2,
      scorecard,
      whyFlaggedSummary: [
        'Flagged for data review: Sentinel-2 optical cloud mask and topographic shadow obscured the target quadrant.',
        'No conclusive vegetative drop measured; awaiting next clear sky overpass.',
      ],
      overallInterpretation: 'Multi-spectral satellite data is currently incomplete due to cloud contamination and shadow edge effects in this sector. Crucially, missing or noisy satellite pixels do not prove deforestation or canopy loss. Ground sensor telemetry in neighboring zones indicates nominal moisture levels.',
      recommendedNextStep: 'Check recent satellite passes for clear-sky observation. If cloud cover persists over 14 days, conduct physical field inspection of canopy foliage.',
      mapCoordinates: { x: 415, y: 210 },
    };
  })(),
];

export const CHANGE_CANDIDATES = POTENTIAL_CHANGE_CANDIDATES;
