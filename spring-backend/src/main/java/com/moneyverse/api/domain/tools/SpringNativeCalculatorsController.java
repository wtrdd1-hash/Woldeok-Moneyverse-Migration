package com.moneyverse.api.domain.tools;

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
    public static final String UI_VERSION = "v2026.11.18.28.1-spring-ssr";

    @GetMapping(value={"/tools/compound-calculator","/tools/stock-calculator"},produces=MediaType.TEXT_HTML_VALUE)
    public String render(HttpServletRequest request,HttpServletResponse response,Model model,
                         @RequestParam Map<String,String> query) {
        if("1".equals(request.getHeader("RSC"))||query.containsKey("_rsc"))
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE,"NEXT_RSC_NOT_SUPPORTED_BY_SPRING");
        boolean ko="ko".equalsIgnoreCase(query.getOrDefault("lang","en"));
        boolean isCompound="/tools/compound-calculator".equals(request.getRequestURI());
        SpringCalculatorMath.Input input=isCompound? SpringCalculatorMath.compound(query) : SpringCalculatorMath.stock(query);
        response.setHeader("X-MV-UI-Release",UI_VERSION);
        response.setHeader("Content-Language",ko?"ko":"en");
        response.setHeader("Cache-Control","private, no-store");
        response.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
        response.setHeader("X-Content-Type-Options","nosniff");
        response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self';");
        if(!input.valid())response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        model.addAttribute("ko",ko);
        model.addAttribute("language",ko?"ko":"en");
        model.addAttribute("pageTitle",isCompound?
                (ko?"복리 계산기":"Compound interest calculator"):
                (ko?"주식 평균단가 계산기":"Stock average price calculator"));
        model.addAttribute("pageIntro",isCompound?
                (ko?"적립식 복리 성장과 연도별 자산 변화를 계산합니다.":"Project compound growth with regular deposits and annual milestones."):
                (ko?"추가 매수 전후 평균단가와 목표 매도가를 계산합니다.":"Explore average cost and target exit price for hypothetical additional purchases."));
        model.addAttribute("toolKind",isCompound?"compound":"stock-calculator");
        model.addAttribute("values",input.values());
        model.addAttribute("result",input.result());
        model.addAttribute("error",input.error());
        model.addAttribute("calculatorPath",isCompound?"/tools/compound-calculator":"/tools/stock-calculator");
        return isCompound?"mv28/compound":"mv28/stock";
    }
}
