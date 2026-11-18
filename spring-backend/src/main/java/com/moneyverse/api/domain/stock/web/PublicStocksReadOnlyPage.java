package com.moneyverse.api.domain.stock.web;

import com.moneyverse.api.domain.stock.dto.StockDtos.StockMarketRow;
import com.moneyverse.api.domain.stock.service.StockService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

/**
 * Real Spring MVC public market read-model: no Next RSC/Node process, no fake
 * trade buttons, no client-controlled actor and no mutable financial endpoints.
 * This is a scoped verified read-only UI, not full trading parity.
 */
@Controller
public class PublicStocksReadOnlyPage {
    private final StockService stockService;

    public PublicStocksReadOnlyPage(StockService stockService) { this.stockService = stockService; }

    private static String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value);
    }

    private static String label(boolean ko, String en, String korean) {
        return ko ? korean : en;
    }

    private static String percentChange(StockMarketRow stock) {
        try {
            BigDecimal opening = new BigDecimal(stock.getDayOpenPrice());
            BigDecimal current = new BigDecimal(stock.getCurrentPrice());
            if (opening.signum() <= 0) return "—";
            BigDecimal percentage = current.subtract(opening).multiply(BigDecimal.valueOf(100))
                    .divide(opening, 2, RoundingMode.HALF_UP);
            return (percentage.signum() > 0 ? "+" : "") + percentage.toPlainString() + "%";
        } catch (Exception e) { return "—"; }
    }

    @GetMapping(path = "/stocks", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(@RequestParam(value = "lang", required = false) String language) {
        boolean ko = "ko".equalsIgnoreCase(language);
        List<StockMarketRow> stocks;
        try { stocks = stockService.list(); }
        catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "VERIFIED_STOCK_SOURCE_UNAVAILABLE");
        }
        if (stocks == null || stocks.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "VERIFIED_LISTED_STOCKS_UNAVAILABLE");
        }
        String heading = label(ko, "Virtual stock exchange", "가상 주식 거래소");
        StringBuilder html = new StringBuilder(16_384);
        html.append("<!doctype html><html lang=\"").append(ko ? "ko" : "en")
                .append("\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">")
                .append("<title>").append(escape(heading)).append(" | Woldeok Moneyverse</title>")
                .append("<meta name=\"description\" content=\"Verified live virtual equity listings. This is a read-only public market view; no trading action is accepted here.\">")
                .append("<meta name=\"theme-color\" content=\"#0d1225\">")
                .append("<style>")
                .append("*,*::before,*::after{box-sizing:border-box}html{color-scheme:dark}body{margin:0;min-width:0;background:#0b1020;color:#f3f6ff;font-family:system-ui,-apple-system,'Noto Sans KR',sans-serif;line-height:1.55}a{color:inherit;text-decoration:none}a:focus-visible{outline:3px solid #a78bfa;outline-offset:4px}.shell{max-width:1240px;margin:0 auto;padding:16px clamp(14px,3vw,42px) 90px}.top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 0;border-bottom:1px solid #35345c}.brand{font-weight:850;letter-spacing:.02em}.logo{display:inline-grid;place-items:center;width:34px;height:34px;margin-right:9px;border-radius:11px;background:linear-gradient(145deg,#9a5ffe,#3b82f6);color:white}.nav{display:flex;gap:12px;flex-wrap:wrap}.nav a,.lang a{padding:10px;border-radius:9px;color:#d9dafa;min-height:44px;display:inline-flex;align-items:center}.nav a:hover,.lang a:hover{background:#26284b}.intro{margin:28px 0;padding:clamp(20px,4vw,42px);border:1px solid #4e438e;border-radius:22px;background:linear-gradient(128deg,#272450,#121b38 64%,#0d2534)}.eyebrow{font-size:.76rem;font-weight:800;color:#b6a6ff;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(1.65rem,5vw,3rem);line-height:1.2;margin:12px 0}h2{margin:26px 0 16px;font-size:1.35rem}.muted{color:#aeb8d7}.status{display:inline-flex;align-items:center;gap:9px;margin:11px 0;border-radius:30px;border:1px solid #5e4bb4;background:#30295c;padding:8px 14px;color:#e5dfff;font-size:.83rem}.status::before{content:'';height:7px;width:7px;border-radius:50%;background:#c9a5ff}.stats{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.count{font-size:1.05rem;font-weight:800;color:#d2c3ff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,265px),1fr));gap:14px}.stock{min-width:0;border:1px solid #383856;border-radius:18px;background:linear-gradient(160deg,#171d36,#11182b);padding:18px;overflow-wrap:anywhere}.symbol{font-size:.8rem;font-weight:800;color:#b7b6e3;letter-spacing:.06em}.name{font-size:1.12rem;font-weight:750;margin:8px 0}.price{font-variant-numeric:tabular-nums;font-size:1.4rem;font-weight:800;margin:10px 0}.change{font-variant-numeric:tabular-nums;font-weight:760;color:#8fc8e9}.change.up{color:#ff97a2}.change.down{color:#8cbeff}.desc{font-size:.87rem;color:#aeb8d7;min-height:40px}.details{border-top:1px solid #31395c;margin-top:13px;padding-top:12px;color:#a4b0d4;font-size:.75rem}.disclaimer{margin-top:32px;border:1px solid #424062;border-radius:14px;padding:16px;color:#b9c3db;font-size:.85rem}.help{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:center;min-width:56px;min-height:56px;border-radius:30px;box-shadow:0 8px 28px #080d2099;background:linear-gradient(120deg,#7557e8,#3981c6);color:white;font-weight:750;padding:12px 17px;z-index:10}.help:hover{filter:brightness(1.13)}@media(max-width:390px){.shell{padding-left:12px;padding-right:12px}.intro{margin-top:16px;padding:20px}.nav{gap:2px}.nav a,.lang a{padding:8px}.stock{padding:15px}.price{font-size:1.24rem}.help{right:12px}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}")
                .append("</style></head><body><div class=\"shell\" data-page=\"stocks\" data-ui-release=\"v2026.11.18.27.1\">")
                .append("<header class=\"top\"><a class=\"brand\" href=\"/\"><span class=\"logo\" aria-hidden=\"true\">W</span>Woldeok Moneyverse</a>")
                .append("<nav class=\"nav\" aria-label=\"Primary navigation\"><a href=\"/\">").append(label(ko,"Home","홈"))
                .append("</a><a href=\"/tools\">").append(label(ko,"Tools","계산기"))
                .append("</a><a href=\"/shop\">").append(label(ko,"Shop","상점"))
                .append("</a></nav><div class=\"lang\" aria-label=\"Language\"><a href=\"/stocks?lang=en\" hreflang=\"en\">EN</a><a href=\"/stocks?lang=ko\" hreflang=\"ko\">KO</a></div></header>")
                .append("<main><section class=\"intro\"><div class=\"eyebrow\">MARKET OBSERVATORY / 2026</div><h1>")
                .append(escape(heading)).append("</h1><p class=\"muted\">")
                .append(label(ko,"See actual listed instruments and their last verified prices. This page is read-only; trading and financial settlement require separate verification.",
                        "실제 상장 종목과 확인된 가격을 조회합니다. 이 페이지는 읽기 전용이며 주문·정산 기능은 별도 검증이 필요합니다."))
                .append("</p><span class=\"status\">").append(label(ko,"Source-backed data / read only","실제 DB 원천 조회 / 읽기 전용"))
                .append("</span></section><section aria-labelledby=\"listed-heading\"><div class=\"stats\"><h2 id=\"listed-heading\">")
                .append(label(ko,"Listed companies","상장 종목"))
                .append("</h2><p class=\"count\" data-testid=\"stock-count\">").append(stocks.size()).append(label(ko," listed","개 종목"))
                .append("</p></div><div class=\"grid\" role=\"list\">");
        for (StockMarketRow stock : stocks) {
            String variation = percentChange(stock);
            String css = variation.startsWith("+") ? "up" : variation.startsWith("-") ? "down" : "";
            html.append("<article class=\"stock\" role=\"listitem\"><div class=\"symbol\">")
                    .append(escape(stock.getSymbol())).append("</div><h3 class=\"name\">").append(escape(stock.getName())).append("</h3>")
                    .append("<div class=\"price\">").append(escape(stock.getCurrentPrice() == null ? "—" : stock.getCurrentPrice()))
                    .append(" <small>WLD</small></div><div class=\"change ").append(css).append("\">")
                    .append(escape(variation)).append("</div><p class=\"desc\">").append(escape(stock.getDescription())).append("</p>")
                    .append("<div class=\"details\">").append(label(ko,"Source updated: ","원천 업데이트: "))
                    .append(escape(stock.getUpdatedAt() == null ? "Unknown" : stock.getUpdatedAt())).append("</div></article>");
        }
        html.append("</div></section><aside class=\"disclaimer\" aria-label=\"Disclosure\">")
                .append(label(ko,"This is a fictional virtual stock market. Listed prices and changes are displayed from the available database snapshot, not an offer of real investment or a certified trade receipt.",
                        "가상 주식 시뮬레이션입니다. 가격과 등락은 DB 조회 시점의 자료이며 실물 투자 정보 또는 체결·정산 영수증을 의미하지 않습니다."))
                .append("</aside></main></div><a class=\"help\" href=\"/support\" aria-label=\"")
                .append(label(ko,"Help & support (read-only)","도움말·문의 보기 (읽기 전용)"))
                .append("\">?").append(label(ko," Help"," 문의")).append("</a></body></html>");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_LANGUAGE, ko ? "ko" : "en")
                .header("X-MV-Frontend-Release", "v2026.11.18.27.1-stock-public-readonly")
                .body(html.toString());
    }
}
