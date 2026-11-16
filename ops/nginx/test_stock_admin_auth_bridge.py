"""Regression contract for the privileged Admin API bridge.

Run `python3 -m unittest ops/nginx/test_stock_admin_auth_bridge.py`.
"""
import pathlib
import re
import unittest

CONF = pathlib.Path(__file__).with_name('stock-admin-auth-bridge-v2026.11.17.1.conf')


class StockAdminAuthBridgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.conf = CONF.read_text()

    def test_admin_session_routes_use_real_nest_security_authority(self):
        for route in ('/api/v1/admin/security', '/api/v1/admin/me'):
            self.assertRegex(self.conf, re.escape('location = ' + route) + r'\s*\{[^}]*proxy_pass http://prod_node;', route)
        self.assertRegex(self.conf, r'location \^~ /api/v1/admin/security/\s*\{[^}]*proxy_pass http://prod_node;')

    def test_integration_forwards_cookies_and_csrf_without_manufacturing_them(self):
        self.assertNotRegex(self.conf, r'proxy_set_header\s+(Cookie|X-Internal-Token|X-CSRF-Token)\s+', 'Never synthesize authentication headers')
        self.assertNotIn('proxy_pass http://prod_spring', self.conf)

    def test_private_uncacheable_auth_responses(self):
        self.assertEqual(self.conf.count('add_header Cache-Control "private, no-store" always;'), 3)
        self.assertEqual(self.conf.count('add_header X-Robots-Tag "noindex, nofollow" always;'), 3)


if __name__ == '__main__':
    unittest.main()
