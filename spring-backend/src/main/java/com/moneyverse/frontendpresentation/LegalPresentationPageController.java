package com.moneyverse.frontendpresentation;

import com.moneyverse.api.domain.web.UiPageRenderer;
import com.moneyverse.api.domain.web.UiLocale;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Read-only owner-authored legal pages; no user data, sessions, or backend calls. */
@Controller
public final class LegalPresentationPageController {
    private final UiPageRenderer pages;
    private final UiLocale locale;
    public LegalPresentationPageController(UiPageRenderer pages, UiLocale locale) {
        this.pages=pages; this.locale=locale;
    }

    @GetMapping(value={"/terms","/terms/","/privacy","/privacy/"}, produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request) {
        HttpHeaders headers=new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));
        headers.set("Cache-Control","private, no-store");
        headers.set("Vary","Accept-Language, Cookie");
        headers.set("X-MV-Renderer","Spring-MVC-Thymeleaf");
        headers.set("X-Content-Type-Options","nosniff");
        headers.set("X-Frame-Options","DENY");
        headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
        headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        String language=pages.publicLanguage(request);
        headers.set("Content-Language",language);
        if("1".equals(request.getHeader("RSC"))||request.getParameter("_rsc")!=null)
            return new ResponseEntity<>("",headers,HttpStatus.NOT_ACCEPTABLE);
        String page=request.getRequestURI().startsWith("/terms")?"terms":"privacy";
        String sourceLanguage=language.equals("ko")?"ko":"en";
        String titleKey=page.equals("terms")?"authTermsLink":"authPrivacyLink";
        Map<String,Object> model=new HashMap<>();
        model.put("uiPageKey",titleKey);
        model.put("isAdmin",false);
        model.put("legalTitle",locale.labels(language).get(titleKey));
        model.put("policyFallback",!language.equals(sourceLanguage));
        String rendered=pages.renderPublic("mv43/legal-"+page+"-"+sourceLanguage,request,model);
        return new ResponseEntity<>(rendered,headers,HttpStatus.OK);
    }
}
