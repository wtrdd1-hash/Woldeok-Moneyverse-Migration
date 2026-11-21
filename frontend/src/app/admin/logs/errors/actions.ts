'use server';

import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';

export interface StructuredErrorLog {
  readonly id: string;
  readonly raw: string;
  readonly timestampIso: string;
  readonly dateKst: string;
  readonly timeKst: string;
  readonly category: string;
  readonly route: string;
  readonly user: string;
  readonly ip: string;
  readonly errorCode: string;
  readonly message: string;
  readonly userAgent: string;
  readonly stack: string;
}

export interface ErrorLogsResult {
  readonly logs: readonly StructuredErrorLog[];
  readonly totalCount: number;
  readonly availableDates: readonly string[];
  readonly availableCodes: readonly string[];
  readonly availableRoutes: readonly string[];
  readonly timestamp: string;
}

interface RawSystemLogResponse {
  readonly source: string;
  readonly sourceName: string;
  readonly lines: readonly string[];
  readonly totalCount: number;
  readonly timestamp: string;
  readonly status: string;
}

const LOG_REGEX = /^\[(.*?)\]\s+\[(.*?)\]\s+\[ROUTE:(.*?)\]\s+\[USER:(.*?)\]\s+\[IP:(.*?)\]\s+\[(.*?)\]\s+(.*?)(?:\s+\(UA:\s+(.*?)\))?(?:\s+STACK:\s+(.*))?$/;

function parseLine(line: string, index: number): StructuredErrorLog | null {
  const match = line.match(LOG_REGEX);
  if (!match) {
    if (!line.trim()) return null;
    return {
      id: `err_raw_${index}`,
      raw: line,
      timestampIso: new Date().toISOString(),
      dateKst: new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
      timeKst: new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' }),
      category: 'UNKNOWN',
      route: '/',
      user: 'unknown',
      ip: 'unknown',
      errorCode: 'GenericError',
      message: line,
      userAgent: '',
      stack: '',
    };
  }

  const rawIso = match[1] ?? '';
  const category = match[2] ?? 'CLIENT_ERROR';
  const route = match[3] ?? '/';
  const user = match[4] ?? 'anonymous';
  const ip = match[5] ?? 'unknown';
  const rawCode = match[6] ?? 'Error';
  const message = match[7] ?? '';
  const userAgent = match[8] ?? '';
  const stack = match[9] ?? '';

  const d = new Date(rawIso || Date.now());
  const isValidDate = !isNaN(d.getTime());

  const dateKst = isValidDate
    ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d).replace(/\. /g, '-').replace('.', '')
    : 'Unknown Date';
  const timeKst = isValidDate
    ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d)
    : '00:00:00';

  let errorCode = rawCode;
  const reactErrorMatch = message.match(/Minified React error #(\d+)/i);
  if (reactErrorMatch && reactErrorMatch[1]) {
    errorCode = `React #${reactErrorMatch[1]}`;
  }

  return {
    id: `err_${isValidDate ? d.getTime() : index}_${index}`,
    raw: line,
    timestampIso: isValidDate ? d.toISOString() : new Date().toISOString(),
    dateKst,
    timeKst,
    category,
    route,
    user,
    ip,
    errorCode,
    message,
    userAgent,
    stack,
  };
}

export async function fetchStructuredErrorLogsAction(
  dateFilter?: string,
  codeFilter?: string,
  routeFilter?: string,
  searchFilter?: string,
  sortOrder: 'desc' | 'asc' = 'desc',
): Promise<{ success: boolean; data?: ErrorLogsResult; error?: string }> {
  try {
    await requireAdminConsole();

    const raw = await apiOrNull<RawSystemLogResponse>('/api/v1/admin/logs/system?source=FRONTEND_ERRORS&lines=1000');
    if (!raw || !raw.lines) {
      return {
        success: true,
        data: {
          logs: [],
          totalCount: 0,
          availableDates: [],
          availableCodes: [],
          availableRoutes: [],
          timestamp: new Date().toISOString(),
        },
      };
    }

    const parsed: StructuredErrorLog[] = [];
    for (let i = 0; i < raw.lines.length; i++) {
      const line = raw.lines[i];
      if (line) {
        const p = parseLine(line, i);
        if (p) parsed.push(p);
      }
    }

    const datesSet = new Set<string>();
    const codesSet = new Set<string>();
    const routesSet = new Set<string>();

    for (const item of parsed) {
      if (item.dateKst) datesSet.add(item.dateKst);
      if (item.errorCode) codesSet.add(item.errorCode);
      if (item.route) routesSet.add(item.route);
    }

    let filtered = parsed;

    if (dateFilter && dateFilter !== 'ALL') {
      filtered = filtered.filter((item) => item.dateKst === dateFilter);
    }

    if (codeFilter && codeFilter !== 'ALL') {
      filtered = filtered.filter((item) => item.errorCode === codeFilter);
    }

    if (routeFilter && routeFilter.trim()) {
      const q = routeFilter.trim().toLowerCase();
      filtered = filtered.filter((item) => item.route.toLowerCase().includes(q));
    }

    if (searchFilter && searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.message.toLowerCase().includes(q) ||
          item.route.toLowerCase().includes(q) ||
          item.ip.toLowerCase().includes(q) ||
          item.userAgent.toLowerCase().includes(q) ||
          item.errorCode.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      const timeA = new Date(a.timestampIso).getTime();
      const timeB = new Date(b.timestampIso).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return {
      success: true,
      data: {
        logs: filtered,
        totalCount: parsed.length,
        availableDates: Array.from(datesSet).sort().reverse(),
        availableCodes: Array.from(codesSet).sort(),
        availableRoutes: Array.from(routesSet).sort(),
        timestamp: raw.timestamp || new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}
