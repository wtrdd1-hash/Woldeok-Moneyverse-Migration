import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { parseClubJoinMode, verifiedClubJoinModeResult } from '@/lib/club-join-mode';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '클럽·협동조합',
  description: '회원들과 협동조합을 결성하고, WLD 협동 펀딩으로 거점 랜드마크와 아카이브를 구축하세요.',
  robots: { index: false, follow: false },
};

export interface ClubItem {
  readonly id: string;
  readonly tag: string;
  readonly name: string;
  readonly description: string;
  readonly owner_id: string;
  readonly owner_name: string;
  readonly join_mode: string;
  readonly status: string;
  readonly level: number;
  readonly experience: string;
  readonly member_count: number;
  readonly created_at: string;
  readonly is_my_club: boolean;
  readonly my_role: string | null;
}

export default async function ClubsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly search?: string | string[]; readonly joinMode?: string | string[] }>;
}) {
  await requireMember();
  const params = await searchParams;
  const joinMode = parseClubJoinMode(params.joinMode);
  const invalidQuery = joinMode === null || (params.search !== undefined && (typeof params.search !== 'string' || params.search.length > 80 || [...params.search].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)));
  const searchQuery = typeof params.search === 'string' ? params.search.trim().slice(0, 80) : '';
  const query = new URLSearchParams();
  if (searchQuery) query.set('search', searchQuery);
  if (joinMode && joinMode !== 'all') query.set('joinMode', joinMode);
  let result: { clubs: ClubItem[] } | null = null;
  if (!invalidQuery) {
    try {
      const response = await api<{ clubs: ClubItem[] }>(`/api/v1/clubs${query.size ? `?${query}` : ''}`);
      if (verifiedClubJoinModeResult(response, joinMode!)) result = response;
    } catch { /* An outage is not a verified empty directory. */ }
  }
  const clubs = result?.clubs ?? [];
  const myClubs = clubs.filter((c) => c.is_my_club);
  const otherClubs = clubs.filter((c) => !c.is_my_club);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <PageHeader eyebrow="클럽·협동조합" title="클럽·협동조합 경제 포털">
        <p>
          Pay-to-Win 없이 회원들과 순수한 소셜 협동을 이루고, 10,000 WLD 영구 소각 헌장으로 독자적인 클럽하우스를 개척하세요.
        </p>
      </PageHeader>

      {/* 액션 바 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-card border border-border rounded-xl p-4 shadow-sm">
        <form method="GET" action="/clubs" className="flex-1 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="클럽 이름 또는 고유 태그로 검색..."
            aria-label="클럽 이름 또는 태그"
            maxLength={80}
            className="flex-1 bg-muted/50 border border-input rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="club-join-mode" className="sr-only">가입 방식</label>
          <select id="club-join-mode" name="joinMode" defaultValue={joinMode ?? 'all'}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            aria-label="가입 방식 필터">
            <option value="all">모든 가입 방식</option>
            <option value="public">자유 가입</option>
            <option value="request">승인 요청</option>
            <option value="invite">초대 전용</option>
          </select>
          <button
            type="submit"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            검색
          </button>
        </form>

        <Link
          href="/clubs/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
        >
          
          <span>새 클럽 창설하기 (10,000 WLD)</span>
        </Link>
      </div>

      {invalidQuery ? (
        <p role="alert" className="rounded-lg border border-destructive p-4">가입 방식 또는 검색 조건이 올바르지 않습니다. 필터를 다시 선택해 주세요.</p>
      ) : result === null ? (
        <p role="alert" className="rounded-lg border border-destructive p-4">클럽 목록을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">현재 조건에서 조회한 최대 50개 클럽만 표시합니다. 전체 클럽 수가 아닙니다.</p>
      )}
      {result !== null && !invalidQuery && (
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
            현재 조회한 {otherClubs.length}개 클럽
          </span>
        </div>

        {otherClubs.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl space-y-3">
            
            <p className="text-muted-foreground font-medium">
              {searchQuery || joinMode !== 'all' ? '선택한 조건에 해당하는 다른 클럽이 없습니다.' : '현재 조회한 목록에 다른 클럽이 없습니다.'}
            </p>
            <p className="text-xs text-muted-foreground">
              첫 번째 창설자가 되어 헌장을 선포하고 협동 프로젝트를 시작해 보세요!
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
      </>
      )}
    </div>
  );
}

function ClubCard({ club }: { readonly club: ClubItem }) {
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
          <span>⭐ {BigInt(club.experience).toLocaleString()} EXP</span>
          <span>{club.join_mode === 'public' ? '자유 가입' : club.join_mode === 'request' ? '승인 요청' : '초대 전용'}</span>
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
