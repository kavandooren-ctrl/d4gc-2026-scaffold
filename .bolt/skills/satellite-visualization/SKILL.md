---
name: satellite-visualization
description: Guide implementation of satellite and orbital visualizations in web applications. Use for 2D/3D satellite maps, globe views, orbit visualizations, regime comparisons, distributions, interactive space-data interfaces, or performance improvements. Prefer clear, performant, scientifically honest visuals and distinguish simulated workshop positions from propagated satellite positions.
---

# Satellite Visualization

Build the smallest visualization that answers the user's question while preserving the existing project stack and data semantics.

## Choose the right view
Prefer 2D for distributions, category counts, variable relationships, and time trends. Use 3D when Earth geometry, global spatial position, altitude around Earth, orbital shells/paths, or movement are central.

Reuse the project's existing visualization library when practical. For new globe-centric React work, prefer CesiumJS/Resium; use Three.js/React Three Fiber for custom non-geospatial 3D scenes. Avoid multiple overlapping heavy libraries.

## Data and coordinate rules
Determine whether positions are real, derived, simulated, or propagated before rendering.

For `latitude`/`longitude` in degrees and `altitude_km`:
```ts
const heightMeters = altitude_km * 1000
Cartesian3.fromDegrees(longitude, latitude, heightMeters)
```
Do not mix kilometres and metres.

TLE/orbital elements are not positions. Accurate current positions generally require propagation such as SGP4. If the workshop dataset contains simulated snapshots, label them simulated/illustrative and never present them as live tracking or precise trajectories.

## Core interaction model
Default explorer behavior:
- group/regime filters;
- search by name or NORAD ID;
- lightweight hover tooltip;
- click-to-select;
- selected-satellite detail panel;
- reset view;
- optional time control when repeated snapshots exist.

Tooltips should stay brief: name, group, regime, altitude, inclination. Put apogee, perigee, eccentricity, period, and NORAD ID in the detail panel.

Use progressive disclosure: overview → filter → hover → select → details.

## Orbit and animation rules
Only draw paths supported by the data. Multiple time-indexed positions may form a path; one point does not justify a fabricated precise orbit. Clearly label intentionally illustrative paths.

For animation, show the relevant timestamp, avoid excessive update frequency, and do not imply real-time tracking unless live propagated data is actually used.

## Rendering and performance
For hundreds/thousands of satellites:
- parse once;
- reuse/memoize derived data;
- avoid one expensive React/DOM component per satellite;
- prefer WebGL-backed points/sprites/billboards/batching;
- show labels only on hover/selection;
- update only changing values;
- use client-side filtering when dataset size permits;
- virtualize long tables;
- profile before adding visual effects.

Readability takes priority over rendering every object or metadata field.

## Visual and usability rules
Keep Earth contextual and satellite data visually dominant. Maintain consistent identity for selected satellites across views. Use color for meaningful categories/state, but not as the only cue. Avoid clutter, permanent labels, decorative effects that obscure data, and 3D used only for novelty.

Provide clear units, readable labels, accessible controls, sufficient contrast, and textual selected-satellite information. Handle missing/malformed values by skipping invalid coordinates, avoiding `NaN`, and marking unavailable metadata clearly.

## Implementation sequence
1. Inspect existing stack, dataset, and position semantics.
2. Define what the user should learn/do.
3. Implement the smallest useful view.
4. Add filtering, selection, details, then optional time/animation.
5. Verify coordinates, units, missing values, filters, source-record consistency, and performance.
6. Review all labels for claims that exceed data accuracy.

For this workshop, a strong default is a Cesium/Resium globe with lightweight satellite points, group/regime filtering, selection details, and explicit labeling of simulated positions. Add orbit paths or animation only when supported by the observations.
