import React from 'react';

const FENCE = String.fromCharCode(96).repeat(3);
const SAFE_IMAGE = /^\/images\/blog\/[a-zA-Z0-9._/-]+\.(?:png|webp|jpg|jpeg|svg)$/;

function inlineMarkdown(text: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const nodes: React.ReactNode[] = [];
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > offset) nodes.push(text.slice(offset, index));
    const token = match[0];
    const key = 'inline-' + index;
    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const url = (link[2] ?? '').trim();
        // External links may only use HTTPS. Relative links are same-origin only.
        const valid = /^https:\/\/[^\s<>"']+$/i.test(url)
          || /^\/(?!\/)[a-zA-Z0-9/_#?=&.%+-]+$/.test(url);
        nodes.push(valid
          ? <a key={key} href={url} rel="noopener noreferrer" className="underline underline-offset-2">{link[1]}</a>
          : <React.Fragment key={key}>{link[1]}</React.Fragment>);
      }
    }
    offset = index + token.length;
  }
  if (offset < text.length) nodes.push(text.slice(offset));
  return nodes;
}

const isHeading = (value: string) => /^#{1,3}\s+/.test(value);
const isTable = (value: string) => value.startsWith('|') && value.endsWith('|');
const isQuote = (value: string) => value.startsWith('> ');
const isList = (value: string) => /^([-*+]\s+|\d+[.)]\s+)/.test(value);
const isImage = (value: string) => /^!\[([^\]]*)\]\(([^)]+)\)$/.test(value);
const isRule = (value: string) => /^([-*_])(?:\s*\1){2,}$/.test(value);

function isBlockStart(value: string): boolean {
  return value.startsWith(FENCE) || isHeading(value) || isTable(value)
    || isQuote(value) || isList(value) || isImage(value) || isRule(value);
}

function cells(row: string): string[] {
  // Legacy tables use simple unescaped pipe-delimited financial numbers.
  return row.slice(1, -1).split('|').map(v => v.trim());
}

function isAlignment(row: string): boolean {
  return isTable(row) && cells(row).every(cell => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')));
}

/**
 * Renders the supported Markdown subset as React elements only.
 * No raw HTML or dangerouslySetInnerHTML: historical user/AI text is untrusted.
 * Parses headings, pipe tables and adjacent blocks by line, not \n\n paragraphs.
 */
export function renderBlogMarkdownBlocks(content: string): React.ReactElement[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: React.ReactElement[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? '').trim();
    if (!line) { i++; continue; }
    const key = 'body-' + i;

    if (line.startsWith(FENCE)) {
      const start = ++i;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith(FENCE)) i++;
      blocks.push(
        <pre key={key} className="overflow-x-auto rounded-lg border border-border/60 bg-zinc-950/80 p-3 text-xs">
          <code>{lines.slice(start, i).join('\n')}</code>
        </pre>,
      );
      if (i < lines.length) i++;
      continue;
    }

    if (isHeading(line)) {
      const match = /^(#{1,3})\s+(.+)$/.exec(line)!;
      const label = inlineMarkdown((match[2] ?? ''));
      if ((match[1] ?? '').length === 1) {
        blocks.push(<h2 key={key} className="text-xl sm:text-2xl font-black text-foreground pt-4 pb-1">{label}</h2>);
      } else if ((match[1] ?? '').length === 2) {
        blocks.push(<h2 key={key} className="text-xl sm:text-2xl font-black text-foreground pt-4 pb-1 border-b border-border/50">{label}</h2>);
      } else {
        blocks.push(<h3 key={key} className="text-base sm:text-lg font-bold text-foreground pt-2">{label}</h3>);
      }
      i++; continue;
    }

    if (isTable(line)) {
      const rows: string[] = [];
      while (i < lines.length && isTable((lines[i] ?? '').trim())) rows.push((lines[i++] ?? '').trim());
      const header = cells(rows[0] ?? '||');
      const body = rows.slice(1).filter(row => !isAlignment(row)).map(cells);
      blocks.push(
        <div key={key} className="max-w-full overflow-x-auto my-4 rounded-xl border border-border/60" role="region" aria-label="Article data table" tabIndex={0}>
          <table className="w-full min-w-[420px] text-xs text-left border-collapse">
            <thead><tr className="bg-muted/60 border-b border-border">
              {header.map((cell, col) => <th key={col} scope="col" className="p-3 min-w-[110px] align-top font-bold">{inlineMarkdown(cell)}</th>)}
            </tr></thead>
            <tbody>
              {body.map((row, rowIndex) =>
                <tr key={rowIndex} className="border-b border-border/40">
                  {row.map((cell, col) => <td key={col} className="p-3 align-top break-words">{inlineMarkdown(cell)}</td>)}
                </tr>,
              )}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (isQuote(line)) {
      const quoted: string[] = [];
      while (i < lines.length && isQuote((lines[i] ?? '').trim())) quoted.push((lines[i++] ?? '').trim().slice(2));
      blocks.push(<blockquote key={key} className="rounded-lg border-l-4 border-blue-500 bg-muted/30 p-3.5 italic text-muted-foreground">{inlineMarkdown(quoted.join(' '))}</blockquote>);
      continue;
    }

    if (isList(line)) {
      const ordered = /^\d+[.)]\s+/.test(line);
      const entries: string[] = [];
      while (i < lines.length && isList((lines[i] ?? '').trim()) && (/^\d+[.)]\s+/.test((lines[i] ?? '').trim()) === ordered)) {
        entries.push((lines[i++] ?? '').trim().replace(/^([-*+]\s+|\d+[.)]\s+)/, '').replace(/^\[[x ]\]\s*/i, ''));
      }
      const children = entries.map((entry, index) => <li key={index}>{inlineMarkdown(entry)}</li>);
      blocks.push(ordered
        ? <ol key={key} className="list-decimal pl-6 space-y-1">{children}</ol>
        : <ul key={key} className="list-disc pl-6 space-y-1">{children}</ul>);
      continue;
    }

    if (isImage(line)) {
      const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line)!;
      const src = (image[2] ?? '').trim();
      if (SAFE_IMAGE.test(src) && !src.includes('..')) {
        blocks.push(
          <figure key={key} className="my-6 overflow-hidden rounded-2xl border border-border/70 bg-card/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={image[1]} loading="lazy" className="h-auto w-full object-contain" />
            {image[1] && <figcaption className="px-4 py-2 text-xs text-muted-foreground">{image[1]}</figcaption>}
          </figure>,
        );
      } else {
        blocks.push(<p key={key} className="text-xs text-muted-foreground">{image[1]}</p>);
      }
      i++; continue;
    }

    if (isRule(line)) {
      blocks.push(<hr key={key} className="border-border/60 my-5" />);
      i++; continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && (lines[i] ?? '').trim() && (paragraph.length === 0 || !isBlockStart((lines[i] ?? '').trim()))) {
      paragraph.push((lines[i++] ?? '').trim());
    }
    blocks.push(<p key={key} className="leading-relaxed text-foreground/80 break-words">{inlineMarkdown(paragraph.join(' '))}</p>);
  }
  return blocks;
}
