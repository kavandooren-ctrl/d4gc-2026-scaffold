import * as XLSX from "xlsx";
import type {
  SatelliteRecord,
  ObservationRow,
  OrbitRegime,
} from "./types";

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return null;
  const trimmed = String(value).trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

function parseString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function classifyRegime(value: unknown): OrbitRegime {
  const trimmed = parseString(value).toUpperCase();
  if (trimmed === "LEO" || trimmed === "MEO" || trimmed === "GEO-LIKE") {
    return trimmed as OrbitRegime;
  }
  if (trimmed === "GEO") return "GEO-like";
  return "Unknown";
}

function isValidInclination(v: number | null): boolean {
  return v !== null && v >= 0 && v <= 180;
}

function isValidEccentricity(v: number | null): boolean {
  return v !== null && v >= 0 && v < 1;
}

function isValidLat(v: number | null): boolean {
  return v !== null && v >= -90 && v <= 90;
}

function isValidLon(v: number | null): boolean {
  return v !== null && v >= -180 && v <= 180;
}

function getField(row: Record<string, unknown>, key: string): unknown {
  return row[key] ?? null;
}

function buildSatellites(
  snapshots: Record<string, unknown>[],
  catalog: Record<string, unknown>[],
): SatelliteRecord[] {
  const catalogMeanAlt = new Map<string, number | null>();
  for (const row of catalog) {
    const id = parseString(getField(row, "norad_catalog_number"));
    if (!id) continue;
    catalogMeanAlt.set(id, parseNumber(getField(row, "mean_altitude_km")));
  }

  const byId = new Map<string, SatelliteRecord>();

  for (const row of snapshots) {
    const noradId = parseString(getField(row, "norad_catalog_number"));
    if (!noradId) continue;

    const name = parseString(getField(row, "name")) || "Unknown";
    const group = parseString(getField(row, "group")) || "Unknown";
    const regime = classifyRegime(getField(row, "orbit_regime"));
    const inclinationDeg = parseNumber(getField(row, "inclination_degrees"));
    const eccentricity = parseNumber(getField(row, "eccentricity"));
    const periodMinutes = parseNumber(getField(row, "period_minutes"));
    const apogeeKm = parseNumber(getField(row, "apogee_km"));
    const perigeeKm = parseNumber(getField(row, "perigee_km"));
    const launchYear = parseNumber(getField(row, "launch_year"));
    const internationalDesignator =
      parseString(getField(row, "international_designator")) || null;
    const meanAltitudeKm = catalogMeanAlt.get(noradId) ?? null;

    const timestamp = parseString(getField(row, "timestamp_utc"));
    const latitude = parseNumber(getField(row, "simulated_latitude_deg"));
    const longitude = parseNumber(getField(row, "simulated_longitude_deg"));
    const altitudeKm = parseNumber(getField(row, "simulated_altitude_km"));

    const obs: ObservationRow = {
      timestamp,
      latitude: isValidLat(latitude) ? latitude : null,
      longitude: isValidLon(longitude) ? longitude : null,
      altitudeKm: altitudeKm !== null && altitudeKm >= 0 ? altitudeKm : null,
    };

    let sat = byId.get(noradId);
    if (!sat) {
      sat = {
        noradId,
        name,
        group,
        orbitRegime: regime,
        inclinationDeg: isValidInclination(inclinationDeg) ? inclinationDeg : null,
        eccentricity: isValidEccentricity(eccentricity) ? eccentricity : null,
        periodMinutes:
          periodMinutes !== null && periodMinutes > 0 ? periodMinutes : null,
        apogeeKm,
        perigeeKm,
        meanAltitudeKm,
        launchYear:
          launchYear !== null && launchYear > 1900
            ? Math.round(launchYear)
            : null,
        internationalDesignator,
        observations: [],
      };
      byId.set(noradId, sat);
    }

    sat.observations.push(obs);
  }

  for (const sat of byId.values()) {
    sat.observations.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  return Array.from(byId.values());
}

export interface LoadResult {
  satellites: SatelliteRecord[];
  error: string | null;
}

export async function loadSatelliteData(url: string): Promise<LoadResult> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        satellites: [],
        error: `Could not load dataset (HTTP ${response.status}).`,
      };
    }
    const arrayBuffer = await response.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });

    const snapshotSheetName = wb.SheetNames.find((n) =>
      n.toLowerCase().includes("snapshot"),
    );
    const catalogSheetName = wb.SheetNames.find((n) =>
      n.toLowerCase().includes("catalog"),
    );

    if (!snapshotSheetName) {
      return { satellites: [], error: "No snapshot sheet found in the workbook." };
    }

    const snapshotSheet = wb.Sheets[snapshotSheetName];
    const catalogSheet = catalogSheetName
      ? wb.Sheets[catalogSheetName]
      : null;

    const snapshots = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      snapshotSheet,
      { defval: null },
    );
    const catalog = catalogSheet
      ? XLSX.utils.sheet_to_json<Record<string, unknown>>(catalogSheet, {
          defval: null,
        })
      : [];

    if (snapshots.length === 0) {
      return { satellites: [], error: "Snapshot sheet contains no data rows." };
    }

    const satellites = buildSatellites(snapshots, catalog);

    if (satellites.length === 0) {
      return {
        satellites: [],
        error: "No valid satellite records found in the dataset.",
      };
    }

    return { satellites, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      satellites: [],
      error: `Failed to load dataset: ${message}`,
    };
  }
}

export function getLatestObservation(sat: SatelliteRecord): ObservationRow | null {
  if (sat.observations.length === 0) return null;
  return sat.observations[sat.observations.length - 1];
}

export function getDisplayAltitude(sat: SatelliteRecord): number | null {
  const latest = getLatestObservation(sat);
  if (latest && latest.altitudeKm !== null) return latest.altitudeKm;
  if (sat.meanAltitudeKm !== null) return sat.meanAltitudeKm;
  if (sat.apogeeKm !== null && sat.perigeeKm !== null) {
    return (sat.apogeeKm + sat.perigeeKm) / 2;
  }
  return null;
}
