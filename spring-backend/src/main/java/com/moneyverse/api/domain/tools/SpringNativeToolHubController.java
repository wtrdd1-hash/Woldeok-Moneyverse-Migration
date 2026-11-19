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

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Modern standard HTML hub; current product links transcribed from
 * frontend/src/app/calculators/page.tsx (2026-11-19), no financial or user writes.
 * Positive certification applies ONLY to the two Spring native calculators;
 * preserving a legacy link is not asserting that feature is fully functional.
 */
@Controller
public class SpringNativeToolHubController {
    public static final String RELEASE = "v2026.11.19.30.1-spring-tools";
    private static final Set<String> CATEGORIES=Set.of("all","investing","tax","retirement","lending","simulation");
    public record Tool(String id,String category,String titleEn,String titleKo,String descriptionEn,String descriptionKo,boolean verified){
        public String href(){return "/tools/"+id;}
        public String status(){return verified?"spring-verified":"legacy";}
        public String title(boolean ko){return ko?titleKo:titleEn;}
        public String description(boolean ko){return ko?descriptionKo:descriptionEn;}
    }
    private static final List<Tool> TOOLS=List.of(
            new Tool("stock-calculator","investing","Stock average cost calculator","주식 물타기·평단가 계산기","Model average costs and target exit prices; no live trade.","평균매수가와 목표 매도가 계산. 실제 거래·체결 아님.",true),
            new Tool("compound-calculator","investing","Compound interest calculator","복리 계산기","Project recurring deposits and compounding periods.","월별 적립과 일·월·연 복리 결과 계산.",true),
            new Tool("dividend-tax-calculator","investing","Dividend withholding calculator","배당소득세·배당률 계산기","Estimate domestic and overseas dividend tax.","국내·해외 배당 예상 소득세.",false),
            new Tool("capital-gains-tax-calculator","tax","Stock capital gains tax calculator","주식 양도소득세 계산기","Estimate capital gains taxes and allowances.","주식 양도소득세 및 공제 간이 시뮬레이션.",false),
            new Tool("salary-calculator","tax","Take-home salary calculator","연봉 실수령액 계산기","Estimate salary after common deductions.","공제 적용 후 급여 예상액 계산.",false),
            new Tool("isa-calculator","tax","ISA tax benefit calculator","ISA 세제 혜택 계산기","Explore individual savings account tax treatment.","ISA 비과세와 세제 혜택 참고용 계산.",false),
            new Tool("pension-tax-calculator","retirement","Pension and IRP tax credit calculator","연금저축·IRP 세액공제 계산기","Estimate contributions and eligible tax credits.","연금저축과 IRP 세액공제 계산.",false),
            new Tool("fire-calculator","retirement","FIRE early retirement calculator","FIRE 조기은퇴 계산기","Estimate retirement capital and withdrawal scenarios.","경제적 자유와 은퇴 목표자산 추정.",false),
            new Tool("retirement-calculator","retirement","National pension estimate","국민연금 예상액 계산기","Estimate national pension benefits.","국민연금 수령액 간이 예상.",false),
            new Tool("tax-calculator","tax","Income tax calculator","종합소득세 간이 계산기","Review simplified income-tax scenarios.","종합소득세 과세표준 간이 계산.",false),
            new Tool("gift-tax-calculator","tax","Gift tax calculator","증여세 계산기","Estimate gift tax and deductions.","증여세 공제와 세금 간이 계산.",false),
            new Tool("loan-interest-calculator","lending","Loan repayment calculator","대출이자·상환 계산기","Compare principal and interest repayment plans.","월별 대출이자 및 상환 계획 비교.",false),
            new Tool("real-estate-calculator","lending","Real estate fees calculator","부동산 중개보수·취득세 계산기","Estimate brokerage fees and acquisition tax.","부동산 거래 중개보수와 취득세 추정.",false),
            new Tool("youth-leap-calculator","lending","Youth Leap savings calculator","청년도약계좌 만기 계산기","Explore savings contributions and maturity value.","청년도약계좌 만기 예상액 계산.",false),
            new Tool("kimchi-premium-calculator","simulation","Crypto price spread calculator","김치 프리미엄 계산기","Explore exchange price spreads; not real-time proof.","거래소 가격차이 시뮬레이션. 실시간 시세 보장 아님.",false),
            new Tool("crypto-apy-calculator","simulation","Crypto APY calculator","암호화폐 APY 계산기","Estimate hypothetical compounding returns.","가상자산 예치 수익률 모의 계산.",false),
            new Tool("farming-calculator","simulation","Virtual farming ROI calculator","가상 채굴 ROI 계산기","Explore virtual rewards and payback scenarios.","머니버스 가상 채굴 보상·회수기간 추정.",false)
    );
    @GetMapping(path={"/tools","/calculators"},produces=MediaType.TEXT_HTML_VALUE)
    public String hub(HttpServletRequest request,HttpServletResponse response,Model model,
                      @RequestParam Map<String,String> args){
        if("1".equals(request.getHeader("RSC"))||args.containsKey("_rsc"))
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE,"SPRING_SSR_NOT_NEXT_FLIGHT");
        String rawQuery=args.getOrDefault("q","");
        if(rawQuery.length()>64||rawQuery.indexOf('\u0000')>=0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"INVALID_TOOL_SEARCH");
        String query=rawQuery.strip();
        String verifiedArg=args.getOrDefault("verified", "");
        if(!verifiedArg.isEmpty() && !"true".equals(verifiedArg))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"INVALID_VERIFIED_FILTER");
        boolean verifiedOnly="true".equals(verifiedArg);
        String category=args.getOrDefault("category","all");
        if(!CATEGORIES.contains(category))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"INVALID_TOOL_CATEGORY");
        boolean ko="ko".equalsIgnoreCase(args.getOrDefault("lang","en"));
        boolean compact="/tools".equals(request.getRequestURI());
        String needle=query.toLowerCase(Locale.ROOT);
        List<Tool> shown=TOOLS.stream()
                .filter(t->"all".equals(category)||t.category().equals(category))
                .filter(t->!verifiedOnly||t.verified())
                .filter(t->needle.isBlank()||String.join(" ",t.titleEn(),t.titleKo(),t.descriptionEn(),t.descriptionKo()).toLowerCase(Locale.ROOT).contains(needle))
                .toList();
        response.setHeader("X-MV-UI-Release",RELEASE);
        response.setHeader("X-Content-Type-Options","nosniff");
        response.setHeader("Cache-Control","private,no-store");
        response.setHeader("Content-Language",ko?"ko":"en");
        response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self';");
        model.addAttribute("ko",ko);
        model.addAttribute("language",ko?"ko":"en");
        model.addAttribute("pageTitle",ko?(compact?"금융 도구":"금융 계산기 센터"):(compact?"Financial tools":"Calculator center"));
        model.addAttribute("calculatorPath",request.getRequestURI());
        model.addAttribute("hubType",compact?"tools-hub":"calculators-hub");
        model.addAttribute("isCompact",compact);
        model.addAttribute("searchTerm",query);
        model.addAttribute("selectedCategory",category);
        model.addAttribute("verifiedOnly",verifiedOnly);
        model.addAttribute("tools",shown);
        model.addAttribute("toolCount",TOOLS.size());
        model.addAttribute("verifiedCount",TOOLS.stream().filter(Tool::verified).count());
        model.addAttribute("resultCount",shown.size());
        // Structured data is constant and contains NO user-provided search input.
        model.addAttribute("schemaJson", """
                {"@context":"https://schema.org","@type":"CollectionPage","name":"Woldeok Moneyverse financial calculators", "url":"https://easy-scraping.com/%s","mainEntity":{"@type":"ItemList","numberOfItems":17}}
                """.formatted(compact ? "tools" : "calculators").strip());
        return "mv30/hub";
    }
}
