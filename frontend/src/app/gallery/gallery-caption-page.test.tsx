import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { publicApi } from '@/lib/api';
import GalleryPage, { generateMetadata } from './page';
vi.mock('@/lib/api',()=>({publicApi:vi.fn()}));
vi.mock('@/components/public-advertisement',()=>({PublicAdvertisement:()=>null}));
vi.mock('@/components/translated-text',()=>({TranslatedText:({korean}:{korean:string})=>korean}));
it('shows accessible search and noindex for search results',async()=>{
  vi.mocked(publicApi).mockResolvedValue({photos:[{photoId:'2e090c86-3cd8-47ca-b7db-4be7d7b8daad',imageUrl:'/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg',altText:'제주 바다',publishedAt:null}],query:'제주',scope:'latest_24_published'});
  const html=renderToStaticMarkup(await GalleryPage({searchParams:Promise.resolve({q:'제주'})}));
  expect(html).toContain('role="search"');expect(html).toContain('전체 사진 검색이 아닙니다');
  expect(await generateMetadata({searchParams:Promise.resolve({q:'제주'})})).toMatchObject({robots:{index:false}});
});
