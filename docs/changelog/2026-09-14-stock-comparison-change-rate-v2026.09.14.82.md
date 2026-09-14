# Stock comparison change-rate metric — v2026.09.14.82

- Added a day-open percentage-change row to the virtual-stock comparison table.
- The calculation keeps authoritative WLD price strings in `BigInt` form and avoids JavaScript floating-point conversion.
- A zero opening price renders an em dash instead of an undefined percentage.
- This is additive UI/math work only; API and database contracts are unchanged.
