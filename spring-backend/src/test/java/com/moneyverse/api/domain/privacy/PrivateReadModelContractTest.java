package com.moneyverse.api.domain.privacy;

import com.moneyverse.api.domain.support.service.SupportService;
import com.moneyverse.api.domain.chat.service.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PrivateReadModelContractTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final UUID actor = UUID.randomUUID();

    @SuppressWarnings({"unchecked", "rawtypes"})
    private void rowsEmpty() {
        doReturn(List.of()).when(jdbc).query(anyString(), any(RowMapper.class), any(Object[].class));
    }

    @Test void supportOwnerReadsMustInvokeCanonicalSecurityDefinerNotDirectTable() {
        rowsEmpty();
        var svc = new SupportService(jdbc);
        assertTrue(svc.listThreads(actor, null).threads().isEmpty());
        verify(jdbc).query(contains("public.support_my_threads"), any(RowMapper.class), any(Object[].class));
        assertEquals(0, svc.summary(actor).total());
        verify(jdbc, atLeast(2)).query(contains("public.support_my_threads"), any(RowMapper.class), any(Object[].class));
        assertTrue(svc.listMessages(actor, UUID.randomUUID()).messages().isEmpty());
        verify(jdbc).query(contains("public.support_thread_messages"), any(RowMapper.class), any(Object[].class));
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test void chatListAndUnreadMustUseOwnerConstrainedFunctionsNotInventZero() {
        rowsEmpty();
        when(jdbc.queryForObject(contains("public.private_chat_total_unread"), eq(String.class), any(Object[].class)))
                .thenReturn("0");
        var svc = new ChatService(jdbc);
        var res = svc.listConversations(actor, 25);
        assertTrue(res.conversations().isEmpty());
        assertEquals(0, res.totalUnread());
        verify(jdbc).query(contains("public.private_chat_list_conversations"), any(RowMapper.class), any(Object[].class));
        assertEquals(0, svc.totalUnreadCount(actor));
    }
}
