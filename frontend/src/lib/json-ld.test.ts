import { describe, expect, it } from 'vitest';
import { jsonLd } from './json-ld';

describe('jsonLd', () => {
  it('keeps a closing tag from ending the script block', () => {
    const encoded = jsonLd({ name: '</script><img src=x onerror=alert(1)>' });
    expect(encoded).not.toContain('</script>');
    expect(encoded).not.toContain('<');
  });

  it('still parses back to the value a crawler should read', () => {
    const value = { '@type': 'NewsArticle', headline: '공지 <b>중요</b>' };
    expect(JSON.parse(jsonLd(value))).toEqual(value);
  });

  it('leaves ordinary content alone', () => {
    expect(jsonLd({ a: 1 })).toBe('{"a":1}');
  });
});
