import importlib.util
import pathlib
import re
import unittest

path = pathlib.Path(__file__).with_name("render_engagement_read_v2026_11_17_9.py")
spec = importlib.util.spec_from_file_location("renderer", path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

CONFIG = """server {
    listen 127.0.0.1:4400;
    location ~ ^/api/engagement { return 503; }
}
server {
    listen 80;
    server_name test.easy-scraping.com;
    location / { return 204; }
}
server {
    listen 80 default_server;
    location ~ ^/api/engagement { return 503; }
    location / { proxy_pass http://frontend; }
}
"""


class EngagementSafeReadTests(unittest.TestCase):
    def test_two_scopes_and_eight_exact_routes_only(self):
        result = mod.render(CONFIG)
        self.assertEqual(result.count(mod.MARKER), 2)
        self.assertEqual(result.count("location = /api/engagement"), 8)
        self.assertEqual(result.count("location = /api/v1/engagement"), 8)
        self.assertEqual(result.count("return 405"), 16)
        self.assertIn('location ~ ^/api/engagement { return 503; }', result)
        self.assertIn('proxy_pass http://frontend;', result)
        test = re.search(r"server \{\n\s*listen 80;.*?(?=server \{)", result, re.S).group()
        self.assertNotIn(mod.MARKER, test)

    def test_bad_topology_is_rejected(self):
        with self.assertRaises(ValueError):
            mod.render("server {\n    listen 80 default_server;\n}\n")

    def test_second_install_is_rejected(self):
        with self.assertRaises(ValueError):
            mod.render(mod.render(CONFIG))

    def test_existing_exact_match_fails_closed(self):
        altered = CONFIG.replace('location ~ ^/api/engagement',
                                 'location = /api/v1/engagement/early-game',
                                 1)
        with self.assertRaises(ValueError):
            mod.render(altered)

    def test_methods_restricted_and_auth_proxied(self):
        for src in ("/api/engagement/early-game", "/api/v1/engagement/dopamine/attendance/status"):
            self.assertIn("location = " + src + " {", mod.locations())
        self.assertIn('if ($request_method !~ ^(GET|HEAD)$) { return 405; }', mod.locations())
        self.assertNotIn("proxy_set_header Authorization", mod.locations())
        self.assertNotIn("set $cookie", mod.locations())
        self.assertNotIn("/attendance/spin", mod.locations())


if __name__ == "__main__":
    unittest.main()
