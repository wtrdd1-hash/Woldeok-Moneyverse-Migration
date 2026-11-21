package com.moneyverse.adminpresentation;

import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.http.*;

/** All administrator read screens retain the same private response and authorization failure contract. */
final class AdminUiResponses {
    private AdminUiResponses() {}
    static HttpHeaders headers(UiPageRenderer pages,HttpServletRequest request) {
        var headers=new HttpHeaders();headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));
        headers.set("Cache-Control","private, no-store");headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
        headers.set("X-MV-Renderer","Spring-MVC-Thymeleaf");headers.set("Content-Language",pages.language(request));
        headers.set("X-Frame-Options","DENY");headers.set("X-Content-Type-Options","nosniff");headers.set("Referrer-Policy","no-referrer");
        headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        return headers;
    }
    static ResponseEntity<String> failure(UiPageRenderer pages,HttpServletRequest request,int status,String pageKey) {
        var headers=headers(pages,request);
        if(status==401){
            headers.setLocation(URI.create("/login?next="+URLEncoder.encode(request.getRequestURI(),StandardCharsets.UTF_8)));
            return new ResponseEntity<>("",headers,HttpStatus.FOUND);
        }
        return new ResponseEntity<>(pages.render("mv43/admin-unavailable",request,Map.of(
            "denied",status==403,"adminPageKey",pageKey)),headers,HttpStatus.valueOf(status));
    }
}
