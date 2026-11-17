import importlib.util
from pathlib import Path
import re
import unittest

path = Path(__file__).with_name("render_kdic_admin_read_v2026_11_17_13.py")
spec = importlib.util.spec_from_file_location("kdic_read", path)
kdic = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kdic)

BASE = """server {
    listen 127.0.0.1:4400;
    location ^~ /api/admin/kdic/ { return 503; }
}
server {
    listen 80;
    server_name test.easy-scraping.com;
    location / { return 204; }
}
server {
    listen 80 default_server;
    location ^~ /api/admin/kdic/ { return 503; }
    location / { proxy_pass http://frontend; }
}
"""


class KdicReadBridgeTests(unittest.TestCase):
    def test_no_finance_post_enabled_and_aliases_exact(self):
        new = kdic.render(BASE)
        self.assertEqual(new.count(kdic.MARKER), 2)
        self.assertEqual(new.count("return 405"), 8)
        self.assertEqual(new.count("x-internal-token"), 8)
        self.assertEqual(new.count("proxy_pass http://127.0.0.1:4500"), 8)
        self.assertIn("location ^~ /api/admin/kdic/ { return 503; }", new)
        self.assertNotIn("/assess-premiums {", new)
        self.assertNotIn("/payout {", new)
        test = re.search(r"server \{\n\s*listen 80;.*?(?=server \{)", new, re.S).group()
        self.assertNotIn(kdic.MARKER, test)

    def test_only_declared_methods_can_pass(self):
        assert kdic.exact_locations().count('if ($request_method !~ ^(GET|HEAD)$) { return 405; }') == 4

    def test_missing_or_duplicate_topology_refused(self):
        with self.assertRaises(ValueError):
            kdic.render("server {\n    listen 80 default_server;\n}\n")
        with self.assertRaises(ValueError):
            kdic.render(kdic.render(BASE))

    def test_existing_exact_location_refused(self):
        with self.assertRaises(ValueError):
            kdic.render(BASE.replace("location ^~ /api/admin/kdic/", "location = /api/v1/admin/kdic/overview", 1))


if __name__ == "__main__":
    unittest.main()
