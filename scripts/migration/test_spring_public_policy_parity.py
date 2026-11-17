"""Static Next source-to-Thymeleaf literal-text parity checks for public legal documents."""
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'frontend/src/components/policy'
TPL = ROOT / 'spring-backend/src/main/resources/templates/spring-policy'

class DocumentText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text = []
        self.links = []
        self.headers = []
        self.inside_article = 0
    def handle_starttag(self, tag, attrs):
        if tag == 'article':
            self.inside_article += 1
        if self.inside_article:
            if tag == 'a':
                d = dict(attrs)
                self.links.append(d.get('href'))
            if tag in ('h2', 'h3'):
                self.headers.append(tag)
    def handle_endtag(self, tag):
        if tag == 'article':
            self.inside_article -= 1
    def handle_data(self, data):
        if self.inside_article and data.strip():
            self.text.append(' '.join(data.split()))

def extract_policy(name, locale):
    # Original JSX is a static bilingual component. Only React Link and className are used.
    import re
    s = (SRC / f'{name}-document.tsx').read_text(encoding='utf8')
    matches = re.findall(r'<article\b[\s\S]*?</article>', s)
    assert len(matches) == 2, (name, len(matches))
    block = matches[0 if locale == 'en' else 1]
    return (block.replace('<Link ', '<a ').replace('</Link>', '</a>')
                 .replace('className=', 'class=').replace('tabIndex={0}', 'tabindex="0"'))

class TestSpringPolicyParity(unittest.TestCase):
    def test_all_source_text_nodes_and_hrefs_survive_in_java_ssr_templates(self):
        for name in ('terms', 'privacy'):
            for locale in ('en', 'ko'):
                with self.subTest(name=name, locale=locale):
                    source = DocumentText(); source.feed(extract_policy(name, locale))
                    output = DocumentText(); output.feed((TPL / f'{name}-{locale}.html').read_text('utf8'))
                    self.assertEqual(source.text, output.text)
                    self.assertEqual(source.links, output.links)
                    self.assertEqual(source.headers, output.headers)
                    self.assertGreater(len(source.text), 20)

    def test_templates_retain_canonical_metadata_and_semantic_structure(self):
        for name in ('terms', 'privacy'):
            for locale in ('en', 'ko'):
                html = (TPL / f'{name}-{locale}.html').read_text('utf8')
                self.assertIn(f'<html lang="{locale}"', html)
                self.assertIn(f'href="https://easy-scraping.com/{name}"', html)
                self.assertIn(f'/spring-policy/policy.css', html)
                self.assertIn('<main id="content" ', html)
                self.assertNotIn('<script', html.lower())
                self.assertNotIn('페이지를 불러오는 중입니다', html)

if __name__ == '__main__': unittest.main()
