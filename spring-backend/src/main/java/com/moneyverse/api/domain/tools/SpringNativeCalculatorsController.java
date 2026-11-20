package com.moneyverse.api.domain.tools;

import com.moneyverse.api.domain.web.UiLocale;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;

/**
 * Spring MVC + Thymeleaf is the authoritative frontend rendering boundary.
 * No Next.js server, SSR Node process, React bundle or RSC endpoint is needed.
 */
@Controller
public class SpringNativeCalculatorsController {
    private final UiLocale locale;
    public SpringNativeCalculatorsController(UiLocale locale){this.locale=locale;}
    public static final String UI_VERSION = "v2026.11.18.28.1-spring-ssr";

    @GetMapping(value={"/tools/compound-calculator","/tools/stock-calculator"},produces=MediaType.TEXT_HTML_VALUE)
    public String render(HttpServletRequest request,HttpServletResponse response,Model model,
                         @RequestParam Map<String,String> query) {
        if("1".equals(request.getHeader("RSC"))||query.containsKey("_rsc"))
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE,"NEXT_RSC_NOT_SUPPORTED_BY_SPRING");
        String language=locale.resolvePublic(request);
        boolean ko="ko".equals(language);
        boolean isCompound="/tools/compound-calculator".equals(request.getRequestURI());
        SpringCalculatorMath.Input input=isCompound? SpringCalculatorMath.compound(query) : SpringCalculatorMath.stock(query);
        response.setHeader("X-MV-UI-Release",UI_VERSION);
        response.setHeader("Content-Language",language);
        response.setHeader("Vary","Cookie, Accept-Language");
        response.setHeader("X-MV-Renderer","Spring-MVC-Thymeleaf");
        response.setHeader("Cache-Control","private, no-store");
        response.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
        response.setHeader("X-Content-Type-Options","nosniff");
        response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self';");
        if(!input.valid())response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        model.addAttribute("ko",ko);
        model.addAttribute("language",language);
        model.addAttribute("uiLanguage",language);
        model.addAttribute("uiCopy",locale.labels(language));
        String titleKey=isCompound?"publicCompoundTitle":"publicStockTitle";
        String introKey=isCompound?"publicCompoundIntro":"publicStockIntro";
        model.addAttribute("uiPageKey",titleKey);
        model.addAttribute("publicTitleKey",titleKey);
        model.addAttribute("publicIntroKey",introKey);
        model.addAttribute("pageTitle",locale.labels(language).get(titleKey));
        model.addAttribute("pageIntro",locale.labels(language).get(introKey));
        model.addAttribute("toolKind",isCompound?"compound":"stock-calculator");
        model.addAttribute("values",input.values());
        model.addAttribute("result",input.result());
        model.addAttribute("error",input.error());
        String error=input.error();
        String errorKey=error==null?"publicErrorCheck":
                error.startsWith("Enter a non-negative")?"publicErrorNumber":
                error.startsWith("Value exceeds")?"publicErrorRange":
                error.startsWith("Years must")?"publicErrorYears":
                error.startsWith("Invalid compounding")?"publicErrorFrequency":
                error.contains("supported range")?"publicErrorCalculation":"publicErrorCheck";
        model.addAttribute("errorCopyKey",errorKey);
        model.addAttribute("calculatorPath",isCompound?"/tools/compound-calculator":"/tools/stock-calculator");
        return isCompound?"mv28/compound":"mv28/stock";
    }
}
