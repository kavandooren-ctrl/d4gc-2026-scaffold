# AGENTS.md

## Goal
Build a minimal, visualization-first satellite explorer with a 3D Earth view, altitude/inclination charts, filtering, selection, and comparison. Prioritize data correctness, clarity, usability, and small verified changes over feature count.

## Rules
- Inspect the existing code, architecture, dependencies, API/schema, and relevant behavior before editing.
- Preserve the current stack, conventions, and working functionality. Reuse existing components/utilities; avoid unrelated refactors or new dependencies without clear benefit.
- Use the existing data/API as the source of truth. Never invent endpoints, fields, measurements, positions, or successful integrations.
- Preserve units, timestamps, coordinate meaning, and data-quality distinctions. Never silently replace failed/missing live data with mock data.
- Do not present approximate/simulated positions as precise or real-time.
- Keep the UI minimal, scientific, readable, and responsive. The 3D view and charts are primary. Use clear labels/units and consistent identity for selected/compared satellites.
- Keep selection and filters synchronized across all views; handle loading, empty, missing, stale, and error states explicitly.
- Implement the smallest coherent change, then verify relevant build/tests/interactions and regressions.
- Never claim verification that was not performed.
- Summarize what changed, what was verified, and remaining limitations.

## Priority
1. Understand codebase/data
2. Reliable data flow + visual foundation
3. 3D visualization
4. Altitude/inclination charts
5. Shared filtering/selection
6. Comparison
7. Performance, accessibility, polish

When requirements conflict: data correctness > existing functionality > clear UX > extra features.
