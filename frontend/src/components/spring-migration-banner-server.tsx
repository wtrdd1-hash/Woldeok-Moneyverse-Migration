import Link from 'next/link';

export function SpringMigrationBannerServer() {
  return (
    <div
      role="region"
      aria-label="엔터프라이즈 Java Spring Boot 전환 안내"
      className="relative z-50 w-full border-b border-emerald-500/30 bg-gradient-to-r from-[#061811] via-[#091f17] to-[#04120d] px-3 py-2 sm:px-4 text-xs text-emerald-200 shadow-lg"
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SPRING BOOT 3.3 CUTOVER
          </span>
          <span className="font-medium text-emerald-100">
            엔터프라이즈 Java Spring Boot 3.3 고성능 엔진 전환 가동 중
          </span>
          <span className="hidden md:inline text-emerald-300/70">
            (JDK 21 Virtual Threads · Nginx 엣지 라우팅 · 분산 복식부기 국고 엔진 승격 진행)
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/health/spring"
            target="_blank"
            className="rounded bg-emerald-600/30 hover:bg-emerald-600/50 px-2 py-0.5 text-[11px] font-mono text-emerald-200 transition-colors border border-emerald-500/30"
          >
            Spring 상태 점검 →
          </Link>
        </div>
      </div>
    </div>
  );
}
