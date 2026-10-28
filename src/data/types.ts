export type OrbitRegime = "LEO" | "MEO" | "GEO" | "HEO" | "Unknown";

export interface ObservationRow {
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  altitudeKm: number | null;
}

export interface SatelliteRecord {
  noradId: string;
  name: string;
  group: string;
  orbitRegime: OrbitRegime;
  inclinationDeg: number | null;
  eccentricity: number | null;
  periodMinutes: number | null;
  apogeeKm: number | null;
  perigeeKm: number | null;
  meanAltitudeKm: number | null;
  observations: ObservationRow[];
}

export interface DatasetStatus {
  state: "idle" | "loading" | "loaded" | "error";
  error: string | null;
  satelliteCount: number;
  observationCount: number;
}

export interface FilterState {
  altitudeMin: number | null;
  altitudeMax: number | null;
  inclinationMin: number | null;
  inclinationMax: number | null;
  search: string;
}

export const EMPTY_FILTERS: FilterState = {
  altitudeMin: null,
  altitudeMax: null,
  inclinationMin: null,
  inclinationMax: null,
  search: "",
};

export const REGIME_COLORS: Record<OrbitRegime, string> = {
  LEO: "#4ade80",
  MEO: "#60a5fa",
  GEO: "#fbbf24",
  HEO: "#fb923c",
  Unknown: "#94a3b8",
};

export const REGIME_LABELS: Record<OrbitRegime, string> = {
  LEO: "LEO",
  MEO: "MEO",
  GEO: "GEO",
  HEO: "High Earth",
  Unknown: "Unknown",
};
