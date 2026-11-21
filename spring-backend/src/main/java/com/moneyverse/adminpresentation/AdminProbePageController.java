package com.moneyverse.adminpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Observe actual bounded reads rather than relay the legacy invented availability percentages. */
@Controller
public final class AdminProbePageController {
    private final AdminSourceClient source;private final UiPageRenderer pages;
    public AdminProbePageController(AdminSourceClient source,UiPageRenderer pages){this.source=source;this.pages=pages;}
    public record Probe(String key,String path,String state,String stateKey,String duration,String records){}
    @GetMapping(value="/admin/api-health",produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request){
        String page="adminTool_api_health",cookie=source.sessionCookie(request);
        if(cookie==null)return AdminUiResponses.failure(pages,request,401,page);
        try{source.verifyAdmin(cookie);}catch(AdminSourceClient.SourceFailure failure){return AdminUiResponses.failure(pages,request,failure.status(),page);}
        var rows=new ArrayList<Probe>();boolean partial=false;
        for(String key:List.of("users","stocks","controls","catalog")){
            String path=switch(key){case "users"->"/api/v1/admin/users?limit=30";case "stocks"->"/api/v1/admin/stocks";
                case "controls"->"/api/v1/admin/controls";default->"/api/v1/business/catalog";};
            long start=System.nanoTime();String state="read",records;
            try{records=Integer.toString(count(key,source.read(path,cookie)));}
            catch(AdminSourceClient.SourceFailure failure){
                if(failure.status()==401||failure.status()==403)return AdminUiResponses.failure(pages,request,failure.status(),page);
                state="unavailable";records="—";partial=true;
            }
            String duration=String.format(Locale.ROOT,"%.2f",(System.nanoTime()-start)/1_000_000.0);
            rows.add(new Probe(key,path,state,state.equals("read")?"adminProbeRead":"adminProbeUnknown",duration,records));
        }
        Map<String,Object> model=Map.of("adminPageKey",page,"activeAdminPath","/admin/api-health","probeRows",rows,
            "probePartial",partial,"probeCheckedAt",Instant.now().toString());
        return new ResponseEntity<>(pages.render("mv43/admin-probes",request,model),AdminUiResponses.headers(pages,request),HttpStatus.OK);
    }
    private static int count(String key,JsonNode data){
        String field=switch(key){case "users"->"users";case "stocks"->"stocks";case "controls"->"featureSwitches";default->"catalog";};
        JsonNode rows=data.path(field);
        if(key.equals("catalog")){
            if(!data.path("success").isBoolean()||!data.path("success").booleanValue()||!rows.isArray()||rows.size()>1000)throw unavailable();
            for(JsonNode row:rows)if(!row.isObject()||!row.path("type_id").isTextual()||row.path("type_id").textValue().isBlank()
                ||!row.path("name").isTextual()||!unsigned(row.path("base_price"))||!unsigned(row.path("daily_yield")))throw unavailable();
        }else{
            String kind=key.equals("controls")?"features":key;
            if(!AdminUiController.validRows(kind,rows)||rows.size()>(key.equals("users")?30:1000))throw unavailable();
        }
        return rows.size();
    }
    private static boolean unsigned(JsonNode value){return value.isTextual()&&value.textValue().matches("0|[1-9][0-9]{0,37}");}
    private static AdminSourceClient.SourceFailure unavailable(){return new AdminSourceClient.SourceFailure(503);}
}
