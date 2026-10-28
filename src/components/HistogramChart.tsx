import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SatelliteRecord } from "../data/types";
import { getDisplayAltitude } from "../data/loadSatellites";

interface HistogramChartProps {
  satellites: SatelliteRecord[];
  selectedId: string | null;
  allSatellites: SatelliteRecord[];
  type: "altitude" | "inclination";
}

function buildHistogram(
  satellites: SatelliteRecord[],
  getValue: (s: SatelliteRecord) => number | null,
  min: number,
  max: number,
  binCount: number,
): { bin: string; binStart: number; binEnd: number; count: number; ids: string[] }[] {
  if (satellites.length === 0 || max <= min) return [];
  const binSize = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const start = min + i * binSize;
    const end = start + binSize;
    return {
      bin: `${Math.round(start)}–${Math.round(end)}`,
      binStart: start,
      binEnd: end,
      count: 0,
      ids: [] as string[],
    };
  });

  for (const sat of satellites) {
    const val = getValue(sat);
    if (val === null) continue;
    let idx = Math.floor((val - min) / binSize);
    if (idx < 0) idx = 0;
    if (idx >= binCount) idx = binCount - 1;
    bins[idx].count++;
    bins[idx].ids.push(sat.noradId);
  }

  return bins;
}

export function HistogramChart({
  satellites,
  selectedId,
  allSatellites,
  type,
}: HistogramChartProps) {
  const getValue =
    type === "altitude"
      ? getDisplayAltitude
      : (s: SatelliteRecord) => s.inclinationDeg;

  const unit = type === "altitude" ? "km" : "°";
  const title =
    type === "altitude" ? "Altitude Distribution" : "Inclination Distribution";
  const axisLabel = type === "altitude" ? "Altitude (km)" : "Inclination (°)";

  const bounds = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const sat of allSatellites) {
      const v = getValue(sat);
      if (v !== null) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (!Number.isFinite(min)) {
      min = type === "altitude" ? 0 : 0;
      max = type === "altitude" ? 2000 : 180;
    }
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [allSatellites, getValue, type]);

  const binCount = 20;
  const data = useMemo(
    () =>
      buildHistogram(satellites, getValue, bounds.min, bounds.max, binCount),
    [satellites, getValue, bounds.min, bounds.max],
  );

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      {data.length === 0 || data.every((d) => d.count === 0) ? (
        <p className="chart-empty">No data available for current filters.</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 24, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
            <XAxis
              dataKey="bin"
              stroke="#6b7a8f"
              tick={{ fontSize: 9, fill: "#6b7a8f" }}
              angle={-35}
              textAnchor="end"
              height={50}
              interval={1}
              label={{
                value: axisLabel,
                position: "insideBottom",
                offset: -12,
                fill: "#8a9ab0",
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#6b7a8f"
              tick={{ fontSize: 10, fill: "#6b7a8f" }}
              allowDecimals={false}
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
                fill: "#8a9ab0",
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#0d1520",
                border: "1px solid #1e3a5f",
                borderRadius: "4px",
                fontSize: 12,
                color: "#c8d6e5",
              }}
              labelStyle={{ color: "#8a9ab0" }}
              formatter={(value) => [`${value} satellites`, "Count"]}
              labelFormatter={(label) =>
                `${type === "altitude" ? "Altitude" : "Inclination"}: ${label} ${unit}`
              }
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => {
                const hasSelected =
                  selectedId !== null && entry.ids.includes(selectedId);
                return (
                  <Cell
                    key={i}
                    fill={hasSelected ? "#ffffff" : "#3b82f6"}
                    opacity={hasSelected ? 1 : 0.7}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
