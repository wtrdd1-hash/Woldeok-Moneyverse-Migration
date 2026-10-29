import { describe,expect,it } from 'vitest';
import { checkOriginalArticle } from './blog-original-quality';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';

const slot=selectTwoHourBlogSlot(new Date('2026-10-29T14:00:00+09:00'))!;
const source={url:'https://www.bok.or.kr/portal/main/main.do',digest:'a'.repeat(64),excerpt:'Official source '+ '금융시장 설명 '.repeat(200)};

function draft(content:string){
  return {
    title:'경제의 기본 원리와 금융 제도를 이해하는 실용적인 학습 가이드',
    excerpt:'경제 원리를 설명할 때는 출처에 근거한 정의를 검토하고 문장마다 의미와 맥락이 일치하는지 독립적으로 확인해야 합니다. 금융 용어의 의미를 혼동해서는 안 됩니다.',
    content,
  };
}
describe('post-generation independent localization and repetition quality gate',()=>{
  it('rejects repeating nonsense despite valid source URL and long body',()=>{
    const sentence='금융의 역할은 자본을 제공하는 경제 활동을 의미하며 자금을 제공하는 것을 의미합니다.';
    const content='## 핵심 개념\n'+Array.from({length:12},()=>sentence).join(' ')+
      '\n## 동작 원리\n'+Array.from({length:12},()=>sentence).join(' ')+
      '\n## 실제 이해\n'+Array.from({length:12},()=>sentence).join(' ')+
      '\n## 공식 자료\n'+source.url;
    expect(checkOriginalArticle(draft(content),slot,source).reasons)
      .toContain('REPETITIVE_SYNTHETIC_SENTENCES');
  });
  it('rejects mixed-language word salad that passed native-script thresholds',()=>{
    const content='## 핵심 개념\n'+('한국은행은 경제 상황을 이해합니다. ').repeat(24)+
      '\n## 역할\n'+('conceptual model and financial role is growth. ').repeat(16)+
      '\n## 동작\n'+('대출의 개념을 정확히 설명해야 합니다. ').repeat(16)+
      '\n## 출처\n'+source.url;
    const reasons=checkOriginalArticle(draft(content),slot,source).reasons;
    expect(reasons).toContain('UNNATURAL_MIXED_LANGUAGE');
  });
  it('rejects non-Korean-script intrusions inside Korean economic articles',()=>{
    const content='## 핵심\n'+('올바른 한국어 문장으로 경제를 설명합니다. ').repeat(20)+
      '\n## 정의\n'+('เงินไทย ไม่ควรอยู่ในเกาหลี ').repeat(12)+
      '\n## 이해\n'+('경제의 중요한 내용을 검증합니다. ').repeat(16)+
      '\n## 출처\n'+source.url;
    expect(checkOriginalArticle(draft(content),slot,source).reasons)
      .toContain('FOREIGN_LANGUAGE_INTRUSION');
  });
});
