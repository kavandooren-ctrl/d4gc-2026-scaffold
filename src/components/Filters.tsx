import type { FilterState } from "../data/types";

interface FiltersProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  bounds: { altitude: { min: number; max: number }; inclination: { min: number; max: number } };
  active: boolean;
}

export function Filters({ filters, onChange, onReset, bounds, active }: FiltersProps) {
  return (
    <div className="filters-panel">
      <div className="filters-header">
        <h2 className="panel-title">Filters</h2>
        {active && (
          <button className="filter-reset-btn" onClick={onReset}>
            Reset
          </button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">
          Altitude range (km)
          <span className="filter-range-text">
            {bounds.altitude.min.toLocaleString()} – {bounds.altitude.max.toLocaleString()}
          </span>
        </label>
        <div className="filter-inputs">
          <input
            className="filter-input"
            type="number"
            placeholder="Min"
            value={filters.altitudeMin ?? ""}
            onChange={(e) =>
              onChange({
                altitudeMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            min={bounds.altitude.min}
            max={bounds.altitude.max}
            aria-label="Minimum altitude in kilometers"
          />
          <span className="filter-separator">to</span>
          <input
            className="filter-input"
            type="number"
            placeholder="Max"
            value={filters.altitudeMax ?? ""}
            onChange={(e) =>
              onChange({
                altitudeMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            min={bounds.altitude.min}
            max={bounds.altitude.max}
            aria-label="Maximum altitude in kilometers"
          />
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">
          Inclination range (°)
          <span className="filter-range-text">
            {bounds.inclination.min}° – {bounds.inclination.max}°
          </span>
        </label>
        <div className="filter-inputs">
          <input
            className="filter-input"
            type="number"
            placeholder="Min"
            value={filters.inclinationMin ?? ""}
            onChange={(e) =>
              onChange({
                inclinationMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            min={bounds.inclination.min}
            max={bounds.inclination.max}
            aria-label="Minimum inclination in degrees"
          />
          <span className="filter-separator">to</span>
          <input
            className="filter-input"
            type="number"
            placeholder="Max"
            value={filters.inclinationMax ?? ""}
            onChange={(e) =>
              onChange({
                inclinationMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            min={bounds.inclination.min}
            max={bounds.inclination.max}
            aria-label="Maximum inclination in degrees"
          />
        </div>
      </div>
    </div>
  );
}
