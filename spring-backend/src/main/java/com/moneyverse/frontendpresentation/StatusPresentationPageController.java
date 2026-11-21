package com.moneyverse.frontendpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.moneyverse.api.domain.status.StatusSourceTruthPolicy;
import com.moneyverse.api.domain.status.StatusSourceTruthPolicy.StatusRow;
import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.Duration;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Retain the actual collector's freshness evidence in the shared native public layout. */
@Controller
public final class StatusPresentationPageController {
    private final PublicSourceClient source;
    private final UiPageRenderer pages;
    public StatusPresentationPageController(PublicSourceClient source,UiPageRenderer pages){this.source=source;this.pages=pages;}
    @GetMapping(value={"/status","/status/","/status.html","/status/index.html"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request){
        var headers=new HttpHeaders();headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));
        headers.set("Cache-Control","private, no-store");headers.set("Vary","Cookie, Accept-Language");
        headers.set("X-Robots-Tag","noindex, nofollow, noarchive");headers.set("X-MV-Renderer","Spring-MVC-Thymeleaf");
        headers.set("Content-Language",pages.publicLanguage(request));headers.set("X-Content-Type-Options","nosniff");headers.set("X-Frame-Options","DENY");
        headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        if("1".equals(request.getHeader("RSC"))||request.getParameter("_rsc")!=null)return new ResponseEntity<>("",headers,HttpStatus.NOT_ACCEPTABLE);
        List<StatusRow> rows=List.of();boolean unavailable=false;
        try{rows=parse(source.read("/api/v1/status"));}catch(PublicSourceClient.SourceFailure failure){unavailable=true;}
        Map<String,Object> model=new HashMap<>();
        model.put("uiPageKey","publicStatusTitle");model.put("publicTitleKey","publicStatusTitle");model.put("language",pages.publicLanguage(request));
        model.put("sourceUnavailable",unavailable);model.put("rows",rows);
        model.put("overall",StatusSourceTruthPolicy.overall(rows.stream().map(StatusRow::state).toList()));
        model.put("staleCount",rows.stream().filter(row->!"fresh".equals(row.freshnessState())).count());
        return new ResponseEntity<>(pages.renderPublic("mv29/status",request,model),headers,unavailable?HttpStatus.SERVICE_UNAVAILABLE:HttpStatus.OK);
    }
    private static List<StatusRow> parse(JsonNode data){
        JsonNode values=data.path("status");if(!values.isArray()||values.size()>200)throw new PublicSourceClient.SourceFailure();
        var result=new ArrayList<StatusRow>();var keys=new HashSet<String>();Instant now=Instant.now();
        for(JsonNode row:values){
            String key=text(row,"sourceKey"),name=text(row,"displayName"),state=text(row,"state"),freshness=text(row,"freshnessState");
            if(!key.matches("[a-z0-9][a-z0-9._-]{0,79}")||!keys.add(key)||name.isBlank()||name.length()>200||name.chars().anyMatch(Character::isISOControl)
                ||!Set.of("operational","degraded","outage","maintenance","unknown").contains(state)
                ||!Set.of("fresh","stale","unknown").contains(freshness)||!"status-v1".equals(text(row,"policyVersion")))throw new PublicSourceClient.SourceFailure();
            JsonNode observed=row.path("observedAt"),age=row.path("ageMs"),detail=row.path("detail");String time=null;Long milliseconds=null;
            if("unknown".equals(freshness)){
                if(!"unknown".equals(state)||!observed.isNull()||!age.isNull())throw new PublicSourceClient.SourceFailure();
            }else{
                time=text(row,"observedAt");Instant instant;
                try{instant=Instant.parse(time);}catch(Exception invalid){throw new PublicSourceClient.SourceFailure();}
                if(instant.isAfter(now)||!age.isIntegralNumber()||!age.canConvertToLong()||age.longValue()<0
                    ||("fresh".equals(freshness)&&"unknown".equals(state))||("stale".equals(freshness)&&!"unknown".equals(state)))throw new PublicSourceClient.SourceFailure();
                milliseconds=age.longValue();
                // The source computes age before this bounded local read; allow transport/clock jitter, not old evidence marked fresh.
                try {
                    long skew=Math.subtractExact(Duration.between(instant,now).toMillis(),milliseconds);
                    if(skew < -10_000L || skew > 10_000L)throw new PublicSourceClient.SourceFailure();
                }catch(ArithmeticException invalid){throw new PublicSourceClient.SourceFailure();}
            }
            if(!detail.isNull()&&(!detail.isTextual()||detail.textValue().length()>1000))throw new PublicSourceClient.SourceFailure();
            result.add(new StatusRow(key,name,state,detail.isTextual()?detail.textValue():null,time,freshness,milliseconds,"status-v1"));
        }
        return List.copyOf(result);
    }
    private static String text(JsonNode row,String key){JsonNode value=row.path(key);if(!value.isTextual())throw new PublicSourceClient.SourceFailure();return value.textValue();}
}
