'use client';

import { RefreshCw, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

/** 기본 버전 점검 주기: 30초 */
const EVERY_MS = 30_000;
const RELEASE_PARAM = '__mv_release';
const REFRESH_KEY = 'moneyverse-release-refresh';
const DISMISS_KEY = 'moneyverse-release-dismissed';

/**
 * 캐시 버스팅 파라미터가 포함된 강제 새로고침 URL 생성
 */
export function releaseRefreshUrl(href: string, releaseId: string): string {
  const url = new URL(href);
  url.searchParams.set(RELEASE_PARAM, releaseId);
  return url.toString();
}

/**
 * 페이지 로드 완료 후 URL에 남아있는 __mv_release 파라미터를 브라우저 히스토리에서 정갈하게 제거
 */
function clearReleaseParam(buildId: string): void {
  try {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get(RELEASE_PARAM) !== buildId) return;
    url.searchParams.delete(RELEASE_PARAM);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore history errors */
  }
}

/**
 * 브라우저 캐시 스토리지(Service Worker / Cache API)를 소거하고 강제 새로고침 실행
 * 세션 쿠키는 브라우저가 관리하므로 로그인 100% 보존.
 */
async function executeHardRefresh(targetUrl: string, navigate?: (url: string) => void): Promise<void> {
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
    }
  } catch {
    /* ignore cache deletion errors */
  }

  if (navigate) {
    navigate(targetUrl);
  } else if (typeof window !== 'undefined') {
    // 히스토리 잔존 방지를 위해 타임스탬프를 부여한 최신 주소로 교체
    window.location.replace(targetUrl);
    setTimeout(() => {
      try {
        window.location.reload();
      } catch {
        /* fallback */
      }
    }, 100);
  }
}

/**
 * 현재 사용자가 텍스트 입력 폼을 활발히 작성 중인지 감지
 */
function isUserActivelyTyping(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement;
  if (!active) return false;
  const tagName = active.tagName.toLowerCase();
  if (tagName === 'textarea') return true;
  if (tagName === 'input') {
    const type = (active as HTMLInputElement).type.toLowerCase();
    return ['text', 'search', 'email', 'password', 'tel', 'url', 'number'].includes(type);
  }
  if (active.hasAttribute('contenteditable')) return true;
  return false;
}

export function StaleTabNotice({
  everyMs = EVERY_MS,
  navigate,
}: {
  readonly everyMs?: number;
  readonly navigate?: (url: string) => void;
}) {
  const mine = process.env.NEXT_PUBLIC_BUILD_ID ?? '';
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [stale, setStale] = useState(false);
  const [targetVersion, setTargetVersion] = useState<string>('');
  const isRefreshingRef = useRef(false);

  const check = useCallback(async (): Promise<void> => {
    if (mine === '' || typeof document === 'undefined' || document.visibilityState !== 'visible') {
      return;
    }
    if (isRefreshingRef.current) return;

    try {
      const response = await fetch('/frontend-version', { cache: 'no-store' });
      if (!response.ok) return;
      const body = (await response.json()) as { id?: unknown };
      if (typeof body.id !== 'string' || body.id === '' || body.id === mine) {
        // 이미 최신 버전과 일치하면 배너/버튼 즉시 제거 및 세션 스토리지 정리
        setStale(false);
        try {
          window.sessionStorage.removeItem(REFRESH_KEY);
          window.sessionStorage.removeItem(DISMISS_KEY);
        } catch {
          // Session storage can be unavailable; keep the refresh path usable.
        }
        return;
      }

      const newVersion = body.id;
      setTargetVersion(newVersion);

      const transition = `${mine}->${newVersion}`;

      // Dismiss only this exact release transition; future releases must still be checked.
      if (window.sessionStorage.getItem(DISMISS_KEY) === transition) {
        setStale(false);
        return;
      }

      // Previous automatic refresh attempt did not result in the requested version.
      if (window.sessionStorage.getItem(REFRESH_KEY) === transition) {
        setStale(true);
        return;
      }

      // 사용자가 본문 글을 작성 중이면 작업 보호를 위해 배너로 대기
      if (isUserActivelyTyping()) {
        setStale(true);
        return;
      }

      // 일반 상태: 로그인 세션을 안전하게 보존하며 최신 버전으로 즉시 자동 강제 새로고침 실행
      isRefreshingRef.current = true;
      try {
        window.sessionStorage.setItem(REFRESH_KEY, transition);
      } catch {
        // Session storage can be unavailable; still attempt the refresh.
      }

      const targetUrl = releaseRefreshUrl(window.location.href, newVersion);
      await executeHardRefresh(targetUrl, navigate);
    } catch {
      // 일시적 네트워크 오류 무시
    }
  }, [mine, navigate]);

  // 구버전 파라미터 청소
  useEffect(() => {
    if (mine !== '') clearReleaseParam(mine);
  }, [mine, pathname, searchParams]);

  // 주기적 체크 및 가시성/포커스/온라인 이벤트
  useEffect(() => {
    const timer = setInterval(() => void check(), everyMs);
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') void check();
    };
    const onFocus = (): void => void check();
    const onOnline = (): void => void check();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);

    void check();

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [check, everyMs]);

  // 사용자가 페이지를 이동(라우팅)할 때도 새 버전 체크
  useEffect(() => {
    void check();
  }, [pathname, searchParams, check]);

  if (!stale) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 z-[100] w-auto sm:w-full max-w-md rounded-xl border border-emerald-500/40 bg-[#090D16]/95 p-3 text-sm text-foreground shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-start gap-2">
        <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-400" />
        <p className="min-w-0 flex-1 text-xs leading-5 text-emerald-100">
          현재 화면과 서버 버전이 일치하지 않습니다. 새 버전의 화면을 불러오거나 이 알림을 닫을 수 있습니다.
        </p>
        <button
          type="button"
          aria-label="알림 닫기"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-emerald-100 hover:bg-emerald-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          onClick={() => {
            try {
              if (targetVersion) window.sessionStorage.setItem(DISMISS_KEY, `${mine}->${targetVersion}`);
            } catch {
              // Dismissal is still effective until this component remounts.
            }
            setStale(false);
          }}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <Button
        size="sm"
        className="mt-2 min-h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
        onClick={() => {
          isRefreshingRef.current = true;
          try {
            window.sessionStorage.removeItem(REFRESH_KEY);
            window.sessionStorage.removeItem(DISMISS_KEY);
          } catch {
            // Storage access may be blocked; manual refresh must still work.
          }
          const targetUrl = targetVersion
            ? releaseRefreshUrl(window.location.href, targetVersion)
            : window.location.href;
          void executeHardRefresh(targetUrl, navigate);
        }}
      >
        <RefreshCw aria-hidden="true" className="size-4" />
        최신 페이지 불러오기
      </Button>
    </div>

  );
}
