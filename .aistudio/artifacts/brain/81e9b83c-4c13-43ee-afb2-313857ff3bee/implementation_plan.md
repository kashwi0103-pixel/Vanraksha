# ForestGuard AI: 7-Section Scientific Dashboard Reorganization

Restructure the ForestGuard AI monitoring dashboard into seven dedicated, interactive sections based on the requested scientific specification: Overview, Satellite Map, Vegetation Health, Moisture Monitoring, Historical Trends, Potential Hotspots, and Reports, featuring responsive tabbed sub-navigation and a printable executive summary report.

## User Review & Critical Decisions

> [!IMPORTANT]
> The seven sections mirror the exact field-monitoring protocol from your specification sheet. Based on your clarification preferences, the dashboard will use a clean tabbed sub-navigation bar to switch between views and provide a styled printable/PDF executive summary alongside instant data downloads.

- **Confirmed Decision 1 (Navigation Style)**: Tabbed sub-navigation bar positioned directly under the dashboard header, enabling frictionless switching between all 7 sections while preserving ground-truth sensor context.
- **Confirmed Decision 2 (Reports Export Format)**: Visual printable executive summary with browser print-to-PDF layout (`@media print` formatted) plus instant CSV and JSON export actions.
- **Data Continuity**: All 7 sections consume data seamlessly from `DataSource` (`SimulatedSource` and `FileSource`), maintaining real-time ground telemetry, live alert indicators, and Gemini API integration without breaking existing features.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the primary dashboard into a modular, research-grade command center that organizes remote sensing (Sentinel-2 NDVI & NDMI) alongside IoT ground sensors into 7 specialized views:
  1. **Overview**: Selected forest division/region details, coordinate bounds, latest acquisition timestamp, system health, and high-level vegetation status.
  2. **Satellite Map**: High-resolution interactive visual canvas of the study area with false-color / true-color spectral band overlays, grid coordinates, and sensor placement pins.
  3. **Vegetation Health**: Detailed NDVI spatial distribution heatmap, canopy health classification percentages (Dense, Moderate, Sparse, Degraded), mean/min/max statistics, and divergence flags.
  4. **Moisture Monitoring**: NDMI canopy moisture index map, water stress zones, soil moisture correlation gauge, and dry zone deficit counters.
  5. **Historical Trends**: Dual-axis longitudinal time-series comparing NDVI, NDMI, ambient temperature, and rainfall across all historical satellite passes with gap indicators.
  6. **Potential Hotspots**: Interactive list and spatial markers of flagged anomaly zones with specific root-cause indicators (canopy moisture drop, heat stress, ground sensor divergence).
  7. **Reports**: Executive analysis summary generator with printable/PDF formatting, anomaly summaries, field check checklists, and raw CSV/JSON data package exports.
- **Target Audience / Persona**: Forest range officers, conservation ecologists, and field verification teams requiring fast, reliable biophysical diagnostics.
- **Key Value**: Streamlines complex multi-sensor satellite telemetry into clear operational workflows, eliminating cognitive overload while preserving scientific rigor.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Section Switching**: The user clicks through the 7 tabs (`Overview`, `Satellite Map`, `Vegetation Health`, `Moisture Monitoring`, `Historical Trends`, `Potential Hotspots`, `Reports`). Smooth transitions preserve active filters and region selection.
2. **Satellite & Spectral Inspection**: In `Satellite Map`, `Vegetation Health`, or `Moisture Monitoring`, users toggle between NDVI, NDMI, and false-color composites, inspecting spatial anomalies with live mouseover pixel readouts.
3. **Hotspot Diagnostics**: In `Potential Hotspots`, selecting any flagged hotspot highlights its location on the study area map, displays the primary stress driver (e.g., "Rapid NDMI drop (-0.14) without rain"), and offers the Gemini-powered "Explain this alert" action.
4. **Report Generation & Printing**: In `Reports`, users preview an official Forest Condition Executive Summary, click **Print / Save as PDF** to invoke browser print styles, or download raw telemetry records.

### Visual Identity & Theme

- **Aesthetic Direction**: Clinical Scientific Obsidian & Living Forest (`#06120C` background, `#0B1912` panels, `#12261C` hairline borders).
- **Palette**:
  - Dominant Background: `#06120C` (deep evergreen obsidian)
  - Surface Panels: `#0D1F17` with subtle `border-emerald-950/60`
  - Calibrated Phosphor Accents: `#2ECC71` (healthy canopy green), `#B6F36A` (vegetation lime), `#38BDF8` (NDMI moisture blue), `#F5B841` (amber cautionary alert), `#E5533D` (stress alert)
- **Typography**: Clean neo-grotesque interface type (`Plus Jakarta Sans` / system sans) paired with strict tabular monospace numerals (`font-mono tabular-nums`) for coordinates, indices, and timestamps.
- **Layout Rhythm**: Generous whitespace, no nested cards within cards, single-elevation surfaces, and unboxed metadata text without generic pill clutter.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Tabbed Sub-Navigation over Monolithic Scrolling Page**
  - *Chosen Approach*: Horizontal pill-free tab strip with active underline indicators and hotkey support (`1`–`7`).
  - *Why*: Allows deep exploration of rich maps and dense statistical tables for NDVI and NDMI without forcing the user to scroll through hundreds of pixels of charts.
  - *Alternatives Considered*: Single infinite-scroll page (caused excessive vertical scrolling and fragmented map controls).
- **Decision 2: Native Browser Print CSS for PDF Reports**
  - *Chosen Approach*: Clean `@media print` style block that hides navigation chrome and formats an executive report sheet when the user clicks "Print / Export PDF".
  - *Why*: Completely client-side, zero heavy third-party PDF compilation dependencies, crisp vector text rendering, and immediate print preview in any browser.
- **Decision 3: Dedicated Hotspot Pinning and Cross-Linking**
  - *Chosen Approach*: Hotspots link directly to the study area map coordinates with indicator tags (Drought stress, Ground divergence, Cloud shadow filter).
  - *Why*: Directly satisfies the requirement "Flagged locations aur unke indicators" with actionable field context.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ForestGuard AI Navbar                           │
│  [Logo] [Simulated / Real Badge] [Data Adapter Drawer] [Nav Links]     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    Dashboard Header & Region Selector                  │
│       Region: Bandipur Tiger Reserve, Core Zone B (11.66° N, 76.63° E) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                 7-Section Tab Navigation Strip                         │
│ [Overview] [Satellite Map] [Veg Health] [Moisture] [Trends] [Hotspots] [Reports] │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
   ┌───────────────────────────────┴───────────────────────────────┐
   │                                                               │
┌──▼─────────────────────────────┐               ┌─────────────────▼─────────────────────┐
│   Views 1 - 4: Spatial & Real   │               │     Views 5 - 7: Longitudinal & Docs  │
│ 1. Overview (Latest obs, stats)│               │ 5. Historical Trends (NDVI vs NDMI)   │
│ 2. Satellite Map (Study area)  │               │ 6. Potential Hotspots (Flagged sites) │
│ 3. Vegetation Health (NDVI)    │               │ 7. Reports (Printable PDF / Export)   │
│ 4. Moisture Monitoring (NDMI)  │               └───────────────────────────────────────┘
└──┬─────────────────────────────┘
   │
┌──▼─────────────────────────────────────────────────────────────────────┐
│                       Data Layer & AI Proxy                            │
│  • DataSource.ts: getSensorReadings(), getSatelliteSeries(), etc.     │
│  • Ground Sensor Telemetry (Soil raw, Temp, Humidity, Status)          │
│  • Gemini API (/api/explain-alert) for Hotspot Diagnostic Explanations │
└────────────────────────────────────────────────────────────────────────┘
```

### Component State & Section Mapping

1. **`Overview`**:
   - Shows active region information (Bandipur Core Zone B / user-selected tract).
   - Latest acquisition timestamp (`2026-10-24 10:42 UTC`), Sentinel-2 pass interval, ground node heartbeat.
   - Quick telemetry snapshot (Current NDVI, NDMI, Soil Capacitive, Ambient Temp, VPD).
2. **`Satellite Map`**:
   - Interactive SVG/Canvas study area map with coordinate ticks, true-color and false-color NIR switchers, and node coordinate pin.
   - Cloud coverage slider and study area boundary toggle.
3. **`Vegetation Health`**:
   - High-contrast spatial NDVI gradient grid with interactive cell inspection.
   - Summary statistics: Mean NDVI, Peak NDVI, Min NDVI, Canopy Distribution breakdown (`>0.70 Dense`, `0.50-0.70 Moderate`, `<0.50 Stressed`).
4. **`Moisture Monitoring`**:
   - NDMI canopy water index spatial visualization.
   - Summary statistics: Mean NDMI, Canopy Desiccation Index, Ground-to-Canopy moisture correlation, Deficit area hectares.
5. **`Historical Trends`**:
   - Multi-date time-series chart with date selector across all Sentinel-2 acquisition passes.
   - Gaps rendered as un-interpolated breaks.
6. **`Potential Hotspots`**:
   - List and spatial flags for detected stress anomalies (e.g., Sector B-4 canopy moisture drop, Sector C-1 thermal anomaly).
   - Specific indicator breakdown + "Explain this alert" Gemini AI button.
7. **`Reports`**:
   - Formatted printable executive summary with report metadata, key findings, biophysical status summary, and signature block.
   - One-click "Print / Save PDF" triggers clean `@media print` mode.
   - "Download Data (CSV/JSON)" quick actions for raw telemetry.
