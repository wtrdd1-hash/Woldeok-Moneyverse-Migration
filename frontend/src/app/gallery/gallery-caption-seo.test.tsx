import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { generateMetadata } from './page';
import GalleryPage from './page';

vi.mock('@/lib/api', () => ({ publicApi: vi.fn(async () => ({ photos: [] })) }));

describe('gallery caption sort accessibility and SEO', () => {
  it('does not index sorted query pages while preserving canonical gallery', async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({ sort: 'caption' }) });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(metadata.alternates).toHaveProperty('canonical');
    expect((await generateMetadata({ searchParams: Promise.resolve({}) })).robots).toMatchObject({ index: true });
  });
  it('renders keyboard-accessible sort links and accurately bounded scope', async () => {
    const markup = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({ sort: 'caption' }) }));
    expect(markup).toContain('aria-label="사진 정렬"');
    expect(markup).toContain('href="/gallery?sort=caption"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('최근 사진 24장');
  });
});
