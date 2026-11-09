import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBlogAutoPublicationJob } from './blog-auto-publication';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';

const now=new Date('2026-11-09T22:45:00+09:00');
const slot=selectTwoHourBlogSlot(new Date('2026-11-09T22:00:00+09:00'))!;
const sample={title:'程序开发基础与网络数据结构详细学习指南',
  excerpt:'人工智能自动生成教育文章。数据与事实尚未独立核实，读者自行检查。',
  content:'## 原理\n'+'技术知识与网络结构需要实际验证。'.repeat(90)};
const source={url:'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript',digest:'f'.repeat(64),excerpt:'Source details '};
afterEach(()=>vi.unstubAllEnvs());
describe('unverified automatic publication decision',()=>{
 it('publishes a failed-quality article only to unverified audit storage, never verified DB',async()=>{
  vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED','true');
  vi.stubEnv('BLOG_UNVERIFIED_PUBLICATION_ENABLED','true');
  const publish=vi.fn();
  const repo={currentPeriod:vi.fn().mockResolvedValue(null),digests:vi.fn().mockResolvedValue(new Set()),publish};
  const store=vi.fn().mockReturnValue({inserted:true,status:'PUBLISHED',slug:'2026-11-09-cn-coding-9-unverified'});
  const run=createBlogAutoPublicationJob(repo as never,()=>{},()=>now,{
    readUnverified:vi.fn().mockReturnValue([]),readSource:vi.fn().mockResolvedValue(source),
    generate:vi.fn().mockResolvedValue(sample),
    check:vi.fn().mockReturnValue({eligible:false,reasons:['NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF'],digest:'c'.repeat(64)}),
    publishUnverified:store,
  });
  const result=await run();
  expect(result).toMatchObject({periodKey:slot.periodKey,status:'PUBLISHED',verificationState:'UNVERIFIED',inserted:true});
  expect(result).not.toHaveProperty('receipt');
  expect(store).toHaveBeenCalledOnce();
  expect(store.mock.calls[0][0].periodKey).toBe(slot.periodKey);
  expect(publish).not.toHaveBeenCalled();
 });
 it("won't publish failed-quality text when explicit unverified policy is OFF",async()=>{
  vi.stubEnv('BLOG_TWO_HOUR_PUBLISHER_ENABLED','true');
  vi.stubEnv('BLOG_UNVERIFIED_PUBLICATION_ENABLED','false');
  const publish=vi.fn();const store=vi.fn();
  const repo={currentPeriod:vi.fn().mockResolvedValue(null),digests:vi.fn().mockResolvedValue(new Set()),publish};
  const run=createBlogAutoPublicationJob(repo as never,()=>{},()=>now,{
    readUnverified:vi.fn().mockReturnValue([]),readSource:vi.fn().mockResolvedValue(source),
    generate:vi.fn().mockResolvedValue(sample),
    check:vi.fn().mockReturnValue({eligible:false,reasons:['NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF'],digest:'c'.repeat(64)}),
    publishUnverified:store,
  });
  await expect(run()).rejects.toThrow('ARTICLE_QUALITY_HOLD');
  expect(publish).not.toHaveBeenCalled();expect(store).not.toHaveBeenCalled();
 });
});
