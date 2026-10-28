import { useState, useMemo, useCallback, useEffect } from "react";
import type { SatelliteRecord, FilterState, DatasetStatus } from "../data/types";
import { EMPTY_FILTERS } from "../data/types";
import { loadSatelliteData, getDisplayAltitude } from "../data/loadSatellites";

const DATA_URL = "data/satellites.xlsx";

export interface AltitudeRange {
  min: number;
  max: number;
}

export interface InclinationRange {
  min: number;
  max: number;
}

export function useExplorer() {
  const [satellites, setSatellites] = useState<SatelliteRecord[]>([]);
  const [status, setStatus] = useState<DatasetStatus>({
    state: "idle",
    error: null,
    satelliteCount: 0,
    observationCount: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;
    setStatus({ state: "loading", error: null, satelliteCount: 0, observationCount: 0 });
    loadSatelliteData(DATA_URL).then((result) => {
      if (cancelled) return;
      if (result.error) {
        setStatus({
          state: "error",
          error: result.error,
          satelliteCount: 0,
          observationCount: 0,
        });
        setSatellites([]);
      } else {
        const obsCount = result.satellites.reduce(
          (sum, s) => sum + s.observations.length,
          0,
        );
        setSatellites(result.satellites);
        setStatus({
          state: "loaded",
          error: null,
          satelliteCount: result.satellites.length,
          observationCount: obsCount,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const bounds = useMemo(() => {
    let altMin = Infinity;
    let altMax = -Infinity;
    let incMin = Infinity;
    let incMax = -Infinity;
    for (const sat of satellites) {
      const alt = getDisplayAltitude(sat);
      if (alt !== null) {
        if (alt < altMin) altMin = alt;
        if (alt > altMax) altMax = alt;
      }
      if (sat.inclinationDeg !== null) {
        if (sat.inclinationDeg < incMin) incMin = sat.inclinationDeg;
        if (sat.inclinationDeg > incMax) incMax = sat.inclinationDeg;
      }
    }
    return {
      altitude: {
        min: Number.isFinite(altMin) ? Math.floor(altMin) : 0,
        max: Number.isFinite(altMax) ? Math.ceil(altMax) : 0,
      },
      inclination: {
        min: Number.isFinite(incMin) ? Math.floor(incMin) : 0,
        max: Number.isFinite(incMax) ? Math.ceil(incMax) : 180,
      },
    };
  }, [satellites]);

  const filteredSatellites = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return satellites.filter((sat) => {
      const alt = getDisplayAltitude(sat);
      if (filters.altitudeMin !== null) {
        if (alt === null || alt < filters.altitudeMin) return false;
      }
      if (filters.altitudeMax !== null) {
        if (alt === null || alt > filters.altitudeMax) return false;
      }
      if (filters.inclinationMin !== null) {
        if (sat.inclinationDeg === null || sat.inclinationDeg < filters.inclinationMin)
          return false;
      }
      if (filters.inclinationMax !== null) {
        if (sat.inclinationDeg === null || sat.inclinationDeg > filters.inclinationMax)
          return false;
      }
      if (search) {
        const haystack = `${sat.name} ${sat.noradId}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [satellites, filters]);

  const selectedSatellite = useMemo(() => {
    if (!selectedId) return null;
    return satellites.find((s) => s.noradId === selectedId) ?? null;
  }, [satellites, selectedId]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleFilterChange = useCallback((patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const filtersActive =
    filters.altitudeMin !== null ||
    filters.altitudeMax !== null ||
    filters.inclinationMin !== null ||
    filters.inclinationMax !== null ||
    filters.search.trim() !== "";

  return {
    satellites,
    filteredSatellites,
    selectedId,
    selectedSatellite,
    status,
    filters,
    bounds,
    filtersActive,
    onSelect: handleSelect,
    onFilterChange: handleFilterChange,
    onResetFilters: handleResetFilters,
  };
}
