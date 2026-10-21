import { AlertCircle, CheckCircle2, CircleHelp, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DomainHealthData } from './api-health-dashboard';

export function AdminApiDomainGrid({ domains, isEn }: { readonly domains: readonly DomainHealthData[]; readonly isEn: boolean }) {
  return (
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {domains.map((domain) => (
          <Card key={domain.id} className="border-border/80 bg-card/60 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  {domain.status === 'OPERATIONAL'
                    ? <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-500" />
                    : domain.status === 'DEGRADED'
                      ? <AlertCircle aria-hidden="true" className="size-4 text-amber-500" />
                      : domain.status === 'MAINTENANCE'
                        ? <Wrench aria-hidden="true" className="size-4 text-blue-500" />
                        : <CircleHelp aria-hidden="true" className="size-4 text-muted-foreground" />}
                  <span>{isEn ? domain.nameEn : domain.name}</span>
                </CardTitle>
                <Badge
                  variant="outline"
                  aria-label={isEn ? `Domain status: ${domain.status}` : `도메인 상태: ${domain.status}`}
                  className={`text-[10px] ${domain.status === 'OPERATIONAL'
                    ? 'text-emerald-600 border-emerald-500/40 bg-emerald-500/10'
                    : domain.status === 'DEGRADED'
                      ? 'text-amber-600 border-amber-500/40 bg-amber-500/10'
                      : domain.status === 'MAINTENANCE'
                        ? 'text-blue-600 border-blue-500/40 bg-blue-500/10'
                        : 'text-muted-foreground border-border bg-muted/30'}`}
                >
                  {domain.status}
                </Badge>
              </div>
              <CardDescription className="text-xs font-mono text-muted-foreground">
                {domain.endpointCount}개 API 엔드포인트
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs">
              <div className="flex items-center justify-between border-t border-border/50 pt-2 text-muted-foreground">
                <span>
                  {isEn ? 'Latency: ' : '응답 지연: '}
                  <b className="font-mono text-foreground">{domain.latencyMs === null ? (isEn ? 'Not measured' : '미측정') : `${domain.latencyMs}ms`}</b>
                </span>
                <span>
                  {isEn ? 'Success: ' : '성공률: '}
                  <b className="font-mono text-emerald-500">{domain.successRate === null ? (isEn ? 'Not measured' : '미측정') : `${domain.successRate.toFixed(1)}%`}</b>
                </span>
              </div>
              <div className="rounded-md bg-muted/40 p-2 text-[11px] font-mono text-muted-foreground truncate space-y-0.5">
                {domain.sampleEndpoints.map((ep) => (
                  <div key={ep} className="truncate">• {ep}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
  );
}
