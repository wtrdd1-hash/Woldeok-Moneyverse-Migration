package com.moneyverse.api.domain.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** Canonical, informational read-only account deletion policy. Not an account mutation. */
@Controller
@ConditionalOnProperty(prefix = "moneyverse.web", name = "account-deletion-canonical-enabled", havingValue = "true")
public final class SpringAccountDeletionLiveController {
    @GetMapping("/account-deletion")
    public String live(@RequestParam(name = "lang", required = false) String lang,
                       Model model, HttpServletResponse response) {
        return SpringAccountDeletionController.render(lang, model, response, false);
    }
}
