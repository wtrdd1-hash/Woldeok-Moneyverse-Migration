import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).with_name("render_kdic_public_edge_v2026_11_17_8.py")
SPEC = importlib.util.spec_from_file_location("kdic_bridge", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class TestCanonicalKdicPublicEdge(unittest.TestCase):
    def setUp(self):
        self.original = """server {
    # v2026.11.17.6 KDIC + legacy engagement release hold (internal)
    listen 127.0.0.1:4400;
    location ^~ /api/kdic/ {
        return 503;
    }
    location ^~ /api/v1/kdic/ {
        return 503;
    }
    location / { return 204; }
}
server {
    listen 80;
    server_name test.easy-scraping.com;
    location / { return 204; }
}
server {
    # v2026.11.17.6 KDIC + legacy engagement release hold (public)
    listen 80 default_server;
    location ^~ /api/kdic/ {
        return 503;
    }
    location ^~ /api/v1/kdic/ {
        return 503;
    }
    location / { return 204; }
}
"""

    def test_production_and_internal_only(self):
        new = MODULE.render(self.original)
        self.assertEqual(new.count(MODULE.MARKER), 2)
        self.assertEqual(new.count('location = /api/kdic/portal {'), 2)
        self.assertEqual(new.count('location = /api/v1/kdic/portal {'), 2)
        self.assertIn('proxy_pass http://127.0.0.1:4500/api/v1/kdic/portal;', new)
        test_scope = new.split('server_name test.easy-scraping.com;')[1].split('server {')[0]
        self.assertNotIn(MODULE.MARKER, test_scope)
        self.assertEqual(new.count('location ^~ /api/kdic/ {'), 2)

    def test_no_promotion_without_prior_guard(self):
        with self.assertRaises(ValueError):
            MODULE.render(self.original.replace('v2026.11.17.6', 'v2026.11.17.0'))

    def test_repeat_render_refused(self):
        with self.assertRaises(ValueError):
            MODULE.render(MODULE.render(self.original))

    def test_original_unrelated_routes_unaffected(self):
        new = MODULE.render(self.original)
        self.assertEqual(new.count('location / { return 204; }'), 3)
        self.assertEqual(new.count('return 503;'), 4)
        self.assertIn('if ($request_method !~ ^(GET|HEAD)$)', new)

if __name__ == '__main__':
    unittest.main()
