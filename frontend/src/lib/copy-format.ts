import type { Copy } from './copy';

/**
 * Fills `{name}` placeholders in every locale of a copy entry. Values are inserted verbatim, so a
 * figure already formatted with groupDigits stays exactly as formatted; the Korean result is
 * byte-identical to the template literal it replaced.
 */
export function fill(copy: Copy, values: Readonly<Record<string, string | number>>): Copy {
  const apply = (text: string) =>
    text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
  return { ko: apply(copy.ko), en: apply(copy.en), ja: apply(copy.ja), zh: apply(copy.zh), vi: apply(copy.vi) };
}

/**
 * A copy entry as `<TranslatedText>` props, for server components that must not read the request
 * locale (a static or ISR page) and so hand the choice to the client.
 */
export function textProps(copy: Copy) {
  return { korean: copy.ko, english: copy.en, japanese: copy.ja, chinese: copy.zh, vietnamese: copy.vi };
}
