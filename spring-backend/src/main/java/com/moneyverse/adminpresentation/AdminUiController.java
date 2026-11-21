package com.moneyverse.adminpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.*;
import com.moneyverse.api.domain.admin.web.AdminNavigation;
import com.moneyverse.api.domain.health.NativeBuildIdentity;
import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class AdminUiController {
    private final AdminSourceClient source;
    private final ObjectMapper mapper;
    private final UiPageRenderer pages;
    private final AdminNavigation navigation;
    private final NativeBuildIdentity identity;
    public AdminUiController(AdminSourceClient source,ObjectMapper mapper,UiPageRenderer pages,AdminNavigation navigation,NativeBuildIdentity identity){
        this.source=source;this.mapper=mapper;this.pages=pages;this.navigation=navigation;this.identity=identity;
    }
    private HttpHeaders headers(HttpServletRequest request){return AdminUiResponses.headers(pages,request);}
    private ResponseEntity<String> failure(HttpServletRequest request,int status){
        return AdminUiResponses.failure(pages,request,status,"dashboard");
    }
    @GetMapping(value={"/admin","/admin/"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> dashboard(HttpServletRequest request){
        String cookie=source.sessionCookie(request);
        if(cookie==null)return failure(request,401);
        try{source.verifyAdmin(cookie);}catch(AdminSourceClient.SourceFailure failure){return failure(request,failure.status());}
        Map<String,Object> model=new HashMap<>();boolean partial=false;
        for(String[] item:new String[][]{{"users","/api/v1/admin/users?limit=50","users"},{"stocks","/api/v1/admin/stocks","stocks"},
            {"features","/api/v1/admin/controls","featureSwitches"}}){
            Object value=null;
            try{
                JsonNode data=source.read(item[1],cookie);
                if(!validRows(item[0],data.path(item[2])))throw new AdminSourceClient.SourceFailure(503);
                Class<?> type=switch(item[0]){case "users"->AdminUsersResponse.class;case "stocks"->AdminStocksResponse.class;default->FeatureSwitchOverviewResponse.class;};
                value=mapper.treeToValue(data,type);
            }catch(AdminSourceClient.SourceFailure failure){
                if(failure.status()==401||failure.status()==403)return failure(request,failure.status());partial=true;
            }catch(Exception invalid){partial=true;}
            model.put(item[0],value);
        }
        model.put("partial",partial);model.put("adminTools",navigation.tools(pages.language(request)));
        return new ResponseEntity<>(pages.render("mv43/admin",request,model),headers(request),partial?HttpStatus.SERVICE_UNAVAILABLE:HttpStatus.OK);
    }

    static JsonNode field(JsonNode row,String canonical,String alias){
        if(row.has(canonical)&&row.has(alias)&&!row.get(canonical).equals(row.get(alias)))
            throw new AdminSourceClient.SourceFailure(503);
        return row.has(canonical)?row.get(canonical):row.path(alias);
    }
    static boolean validRows(String kind,JsonNode rows){
        if(!rows.isArray())return false;
        for(JsonNode row:rows){
            if(!row.isObject())return false;
            if(kind.equals("users")){
                JsonNode id=field(row,"user_id","userId");
                if(!id.isTextual()||!id.textValue().matches("[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}")
                    ||!row.path("status").isTextual()||row.path("status").textValue().isBlank())return false;
            }
            if(kind.equals("stocks")){
                JsonNode price=field(row,"current_price","currentPrice"),halt=field(row,"halt_status","haltStatus");
                if(!row.path("symbol").isTextual()||row.path("symbol").asText().isBlank()||!row.path("name").isTextual()
                    ||!price.isTextual()||!price.textValue().matches("0|[1-9][0-9]{0,37}")||!halt.isTextual())return false;
            }
            if(kind.equals("features")){
                JsonNode key=field(row,"feature_key","featureKey");
                if(!key.isTextual()||key.textValue().isBlank()||!Set.of("enabled","paused","safe_mode","disabled").contains(row.path("state").asText()))return false;
            }
        }
        return true;
    }
    private static final List<String> LOG_SOURCES=List.of("NGINX_ERROR","NGINX_ACCESS","SPRING_BACKEND","FRONTEND","DISCORD_BOT","FRONTEND_ERRORS");
    private static final Map<String,String> LOG_KEYS=Map.of("NGINX_ERROR","nginx-error","NGINX_ACCESS","nginx-access",
        "SPRING_BACKEND","spring-backend","FRONTEND","frontend","DISCORD_BOT","discord-bot","FRONTEND_ERRORS","frontend-errors");
    @GetMapping(value="/admin/logs/system",produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> logs(HttpServletRequest request,
            @RequestParam(defaultValue="NGINX_ERROR",name="source") String selected,
            @RequestParam(defaultValue="100",name="lines") String requestedLines,
            @RequestParam(defaultValue="",name="filter") String filter){
        String cookie=source.sessionCookie(request);if(cookie==null)return failure(request,401);
        try{source.verifyAdmin(cookie);}catch(AdminSourceClient.SourceFailure failure){return failure(request,failure.status());}
        Map<String,Object> model=new HashMap<>();model.put("adminPageKey","adminSystemLogs");
        model.put("logSources",LOG_SOURCES);model.put("logFilter",filter.length()<=100?filter:"");
        model.put("selectedSource",LOG_SOURCES.contains(selected)?selected:"NGINX_ERROR");model.put("lineLimit",100);
        model.put("logs",null);model.put("invalidQuery",false);int status=200;
        try{
            if(!LOG_SOURCES.contains(selected)||!requestedLines.matches("[0-9]{1,3}")||filter.length()>100
                ||filter.chars().anyMatch(ch->Character.isISOControl(ch)))throw new IllegalArgumentException("Invalid log query");
            int limit=Integer.parseInt(requestedLines);if(limit<10||limit>500)throw new IllegalArgumentException("Invalid log limit");
            model.put("lineLimit",limit);
            JsonNode data=source.read("/api/v1/admin/logs/system?source="+selected+"&lines="+limit
                +"&filter=",cookie);
            JsonNode lines=data.path("lines");
            if(data.has("sourceAvailable") && (!data.path("sourceAvailable").isBoolean()||!data.path("sourceAvailable").booleanValue()))
                throw new AdminSourceClient.SourceFailure(503);
            if(!lines.isArray()||lines.size()>limit||!data.path("totalCount").isIntegralNumber()
                ||data.path("totalCount").asInt(-1)!=lines.size()||!data.path("truncated").isBoolean()
                ||!selected.equals(data.path("sourceName").asText())||!LOG_KEYS.get(selected).equals(data.path("source").asText())
                ||!(lines.isEmpty()?"EMPTY":"OK").equals(data.path("status").asText()))throw new AdminSourceClient.SourceFailure(503);
            java.time.Instant.parse(data.path("timestamp").asText());
            for(JsonNode line:lines){
                if(!line.isTextual()||line.textValue().length()>32768||line.textValue().startsWith("[ERROR] Failed to read logs")
                    ||line.textValue().startsWith("[WARN] Log file not found")||line.textValue().startsWith("[WARN] Log fetch timed out")
                    ||line.textValue().contains("-- No entries --")||line.textValue().startsWith("No journal files were found"))
                    throw new AdminSourceClient.SourceFailure(503);
            }
            // Older Discord endpoints silently apply a default filter, so an empty response lacks read evidence.
            if(selected.equals("DISCORD_BOT")&&lines.isEmpty()&&!data.path("sourceAvailable").asBoolean(false))
                throw new AdminSourceClient.SourceFailure(503);
            var normalized=(com.fasterxml.jackson.databind.node.ObjectNode)data.deepCopy();
            var matched=mapper.createArrayNode();String needle=filter.toLowerCase(Locale.ROOT);
            for(JsonNode line:lines)if(line.textValue().toLowerCase(Locale.ROOT).contains(needle))matched.add(line);
            normalized.set("lines",matched);normalized.put("totalCount",matched.size());normalized.put("status",matched.isEmpty()?"EMPTY":"OK");
            model.put("logs",mapper.convertValue(normalized,new com.fasterxml.jackson.core.type.TypeReference<Map<String,Object>>(){}));
        }catch(AdminSourceClient.SourceFailure failure){
            if(failure.status()==401||failure.status()==403)return failure(request,failure.status());status=503;
        }catch(IllegalArgumentException invalid){model.put("invalidQuery",true);status=400;}
        catch(Exception invalidSource){status=503;}
        return new ResponseEntity<>(pages.render("mv43/admin-system-logs",request,model),headers(request),HttpStatus.valueOf(status));
    }
    @GetMapping("/admin-ui-health") @ResponseBody public ResponseEntity<?> health(){
        return ResponseEntity.ok().header("Cache-Control","no-store").body(Map.of("ok",true,"databaseRequired",false,"readOnly",true));
    }
    @GetMapping("/admin-ui-version") @ResponseBody public ResponseEntity<?> version(){
        var sha=identity.sourceSha();return ResponseEntity.status(sha.isPresent()?200:503).header("Cache-Control","private, no-store")
            .body(Map.of("ok",sha.isPresent(),"scope","admin-read-ui-only","id",sha.orElse("unverified")));
    }
}
