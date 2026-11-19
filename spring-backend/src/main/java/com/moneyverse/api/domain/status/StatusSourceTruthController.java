package com.moneyverse.api.domain.status;

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
    public StatusSourceTruthController(StatusTruthService service){this.service=service;}

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
        boolean ko="ko".equalsIgnoreCase(query.getOrDefault("lang","en"));
        StatusSourceTruthPolicy.StatusResponse status=service.publicStatus();
        List<StatusSourceTruthPolicy.StatusRow> rows=status.status();
        String overall=StatusSourceTruthPolicy.overall(rows.stream().map(StatusSourceTruthPolicy.StatusRow::state).toList());
        response.setHeader("Cache-Control","no-store");
        response.setHeader("X-Robots-Tag","noindex,nofollow");
        response.setHeader("X-Content-Type-Options","nosniff");
        response.setHeader("X-MV-UI-Release",RELEASE);
        response.setHeader("Content-Language",ko?"ko":"en");
        response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self';");
        model.addAttribute("ko",ko);
        model.addAttribute("language",ko?"ko":"en");
        model.addAttribute("pageTitle",ko?"서비스 상태":"Service status");
        model.addAttribute("calculatorPath","/status");
        model.addAttribute("rows",rows);
        model.addAttribute("overall",overall);
        model.addAttribute("staleCount",rows.stream().filter(r->!"fresh".equals(r.freshnessState())).count());
        return "mv29/status";
    }
}
