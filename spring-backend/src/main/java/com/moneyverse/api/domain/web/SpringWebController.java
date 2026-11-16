package com.moneyverse.api.domain.web;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

/** Preview-only Spring SSR; deliberately does not take over / or /status. */
@Controller
@ConditionalOnProperty(prefix = "moneyverse.web", name = "preview-enabled", havingValue = "true")
public class SpringWebController {
    private final SpringStatusReader reader;
    public record StatusView(String displayName, String state, String label,
                             String detail, String observedAt) {}
    public SpringWebController(SpringStatusReader reader) { this.reader = reader; }
    private static boolean korean(String lang) { return "ko".equalsIgnoreCase(lang); }

    private static void privacy(HttpServletResponse response) {
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader("X-Robots-Tag", "noindex, nofollow");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Content-Security-Policy",
                "default-src 'none'; style-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'");
    }
    private static void base(Model model, boolean ko) {
        model.addAttribute("lang", ko ? "ko" : "en");
        model.addAttribute("brand", ko ? "월덕 머니버스" : "Woldeok Moneyverse");
        model.addAttribute("homeLabel", ko ? "홈" : "Home");
        model.addAttribute("statusNavLabel", ko ? "서비스 상태" : "Service status");
        model.addAttribute("previewNotice", ko
                ? "Spring 웹 전환을 검증 중이며, 운영 화면은 아직 교체되지 않았습니다."
                : "Spring web migration preview. The live website has not been replaced.");
    }

    @GetMapping("/spring-web")
    public String landing(@RequestParam(name = "lang", required = false) String lang,
                          Model model, HttpServletResponse response) {
        privacy(response);
        boolean ko = korean(lang);
        base(model, ko);
        model.addAttribute("title", ko ? "Spring 웹 전환" : "Spring-rendered web");
        model.addAttribute("subtitle", ko
                ? "기존 서비스와 금융 데이터를 바꾸지 않고 Spring MVC 웹 화면을 검증합니다."
                : "A server-rendered interface being tested without changing your account or financial records.");
        model.addAttribute("viewStatusLabel", ko ? "실측 서비스 상태 보기" : "View measured service status");
        return "spring-web/landing";
    }

    @GetMapping("/spring-web/status")
    public String status(@RequestParam(name = "lang", required = false) String lang,
                         Model model, HttpServletResponse response) {
        privacy(response);
        boolean ko = korean(lang);
        base(model, ko);
        model.addAttribute("title", ko ? "서비스 상태" : "Service status");
        model.addAttribute("subtitle", ko
                ? "수집된 실제 상태만 표시합니다. 확인할 수 없으면 정상이라고 표시하지 않습니다."
                : "Only collected source observations are shown. Missing evidence is never treated as healthy.");
        model.addAttribute("observationsLabel", ko ? "관측된 시스템" : "Observed systems");
        model.addAttribute("emptyLabel", ko ? "현재 공개된 관측 항목이 없습니다." : "No public observations have been recorded.");
        model.addAttribute("unavailableLabel", ko ? "상태를 불러올 수 없습니다." : "Status unavailable");
        try {
            List<StatusView> status = reader.read().stream()
                    .map(row -> new StatusView(row.displayName(), row.state(),
                            stateLabel(row.state(), ko), row.detail(), row.observedAt()))
                    .toList();
            model.addAttribute("rows", status);
            model.addAttribute("sourceUnavailable", false);
        } catch (DataAccessException | IllegalStateException failure) {
            response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
            model.addAttribute("rows", List.of());
            model.addAttribute("sourceUnavailable", true);
        }
        return "spring-web/status";
    }

    private static String stateLabel(String state, boolean ko) {
        return switch (state) {
            case "operational" -> ko ? "정상" : "Operational";
            case "degraded" -> ko ? "성능 저하" : "Degraded";
            case "outage" -> ko ? "장애" : "Outage";
            case "maintenance" -> ko ? "점검 중" : "Maintenance";
            default -> ko ? "미확인" : "Unknown";
        };
    }
}
