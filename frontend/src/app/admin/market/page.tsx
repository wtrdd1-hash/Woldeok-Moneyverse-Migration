import type { Metadata } from 'next';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { LiveRefresh } from '@/components/live-refresh';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiOrNull } from '@/lib/api';
import { groupDigits } from '@/lib/money';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type { AdminStock } from '../types';
import {
  CorporateActionDialog,
  DeleteStockDialog,
  NewStockForm,
  SetPriceDialog,
  ToggleActive,
} from '../admin-forms';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/market');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminMarketPage() {
  await requireAdminConsole(AREA.href);
  const stocks = await apiOrNull<{ stocks: AdminStock[] }>('/api/v1/admin/stocks');

  return (
    <div className="grid gap-5">
      <AdminBack />
      <LiveRefresh />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">가상 주식 종목 관리</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <NewStockForm />
            {stocks === null ? (
              <EmptyState title="등록된 종목을 불러오지 못했어요." />
            ) : stocks.stocks.length === 0 ? (
              <EmptyState title="등록된 종목이 없습니다." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>코드</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead className="text-right">현재가</TableHead>
                      <TableHead className="text-right">유통 / 발행</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.stocks.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-mono text-xs">{stock.symbol}</TableCell>
                        <TableCell>{stock.name}</TableCell>
                        <TableCell className="text-right">
                          <Amount value={stock.current_price} />
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-right text-xs">
                          {groupDigits(stock.shares_available)} /{' '}
                          {groupDigits(stock.shares_outstanding)}
                          <span className="block text-muted-foreground">
                            보유자 {stock.holders}명 · 거래 {stock.trades}건
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stock.active ? 'secondary' : 'outline'}>
                            {stock.active ? '거래 중' : '정지'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            <ToggleActive id={stock.id} active={stock.active} kind="stock" />
                            <SetPriceDialog
                              stockId={stock.id}
                              symbol={stock.symbol}
                              currentPrice={stock.current_price}
                            />
                            <CorporateActionDialog stockId={stock.id} symbol={stock.symbol} />
                            <DeleteStockDialog
                              stockId={stock.id}
                              symbol={stock.symbol}
                              holders={stock.holders}
                              trades={stock.trades}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
