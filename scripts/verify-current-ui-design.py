#!/usr/bin/env python3
"""Verify the sole active Nov23 v10 design set without touching runtime services."""
import hashlib
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / "docs/design"
V10 = DESIGN / "game-ui-v2026.11.23.10"
MANIFEST = DESIGN / "CURRENT_UI_DESIGN_MANIFEST.json"
OLD_IMAGE_RE = re.compile(r"(?:game-ui-v2026\.11\.23\.8|all-pages-v2026\.11\.18\.12)/previews/")
V10_ENTRY_RE = re.compile(r"^\| (/.*?) \| \[v10\]\(previews/([^()]+\.png)\) \|", re.M)
UI_ENTRY_RE = re.compile(
    r"^\| (/.*?) \| [^\n]*?\[NEW PNG\]\(design/game-ui-v2026\.11\.23\.10/previews/([^()]+\.png)\) \|",
    re.M,
)


def require(test: bool, message: str) -> None:
    if not test:
        raise AssertionError(message)


def check() -> None:
    doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
    require(doc["design_version"] == "v2026.11.23.10", "Wrong active design version")
    require(doc["selection"] == "ACTIVE_SOLE_VISUAL_REFERENCE", "Wrong authority selection")
    require(doc["design_review"] == "VISUAL_REVIEW_OPEN", "Artistic QA wrongly marked completed")
    require(doc["runtime_e2e"] == "NOT_VERIFIED", "Runtime QA wrongly marked completed")
    entries = doc["routes"]
    require(doc["total_routes"] == doc["total_images"] == len(entries) == 180, "Wrong route/image count")
    route_to_image = {}
    hashes = set()
    for entry in entries:
        route = entry["route"]
        path = entry["file"]
        require(route.startswith("/") and route not in route_to_image, f"Duplicate/bad route: {route}")
        require(path.startswith("docs/design/game-ui-v2026.11.23.10/previews/"), f"Unapproved path: {path}")
        asset = ROOT / path
        require(asset.is_file(), f"Missing PNG: {asset}")
        with asset.open("rb") as reader:
            head = reader.read(24)
        require(head[:8] == b"\x89PNG\r\n\x1a\n", f"Not PNG: {asset}")
        require(struct.unpack(">II", head[16:24]) == (1660, 990), f"Wrong image size: {asset}")
        digest = hashlib.sha256(asset.read_bytes()).hexdigest()
        require(entry["sha256"] == digest, f"Image changed without manifest update: {asset}")
        require(digest not in hashes, f"Duplicate visual asset hash: {asset}")
        hashes.add(digest)
        route_to_image[route] = asset.name
    actual = {p.name for p in (V10 / "previews").glob("*.png")}
    require(actual == set(route_to_image.values()), "v10 files and manifest entries do not match")
    for lang in ("README.md", "README.ko.md"):
        text = (V10 / lang).read_text(encoding="utf-8")
        rows = V10_ENTRY_RE.findall(text)
        require(len(rows) == 180, f"{lang}: active gallery does not list 180 routes")
        require(dict(rows) == route_to_image, f"{lang}: gallery/manifest route mismatch")
        require(not OLD_IMAGE_RE.search(text), f"{lang}: archived image link in active gallery")
    for lang in ("UI_UX_SINGLE_REFERENCE.md", "UI_UX_SINGLE_REFERENCE.ko.md"):
        text = (ROOT / "docs" / lang).read_text(encoding="utf-8")
        rows = UI_ENTRY_RE.findall(text)
        require(len(rows) == 180, f"{lang}: reference index does not list 180 v10 routes")
        require(dict(rows) == route_to_image, f"{lang}: reference/manifest mismatch")
        require(not OLD_IMAGE_RE.search(text), f"{lang}: archived PNG link mixed into active UI master")
    for old in (DESIGN / "game-ui-v2026.11.23.8/README.md",
                DESIGN / "game-ui-v2026.11.23.8/README.ko.md",
                DESIGN / "all-pages-v2026.11.18.12/README.md"):
        first = old.read_text(encoding="utf-8").splitlines()[0]
        require("ARCHIVED" in first or "보관본" in first, f"Archive tag missing: {old}")
    for path in ("AGENTS.md", "GEMINI.md",
                 "docs/planning/INTEGRATED_PLANNING_MASTER.md",
                 "docs/planning/INTEGRATED_PLANNING_MASTER.ko.md",
                 "DOCS_INDEX.md", "implementation_plan.md"):
        text = (ROOT / path).read_text(encoding="utf-8")
        require("v2026.11.24.1" in text[:1500], f"Agent or master reference not updated: {path}")
    for path in (DESIGN / "CURRENT_UI_DESIGN.md", DESIGN / "CURRENT_UI_DESIGN.ko.md"):
        require(path.is_file(), f"Authority policy missing: {path}")
        text = path.read_text(encoding="utf-8")
        require("v2026.11.23.10" in text and "v2026.11.23.8" in text, f"Version policy unclear: {path}")
    print("PASS: v10 sole design authority / 180 routes / 180 valid PNGs / SHA256 / galleries EN+KO / UI masters EN+KO / archive markers / agent frontdoors")
    print("NOTE: No browser, functional API, Test server or Production release was evaluated.")


if __name__ == "__main__":
    try:
        check()
    except (AssertionError, ValueError, KeyError, OSError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
