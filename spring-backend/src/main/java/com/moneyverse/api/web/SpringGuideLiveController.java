package com.moneyverse.api.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** Explicit route ownership gate. Disabled by default until full release QA. */
@Controller
@ConditionalOnProperty(name = "moneyverse.web.spring-guide-enabled", havingValue = "true")
public class SpringGuideLiveController {
    @GetMapping("/guide")
    public String guide(@RequestParam(name = "lang", defaultValue = "en") String language,
                        Model model, HttpServletResponse response) {
        return SpringGuidePageSupport.render(language, false, model, response);
    }
}
