package com.moneyverse.api.domain.web;

import com.moneyverse.api.MoneyverseSpringApplication;
import org.springframework.boot.SpringApplication;
import java.nio.file.Files;

/** Development-only launcher on the test classpath; never packaged into the application JAR. */
public final class NativeUiPreview {
    private NativeUiPreview() {}
    public static void main(String[] ignored) throws Exception {
        if(!"isolated-h2".equals(System.getenv("MONEYVERSE_NATIVE_UI_PREVIEW")))
            throw new IllegalStateException("Explicit isolated H2 preview opt-in required");
        String source=System.getenv("MONEYVERSE_QA_SOURCE_SHA");
        if(source==null||!source.matches("[0-9a-f]{40}"))throw new IllegalStateException("Exact preview source SHA required");
        String storage=Files.createTempDirectory("moneyverse-native-ui-preview-").toString();
        System.out.println("Native UI preview source: "+source);
        SpringApplication.run(MoneyverseSpringApplication.class,new String[]{
            "--spring.config.location=classpath:/application-test.yml",
            "--spring.profiles.active=test",
            "--spring.datasource.url=jdbc:h2:mem:native_ui_preview;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
            "--spring.datasource.driver-class-name=org.h2.Driver",
            "--spring.datasource.username=sa","--spring.datasource.password=",
            "--spring.sql.init.mode=always","--spring.sql.init.schema-locations=classpath:schema-test.sql",
            "--spring.jpa.hibernate.ddl-auto=create-drop",
            "--server.address=127.0.0.1","--server.port=49979",
            "--moneyverse.socket.host=127.0.0.1","--moneyverse.socket.port=0",
            "--moneyverse.discord.bot-token=",
            "--moneyverse.app-base-url=http://localhost:49979",
            "--moneyverse.storage.path="+storage
        });
    }
}
