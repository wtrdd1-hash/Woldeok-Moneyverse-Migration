import { describe, expect, it, vi } from 'vitest';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';
import { retrievePrimarySource, extractPrimarySourceText, sourceUrlFor } from './blog-primary-sources';
import { checkOriginalArticle, type OriginalArticle } from './blog-original-quality';
import { authorVerifiedArticle, generateLocalOriginalArticle } from './blog-original-author';
import { isAllowedSourceDocument } from './blog-source-discovery';

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
    const detail='<article><h1>Official guide</h1><p>'+ 'Trusted concepts '.repeat(70)+'</p></article>';
    const html='<nav>'+ 'unrelated global menu '.repeat(200)+'</nav>'+detail;
    const result=extractPrimarySourceText(html);
    expect(result).toContain('Official guide');
    expect(result).not.toContain('unrelated global menu');
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

describe('general network source selection',()=>{
  it('excludes isolated HTTP reference pages while retaining trusted HTTP guides',()=>{
    const cnSlot=selectTwoHourBlogSlot(new Date('2026-10-29T12:00:00+09:00'))!;
    const root='https://developer.mozilla.org/zh-CN/docs/Web/HTTP';
    expect(isAllowedSourceDocument(root+'/Reference/Status/421',root,cnSlot)).toBe(false);
    expect(isAllowedSourceDocument(root+'/Reference/Headers/Access-Control-Request-Method',root,cnSlot)).toBe(false);
    expect(isAllowedSourceDocument(root+'/Guides/Overview',root,cnSlot)).toBe(true);
  });
});

describe('short bounded local prose sections with authoritative metadata', () => {
  it('builds an independently checked article from short native-language sections', async()=>{
    let section=0;
    const client=vi.fn().mockImplementation(async (_endpoint:string,opts:RequestInit)=>{
      section++;
      const base=nativeBody[slot.country].trim().replace(/[.!?。]$/,'');
      const chunk=Array.from({length:8},(_,example)=>
        base+' in a distinct conceptual explanation about topic '+section+
        ' with an illustrative reasoning point '+(example+1)+'.').join(' ');
      const request=JSON.parse(String(opts.body));
      expect(request.stream).toBe(false);
      expect(request.options.num_predict).toBeLessThanOrEqual(500);
      expect(request.format).toBeUndefined();
      return new Response(JSON.stringify({message:{content:chunk},done_reason:'stop'}),{
        status:200,headers:{'content-type':'application/json'},
      });
    });
    const result=await generateLocalOriginalArticle(slot,source,{model:'llama3.2:3b',fetcher:client});
    expect(result.content).toContain(source.url);
    expect(result.content.length).toBeGreaterThanOrEqual(1400);
    expect(result.excerpt.length).toBeGreaterThanOrEqual(65);
    expect(result.title.length).toBeGreaterThanOrEqual(25);
    expect(client).toHaveBeenCalled();
    expect(client.mock.calls.length).toBeLessThanOrEqual(8);
  });
  it('fails closed on empty model output',async()=>{
    const client=vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message:{content:null},done_reason:'stop',
    }),{status:200}));
    await expect(generateLocalOriginalArticle(slot,source,{model:'gemma3:1b',fetcher:client}))
      .rejects.toThrow('MODEL_OUTPUT_INVALID');
  });
});
