# Internal worklog — v2026.09.23.399
- Problem: instant job completion can accumulate WLD too quickly and create excess wallet growth.
- External references reviewed: EVE MER, Unity game-economy guide, OSRS market-intervention research, GameDeveloper time-control/economy design.
- Decision: prefer server-authoritative job duration + one paid slot + hourly emission bands + repeat decay + sinks + economy-health feedback over a simple daily cap.
- Planning updated in Jobs spec, integrated master, delta and update notes, EN/KO.
- No runtime/test/deployment completion claimed.
