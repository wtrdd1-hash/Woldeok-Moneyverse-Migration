package com.moneyverse.adminpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerMapping;

/** Preserve the six existing read-only workflows without importing their JDBC-backed controllers. */
@Controller
public final class AdminReadPageController {
    private final AdminSourceClient source;
    private final UiPageRenderer pages;
    private static final Map<String,String> TITLES=Map.of(
        "/admin/users","adminTool_users","/admin/market","adminTool_market",
        "/admin/controls","adminTool_controls","/admin/enterprises","adminTool_enterprises",
        "/admin/economy","adminTool_economy","/admin/economy/scenario-lab","adminTool_economy_scenario_lab");

    public AdminReadPageController(AdminSourceClient source,UiPageRenderer pages){this.source=source;this.pages=pages;}

    @GetMapping(value={"/admin/users","/admin/market","/admin/controls","/admin/enterprises",
        "/admin/economy","/admin/economy/scenario-lab"},produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request,
        @RequestParam(defaultValue="30",name="limit") String requestedLimit,
        @RequestParam(defaultValue="",name="q") String query) {
        Object matched=request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String route=matched instanceof String pattern?pattern:"";
        if(!TITLES.containsKey(route))return AdminUiResponses.failure(pages,request,403,"dashboard");
        String key=TITLES.get(route),cookie=source.sessionCookie(request);
        if(cookie==null)return AdminUiResponses.failure(pages,request,401,key);
        try {
            source.verifyAdmin(cookie,Set.of("/admin/economy","/admin/economy/scenario-lab").contains(route)?"approver":null);
        }catch(AdminSourceClient.SourceFailure failure){
            return AdminUiResponses.failure(pages,request,failure.status(),key);
        }
        Map<String,Object> model=new HashMap<>();
        model.put("adminPageKey",key);model.put("activeAdminPath",route);model.put("refreshPath",route);
        model.put("memberPage",route.equals("/admin/users"));model.put("readQuery","");model.put("readLimit",30);
        model.put("readRows",List.of());model.put("readColumns",List.of());model.put("sourceCount",null);
        model.put("readInvalid",false);model.put("readUnavailable",false);model.put("readUnverified",false);
        model.put("scenarioPage",route.endsWith("scenario-lab"));model.put("reconciliation",false);
        int status=200;
        try {
            switch(route) {
                case "/admin/users" -> members(model,cookie,requestedLimit,query);
                case "/admin/market" -> market(model,cookie);
                case "/admin/controls" -> controls(model,cookie);
                case "/admin/enterprises" -> enterprises(model,cookie);
                case "/admin/economy", "/admin/economy/scenario-lab" -> reconciliation(model,cookie);
                default -> throw new IllegalArgumentException("Unmapped administrator page");
            }
        }catch(AdminSourceClient.SourceFailure failure){
            if(failure.status()==401||failure.status()==403)
                return AdminUiResponses.failure(pages,request,failure.status(),key);
            model.put("readUnavailable",true);status=503;
        }catch(IllegalArgumentException invalid){model.put("readInvalid",true);status=400;}
        catch(Exception unavailable){model.put("readUnavailable",true);status=503;}
        return new ResponseEntity<>(pages.render("mv43/admin-read",request,model),
            AdminUiResponses.headers(pages,request),HttpStatus.valueOf(status));
    }

    private void members(Map<String,Object> model,String cookie,String requestedLimit,String query){
        int limit=Math.max(1,Math.min(200,Integer.parseInt(requestedLimit)));
        if(query.chars().anyMatch(Character::isISOControl))throw new IllegalArgumentException("Invalid member query");
        String needle=query.strip();needle=needle.substring(0,Math.min(80,needle.length()));
        model.put("readLimit",limit);model.put("readQuery",needle);
        JsonNode data=source.read("/api/v1/admin/users?limit="+limit,cookie),rows=data.path("users");
        if(!AdminUiController.validRows("users",rows)||rows.size()>limit)throw unavailable();
        var values=new ArrayList<List<String>>();String match=needle.toLowerCase(Locale.ROOT);
        for(JsonNode row:rows){
            String id=field(row,"user_id","userId"),name=optional(row,"display_name","displayName"),state=text(row,"status");
            String joined=optional(row,"created_at","createdAt");
            if(!match.isEmpty() && !name.toLowerCase(Locale.ROOT).contains(match)
                && !id.toLowerCase(Locale.ROOT).contains(match)&&!state.toLowerCase(Locale.ROOT).contains(match))continue;
            values.add(List.of(name,id,state,joined));
        }
        table(model,rows.size(),List.of("adminReadName","adminReadId","status","adminReadJoined"),values);
    }
    private void market(Map<String,Object> model,String cookie){
        JsonNode rows=source.read("/api/v1/admin/stocks",cookie).path("stocks");
        if(!AdminUiController.validRows("stocks",rows))throw unavailable();
        var values=new ArrayList<List<String>>();
        for(JsonNode row:rows)values.add(List.of(text(row,"symbol"),text(row,"name"),
            formatInteger(field(row,"current_price","currentPrice")),field(row,"halt_status","haltStatus")));
        table(model,rows.size(),List.of("symbol","stockName","currentPrice","status"),values);
    }
    private void controls(Map<String,Object> model,String cookie){
        JsonNode rows=source.read("/api/v1/admin/controls",cookie).path("featureSwitches");
        if(!AdminUiController.validRows("features",rows))throw unavailable();
        var values=new ArrayList<List<String>>();
        for(JsonNode row:rows)values.add(List.of(field(row,"feature_key","featureKey"),text(row,"state"),optional(row,"reason","reason")));
        table(model,rows.size(),List.of("adminReadFeature","status","adminReadReason"),values);
    }
    private void enterprises(Map<String,Object> model,String cookie){
        JsonNode data=source.read("/api/v1/business/catalog",cookie),rows=data.path("catalog");
        if(!data.path("success").isBoolean()||!data.path("success").booleanValue()||!rows.isArray())throw unavailable();
        var values=new ArrayList<List<String>>();
        for(JsonNode row:rows){
            if(!row.isObject()||text(row,"type_id").isBlank())throw unavailable();
            values.add(List.of(text(row,"name"),formatUnsigned(text(row,"base_price")),formatUnsigned(text(row,"daily_yield"))));
        }
        table(model,rows.size(),List.of("adminReadName","adminReadCost","adminReadDailyYield"),values);
    }
    private void reconciliation(Map<String,Object> model,String cookie){
        JsonNode data=source.read("/api/v1/admin/economy/reconciliations/latest",cookie);
        model.put("reconciliation",true);
        if(!data.path("available").isBoolean())throw unavailable();
        if(!data.path("available").booleanValue()){model.put("readUnverified",true);throw unavailable();}
        String id=field(data,"snapshot_id","snapshotId"),version=field(data,"metric_version","metricVersion");
        String time=field(data,"calculatedAt","calculated_at");
        java.time.Instant.parse(time);
        JsonNode truth=data.path("integrity");
        if(id.isBlank()||version.isBlank()||!truth.isObject()||!truth.path("ok").isBoolean())throw unavailable();
        var values=new ArrayList<List<String>>();
        values.add(List.of("adminReadTransactions",formatUnsigned(field(truth,"ledgerTransactionCount","ledger_transaction_count"))));
        values.add(List.of("adminReadPostings",formatUnsigned(field(truth,"ledgerPostingCount","ledger_posting_count"))));
        values.add(List.of("adminReadDelta",formatInteger(field(truth,"balanceTotalDeltaAmount","balance_total_delta_amount"))));
        model.put("reconciliationOk",truth.path("ok").booleanValue());model.put("snapshotAt",time);
        model.put("snapshotId",id);model.put("metricVersion",version);
        table(model,1,List.of("adminReadMetric","adminReadValue"),values);
    }
    private static void table(Map<String,Object> model,int sourceCount,List<String> columns,List<List<String>> rows){
        model.put("sourceCount",sourceCount);model.put("readColumns",columns);model.put("readRows",rows);
    }
    private static String optional(JsonNode row,String canonical,String alias){
        JsonNode value=AdminUiController.field(row,canonical,alias);
        if(value.isMissingNode()||value.isNull())return "—";
        if(!value.isTextual())throw unavailable();
        return value.textValue().isBlank()?"—":value.textValue();
    }
    private static String field(JsonNode row,String canonical,String alias){
        JsonNode value=AdminUiController.field(row,canonical,alias);
        if(!value.isTextual())throw unavailable();
        return value.textValue();
    }
    private static String text(JsonNode row,String name){return field(row,name,name);}
    private static String formatUnsigned(String value){
        if(!value.matches("0|[1-9][0-9]{0,37}"))throw unavailable();
        return formatInteger(value);
    }
    static String formatInteger(String value){
        if(!value.matches("0|-?[1-9][0-9]{0,37}"))throw unavailable();
        int start=value.startsWith("-")?1:0;String digits=value.substring(start);
        StringBuilder grouped=new StringBuilder(value.length()+value.length()/3);
        if(start==1)grouped.append('-');
        for(int i=0;i<digits.length();i++){if(i>0&&(digits.length()-i)%3==0)grouped.append(',');grouped.append(digits.charAt(i));}
        return grouped.toString();
    }
    private static AdminSourceClient.SourceFailure unavailable(){return new AdminSourceClient.SourceFailure(503);}
}
