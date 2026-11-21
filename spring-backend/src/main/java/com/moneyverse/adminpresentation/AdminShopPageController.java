package com.moneyverse.adminpresentation;

import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** All shop aliases use one native layout and the retained database-backed administrator proof. */
@Controller
public final class AdminShopPageController {
    private final AdminSourceClient source;
    private final UiPageRenderer pages;
    public AdminShopPageController(AdminSourceClient source,UiPageRenderer pages){this.source=source;this.pages=pages;}
    @GetMapping(value={"/admin/shop","/admin/shop/","/admin/shop.html","/admin/shop/index.html"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> shop(HttpServletRequest request){
        String cookie=source.sessionCookie(request);
        if(cookie==null)return AdminUiResponses.failure(pages,request,401,"adminTool_shop");
        try{source.verifyAdmin(cookie);}
        catch(AdminSourceClient.SourceFailure failure){return AdminUiResponses.failure(pages,request,failure.status(),"adminTool_shop");}
        if("1".equals(request.getHeader("RSC"))||request.getParameter("_rsc")!=null)
            return new ResponseEntity<>("",AdminUiResponses.headers(pages,request),HttpStatus.NOT_ACCEPTABLE);
        return new ResponseEntity<>(pages.render("mv46/admin-shop",request,Map.of("adminPageKey","adminTool_shop","activeAdminPath","/admin/shop","adminShopPage",true)),
            AdminUiResponses.headers(pages,request),HttpStatus.OK);
    }
}
