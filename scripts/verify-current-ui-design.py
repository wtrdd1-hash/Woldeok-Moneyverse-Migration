#!/usr/bin/env python3
"""Verify G2 visual authority, not functional or security acceptance."""
import hashlib
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / "docs/design"
GALLERY = DESIGN / "game-ui-v2026.11.24.G2/routes"
VERSION = "v2026.11.27.PLAN-AUDIT.2"
PREFIX = "docs/design/game-ui-v2026.11.24.G2/routes/"
ROW = re.compile(r"^\| \x60([^\x60]+)\x60 \| [^|]+ \| \[[^\]]+\]\(([^)]+)\) \|", re.M)
UI_ROW = re.compile(
    r"^\| (/.*?) \| [^\n]*?\[G2 PNG\]\((design/game-ui-v2026\.11\.24\.G2/routes/[^)]+)\) \| REFERENCE_ONLY_QA_OPEN \|$", re.M
)


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def check():
    doc = json.loads((DESIGN / "CURRENT_UI_DESIGN_MANIFEST.json").read_text(encoding="utf-8"))
    require(doc["authority_version"] == VERSION, "Wrong authority version")
    require(doc["design_version"] == "v2026.11.24.G2", "Wrong active design")
    require(doc["selection"] == "ACTIVE_SOLE_VISUAL_REFERENCE", "Wrong selection")
    require(doc["design_review"] == "VISUAL_REVIEW_OPEN" and doc["runtime_e2e"] == "NOT_VERIFIED",
            "Image files cannot certify visual or runtime acceptance")
    entries = doc["routes"]
    require(doc["total_routes"] == doc["total_images"] == len(entries) == 180, "Wrong count")
    require(doc["image_dimensions_px"] == [1680, 1000], "Unexpected design dimensions")
    mapping = {}
    hashes = set()
    for item in entries:
        route, path = item["route"], item["file"]
        require(route.startswith("/") and route not in mapping, f"Bad route: {route}")
        require(path.startswith(PREFIX) and "/" not in path[len(PREFIX):], f"Bad path: {path}")
        asset = ROOT / path
        data = asset.read_bytes()
        require(data[:8] == b"\x89PNG\r\n\x1a\n", f"Bad PNG: {path}")
        require(struct.unpack(">II", data[16:24]) == (1680, 1000), f"Bad dimensions: {path}")
        digest = hashlib.sha256(data).hexdigest()
        require(digest == item["sha256"] and digest not in hashes, f"Changed/duplicate PNG: {path}")
        hashes.add(digest)
        mapping[route] = asset.name
    gallery_rows = ROW.findall((GALLERY / "README.md").read_text(encoding="utf-8"))
    require(len(gallery_rows) == 180 and dict(gallery_rows) == mapping, "Gallery mismatch")
    require({p.name for p in GALLERY.glob("*.png")} == set(mapping.values()), "PNG inventory mismatch")
    for name in ("UI_UX_SINGLE_REFERENCE.md", "UI_UX_SINGLE_REFERENCE.ko.md"):
        rows = UI_ROW.findall((ROOT / "docs" / name).read_text(encoding="utf-8"))
        require(len(rows) == 180 and {r: Path(p).name for r, p in rows} == mapping, f"UI master mismatch: {name}")
    for path in ("AGENTS.md", "GEMINI.md", "docs/DOCUMENT_AUTHORITY.md", "docs/DOCUMENT_AUTHORITY.ko.md",
                 "docs/planning/PROJECT_PLAN.md", "docs/planning/PROJECT_PLAN.ko.md",
                 "docs/planning/INTEGRATED_PLANNING_MASTER.md", "docs/planning/INTEGRATED_PLANNING_MASTER.ko.md",
                 "docs/design/CURRENT_UI_DESIGN.md", "docs/design/CURRENT_UI_DESIGN.ko.md"):
        text = (ROOT / path).read_text(encoding="utf-8-sig")
        require(VERSION in text[:2000] and "G2" in text[:3500], f"Stale entrypoint: {path}")
    for version in ("game-ui-v2026.11.24.G1", "game-ui-v2026.11.24.11", "game-ui-v2026.11.23.10"):
        for lang in ("README.md", "README.ko.md"):
            text = (DESIGN / version / lang).read_text(encoding="utf-8")
            require("ARCHIVED" in text.splitlines()[0], f"Missing archive label: {version}/{lang}")
    en = (DESIGN / "CURRENT_UI_DESIGN.md").read_text(encoding="utf-8")
    ko = (DESIGN / "CURRENT_UI_DESIGN.ko.md").read_text(encoding="utf-8")
    require("Administrator access: deny by default" in en and "관리자 접근 기본 차단" in ko,
            "Missing owner access rule")
    print("PASS: G2, 180 distinct routes/assets, SHA256, 1680x1000, gallery, EN/KO masters, archive labels and frontdoors.")
    print("NOTE: structural design checks only; administrator RBAC/runtime, browser and Test/Production were not tested.")


if __name__ == "__main__":
    try:
        check()
    except (AssertionError, ValueError, KeyError, OSError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
