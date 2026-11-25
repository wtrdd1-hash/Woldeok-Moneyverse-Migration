package com.moneyverse.frontendpresentation;

import java.net.*;
import java.net.http.*;
import org.junit.jupiter.api.*;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import static org.junit.jupiter.api.Assertions.*;

/** Guest finance URLs must retain login redirects without granting financial access. */
class FinanceGuestRouteRegressionTest {
  static ServletWebServerApplicationContext app;
  static URI origin;
  static final HttpClient client=HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
  @BeforeAll static void start(){
    app=(ServletWebServerApplicationContext)new SpringApplicationBuilder(UnifiedFrontendApplication.class)
      .properties("spring.main.banner-mode=off").run("--server.port=0","--server.address=127.0.0.1");
    origin=URI.create("http://127.0.0.1:"+app.getWebServer().getPort());
  }
  @AfterAll static void stop(){if(app!=null)app.close();}
  @Test void guestFinanceAliasesRedirectToLoginWithoutSessionOrFinancialData() throws Exception {
    for(String path:new String[]{"/bank","/bank/","/bank.html","/bank/index.html","/stocks","/stocks/","/stocks.html","/stocks/index.html"}) {
      var response=client.send(HttpRequest.newBuilder(origin.resolve(path)).GET().build(),HttpResponse.BodyHandlers.ofString());
      assertEquals(302,response.statusCode(),path);
      assertEquals("/login?next="+URLEncoder.encode(path.startsWith("/bank")?"/bank":"/stocks",java.nio.charset.StandardCharsets.UTF_8),response.headers().firstValue("Location").orElse(""),path);
      assertFalse(response.headers().firstValue("Set-Cookie").isPresent(),path);
      assertTrue(response.body().isBlank(),path);
    }
  }
}
