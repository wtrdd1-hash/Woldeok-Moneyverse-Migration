'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';

export interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  category: 'newspaper' | 'stocks' | 'economy' | 'casino' | 'work' | 'bank' | 'auth' | 'streams' | 'admin';
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  requiresAuth: boolean;
  sampleBody?: string;
  sampleResponse: string;
}

export const ENDPOINTS_DATA: EndpointDef[] = [
  // 1. Newspaper & World Pulse
  {
    id: 'newspaper-pulse',
    method: 'GET',
    path: '/app-api/v1/newspaper/pulse',
    category: 'newspaper',
    titleKo: '실시간 월드 펄스 및 시장 심리 조회',
    titleEn: 'Get Real-time World Pulse & Market Sentiment',
    descriptionKo: '가상 경제의 실시간 시장 심리 지수(0~100), 활성 시나리오 개수 및 1면 특종 헤드라인을 조회합니다.',
    descriptionEn: 'Fetches real-time market sentiment gauge score (0-100), active scenario event count, and lead headline.',
    requiresAuth: false,
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        sentimentScore: 68,
        sentimentLabel: 'BULLISH',
        activeEventsCount: 4,
        leadHeadline: '사이버 보안 감사 통과에 따른 테크/핀테크 섹터 반등 랠리',
        updatedAt: '2026-09-22T03:30:00.000Z',
      },
    }, null, 2),
  },
  {
    id: 'newspaper-poll',
    method: 'GET',
    path: '/app-api/v1/newspaper/poll',
    category: 'newspaper',
    titleKo: '주간 독자 여론조사 현황 조회',
    titleEn: 'Get Weekly Reader Poll Distribution',
    descriptionKo: '이번 주 시장 전망에 대한 독자 여론조사 항목별 득표수 및 백분율 통계를 조회합니다.',
    descriptionEn: 'Retrieves current weekly market sentiment poll options, vote tallies, and percentage distributions.',
    requiresAuth: false,
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        id: 'poll-2026-09-w4',
        question: '이번 주 머니버스 가상 증시 전망은 어디로 향할까요?',
        options: [
          { id: 'bullish', label: '상승세 지속 (Bullish)', votes: 342, percentage: 46 },
          { id: 'sideways', label: '박스권 횡보 (Neutral)', votes: 215, percentage: 29 },
          { id: 'bearish', label: '조정 및 하락 (Bearish)', votes: 128, percentage: 17 },
          { id: 'cash', label: '현금/안전자산 예치', votes: 59, percentage: 8 },
        ],
        totalVotes: 744,
      },
    }, null, 2),
  },
  {
    id: 'newspaper-vote',
    method: 'POST',
    path: '/app-api/v1/newspaper/poll/vote',
    category: 'newspaper',
    titleKo: '주간 독자 여론조사 투표 참여',
    titleEn: 'Submit Vote for Weekly Reader Poll',
    descriptionKo: '지정된 선택지(choiceId)에 투표하고 갱신된 여론조사 통계 결과를 반환받습니다.',
    descriptionEn: 'Submits a vote for the specified poll choice and returns updated vote tallies and percentages.',
    requiresAuth: false,
    sampleBody: JSON.stringify({ choiceId: 'bullish' }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      data: {
        id: 'poll-2026-09-w4',
        question: '이번 주 머니버스 가상 증시 전망은 어디로 향할까요?',
        options: [
          { id: 'bullish', label: '상승세 지속 (Bullish)', votes: 343, percentage: 46 },
          { id: 'sideways', label: '박스권 횡보 (Neutral)', votes: 215, percentage: 29 },
          { id: 'bearish', label: '조정 및 하락 (Bearish)', votes: 128, percentage: 17 },
          { id: 'cash', label: '현금/안전자산 예치', votes: 59, percentage: 8 },
        ],
        totalVotes: 745,
      },
    }, null, 2),
  },
  {
    id: 'newspaper-lore',
    method: 'GET',
    path: '/app-api/v1/newspaper/lore',
    category: 'newspaper',
    titleKo: '주간 금융 개념 배움터 아티클 목록 조회',
    titleEn: 'Get Weekly Financial Lore Articles',
    descriptionKo: '복리, 유동성 스프레드, 통화 유통 속도 등 3대 금융 지식 교육 아티클을 조회합니다.',
    descriptionEn: 'Retrieves weekly financial engineering educational lore articles (compound interest, liquidity spreads, velocity of money).',
    requiresAuth: false,
    sampleResponse: JSON.stringify({
      success: true,
      data: [
        {
          id: 'compound-interest',
          category: 'INVESTING',
          title: '복리의 마법과 주당 배당금(DPS) 재투자 전략',
          summary: '기업 수익 분배금인 배당금을 지속적으로 재투자하여 주식 수량을 늘릴 때 발생하는 자산 증식 원리',
          readTimeMinutes: 3,
        },
      ],
    }, null, 2),
  },

  // 2. Stocks & Exchange
  {
    id: 'stocks-list',
    method: 'GET',
    path: '/app-api/v1/stocks',
    category: 'stocks',
    titleKo: '상장 주식 종목 목록 및 실시간 시세 조회',
    titleEn: 'Get Listed Stocks & Market Quotes',
    descriptionKo: '머니버스 증권거래소에 상장된 전 종목의 현재가, 등락률, 거래량, 시가총액을 조회합니다.',
    descriptionEn: 'Fetches all listed equity tickers with real-time quotes, price change rates, volumes, and market cap.',
    requiresAuth: false,
    sampleResponse: JSON.stringify({
      stocks: [
        { ticker: 'WLD', name: '월덕 코퍼레이션', price: 124500, changeRate: 3.42, volume: 1542000 },
        { ticker: 'NEO', name: '네오 핀테크', price: 87300, changeRate: -1.24, volume: 820000 },
      ],
    }, null, 2),
  },
  {
    id: 'stocks-detail',
    method: 'GET',
    path: '/app-api/v1/stocks/WLD',
    category: 'stocks',
    titleKo: '종목 상세 호가 및 차트 캔들 조회',
    titleEn: 'Get Stock Orderbook & Historical Candles',
    descriptionKo: '특정 종목의 10단계 매수/매도 호가 잔량 및 1분/1시간/일봉 캔들스틱 데이터를 조회합니다.',
    descriptionEn: 'Fetches 10-level bid/ask orderbook depth and candlestick historical OHLCV chart data.',
    requiresAuth: false,
    sampleResponse: JSON.stringify({
      ticker: 'WLD',
      currentPrice: 124500,
      orderbook: {
        bids: [{ price: 124000, volume: 500 }],
        asks: [{ price: 125000, volume: 320 }],
      },
    }, null, 2),
  },

  // 3. Banking & Treasury
  {
    id: 'bank-products',
    method: 'GET',
    path: '/app-api/v1/bank/products',
    category: 'bank',
    titleKo: '가상 은행 예적금 및 대출 금융 상품 조회',
    titleEn: 'Get Banking Deposit & Credit Products',
    descriptionKo: '중앙은행 기준금리 기반의 정기예금, 자유적금, 마이너스 통장 한도 상품 목록을 조회합니다.',
    descriptionEn: 'Fetches active savings, term deposits, and credit line products aligned with central bank base rates.',
    requiresAuth: false,
    sampleResponse: JSON.stringify({
      products: [
        { id: 'dep-safe-30d', name: '월덕 30일 복리 정기예금', interestRate: 4.8, minDeposit: 10000 },
      ],
    }, null, 2),
  },

  // 4. Casino & Mini-games
  {
    id: 'casino-stats',
    method: 'GET',
    path: '/app-api/v1/casino/stats',
    category: 'casino',
    titleKo: '카지노 럭키존 규제 현황 및 일일 한도 조회',
    titleEn: 'Get Casino Responsible Gaming Limits & Stats',
    descriptionKo: '유저의 일일 베팅 잔여 한도, 슬롯머신 환급률(RTP 96.5%) 및 자가 배제 설정 상태를 조회합니다.',
    descriptionEn: 'Fetches responsible gaming self-limits, daily turnover ceiling, and slot machine RTP metrics.',
    requiresAuth: true,
    sampleResponse: JSON.stringify({
      dailyBetLimit: 500000,
      dailyUsed: 120000,
      remainingLimit: 380000,
      rtpPercent: 96.5,
    }, null, 2),
  },

  // 5. Work & Career
  {
    id: 'work-daily',
    method: 'POST',
    path: '/app-api/v1/work/execute',
    category: 'work',
    titleKo: '일일 직업 업무 수행 및 WLD 급여 정산',
    titleEn: 'Execute Daily Job Shift & Claim Salary',
    descriptionKo: '배정된 직업의 일일 교대 근무를 수행하고 기본급과 숙련도 보너스 WLD를 덕지갑으로 정산받습니다.',
    descriptionEn: 'Executes the assigned daily shift duty and deposits base wage and skill mastery bonus into wallet.',
    requiresAuth: true,
    sampleBody: JSON.stringify({ shiftType: 'STANDARD' }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      earnedWld: 15000,
      bonusExp: 45,
      newBalance: 1250000,
    }, null, 2),
  },

  // 6. Realtime Streams & WebSockets
  {
    id: 'stream-ticks',
    method: 'GET',
    path: '/app-api/v1/streams/market-ticks',
    category: 'streams',
    titleKo: 'SSE 실시간 주가 틱 스트리밍 엔드포인트',
    titleEn: 'SSE Real-time Market Ticker Stream',
    descriptionKo: 'Server-Sent Events(SSE) 프로토콜을 통해 1초 단위로 체결된 주가 틱 데이터를 실시간 스트리밍합니다.',
    descriptionEn: 'Streams real-time 1-second interval execution ticks over Server-Sent Events (SSE) protocol.',
    requiresAuth: false,
    sampleResponse: 'event: tick\ndata: {"ticker":"WLD","price":124500,"volume":12,"timestamp":1758511800000}\n\n',
  },
];

export function DeveloperPortalView({ contract }: { contract: ReturnType<typeof import('@/lib/app-gateway').appApiContract> }) {
  const { locale } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS_DATA[0]!);
  const [requestBody, setRequestBody] = useState<string>(selectedEndpoint.sampleBody || '');
  const [activeTab, setActiveTab] = useState<'curl' | 'ts' | 'py' | 'try'>('curl');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const isKo = locale === 'ko';

  const filteredEndpoints = selectedCategory === 'all'
    ? ENDPOINTS_DATA
    : ENDPOINTS_DATA.filter((e) => e.category === selectedCategory);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.sampleBody || '');
    setApiResponse(null);
    setApiStatus(null);
    setApiLatency(null);
  };

  const handleRunTryItOut = async () => {
    const startTime = performance.now();
    startTransition(async () => {
      try {
        const url = `${window.location.origin}${selectedEndpoint.path}`;
        const options: RequestInit = {
          method: selectedEndpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        };

        if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
          options.body = requestBody;
        }

        const res = await fetch(url, options);
        const endTime = performance.now();
        setApiLatency(Math.round(endTime - startTime));
        setApiStatus(res.status);

        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setApiResponse(JSON.stringify(json, null, 2));
        } catch {
          setApiResponse(text);
        }
      } catch (err: unknown) {
        const endTime = performance.now();
        setApiLatency(Math.round(endTime - startTime));
        setApiStatus(0);
        setApiResponse(JSON.stringify({ error: 'Network or CORS Error', detail: String(err) }, null, 2));
      }
    });
  };

  const generateCurl = (ep: EndpointDef) => {
    let code = `curl -X ${ep.method} "https://easy-scraping.com${ep.path}" \\\n  -H "Accept: application/json"`;
    if (ep.requiresAuth) {
      code += ` \\\n  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`;
    }
    if (ep.sampleBody) {
      code += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${ep.sampleBody.replace(/\n/g, '')}'`;
    }
    return code;
  };

  const generateTypeScript = (ep: EndpointDef) => {
    const hasBody = ep.method !== 'GET' && ep.sampleBody;
    return `import axios from 'axios';

async function fetchApi() {
  const response = await axios({
    method: '${ep.method.toLowerCase()}',
    url: 'https://easy-scraping.com${ep.path}',
    headers: {
      'Accept': 'application/json',${ep.requiresAuth ? "\n      'Authorization': 'Bearer <YOUR_ACCESS_TOKEN>'," : ''}
    },${hasBody ? `\n    data: ${ep.sampleBody},` : ''}
  });

  console.log(response.data);
  return response.data;
}`;
  };

  const generatePython = (ep: EndpointDef) => {
    const hasBody = ep.method !== 'GET' && ep.sampleBody;
    return `import requests

url = "https://easy-scraping.com${ep.path}"
headers = {
    "Accept": "application/json",${ep.requiresAuth ? '\n    "Authorization": "Bearer <YOUR_ACCESS_TOKEN>",' : ''}
}
${hasBody ? `payload = ${ep.sampleBody}\nresponse = requests.${ep.method.toLowerCase()}(url, json=payload, headers=headers)` : `response = requests.${ep.method.toLowerCase()}(url, headers=headers)`}

print(response.status_code)
print(response.json())`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased pb-24">
      {/* Header Banner */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                REST API v{contract.apiVersion}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Contract {contract.contractVersion}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                OpenAPI 3.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isKo ? '월덕 머니버스 개발자 포털 & API 센터' : 'Woldeok Moneyverse Developer Portal & API Center'}
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              {isKo
                ? '가상 주식, 신문 허브, 은행, 카지노 및 실시간 틱 스트림을 포함한 머니버스 전 도메인 RESTful API 규격과 라이브 샌드박스를 제공합니다.'
                : 'Explore full-domain RESTful APIs, WebSocket/SSE real-time streams, OpenAPI contracts, and live sandbox tester.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app-api/v1/meta/contract"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <span>📄 {isKo ? 'OpenAPI 스펙 다운로드' : 'Download OpenAPI Spec'}</span>
            </Link>
            <Link
              href="/newspaper"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition"
            >
              <span>📰 {isKo ? '경제 브리프 가기' : 'View World Brief'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Category & Endpoints List */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800">
            {[
              { id: 'all', label: isKo ? '전체' : 'All' },
              { id: 'newspaper', label: isKo ? '신문/펄스' : 'Newspaper' },
              { id: 'stocks', label: isKo ? '주식/거래소' : 'Stocks' },
              { id: 'bank', label: isKo ? '가상은행' : 'Banking' },
              { id: 'casino', label: isKo ? '카지노' : 'Casino' },
              { id: 'work', label: isKo ? '직업/작업' : 'Work' },
              { id: 'streams', label: isKo ? '실시간스트림' : 'Streams' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Endpoints List */}
          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredEndpoints.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              const methodColor =
                ep.method === 'GET'
                  ? 'text-sky-400 bg-sky-950/60 border-sky-800/60'
                  : ep.method === 'POST'
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                  : 'text-amber-400 bg-amber-950/60 border-amber-800/60';

              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-neutral-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${methodColor}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono text-neutral-300 truncate">{ep.path}</span>
                  </div>
                  <div className="text-xs font-medium text-neutral-200 truncate">
                    {isKo ? ep.titleKo : ep.titleEn}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Content Area: Documentation, Snippets & Try It Out */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Endpoint Details Card */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border ${
                    selectedEndpoint.method === 'GET'
                      ? 'text-sky-400 bg-sky-950/80 border-sky-700/60'
                      : 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-sm font-mono font-semibold text-white">{selectedEndpoint.path}</span>
              </div>
              {selectedEndpoint.requiresAuth ? (
                <span className="px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/50 border border-amber-800/60 rounded-full flex items-center gap-1">
                  🔒 {isKo ? '인증 필요 (Bearer / Cookie)' : 'Auth Required'}
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 rounded-full flex items-center gap-1">
                  🌐 {isKo ? '공개 엔드포인트' : 'Public Endpoint'}
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-white mb-2">
              {isKo ? selectedEndpoint.titleKo : selectedEndpoint.titleEn}
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {isKo ? selectedEndpoint.descriptionKo : selectedEndpoint.descriptionEn}
            </p>
          </div>

          {/* Interactive Playground & Code Snippets Tabs */}
          <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 pt-3 bg-neutral-900/80">
              <div className="flex gap-2">
                {[
                  { id: 'curl', label: 'cURL' },
                  { id: 'ts', label: 'TypeScript (Axios)' },
                  { id: 'py', label: 'Python (Requests)' },
                  { id: 'try', label: isKo ? '⚡ 실시간 샌드박스 테스터' : '⚡ Live Try It Out' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-400 font-semibold'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'curl' && (
                <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto whitespace-pre-wrap">
                  {generateCurl(selectedEndpoint)}
                </pre>
              )}

              {activeTab === 'ts' && (
                <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto whitespace-pre-wrap">
                  {generateTypeScript(selectedEndpoint)}
                </pre>
              )}

              {activeTab === 'py' && (
                <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto whitespace-pre-wrap">
                  {generatePython(selectedEndpoint)}
                </pre>
              )}

              {activeTab === 'try' && (
                <div className="flex flex-col gap-4">
                  {selectedEndpoint.method !== 'GET' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                        {isKo ? '요청 페이로드 (JSON Body)' : 'Request Body (JSON)'}
                      </label>
                      <textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        rows={4}
                        className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                        placeholder="{}"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRunTryItOut}
                      disabled={isPending}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition"
                    >
                      {isPending ? (
                        <span>호출 중...</span>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>{isKo ? '실시간 API 호출 (Send Request)' : 'Execute Request'}</span>
                        </>
                      )}
                    </button>
                    {apiLatency !== null && (
                      <span className="text-xs font-mono text-neutral-400">
                        ⏱️ {apiLatency}ms
                      </span>
                    )}
                    {apiStatus !== null && (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                          apiStatus >= 200 && apiStatus < 300
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        Status: {apiStatus}
                      </span>
                    )}
                  </div>

                  {apiResponse && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                        {isKo ? '응답 결과 (Response Payload)' : 'Response Payload'}
                      </label>
                      <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-80 whitespace-pre-wrap">
                        {apiResponse}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sample Schema Output Card */}
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              {isKo ? '표준 응답 스키마 예시 (Standard Response Schema)' : 'Sample Response Schema'}
            </h3>
            <pre className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto whitespace-pre-wrap max-h-64">
              {selectedEndpoint.sampleResponse}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
