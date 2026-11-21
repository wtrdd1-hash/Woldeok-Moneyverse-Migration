package com.moneyverse.catalogread;

import java.net.*;
import java.net.http.*;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import static org.junit.jupiter.api.Assertions.*;

/** Real datasource auto-configuration must not pull JPA or a schema initializer into the read runtime. */
class CatalogReadCompositionTest {
    @Test void realDataSourceCompositionStartsWithoutAnEntityManagerOrDatabaseInitializer() throws Exception {
        ServletWebServerApplicationContext context=null;
        try {
            context=(ServletWebServerApplicationContext)new SpringApplicationBuilder(CatalogReadApplication.class)
                .run("--server.address=127.0.0.1","--server.port=0","--spring.main.banner-mode=off",
                    "--spring.datasource.url=jdbc:h2:mem:catalog_composition_"+UUID.randomUUID()+";MODE=PostgreSQL",
                    "--spring.datasource.username=sa","--spring.datasource.password=","--spring.datasource.driver-class-name=org.h2.Driver");
            assertNotNull(context.getBean(DataSource.class));
            assertNotNull(context.getBean(org.springframework.transaction.PlatformTransactionManager.class));
            for(String name:new String[]{"entityManagerFactory","dataSourceScriptDatabaseInitializer","userAuthService","marketTickerService","socketIOServer"})
                assertFalse(context.containsBean(name),name);
            URI health=URI.create("http://127.0.0.1:"+context.getWebServer().getPort()+"/catalog-read-health");
            var response=HttpClient.newHttpClient().send(HttpRequest.newBuilder(health).GET().build(),HttpResponse.BodyHandlers.ofString());
            assertEquals(503,response.statusCode(),"An arbitrary datasource cannot become a trusted canonical backend");
            assertFalse(response.body().contains("org.h2"));
        }finally{if(context!=null)context.close();}
    }
}
