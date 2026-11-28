package com.moneyverse.api.domain.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUserDto;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Sandbox browser QA: /admin/users showed "could not load" for every member. The web parser requires
 * restricted_at and restriction_reason to be present (null meaning not restricted) as proof the
 * API read them; NON_NULL dropped both keys for every unrestricted member.
 */
class AdminUserDtoRestrictionFieldsTest {
    @Test void anUnrestrictedMemberCarriesExplicitNulls() throws Exception {
        AdminUserDto dto = new AdminUserDto();
        dto.setUserId("4b9528af-2818-4023-ac7b-01cf25d6b5e0");
        String json = new ObjectMapper().writeValueAsString(dto);
        assertTrue(json.contains("\"restricted_at\":null"), json);
        assertTrue(json.contains("\"restriction_reason\":null"), json);
    }
}
