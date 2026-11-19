package com.moneyverse.api.domain.admin.web;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUserDto;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUsersResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/** Truly server-rendered Spring admin view: no Next prerendered error/PII or client header trust. */
@Controller
public class LiveAdminUsersPage {
    private final AdminAuthService adminAuthService;
    private final AdminGovernanceService governanceService;

    public LiveAdminUsersPage(AdminAuthService adminAuthService, AdminGovernanceService governanceService) {
        this.adminAuthService = adminAuthService;
        this.governanceService = governanceService;
    }

    @GetMapping(value = "/admin/users", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request,
             @RequestParam(name = "limit", defaultValue = "30") int limit,
             @RequestParam(name = "q", defaultValue = "") String query,
             @RequestParam(name = "lang", defaultValue = "en") String language) {
        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.noStore());
        headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("X-Frame-Options", "DENY");
        headers.set("Referrer-Policy", "same-origin");
        headers.set("Content-Security-Policy", "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
        headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));

        UUID actor = adminAuthService.resolveVerifiedAdminActor(request).orElse(null);
        if (actor == null) {
            headers.setLocation(URI.create("/login?next=%2Fadmin%2Fusers"));
            return new ResponseEntity<>("", headers, HttpStatus.FOUND);
        }
        boolean korean = "ko".equalsIgnoreCase(language);
        int maxRows = Math.max(1, Math.min(200, limit));
        String needle = query == null ? "" : query.strip().substring(0, Math.min(query.strip().length(), 80));
        AdminUsersResponse directory;
        try {
            directory = governanceService.listUsers(actor, maxRows);
            if (directory == null || directory.getUsers() == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "DIRECTORY_SOURCE_MISSING");
            }
        } catch (Exception e) {
            String message = korean ? "사용자 데이터 소스가 현재 응답하지 않습니다. 다시 시도해 주세요." : "The verified user data source is unavailable. Retry later.";
            return new ResponseEntity<>(document(korean, null, "<main class=\"panel\"><h1>" + escape(message) + "</h1><p>HTTP 503</p></main>"), headers, HttpStatus.SERVICE_UNAVAILABLE);
        }

        List<AdminUserDto> rows = directory.getUsers().stream()
                .filter(u -> needle.isBlank() || containsIgnoreCase(u.getDisplayName(),needle)
                        || containsIgnoreCase(u.getUserId(),needle)
                        || containsIgnoreCase(u.getStatus(),needle))
                .toList();
        StringBuilder content = new StringBuilder(8000);
        content.append("<section class=\"panel\"><div class=\"heading\"><div><p class=\"eyebrow\">ADMIN / MEMBERS</p><h1>")
                .append(korean ? "사용자 관리" : "Member directory")
                .append("</h1><p class=\"subtle\">")
                .append(korean ? "실제 데이터베이스에서 확인된 회원만 표시합니다." : "Only users returned by the verified source are shown.")
                .append("</p></div><span class=\"total\">")
                .append(rows.size()).append(korean ? "건 조회됨" : " matching rows").append("</span></div>");
        content.append("<form method=\"get\" action=\"/admin/users\" class=\"filters\"><label for=\"member-search\">")
                .append(korean ? "회원 검색" : "Search members")
                .append("</label><input id=\"member-search\" name=\"q\" type=\"search\" maxlength=\"80\" value=\"")
                .append(escape(needle)).append("\" placeholder=\"")
                .append(korean ? "이름, ID 또는 상태" : "Name, ID or status")
                .append("\"><label for=\"page-size\">")
                .append(korean ? "조회 상한" : "Result limit")
                .append("</label><input id=\"page-size\" name=\"limit\" type=\"number\" min=\"1\" max=\"200\" value=\"")
                .append(maxRows).append("\"><input type=\"hidden\" name=\"lang\" value=\"")
                .append(korean ? "ko" : "en")
                .append("\"><button type=\"submit\">").append(korean ? "조회" : "Search").append("</button></form>");
        content.append("<p class=\"hint\">")
                .append(korean ? "검색은 조회된 최대 " + maxRows + "개 결과에서만 수행됩니다. 전체 검색이 아닙니다."
                        : "Search applies only to the first " + maxRows + " source records, not all members.")
                .append("</p>");
        Object source = directory.getScope() == null ? null : directory.getScope().get("source");
        if (source != null) content.append("<p class=\"subtle\">Source: ").append(escape(String.valueOf(source))).append("</p>");
        content.append("<div class=\"tablewrap\"><table><thead><tr><th scope=\"col\">")
                .append(korean ? "표시명" : "Display name")
                .append("</th><th scope=\"col\">ID</th><th scope=\"col\">")
                .append(korean ? "상태" : "Status")
                .append("</th><th scope=\"col\">")
                .append(korean ? "가입일" : "Joined")
                .append("</th></tr></thead><tbody>");
        for (AdminUserDto u : rows) {
            content.append("<tr><td>").append(escape(u.getDisplayName()))
                    .append("</td><td class=\"mono\">").append(escape(u.getUserId()))
                    .append("</td><td>").append(escape(u.getStatus()))
                    .append("</td><td>").append(escape(u.getCreatedAt())).append("</td></tr>");
        }
        if (rows.isEmpty()) content.append("<tr><td colspan=\"4\" class=\"empty\">")
                .append(korean ? "현재 조회 범위에서 일치하는 회원이 없습니다." : "No matching members in this verified result set.")
                .append("</td></tr>");
        content.append("</tbody></table></div></section>");
        return new ResponseEntity<>(document(korean, needle, content.toString()), headers, HttpStatus.OK);
    }

    private static boolean containsIgnoreCase(String text, String needle) {
        return text != null && text.toLowerCase(Locale.ROOT).contains(needle.toLowerCase(Locale.ROOT));
    }

    static String escape(String value) {
        if (value == null) return "—";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private static String document(boolean korean, String search, String body) {
        return renderPage(korean, korean ? "사용자 관리" : "Member directory", body);
    }

    static String renderPage(boolean korean, String title, String body) {
        return "<!doctype html><html lang=\"" + (korean ? "ko" : "en")
                + "\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
                + "<meta name=\"robots\" content=\"noindex,nofollow\"><title>" + escape(title) + " — Woldeok Moneyverse</title>"
                + "<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b1224;color:#f5f7ff;font-family:system-ui,Arial,sans-serif;line-height:1.55}"
                + "a{color:#c6a8ff}header{background:#111e3a;border-bottom:1px solid #283455;padding:13px clamp(14px,4vw,38px)}nav{display:flex;gap:16px;align-items:center;flex-wrap:wrap}"
                + "nav .brand{font-weight:750;color:#fff;text-decoration:none;margin-right:auto}main{max-width:1180px;margin:28px auto;padding:0 14px}.panel{padding:clamp(18px,3vw,32px);border:1px solid #293857;border-radius:18px;background:#15213a;box-shadow:0 15px 32px #0002}"
                + ".heading{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.eyebrow{color:#ad8efe;letter-spacing:.12em;font-size:12px;font-weight:700}h1{font-size:clamp(21px,4vw,31px);margin:0}"
                + ".subtle,.hint{color:#b0bfd7}.total{background:#272c4b;border-radius:999px;padding:8px 14px;align-self:center;font-variant-numeric:tabular-nums}.filters{display:flex;flex-wrap:wrap;align-items:end;gap:10px;margin-top:21px}.filters label{display:block;font-size:13px;color:#d8dff8}input{padding:11px;border:1px solid #53627e;border-radius:10px;background:#101a31;color:#fff;min-height:44px;max-width:100%}input[type=search]{width:min(100%,320px)}input[type=number]{width:95px}button{background:#805ee5;color:#fff;border:0;border-radius:10px;min-height:44px;padding:9px 24px;cursor:pointer;font-weight:650}"
                + "button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #e9bc76;outline-offset:3px}.tablewrap{overflow:auto;border-radius:10px;margin-top:20px;border:1px solid #354665}table{width:100%;border-collapse:collapse;min-width:560px}th,td{text-align:left;padding:13px;border-bottom:1px solid #34415f;overflow-wrap:anywhere}th{color:#c2a9ff;background:#202d4a;font-weight:650}tr:hover td{background:#1b2945}.mono{font-family:ui-monospace,monospace;font-size:12px}.empty{text-align:center;padding:32px}"
                + "@media(max-width:420px){header{padding:12px}nav{gap:10px}.filters{display:grid;grid-template-columns:1fr}.filters label{margin-top:4px}input[type=search]{width:100%}}"
                + "</style><link rel=\"stylesheet\" href=\"/mv-spring/v38/shared-ui.css\">"
                + "<link rel=\"stylesheet\" href=\"/mv-spring/v38/admin-ui.css\">"
                + "<link rel=\"stylesheet\" href=\"/mv-spring/v39/language-picker.css\">"
                + "<script type=\"module\" src=\"/mv-spring/v39/language-picker.mjs\"></script></head>"
                + "<body data-spring-admin-ui=\"v2026.11.19.38.1\">"
                + "<header class=\"mv-admin-header\"><nav aria-label=\"Admin navigation\">"
                + "<a href=\"/admin\" class=\"brand\"><span class=\"mv-admin-mark\" aria-hidden=\"true\">W</span>"
                + "<span>WOLDEOK <b>MONEYVERSE</b></span></a>"
                + "<div class=\"mv-admin-header-title\"><span>ADMIN CONTROL CENTER</span><strong>"
                + (korean ? "관리자 관제 센터" : "Administrator console") + "</strong></div>"
                + "<div class=\"mv-admin-nav-links\"><a href=\"/admin\">" + (korean ? "대시보드" : "Dashboard")
                + "</a><a href=\"/admin/users\">" + (korean ? "회원" : "Members")
                + "</a><a href=\"/admin/economy\">" + (korean ? "경제" : "Economy")
                + "</a><a href=\"/admin/controls\">" + (korean ? "설정" : "Controls")
                + "</a><a href=\"/admin/support\">" + (korean ? "지원" : "Support")
                + "</a></div><div class=\"mv-language-slot\" data-mv-language-slot data-mv-native-translations=\"en,ko\">"
                + "<details><summary aria-label=\"Choose language\">🌐 Language</summary>"
                + "<div class=\"mv-language-fallback-links\">"
                + "<a data-mv-auto href=\"?lang=en&amp;mv_auto=1\">Auto (EN fallback)</a>"
                + "<a data-lang=\"en\" lang=\"en\" href=\"?lang=en\">English</a>"
                + "<a data-lang=\"ko\" lang=\"ko\" href=\"?lang=ko\">한국어</a>"
                + "<a data-lang=\"ja\" lang=\"ja\" href=\"?lang=ja\">日本語</a>"
                + "<a data-lang=\"zh\" lang=\"zh\" href=\"?lang=zh\">简体中文</a>"
                + "<a data-lang=\"vi\" lang=\"vi\" href=\"?lang=vi\">Tiếng Việt</a>"
                + "<p class=\"mv-language-fallback\">JA/ZH/VI: native page content may still be English.</p>"
                + "</div></details></div></nav></header>"
                + "<main class=\"mv-admin-workspace\"><div class=\"mv-admin-page-head\">"
                + "<span class=\"mv-admin-kicker\">WOLDEOK / ADMIN / SPRING</span>"
                + "<strong>" + escape(title) + "</strong>"
                + "<small>" + (korean ? "실제 서버 데이터·권한 기준" : "Verified server data and permissions") + "</small>"
                + "</div>"
                + body + "</main><footer class=\"mv-admin-footer\"><span>WOLDEOK / SPRING MVC</span>"
                + "<span>" + (korean ? "검증된 데이터 원천 기준" : "Authoritative data only") + "</span></footer>"
                + "<details class=\"mv-support-dock\"><summary aria-label=\""
                + (korean ? "관리자 지원 창 열기" : "Open admin support") + "\">"
                + "<span aria-hidden=\"true\">?</span><span>" + (korean ? "문의" : "Help") + "</span></summary>"
                + "<section class=\"mv-support-panel\" aria-label=\""
                + (korean ? "관리자 고객지원 안내" : "Administrator help and support") + "\">"
                + "<h2>" + (korean ? "관리자 도움 및 문의" : "Admin help & support") + "</h2>"
                + "<p class=\"mv-support-warning\">" + (korean
                    ? "보안 확인 전 문의 메시지 전송은 비활성입니다. 관리자 지원 화면에서 현황을 확인하세요."
                    : "Message sending is unavailable pending security verification. Review the admin support queue.")
                + "</p><nav aria-label=\"Support destinations\">"
                + "<a href=\"/admin/support\">" + (korean ? "관리자 고객지원" : "Admin support queue") + "</a>"
                + "<a href=\"/help\">" + (korean ? "도움말" : "Help center") + "</a></nav></section></details>"
                + "</body></html>";
    }
}
