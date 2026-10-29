/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ForestProvider, useForest } from './lib/ForestContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DebugPanel } from './components/DebugPanel';
import { ToastNotification } from './components/ToastNotification';
import { DataDrawer } from './components/DataDrawer';
import { HomeSection } from './pages/HomeSection';
import { HowItWorksSection } from './pages/HowItWorksSection';
import { DashboardSection } from './pages/DashboardSection';
import { SimulationLabSection } from './pages/SimulationLabSection';
import { ModelSection } from './pages/ModelSection';
import { HardwareSection } from './pages/HardwareSection';
import { RoadmapSection } from './pages/RoadmapSection';
import { AboutSection } from './pages/AboutSection';
import { SimulationScenario } from './lib/simulator';

function AppContent() {
  // Starts with 'home' - the "Hear the forest before it shows" screen
  const [activeSection, setActiveSection] = useState<string>('home');

  const {
    scenario,
    setScenario,
    status,
    evaluation,
    currentDay,
    dayIndex,
    setActiveDashboardTab,
  } = useForest();

  // Navigation handler: switches active section view and scrolls to top
  const handleNavigate = (sectionId: string) => {
    const isDashboardTab = [
      'overview',
      'satellite-map',
      'vegetation-health',
      'moisture-monitoring',
      'historical-trends',
      'potential-hotspots',
      'reports',
    ].includes(sectionId);

    if (isDashboardTab) {
      setActiveDashboardTab(sectionId);
      setActiveSection('dashboard');
    } else {
      setActiveSection(sectionId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scenarios: SimulationScenario[] = [
    'Normal season',
    'Dry spell',
    'Heatwave',
    'Sensor dropout',
    'Cloudy satellite gap',
    'Monsoon recovery',
  ];

  return (
    <div className="min-h-screen bg-[#06120C] text-[#E5EFE9] flex flex-col font-sans selection:bg-[#2ECC71]/30 selection:text-[#B6F36A] relative overflow-x-hidden">
      {/* Background radial forest lighting glow */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20 blur-[140px] bg-gradient-to-b from-[#2ECC71]/30 via-[#0B2E1C]/20 to-transparent -z-10" 
        aria-hidden="true" 
      />

      {/* Primary Sticky Top Bar with Left Hamburger & Logo */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        systemStatus={status}
      />

      {/* Ambient Quick Scenario Bar (floating bottom left) */}
      <aside 
        aria-label="Simulation Scenario Controls" 
        className="fixed bottom-4 left-4 z-30 pointer-events-none max-w-[calc(100vw-2rem)] print:hidden"
      >
        <div className="flex flex-col gap-1.5">
          <div className="pointer-events-auto inline-flex items-center gap-1 p-1 rounded-full bg-[#06120C]/90 backdrop-blur-xl border border-white/10 shadow-lg text-[11px] font-mono overflow-x-auto max-w-full">
            <span className="px-2 text-[#8A9A92] hidden lg:inline shrink-0">Scenario:</span>
            {scenarios.map((sc) => {
              const isActive = scenario === sc;
              return (
                <button
                  key={sc}
                  onClick={() => setScenario(sc)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-medium border border-[#2ECC71]/40 shadow-sm'
                      : 'text-[#8A9A92] hover:text-white hover:bg-white/[0.04]'
                  }`}
                  aria-pressed={isActive}
                  title={`Simulate ${sc}`}
                >
                  {sc}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Active Page View Container */}
      <main className="flex-1 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {activeSection === 'home' && (
          <HomeSection onNavigate={handleNavigate} systemStatus={status} />
        )}
        {activeSection === 'how-it-works' && (
          <HowItWorksSection />
        )}
        {activeSection === 'dashboard' && (
          <DashboardSection />
        )}
        {activeSection === 'simulation-lab' && (
          <SimulationLabSection />
        )}
        {activeSection === 'model' && (
          <ModelSection />
        )}
        {activeSection === 'hardware' && (
          <HardwareSection />
        )}
        {activeSection === 'roadmap' && (
          <RoadmapSection />
        )}
        {activeSection === 'about' && (
          <AboutSection />
        )}
      </main>

      {/* Standardized Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Logic Layer & Telemetry Debugger Panel */}
      <DebugPanel />

      {/* Real / Simulated Data Adapter Drawer */}
      <DataDrawer />

      {/* Reactive Status Change Toast Notification */}
      <ToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <ForestProvider>
      <AppContent />
    </ForestProvider>
  );
}
