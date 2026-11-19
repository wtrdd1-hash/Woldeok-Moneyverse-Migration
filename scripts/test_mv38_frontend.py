"""Contract gates for Spring-served responsive, real-data, five-language UI."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1] / 'spring-backend/src/main/resources/static'
ASSETS = ROOT / 'assets/mv38'
PAGES = {'home':'index.html','wallet':'wallet.html','stocks':'stocks.html','quests':'quests.html','shop':'shop.html','board':'board.html','support':'support.html','account':'account.html'}

class MoneyverseResponsiveUiContracts(unittest.TestCase):
    def test_all_core_pc_mobile_paths_have_new_spring_shell(self):
        for name, path in PAGES.items():
            with self.subTest(name=name):
                html = (ROOT/path).read_text()
                self.assertIn('data-page="'+name+'"', html)
                self.assertIn('assets/mv38/site.css', html)
                self.assertIn('assets/mv38/i18n.js', html)
                self.assertIn('assets/mv38/app.js', html)
                self.assertIn('id="mobile-menu-toggle"',html)
                self.assertIn('id="mobile-tabs"',html)
                self.assertIn('id="language-selector"',html)
                self.assertNotIn('/_next/static/',html)
                self.assertNotIn('alert(',html)

    def test_exact_five_existing_languages_plus_auto(self):
        loc=(ASSETS/'i18n.js').read_text()
        for value in ('en','ko','ja','zh','vi'):
            self.assertIn("'"+value+"'",loc)
        self.assertIn('wdmv_locale',loc)
        self.assertIn('nav.languages',loc)
        self.assertIn('localStorage',loc)
        self.assertIn('Auto',loc)
        self.assertIn('setPreference',loc)
        self.assertIn('document.documentElement.lang',loc)

    def test_new_invest_route_is_not_shadowed_by_native_stocks_controller(self):
        html=(ROOT/'invest.html').read_text()
        self.assertIn('data-page="stocks"',html)
        self.assertIn('assets/mv38/app.js',html)

    def test_no_demo_money_or_public_tech_diagnostics(self):
        forbidden=('100,000,000,000,000','12,580 WLD','+2.41%','Netty 9092',
                   'Spring Boot 3.3.5','원장 동기화','API 오류 시','실데이터 운영 기준','status: normal',
                   'data-sample','fake chart')
        for file in list(ASSETS.glob('*.js'))+[ROOT/p for p in PAGES.values()]:
            s=file.read_text()
            for token in forbidden:
                self.assertNotIn(token,s, f'{file}: {token}')

    def test_authenticated_account_data_is_fail_closed(self):
        js=(ASSETS/'app.js').read_text()
        for exact in ('/api/v1/auth/session','/api/v1/wallet/summary','/api/v1/stocks/portfolio',
                      '/api/v1/stocks','/api/v1/shop/public-catalog','/api/v1/board'):
            self.assertIn(exact,js)
        self.assertIn('same-origin',js)
        self.assertIn('no-store',js)
        self.assertIn('session.signedIn',js)
        self.assertNotIn('/api/v1/wallet/overview',js)
        self.assertNotIn('X-User-Id',js)
        self.assertNotIn('x-actor-user-id',js)
        self.assertNotIn('innerHTML',js)

    def test_mobile_not_wrapped_ticker_or_header(self):
        css=(ASSETS/'site.css').read_text()
        compact=re.sub(r'\s+','',css)
        for term in ('overflow-x:auto','min-width:760px','white-space:nowrap','word-break:keep-all',
                     'min-width:0','env(safe-area-inset-bottom)','@media(max-width:480px)',
                     '@media(max-width:1023px)'):
            self.assertIn(term,compact)
        self.assertNotIn('overflow-x: hidden !important', css)

    def test_authenticated_small_mobile_header_uses_two_rows_and_minimum_touch_targets(self):
        css=(ASSETS/'site.css').read_text()
        js=(ASSETS/'app.js').read_text()
        self.assertIn('.topbar.member-authenticated',css)
        self.assertIn('.topbar.member-authenticated .auth-actions',css)
        self.assertIn('.topbar.member-authenticated .auth-logout{min-width:84px;min-height:44px;',css)
        self.assertIn("classList.toggle('member-authenticated',isSignedIn())",js)

    def test_real_data_error_states_and_verified_admin_visibility(self):
        js=(ASSETS/'app.js').read_text()
        for value in ('loggedOut','unavailable','admin','aria-expanded','Escape','fetchJson',
                      'renderHome','renderWallet','renderStocks','renderQuests','renderShop','renderBoard'):
            self.assertIn(value,js)
        self.assertIn("roles",js)
        self.assertNotIn('ADMIN = true', js)

if __name__ == '__main__':
    unittest.main()
