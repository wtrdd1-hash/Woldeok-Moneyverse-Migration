package com.moneyverse.api.domain.support.service;

import com.moneyverse.api.domain.support.dto.SupportDtos.*;
import com.moneyverse.api.domain.messaging.MessageContract;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class SupportService {
    private final JdbcTemplate jdbcTemplate;
    private static final Set<String> STATES=Set.of("open","waiting_user","resolved");
    public SupportService(JdbcTemplate jdbcTemplate) { this.jdbcTemplate=jdbcTemplate; }
    private static String state(String state) {
        if(state==null||!STATES.contains(state))throw MessageContract.unavailable();
        return state;
    }
    private static SupportThreadItem thread(Map<String,Object> row,UUID actor) {
        if(!(row.get("subject") instanceof String subject)||subject.isBlank())throw MessageContract.unavailable();
        if(!(row.get("updated_at") instanceof Timestamp updated)||!(row.get("last_message_at") instanceof Timestamp last))
            throw MessageContract.unavailable();
        return new SupportThreadItem(MessageContract.receiptId(row,"thread_id"),actor,subject,state((String)row.get("status")),
            MessageContract.receiptDate(row),MessageContract.date(updated),MessageContract.date(last));
    }
    private List<SupportThreadItem> recentOwnerThreads(UUID actor) {
        return jdbcTemplate.query("""
            SELECT thread_id, subject, status, created_at, updated_at, last_message_at
            FROM public.support_my_threads(?::uuid, 100)
            """,(rs,n)->{
                UUID id=(UUID)rs.getObject("thread_id");String subject=rs.getString("subject");
                if(id==null||subject==null||subject.isBlank())throw MessageContract.unavailable();
                return new SupportThreadItem(id,actor,subject,state(rs.getString("status")),
                    MessageContract.date(rs.getTimestamp("created_at")),MessageContract.date(rs.getTimestamp("updated_at")),
                    MessageContract.date(rs.getTimestamp("last_message_at")));
            },actor);
    }
    public ThreadListResponse listThreads(UUID actor,String status) {
        MessageContract.actor(actor);
        if(status!=null&&!status.isBlank()&&!STATES.contains(status))throw MessageContract.invalid("INVALID_THREAD_STATUS");
        try {
            List<SupportThreadItem> items=recentOwnerThreads(actor).stream()
                .filter(item->status==null||status.isBlank()||status.equals(item.status())).limit(50).toList();
            return new ThreadListResponse(true,items,items.size());
        } catch(Exception error) { throw MessageContract.failure(error); }
    }
    /** This is a recent-100 owner sample, not an all-time total. */
    public ThreadSummaryResponse summary(UUID actor) {
        MessageContract.actor(actor);
        try {
            List<SupportThreadItem> recent=recentOwnerThreads(actor);
            return new ThreadSummaryResponse(true,recent.size(),
                (int)recent.stream().filter(x->"open".equals(x.status())).count(),
                (int)recent.stream().filter(x->"waiting_user".equals(x.status())).count(),
                (int)recent.stream().filter(x->"resolved".equals(x.status())).count());
        } catch(Exception error) { throw MessageContract.failure(error); }
    }
    @Transactional
    public ThreadCreateResponse createThread(UUID actor,NewThreadRequest request) {
        MessageContract.actor(actor);
        if(request==null)throw MessageContract.invalid("INVALID_MESSAGE");
        UUID key=MessageContract.key(request.idempotencyKey());
        String subject=MessageContract.text(request.subject(),120,false);
        String body=MessageContract.text(request.body(),1000,false);
        try {
            Map<String,Object> result=jdbcTemplate.queryForMap(
                "SELECT thread_id,status,created_at FROM public.support_create_thread(?::uuid,?::uuid,?::text,?::text)",
                actor,key,subject,body);
            UUID id=MessageContract.receiptId(result,"thread_id");
            state((String)result.get("status"));MessageContract.receiptDate(result);
            // The legacy creation function replays by owner/key alone. Verify the
            // stored subject and initial body so a changed retry is never relabelled.
            Map<String,Object> stored=jdbcTemplate.queryForMap("""
                SELECT thread_id,subject,status,created_at,updated_at,last_message_at
                FROM public.support_my_threads(?::uuid,100) WHERE thread_id=?::uuid
                """,actor,id);
            SupportThreadItem item=thread(stored,actor);
            if(!id.equals(item.id()))throw MessageContract.unavailable();
            Map<String,Object> first=jdbcTemplate.queryForMap("""
                SELECT message_id,sender_kind,body,created_at
                FROM public.support_thread_messages(?::uuid,?::uuid,500)
                ORDER BY created_at ASC,message_id ASC LIMIT 1
                """,actor,id);
            MessageContract.receiptId(first,"message_id");MessageContract.receiptDate(first);
            if(!"user".equals(first.get("sender_kind")))throw MessageContract.unavailable();
            if(!subject.equals(item.subject())||!body.equals(first.get("body")))
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,"MESSAGE_REQUEST_REFUSED");
            return new ThreadCreateResponse(true,item);
        } catch(Exception error) { throw MessageContract.failure(error); }
    }
    public MessageListResponse listMessages(UUID actor,UUID threadId) {
        MessageContract.actor(actor);
        if(threadId==null)throw MessageContract.invalid("INVALID_THREAD");
        try {
            List<SupportMessageItem> rows=jdbcTemplate.query("""
                SELECT message_id,sender_kind,body,created_at
                FROM public.support_thread_messages(?::uuid,?::uuid,500)
                """,(rs,n)->{
                    UUID id=(UUID)rs.getObject("message_id");
                    String kind=rs.getString("sender_kind"),body=rs.getString("body");
                    if(id==null||body==null||!("user".equals(kind)||"admin".equals(kind)))throw MessageContract.unavailable();
                    return new SupportMessageItem(id,threadId,"user".equals(kind)?actor:null,kind,body,
                        MessageContract.date(rs.getTimestamp("created_at")));
                },actor,threadId);
            return new MessageListResponse(true,rows);
        } catch(Exception error) { throw MessageContract.failure(error); }
    }

    @Transactional
    public MessageCreateResponse addMessage(UUID actor,UUID threadId,NewMessageRequest request) {
        MessageContract.actor(actor);
        if(threadId==null||request==null)throw MessageContract.invalid("INVALID_THREAD");
        UUID key=MessageContract.key(request.idempotencyKey());
        String body=MessageContract.text(request.body(),1000,false);
        try {
            Map<String,Object> sent=jdbcTemplate.queryForMap(
                "SELECT message_id,sender_kind,body,created_at FROM public.support_add_message(?::uuid,?::uuid,?::uuid,?::text)",
                actor,key,threadId,body);
            UUID id=MessageContract.receiptId(sent,"message_id");
            if(!"user".equals(sent.get("sender_kind"))||!body.equals(sent.get("body")))throw MessageContract.unavailable();
            MessageContract.receiptDate(sent);
            Map<String,Object> stored=jdbcTemplate.queryForMap(
                "SELECT message_id,sender_kind,body,created_at FROM public.support_my_message_receipt(?::uuid,?::uuid,?::uuid)",
                actor,threadId,id);
            if(!id.equals(MessageContract.receiptId(stored,"message_id"))||!"user".equals(stored.get("sender_kind"))
                ||!body.equals(stored.get("body")))throw MessageContract.unavailable();
            return new MessageCreateResponse(true,new SupportMessageItem(id,threadId,actor,"user",body,
                MessageContract.receiptDate(stored)));
        } catch(Exception error) { throw MessageContract.failure(error); }
    }
}
