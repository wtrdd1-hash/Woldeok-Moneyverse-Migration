package com.moneyverse.api.web;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class SpringGuideRouteGateTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(SpringGuideLiveController.class);

    @Test
    void liveGuideRouteMustNotBeEnabledByDefault() {
        contextRunner.run(context -> assertThat(context).doesNotHaveBean(SpringGuideLiveController.class));
    }

    @Test
    void liveGuideRouteRequiresAnExplicitTrueFlag() {
        contextRunner.withPropertyValues("moneyverse.web.spring-guide-enabled=true")
                .run(context -> assertThat(context).hasSingleBean(SpringGuideLiveController.class));
    }
}
