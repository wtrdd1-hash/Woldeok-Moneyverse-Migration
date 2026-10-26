import Link from 'next/link';
import { supportStatusHref, type SupportStatus } from './support-status';

const options: readonly { status: SupportStatus; label: string }[] = [
  { status: 'all', label: '전체' },
  { status: 'open', label: '관리자 답변 대기' },
  { status: 'waiting_user', label: '내 답변 대기' },
  { status: 'resolved', label: '처리 완료' },
];

export function SupportFilterNav({
  status,
  selected,
  visibleCount,
  windowLimit,
}: {
  status: SupportStatus;
  selected?: string | undefined;
  visibleCount: number;
  windowLimit: number;
}) {
  return (
    <nav aria-label="문의 상태 필터" className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Link
            key={option.status}
            href={supportStatusHref(option.status, selected)}
            aria-current={status === option.status ? 'page' : undefined}
            className="rounded-lg border bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {option.label}
          </Link>
        ))}
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        최근 최대 {windowLimit}건 중 {visibleCount}건 표시. 전체 문의 이력의 검색 결과가 아닙니다.
      </p>
      {visibleCount === 0 && (
        <p className="text-sm text-muted-foreground">
          이 필터에 표시할 최근 문의가 없습니다. 더 오래된 문의는 포함되지 않을 수 있습니다.
        </p>
      )}
    </nav>
  );
}
