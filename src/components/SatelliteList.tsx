import { useMemo } from "react";
import type { SatelliteRecord } from "../data/types";
import { REGIME_COLORS } from "../data/types";
import { getDisplayAltitude } from "../data/loadSatellites";

interface SatelliteListProps {
  satellites: SatelliteRecord[];
  totalCount: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function SatelliteList({
  satellites,
  totalCount,
  selectedId,
  onSelect,
  search,
  onSearchChange,
}: SatelliteListProps) {
  const sorted = useMemo(
    () =>
      [...satellites].sort((a, b) => {
        const altA = getDisplayAltitude(a) ?? Infinity;
        const altB = getDisplayAltitude(b) ?? Infinity;
        return altA - altB;
      }),
    [satellites],
  );

  return (
    <div className="satellite-list-panel">
      <div className="list-header">
        <h2 className="panel-title">Satellites</h2>
        <span className="list-count">
          {satellites.length} of {totalCount}
        </span>
      </div>
      <input
        className="search-input"
        type="text"
        placeholder="Search name or NORAD ID…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search satellites by name or NORAD ID"
      />
      <div className="list-scroll">
        {sorted.length === 0 ? (
          <p className="list-empty">No satellites match the current filters.</p>
        ) : (
          sorted.map((sat) => {
            const isSelected = selectedId === sat.noradId;
            const alt = getDisplayAltitude(sat);
            const color = REGIME_COLORS[sat.orbitRegime] ?? REGIME_COLORS.Unknown;
            return (
              <button
                key={sat.noradId}
                className={`list-item ${isSelected ? "list-item-selected" : ""}`}
                onClick={() => onSelect(isSelected ? null : sat.noradId)}
                aria-pressed={isSelected}
              >
                <span className="list-item-dot" style={{ background: color }} />
                <span className="list-item-main">
                  <span className="list-item-name">{sat.name}</span>
                  <span className="list-item-sub">
                    {sat.orbitRegime} · NORAD {sat.noradId}
                  </span>
                </span>
                <span className="list-item-alt">
                  {alt !== null ? `${alt.toLocaleString()} km` : "—"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
