import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldOff, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface VerifiedClub {
  readonly id: string;
  readonly name: string;
  readonly tag: string;
  readonly member_count: number;
  readonly is_my_club: boolean;
  readonly my_role: string | null;
  readonly status: string;
}

function isVerifiedClub(value: unknown): value is VerifiedClub {
  if (!value || typeof value !== 'object') return false;
  const club = value as Record<string, unknown>;
  return (
    typeof club.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(club.id) &&
    typeof club.name === 'string' &&
    typeof club.tag === 'string' &&
    typeof club.member_count === 'number' &&
    Number.isSafeInteger(club.member_count) &&
    club.member_count >= 0 &&
    typeof club.is_my_club === 'boolean' &&
    (club.my_role === null || typeof club.my_role === 'string') &&
    typeof club.status === 'string'
  );
}

async function verifiedClubs(): Promise<VerifiedClub[] | null> {
  try {
    // Only the authenticated club repository has authority over real memberships.
    const response = await api<{ clubs: unknown }>('/api/v1/clubs?limit=50');
    if (!Array.isArray(response.clubs) || !response.clubs.every(isVerifiedClub)) return null;
    return response.clubs;
  } catch {
    return null;
  }
}

function ClubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default async function WarfarePage() {
  await requireMember();
  const clubs = await verifiedClubs();
  const myClubs = clubs?.filter((club) => club.is_my_club) ?? [];
  const otherClubs = clubs?.filter((club) => !club.is_my_club) ?? [];

  return (
    <main data-page="club-warfare" className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Club operations / verified status</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">클럽 공성전 운영 상태</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          클럽 가입 정보는 실제 서버 기록으로 확인합니다. 영지 점령과 WLD 세금 배당은 별도의 검증된 원장이 필요합니다.
        </p>
      </header>

      <div role="status" className="flex items-start gap-3 border-l-4 border-amber-500 bg-amber-500/10 p-4 text-sm leading-6 text-foreground">
        <ShieldOff aria-hidden="true" className="mt-1 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">공성전 기능은 현재 이용할 수 없습니다.</p>
          <p>점령 기록, 실드 강화, WLD 세금 배당을 검증할 수 없어 공성전 선포와 배당 수령을 제공하지 않습니다. 거래 또는 지급이 완료된 것으로 표시하지 않습니다.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-6">
          <ClubSection title="서버에서 확인한 클럽">
            {clubs === null ? (
              <div role="alert" className="flex items-start gap-2 border border-destructive/30 p-4 text-sm text-foreground">
                <AlertTriangle aria-hidden="true" className="size-5 shrink-0 text-destructive" />
                <span>클럽 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요. 소속 여부를 추정하지 않습니다.</span>
              </div>
            ) : clubs.length === 0 ? (
              <p className="border border-border p-4 text-sm text-muted-foreground">가입하거나 만든 클럽이 없습니다. 클럽 목록에서 참여할 수 있습니다.</p>
            ) : (
              <>
                {myClubs.length > 0 && <p className="text-sm text-muted-foreground">내가 소속된 클럽 {myClubs.length}개</p>}
                <ul className="divide-y divide-border border-y border-border">
                  {[...myClubs, ...otherClubs].map((club) => (
                    <li key={club.id}>
                      <Link
                        href={`/clubs/${club.id}`}
                        className="flex min-h-12 items-center justify-between gap-3 px-2 py-3 text-sm outline-offset-2 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <span className="min-w-0">
                          <span className="block break-words font-semibold text-foreground">[{club.tag}] {club.name}</span>
                          <span className="block text-xs text-muted-foreground">회원 {club.member_count}명 · {club.is_my_club ? '내 클럽' : '클럽 둘러보기'}</span>
                        </span>
                        <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </ClubSection>
        </div>

        <aside className="space-y-3 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-label="이용 가능한 클럽 기능">
          <Users aria-hidden="true" className="size-6 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">지금 이용할 수 있는 기능</h2>
          <p className="text-sm leading-6 text-muted-foreground">클럽 검색, 회원 참여 및 클럽하우스 활동은 실제 클럽 API를 통해 진행됩니다.</p>
          <Link
            href="/clubs"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground outline-offset-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            실제 클럽 목록 보기 <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </aside>
      </div>
    </main>
  );
}
