/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  SimulationScenario, 
  DayObservation, 
  LiveTickReading, 
  generate90DayDataset, 
  tick 
} from './simulator';
import { 
  RuleSettings, 
  DEFAULT_RULE_SETTINGS, 
  RuleEvaluationResult, 
  evaluateCatchmentRules 
} from './ruleEngine';
import { ForestStatus } from './types';
import { 
  DataSource, 
  SimulatedSource, 
  FileSource, 
  DataSourceInfo,
  ModelResults 
} from './dataSource';

export interface ForestContextValue {
  scenario: SimulationScenario;
  setScenario: (scenario: SimulationScenario) => void;
  dataset: DayObservation[];
  dayIndex: number;
  setDayIndex: (idx: number) => void;
  currentDay: DayObservation | undefined;
  evaluation: RuleEvaluationResult;
  status: ForestStatus;
  liveTick: LiveTickReading;
  isLiveTickActive: boolean;
  toggleLiveTick: () => void;
  triggerManualTick: () => void;
  settings: RuleSettings;
  updateSettings: (newSettings: Partial<RuleSettings>) => void;
  resetSettings: () => void;

  // Dashboard Section Navigation (Image Specification)
  activeDashboardTab: string;
  setActiveDashboardTab: (tab: string) => void;

  // Data Adapter Layer
  dataSourceMode: 'simulated' | 'real';
  dataSourceInfo: DataSourceInfo;
  activeDataSource: DataSource;
  fileSource: FileSource;
  switchToSimulated: () => void;
  switchToReal: (source?: FileSource) => void;
  isDataDrawerOpen: boolean;
  setIsDataDrawerOpen: (open: boolean) => void;
  getModelResults: () => ModelResults;
}

const ForestContext = createContext<ForestContextValue | null>(null);

export const ForestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenario, setScenarioState] = useState<SimulationScenario>('Normal season');
  const [dayIndex, setDayIndexState] = useState<number>(75);
  const [settings, setSettings] = useState<RuleSettings>(DEFAULT_RULE_SETTINGS);
  const [isLiveTickActive, setIsLiveTickActive] = useState<boolean>(true);
  const [isDataDrawerOpen, setIsDataDrawerOpen] = useState<boolean>(false);

  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('overview');

  // Data Source Management
  const [dataSourceMode, setDataSourceMode] = useState<'simulated' | 'real'>('simulated');
  const [fileSource, setFileSource] = useState<FileSource>(() => new FileSource());
  
  const simulatedSource = useMemo(() => new SimulatedSource(scenario), [scenario]);
  const activeDataSource: DataSource = useMemo(() => {
    return dataSourceMode === 'real' ? fileSource : simulatedSource;
  }, [dataSourceMode, fileSource, simulatedSource]);

  const dataSourceInfo = useMemo(() => {
    return activeDataSource.getInfo();
  }, [activeDataSource, dataSourceMode, scenario]);

  // Generate dataset based on active source
  const dataset = useMemo<DayObservation[]>(() => {
    if (dataSourceMode === 'simulated') {
      return generate90DayDataset(scenario);
    }

    // When Real Data is active: synthesize DayObservation array from uploaded records
    const sensors = fileSource.getSensorReadings();
    const satellites = fileSource.getSatelliteSeries();
    const weathers = fileSource.getWeatherSeries();

    if (sensors.length === 0 && satellites.length === 0) {
      // Fallback to simulated if real data is empty
      return generate90DayDataset(scenario);
    }

    // Map by date (YYYY-MM-DD)
    interface TempDayData {
      dateString: string;
      soilRaw?: number;
      calibratedSoilPct?: number;
      tempC?: number;
      humidityPct?: number;
      rainfallMm?: number;
      sensorStatus?: 'OK' | 'ERROR' | 'STALE';
      isSatellitePass?: boolean;
      cloudPct?: number | null;
      ndvi?: number | null;
      ndmi?: number | null;
    }

    const dateMap = new Map<string, TempDayData>();

    sensors.forEach((s) => {
      const d = s.timestamp.slice(0, 10);
      const existing = dateMap.get(d) || { dateString: d };
      const calibratedSoilPct = Math.max(0, Math.min(100, Math.round((1 - (s.soil_raw - 1350) / (2850 - 1350)) * 100)));
      dateMap.set(d, {
        ...existing,
        soilRaw: s.soil_raw,
        calibratedSoilPct,
        tempC: s.temp_c,
        humidityPct: s.humidity_pct,
        sensorStatus: s.status,
      });
    });

    satellites.forEach((sat) => {
      const existing = dateMap.get(sat.date) || { dateString: sat.date };
      dateMap.set(sat.date, {
        ...existing,
        isSatellitePass: sat.ndvi !== null || sat.cloud_pct > 0,
        ndvi: sat.ndvi,
        ndmi: sat.ndmi,
        cloudPct: sat.cloud_pct,
      });
    });

    weathers.forEach((w) => {
      const existing = dateMap.get(w.date) || { dateString: w.date };
      dateMap.set(w.date, {
        ...existing,
        rainfallMm: w.rain_mm,
        tempC: w.temp_c ?? existing.tempC ?? 26,
        humidityPct: w.humidity_pct ?? existing.humidityPct ?? 55,
      });
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    return sortedDates.map((dStr, idx): DayObservation => {
      const item = dateMap.get(dStr)!;
      return {
        dayIndex: idx,
        dateString: dStr,
        timestamp: new Date(dStr).getTime(),
        soilRaw: item.soilRaw ?? 2100,
        calibratedSoilPct: item.calibratedSoilPct ?? 35,
        tempC: item.tempC ?? 26,
        humidityPct: item.humidityPct ?? 55,
        rainfallMm: item.rainfallMm ?? 0,
        sensorStatus: item.sensorStatus ?? 'OK',
        isSatellitePass: item.isSatellitePass ?? false,
        cloudPct: item.cloudPct ?? 0,
        ndvi: item.ndvi ?? null,
        ndmi: item.ndmi ?? null,
        seasonalBaseline: {
          soilPct: 35,
          tempC: 25,
          humidityPct: 55,
          rainfallMm: 5,
          ndvi: 0.65,
          ndmi: 0.42,
        },
        notes: 'Uploaded physical telemetry',
      };
    });
  }, [dataSourceMode, scenario, fileSource]);

  // Clamp day index
  const safeDayIndex = Math.max(0, Math.min(dataset.length - 1, dayIndex));
  const currentDay = dataset[safeDayIndex] || dataset[dataset.length - 1];

  // Slice history up to current scrubber day
  const history = useMemo(() => {
    return dataset.slice(0, safeDayIndex + 1);
  }, [dataset, safeDayIndex]);

  // Evaluate catchment rules on sliced history
  const evaluation = useMemo(() => {
    return evaluateCatchmentRules(history, settings);
  }, [history, settings]);

  // Live 5-minute telemetry tick
  const [liveTick, setLiveTick] = useState<LiveTickReading>(() => tick(undefined, scenario));

  // Ticking interval
  useEffect(() => {
    if (!isLiveTickActive || dataSourceMode === 'real') return;

    const interval = setInterval(() => {
      setLiveTick(prev => tick(prev, scenario));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveTickActive, scenario, dataSourceMode]);

  const setScenario = useCallback((newScenario: SimulationScenario) => {
    setScenarioState(newScenario);
    setLiveTick(prev => tick(prev, newScenario));
  }, []);

  const setDayIndex = useCallback((idx: number) => {
    setDayIndexState(idx);
  }, []);

  const toggleLiveTick = useCallback(() => {
    setIsLiveTickActive(prev => !prev);
  }, []);

  const triggerManualTick = useCallback(() => {
    setLiveTick(prev => tick(prev, scenario));
  }, [scenario]);

  const updateSettings = useCallback((newSettings: Partial<RuleSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_RULE_SETTINGS);
  }, []);

  const switchToSimulated = useCallback(() => {
    setDataSourceMode('simulated');
  }, []);

  const switchToReal = useCallback((source?: FileSource) => {
    if (source) {
      setFileSource(source);
    }
    setDataSourceMode('real');
  }, []);

  const getModelResults = useCallback(() => {
    return activeDataSource.getModelResults();
  }, [activeDataSource]);

  const value: ForestContextValue = {
    scenario,
    setScenario,
    dataset,
    dayIndex: safeDayIndex,
    setDayIndex,
    currentDay,
    evaluation,
    status: evaluation.status,
    liveTick,
    isLiveTickActive,
    toggleLiveTick,
    triggerManualTick,
    settings,
    updateSettings,
    resetSettings,
    activeDashboardTab,
    setActiveDashboardTab,
    dataSourceMode,
    dataSourceInfo,
    activeDataSource,
    fileSource,
    switchToSimulated,
    switchToReal,
    isDataDrawerOpen,
    setIsDataDrawerOpen,
    getModelResults,
  };

  return (
    <ForestContext.Provider value={value}>
      {children}
    </ForestContext.Provider>
  );
};

export function useForest(): ForestContextValue {
  const context = useContext(ForestContext);
  if (!context) {
    throw new Error('useForest must be used within a ForestProvider');
  }
  return context;
}
