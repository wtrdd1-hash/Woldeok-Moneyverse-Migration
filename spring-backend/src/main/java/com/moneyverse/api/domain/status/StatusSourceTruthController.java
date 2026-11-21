package com.moneyverse.api.domain.status;

import com.moneyverse.api.domain.web.UiLocale;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/** Native Spring HTML + strict Next-compatible public status JSON contract. */
@Controller
public class StatusSourceTruthController {
    public static final String RELEASE="v2026.11.19.29.1-spring-status";
    private final StatusTruthService service;
    private final UiLocale locale;
    public StatusSourceTruthController(StatusTruthService service,UiLocale locale){this.service=service;this.locale=locale;}

    @ResponseBody
    @GetMapping(value={"/api/v1/status","/api/status"},produces=MediaType.APPLICATION_JSON_VALUE)
    public StatusSourceTruthPolicy.StatusResponse api(HttpServletResponse response){
        response.setHeader("Cache-Control","no-store");
        response.setHeader("X-MV-Status-Release",RELEASE);
        return service.publicStatus();
    }

    @GetMapping(value="/status",produces=MediaType.TEXT_HTML_VALUE)
    public String page(HttpServletRequest request,HttpServletResponse response, Model model,
                       @RequestParam Map<String,String> query){
        if("1".equals(request.getHeader("RSC"))||query.containsKey("_rsc"))
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE,"NEXT_RSC_NOT_SUPPORTED_BY_SPRING");
        String language=locale.resolvePublic(request);
        boolean ko="ko".equals(language);
        List<StatusSourceTruthPolicy.StatusRow> rows;
        boolean sourceUnavailable=false;
        try {
            rows=service.publicStatus().status();
        } catch (ResponseStatusException failure) {
            if(failure.getStatusCode().value()!=HttpStatus.SERVICE_UNAVAILABLE.value()) throw failure;
            // Keep the status page usable without turning a failed source into a healthy observation.
            response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
            rows=List.of();
            sourceUnavailable=true;
        }
        String overall=StatusSourceTruthPolicy.overall(rows.stream().map(StatusSourceTruthPolicy.StatusRow::state).toList());
        response.setHeader("Cache-Control","no-store");
        response.setHeader("X-Robots-Tag","noindex,nofollow");
        response.setHeader("X-Content-Type-Options","nosniff");
        response.setHeader("X-MV-UI-Release",RELEASE);
        response.setHeader("Content-Language",language);
        response.setHeader("Vary","Cookie, Accept-Language");
        response.setHeader("X-MV-Renderer","Spring-MVC-Thymeleaf");
        response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self';");
        model.addAttribute("ko",ko);
        model.addAttribute("language",language);
        model.addAttribute("uiLanguage",language);
        model.addAttribute("uiCopy",locale.labels(language));
        model.addAttribute("uiPageKey","publicStatusTitle");
        model.addAttribute("publicTitleKey","publicStatusTitle");
        model.addAttribute("pageTitle",locale.labels(language).get("publicStatusTitle"));
        model.addAttribute("calculatorPath","/status");
        model.addAttribute("sourceUnavailable",sourceUnavailable);
        model.addAttribute("rows",rows);
        model.addAttribute("overall",overall);
        model.addAttribute("staleCount",rows.stream().filter(r->!"fresh".equals(r.freshnessState())).count());
        return "mv29/status";
    }
}
