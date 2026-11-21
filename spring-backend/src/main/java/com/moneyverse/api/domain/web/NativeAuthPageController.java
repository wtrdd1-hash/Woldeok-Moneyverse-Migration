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
public class NativeAuthPageController {
    private final UiLocale locale;
    public NativeAuthPageController(UiLocale locale) { this.locale=locale; }

    @GetMapping(value={
        "/login","/login/","/login.html","/login/index.html",
        "/login/providers","/login/providers/","/login/providers.html","/login/providers/index.html",
        "/register","/register/","/register.html","/register/index.html",
        "/forgot-password","/forgot-password/","/forgot-password.html","/forgot-password/index.html",
        "/reset-password","/reset-password/","/reset-password.html","/reset-password/index.html",
        "/verify-email","/verify-email/","/verify-email.html","/verify-email/index.html",
        "/verify-email-change","/verify-email-change/","/verify-email-change.html","/verify-email-change/index.html",
        "/account-deletion","/account-deletion/","/account-deletion.html","/account-deletion/index.html"
    },produces=MediaType.TEXT_HTML_VALUE)
    public String page(HttpServletRequest request,HttpServletResponse response,Model model) {
        response.setHeader("Cache-Control","private, no-store");
        response.setHeader("Vary","Cookie, Accept-Language");
        response.setHeader("X-Robots-Tag","noindex, nofollow, noarchive");
        response.setHeader("Referrer-Policy","no-referrer");
        if("1".equals(request.getHeader("RSC"))||request.getParameter("_rsc")!=null)
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE,"SPRING_SSR_NOT_NEXT_FLIGHT");
        String page=request.getRequestURI().substring(1).split("/")[0].replace(".html","");
        String title=switch(page) {
            case "register" -> "authRegister";
            case "forgot-password" -> "authForgot";
            case "reset-password" -> "authReset";
            case "verify-email" -> "authVerify";
            case "verify-email-change" -> "authVerifyChange";
            case "account-deletion" -> "authDeletion";
            default -> "login";
        };
        String heading=page.equals("login") ? "authLoginHeading" : page.equals("register") ? "authRegisterHeading" : title;
        String lead=page.equals("login") ? "authLoginLead" : page.equals("register") ? "authRegisterLead" : null;
        String language=locale.resolve(request);
        response.setHeader("Content-Language",language);
        response.setHeader("X-MV-Renderer","Spring-MVC-Thymeleaf");
        response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        model.addAttribute("authHeadingKey",heading);
        model.addAttribute("authLeadKey",lead);
        model.addAttribute("authPage",page);
        model.addAttribute("authFields",page.equals("login")||page.equals("register"));
        model.addAttribute("uiPageKey",title);
        model.addAttribute("uiLanguage",language);
        model.addAttribute("uiCopy",locale.labels(language));
        return "mv43/auth";
    }
}
