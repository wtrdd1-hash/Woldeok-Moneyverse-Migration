#!/usr/bin/env python3
"""Deterministic Next -> Spring route ownership inventory.

This emits an audit plan, NOT a claim of converted parity or an automatic router.
Run --write on a dedicated branch; --check in CI to detect new/removed Next routes.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NEXT_ROOT = ROOT / "frontend" / "src" / "app"
MANIFEST = ROOT / "docs/migration/SPRING_FRONTEND_ROUTE_INVENTORY_v2026.11.17.2.json"

PUBLIC = {"", "announcements", "gallery", "status", "terms", "privacy", "features",
          "roadmap", "guide", "help", "blog", "search", "newspaper"}
AUTH = {"account", "auth", "login", "register", "forgot-password",
        "reset-password", "verify-email", "verify-email-change", "profile", "settings"}
FINANCE = {"wallet", "bank", "banking", "treasury", "mint", "central-bank", "stocks",
           "bonds", "fx", "pension", "kdic", "casino", "marketplace", "shop",
           "transfers", "enterprises", "businesses"}

def route_path(file: Path, marker: str) -> str:
    segments = [segment for segment in file.relative_to(NEXT_ROOT).parent.parts
                if not (segment.startswith("(") and segment.endswith(")"))]
    path = "/" + "/".join(segments)
    return "/" if path == "/" else path

def phase_for(path: str) -> str:
    parts = [p for p in path.split("/") if p]
    if not parts:
        return "G2_PUBLIC"
    if parts[0] == "api":
        parts = parts[1:]
    if parts and parts[0] in ("v1", "app-api"):
        parts = parts[1:]
    first = parts[0] if parts else ""
    if first == "admin":
        return "G5_ADMIN"
    if first in FINANCE:
        return "G4_FINANCE"
    if first in AUTH:
        return "G3_MEMBER"
    if first in PUBLIC:
        return "G2_PUBLIC"
    return "G6_OTHER"

def build_manifest() -> dict:
    items = []
    for marker, kind in (("page.tsx", "PAGE"), ("route.ts", "BFF")):
        for file in NEXT_ROOT.rglob(marker):
            path = route_path(file, marker)
            # Only preview URLs exist; neither canonical URL has been replaced.
            preview = ("/spring-web/status" if kind == "PAGE" and path == "/status"
                       else "/spring-web" if kind == "PAGE" and path == "/" else None)
            items.append({
                "kind": kind,
                "path": path,
                "next_source": file.relative_to(ROOT).as_posix(),
                "spring_candidate": preview,
                "phase": phase_for(path),
                "state": "PREVIEW_NOT_PARITY" if preview else "NOT_MIGRATED",
                "production_cutover": False
            })
    items.sort(key=lambda x: (x["kind"], x["path"], x["next_source"]))
    distinct = {(x["kind"], x["path"]) for x in items}
    if len(distinct) != len(items):
        raise ValueError("Duplicate effective Next routes; review groups manually")
    return {
        "schema": "spring-frontend-inventory/v1",
        "migration_version": "v2026.11.17.2",
        "source_stack": "Next.js App Router",
        "target_stack": "Spring Boot MVC SSR + progressive browser JavaScript",
        "counts": {
            "next_pages": sum(x["kind"] == "PAGE" for x in items),
            "next_bff_handlers": sum(x["kind"] == "BFF" for x in items),
            "canonical_pages_fully_migrated": 0,
            "canonical_bff_handlers_fully_migrated": 0,
            "preview_candidates": sum(x["state"] == "PREVIEW_NOT_PARITY" for x in items)
        },
        "routes": items,
        "note": "An inventory is NOT tested route parity. Production remains on the existing frontend."
    }

def main() -> None:
    parser = argparse.ArgumentParser()
    selection = parser.add_mutually_exclusive_group(required=True)
    selection.add_argument("--write", action="store_true")
    selection.add_argument("--check", action="store_true")
    args = parser.parse_args()
    actual = build_manifest()
    expected = json.dumps(actual, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(expected)
        print("WRITTEN", MANIFEST.relative_to(ROOT), actual["counts"])
    elif not MANIFEST.exists() or MANIFEST.read_text() != expected:
        raise SystemExit("STALE: Spring migration route inventory differs from current frontend files")
    else:
        print("PASS inventory parity", actual["counts"])

if __name__ == "__main__":
    main()
