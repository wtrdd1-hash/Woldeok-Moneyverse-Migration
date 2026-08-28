/**
 * Serialises structured data for a `<script type="application/ld+json">`.
 *
 * `JSON.stringify` escapes what JSON needs escaped, which is not what HTML
 * needs: it leaves `<` alone, so a value containing `</script>` closes the
 * block early and everything after it is parsed as markup. The values here
 * are operator-authored announcement titles rather than anything a visitor
 * can set, so this is a narrow hole — but it is a hole, and the fix is one
 * substitution.
 *
 * `<` is the same character to a JSON parser and inert to an HTML one,
 * so the crawler reads exactly what was meant and the tokeniser never sees a
 * tag.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
