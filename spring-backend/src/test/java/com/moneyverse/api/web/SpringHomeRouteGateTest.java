package com.moneyverse.api.web;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class SpringHomeRouteGateTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(SpringHomeLiveController.class);

    @Test
    void homeRouteIsDisabledByDefault() {
        contextRunner.run(context -> assertThat(context).doesNotHaveBean(SpringHomeLiveController.class));
    }

    @Test
    void homeRouteNeedsOptIn() {
        contextRunner.withPropertyValues("moneyverse.web.spring-home-enabled=true")
                .run(context -> assertThat(context).hasSingleBean(SpringHomeLiveController.class));
    }
}
