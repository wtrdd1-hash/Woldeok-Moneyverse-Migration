package com.moneyverse.api.domain.admin.web;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.*;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import jakarta.servlet.http.HttpServletRequest;
import com.moneyverse.api.domain.web.UiPageRenderer;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/** Authenticated server-rendered admin overview; no mock or stale hardcoded financial metrics. */
@Controller
public class AdminDashboardPage {
    private final AdminAuthService auth;
    private final AdminGovernanceService source;
    private final UiPageRenderer pages;
    private final AdminNavigation navigation;

    public AdminDashboardPage(AdminAuthService auth, AdminGovernanceService source, UiPageRenderer pages, AdminNavigation navigation) {
        this.auth=auth;this.source=source;this.pages=pages;this.navigation=navigation;
    }
    @GetMapping(value={"/admin","/admin/"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request) {
        HttpHeaders headers=new HttpHeaders();
        headers.set("X-MV-Renderer","Spring-MVC-Thymeleaf");
        headers.set("Content-Language",pages.language(request));
        headers.setContentType(MediaType.parseMediaType("text/html;charset=UTF-8"));
        headers.setCacheControl(CacheControl.noStore());
        headers.set("Cache-Control","private, no-store");
        headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
        headers.set("X-Frame-Options","DENY");
        headers.set("X-Content-Type-Options","nosniff");
        headers.set("Referrer-Policy","no-referrer");
        headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
        UUID actor=auth.resolveVerifiedAdminActor(request).orElse(null);
        if(actor==null) {
            headers.setLocation(URI.create("/login?next=%2Fadmin"));
            return new ResponseEntity<>("",headers,HttpStatus.FOUND);
        }
        AdminUsersResponse users=null;
        AdminStocksResponse stocks=null;
        FeatureSwitchOverviewResponse features=null;
        boolean partial=false;
        try { users=source.listUsers(actor,50); if(users==null||users.getUsers()==null)throw new IllegalStateException("NO_ROWS"); }
        catch(Exception e) { users=null; partial=true; }
        try { stocks=source.listStocks(actor); if(stocks==null||stocks.getStocks()==null)throw new IllegalStateException("NO_STOCKS"); }
        catch(Exception e) { stocks=null; partial=true; }
        try { features=source.getFeatureSwitchesOverview(actor); if(features==null||features.getFeatureSwitches()==null)throw new IllegalStateException("NO_SWITCHES"); }
        catch(Exception e) { features=null; partial=true; }

        Map<String,Object> model=new HashMap<>();
        model.put("users",users);
        model.put("stocks",stocks);
        model.put("features",features);
        model.put("partial",partial);
        model.put("adminTools",navigation.tools(pages.language(request)));
        String html=pages.render("mv43/admin",request,model);
        return new ResponseEntity<>(html,headers,partial?HttpStatus.SERVICE_UNAVAILABLE:HttpStatus.OK);
    }

    /** Canonical route; prevent authenticated users encountering legacy demo admin.html variants. */
    @GetMapping(value={"/admin.html","/admin/index.html","/admin-preview","/admin-preview/","/admin-preview.html","/admin-preview/index.html"}, produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Void> canonicalAdminAlias(HttpServletRequest request) {
        HttpHeaders headers=new HttpHeaders();
        headers.set("Cache-Control","private, no-store");
        headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
        if(auth.resolveVerifiedAdminActor(request).isEmpty())headers.setLocation(URI.create("/login?next=%2Fadmin"));
        else headers.setLocation(URI.create("/admin"));
        return new ResponseEntity<>(headers,HttpStatus.FOUND);
    }

}
