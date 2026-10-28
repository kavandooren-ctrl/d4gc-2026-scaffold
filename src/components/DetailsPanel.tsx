import type { SatelliteRecord } from "../data/types";
import { REGIME_COLORS, REGIME_LABELS } from "../data/types";
import {
  getDisplayAltitude,
  getLatestObservation,
} from "../data/loadSatellites";

interface DetailsPanelProps {
  satellite: SatelliteRecord | null;
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return "—";
  return `${value.toLocaleString()} ${unit}`;
}

function formatDegrees(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1)}°`;
}

export function DetailsPanel({ satellite }: DetailsPanelProps) {
  if (!satellite) {
    return (
      <div className="details-panel">
        <h2 className="panel-title">Details</h2>
        <p className="details-empty">
          Select a satellite from the globe or list to see its orbital characteristics.
        </p>
      </div>
    );
  }

  const alt = getDisplayAltitude(satellite);
  const latest = getLatestObservation(satellite);
  const color = REGIME_COLORS[satellite.orbitRegime] ?? REGIME_COLORS.Unknown;

  return (
    <div className="details-panel">
      <h2 className="panel-title">Details</h2>
      <div className="details-header">
        <span className="details-dot" style={{ background: color }} />
        <div>
          <h3 className="details-name">{satellite.name}</h3>
          <span className="details-id">NORAD {satellite.noradId}</span>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-cell">
          <span className="detail-label">Orbit Regime</span>
          <span className="detail-value">{REGIME_LABELS[satellite.orbitRegime]}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Group</span>
          <span className="detail-value">{satellite.group}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Altitude (display)</span>
          <span className="detail-value">{formatValue(alt, "km")}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Inclination</span>
          <span className="detail-value">{formatDegrees(satellite.inclinationDeg)}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Apogee</span>
          <span className="detail-value">{formatValue(satellite.apogeeKm, "km")}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Perigee</span>
          <span className="detail-value">{formatValue(satellite.perigeeKm, "km")}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Eccentricity</span>
          <span className="detail-value">
            {satellite.eccentricity !== null ? satellite.eccentricity.toFixed(4) : "—"}
          </span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Period</span>
          <span className="detail-value">{formatValue(satellite.periodMinutes, "min")}</span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Launch Year</span>
          <span className="detail-value">
            {satellite.launchYear !== null ? String(satellite.launchYear) : "—"}
          </span>
        </div>
        <div className="detail-cell">
          <span className="detail-label">Designator</span>
          <span className="detail-value">
            {satellite.internationalDesignator ?? "—"}
          </span>
        </div>
      </div>

      {latest && (latest.latitude !== null || latest.longitude !== null) && (
        <div className="details-simulated">
          <p className="details-simulated-title">Latest Simulated Position</p>
          <div className="details-simulated-grid">
            <span className="detail-label">Latitude</span>
            <span className="detail-value">{formatDegrees(latest.latitude)}</span>
            <span className="detail-label">Longitude</span>
            <span className="detail-value">{formatDegrees(latest.longitude)}</span>
            <span className="detail-label">Timestamp</span>
            <span className="detail-value">{latest.timestamp || "—"}</span>
          </div>
          <p className="simulated-note">
            Simulated snapshot — not a precise or real-time position.
          </p>
        </div>
      )}
    </div>
  );
}
