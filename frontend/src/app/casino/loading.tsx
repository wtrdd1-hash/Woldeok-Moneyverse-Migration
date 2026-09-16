import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CasinoLoading() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading casino / 카지노 불러오는 중">
      <div className="grid gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <Card>
        <CardHeader className="gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-4 p-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}
