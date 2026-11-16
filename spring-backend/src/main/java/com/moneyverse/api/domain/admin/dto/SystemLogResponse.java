package com.moneyverse.api.domain.admin.dto;

import java.util.List;

public record SystemLogResponse(
        String source,
        String sourceName,
        List<String> lines,
        int totalCount,
        boolean truncated,
        String timestamp,
        String status
) {}
