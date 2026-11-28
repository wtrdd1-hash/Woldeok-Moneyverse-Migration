package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewInterceptor;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Capacity sandbox 2026-11-26: with open-in-view on (Spring Boot's default) a JPA transaction
 * early in a request kept its connection until the response, and the JdbcTemplate call that
 * followed borrowed a second one. At 20 concurrent transfers every pooled connection was held
 * by a request waiting for another: throughput fell from 453 to 10 req/s with 15 s timeouts
 * (Hikari leak detection pointed at JpaTransactionManager.doBegin). The API reads through
 * JdbcTemplate and has one entity with no lazy associations, so nothing needs the session open
 * across the view.
 */
@SpringBootTest(properties={"moneyverse.scheduling.enabled=false"})
@ActiveProfiles("test")
class OpenInViewDisabledTest {
    @Autowired ApplicationContext context;

    @Test void requestsDoNotHoldAJpaConnectionForTheirWholeLifetime() {
        assertEquals(0, context.getBeanNamesForType(OpenEntityManagerInViewInterceptor.class).length,
                "spring.jpa.open-in-view must be false");
    }
}
