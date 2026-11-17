package com.moneyverse.api.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** Explicit ownership change only after source-parity, auth, SEO and Test acceptance. */
@Controller
@ConditionalOnProperty(name = "moneyverse.web.spring-home-enabled", havingValue = "true")
public class SpringHomeLiveController {
    @GetMapping("/")
    public String home(@RequestParam(name = "lang", defaultValue = "en") String language,
                       Model model, HttpServletResponse response) {
        return SpringHomePageSupport.render(language, false, model, response);
    }
}
