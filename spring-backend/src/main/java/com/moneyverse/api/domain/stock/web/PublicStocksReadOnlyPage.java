package com.moneyverse.api.domain.stock.web;

import com.moneyverse.api.domain.stock.dto.StockDtos.StockMarketRow;
import com.moneyverse.api.domain.stock.service.StockService;
import com.moneyverse.api.domain.web.NativeHomeController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Unified Spring MVC Virtual Stock Exchange Controller:
 * Serves the unified mv43/stocks template with shared chrome (sidebar, topbar, bottom-nav)
 * and verified live stock database quotes.
 */
@Controller
public class PublicStocksReadOnlyPage {
    private final StockService stockService;
    private final NativeHomeController home;

    public PublicStocksReadOnlyPage(StockService stockService, NativeHomeController home) {
        this.stockService = stockService;
        this.home = home;
    }

    @GetMapping(path = "/stocks", produces = MediaType.TEXT_HTML_VALUE)
    public String show(HttpServletRequest request, HttpServletResponse response, Model model,
                       @RequestParam(value = "lang", required = false) String language) {
        home.home(request, response, model);
        model.addAttribute("uiPageKey", "stocks");

        try {
            List<StockMarketRow> stocks = stockService.list();
            model.addAttribute("stocks", stocks);
        } catch (Exception e) {
            // graceful fallback to empty list
            model.addAttribute("stocks", List.of());
        }

        return "mv43/stocks";
    }
}
