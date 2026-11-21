package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.ScheduledAnnotationBeanPostProcessor;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties="moneyverse.scheduling.enabled=false")
@ActiveProfiles("test")
class NativeSchedulingDisabledTest {
    @Autowired ApplicationContext context;
    @Test void isolatedCandidateCannotRegisterApplicationScheduledTasks() {
        assertTrue(context.getBeansOfType(ScheduledAnnotationBeanPostProcessor.class).isEmpty(),
            "A canary must not duplicate production schedulers");
    }
}
