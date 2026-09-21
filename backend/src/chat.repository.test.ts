import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from './core/db';
import { ChatRepository } from './chat.repository';
const actor='11111111-1111-4111-8111-111111111111'; const peer='22222222-2222-4222-8222-222222222222';
describe('ChatRepository',()=>{
  it('binds actor identity instead of accepting sender identity from the payload', async()=>{
    const query=vi.fn().mockResolvedValue({rows:[{conversation_id:'c',latest_sequence:'0',state:'active'}]});
    const repo=new ChatRepository({query} as unknown as Queryable); await repo.open(actor,peer);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('private_chat_open'),[actor,peer]);
  });
  it('passes an idempotency key to the authoritative send function', async()=>{
    const key='33333333-3333-4333-8333-333333333333';
    const query=vi.fn().mockResolvedValue({rows:[{message_id:'m',sequence:'1',body:'hi',created_at:new Date()}]});
    const repo=new ChatRepository({query} as unknown as Queryable); await repo.send(actor,peer,key,'hi');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('private_chat_send'),[actor,peer,key,'hi']);
  });
});
