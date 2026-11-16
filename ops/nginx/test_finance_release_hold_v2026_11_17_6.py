import importlib.util
import pathlib
import re
import unittest

PATH = pathlib.Path(__file__).with_name("render_finance_release_hold_v2026_11_17_6.py")
SPEC = importlib.util.spec_from_file_location("render_guard", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class FinanceReleaseHoldTests(unittest.TestCase):
    def setUp(self):
        self.config = """
events {}
http {}
server {
    listen 127.0.0.1:4400;
    server_name 127.0.0.1;
    location / { proxy_pass http://spring; }
}
server {
    listen 80;
    server_name test.easy-scraping.com;
    location / { return 204; }
}
server {
    listen 80 default_server;
    server_name _;
    location ^~ /api/admin/kdic/ {
        proxy_pass http://spring;
    }
    location ^~ /api/kdic/ {
        proxy_pass http://spring;
    }
    location / { proxy_pass http://frontend; }
}
"""

    def test_target_only_public_and_internal(self):
        actual = MODULE.render(self.config)
        self.assertEqual(actual.count(MODULE.MARKER), 2)
        self.assertEqual(actual.count('FINANCE_LEDGER_RELEASE_HOLD'), 8)
        self.assertEqual(actual.count('ENGAGEMENT_LEDGER_RELEASE_HOLD'), 2)
        test = re.search(r'server \{\n\s*listen 80;.*?(?=server \{)', actual, re.S).group()
        self.assertNotIn('FINANCE_LEDGER_RELEASE_HOLD', test)
        self.assertIn('proxy_pass http://frontend;', actual)

    def test_topology_change_refuses_mutation(self):
        with self.assertRaises(ValueError):
            MODULE.render("server {\n    listen 80 default_server;\n}\n")

    def test_duplicate_application_fails_closed(self):
        patched = MODULE.render(self.config)
        with self.assertRaises(ValueError):
            MODULE.render(patched)

    def test_engagement_pattern_narrow(self):
        pat = re.compile(MODULE.ENGAGEMENT_PATTERN)
        for path in (
            "/api/engagement/streak", "/api/v1/engagement/dopamine/status",
            "/api/engagement/claim-streak", "/api/v1/dopamine/bull-bear",
            "/api/engagement", "/api/engagement/", "/api/dopamine/status"
        ):
            self.assertIsNotNone(pat.fullmatch(path), path)
        for path in (
            "/api/v1/engagement/early-game",
            "/api/v1/engagement/dopamine/attendance/status",
            "/api/v1/engagement/dopamine/attendance/spin",
            "/api/v1/kdic/portal", "/api/v1/auth/login",
            "/api/v1/admin/kdic/overview"
        ):
            self.assertIsNone(pat.fullmatch(path), path)


if __name__ == "__main__":
    unittest.main()
