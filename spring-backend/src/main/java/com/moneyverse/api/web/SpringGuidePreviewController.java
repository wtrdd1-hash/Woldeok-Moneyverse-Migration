package com.moneyverse.api.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** Dedicated review-only page; never changes ownership of existing public routes. */
@Controller
public class SpringGuidePreviewController {
    @GetMapping("/spring-ui/guide")
    public String preview(@RequestParam(name = "lang", defaultValue = "en") String language,
                          Model model, HttpServletResponse response) {
        return SpringGuidePageSupport.render(language, true, model, response);
    }
}
