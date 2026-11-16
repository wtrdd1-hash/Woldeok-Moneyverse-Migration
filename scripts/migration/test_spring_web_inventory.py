#!/usr/bin/env python3
import json
import subprocess
import sys
import unittest
from pathlib import Path
from spring_web_inventory import ROOT, MANIFEST, build_manifest

class MigrationInventoryTest(unittest.TestCase):
    def test_all_next_files_are_in_inventory(self):
        data = build_manifest()
        self.assertEqual(data["counts"]["next_pages"], 178)
        self.assertEqual(data["counts"]["next_bff_handlers"], 124)
        self.assertEqual(len(data["routes"]), 302)
    def test_no_unverified_route_claims_canonical_spring_coverage(self):
        data = build_manifest()
        self.assertEqual(data["counts"]["canonical_pages_fully_migrated"], 0)
        self.assertEqual(data["counts"]["canonical_bff_handlers_fully_migrated"], 0)
        self.assertEqual(data["counts"]["preview_candidates"], 2)
        self.assertTrue(all(not row["production_cutover"] for row in data["routes"]))
        preview = {x["path"]: x["spring_candidate"] for x in data["routes"] if x["spring_candidate"]}
        self.assertEqual(preview, {"/": "/spring-web", "/status": "/spring-web/status"})
    def test_checked_in_manifest_matches_source(self):
        target = json.loads(MANIFEST.read_text())
        self.assertEqual(target, build_manifest())
    def test_new_or_deleted_path_blocks_uncertified_inventory(self):
        result = subprocess.run([sys.executable,
                                 str(ROOT/"scripts/migration/spring_web_inventory.py"), "--check"],
                                cwd=ROOT, check=False, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

if __name__ == "__main__":
    unittest.main()
