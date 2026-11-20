package com.moneyverse.api.domain.web;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class NativeMessagingPageController {
    private final UserAuthService auth;
    private final UiLocale locale;
    public NativeMessagingPageController(UserAuthService auth,UiLocale locale) {this.auth=auth;this.locale=locale;}
    @GetMapping(value={"/support","/support/","/support.html","/support/index.html",
        "/chat","/chat/","/chat.html","/chat/index.html"},produces=MediaType.TEXT_HTML_VALUE)
    public String messaging(HttpServletRequest request,HttpServletResponse response,Model model) {
        String family=request.getRequestURI().startsWith("/support")?"support":"chat";
        response.setHeader("Cache-Control","private, no-store");
        response.setHeader("Vary","Cookie, Accept-Language");
        response.setHeader("X-Robots-Tag","noindex, nofollow, noarchive");
        var session=auth.resolveSession(request);
        if(session.isEmpty()||!session.get().isSignedIn()||session.get().getUserId()==null)
            return "redirect:/login?next=%2F"+family;
        if("1".equals(request.getHeader("RSC"))||request.getParameter("_rsc")!=null)
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE,"SPRING_SSR_NOT_NEXT_FLIGHT");
        String language=locale.resolve(request);
        response.setHeader("Content-Language",language);
        response.setHeader("X-MV-Renderer","Spring-MVC-Thymeleaf");
        response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        model.addAttribute("uiPageKey",family.equals("support")?"msgSupport":"msgChat");
        model.addAttribute("uiLanguage",language);
        model.addAttribute("uiCopy",locale.labels(language));
        return "mv43/"+family;
    }
}
