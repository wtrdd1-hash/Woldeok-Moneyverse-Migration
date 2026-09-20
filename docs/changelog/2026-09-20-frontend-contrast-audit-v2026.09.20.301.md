# v2026.09.20.301 — Frontend colour and contrast audit

- Split the rebuilt visual system into distinct light and dark semantic palettes.
- Raised all tested normal-text token combinations to WCAG 2.2 AA contrast or better.
- Corrected low-contrast colours across home, shop, work, inventory, businesses and admin surfaces.
- Added contrast regression tests and constrained user-selected point colours to preserve readable primary controls.
- Reference evidence uses SeeClick 10k web subset, WebUI 41,970 web screens and RICO 66k+ screens, plus WCAG/GOV.UK/Atlassian/Material guidance.
- Production remains blocked until the broader full-frontend rebuild gate is complete.
