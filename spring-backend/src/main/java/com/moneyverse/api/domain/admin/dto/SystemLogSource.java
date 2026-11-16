package com.moneyverse.api.domain.admin.dto;

public enum SystemLogSource {
    NGINX_ERROR("nginx-error", "/var/log/nginx/error.log", null),
    NGINX_ACCESS("nginx-access", "/var/log/nginx/access.log", null),
    SPRING_BACKEND("spring-backend", null, "moneyverse-spring-backend"),
    FRONTEND("frontend", null, "moneyverse-release-v1546-frontend");

    private final String key;
    private final String filePath;
    private final String serviceUnit;

    SystemLogSource(String key, String filePath, String serviceUnit) {
        this.key = key;
        this.filePath = filePath;
        this.serviceUnit = serviceUnit;
    }

    public String getKey() { return key; }
    public String getFilePath() { return filePath; }
    public String getServiceUnit() { return serviceUnit; }

    public static SystemLogSource fromString(String val) {
        if (val == null) return NGINX_ERROR;
        for (SystemLogSource s : values()) {
            if (s.name().equalsIgnoreCase(val) || s.key.equalsIgnoreCase(val)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown log source");
    }
}
