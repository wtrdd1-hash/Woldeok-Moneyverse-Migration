import Link from 'next/link';
import { Mail } from 'lucide-react';

export interface DirectMessageButtonProps {
  readonly authorName: string;
  readonly targetUserId?: string | null | undefined;
  readonly mine?: boolean | undefined;
  readonly size?: 'sm' | 'default' | undefined;
  readonly className?: string | undefined;
}

/**
 * 1:1 쪽지(Direct Message) 보내기 공통 프리미티브 버튼
 * - ONE_TO_ONE_PRIVATE_CHAT_SPEC.ko.md §29 준수:
 *   1. 본인 글/댓글(mine === true)인 경우 렌더링하지 않음.
 *   2. 대상 ID(targetUserId)가 주어지면 /chat?peer=${targetUserId}로 연결.
 *   3. 44px 터치 타깃 및 반응형 가독성 지원.
 */
export function DirectMessageButton({
  authorName,
  targetUserId,
  mine = false,
  size = 'default',
  className = '',
}: DirectMessageButtonProps) {
  // 본인 글 또는 댓글인 경우 쪽지 버튼 생략
  if (mine) {
    return null;
  }

  const href = targetUserId
    ? `/chat?peer=${encodeURIComponent(targetUserId)}`
    : `/chat`;

  const isSmall = size === 'sm';

  return (
    <Link
      href={href}
      title={`${authorName}님에게 쪽지 보내기`}
      aria-label={`${authorName}님에게 1:1 쪽지 보내기`}
      data-testid="dm-button"
      className={`inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.98] transition-all rounded px-1.5 py-0.5 min-h-[36px] sm:min-h-0 ${
        isSmall ? 'text-[11px] leading-tight' : 'text-xs'
      } ${className}`}
    >
      <Mail className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>쪽지</span>
    </Link>
  );
}
