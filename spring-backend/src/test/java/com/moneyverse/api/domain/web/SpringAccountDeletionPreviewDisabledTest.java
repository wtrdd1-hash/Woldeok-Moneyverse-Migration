package com.moneyverse.api.domain.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest(properties = "moneyverse.web.account-deletion-preview-enabled=false")
@ActiveProfiles("test")
class SpringAccountDeletionPreviewDisabledTest {
    @Autowired org.springframework.context.ApplicationContext context;
    @Autowired RequestMappingHandlerMapping routes;

    @Test
    void pageIsNotRegisteredUnlessExplicitlyEnabled() {
        assertFalse(context.containsBean("springAccountDeletionController"));
        assertFalse(routes.getHandlerMethods().keySet().stream()
                .anyMatch(info -> info.getPatternValues().contains("/spring-web/account-deletion")));
    }
}
