package com.moneyverse.api.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/** Review-only guest homepage; the real homepage is not replaced by this canary. */
@Controller
public class SpringHomePreviewController {
    @GetMapping("/spring-ui/home")
    public String preview(@RequestParam(name = "lang", defaultValue = "en") String language,
                          Model model, HttpServletResponse response) {
        return SpringHomePageSupport.render(language, true, model, response);
    }
}
