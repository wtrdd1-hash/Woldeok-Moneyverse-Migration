'use client';

import { useEffect } from 'react';

/**
 * ViewportScrollGuardian
 *
 * 모바일 및 데스크톱 환경에서 브라우저 자동 포커스(Input Focus), 줌인, 또는 요소 오버플로우로 인해
 * window.scrollX 또는 document.documentElement.scrollLeft가 0보다 커져 화면 좌측이 잘리는 현상을
 * 런타임 이벤트 레벨에서 즉각 감지하고 원위치(left: 0)로 강제 복구하는 보호 장치입니다.
 */
export function ViewportScrollGuardian() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resetHorizontalScroll = () => {
      if (window.scrollX !== 0 || document.documentElement.scrollLeft !== 0 || document.body.scrollLeft !== 0) {
        window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' as ScrollBehavior });
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
      }
    };

    // 1. 스크롤 이벤트 발생 시 수평 스크롤 위치 검사
    window.addEventListener('scroll', resetHorizontalScroll, { passive: true });

    // 2. 입력 필드 포커스 시 모바일 브라우저의 가로 뷰포트 밀림 방지
    window.addEventListener('focusin', () => {
      requestAnimationFrame(resetHorizontalScroll);
      setTimeout(resetHorizontalScroll, 100);
      setTimeout(resetHorizontalScroll, 300);
    });

    // 3. 터치 및 제스처 완료 후 리셋
    window.addEventListener('touchend', () => {
      requestAnimationFrame(resetHorizontalScroll);
    }, { passive: true });

    // 4. 화면 회전 및 리사이즈 시 리셋
    window.addEventListener('resize', resetHorizontalScroll, { passive: true });
    window.addEventListener('orientationchange', resetHorizontalScroll, { passive: true });

    // 초기 마운트 시 1회 실행
    resetHorizontalScroll();

    return () => {
      window.removeEventListener('scroll', resetHorizontalScroll);
      window.removeEventListener('resize', resetHorizontalScroll);
      window.removeEventListener('orientationchange', resetHorizontalScroll);
    };
  }, []);

  return null;
}
