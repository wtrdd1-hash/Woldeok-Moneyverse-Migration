package com.moneyverse.api.domain.admin.web;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.*;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import com.moneyverse.api.domain.business.dto.BusinessDtos.*;
import com.moneyverse.api.domain.business.service.BusinessService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

/** Server-rendered, source-backed Spring admin overview pages replacing broken Next static snapshots. */
@Controller
public class LiveAdminOverviewPages {
    private final AdminAuthService auth;
    private final AdminGovernanceService governance;
    private final BusinessService business;

    public LiveAdminOverviewPages(AdminAuthService auth, AdminGovernanceService governance, BusinessService business) {
        this.auth = auth;
        this.governance = governance;
        this.business = business;
    }

    @GetMapping(value = {"/admin/market", "/admin/economy", "/admin/controls", "/admin/enterprises", "/admin/economy/scenario-lab"},
            produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request,
            @RequestParam(name = "lang", defaultValue = "en") String language) {
        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.noStore());
        headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));
        headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
        headers.set("X-Frame-Options", "DENY");
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
        String uri = request.getRequestURI();
        UUID actor = auth.resolveVerifiedAdminActor(request).orElse(null);
        if (actor == null) {
            headers.setLocation(URI.create("/login?next=" + URLEncoder.encode(uri, StandardCharsets.UTF_8)));
            return new ResponseEntity<>("", headers, HttpStatus.FOUND);
        }
        boolean ko = "ko".equalsIgnoreCase(language);
        String title = title(uri, ko);
        String body;
        try {
            body = switch (uri) {
                case "/admin/market" -> market(actor, ko);
                case "/admin/enterprises" -> enterprises(ko);
                case "/admin/controls" -> controls(actor, ko);
                case "/admin/economy", "/admin/economy/scenario-lab" -> economy(actor, ko, uri.endsWith("scenario-lab"));
                default -> throw new IllegalArgumentException("UNKNOWN_ADMIN_PAGE");
            };
        } catch (Exception e) {
            String status = ko ? "검증된 데이터 소스를 이용할 수 없습니다." : "The authoritative data source is currently unavailable.";
            return new ResponseEntity<>(LiveAdminUsersPage.renderPage(ko, title,
                    "<section class=\"panel\"><h1>" + LiveAdminUsersPage.escape(status) + "</h1><p>HTTP 503</p></section>"),
                    headers, HttpStatus.SERVICE_UNAVAILABLE);
        }
        return new ResponseEntity<>(LiveAdminUsersPage.renderPage(ko, title, body), headers, HttpStatus.OK);
    }

    private static String title(String uri, boolean ko) {
        return switch (uri) {
            case "/admin/market" -> ko ? "주식 시장 관제" : "Stock market oversight";
            case "/admin/enterprises" -> ko ? "사업장 관제" : "Enterprise oversight";
            case "/admin/controls" -> ko ? "기능 제어" : "Feature governance";
            case "/admin/economy/scenario-lab" -> ko ? "경제 시나리오 연구소" : "Economy scenario lab";
            default -> ko ? "경제 및 원장 정합성" : "Economy and ledger integrity";
        };
    }

    private static String heading(String title, boolean ko) {
        return "<section class=\"panel\"><p class=\"eyebrow\">SPRING / VERIFIED SOURCE</p><h1>"
                + LiveAdminUsersPage.escape(title) + "</h1><p class=\"subtle\">"
                + (ko ? "관리자 세션과 실제 데이터베이스 조회 결과만 표시합니다."
                        : "Only verified administrator sessions and canonical source data are displayed.")
                + "</p>";
    }

    private String market(UUID actor, boolean ko) {
        AdminStocksResponse data = governance.listStocks(actor);
        if (data == null || data.getStocks() == null) throw new IllegalStateException("STOCK_SOURCE_MISSING");
        StringBuilder html = new StringBuilder(heading(title("/admin/market", ko), ko));
        html.append("<p class=\"total\">").append(data.getStocks().size()).append(" stocks</p>");
        html.append("<div class=\"tablewrap\"><table><thead><tr><th>Symbol</th><th>Name</th><th>Price</th><th>Status</th></tr></thead><tbody>");
        for (AdminStockDto stock : data.getStocks()) {
            html.append("<tr><td>").append(esc(stock.getSymbol())).append("</td><td>")
                    .append(esc(stock.getName())).append("</td><td>").append(esc(stock.getCurrentPrice()))
                    .append("</td><td>").append(esc(stock.getHaltStatus())).append("</td></tr>");
        }
        if (data.getStocks().isEmpty()) html.append("<tr><td colspan=\"4\">Verified source returned no stocks</td></tr>");
        return html.append("</tbody></table></div></section>").toString();
    }

    private String enterprises(boolean ko) {
        BusinessCatalogResponse data = business.getCatalog();
        if (data == null || !data.success() || data.catalog() == null) throw new IllegalStateException("ENTERPRISE_SOURCE_MISSING");
        StringBuilder html = new StringBuilder(heading(title("/admin/enterprises", ko), ko));
        html.append("<p class=\"total\">").append(data.catalog().size()).append(" enterprises</p>");
        html.append("<div class=\"tablewrap\"><table><thead><tr><th>Name</th><th>Purchase cost</th><th>Daily net estimate</th></tr></thead><tbody>");
        for (BusinessCatalogItem item : data.catalog()) {
            html.append("<tr><td>").append(esc(item.name())).append("</td><td>")
                    .append(esc(item.basePrice())).append("</td><td>").append(esc(item.dailyYield())).append("</td></tr>");
        }
        if (data.catalog().isEmpty()) html.append("<tr><td colspan=\"3\">Verified source returned no enterprises</td></tr>");
        return html.append("</tbody></table></div></section>").toString();
    }

    private String controls(UUID actor, boolean ko) {
        FeatureSwitchOverviewResponse result = governance.getFeatureSwitchesOverview(actor);
        if (result == null || result.getFeatureSwitches() == null) throw new IllegalStateException("FEATURE_SOURCE_MISSING");
        StringBuilder html = new StringBuilder(heading(title("/admin/controls", ko), ko));
        html.append("<p class=\"hint\">")
                .append(ko ? "변경은 별도 멱등·CSRF 검증된 관리자 API로만 가능합니다." : "Mutations require separately verified CSRF and idempotent administrator API receipts.")
                .append("</p><div class=\"tablewrap\"><table><thead><tr><th>Feature</th><th>State</th><th>Reason</th></tr></thead><tbody>");
        for (FeatureSwitchDto item : result.getFeatureSwitches()) {
            html.append("<tr><td>").append(esc(item.getFeatureKey())).append("</td><td>")
                    .append(esc(item.getState())).append("</td><td>").append(esc(item.getReason())).append("</td></tr>");
        }
        if (result.getFeatureSwitches().isEmpty()) html.append("<tr><td colspan=\"3\">No verified switches returned</td></tr>");
        return html.append("</tbody></table></div></section>").toString();
    }

    private String economy(UUID actor, boolean ko, boolean scenario) {
        EconomyReconciliationHealthDto ledger = governance.getLatestReconciliationHealth(actor);
        if (ledger == null) throw new IllegalStateException("RECONCILIATION_SOURCE_MISSING");
        StringBuilder html = new StringBuilder(heading(title(scenario ? "/admin/economy/scenario-lab" : "/admin/economy", ko), ko));
        if (scenario) html.append("<p class=\"hint\">READ-ONLY: ")
                .append(ko ? "검증되지 않은 경제 시뮬레이션이나 금액 변경은 실행하지 않습니다."
                        : "No unverified economy simulation or balance mutation is executed.")
                .append("</p>");
        html.append("<dl><dt>Reconciliation source status</dt><dd>")
                .append(ledger.isAvailable() ? "AVAILABLE" : "UNVERIFIED")
                .append("</dd><dt>Calculated at</dt><dd>").append(esc(ledger.getCalculatedAt()))
                .append("</dd><dt>Snapshot ID</dt><dd>").append(esc(ledger.getSnapshotId()))
                .append("</dd><dt>Metric version</dt><dd>").append(esc(ledger.getMetricVersion())).append("</dd></dl>");
        EconomyReconciliationHealthDto.IntegrityDto truth = ledger.getIntegrity();
        if (ledger.isAvailable() && truth != null) {
            html.append("<div class=\"tablewrap\"><table><tbody><tr><th>Balanced ledger</th><td>")
                    .append(truth.isOk() ? "REPORTED OK" : "CHECK REQUIRED")
                    .append("</td></tr><tr><th>Transactions</th><td>").append(esc(truth.getLedgerTransactionCount()))
                    .append("</td></tr><tr><th>Postings</th><td>").append(esc(truth.getLedgerPostingCount()))
                    .append("</td></tr><tr><th>Balance delta</th><td>").append(esc(truth.getBalanceTotalDeltaAmount()))
                    .append("</td></tr></tbody></table></div>");
        } else html.append("<p class=\"hint\">UNVERIFIED — no healthy financial status is inferred from missing evidence.</p>");
        return html.append("</section>").toString();
    }

    private static String esc(String text) { return LiveAdminUsersPage.escape(text); }
}
