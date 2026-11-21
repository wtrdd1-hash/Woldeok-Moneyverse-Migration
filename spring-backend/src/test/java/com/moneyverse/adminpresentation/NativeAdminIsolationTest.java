package com.moneyverse.adminpresentation;

import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.*;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import static org.junit.jupiter.api.Assertions.*;

/** Real HTTP on both sides catches cookie/redirect/isolation mistakes that service doubles miss. */
class NativeAdminIsolationTest {
    static HttpServer upstream;
    static ServletWebServerApplicationContext application;
    static URI base;
    static final HttpClient browser=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    record Reply(int status,String type,String body) {}
    static final Map<String,Reply> overrides=new HashMap<>();
    static final List<String> paths=new CopyOnWriteArrayList<>();
    static final List<Map<String,List<String>>> headers=new CopyOnWriteArrayList<>();
    static volatile boolean hiddenReadFailure;
    static final String ADMIN="__Host-mv_session=qa-admin";

    static String canonicalUsers() throws java.io.IOException {
        var user=new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUserDto();
        user.setUserId("00000000-0000-4000-8000-000000000001");user.setStatus("active");
        return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(
            new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUsersResponse(List.of(user),Map.of()));
    }
    static String canonicalStocks() throws java.io.IOException {
        return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(
            new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminStocksResponse(List.of(
                new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminStockDto(
                    "00000000-0000-4000-8000-000000000002","QA","Actual fixture","9007199254740993",true,"ACTIVE",null))));
    }
    static String canonicalControls() throws java.io.IOException {
        return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(
            new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.FeatureSwitchOverviewResponse(List.of(
                new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.FeatureSwitchDto("qa","enabled","Fixture",null,null,null,null)),List.of(),List.of()));
    }
    @BeforeAll static void start() throws Exception {
        Class<?> config=assertDoesNotThrow(()->Class.forName("com.moneyverse.adminpresentation.NativeAdminApplication"),
                "The isolated native admin renderer is missing");
        upstream=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        upstream.createContext("/",exchange->{
            paths.add(exchange.getRequestURI().toString());
            headers.add(new TreeMap<>(exchange.getRequestHeaders()));
            String cookie=exchange.getRequestHeaders().getFirst("Cookie");
            String path=exchange.getRequestURI().getPath();
            Reply reply=overrides.get(path);
            if(hiddenReadFailure && path.equals("/api/v1/admin/logs/system")) {
                boolean filtered=exchange.getRequestURI().getRawQuery().contains("filter=xyz");
                reply=new Reply(200,"application/json","{\"source\":\"nginx-error\",\"sourceName\":\"NGINX_ERROR\",\"lines\":"+(filtered?"[]":"[\"[WARN] Log file not found on current host\"]")+",\"totalCount\":"+(filtered?0:1)+",\"truncated\":false,\"timestamp\":\"2026-11-21T00:00:00Z\",\"status\":\""+(filtered?"EMPTY":"OK")+"\"}");
            }
            if(reply==null && !ADMIN.equals(cookie))reply=new Reply(401,"application/json","{\"code\":\"login_required\"}");
            if(reply==null)reply=new Reply(200,"application/json",switch(path){
                case "/api/v1/admin/me" -> "{\"roles\":[\"superadmin\"]}";
                case "/api/v1/admin/users" -> canonicalUsers();
                case "/api/v1/admin/stocks" -> canonicalStocks();
                case "/api/v1/admin/controls" -> canonicalControls();
                case "/api/v1/admin/logs/system" -> "{\"source\":\"nginx-error\",\"sourceName\":\"NGINX_ERROR\",\"lines\":[\"<script>unsafe()</script>\",\"actual fixture line\"],\"totalCount\":2,\"truncated\":false,\"timestamp\":\"2026-11-21T00:00:00Z\",\"status\":\"OK\"}";
                default -> "{}";
            });
            exchange.getResponseHeaders().set("Content-Type",reply.type());
            if(reply.status()==302)exchange.getResponseHeaders().set("Location","/redirect-destination");
            byte[] bytes=reply.body().getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(reply.status(),bytes.length);exchange.getResponseBody().write(bytes);exchange.close();
        });upstream.start();
        application=(ServletWebServerApplicationContext)new SpringApplicationBuilder(config).properties(
            "server.port=0","server.address=127.0.0.1","spring.datasource.url=not-a-database",
            "moneyverse.admin.source-origin=http://127.0.0.1:"+upstream.getAddress().getPort(),
            "spring.main.banner-mode=off").run("--server.port=0","--server.address=127.0.0.1");
        base=URI.create("http://127.0.0.1:"+application.getWebServer().getPort());
    }
    @AfterAll static void stop(){if(application!=null)application.close();if(upstream!=null)upstream.stop(0);}
    @BeforeEach void reset(){hiddenReadFailure=false;overrides.clear();paths.clear();headers.clear();}
    static HttpResponse<String> get(String path,String cookie,String... extra) throws Exception {
        var req=HttpRequest.newBuilder(base.resolve(path)).header("Accept","text/html");
        if(cookie!=null)req.header("Cookie",cookie);
        for(int i=0;i<extra.length;i+=2)req.header(extra[i],extra[i+1]);
        return browser.send(req.GET().build(),HttpResponse.BodyHandlers.ofString());
    }
    @Test void noDatabaseSessionFinancialOrScheduledComponentsAreImported(){
        for(String bean:List.of("dataSource","jdbcTemplate","entityManagerFactory","userAuthService","adminAuthService",
            "socketIOServer","discordBotService","marketTickerService","org.springframework.context.annotation.internalScheduledAnnotationProcessor"))
            assertFalse(application.containsBean(bean),"UI renderer cannot import "+bean);
    }
    @Test void guestOrForgedActorAndTransportHeadersCannotReadPrivateSources() throws Exception {
        var response=get("/admin",null,"X-User-Id","pretend-admin","X-Internal-Token","not-an-identity");
        assertEquals(302,response.statusCode());assertTrue(response.headers().firstValue("Location").orElse("").startsWith("/login?next="));
        assertTrue(paths.isEmpty(),"No administrator cookie means no source requests");
        response=get("/admin","__Host-mv_session=invalid; mv_session=qa-admin");assertEquals(302,response.statusCode());
        assertEquals(List.of("/api/v1/admin/me"),paths);
    }
    @Test void sourceRoleIsRequiredEvenWhenUpstreamReturns200() throws Exception {
        for(String body:List.of("{}","{\"roles\":[]}","{\"roles\":[\"member\"]}","{\"roles\":[\"not-admin\"]}")){
            overrides.put("/api/v1/admin/me",new Reply(200,"application/json",body));
            assertEquals(403,get("/admin",ADMIN).statusCode());
        }
        assertTrue(paths.stream().allMatch(path->path.equals("/api/v1/admin/me")));
    }
    @Test void onlySessionCookieReachesFixedUpstreamAndNoHeaderCanOverrideActor() throws Exception {
        var response=get("/admin",ADMIN+"; analytics=private","X-User-Id","forged","X-Internal-Token","forged");
        assertEquals(200,response.statusCode());assertTrue(response.body().contains("9007199254740993 WLD"));
        assertTrue(response.body().contains("Actual fixture"));assertFalse(response.body().contains("12,840"));
        for(var sent:headers){
            assertEquals(List.of(ADMIN),sent.get("Cookie"));
            assertFalse(sent.keySet().stream().anyMatch(k->Set.of("x-user-id","x-actor-user-id","x-internal-token","authorization").contains(k.toLowerCase())));
        }
        assertEquals(4,paths.size());
    }
    @Test void duplicateHostCookieNeverFallsBackToLegacyCookie() throws Exception {
        assertEquals(302,get("/admin",ADMIN+"; __Host-mv_session=other; mv_session=qa-admin").statusCode());
        assertTrue(paths.isEmpty());
    }
    @Test void upstreamRedirectHtmlOrBrokenJsonCannotImpersonateAdmin() throws Exception {
        for(Reply reply:List.of(new Reply(302,"application/json","{}"),new Reply(200,"text/html","<h1>Sign in</h1>"),
            new Reply(200,"application/json","invalid"),new Reply(500,"application/json","{}"),
            new Reply(200,"application/json"," ".repeat(2100000)))){
            paths.clear();overrides.put("/api/v1/admin/me",reply);
            assertEquals(503,get("/admin",ADMIN).statusCode());assertEquals(List.of("/api/v1/admin/me"),paths);
        }
    }
    @Test void missingDashboardDataIsUnavailableAndNeverConvertedToHealthyZero() throws Exception {
        overrides.put("/api/v1/admin/stocks",new Reply(200,"application/json","{}"));
        var response=get("/admin",ADMIN);assertEquals(503,response.statusCode());assertTrue(response.body().contains("Unable to load data"));
        assertFalse(response.body().contains("<strong>0</strong>"));
    }
    @Test void privatePagesCannotCacheCreateSessionsOrExposeDataToFrames() throws Exception {
        var response=get("/admin",ADMIN);assertEquals("private, no-store",response.headers().firstValue("Cache-Control").orElse(""));
        assertTrue(response.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));
        assertEquals("DENY",response.headers().firstValue("X-Frame-Options").orElse(""));
        assertTrue(response.headers().allValues("Set-Cookie").isEmpty());
        assertFalse(response.headers().firstValue("Content-Security-Policy").orElse("").contains("unsafe-inline"));
    }
    @Test void mutationsAndUnrelatedRoutesAreDeniedBeforeUpstream() throws Exception {
        for(String path:List.of("/api/v1/admin/users","/api/v1/admin/logs/system","/wallet","/actuator/health","/socket.io/","/"))
            assertEquals(403,get(path,ADMIN).statusCode(),path);
        var req=HttpRequest.newBuilder(base.resolve("/admin")).header("Cookie",ADMIN).POST(HttpRequest.BodyPublishers.ofString("{}")).build();
        assertEquals(403,browser.send(req,HttpResponse.BodyHandlers.discarding()).statusCode());assertTrue(paths.isEmpty());
    }
    @Test void systemLogPageUsesActualBoundedSourceReadsAndEscapesMarkup() throws Exception {
        var response=get("/admin/logs/system?source=NGINX_ERROR&lines=50&filter=",ADMIN);
        assertEquals(200,response.statusCode());assertTrue(response.body().contains("actual fixture line"));
        assertTrue(response.body().contains("&lt;script&gt;unsafe()&lt;/script&gt;"));
        assertFalse(response.body().contains("<script>unsafe()</script>"));
        assertEquals(List.of("/api/v1/admin/me","/api/v1/admin/logs/system?source=NGINX_ERROR&lines=50&filter="),paths);
        assertTrue(response.body().contains("id=\"admin-log-filter\""));
        assertTrue(response.body().contains("name=\"filter\""));
        assertTrue(response.body().contains("class=\"admin-sidebar\""));
        assertTrue(response.body().contains("/assets/mv39/favicon.ico?v="));
        assertEquals(1,response.body().split("id=\"mv-support-launcher\"",-1).length-1);
        assertTrue(response.body().contains("aria-current=\"page\""));
    }
    @Test void missingMalformedOrWarningLogsNeverBecomeHealthyEmptyData() throws Exception {
        for(String body:List.of("{}","{\"status\":\"OK\",\"lines\":\"wrong\"}",
            "{\"status\":\"OK\",\"lines\":[\"[ERROR] Failed to read logs\"],\"totalCount\":1}",
            "{\"status\":\"OK\",\"lines\":[\"[WARN] Log file not found on current host\"],\"totalCount\":1}",
            "{\"status\":\"EMPTY\",\"lines\":[],\"totalCount\":7}")){
            overrides.put("/api/v1/admin/logs/system",new Reply(200,"application/json",body));
            var response=get("/admin/logs/system",ADMIN);assertEquals(503,response.statusCode());
            assertTrue(response.body().contains("Unable to load data"));
        }
    }
    @Test void genuineEmptyLogsRemainAnExplicitSuccessfulSourceResult() throws Exception {
        overrides.put("/api/v1/admin/logs/system",new Reply(200,"application/json",
            "{\"source\":\"nginx-error\",\"sourceName\":\"NGINX_ERROR\",\"status\":\"EMPTY\",\"lines\":[],\"totalCount\":0,\"truncated\":false,\"timestamp\":\"2026-11-21T00:00:00Z\"}"));
        var response=get("/admin/logs/system",ADMIN);assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("Nothing to display yet"));
    }
    @Test void logFormRejectsUnsupportedSourcesAndOutOfBoundsInputs() throws Exception {
        for(String query:List.of("source=../../private","lines=501","lines=9","lines=bad","filter="+"a".repeat(101))){
            paths.clear();assertEquals(400,get("/admin/logs/system?"+query,ADMIN).statusCode(),query);
            assertEquals(List.of("/api/v1/admin/me"),paths);
        }
    }
    @Test void upstreamAuthorizationLossDiscardsTheWholePrivatePage() throws Exception {
        for(int status:List.of(401,403)){
            overrides.put("/api/v1/admin/stocks",new Reply(status,"application/json","{}"));
            var response=get("/admin",ADMIN);assertEquals(status==401?302:403,response.statusCode());
            assertFalse(response.body().contains("Actual fixture"));
        }
    }
    @Test void allFiveLocalesRenderLogControlsAndTheSamePrivateShell() throws Exception {
        for(String lang:List.of("en","ko","ja","zh","vi")){
            var response=get("/admin/logs/system",ADMIN+"; wdmv_locale="+lang);
            assertEquals(200,response.statusCode(),lang);assertEquals(lang,response.headers().firstValue("Content-Language").orElse(""));
            assertTrue(response.body().contains("lang=\""+lang+"\""));
            assertTrue(response.body().contains("id=\"admin-menu-open\""));
            assertFalse(response.body().contains("null</"));
        }
    }

    @Test void malformedDashboardRowsCannotBecomeCountsOrRoundedMoney() throws Exception {
        for(var item:List.of(
            Map.entry("/api/v1/admin/users","{\"users\":[null]}"),
            Map.entry("/api/v1/admin/stocks","{\"stocks\":[null]}"),
            Map.entry("/api/v1/admin/stocks","{\"stocks\":[{\"symbol\":\"QA\",\"name\":\"Bad\",\"currentPrice\":9007199254740993,\"haltStatus\":\"ACTIVE\"}]}"),
            Map.entry("/api/v1/admin/stocks","{\"stocks\":[{\"symbol\":\"QA\",\"name\":\"Bad\",\"currentPrice\":\"1e6\",\"haltStatus\":\"ACTIVE\"}]}"),
            Map.entry("/api/v1/admin/controls","{\"featureSwitches\":[null]}"))){
            overrides.clear();overrides.put(item.getKey(),new Reply(200,"application/json",item.getValue()));
            var response=get("/admin",ADMIN);assertEquals(503,response.statusCode(),item.getKey());
            assertTrue(response.body().contains("Unable to load data"));
        }
    }
    @Test void arbitraryOriginsCannotReceiveAdministratorCookies(){
        for(String value:List.of("https://example.invalid","http://localhost:4550","http://127.0.0.1:4550/private",
            "http://name@127.0.0.1:4550","http://127.0.0.1:4550?redirect=elsewhere","http://127.0.0.1:4550#fragment"))
            assertThrows(IllegalArgumentException.class,()->new AdminSourceClient(value,new com.fasterxml.jackson.databind.ObjectMapper()));
    }

    @Test void anAuthorityInAnOtherwiseAllowedPathCannotRedirectSessionCookies(){
        var client=application.getBean(AdminSourceClient.class);
        assertThrows(IllegalArgumentException.class,()->client.read("//127.0.0.1:"+upstream.getAddress().getPort()+"/api/v1/admin/me",ADMIN));
        assertTrue(paths.isEmpty());
    }

    @Test void malformedUserObjectCannotBecomeAVerifiedMemberCount() throws Exception {
        overrides.put("/api/v1/admin/users",new Reply(200,"application/json","{\"users\":[{}]}"));
        var response=get("/admin",ADMIN);assertEquals(503,response.statusCode());
    }
    @Test void filteringCannotHideAnUpstreamReadFailureAsVerifiedEmpty() throws Exception {
        hiddenReadFailure=true;
        assertEquals(503,get("/admin/logs/system?filter=xyz",ADMIN).statusCode());
    }


    static void readPageFixtures() throws Exception {
        overrides.put("/api/v1/admin/me",new Reply(200,"application/json","{\"roles\":[\"superadmin\",\"approver\"]}"));
        var user=new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUserDto();
        user.setUserId("00000000-0000-4000-8000-000000000001");user.setStatus("active");
        user.setDisplayName("<script>qaName</script>");user.setCreatedAt("2026-11-21T00:00:00Z");
        overrides.put("/api/v1/admin/users",new Reply(200,"application/json",new com.fasterxml.jackson.databind.ObjectMapper()
            .writeValueAsString(new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUsersResponse(List.of(user),Map.of()))));
        overrides.put("/api/v1/business/catalog",new Reply(200,"application/json",new com.fasterxml.jackson.databind.ObjectMapper()
            .writeValueAsString(new com.moneyverse.api.domain.business.dto.BusinessDtos.BusinessCatalogResponse(true,List.of(
                new com.moneyverse.api.domain.business.dto.BusinessDtos.BusinessCatalogItem("fixture-type","Fixture enterprise","Fixture","test",
                    "9007199254740993","1234",1))))));
        var truth=new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.EconomyReconciliationHealthDto();
        truth.setAvailable(true);truth.setSnapshotId("00000000-0000-4000-8000-000000000003");truth.setMetricVersion("qa");
        truth.setCalculatedAt("2026-11-21T00:00:00Z");
        var integrity=new com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.EconomyReconciliationHealthDto.IntegrityDto();
        integrity.setOk(false);integrity.setLedgerTransactionCount("9007199254740993");integrity.setLedgerPostingCount("1960");
        integrity.setBalanceTotalDeltaAmount("-9007199254740993");truth.setIntegrity(integrity);
        overrides.put("/api/v1/admin/economy/reconciliations/latest",new Reply(200,"application/json",
            new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(truth)));
    }
    static final List<String> READ_ROUTES=List.of("/admin/users","/admin/market","/admin/controls",
        "/admin/enterprises","/admin/economy","/admin/economy/scenario-lab");

    @Test void sixExistingReadScreensUseTheSameNativeShellAndFavicon() throws Exception {
        readPageFixtures();
        for(String route:READ_ROUTES){
            var response=get(route,ADMIN);
            assertEquals(200,response.statusCode(),route);
            assertTrue(response.body().contains("class=\"admin-sidebar\""),route);
            assertTrue(response.body().contains("/assets/mv39/favicon.ico?v="),route);
            assertEquals(1,response.body().split("id=\"mv-support-launcher\"",-1).length-1,route);
            assertTrue(response.body().contains("private") || response.headers().firstValue("Cache-Control").orElse("").equals("private, no-store"));
            assertFalse(response.body().contains("/_next/"),route);
            assertTrue(response.body().contains("aria-current=\"page\""),route);
        }
    }
    @Test void sixReadScreensRequireActualSessionAndNeverUseForgedHeaders() throws Exception {
        for(String route:READ_ROUTES){
            paths.clear();
            assertEquals(302,get(route,null,"X-User-Id","forged","X-Internal-Token","forged").statusCode(),route);
            assertTrue(paths.isEmpty(),route);
        }
    }
    @Test void economyReadPagesPreserveTheAdditionalExactApproverRole() throws Exception {
        readPageFixtures();
        for(String roles:List.of("[\"superadmin\"]","[\"operator\"]","[\"admin\"]")){
            overrides.put("/api/v1/admin/me",new Reply(200,"application/json","{\"roles\":"+roles+"}"));
            for(String route:List.of("/admin/economy","/admin/economy/scenario-lab")){
                paths.clear();assertEquals(403,get(route,ADMIN).statusCode(),route);
                assertEquals(List.of("/api/v1/admin/me"),paths,"No financial source read without the exact approver role");
            }
        }
        overrides.put("/api/v1/admin/me",new Reply(200,"application/json","{\"roles\":[\"approver\"]}"));
        assertEquals(200,get("/admin/economy",ADMIN).statusCode());
    }
    @Test void memberSearchRemainsBoundedEscapedAndExplicitlyWithinFetchedRows() throws Exception {
        readPageFixtures();
        var result=get("/admin/users?limit=201&q=%3Cscript%3E",ADMIN);
        assertEquals(200,result.statusCode());assertTrue(paths.contains("/api/v1/admin/users?limit=200"));
        assertTrue(result.body().contains("&lt;script&gt;qaName&lt;/script&gt;"));
        assertFalse(result.body().contains("<script>qaName</script>"));
        assertTrue(result.body().contains("id=\"member-search\""));
        assertTrue(result.body().contains("value=\"200\""));
        assertTrue(result.body().contains("not all members"));
        result=get("/admin/users?limit=0&q=no-matching-user",ADMIN);
        assertEquals(200,result.statusCode());assertTrue(paths.contains("/api/v1/admin/users?limit=1"));
        assertTrue(result.body().contains("No matching members"));
        assertEquals(400,get("/admin/users?limit=not-an-integer",ADMIN).statusCode());
    }
    @Test void readScreensKeepMoneyPrecisionAndEscapeSourceText() throws Exception {
        readPageFixtures();
        var market=get("/admin/market",ADMIN);
        assertEquals(200,market.statusCode());assertTrue(market.body().contains("9,007,199,254,740,993"));
        var enterprise=get("/admin/enterprises",ADMIN);
        assertEquals(200,enterprise.statusCode());assertTrue(enterprise.body().contains("9,007,199,254,740,993"));
        var economy=get("/admin/economy",ADMIN);
        assertEquals(200,economy.statusCode());assertTrue(economy.body().contains("-9,007,199,254,740,993"));
        assertTrue(economy.body().contains("Check required"));
        assertFalse(economy.body().contains("Reported OK"));
    }
    @Test void missingOrUnverifiedReadSourcesNeverProduceHealthyTables() throws Exception {
        readPageFixtures();
        for(var item:List.of(Map.entry("/admin/users","/api/v1/admin/users"),
            Map.entry("/admin/market","/api/v1/admin/stocks"),Map.entry("/admin/controls","/api/v1/admin/controls"),
            Map.entry("/admin/enterprises","/api/v1/business/catalog"),
            Map.entry("/admin/economy","/api/v1/admin/economy/reconciliations/latest"))){
            Reply old=overrides.put(item.getValue(),new Reply(200,"application/json","{}"));
            assertEquals(503,get(item.getKey(),ADMIN).statusCode(),item.getKey());
            if(old==null)overrides.remove(item.getValue());else overrides.put(item.getValue(),old);
        }
        overrides.put("/api/v1/admin/economy/reconciliations/latest",new Reply(200,"application/json","{\"available\":false}"));
        var result=get("/admin/economy",ADMIN);assertEquals(503,result.statusCode());
        assertTrue(result.body().contains("Unverified"));assertFalse(result.body().contains("Reported OK"));
    }
    @Test void allReadPageTitlesAndControlsKeepFiveLanguagesAndPrivateResponses() throws Exception {
        readPageFixtures();
        for(String lang:List.of("en","ko","ja","zh","vi"))for(String route:READ_ROUTES){
            var response=get(route,ADMIN+"; wdmv_locale="+lang);
            assertEquals(200,response.statusCode(),route+" "+lang);
            assertEquals(lang,response.headers().firstValue("Content-Language").orElse(""));
            assertEquals("private, no-store",response.headers().firstValue("Cache-Control").orElse(""));
            assertTrue(response.headers().allValues("Set-Cookie").isEmpty());
            assertTrue(response.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));
            assertFalse(response.body().contains("null</"),route+" "+lang);
        }
    }


    @Test void conflictingOptionalMemberFieldsCannotBeSilentlyPresentedAsMissing() throws Exception {
        overrides.put("/api/v1/admin/users",new Reply(200,"application/json",
            "{\"users\":[{\"user_id\":\"00000000-0000-4000-8000-000000000001\",\"status\":\"active\",\"display_name\":\"one\",\"displayName\":\"two\"}]}"));
        assertEquals(503,get("/admin/users",ADMIN).statusCode());
    }
    @Test void moneyFormattingSupportsAllThirtyEightDigitsWithoutNumericConversion() {
        String amount="12345678901234567890123456789012345678";
        assertEquals("12,345,678,901,234,567,890,123,456,789,012,345,678",AdminReadPageController.formatInteger(amount));
        assertEquals("-12,345,678,901,234,567,890,123,456,789,012,345,678",AdminReadPageController.formatInteger("-"+amount));
        assertThrows(AdminSourceClient.SourceFailure.class,()->AdminReadPageController.formatInteger("-0"));
        assertThrows(AdminSourceClient.SourceFailure.class,()->AdminReadPageController.formatInteger("1e30"));
    }


    @Test void encodedEconomyMappingsCannotBypassTheApproverRequirement() throws Exception {
        readPageFixtures();
        overrides.put("/api/v1/admin/me",new Reply(200,"application/json","{\"roles\":[\"superadmin\"]}"));
        for(String route:List.of("/admin/%65conomy","/admin/e%63onomy","/admin/%65conomy/scenario-lab")){
            paths.clear();var response=get(route,ADMIN);
            assertFalse(paths.stream().anyMatch(p->p.startsWith("/api/v1/admin/economy/")),
                "Encoded route must not cause a financial source read without approver: "+route);
            assertTrue(Set.of(400,403).contains(response.statusCode()),route);
        }
    }


    static String deliveryRow(int id,String state,String completed) {
        return "{\"event_id\":\"00000000-0000-4000-8000-"+String.format("%012d",id)+"\","
            +"\"event_type\":\"qa.delivery\",\"created_at\":\"2026-11-20T00:00:00Z\","
            +"\"delivered_at\":"+(completed==null?"null":"\""+completed+"\"")+","
            +"\"delivery_attempts\":2,\"status\":"+(state==null?"null":"\""+state+"\"")+"}";
    }
    static void deliveryReply(String body) {
        overrides.put("/api/v1/admin/discord-outbox-events",new Reply(200,"application/json",body));
    }
    @Test void deliveryPageUsesCanonicalSourceAndKeepsUnknownSeparateFromDelivered() throws Exception {
        deliveryReply("{\"events\":["+deliveryRow(1,null,"2026-11-20T00:01:00Z")+"]}");
        var response=get("/admin/logs/delivery",ADMIN);
        assertEquals(200,response.statusCode());
        assertEquals(List.of("/api/v1/admin/me","/api/v1/admin/discord-outbox-events"),paths);
        assertTrue(response.body().contains("data-delivery-metric=\"unknown\"><strong>1</strong>"));
        assertTrue(response.body().contains("data-delivery-metric=\"delivered\"><strong>0</strong>"));
        assertTrue(response.body().contains("data-i18n=\"adminDeliveryUnknown\""));
        assertTrue(response.body().contains("2026-11-20T00:01:00Z"));
        assertTrue(response.body().contains("class=\"admin-sidebar\""));
        assertTrue(response.body().contains("/assets/mv39/favicon.ico?v="));
        assertEquals(1,response.body().split("id=\"mv-support-launcher\"",-1).length-1);
        assertEquals("private, no-store",response.headers().firstValue("Cache-Control").orElse(""));
        assertTrue(response.headers().firstValue("X-Robots-Tag").orElse("").contains("noindex"));
        assertTrue(response.headers().allValues("Set-Cookie").isEmpty());
    }
    @Test void deliveryPageSummariesOnlyCountValidatedRecentSampleOutcomes() throws Exception {
        var rows=new ArrayList<String>();int id=1;
        for(String state:List.of("pending","delivering","retry_pending","delivered","suppressed","dead_letter"))
            rows.add(deliveryRow(id++,state,state.equals("delivered")?"2026-11-20T00:01:00Z":null));
        rows.add(deliveryRow(id,null,null));deliveryReply("{\"events\":["+String.join(",",rows)+"]}");
        var response=get("/admin/logs/delivery",ADMIN);assertEquals(200,response.statusCode());
        for(var item:Map.of("recent",7,"delivered",1,"active",3,"terminal",2,"unknown",1,"retried",7).entrySet())
            assertTrue(response.body().contains("data-delivery-metric=\""+item.getKey()+"\"><strong>"+item.getValue()+"</strong>"),item.getKey());
        for(String key:List.of("Pending","Delivering","Retry","Delivered","Suppressed","Failed","Unknown"))
            assertTrue(response.body().contains("data-i18n=\"adminDelivery"+key+"\""),key);
    }
    @Test void verifiedEmptyDeliverySourceIsSuccessfulButMissingEvidenceIsNot() throws Exception {
        deliveryReply("{\"events\":[]}");var response=get("/admin/logs/delivery",ADMIN);
        assertEquals(200,response.statusCode());assertTrue(response.body().contains("data-delivery-metric=\"recent\"><strong>0</strong>"));
        assertTrue(response.body().contains("Nothing to display yet"));
        for(String malformed:List.of("{}","{\"events\":null}","{\"events\":{}}","{\"events\":[null]}")){
            deliveryReply(malformed);response=get("/admin/logs/delivery",ADMIN);assertEquals(503,response.statusCode());
            assertTrue(response.body().contains("Unable to load data"));assertFalse(response.body().contains("data-delivery-metric="));
        }
    }
    @Test void invalidDeliveryRowsNeverBecomePartialHealthyCounts() throws Exception {
        String valid=deliveryRow(1,"pending",null);
        var malformed=new ArrayList<String>(List.of(
            valid.replace("\"status\":\"pending\"","\"status\":\"success\""),
            valid.replace("\"status\":\"pending\"","\"delivery_status\":\"pending\""),
            valid.replace("\"status\":\"pending\"","\"status\":\"pending\",\"delivery_status\":\"delivered\""),
            valid.replace("\"delivery_attempts\":2","\"delivery_attempts\":-1"),
            valid.replace("\"delivery_attempts\":2","\"delivery_attempts\":1.5"),
            valid.replace("\"delivery_attempts\":2","\"delivery_attempts\":2147483648"),
            valid.replace("qa.delivery","<script>unsafe()</script>"),
            valid.replace("00000000-0000-4000-8000-000000000001","bad-id"),
            valid.replace("2026-11-20T00:00:00Z","2099-11-20T00:00:00Z"),
            valid.replace("2026-11-20T00:00:00Z","2026-02-30T00:00:00Z"),
            deliveryRow(1,"delivered",null),deliveryRow(1,"pending","2026-11-20T00:01:00Z"),
            deliveryRow(1,"delivered","2026-11-19T23:59:59Z")));
        for(String row:malformed){
            deliveryReply("{\"events\":["+row+"]}");var response=get("/admin/logs/delivery",ADMIN);
            assertEquals(503,response.statusCode(),row);assertFalse(response.body().contains("data-delivery-metric="));
        }
        deliveryReply("{\"events\":["+valid+","+valid+"]}");assertEquals(503,get("/admin/logs/delivery",ADMIN).statusCode());
        var many=new ArrayList<String>();for(int i=1;i<=31;i++)many.add(deliveryRow(i,"pending",null));
        deliveryReply("{\"events\":["+String.join(",",many)+"]}");assertEquals(503,get("/admin/logs/delivery",ADMIN).statusCode());
    }
    @Test void deliveryRequiresVerifiedAdministratorBeforeReadingEventsAndRejectsMutations() throws Exception {
        assertEquals(302,get("/admin/logs/delivery",null,"X-User-Id","forged").statusCode());assertTrue(paths.isEmpty());
        overrides.put("/api/v1/admin/me",new Reply(200,"application/json","{\"roles\":[\"member\"]}"));
        assertEquals(403,get("/admin/logs/delivery",ADMIN).statusCode());assertEquals(List.of("/api/v1/admin/me"),paths);
        paths.clear();var req=HttpRequest.newBuilder(base.resolve("/admin/logs/delivery")).header("Cookie",ADMIN)
            .POST(HttpRequest.BodyPublishers.ofString("{}")).build();
        assertEquals(403,browser.send(req,HttpResponse.BodyHandlers.discarding()).statusCode());assertTrue(paths.isEmpty());
    }
    @Test void deliverySourceLossCannotRenderAnEmptySuccessOrLeakTheUpstreamBody() throws Exception {
        for(int status:List.of(401,403,500)){
            overrides.put("/api/v1/admin/discord-outbox-events",new Reply(status,"application/json","{\"private\":\"upstream-secret-fixture\"}"));
            var response=get("/admin/logs/delivery",ADMIN);assertEquals(status==401?302:status==403?403:503,response.statusCode());
            assertFalse(response.body().contains("upstream-secret-fixture"));assertFalse(response.body().contains("data-delivery-metric="));
        }
    }
    @Test void deliverySameShellAndStatusesRenderInAllFiveLocales() throws Exception {
        deliveryReply("{\"events\":["+deliveryRow(1,null,null)+"]}");
        for(String lang:List.of("en","ko","ja","zh","vi")){
            var response=get("/admin/logs/delivery",ADMIN+"; wdmv_locale="+lang);assertEquals(200,response.statusCode(),lang);
            assertEquals(lang,response.headers().firstValue("Content-Language").orElse(""));
            assertTrue(response.body().contains("data-i18n=\"adminTool_logs_delivery\""));
            assertTrue(response.body().contains("data-i18n=\"adminDeliveryUnknown\""));
            assertFalse(response.body().contains("null</"));assertTrue(response.body().contains("/admin/logs/system"));
        }
    }


    @Test void deliveryRejectsMidnightNormalizationInBothSourceTimestamps() throws Exception {
        String start=deliveryRow(1,null,null).replace("2026-11-20T00:00:00Z","2026-11-20T24:00:00Z");
        String end=deliveryRow(1,"delivered","2026-11-20T24:00:00Z");
        assertAll(java.util.stream.Stream.of(start,end).map(row->(org.junit.jupiter.api.function.Executable)()->{
            deliveryReply("{\"events\":["+row+"]}");var response=get("/admin/logs/delivery",ADMIN);
            assertEquals(503,response.statusCode());assertFalse(response.body().contains("data-delivery-metric="));
        }));
    }
    @Test void deliveryAccessibleLabelsShareTheCurrentLanguageWithTheVisibleHeadings() throws Exception {
        deliveryReply("{\"events\":[]}");
        var response=get("/admin/logs/delivery",ADMIN+"; wdmv_locale=ko");
        var copy=new com.fasterxml.jackson.databind.ObjectMapper().readTree(
            NativeAdminIsolationTest.class.getResourceAsStream("/ui/mv43-copy.json"));
        assertEquals(200,response.statusCode());
        assertTrue(response.body().contains("aria-label=\""+copy.path("logs").get(1).asText()+"\""));
        assertTrue(response.body().contains("data-i18n-aria=\"logs\""));
        assertTrue(response.body().contains("data-i18n-aria=\"adminDeliveryRecords\""));
    }

}
