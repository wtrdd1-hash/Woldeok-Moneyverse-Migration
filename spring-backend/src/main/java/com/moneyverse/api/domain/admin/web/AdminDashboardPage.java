package com.moneyverse.api.domain.admin.web;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.*;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/** Authenticated server-rendered admin overview; no mock or stale hardcoded financial metrics. */
@Controller
public class AdminDashboardPage {
    private final AdminAuthService auth;
    private final AdminGovernanceService source;

    public AdminDashboardPage(AdminAuthService auth, AdminGovernanceService source) {
        this.auth=auth;this.source=source;
    }
    @GetMapping(value={"/admin","/admin/"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request) {
        HttpHeaders headers=new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));
        headers.setCacheControl(CacheControl.noStore());
        headers.set("Cache-Control","private, no-store");
        headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
        headers.set("X-Frame-Options","DENY");
        headers.set("X-Content-Type-Options","nosniff");
        headers.set("Referrer-Policy","no-referrer");
        headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        UUID actor=auth.resolveVerifiedAdminActor(request).orElse(null);
        if(actor==null) {
            headers.setLocation(URI.create("/login?next=%2Fadmin"));
            return new ResponseEntity<>("",headers,HttpStatus.FOUND);
        }
        AdminUsersResponse users=null;
        AdminStocksResponse stocks=null;
        FeatureSwitchOverviewResponse features=null;
        boolean partial=false;
        try { users=source.listUsers(actor,50); if(users==null||users.getUsers()==null)throw new IllegalStateException("NO_ROWS"); }
        catch(Exception e) { partial=true; }
        try { stocks=source.listStocks(actor); if(stocks==null||stocks.getStocks()==null)throw new IllegalStateException("NO_STOCKS"); }
        catch(Exception e) { partial=true; }
        try { features=source.getFeatureSwitchesOverview(actor); if(features==null||features.getFeatureSwitches()==null)throw new IllegalStateException("NO_SWITCHES"); }
        catch(Exception e) { partial=true; }

        String userCount=users==null?"Source unavailable":String.valueOf(users.getUsers().size());
        String stockCount=stocks==null?"Source unavailable":String.valueOf(stocks.getStocks().size());
        String featureCount=features==null?"Source unavailable":String.valueOf(features.getFeatureSwitches().size());
        StringBuilder market=new StringBuilder();
        if(stocks==null)market.append("<p class=\"unknown\" data-i18n=\"unavailable\">Source unavailable</p>");
        else if(stocks.getStocks().isEmpty())market.append("<p class=\"unknown\" data-i18n=\"empty\">No verified entries</p>");
        else {
            market.append("<div class=\"table-frame\" tabindex=\"0\" role=\"region\" aria-label=\"Stocks\"><table><thead><tr><th data-i18n='symbol'>Symbol</th><th data-i18n='stockName'>Company</th><th data-i18n='currentPrice'>Price</th><th data-i18n='status'>Status</th></tr></thead><tbody>");
            stocks.getStocks().stream().limit(7).forEach(item -> market.append("<tr><td class=\"mono\">").append(esc(item.getSymbol()))
                    .append("</td><td>").append(esc(item.getName())).append("</td><td class=\"mono\">")
                    .append(item.getCurrentPrice()==null?"Unavailable":esc(item.getCurrentPrice())+" WLD").append("</td><td>").append(esc(item.getHaltStatus())).append("</td></tr>"));
            market.append("</tbody></table></div>");
        }
        String status=partial?"Some sources unavailable":"Source-backed overview";
        String html="""
                <!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
                <meta name="theme-color" content="#0c1020"><meta name="robots" content="noindex,nofollow"><title>Admin dashboard · Woldeok Moneyverse</title>
                <link rel="stylesheet" href="/assets/mv39/site.css"><link rel="stylesheet" href="/assets/mv40/admin.css">
                <script src="/assets/mv39/i18n.js" defer></script><script src="/assets/mv40/admin.js" defer></script></head>
                <body class="admin-v40">
                <a href="#main" class="skip-link">Skip to content</a><div class="admin-layout">
                <aside class="admin-sidebar" aria-label="Admin navigation"><a href="/admin" class="brand"><span class="brand-mark">W</span><span>W Moneyverse <small>ADMIN</small></span></a>
                <p class="sidebar-label" data-i18n="adminConsole">Management</p><nav class="admin-nav" aria-label="Administration">
                <a href="/admin" aria-current="page"><span aria-hidden="true">⌂</span><span data-i18n="dashboard">Dashboard</span></a>
                <a href="/admin/users"><span aria-hidden="true">♙</span><span data-i18n="members">Members</span></a>
                <a href="/admin/economy"><span aria-hidden="true">▣</span><span data-i18n="ledger">Economy & ledger</span></a>
                <a href="/admin/shop"><span aria-hidden="true">◇</span><span data-i18n="items">Items & shop</span></a>
                <a href="/admin/blog"><span aria-hidden="true">☷</span><span data-i18n="content">Content</span></a>
                <a href="/admin/market"><span aria-hidden="true">↗</span><span data-i18n="adminMarket">Market</span></a>
                <a href="/admin/analytics"><span aria-hidden="true">◫</span><span data-i18n="analytics">Analytics</span></a>
                <a href="/admin/logs"><span aria-hidden="true">☰</span><span data-i18n="logs">Audit & logs</span></a>
                <a href="/admin/security"><span aria-hidden="true">◈</span><span data-i18n="security">Security</span></a>
                <a href="/admin/support"><span aria-hidden="true">◉</span><span data-i18n="support">Support</span></a>
                </nav><div class="admin-sidebar-foot"><a href="/" data-i18n="memberSite">Member site</a></div></aside>
                <div class="admin-area"><header class="admin-topbar"><button id="admin-menu-open" type="button" class="admin-menu-button" aria-expanded="false" aria-controls="admin-drawer" aria-label="Open admin menu">☰</button>
                <div class="admin-heading"><span class="admin-kicker">WOLDEOK / ADMIN CONSOLE</span><h1 data-i18n="dashboard">Admin dashboard</h1></div>
                <label class="admin-locale-label" for="admin-locale"><span class="sr-only" data-i18n="selectLanguage">Choose language</span>
                <select id="admin-locale" aria-label="Choose language"><option value="auto">Auto</option><option value="en">English</option><option value="ko">한국어</option><option value="ja">日本語</option><option value="zh">简体中文</option><option value="vi">Tiếng Việt</option></select></label>
                <a class="admin-account" href="/account" data-i18n="account">Account</a></header>
                <main id="main" tabindex="-1"><section class="admin-hero"><div><p class="hero-eyebrow">✦ W MONEYVERSE</p><h2 data-i18n="adminWelcome">Control center</h2><p data-i18n="adminLead">Review verified data and navigate protected operations.</p></div>
                <span class="admin-status" data-i18n="@@STATUS_KEY@@" title="Source state">@@STATUS@@</span></section>
                <section aria-label="Source backed key metrics"><div class="admin-section-head"><h2 data-i18n="sourceOverview">Verified overview</h2><a href="/admin" class="admin-refresh" data-i18n="refresh">Refresh</a></div>
                <div class="admin-metrics"><article class="admin-card"><span data-i18n="members">Members</span><strong>@@USERS@@</strong><small data-i18n="verifiedResult">Source records, not site-wide total</small></article>
                <article class="admin-card"><span data-i18n="adminMarket">Market</span><strong>@@STOCKS@@</strong><small data-i18n="verifiedResult">Source records, not site-wide total</small></article>
                <article class="admin-card"><span data-i18n="features">Feature switches</span><strong>@@FEATURES@@</strong><small data-i18n="verifiedResult">Source records, not site-wide total</small></article></div></section>
                <section class="admin-sections"><article class="admin-card"><div class="admin-section-head"><h2 data-i18n="marketPreview">Market snapshot</h2><a href="/admin/market" data-i18n="viewAll">View all</a></div>@@MARKET@@</article>
                <article class="admin-card"><h2 data-i18n="quickActions">Quick actions</h2><div class="admin-actions"><a href="/admin/users" data-i18n="members">Members</a><a href="/admin/controls" data-i18n="controls">Controls</a><a href="/admin/economy" data-i18n="ledger">Economy & ledger</a><a href="/admin/support" data-i18n="support">Support</a><a href="/admin/logs" data-i18n="logs">Audit & logs</a><a href="/admin/security" data-i18n="security">Security</a></div></article></section>
                </main><footer class="admin-footer"><span data-i18n="verifiedOnly">Only verified source responses are shown. Unavailable is not zero.</span></footer></div></div>
                <div id="admin-backdrop" class="admin-backdrop" hidden></div><aside id="admin-drawer" class="admin-drawer" aria-label="Admin mobile menu" hidden><div class="drawer-heading"><span class="brand-mark">W</span><strong data-i18n="adminConsole">Management</strong><button type="button" id="admin-menu-close" aria-label="Close menu">×</button></div>
                <nav><a href="/admin" data-i18n="dashboard">Dashboard</a><a href="/admin/users" data-i18n="members">Members</a><a href="/admin/economy" data-i18n="ledger">Economy & ledger</a><a href="/admin/shop" data-i18n="items">Items & shop</a><a href="/admin/blog" data-i18n="content">Content</a><a href="/admin/market" data-i18n="adminMarket">Market</a><a href="/admin/analytics" data-i18n="analytics">Analytics</a><a href="/admin/logs" data-i18n="logs">Audit & logs</a><a href="/admin/security" data-i18n="security">Security</a><a href="/admin/support" data-i18n="support">Support</a><a href="/" data-i18n="memberSite">Member site</a></nav></aside>
                <nav class="admin-bottom-tabs" aria-label="Admin mobile bottom navigation"><a href="/admin" aria-current="page"><span>⌂</span><span data-i18n="dashboard">Home</span></a><a href="/admin/users"><span>♙</span><span data-i18n="members">Members</span></a><a href="/admin/market"><span>↗</span><span data-i18n="adminMarket">Market</span></a><a href="/admin/logs"><span>☰</span><span data-i18n="logs">Logs</span></a><a href="/admin/support"><span>◉</span><span data-i18n="support">Support</span></a></nav>
                <a href="/admin/support" class="admin-help-fab" aria-label="Help and support" title="Help and support">☏</a>
                </body></html>
                """;
        // Missing data stays UNKNOWN. The shared locale script may translate these labels,
        // but never converts an unavailable source into a fabricated 0.
        if(users==null)html=html.replace("<strong>@@USERS@@", "<strong data-i18n=\"unavailable\">@@USERS@@");
        if(stocks==null)html=html.replace("<strong>@@STOCKS@@", "<strong data-i18n=\"unavailable\">@@STOCKS@@");
        if(features==null)html=html.replace("<strong>@@FEATURES@@", "<strong data-i18n=\"unavailable\">@@FEATURES@@");
        html=html.replace("@@STATUS_KEY@@",partial?"adminPartial":"adminVerified").replace("@@STATUS@@",esc(status)).replace("@@USERS@@",esc(userCount)).replace("@@STOCKS@@",esc(stockCount))
                .replace("@@FEATURES@@",esc(featureCount)).replace("@@MARKET@@",market.toString());
        return new ResponseEntity<>(html,headers,partial?HttpStatus.SERVICE_UNAVAILABLE:HttpStatus.OK);
    }

    /** Canonical route; prevent authenticated users encountering legacy demo admin.html variants. */
    @GetMapping(value={"/admin.html","/admin/index.html","/admin-preview","/admin-preview/","/admin-preview.html","/admin-preview/index.html"}, produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Void> canonicalAdminAlias(HttpServletRequest request) {
        HttpHeaders headers=new HttpHeaders();
        headers.set("Cache-Control","private, no-store");
        headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
        if(auth.resolveVerifiedAdminActor(request).isEmpty())headers.setLocation(URI.create("/login?next=%2Fadmin"));
        else headers.setLocation(URI.create("/admin"));
        return new ResponseEntity<>(headers,HttpStatus.FOUND);
    }

    static String esc(String text) {
        if(text==null)return "Unavailable";
        return text.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;").replace("'","&#39;");
    }
}
