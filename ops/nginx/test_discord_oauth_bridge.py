"""Regression checks for the internal Discord/Google OAuth gateway handoff."""
from pathlib import Path
import re
import unittest

SOURCE = Path(__file__).with_name('discord-oauth-node-bridge-v2026.11.17.4.conf')


class OAuthGatewayBridgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = SOURCE.read_text(encoding='utf-8')

    def test_only_provider_oauth_routes_are_sent_to_node(self):
        match = re.search(r'location\s+~\s+([^\s{]+)\s*\{', self.source)
        self.assertIsNotNone(match, 'Need a constrained route selection')
        pattern = re.compile(match.group(1))
        for provider in ('discord', 'google'):
            for action in ('authorize', 'callback'):
                with self.subTest(provider=provider, action=action):
                    self.assertIsNotNone(pattern.fullmatch(f'/auth/{provider}/{action}'))
        for bad in ('/auth/bootstrap', '/auth/session', '/auth/discord/other',
                    '/api/v1/auth/prelogin-session', '/api/v1/auth/local/login',
                    '/auth/discord/authorize/extra', '/auth/evil/callback'):
            with self.subTest(rejected=bad):
                self.assertIsNone(pattern.fullmatch(bad))

    def test_preserves_cookies_while_restricting_cache_and_redirects(self):
        self.assertIn('proxy_pass http://prod_node;', self.source)
        self.assertIn('proxy_set_header Host $http_host;', self.source)
        self.assertIn('proxy_set_header X-Forwarded-Proto https;', self.source)
        self.assertIn('Cache-Control "private, no-store" always;', self.source)
        self.assertIn('X-Robots-Tag "noindex, nofollow" always;', self.source)
        self.assertNotIn('proxy_hide_header Set-Cookie', self.source)
        self.assertNotIn('return 302', self.source)


if __name__ == '__main__':
    unittest.main()
