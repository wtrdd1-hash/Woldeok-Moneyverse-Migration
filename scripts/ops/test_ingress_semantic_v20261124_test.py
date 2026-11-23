#!/usr/bin/env python3
"""Test-only Nginx insertion safety checks."""
import importlib.util
from pathlib import Path
import unittest

MODULE = Path(__file__).with_name("test_ingress_semantic_v20261124.py")
spec = importlib.util.spec_from_file_location("test_ingress_semantic", MODULE)
tool = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tool)


class TestIngressSemantic(unittest.TestCase):
    def setUp(self):
        self.prod = b"# 2. Main Website & API Server (easy-scraping.com only - NO MCP routes)\nserver {\nlisten 80;\nserver_name easy-scraping.com;\n}\n"
        self.original = b"server {\nserver_name test.easy-scraping.com;\nlocation / { return 403; }\n}\n\n" + self.prod

    def test_test_host_only_and_reversible(self):
        candidate = tool.patched(self.original)
        self.assertEqual(tool.unpatched(candidate), self.original)
        self.assertEqual(candidate[candidate.index(tool.TEST_END):], self.prod)
        self.assertEqual(candidate[:candidate.index(tool.TEST_HOST)], self.original[:self.original.index(tool.TEST_HOST)])

    def test_duplicate_install_refused(self):
        with self.assertRaisesRegex(RuntimeError, "Already installed"):
            tool.patched(tool.patched(self.original))

    def test_ambiguous_test_host_refused(self):
        with self.assertRaisesRegex(RuntimeError, "ambiguous"):
            tool.patched(self.original.replace(tool.TEST_HOST, tool.TEST_HOST + tool.TEST_HOST))

    def test_missing_production_boundary_refused(self):
        with self.assertRaisesRegex(RuntimeError, "missing/ambiguous"):
            tool.patched(self.original.replace(tool.TEST_END, b""))

    def test_no_qa_probe_specific_bypass(self):
        self.assertNotIn(b"__qa_semantic", tool.TEST_INSERT)


if __name__ == "__main__":
    unittest.main()
