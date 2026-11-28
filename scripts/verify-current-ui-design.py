#!/usr/bin/env python3
"""Validate redesign planning only; old PNGs never qualify as current acceptance."""
import json
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/design/CURRENT_UI_DESIGN_MANIFEST.json"
def planning_check(doc):
    assert doc["authority_version"] == "v2026.11.28.2027.1"
    assert doc["selection"] == "NEW_DESIGN_PLANNING_PENDING"
    assert doc["design_review"] == doc["runtime_e2e"] == "NOT_VERIFIED"
    rows = doc["routes"]
    assert len(rows) == doc["total_routes"] == len({r["route"] for r in rows})
    assert doc["total_images"] == 0
    assert all(r["route"].startswith("/") and r["status"] == "PLANNED" and r["file"] is None and r["sha256"] is None for r in rows)
    assert (ROOT / doc["primary_reference"]).is_file()
    print("PASS: planning inventory only; no visual, browser or release acceptance.")
def main():
    if sys.argv[1:] != ["--planning"]:
        print("HOLD: new route design artifacts, independent visual/functional evidence and reviewed acceptance verifier required.", file=sys.stderr)
        return 1
    try:
        planning_check(json.loads(MANIFEST.read_text(encoding="utf-8-sig")))
    except (AssertionError, ValueError, KeyError, OSError) as e:
        print("FAIL: invalid pending design manifest", file=sys.stderr)
        return 1
    return 0
if __name__ == "__main__":
    sys.exit(main())
