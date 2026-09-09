'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { groupDigits } from '@/lib/money';

export interface ComparableStock {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly day_high_price: string;
  readonly day_low_price: string;
  readonly shares_available: string;
}

interface StockComparisonProps {
  readonly stocks: readonly ComparableStock[];
  readonly isEn: boolean;
}

const MAX_SELECTED = 3;

function signedDelta(current: string, open: string) {
  const delta = BigInt(current) - BigInt(open);
  if (delta === 0n) return '0';
  const prefix = delta > 0n ? '+' : '-';
  const absolute = delta > 0n ? delta : -delta;
  return `${prefix}${groupDigits(absolute.toString())}`;
}

export function StockComparison({ stocks, isEn }: StockComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => stocks.slice(0, 2).map((stock) => stock.id));
  const selected = useMemo(
    () => selectedIds.map((id) => stocks.find((stock) => stock.id === id)).filter((stock): stock is ComparableStock => Boolean(stock)),
    [selectedIds, stocks],
  );

  const toggle = (stockId: string, checked: boolean) => {
    setSelectedIds((current) => {
      if (!checked) return current.filter((id) => id !== stockId);
      if (current.includes(stockId) || current.length >= MAX_SELECTED) return current;
      return [...current, stockId];
    });
  };

  if (stocks.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEn ? 'Compare Stocks' : '종목 비교'}</CardTitle>
        <CardDescription>
          {isEn
            ? 'Compare two or three virtual stocks side by side using the latest server prices.'
            : '최신 서버 시세를 기준으로 가상 주식 2~3개를 한눈에 비교합니다.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">
            {isEn ? `Choose up to ${MAX_SELECTED} stocks` : `최대 ${MAX_SELECTED}개 종목 선택`}
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {stocks.map((stock) => {
              const checked = selectedIds.includes(stock.id);
              const disabled = !checked && selectedIds.length >= MAX_SELECTED;
              const inputId = `compare-${stock.id}`;
              return (
                <div key={stock.id} className="flex items-center gap-2">
                  <Checkbox
                    id={inputId}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(value) => toggle(stock.id, value === true)}
                  />
                  <Label htmlFor={inputId} className={disabled ? 'text-muted-foreground' : undefined}>
                    <span className="font-mono">{stock.symbol}</span> {stock.name}
                  </Label>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {isEn
              ? `${selected.length} selected · values are virtual WLD market data`
              : `${selected.length}개 선택 · 모든 값은 게임 내 WLD 가상 시장 데이터입니다.`}
          </span>
          {selectedIds.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              {isEn ? 'Clear' : '선택 해제'}
            </Button>
          ) : null}
        </div>

        {selected.length < 2 ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground" role="status">
            {isEn ? 'Select at least two stocks to compare.' : '비교할 종목을 2개 이상 선택해 주세요.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{isEn ? 'Metric' : '항목'}</TableHead>
                  {selected.map((stock) => (
                    <TableHead key={stock.id} scope="col" className="min-w-36 text-right">
                      <span className="font-mono">{stock.symbol}</span>
                      <span className="ml-1 font-normal text-muted-foreground">{stock.name}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableHead scope="row">{isEn ? 'Current price' : '현재가'}</TableHead>
                  {selected.map((stock) => <TableCell key={stock.id} className="tabular text-right">{groupDigits(stock.current_price)} WLD</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableHead scope="row">{isEn ? 'Change from open' : '시가 대비'}</TableHead>
                  {selected.map((stock) => <TableCell key={stock.id} className="tabular text-right">{signedDelta(stock.current_price, stock.day_open_price)} WLD</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableHead scope="row">{isEn ? 'Day range' : '오늘 범위'}</TableHead>
                  {selected.map((stock) => <TableCell key={stock.id} className="tabular text-right">{groupDigits(stock.day_low_price)}–{groupDigits(stock.day_high_price)}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableHead scope="row">{isEn ? 'Available shares' : '거래 가능 수량'}</TableHead>
                  {selected.map((stock) => <TableCell key={stock.id} className="tabular text-right">{groupDigits(stock.shares_available)}{isEn ? ' shares' : '주'}</TableCell>)}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
