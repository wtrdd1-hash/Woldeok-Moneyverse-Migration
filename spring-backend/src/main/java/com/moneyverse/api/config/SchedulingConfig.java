package com.moneyverse.api.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Candidate processes must be able to suppress all application scheduled work. */
@Configuration
@EnableScheduling
@ConditionalOnProperty(prefix="moneyverse.scheduling",name="enabled",havingValue="true",matchIfMissing=true)
public class SchedulingConfig {}
