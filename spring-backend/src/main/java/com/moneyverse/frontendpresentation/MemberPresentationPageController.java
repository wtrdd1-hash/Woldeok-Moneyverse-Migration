package com.moneyverse.frontendpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.moneyverse.adminpresentation.AdminSourceClient;
import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.HandlerMapping;

/** Retain the owner-bound client contracts without importing database-backed session services. */
@Controller
public final class MemberPresentationPageController {
    private static final Map<String,String> ROUTES=routes();
    private final AdminSourceClient source;private final UiPageRenderer pages;
    public MemberPresentationPageController(AdminSourceClient source,UiPageRenderer pages){this.source=source;this.pages=pages;}
    private static Map<String,String> routes(){
        var result=new HashMap<String,String>();for(String family:List.of("wallet","support","chat"))
            for(String suffix:List.of("","/",".html","/index.html"))result.put("/"+family+suffix,family);
        return Map.copyOf(result);
    }
    @GetMapping(value={"/wallet","/wallet/","/wallet.html","/wallet/index.html","/support","/support/","/support.html","/support/index.html",
        "/chat","/chat/","/chat.html","/chat/index.html"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request){
        Object match=request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String family=match instanceof String route?ROUTES.get(route):null;
        HttpHeaders headers=headers();headers.set("Content-Language",pages.language(request));if(family==null)return new ResponseEntity<>("",headers,HttpStatus.FORBIDDEN);
        String canonical="/"+family,cookie=source.sessionCookie(request);
        Map<String,Object> model=Map.of("uiPageKey",family.equals("support")?"msgSupport":family.equals("chat")?"msgChat":"wallet","memberRefresh",canonical);
        if(cookie==null)return login(headers,canonical);
        try{verify(source.read("/api/v1/auth/me",cookie));}
        catch(AdminSourceClient.SourceFailure failure){
            if(failure.status()==401)return login(headers,canonical);
            return new ResponseEntity<>(pages.render("mv43/member-unavailable",request,model),headers,
                failure.status()==403?HttpStatus.FORBIDDEN:HttpStatus.SERVICE_UNAVAILABLE);
        }
        if("1".equals(request.getHeader("RSC"))||request.getParameter("_rsc")!=null)
            return new ResponseEntity<>("",headers,HttpStatus.NOT_ACCEPTABLE);
        return new ResponseEntity<>(pages.render("mv43/"+family,request,model),headers,HttpStatus.OK);
    }
    private static void verify(JsonNode proof){
        JsonNode signed=proof.path("signedIn"),authenticated=proof.path("authenticated"),user=proof.path("user");
        if(!signed.isBoolean()||!authenticated.isBoolean()||signed.booleanValue()!=authenticated.booleanValue())throw unavailable();
        if(!signed.booleanValue()){
            if(!user.isNull())throw unavailable();throw new AdminSourceClient.SourceFailure(401);
        }
        if(!user.isObject())throw unavailable();String id=uuid(user.path("id"));
        for(JsonNode object:List.of(proof,user))for(String key:List.of("id","userId"))
            if(object.has(key)&&!id.equals(uuid(object.path(key))))throw unavailable();
        // Authentication proof is all this renderer needs; legacy numeric money is never copied to HTML.
    }
    private static String uuid(JsonNode value){
        if(!value.isTextual()||!value.textValue().matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"))throw unavailable();
        return UUID.fromString(value.textValue()).toString();
    }
    private static AdminSourceClient.SourceFailure unavailable(){return new AdminSourceClient.SourceFailure(503);}
    private static HttpHeaders headers(){
        var headers=new HttpHeaders();headers.setContentType(new MediaType("text","html",StandardCharsets.UTF_8));
        headers.set("Cache-Control","private, no-store");headers.set("Vary","Cookie, Accept-Language");
        headers.set("X-Robots-Tag","noindex, nofollow, noarchive");headers.set("Referrer-Policy","same-origin");
        headers.set("X-MV-Renderer","Spring-MVC-Thymeleaf");
        headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        return headers;
    }
    private static ResponseEntity<String> login(HttpHeaders headers,String path){
        headers.setLocation(URI.create("/login?next="+URLEncoder.encode(path,StandardCharsets.UTF_8)));
        return new ResponseEntity<>("",headers,HttpStatus.FOUND);
    }
}
