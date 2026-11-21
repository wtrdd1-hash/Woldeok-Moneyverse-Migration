package com.moneyverse.adminpresentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.moneyverse.api.domain.web.UiPageRenderer;
import jakarta.servlet.http.HttpServletRequest;
import java.time.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** A missing legacy outcome is unknown even when a delivery timestamp exists. */
@Controller
public final class AdminDeliveryPageController {
    private static final String PAGE="adminTool_logs_delivery";
    private static final Map<String,String> STATES=Map.of(
        "pending","adminDeliveryPending","delivering","adminDeliveryDelivering",
        "retry_pending","adminDeliveryRetry","delivered","adminDeliveryDelivered",
        "suppressed","adminDeliverySuppressed","dead_letter","adminDeliveryFailed");
    private final AdminSourceClient source;
    private final UiPageRenderer pages;
    public AdminDeliveryPageController(AdminSourceClient source,UiPageRenderer pages){this.source=source;this.pages=pages;}
    public record DeliveryRow(String type,String created,String completed,String stateKey,String attempts){}
    public record Metric(String name,String label,int count){}

    @GetMapping(value="/admin/logs/delivery",produces=MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> show(HttpServletRequest request){
        String cookie=source.sessionCookie(request);
        if(cookie==null)return AdminUiResponses.failure(pages,request,401,PAGE);
        try{source.verifyAdmin(cookie);}catch(AdminSourceClient.SourceFailure failure){
            return AdminUiResponses.failure(pages,request,failure.status(),PAGE);
        }
        Map<String,Object> model=new HashMap<>();
        model.put("adminPageKey",PAGE);model.put("activeAdminPath","/admin/logs/delivery");
        model.put("deliveryUnavailable",false);model.put("deliveryRows",List.of());model.put("deliveryMetrics",List.of());
        int status=200;
        try{read(model,cookie);}catch(AdminSourceClient.SourceFailure failure){
            if(failure.status()==401||failure.status()==403)return AdminUiResponses.failure(pages,request,failure.status(),PAGE);
            model.put("deliveryUnavailable",true);status=503;
        }catch(Exception unavailable){model.put("deliveryUnavailable",true);status=503;}
        return new ResponseEntity<>(pages.render("mv43/admin-delivery",request,model),
            AdminUiResponses.headers(pages,request),HttpStatus.valueOf(status));
    }
    private void read(Map<String,Object> model,String cookie){
        JsonNode rows=source.read("/api/v1/admin/discord-outbox-events",cookie).path("events");
        if(!rows.isArray()||rows.size()>30)throw unavailable();
        Set<UUID> seen=new HashSet<>();var output=new ArrayList<DeliveryRow>();
        int delivered=0,active=0,terminal=0,unknown=0,retried=0;
        Instant latest=Instant.now().plusSeconds(300);
        for(JsonNode row:rows){
            if(!row.isObject())throw unavailable();
            String id=text(row,"event_id"),type=text(row,"event_type"),created=text(row,"created_at");
            if(!id.matches("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
                ||!seen.add(UUID.fromString(id))||!type.matches("[A-Za-z0-9_./:-]{1,128}"))throw unavailable();
            Instant start=timestamp(created,latest);
            JsonNode end=row.path("delivered_at"),state=row.path("status"),attempts=row.path("delivery_attempts");
            if(state.isMissingNode()||(!state.isNull()&&!state.isTextual())||end.isMissingNode()
                ||(!end.isNull()&&!end.isTextual())||!attempts.isIntegralNumber()||!attempts.canConvertToInt()||attempts.intValue()<0)
                throw unavailable();
            if(row.has("delivery_status")&&!row.get("delivery_status").equals(state))throw unavailable();
            String completed=null;
            if(!end.isNull()){
                completed=end.textValue();if(timestamp(completed,latest).isBefore(start))throw unavailable();
            }
            String key;
            if(state.isNull()){unknown++;key="adminDeliveryUnknown";}
            else{
                String value=state.textValue();key=STATES.get(value);if(key==null)throw unavailable();
                if(value.equals("delivered")){
                    if(completed==null)throw unavailable();delivered++;
                }else{
                    if(completed!=null)throw unavailable();
                    if(value.equals("suppressed")||value.equals("dead_letter"))terminal++;else active++;
                }
            }
            if(attempts.intValue()>1)retried++;
            output.add(new DeliveryRow(type,created,completed,key,attempts.asText()));
        }
        // Commit the model only after every row is validated; never show partial healthy totals.
        model.put("deliveryRows",output);
        model.put("deliveryMetrics",List.of(new Metric("recent","adminDeliveryRecent",rows.size()),
            new Metric("delivered","adminDeliveryDelivered",delivered),new Metric("active","adminDeliveryActive",active),
            new Metric("terminal","adminDeliveryTerminal",terminal),new Metric("unknown","adminDeliveryUnknown",unknown),
            new Metric("retried","adminDeliveryRetried",retried)));
    }
    private static String text(JsonNode row,String key){
        JsonNode value=row.path(key);if(!value.isTextual())throw unavailable();return value.textValue();
    }
    private static Instant timestamp(String value,Instant latest){
        if(!value.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\\.[0-9]{1,9})?Z"))throw unavailable();
        Instant parsed=Instant.parse(value);
        if(parsed.isAfter(latest))throw unavailable();
        return parsed;
    }
    private static AdminSourceClient.SourceFailure unavailable(){return new AdminSourceClient.SourceFailure(503);}
}
