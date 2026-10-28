import { describe, expect, it, vi } from 'vitest';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';
import { retrievePrimarySource, extractPrimarySourceText, sourceUrlFor } from './blog-primary-sources';
import { checkOriginalArticle, type OriginalArticle } from './blog-original-quality';
import { authorVerifiedArticle, generateLocalOriginalArticle } from './blog-original-author';

const slot = selectTwoHourBlogSlot(new Date('2026-10-27T04:00:00+09:00'))!;
const source = { url:sourceUrlFor(slot), digest:'a'.repeat(64), excerpt:'Official reference data ' + 'protocol '.repeat(500) };
const nativeBody = {
  KR:'정보를 처리할 때 맥락을 확인합니다. ',
  US:'Computer systems explain the important relationship between reliable protocols and system design. ',
  JP:'ネットワークの仕組みについて基本的な仕組みを確認します。 ',
  CN:'计算机网络通信的原理需要根据可靠来源理解。 ',
};
function article(country: keyof typeof nativeBody, url = source.url): OriginalArticle {
  const t = nativeBody[country];
  return {
    title:t.repeat(4).slice(0,175),
    excerpt:t.repeat(5).slice(0,180),
    content:'## Introduction\n'+t.repeat(18)+'\n## Key concepts\n'+t.repeat(18)
      +'\n## Worked explanation\n'+t.repeat(18)+'\n## Reference\n'+url,
  };
}
describe('primary source provenance',()=>{
  it('chooses country and topic constrained first party pages',()=>{
    expect(sourceUrlFor(slot)).toMatch(/^https:\/\//);
    expect(extractPrimarySourceText('<script>evil</script><p>Trusted</p>')).toBe('Trusted');
  });
  it('rejects redirects, errors, suspicious mime types and short text',async()=>{
    const fail=vi.fn().mockResolvedValue(new Response('redirect',{status:302,headers:{'content-type':'text/html'}}));
    await expect(retrievePrimarySource(slot,fail)).rejects.toThrow('SOURCE_NOT_AVAILABLE');
    expect(fail.mock.calls[0]![1]).toMatchObject({redirect:'manual'});
    const short=vi.fn().mockImplementation(async()=>new Response('<p>short</p>',{status:200,headers:{'content-type':'text/html'}}));
    await expect(retrievePrimarySource(slot,short)).rejects.toThrow('SOURCE_SIZE_INVALID');
  });
  it('pins exact source URL and its content hash',async()=>{
    const load=vi.fn().mockImplementation(async()=>new Response('<div>' + 'documented official content '.repeat(130)+'</div>',
      {status:200,headers:{'content-type':'text/html'}}));
    const result=await retrievePrimarySource(slot,load);
    expect(result.url).toBe(source.url);
    expect(result.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(result.excerpt.length).toBeGreaterThan(700);
  });
});
describe('independent AI originality and locale gate',()=>{
  it('rejects ungrounded claims, invented URLs and duplicates',()=>{
    const draft=article(slot.country);
    const clean=checkOriginalArticle(draft,slot,source);
    expect(clean.reasons).not.toContain('PRIMARY_SOURCE_NOT_GROUNDED');
    expect(checkOriginalArticle({...draft,content:draft.content+' https://example.com/fake'},slot,source).reasons)
      .toContain('PRIMARY_SOURCE_NOT_GROUNDED');
    expect(checkOriginalArticle({...draft,excerpt:draft.excerpt+' Current exchange rate 4.5%'},slot,source).reasons)
      .toContain('NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF');
    expect(checkOriginalArticle(draft,slot,source,new Set([clean.digest])).reasons)
      .toContain('DUPLICATE_CONTENT');
  });
  it('never trusts the source or model to self certify publishing eligibility',async()=>{
    const fail=()=>Promise.resolve({...article(slot.country),content:'AI says verified'});
    await expect(authorVerifiedArticle(slot,fail,async()=>source)).rejects.toThrow('ARTICLE_QUALITY_HOLD');
  });
  it('rejects untrusted remote model endpoints',async()=>{
    await expect(generateLocalOriginalArticle(slot,source,{model:'x',endpoint:'http://attacker.test/collect'}))
      .rejects.toThrow('UNTRUSTED_AI_ENDPOINT');
  });
});
