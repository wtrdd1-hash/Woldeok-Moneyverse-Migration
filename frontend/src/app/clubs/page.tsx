import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { clubDirectoryHref, parseClubDirectoryResponse, type VerifiedClub } from './club-directory-evidence';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '클럽·협동조합',
  description: '회원들과 협동조합을 결성하고, WLD 협동 펀딩으로 거점 랜드마크와 아카이브를 구축하세요.',
  robots: { index: false, follow: false },
};

export default async function ClubsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly search?: string; readonly offset?: string }>;
}) {
  await requireMember();
  const params = await searchParams;
  const searchQuery = typeof params.search === 'string' ? params.search.trim().slice(0, 80) : '';
  const rawOffset = params.offset ?? '0';
  const validOffset = typeof rawOffset === 'string' && /^(0|[1-9][0-9]*)$/.test(rawOffset) &&
    Number.isSafeInteger(Number(rawOffset)) && Number(rawOffset) <= 10000 && Number(rawOffset) % 50 === 0;
  const offset = validOffset ? Number(rawOffset) : 0;
  let clubs: VerifiedClub[] | null = null;
  if (validOffset) {
    try {
      const response: unknown = await api(`/api/v1/clubs?${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ''}limit=50&offset=${offset}`);
      clubs = parseClubDirectoryResponse(response);
    } catch {
      // A failed owner-scoped API read is not proof that the member has no clubs.
    }
  }
  const myClubs = clubs?.filter((c) => c.is_my_club) ?? [];
  const otherClubs = clubs?.filter((c) => !c.is_my_club) ?? [];
  const nextPage = clubs !== null && clubs.length === 50 && offset < 10000;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <PageHeader eyebrow="클럽·협동조합" title="클럽·협동조합 경제 포털">
        <p>
          실제 서버에서 확인한 클럽을 탐색하세요. 클럽 창설은 원장 기반 결제 영수증 검증이 완료될 때까지 중단됩니다.
        </p>
      </PageHeader>

      {/* 액션 바 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-card border border-border rounded-xl p-4 shadow-sm">
        <form method="GET" action="/clubs" role="search" className="flex-1 flex min-w-0 gap-2">
          <label htmlFor="club-search" className="sr-only">클럽 이름 또는 태그 검색</label>
          <input
            type="text"
            id="club-search"
            name="search"
            maxLength={80}
            defaultValue={searchQuery}
            placeholder="클럽 이름 또는 고유 태그로 검색..."
            className="min-w-0 flex-1 bg-muted/50 border border-input rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="min-h-11 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium px-4 py-2 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            검색
          </button>
        </form>

        <p role="status" className="text-sm text-muted-foreground sm:max-w-48">
          신규 클럽 창설은 결제 영수증 검증 전까지 이용할 수 없습니다.
        </p>
      </div>

      {clubs === null ? (
        <section role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 space-y-3">
          <p className="font-semibold">클럽 목록을 확인할 수 없습니다.</p>
          <p className="text-sm text-muted-foreground">서버 응답을 검증하지 못했습니다. 소속 클럽이 없다는 의미는 아닙니다.</p>
          <Link href={clubDirectoryHref(searchQuery, offset)} className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">다시 조회</Link>
        </section>
      ) : (
      <>
      {/* 내가 소속된 클럽 섹션 */}
      {myClubs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            
            <h2 className="text-xl font-bold tracking-tight">내가 소속된 클럽</h2>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
              {myClubs.length}개
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </section>
      )}

      {/* 탐색 가능한 전체 클럽 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <h2 className="text-xl font-bold tracking-tight">
              {myClubs.length > 0 ? '다른 클럽 둘러보기' : '전체 클럽 목록'}
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            현재 페이지의 다른 클럽 {otherClubs.length}개
          </span>
        </div>

        {otherClubs.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl space-y-3">
            
            <p className="text-muted-foreground font-medium">
              {searchQuery ? `'${searchQuery}' 검색 결과가 없습니다.` : '아직 등록된 다른 클럽이 없습니다.'}
            </p>
            <p className="text-xs text-muted-foreground">
              검색어를 바꾸거나 다른 페이지에서 실제 클럽을 확인해 주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </section>
      <nav aria-label="클럽 목록 페이지" className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <span className="text-sm text-muted-foreground">현재 {Math.floor(offset / 50) + 1}페이지 · 확인된 {clubs.length}개 항목 (전체 수 아님)</span>
        <div className="flex gap-2">
          {offset > 0 && <Link href={clubDirectoryHref(searchQuery, offset - 50)} className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">이전 페이지</Link>}
          {nextPage && <Link href={clubDirectoryHref(searchQuery, offset + 50)} className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">다음 페이지</Link>}
        </div>
      </nav>
      </>
      )}
    </div>
  );
}

function ClubCard({ club }: { readonly club: VerifiedClub }) {
  return (
    <div className="flex flex-col bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all shadow-sm group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
              [{club.tag}]
            </span>
            <h3 className="font-bold text-base group-hover:text-primary transition-colors">
              {club.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">클럽장: {club.owner_name}</p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            Lv.{club.level}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
        {club.description || '작성된 소개글이 없습니다.'}
      </p>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{club.member_count.toLocaleString()}명</span>
          <span>⭐ {BigInt(club.experience).toLocaleString('ko-KR')} EXP</span>
        </div>

        {club.is_my_club ? (
          <Link
            href={`/clubs/${club.id}`}
            className="bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-3 py-1.5 rounded-lg transition-colors text-xs"
          >
            클럽하우스 입장 →
          </Link>
        ) : (
          <Link
            href={`/clubs/${club.id}`}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium px-3 py-1.5 rounded-lg transition-colors text-xs"
          >
            상세 보기
          </Link>
        )}
      </div>
    </div>
  );
}
