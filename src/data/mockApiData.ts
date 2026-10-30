/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Region {
  id: number;
  name: string;
  country: string;
}

export interface ObservationRecord {
  id: number;
  region_id: number;
  observation_month: string;
  ndvi: number | null;
  ndmi: number | null;
  rainfall_mm: number | null;
  temperature_c: number | null;
}

export type AlertLevel = 'Green' | 'Yellow' | 'Orange' | 'Red' | 'Insufficient satellite data';

export interface AlertRecord {
  id: number;
  observation_id: number;
  alert_level: AlertLevel;
  reason: string | null;
  generated_at: string;
}

export const MOCK_REGIONS: Region[] = [
  { id: 1, name: 'Jim Corbett National Park (Dhikala Core Zone, Uttarakhand)', country: 'India' },
  { id: 2, name: 'Rajaji National Park (Chilla-Motichur Forest, Uttarakhand)', country: 'India' },
  { id: 3, name: 'Nanda Devi Biosphere & Valley of Flowers, Uttarakhand', country: 'India' },
  { id: 4, name: 'Kedarnath Wildlife Sanctuary (Oak-Pine Belt, Uttarakhand)', country: 'India' },
];

/**
 * Generate 115 realistic consecutive monthly observations representing 2015 to 2024
 * with genuine meteorological and phenological seasonality of Uttarakhand Forest Divisions
 * (Corbett Tiger Reserve, Ramganga Catchment, Shivalik & Mid-Himalayan Chir Pine-Sal Forests).
 */
function build115Observations(): { observations: ObservationRecord[]; alerts: AlertRecord[] } {
  const observations: ObservationRecord[] = [];
  const alerts: AlertRecord[] = [];

  const startYear = 2015;
  const startMonth = 1; // Jan 2015
  const totalMonths = 115; // through Jul 2024

  for (let i = 0; i < totalMonths; i++) {
    const currentMonthNum = ((startMonth - 1 + i) % 12) + 1;
    const currentYear = startYear + Math.floor((startMonth - 1 + i) / 12);
    const monthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
    const obsId = i + 1;

    // Seasonal climate synthesis for Uttarakhand Forest Zones
    let tempC: number;
    let rainMm: number;
    let ndvi: number | null;
    let ndmi: number | null;
    let alertLevel: AlertLevel;
    let alertReason: string | null = null;

    // Historic Uttarakhand forest wildfire drought episodes (e.g. 2016 & 2021 pre-monsoons)
    const isUttarakhandFireDrought = (currentYear === 2016 || currentYear === 2021) && (currentMonthNum >= 3 && currentMonthNum <= 5);
    // Severe cloud gap in peak Himalayan monsoon
    const isCloudGap = (currentMonthNum === 7 || currentMonthNum === 8) && i % 14 === 0;

    if (isCloudGap) {
      tempC = 22.8;
      rainMm = 380.5;
      ndvi = null;
      ndmi = null;
      alertLevel = 'Insufficient satellite data';
      alertReason = 'Dense orographic monsoon cloud cover over Ramganga / Corbett sensor cluster';
    } else if (currentMonthNum >= 3 && currentMonthNum <= 5) {
      // Himalayan Pre-Monsoon Dry/Heat Season (High wildfire & chir pine needle desiccation risk in Uttarakhand)
      tempC = Number((31.5 + (currentMonthNum - 3) * 3.2 + (Math.sin(i) * 1.4)).toFixed(1));
      rainMm = isUttarakhandFireDrought ? Number((2.0 + Math.random() * 8).toFixed(1)) : Number((15.0 + Math.random() * 25).toFixed(1));
      
      const ndviVal = isUttarakhandFireDrought ? 0.44 + Math.random() * 0.05 : 0.54 + Math.random() * 0.07;
      const ndmiVal = isUttarakhandFireDrought ? 0.09 + Math.random() * 0.04 : 0.19 + Math.random() * 0.06;
      ndvi = Number(ndviVal.toFixed(2));
      ndmi = Number(ndmiVal.toFixed(2));

      if (isUttarakhandFireDrought) {
        alertLevel = currentMonthNum >= 4 ? 'Red' : 'Orange';
        alertReason = `Critical Chir Pine moisture deficit: 45-day rain deficiency, soil matric suction > 60 kPa in Corbett foothills`;
      } else if (tempC > 35) {
        alertLevel = 'Yellow';
        alertReason = `Elevated heat index (${tempC}°C): High evaporative draw in Sal/Chir canopy`;
      } else {
        alertLevel = 'Green';
        alertReason = 'Normal pre-monsoon forest moisture baseline';
      }
    } else if (currentMonthNum >= 6 && currentMonthNum <= 9) {
      // Southwest Monsoon across Uttarakhand foothills
      tempC = Number((24.0 + (Math.sin(i) * 1.2)).toFixed(1));
      rainMm = Number((260.0 + Math.random() * 140).toFixed(1));
      ndvi = Number((0.80 + Math.random() * 0.08).toFixed(2));
      ndmi = Number((0.52 + Math.random() * 0.10).toFixed(2));
      alertLevel = 'Green';
      alertReason = 'High soil saturation and lush Himalayan forest canopy recharge';
    } else if (currentMonthNum >= 10 && currentMonthNum <= 11) {
      // Autumn post-monsoon (Golden forest period in Uttarakhand)
      tempC = Number((22.5 + Math.cos(i) * 1.5).toFixed(1));
      rainMm = Number((35.0 + Math.sin(i * 2) * 20).toFixed(1));
      ndvi = Number((0.74 + Math.random() * 0.06).toFixed(2));
      ndmi = Number((0.36 + Math.random() * 0.07).toFixed(2));
      alertLevel = 'Green';
      alertReason = 'Post-monsoon canopy moisture equilibrium in Corbett reserve';
    } else {
      // Winter season (Dec - Feb): Cold mountain temperatures, low evaporation
      tempC = Number((14.5 + Math.cos(i) * 2.5).toFixed(1));
      rainMm = Number((25.0 + Math.random() * 30).toFixed(1)); // Western disturbances
      ndvi = Number((0.62 + Math.random() * 0.06).toFixed(2));
      ndmi = Number((0.28 + Math.random() * 0.06).toFixed(2));
      alertLevel = 'Green';
      alertReason = 'Winter baseline; low evapotranspiration across Himalayan slopes';
    }

    const obs: ObservationRecord = {
      id: obsId,
      region_id: 1,
      observation_month: monthStr,
      ndvi,
      ndmi,
      rainfall_mm: rainMm,
      temperature_c: tempC,
    };
    observations.push(obs);

    const alert: AlertRecord = {
      id: obsId,
      observation_id: obsId,
      alert_level: alertLevel,
      reason: alertReason,
      generated_at: `${monthStr}-15T08:30:00Z`,
    };
    alerts.push(alert);
  }

  return { observations, alerts };
}

const generated = build115Observations();
export const MOCK_OBSERVATIONS: ObservationRecord[] = generated.observations;
export const MOCK_ALERTS: AlertRecord[] = generated.alerts;

export function getAlertSummary() {
  const counts: Record<AlertLevel, number> = {
    Green: 0,
    Yellow: 0,
    Orange: 0,
    Red: 0,
    'Insufficient satellite data': 0,
  };

  for (const alert of MOCK_ALERTS) {
    if (alert.alert_level in counts) {
      counts[alert.alert_level]++;
    }
  }

  return {
    total_alerts: MOCK_ALERTS.length,
    alert_counts: counts,
  };
}
