'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bookmark, BookmarkCheck } from 'lucide-react';

export interface CalculatorScenarioData {
  type: 'stock' | 'retirement' | 'pension' | 'isa' | 'tax';
  title: string;
  badge: string;
  primaryMetric: { label: string; value: string };
  secondaryMetric?: { label: string; value: string };
  details: Record<string, string | number>;
  sourceUrl?: string;
}

interface CalculatorSaveActionProps {
  readonly scenario: CalculatorScenarioData;
  readonly className?: string;
}

const COPY = {
  ko: { save: '이 브라우저에 시뮬레이션 저장', saved: '브라우저에 저장됨', success: '이 브라우저에만 저장했습니다. 캐시 삭제 시 사라지며 계정·서버와 동기화되지 않습니다.', error: '브라우저에 저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인해 주세요.' },
  en: { save: 'Save simulation in this browser', saved: 'Saved in this browser', success: 'Saved only in this browser. Clearing site data removes it; no account or server sync occurs.', error: 'Could not save in this browser. Check storage permissions and space.' },
  ja: { save: 'このブラウザにシミュレーションを保存', saved: 'ブラウザに保存済み', success: 'このブラウザにのみ保存しました。データ削除で消え、アカウントには同期されません。', error: 'ブラウザに保存できませんでした。保存領域と設定をご確認ください。' },
  zh: { save: '仅保存到此浏览器', saved: '已保存到此浏览器', success: '仅保存于此浏览器。清除网站数据后将丢失，不会同步到账号或服务器。', error: '无法保存到此浏览器，请检查存储空间与权限。' },
} as const;

const STORAGE_KEY = 'wdmv_saved_scenarios';

export function CalculatorSaveAction({ scenario, className = '' }: CalculatorSaveActionProps) {
  const pathname = usePathname() || '';
  const locale = pathname.startsWith('/en') ? 'en' : pathname.startsWith('/ja') ? 'ja' : pathname.startsWith('/zh') ? 'zh' : 'ko';
  const t = COPY[locale];
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const ticker = String(scenario.details.ticker || scenario.title);
  const signature = JSON.stringify([scenario.type, scenario.title, scenario.primaryMetric, scenario.secondaryMetric, scenario.details]);

  useEffect(() => {
    setSaved(false);
    setMessage(null);
    try {
      const list: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(list)) setSaved(list.some((item: unknown) => {
        if (!item || typeof item !== 'object' || !('scenarioData' in item)) return false;
        const data = item.scenarioData as CalculatorScenarioData | undefined;
        return data !== undefined && JSON.stringify([data.type, data.title, data.primaryMetric, data.secondaryMetric, data.details]) === signature;
      }));
    } catch {
      // Storage may be blocked; do not present a false saved state.
    }
  }, [signature]);

  function saveLocally() {
    try {
      const existing: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(existing)) throw new Error('invalid local data');
      const entry = {
        ticker,
        stockName: scenario.title,
        targetPrice: scenario.primaryMetric.value,
        reboundRate: scenario.secondaryMetric?.value || '0%',
        type: scenario.type,
        savedAt: Date.now(),
        scenarioData: scenario,
      };
      const filtered = existing.filter((item: unknown) => {
        if (!item || typeof item !== 'object' || !('scenarioData' in item)) return true;
        const data = item.scenarioData as CalculatorScenarioData | undefined;
        return data?.type !== scenario.type || data?.title !== scenario.title;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...filtered].slice(0, 30)));
      setSaved(true);
      setMessage({ text: t.success, error: false });
    } catch {
      setMessage({ text: t.error, error: true });
    }
  }

  return (
    <div className={`inline-flex max-w-full flex-col gap-2 ${className}`}>
      <button type="button" onClick={saveLocally} disabled={saved} aria-label={saved ? t.saved : t.save} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${saved ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
        {saved ? <BookmarkCheck aria-hidden="true" className="size-4" /> : <Bookmark aria-hidden="true" className="size-4" />}
        {saved ? t.saved : t.save}
      </button>
      {message ? <p role={message.error ? 'alert' : 'status'} className={`max-w-sm text-xs ${message.error ? 'text-destructive' : 'text-muted-foreground'}`}>{message.text}</p> : null}
    </div>
  );
}
