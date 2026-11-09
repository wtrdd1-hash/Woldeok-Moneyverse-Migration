import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';
import { publishUnverifiedArticle, readUnverifiedPosts, unverifiedStorePath } from './blog-unverified-store';

const tmp:string[]=[];
afterEach(()=>{vi.unstubAllEnvs();for(const dir of tmp.splice(0))fs.rmSync(dir,{recursive:true,force:true});});
const slot=selectTwoHourBlogSlot(new Date('2026-11-09T22:00:00+09:00'))!;
const draft={title:'程序开发基础与网络数据结构详细学习指南',excerpt:'由人工智能编写，仍需核实资料，供读者参考。',
  content:'## 前言\n'+ '学习程序和网络需要理解基础知识与相互关系。'.repeat(48)+'\n## 结论\n'+'技术的实际应用还需要独立检验。'.repeat(35)};
describe('unverified standalone publication (no DB fake receipt)',()=>{
 it('writes once atomically and never invents verification receipts',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'blog-u-'));tmp.push(dir);
  const file=path.join(dir,'posts.json');
  expect(readUnverifiedPosts(file)).toEqual([]);
  const first=publishUnverifiedArticle(slot,draft,['NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF'],file);
  expect(first).toMatchObject({inserted:true,status:'PUBLISHED'});
  const records=readUnverifiedPosts(file);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({verificationState:'UNVERIFIED',isAiGenerated:true,
    status:'PUBLISHED',periodKey:slot.periodKey,country:'CN'});
  expect(records[0]).not.toHaveProperty('verificationReceipt');
  expect(publishUnverifiedArticle(slot,draft,['OTHER'],file)).toMatchObject({inserted:false});
  expect(readUnverifiedPosts(file)).toHaveLength(1);
  expect(fs.statSync(file).mode & 0o777).toBe(0o600);
 });
 it('uses isolated test/production file paths and rejects unsafe source content',()=>{
  vi.stubEnv('BLOG_PUBLISHER_CHANNEL','test');
  expect(unverifiedStorePath()).toContain('test-posts.json');
  vi.stubEnv('BLOG_PUBLISHER_CHANNEL','production');
  expect(unverifiedStorePath()).not.toContain('test-posts.json');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'blog-u-'));tmp.push(dir);
  expect(()=>publishUnverifiedArticle(slot,{...draft,content:'<script>alert(1)</script>'},[],path.join(dir,'posts.json'))).toThrow('UNVERIFIED_CONTENT_UNSAFE');
 });
});
