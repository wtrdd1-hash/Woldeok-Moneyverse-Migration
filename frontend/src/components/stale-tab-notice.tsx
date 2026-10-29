'use client';

import { RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

/** 기본 버전 점검 주기: 45초 (가벼운 20바이트 JSON 조회) */
const EVERY_MS = 45_000;
const RELEASE_PARAM = '__mv_release';

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
 * 세션 쿠키는 브라우저가 관리하므로 안전하게 유지됨.
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
    window.location.replace(targetUrl);
    // 메모리 캐시 잔존 방지를 위한 보조 안전망
    setTimeout(() => {
      try {
        window.location.reload();
      } catch {
        /* fallback */
      }
    }, 150);
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
      if (typeof body.id !== 'string' || body.id === '' || body.id === mine) return;

      const newVersion = body.id;
      setTargetVersion(newVersion);

      const transition = `${mine}->${newVersion}`;
      const refreshKey = 'moneyverse-release-refresh';

      // 이미 같은 버전으로 새로고침을 시도했으나 캐시 프록시 등으로 구버전이 계속 반환되는 경우 무한 루프 방지
      if (window.sessionStorage.getItem(refreshKey) === transition) {
        setStale(true);
        return;
      }

      // 사용자가 본문 글을 작성 중이면 즉시 새로고침하여 글을 날리지 않고 배너로 대기
      if (isUserActivelyTyping()) {
        setStale(true);
        return;
      }

      // 세션은 그대로 유지하면서 새 버전으로 강제 새로고침 실행
      isRefreshingRef.current = true;
      window.sessionStorage.setItem(refreshKey, transition);
      const targetUrl = releaseRefreshUrl(window.location.href, newVersion);
      await executeHardRefresh(targetUrl, navigate);
    } catch {
      // 네트워크 일시 오류는 새 버전 배포 증거가 아니므로 무시
    }
  }, [mine, navigate]);

  // 구버전 파라미터 청소
  useEffect(() => {
    if (mine !== '') clearReleaseParam(mine);
  }, [mine]);

  // 주기적 체크 및 가시성/포커스/온라인/라우트 변경 시 즉시 검사
  useEffect(() => {
    if (stale) return;

    const timer = setInterval(() => void check(), everyMs);
    const onVisibilityChange = (): void => void check();
    const onFocus = (): void => void check();
    const onOnline = (): void => void check();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [check, everyMs, stale]);

  // 사용자가 페이지를 이동(라우팅)할 때도 새 버전 체크
  useEffect(() => {
    void check();
  }, [pathname, searchParams, check]);

  if (!stale) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/30 bg-[#090D16]/95 px-5 py-3.5 text-sm text-foreground shadow-2xl backdrop-blur-md transition-all duration-300"
    >
      <div className="flex items-center gap-2.5">
        <Sparkles className="size-4 shrink-0 text-emerald-400 animate-pulse" />
        <span className="font-medium text-emerald-200 [word-break:keep-all]">
          최신 시스템 업데이트가 배포되었습니다. 새 버전 자동 적용이 이전 브라우저 캐시에 막혔습니다. 로그인은 유지되며 [새로고침]을 누르면 최신 웹페이지를 즉시 불러옵니다.
        </span>
      </div>
      <Button
        size="sm"
        className="min-h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md flex items-center gap-1.5 px-4"
        onClick={() => {
          const targetUrl = targetVersion
            ? releaseRefreshUrl(window.location.href, targetVersion)
            : window.location.href;
          void executeHardRefresh(targetUrl, navigate);
        }}
      >
        <RefreshCw className="size-3.5 animate-spin" />
        최신 페이지 새로고침
      </Button>
    </div>
  );
}
