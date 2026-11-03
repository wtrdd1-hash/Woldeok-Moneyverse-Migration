# v1652 — Read-only KDIC and Mint evidence correctness

Correct false KDIC global unavailable state when one of two independent queries fails; keep valid fund or ledger independently. Mint admin panel now shows authenticated persisted policy/certificate counters, not static placeholder warning. Central Bank partial report is informational, frozen policy alerts only when true. Treasury core exists and selected ACL/ledger invariants pass, but complete fiscal supply and legacy payouts are not certified. FX data stale. 55 focused backend/frontend tests passed; release pending.
v1652.1 amendment: During KDIC async refresh, do not flash a red outage while evidence is merely pending. Hide old snapshot until separately verified; show a neutral loading indicator. Pending-state regression PASS.
