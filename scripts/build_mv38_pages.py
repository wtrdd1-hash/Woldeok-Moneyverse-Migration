"""Generate eight independent Spring static route entrypoints with one shared UI shell."""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1] / 'spring-backend/src/main/resources/static'
ROUTES = {'home':'index.html', 'wallet':'wallet.html','stocks':'stocks.html','quests':'quests.html',
          'shop':'shop.html','board':'board.html','support':'support.html','account':'account.html'}
NAV = [ ('home','/','⌂'), ('wallet','/wallet','▣'), ('stocks','/invest','↗'), ('quests','/quests','✧'),
       ('shop','/shop','◈'), ('board','/board','☷'), ('support','/support','◉'), ('account','/account','♙')]
BOTTOM = ['home','wallet','stocks','quests','board']
TITLES = {'home':'My assets', 'wallet':'Wallet', 'stocks':'Invest', 'quests':'Quests', 'shop':'Shop',
          'board':'Community', 'support':'Help & support', 'account':'Account'}

def nav_html(page, nav_class):
    out=[]
    for key,href,icon in NAV:
        active=' aria-current="page"' if key==page else ''
        out.append(f'<a class="{nav_class}" href="{href}"{active}><span class="nav-icon" aria-hidden="true">{icon}</span><span data-i18n="{key}">{TITLES.get(key,key)}</span></a>')
    return '\n'.join(out)

def bottom_html(page):
    return ''.join(f'<a class="bottom-tab" href="{href}"'+(' aria-current="page"' if key==page else '') +
                   f'><span aria-hidden="true">{icon}</span><span data-i18n="{key}">{TITLES.get(key,key)}</span></a>'
                   for key,href,icon in NAV if key in BOTTOM)

def build(page):
    heading=escape(TITLES[page]);icon=dict((x[0],x[2]) for x in NAV)[page]
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#0b0e1b">
  <meta name="description" content="W Moneyverse — personal finance, investing, quests and community">
  <title>{heading} · W Moneyverse</title>
  <link rel="stylesheet" href="/assets/mv38/site.css">
  <script src="/assets/mv38/i18n.js" defer></script>
  <script src="/assets/mv38/app.js" defer></script>
</head>
<body data-page="{page}" data-build="v2026.11.19.38">
<a class="skip-link" href="#main-content">Skip to main content</a>
<div class="app-shell">
  <aside class="sidebar" aria-label="Main navigation">
    <a href="/" class="brand"><span class="brand-mark">W</span><span>W Moneyverse</span></a>
    <nav class="side-links" aria-label="Primary navigation">
      {nav_html(page,'nav-link')}
    </nav>
    <div class="side-bottom"><span class="side-helper" data-i18n="allRights">Virtual WLD is not legal tender.</span></div>
  </aside>
  <div class="app-main">
    <div class="app-inner">
      <header class="topbar">
        <button id="mobile-menu-toggle" class="menu-toggle" type="button" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">☰</button>
        <h1 data-i18n="{page}">{heading}</h1>
        <div class="top-spacer"></div>
        <label class="lang-control" for="language-selector"><span aria-hidden="true">◎</span><span class="sr-only" data-i18n="selectLanguage">Choose language</span>
          <select id="language-selector" aria-label="Choose language">
            <option value="auto">Auto · Browser</option>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="zh">简体中文</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </label>
        <div class="auth-actions" id="auth-actions"><a href="/login" class="auth-link" data-i18n="login">Log in</a></div>
      </header>
      <main id="main-content" tabindex="-1">
        <section class="hero" aria-labelledby="hero-title">
          <div><div class="eyebrow">✦ W Moneyverse</div><h2 id="hero-title"></h2><p id="hero-description"></p></div>
          <div class="hero-decoration" aria-hidden="true">{icon}</div>
        </section>
        <div id="page-content" aria-live="polite"></div>
      </main>
      <footer class="footer"><span data-i18n="allRights">Virtual WLD is not legal tender.</span>
        <span class="foot-links"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/help" data-i18n="support">Support</a></span></footer>
    </div>
  </div>
</div>
<div id="drawer-backdrop" class="drawer-backdrop" hidden></div>
<aside id="mobile-menu" class="drawer" hidden aria-label="Mobile navigation">
  <div class="drawer-header"><a href="/" class="brand"><span class="brand-mark">W</span><span>W Moneyverse</span></a>
    <button type="button" id="mobile-menu-close" class="drawer-close" aria-label="Close menu">×</button></div>
  <nav class="side-links" aria-label="Mobile primary navigation">{nav_html(page,'nav-link')}</nav>
</aside>
<nav class="bottom-tabs" id="mobile-tabs" aria-label="Mobile bottom navigation">{bottom_html(page)}</nav>
<a href="/support" class="support-fab" aria-label="Contact support" title="Contact support">☏</a>
</body>
</html>
'''

if __name__ == '__main__':
    for page,filename in ROUTES.items():
        (ROOT/filename).write_text(build(page))
    (ROOT/'invest.html').write_text(build('stocks'))
    print('Generated',len(ROUTES)+1,'Spring static route entrypoints including /invest for the native Spring /stocks collision')
