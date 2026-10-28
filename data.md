# Data

`satellites.csv` is a workshop dataset for rapid prototyping and visualization. It contains repeated observations per satellite and combines:
- **Source-derived:** public CelesTrak catalog attributes.
- **Derived:** simplified fields for exploration.
- **Simulated:** time-varying position snapshots for educational visualization.

It is **not** suitable for operational tracking, navigation, collision prediction, or scientific orbit propagation. Precise positions normally require orbital elements plus a propagation method such as SGP4.

## Fields

| Field | Meaning | Type/status |
|---|---|---|
| `satellite_name` | Human-readable name | source-derived |
| `norad_id` | Stable NORAD catalog ID | source-derived |
| `satellite_group` | Simplified group/category | simplified |
| `timestamp` | Observation time | simulated series |
| `latitude` | Latitude, degrees (`-90..90`) | simulated; not precise |
| `longitude` | Longitude, degrees (`-180..180`) | simulated; not precise |
| `altitude_km` | Approx. altitude above Earth | simulated/approx. |
| `inclination_deg` | Orbital inclination in degrees | source-derived |
| `eccentricity` | Orbit shape (`0` = circular) | source-derived |
| `period_minutes` | Approx. orbital period | source-derived |
| `apogee_km` | Maximum orbital altitude | source-derived |
| `perigee_km` | Minimum orbital altitude | source-derived |
| `mean_altitude_km` | Approx. mean of apogee/perigee | derived |
| `orbit_regime` | Simplified LEO/MEO/GEO/etc. class | derived |

## Interpretation
- Inclination near `0°` is equatorial; near `90°` is polar.
- Small eccentricity indicates a near-circular orbit.
- Treat catalog values as a snapshot: real orbits change over time.
- Groups/regimes are simplified and not authoritative scientific classifications.
- Simulated latitude/longitude/altitude must never be presented as true current positions.

## Use
Suitable for maps, timelines, filters, comparisons, altitude/inclination charts, simple animation, and educational dashboards. Prioritize clarity and exploration over scientific precision.

Source: CelesTrak — https://celestrak.org/. Expanded time-series observations were created for this workshop.
