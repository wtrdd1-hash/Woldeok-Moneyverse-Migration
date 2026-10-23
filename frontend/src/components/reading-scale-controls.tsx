'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { applyReadingScale, readReadingScale, READING_SCALE_KEY, READING_SCALES } from '@/lib/reading-scale';

export function ReadingScaleControls() {
  const [scale, setScale] = useState(100);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setScale(readReadingScale() ?? 100);
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key !== READING_SCALE_KEY && event.key !== null) return;
      const next = readReadingScale() ?? 100;
      applyReadingScale(next);
      setScale(next);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function select(value: number) {
    if (applyReadingScale(value)) setScale(value);
  }

  return (
    <div className="grid min-w-0 gap-5">
      <fieldset className="grid gap-3">
        <legend className="font-semibold">글자 크기</legend>
        <p className="text-sm text-muted-foreground">이 브라우저에서 읽기 편한 크기를 선택하세요. 브라우저 확대 기능도 계속 사용할 수 있습니다.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="읽기 글자 크기">
          {READING_SCALES.map((value) => (
            <label key={value} className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-2 py-3 text-sm font-medium has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
              <input
                type="radio"
                name="reading-scale"
                value={value}
                checked={ready && scale === value}
                onChange={() => select(value)}
                className="size-4 shrink-0 accent-primary"
              />
              {value}%
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 rounded-xl border bg-muted/30 p-4">
        <p className="text-sm font-medium">미리보기 · Preview</p>
        <p>가상 경제와 금융 정보를 더 편하게 읽을 수 있습니다. 123,456 WLD</p>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {ready ? `현재 적용된 글자 크기: ${scale}%` : '글자 크기 설정을 확인하는 중입니다.'}
        </p>
        <p className="text-xs text-muted-foreground">이 설정은 이 브라우저에만 적용됩니다. 다른 기기나 계정에 동기화되지 않으며, 브라우저가 저장을 차단하면 현재 화면에서만 유지될 수 있습니다.</p>
      </div>
      <Button type="button" variant="outline" className="min-h-11 w-fit" onClick={() => select(100)}>
        기본 크기 100%로 초기화
      </Button>
    </div>
  );
}
