import Link from 'next/link';

/**
 * The dark strip above the masthead.
 *
 * The original carried one on every content page, and it is where the
 * product says the one thing a first-time visitor most needs to know before
 * anything else on the screen makes sense.
 */
export function NoticeBar() {
  return (
    <div className="bg-forest-deep text-[13px] text-[#e6eee9]">
      <div className="mx-auto flex min-h-10 w-full max-w-[1180px] flex-wrap items-center gap-3 px-6 py-1.5">
        <span className="shrink-0 rounded-full bg-[#cfe4d6] px-2 py-[3px] text-[10px] font-extrabold tracking-[0.06em] text-forest-deep">
          커뮤니티 가상경제
        </span>
        <p className="opacity-90">
          모든 WLD와 보상은 게임 안에서만 쓰는 가상 데이터입니다.
        </p>
        <Link
          href="/terms"
          className="ml-auto border-b border-white/40 pb-px font-bold hover:border-white"
        >
          이용 기준
        </Link>
      </div>
    </div>
  );
}
