import { useState } from "react";
import { Globe } from "./components/Globe";
import { SatelliteList } from "./components/SatelliteList";
import { DetailsPanel } from "./components/DetailsPanel";
import { HistogramChart } from "./components/HistogramChart";
import { Filters } from "./components/Filters";
import { useExplorer } from "./state/useExplorer";

function App() {
  const explorer = useExplorer();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const {
    satellites,
    filteredSatellites,
    selectedId,
    selectedSatellite,
    status,
    filters,
    bounds,
    filtersActive,
    onSelect,
    onFilterChange,
    onResetFilters,
  } = explorer;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Satellite Explorer</h1>
        <span className="app-subtitle">
          {status.state === "loaded" && (
            <>
              {status.satelliteCount} satellites · {status.observationCount.toLocaleString()} observations
            </>
          )}
          {status.state === "loading" && "Loading dataset…"}
        </span>
      </header>

      {status.state === "loading" && (
        <div className="status-overlay">
          <p className="status-message">Loading satellite dataset…</p>
        </div>
      )}

      {status.state === "error" && (
        <div className="status-overlay">
          <div className="error-box">
            <h2 className="error-title">Dataset Unavailable</h2>
            <p className="error-message">{status.error}</p>
            <p className="error-hint">
              The app expects a file named <code>satellites.xlsx</code> in the
              <code> public/data/</code> folder.
            </p>
          </div>
        </div>
      )}

      {status.state === "loaded" && (
        <div className="dashboard">
          <div className="globe-section">
            <Globe
              satellites={filteredSatellites}
              selectedId={selectedId}
              onSelect={onSelect}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          </div>

          <aside className="sidebar">
            <Filters
              filters={filters}
              onChange={onFilterChange}
              onReset={onResetFilters}
              bounds={bounds}
              active={filtersActive}
            />
            <SatelliteList
              satellites={filteredSatellites}
              totalCount={satellites.length}
              selectedId={selectedId}
              onSelect={onSelect}
              search={filters.search}
              onSearchChange={(value) => onFilterChange({ search: value })}
            />
            <DetailsPanel satellite={selectedSatellite} />
          </aside>

          <div className="charts-section">
            <HistogramChart
              satellites={filteredSatellites}
              selectedId={selectedId}
              allSatellites={satellites}
              type="altitude"
            />
            <HistogramChart
              satellites={filteredSatellites}
              selectedId={selectedId}
              allSatellites={satellites}
              type="inclination"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
