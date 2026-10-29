/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DASHBOARD_NAV_SECTIONS, OTHER_PAGES } from '../data/navigation';
import { Logo } from './Logo';
import { ForestStatus } from '../lib/types';
import { StatusBadge } from './StatusBadge';
import { 
  Menu, 
  X, 
  Activity, 
  Database, 
  Map as MapIcon, 
  Sprout, 
  Droplets, 
  LineChart, 
  Flame, 
  FileText,
  ChevronRight,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useForest } from '../lib/ForestContext';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  systemStatus?: ForestStatus;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  systemStatus = 'NORMAL MONITORING',
}) => {
  const { 
    dataSourceMode, 
    setIsDataDrawerOpen, 
    activeDashboardTab, 
    setActiveDashboardTab 
  } = useForest();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Map icon component by section ID
  const getSectionIcon = (id: string, size = 18) => {
    switch (id) {
      case 'overview': return <Activity size={size} />;
      case 'satellite-map': return <MapIcon size={size} />;
      case 'vegetation-health': return <Sprout size={size} />;
      case 'moisture-monitoring': return <Droplets size={size} />;
      case 'historical-trends': return <LineChart size={size} />;
      case 'potential-hotspots': return <Flame size={size} />;
      case 'reports': return <FileText size={size} />;
      default: return <Layers size={size} />;
    }
  };

  // Monitor scroll state for glass effect deepening
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Handle click on one of the 7 dashboard sections from image
  const handleDashboardSectionClick = (tabId: string) => {
    setActiveDashboardTab(tabId);
    onNavigate('dashboard');
    setSidebarOpen(false);
  };

  // Handle click on other app pages
  const handlePageClick = (pageId: string) => {
    onNavigate(pageId);
    setSidebarOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#06120C]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-[#06120C]/75 backdrop-blur-md border-b border-white/[0.06]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Left Zone: "Teen Dande" (Hamburger Button) + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* "Teen Dande" (Hamburger Menu Button) placed on the LEFT */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-[#8A9A92] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#2ECC71]/40 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] group"
                aria-expanded={sidebarOpen}
                aria-controls="left-sidebar-navigation"
                aria-label="Open sidebar menu"
                title="Open Sidebar Navigation"
              >
                <Menu size={22} className="text-[#2ECC71] group-hover:scale-105 transition-transform" />
                <span className="hidden sm:inline text-xs font-mono font-medium text-white">Menu</span>
              </button>

              {/* Brand Logo */}
              <button
                onClick={() => handlePageClick('home')}
                className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] rounded-lg p-1 shrink-0"
                aria-label="ForestGuard AI - Go to Home overview"
              >
                <Logo size={34} showText={true} />
              </button>
            </div>

            {/* Desktop Navigation Links: 7 Dashboard Sections from the Image */}
            <nav
              aria-label="Dashboard Primary Sections"
              className="hidden xl:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.08] overflow-x-auto max-w-[62%]"
            >
              {DASHBOARD_NAV_SECTIONS.map((sec) => {
                const isTabActive = activeSection === 'dashboard' && activeDashboardTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleDashboardSectionClick(sec.id)}
                    aria-current={isTabActive ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] ${
                      isTabActive
                        ? 'bg-[#2ECC71]/20 text-[#B6F36A] font-bold border border-[#2ECC71]/40 shadow-[0_0_12px_rgba(46,204,113,0.25)]'
                        : 'text-[#8A9A92] hover:text-[#E5EFE9] hover:bg-white/[0.04]'
                    }`}
                    title={sec.label}
                  >
                    <span className={isTabActive ? 'text-[#2ECC71]' : 'text-[#8A9A92]'}>
                      {getSectionIcon(sec.id, 13)}
                    </span>
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Zone: Data Adapter Drawer Trigger & Live System Status Pill */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Data Adapter Drawer Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDataDrawerOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  dataSourceMode === 'real'
                    ? 'bg-[#2ECC71]/20 border-[#2ECC71]/60 text-[#B6F36A] shadow-[0_0_12px_rgba(46,204,113,0.3)]'
                    : 'bg-white/[0.04] border-white/10 text-[#8A9A92] hover:text-white hover:border-white/20'
                }`}
                title="Open Data Adapter (Simulated vs Real Data)"
              >
                <Database size={13} className={dataSourceMode === 'real' ? 'text-[#2ECC71]' : 'text-[#8A9A92]'} />
                <span className="font-medium hidden sm:inline">Data:</span>
                <span className={dataSourceMode === 'real' ? 'text-white' : 'text-[#8A9A92]'}>
                  {dataSourceMode === 'real' ? 'Real' : 'Simulated'}
                </span>
              </button>

              {/* Live System Status Pill */}
              <div className="hidden sm:flex items-center gap-2 pl-3 py-1 pr-2 rounded-full bg-white/[0.03] border border-white/10">
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-[#8A9A92]">
                  <Activity size={12} className="text-[#2ECC71]" aria-hidden="true" />
                  <span>System:</span>
                </span>
                <StatusBadge status={systemStatus} size="sm" pulsing={true} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LEFT SLIDE-OUT SIDEBAR & BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          id="left-sidebar-navigation"
        >
          {/* Backdrop Dimmer */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Left Slide-out Sidebar Panel */}
          <aside 
            className="relative w-80 sm:w-96 max-w-[85vw] h-full bg-[#06120C] border-r border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col justify-between animate-in slide-in-from-left duration-300 overflow-y-auto"
          >
            {/* Sidebar Top Header */}
            <div>
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <Logo size={28} showText={true} />
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-[#8A9A92] hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71]"
                  aria-label="Close sidebar"
                >
                  <X size={20} className="text-[#E5533D]" />
                </button>
              </div>

              {/* Dedicated Dashboard Navigation Sections */}
              <div className="p-4 sm:p-5 space-y-1.5">
                {DASHBOARD_NAV_SECTIONS.map((sec) => {
                  const isCurrent = activeSection === 'dashboard' && activeDashboardTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleDashboardSectionClick(sec.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 group ${
                        isCurrent
                          ? 'bg-[#2ECC71]/15 border-[#2ECC71]/50 text-white shadow-[0_0_15px_rgba(46,204,113,0.2)]'
                          : 'bg-white/[0.02] border-white/5 text-[#BAC7C0] hover:bg-white/[0.06] hover:border-white/15 hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-[#2ECC71] text-[#06120C]'
                          : 'bg-white/10 text-[#2ECC71] group-hover:bg-[#2ECC71]/20 group-hover:text-[#B6F36A]'
                      }`}>
                        {getSectionIcon(sec.id, 16)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="font-heading font-semibold text-sm text-white flex items-center gap-2">
                          <span>{sec.label}</span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                          )}
                        </span>
                      </div>

                      <ChevronRight 
                        size={15} 
                        className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                          isCurrent ? 'text-[#2ECC71]' : 'text-white/20 group-hover:text-white'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>

              {/* Secondary App Modules Section */}
              <div className="px-4 sm:px-5 pt-3 pb-4 border-t border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9A92] font-semibold block mb-2 px-1">
                  Additional Analysis & Hardware:
                </span>

                <div className="grid grid-cols-2 gap-1.5">
                  {OTHER_PAGES.map((page) => {
                    const isCurrent = activeSection === page.id;
                    return (
                      <button
                        key={page.id}
                        onClick={() => handlePageClick(page.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-mono transition-all text-left truncate border ${
                          isCurrent
                            ? 'bg-white/15 text-white font-bold border-white/30'
                            : 'bg-white/[0.02] text-[#8A9A92] hover:text-white hover:bg-white/[0.06] border-white/5'
                        }`}
                        title={page.label}
                      >
                        {page.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Bottom Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8A9A92]">System Status:</span>
                <StatusBadge status={systemStatus} size="sm" />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8A9A92]">Active Data Source:</span>
                <span className="text-[#B6F36A] font-semibold uppercase">{dataSourceMode}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
