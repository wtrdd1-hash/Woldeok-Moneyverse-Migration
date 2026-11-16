"""Regression contract: public edge must not expose token-only Spring admin claims."""
from pathlib import Path
import re
import unittest

CONF = Path(__file__).with_name('stock-admin-public-edge-bridge-v2026.11.17.1.conf')


class StockAdminPublicBridgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.conf = CONF.read_text()

    def test_exact_admin_routes_preempt_frontend_rewrite(self):
        for route in ('/api/v1/admin/security', '/api/v1/admin/me'):
            self.assertRegex(self.conf, re.escape('location = '+route)+r'\s*\{[^}]*proxy_pass http://prod_node;')
        self.assertRegex(self.conf, r'location \^~ /api/v1/admin/security/\s*\{[^}]*proxy_pass http://prod_node;')

    def test_no_privilege_forging(self):
        self.assertNotRegex(self.conf, r'proxy_set_header\s+(X-Internal-Token|Cookie|Authorization|X-CSRF-Token)\s+')
        self.assertNotIn('proxy_pass http://prod_spring',self.conf)

    def test_private_cache_control(self):
        self.assertEqual(self.conf.count('add_header Cache-Control "private, no-store" always;'),3)
        self.assertEqual(self.conf.count('add_header X-Robots-Tag "noindex, nofollow" always;'),3)

if __name__ == '__main__': unittest.main()
