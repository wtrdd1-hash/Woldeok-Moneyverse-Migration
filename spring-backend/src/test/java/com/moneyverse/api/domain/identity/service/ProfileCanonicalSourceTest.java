package com.moneyverse.api.domain.identity.service;

import com.moneyverse.api.domain.identity.dto.IdentityDtos.UserProfile;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class ProfileCanonicalSourceTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final ProfileService service = new ProfileService(jdbc);

    @Test void ownerReadUsesVerifiedMemberProfileViewNotNonexistentProfilesTable() {
        UUID actor=UUID.randomUUID();
        UserProfile record=new UserProfile();record.setId(actor.toString());record.setDisplayName("Verified");
        when(jdbc.queryForObject(contains("public.member_profile_view"),any(RowMapper.class),eq(actor),eq(actor))).thenReturn(record);
        assertEquals("Verified",service.getProfile(actor.toString()).getDisplayName());
        verify(jdbc).queryForObject(contains("public.member_profile_view"),any(RowMapper.class),eq(actor),eq(actor));
    }

    @Test void anonymousPublicReadDoesNotImpersonateRequestedSubject() {
        UUID target=UUID.randomUUID();
        UserProfile record=new UserProfile();record.setId(target.toString());record.setVisibility("public");
        when(jdbc.queryForObject(contains("public.member_profile_view"),any(RowMapper.class),isNull(),eq(target))).thenReturn(record);
        assertEquals("public", service.getProfile(target.toString(),null).getVisibility());
    }
}
