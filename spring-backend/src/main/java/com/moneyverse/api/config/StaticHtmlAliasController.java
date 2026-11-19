package com.moneyverse.api.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Two exact legacy HTML aliases that were shadowed by /collections/{id} PUT and
 * /stocks/alerts/{id} DELETE paths. Keep HTML navigation independent from APIs.
 * Do not map /api/* or data mutations to page fallback.
 */
@Controller
public class StaticHtmlAliasController {
    @GetMapping("/collections/index.html")
    public String collectionsPage() { return "redirect:/collections/"; }

    @GetMapping("/stocks/alerts/index.html")
    public String stockAlertsPage() { return "redirect:/stocks/alerts/"; }
}
