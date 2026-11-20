package com.moneyverse.api.domain.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class NativeHomeController {
    private final UiLocale locale;

    public NativeHomeController(UiLocale locale) { this.locale = locale; }

    @GetMapping(value={"/", "/index.html"}, produces=MediaType.TEXT_HTML_VALUE)
    public String home(HttpServletRequest request, HttpServletResponse response, Model model) {
        if ("1".equals(request.getHeader("RSC")) || request.getParameter("_rsc") != null) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "SPRING_SSR_NOT_NEXT_FLIGHT");
        }
        String language = locale.resolve(request);
        response.setHeader("Content-Language", language);
        response.setHeader("Vary", "Cookie, Accept-Language");
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader("X-MV-Renderer", "Spring-MVC-Thymeleaf");
        response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        model.addAttribute("uiPageKey", "home");
        model.addAttribute("uiLanguage", language);
        model.addAttribute("uiCopy", locale.labels(language));
        return "mv43/home";
    }
}
