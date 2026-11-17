"""Prevent host-only OAuth session loss on the www alias."""
from pathlib import Path
import re
import unittest

SOURCE = Path(__file__).with_name('discord-oauth-canonical-start-v2026.11.17.4.conf')


class OAuthCanonicalStartTests(unittest.TestCase):
    def test_only_oauth_authorize_start_is_canonicalized(self):
        source = SOURCE.read_text(encoding='utf-8')
        location = re.search(r'location\s+~\s+([^\s{]+)\s*\{', source)
        self.assertIsNotNone(location)
        expression = re.compile(location.group(1))
        for path in ('/auth/discord/authorize','/auth/google/authorize'):
            self.assertTrue(expression.fullmatch(path))
        for path in ('/auth/discord/callback','/auth/google/callback','/login',
                     '/api/v1/auth/prelogin-session','/auth/bootstrap'):
            self.assertFalse(expression.fullmatch(path))
        self.assertIn('if ($host = www.easy-scraping.com)', source)
        self.assertIn('return 307 https://easy-scraping.com$request_uri;', source)
        self.assertIn('proxy_pass http://prod_frontend;', source)
        self.assertIn('X-Forwarded-Proto https;', source)
        self.assertNotIn('proxy_cookie_domain', source)


if __name__ == '__main__':
    unittest.main()
