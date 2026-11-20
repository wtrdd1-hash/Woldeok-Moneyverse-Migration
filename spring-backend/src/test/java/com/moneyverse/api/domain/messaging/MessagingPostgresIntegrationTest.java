package com.moneyverse.api.domain.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.chat.dto.ChatDtos.SendMessageRequest;
import com.moneyverse.api.domain.chat.service.ChatService;
import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import com.moneyverse.api.domain.support.service.SupportService;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Set;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/** Only the explicitly configured disposable GitHub service; each fixture is rolled back. */
@Tag("postgres-messaging")
class MessagingPostgresIntegrationTest {
    Connection connection;
    JdbcTemplate jdbc;
    SupportService support;
    ChatService chat;
    UUID actor,peer,outsider,conversation;
    @BeforeEach void connectToDisposableCiOnly() throws Exception {
        assertEquals("true",System.getenv("GITHUB_ACTIONS"),"This task only runs in disposable GitHub CI");
        String url=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_URL");
        assertNotNull(url,"Dedicated disposable JDBC URL is required");
        assertTrue(url.startsWith("jdbc:postgresql://"),"Only PostgreSQL is supported");
        URI uri=URI.create(url.substring(5));
        assertTrue(Set.of("127.0.0.1","localhost").contains(uri.getHost()),"Only the loopback CI service is allowed");
        assertEquals("/woldeok_moneyverse_dev",uri.getPath(),"Unexpected disposable database");
        assertNull(uri.getUserInfo(),"Credentials must be separate settings");assertNull(uri.getQuery());
        String user=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_USER"),password=System.getenv("MONEYVERSE_MESSAGING_PG_TEST_PASSWORD");
        assertNotNull(user);assertNotNull(password);
        connection=DriverManager.getConnection(url,user,password);
        connection.setAutoCommit(false);
        jdbc=new JdbcTemplate(new SingleConnectionDataSource(connection,true));
        actor=UUID.randomUUID();peer=UUID.randomUUID();outsider=UUID.randomUUID();
        jdbc.update("INSERT INTO public.users(id) VALUES (?::uuid),(?::uuid),(?::uuid)",actor,peer,outsider);
        conversation=jdbc.queryForObject("SELECT conversation_id FROM public.private_chat_open(?::uuid,?::uuid)",UUID.class,actor,peer);
        jdbc.execute("SET LOCAL ROLE moneyverse_app");
        assertEquals("moneyverse_app",jdbc.queryForObject("SELECT current_user",String.class));
        support=new SupportService(jdbc);chat=new ChatService(jdbc);
    }
    @AfterEach void rollbackFixture() throws Exception {
        if(connection!=null)try { connection.rollback(); } finally { connection.close(); }
    }
    void status(int expected,Runnable action) {
        assertEquals(expected,assertThrows(ResponseStatusException.class,action::run).getStatusCode().value());
    }
    ThreadCreateResponse thread() {
        return support.createThread(actor,new NewThreadRequest(UUID.randomUUID().toString(),"Synthetic CI support","Synthetic initial message"));
    }
    @Test void supportCreationReplaysTheStoredThreadWithoutADuplicate() {
        String key=UUID.randomUUID().toString(),body="😀".repeat(1000);
        var request=new NewThreadRequest(key,"Synthetic CI support",body);
        var first=support.createThread(actor,request);var replay=support.createThread(actor,request);
        assertEquals(first.thread().id(),replay.thread().id());assertEquals(actor,first.thread().userId());
        assertEquals("Synthetic CI support",first.thread().subject());assertNotNull(first.thread().createdAt());
        assertEquals(1,support.listThreads(actor,null).threads().size());
        var history=support.listMessages(actor,first.thread().id());
        assertEquals(1,history.messages().size());assertEquals(body,history.messages().get(0).body());
    }
    @Test void supportChangedIntentCannotRelabelTheOriginalReceipt() {
        String key=UUID.randomUUID().toString();
        support.createThread(actor,new NewThreadRequest(key,"Original subject","Original body"));
        status(409,()->support.createThread(actor,new NewThreadRequest(key,"Changed subject","Changed body")));
    }
    @Test void supportReplyReplaysAnExactOwnerScopedStoredReceipt() {
        UUID id=thread().thread().id();var request=new NewMessageRequest(UUID.randomUUID().toString(),"Synthetic reply");
        var first=support.addMessage(actor,id,request);var replay=support.addMessage(actor,id,request);
        assertEquals(first.message().id(),replay.message().id());assertEquals(id,first.message().threadId());
        assertEquals(actor,first.message().senderUserId());assertEquals("Synthetic reply",first.message().body());
        assertEquals(2,support.listMessages(actor,id).messages().size());
    }
    @Test void supportForeignOwnerCannotReadThreadMessages() {
        UUID id=thread().thread().id();
        status(403,()->support.listMessages(outsider,id));
    }
    @Test void directMessageReplaysOneCanonicalSequenceAndHistoryReceipt() {
        var request=new SendMessageRequest("Synthetic direct message",UUID.randomUUID().toString());
        var first=chat.sendMessage(actor,conversation,request);var replay=chat.sendMessage(actor,conversation,request);
        assertEquals(first.message().id(),replay.message().id());assertEquals("1",first.message().sequence());
        var history=chat.listMessages(actor,conversation,50);
        assertEquals(1,history.messages().size());assertEquals(first.message().id(),history.messages().get(0).id());
        assertEquals("1",history.messages().get(0).sequence());
        assertEquals(peer,chat.listConversations(actor,50).conversations().get(0).peerUserId());
        assertEquals(1,chat.totalUnreadCount(peer));
    }
    @Test void directMessageChangedRetryBodyIsRefused() {
        String key=UUID.randomUUID().toString();chat.sendMessage(actor,conversation,new SendMessageRequest("Original",key));
        status(409,()->chat.sendMessage(actor,conversation,new SendMessageRequest("Changed",key)));
    }
    @Test void outsiderCannotSendIntoAnotherMembersConversation() {
        status(403,()->chat.sendMessage(outsider,conversation,new SendMessageRequest("Synthetic",UUID.randomUUID().toString())));
    }
    @Test void largeSequenceSurvivesTheActualDatabaseAndJsonBoundary() throws Exception {
        // Only the privileged fixture principal seeds sequence geometry, before resuming app role.
        jdbc.execute("RESET ROLE");
        jdbc.update("UPDATE public.private_chat_conversations SET latest_sequence=9007199254740992 WHERE id=?::uuid",conversation);
        jdbc.update("UPDATE public.private_chat_participant_state SET last_read_sequence=9007199254740992 WHERE conversation_id=?::uuid",conversation);
        jdbc.execute("SET LOCAL ROLE moneyverse_app");
        var receipt=chat.sendMessage(actor,conversation,new SendMessageRequest("Large sequence",UUID.randomUUID().toString()));
        assertEquals("9007199254740993",receipt.message().sequence());
        assertEquals("9007199254740993",chat.listMessages(actor,conversation,50).messages().get(0).sequence());
        var json=new ObjectMapper().findAndRegisterModules().valueToTree(receipt).at("/message/sequence");
        assertTrue(json.isTextual());assertEquals("9007199254740993",json.textValue());
    }
    @Test void actualServiceFunctionsDoNotRequireRawTablePrivileges() {
        for(String table:new String[]{"support_threads","support_messages","private_chat_conversations","private_chat_messages","private_chat_participant_state"}) {
            for(String privilege:new String[]{"SELECT","INSERT","UPDATE","DELETE"})
                assertEquals(Boolean.FALSE,jdbc.queryForObject("SELECT has_table_privilege(current_user,?::text,?::text)",Boolean.class,"public."+table,privilege));
        }
    }
}
