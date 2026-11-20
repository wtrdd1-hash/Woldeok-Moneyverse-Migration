package com.moneyverse.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MoneyverseSpringApplication {

    public static void main(String[] args) {
        String mode=System.getProperty("moneyverse.runtime-mode", "application");
        Class<?> application=switch(mode) {
            case "application" -> MoneyverseSpringApplication.class;
            case "presentation" -> com.moneyverse.presentation.NativePresentationApplication.class;
            default -> throw new IllegalArgumentException("Unknown Moneyverse runtime mode");
        };
        SpringApplication.run(application, args);
    }
}
