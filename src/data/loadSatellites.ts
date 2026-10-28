import Papa from "papaparse";
import type {
  SatelliteRecord,
  ObservationRow,
  OrbitRegime,
} from "./types";

type RawRow = Record<string, string | undefined>;

function parseNumber(value: string | undefined): number | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

function classifyRegime(value: string | undefined): OrbitRegime {
  if (!value) return "Unknown";
  const trimmed = value.trim().toUpperCase();
  if (trimmed === "LEO" || trimmed === "MEO" || trimmed === "GEO" || trimmed === "HEO") {
    return trimmed;
  }
  if (trimmed.includes("HIGH")) return "HEO";
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

function normalizeRows(rows: RawRow[]): SatelliteRecord[] {
  const byId = new Map<string, SatelliteRecord>();

  for (const raw of rows) {
    const noradId = (raw.norad_id ?? "").trim();
    if (!noradId) continue;

    const name = (raw.satellite_name ?? "").trim() || "Unknown";
    const group = (raw.satellite_group ?? "").trim() || "Unknown";
    const regime = classifyRegime(raw.orbit_regime);
    const inclinationDeg = parseNumber(raw.inclination_deg);
    const eccentricity = parseNumber(raw.eccentricity);
    const periodMinutes = parseNumber(raw.period_minutes);
    const apogeeKm = parseNumber(raw.apogee_km);
    const perigeeKm = parseNumber(raw.perigee_km);
    const meanAltitudeKm = parseNumber(raw.mean_altitude_km);

    const timestamp = (raw.timestamp ?? "").trim();
    const latitude = parseNumber(raw.latitude);
    const longitude = parseNumber(raw.longitude);
    const altitudeKm = parseNumber(raw.altitude_km);

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
        periodMinutes: periodMinutes !== null && periodMinutes > 0 ? periodMinutes : null,
        apogeeKm,
        perigeeKm,
        meanAltitudeKm,
        observations: [],
      };
      byId.set(noradId, sat);
    } else {
      if (sat.name === "Unknown" && name !== "Unknown") sat.name = name;
      if (sat.group === "Unknown" && group !== "Unknown") sat.group = group;
      if (sat.orbitRegime === "Unknown" && regime !== "Unknown") sat.orbitRegime = regime;
      if (sat.inclinationDeg === null && isValidInclination(inclinationDeg)) {
        sat.inclinationDeg = inclinationDeg;
      }
      if (sat.eccentricity === null && isValidEccentricity(eccentricity)) {
        sat.eccentricity = eccentricity;
      }
      if (sat.periodMinutes === null && periodMinutes !== null && periodMinutes > 0) {
        sat.periodMinutes = periodMinutes;
      }
      if (sat.apogeeKm === null) sat.apogeeKm = apogeeKm;
      if (sat.perigeeKm === null) sat.perigeeKm = perigeeKm;
      if (sat.meanAltitudeKm === null) sat.meanAltitudeKm = meanAltitudeKm;
    }

    sat.observations.push(obs);
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
        error: `Could not load dataset (HTTP ${response.status}). Place satellites.csv in public/data/.`,
      };
    }
    const text = await response.text();
    if (!text.trim()) {
      return {
        satellites: [],
        error: "Dataset file is empty. Place satellites.csv in public/data/.",
      };
    }

    const parsed = Papa.parse<RawRow>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return {
        satellites: [],
        error: `CSV parsing failed: ${parsed.errors[0].message}`,
      };
    }

    const satellites = normalizeRows(parsed.data);

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
  let latest = sat.observations[0];
  for (const obs of sat.observations) {
    if (obs.timestamp && obs.timestamp > latest.timestamp) {
      latest = obs;
    }
  }
  return latest;
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
