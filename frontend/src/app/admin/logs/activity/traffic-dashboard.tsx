import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface TrafficAnalyticsDashboard {
  readonly granularity: 'day' | 'month' | 'year';
  readonly periods: number;
  readonly rangeStart: string;
  readonly generatedAt: string;
  readonly summary: {
    readonly pageViews: number;
    readonly uniqueSessions: number;
    readonly authenticatedUsers: number;
    readonly anonymousSessions: number;
  };
  readonly series: readonly { readonly bucket: string; readonly pageViews: number; readonly uniqueSessions: number; readonly authenticatedUsers: number }[];
  readonly landingPages: readonly { readonly path: string; readonly entries: number; readonly anonymousEntries: number }[];
  readonly sources: readonly { readonly source: string; readonly entries: number }[];
  readonly countries: readonly { readonly country: string; readonly entries: number }[];
}

const nf = new Intl.NumberFormat('ko-KR');

function CountCard({ title, value, detail }: { readonly title: string; readonly value: number; readonly detail: string }) {
  return <Card><CardHeader className="pb-2"><CardDescription>{title}</CardDescription><CardTitle className="text-2xl">{nf.format(value)}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">{detail}</CardContent></Card>;
}

export function TrafficDashboard({ data }: { readonly data: TrafficAnalyticsDashboard }) {
  const labels = { day: '일', month: '월', year: '년' } as const;
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-2">
      {(['day', 'month', 'year'] as const).map((g) => <Button key={g} size="sm" variant={data.granularity === g ? 'secondary' : 'outline'} asChild><Link href={`/admin/logs/activity?granularity=${g}`}>{labels[g]} 단위</Link></Button>)}
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CountCard title="페이지 접속량" value={data.summary.pageViews} detail="선택 기간의 page_view 합계" />
      <CountCard title="고유 접속 세션" value={data.summary.uniqueSessions} detail="로그인 여부와 무관한 브라우저 세션" />
      <CountCard title="로그인 접속자" value={data.summary.authenticatedUsers} detail="중복 제거된 회원 수" />
      <CountCard title="비로그인 세션" value={data.summary.anonymousSessions} detail="첫 진입 당시 비로그인 세션" />
    </div>
    <Card>
      <CardHeader><CardTitle className="text-base">{labels[data.granularity]}별 접속 추이</CardTitle><CardDescription>한국 시간 기준 집계입니다.</CardDescription></CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:hidden">
          {data.series.map((row) => <div key={row.bucket} className="rounded-md border p-3 text-sm">
            <strong className="font-mono text-xs">{row.bucket}</strong>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div><dt className="text-muted-foreground">페이지뷰</dt><dd className="font-semibold">{nf.format(row.pageViews)}</dd></div>
              <div><dt className="text-muted-foreground">세션</dt><dd className="font-semibold">{nf.format(row.uniqueSessions)}</dd></div>
              <div><dt className="text-muted-foreground">로그인</dt><dd className="font-semibold">{nf.format(row.authenticatedUsers)}</dd></div>
            </dl>
          </div>)}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">기간</th><th>페이지뷰</th><th>세션</th><th>로그인 사용자</th></tr></thead><tbody>{data.series.map((row) => <tr key={row.bucket} className="border-b"><td className="py-2 font-mono text-xs">{row.bucket}</td><td>{nf.format(row.pageViews)}</td><td>{nf.format(row.uniqueSessions)}</td><td>{nf.format(row.authenticatedUsers)}</td></tr>)}</tbody></table>
        </div>
      </CardContent>
    </Card>
    <div className="grid gap-3 lg:grid-cols-3">
      <RankCard title="진입 페이지" rows={data.landingPages.map((x) => [x.path, x.entries])} />
      <RankCard title="접속 경로 / 유입 도메인" rows={data.sources.map((x) => [x.source, x.entries])} />
      <RankCard title="접속 국가" rows={data.countries.map((x) => [x.country, x.entries])} />
    </div>
  </div>;
}

function RankCard({ title, rows }: { readonly title: string; readonly rows: readonly (readonly [string, number])[] }) {
  return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent>{rows.length === 0 ? <p className="text-sm text-muted-foreground">집계할 데이터가 없습니다.</p> : <ol className="grid gap-2">{rows.slice(0, 10).map(([label, value], index) => <li key={`${label}-${index}`} className="flex items-center justify-between gap-3 border-b pb-2 text-sm"><span className="min-w-0 truncate" title={label}>{index + 1}. {label}</span><strong>{nf.format(value)}</strong></li>)}</ol>}</CardContent></Card>;
}
