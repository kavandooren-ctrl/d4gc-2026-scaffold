---
name: satellite-data-analysis
description: Analyze satellite datasets for exploratory dashboards, hackathon prototypes, and educational applications. Use for satellite catalog data, orbital characteristics, orbit regimes, groups, altitude, inclination, eccentricity, apogee, perigee, orbital period, or simulated position snapshots. Summarize, compare, validate, classify, and interpret without overstating scientific accuracy.
---

# Satellite Data Analysis

Turn satellite data into clear, defensible insights with minimal analysis.

## Workflow
1. Inspect schema, row count, unique satellites, identifiers, missingness, units, timestamps, groups, ranges, and whether rows are satellite-level or repeated observations.
2. Validate key fields and duplicates.
3. Summarize with simple descriptive statistics and category counts.
4. Answer the question with the minimum useful analysis and visualization.
5. Interpret cautiously and state relevant limitations.

Use `norad_id` (or another stable ID) for grouping/joining; names are labels. For satellite counts, count unique IDs rather than repeated time rows.

## Orbital interpretation
- `inclination_deg`: angle to Earth's equatorial plane; near 0° ≈ equatorial, near 90° ≈ polar. Do not infer mission purpose from inclination alone.
- `eccentricity`: orbital shape; 0 = circular, larger values = more elliptical. It is not altitude.
- `apogee_km` / `perigee_km`: maximum/minimum approximate altitude. `altitude_range_km = apogee_km - perigee_km`.
- `mean_altitude_km`: if absent, approximate as `(apogee_km + perigee_km)/2` and label as approximate.
- `period_minutes`: approximate orbital period. Associations with altitude are descriptive, not causal discoveries.

If orbit regime is absent, a simple educational convention is:
- LEO: `< 2,000 km`
- MEO: `2,000–<35,000 km`
- High Earth Orbit: `>=35,000 km`

Do not label high-altitude objects `GEO` from altitude alone; geostationary status requires additional orbital properties.

## Useful analyses
Prefer medians/quantiles for skewed variables. Typical outputs:
- unique satellites and counts by group/regime;
- altitude, inclination, period, and eccentricity summaries;
- group comparisons;
- altitude vs period/inclination;
- apogee vs perigee;
- eccentricity vs altitude range;
- transparent outlier checks.

Treat outliers as records to inspect, not automatic errors.

## Data-quality checks
Check at minimum:
```text
0 <= inclination_deg <= 180
0 <= eccentricity < 1
apogee_km >= perigee_km
period_minutes > 0
-90 <= latitude <= 90
-180 <= longitude <= 180
```
Do not convert missing orbital values to zero. For repeated snapshots, test duplicates using identifier + timestamp. Always preserve units: altitude km, period minutes, angles degrees.

## Simulated positions and scientific limits
If latitude, longitude, altitude, or timestamps are documented as simulated snapshots, call them simulated/illustrative. They may support maps, animations, filtering, and interface prototypes, but not real-time tracking, collision analysis, operational passes, scientific propagation, or validation against live tracking data.

Do not infer without explicit support:
- purpose from orbit;
- ownership from name;
- collision risk from visual proximity;
- geostationary status from altitude alone;
- orbital decay from a few snapshots;
- true ground tracks from simulated coordinates;
- causality from correlations.

## Visualization
Use the simplest chart that answers the question:
- bar: counts by group/regime;
- scatter: numerical relationships;
- histogram: distributions;
- line: meaningful time series;
- map/globe: position snapshots;
- table: unusual records.

Prefer 2D over 3D when spatial context is not central. For globe/orbit implementation, use the satellite-visualization skill.

## Prototype defaults
Favor fast, reproducible descriptive analysis over advanced modelling or unnecessary ML. Derive only fields that improve the product and keep transformations transparent. Keep results concise: question, fields used, result, interpretation, caveat.
